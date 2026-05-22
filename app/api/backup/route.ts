import { NextRequest } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { createWriteStream, mkdirSync, existsSync } from "fs";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
// @ts-expect-error — archiver 无类型声明
import { ZipArchive } from "archiver";
// @ts-expect-error — decompress 为 CommonJS 模块
import decompress from "decompress";

const execAsync = promisify(exec);

// 上传目录根路径
const UPLOAD_ROOT = join(process.cwd(), "public", "uploads");

/**
 * 从 DATABASE_URL 解析连接信息，用于 pg_dump / psql 命令行参数
 */
function parseDatabaseUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port || "5432",
    user: u.username,
    password: u.password,
    database: u.pathname.replace(/^\//, ""),
  };
}

/**
 * 构建 pg_dump / psql 的环境变量和参数前缀
 */
function buildPgEnvAndPrefix(db: ReturnType<typeof parseDatabaseUrl>) {
  const env = {
    ...process.env,
    PGPASSWORD: db.password,
  };
  const prefix = `PGPASSWORD="${db.password}" `;
  return { env, prefix };
}

// GET：导出备份（ZIP 文件流）
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return Response.json({ error: "缺少 DATABASE_URL" }, { status: 500 });
  }

  const db = parseDatabaseUrl(dbUrl);
  const { prefix } = buildPgEnvAndPrefix(db);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tmpDir = await mkdtemp(join(tmpdir(), "tkd-backup-"));

  try {
    // 1. 使用 pg_dump 导出数据库（优先本地，回退到 Docker 容器）
    const sqlPath = join(tmpDir, "backup.sql");
    let dumpCmd = `${prefix}pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -F p -f "${sqlPath}"`;
    
    // 检测本地 pg_dump 是否可用
    const { stdout: pgDumpCheck } = await execAsync("which pg_dump 2>/dev/null || echo 'NOT_FOUND'").catch(() => ({ stdout: "NOT_FOUND" }));
    if (pgDumpCheck.trim() === "NOT_FOUND") {
      // 回退：使用 Docker 容器内的 pg_dump
      dumpCmd = `docker exec taekwondo-db pg_dump -U ${db.user} -d ${db.database} -F p > "${sqlPath}"`;
    }
    
    await execAsync(dumpCmd);

    // 2. 生成备份清单
    const manifest = {
      version: "1.0",
      timestamp,
      database: db.database,
      files: ["backup.sql"],
      directories: ["uploads/students", "uploads/coaches"],
    };
    const manifestPath = join(tmpDir, "backup-manifest.json");
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    // 3. 复制上传的照片目录到临时目录
    const copyDirIfExists = (src: string, dest: string) => {
      if (existsSync(src)) {
        mkdirSync(dest, { recursive: true });
        return execAsync(`cp -R "${src}/"* "${dest}/" 2>/dev/null || true`);
      }
      return Promise.resolve();
    };

    const uploadsTmp = join(tmpDir, "uploads");
    await copyDirIfExists(join(UPLOAD_ROOT, "students"), join(uploadsTmp, "students"));
    await copyDirIfExists(join(UPLOAD_ROOT, "coaches"), join(uploadsTmp, "coaches"));

    // 4. 打包为 ZIP 并返回流
    const zipPath = join(tmpDir, `backup-${timestamp}.zip`);
    const output = createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    await new Promise<void>((resolve, reject) => {
      output.on("close", resolve);
      archive.on("error", reject);
      archive.on("warning", (err: Error & { code?: string }) => {
        if (err.code !== "ENOENT") reject(err);
      });
      archive.pipe(output);
      archive.file(sqlPath, { name: "backup.sql" });
      archive.file(manifestPath, { name: "backup-manifest.json" });
      if (existsSync(uploadsTmp)) {
        archive.directory(uploadsTmp, "uploads");
      }
      archive.finalize();
    });

    const zipBuffer = await readFile(zipPath);

    // 清理临时目录
    await rm(tmpDir, { recursive: true, force: true });

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="tkd-crm-backup-${timestamp}.zip"`,
      },
    });
  } catch (err) {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    console.error("备份失败:", err);
    const message = err instanceof Error ? err.message : "备份失败";
    return Response.json({ error: message }, { status: 500 });
  }
}

// POST：导入备份（上传 ZIP 文件）
export async function POST(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return Response.json({ error: "缺少 DATABASE_URL" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return Response.json({ error: "缺少文件" }, { status: 400 });
    }

    const db = parseDatabaseUrl(dbUrl);
    const { prefix } = buildPgEnvAndPrefix(db);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const tmpDir = await mkdtemp(join(tmpdir(), "tkd-restore-"));
    const zipPath = join(tmpDir, "backup.zip");

    // 1. 保存上传的 ZIP 文件
    const bytes = await file.arrayBuffer();
    await writeFile(zipPath, Buffer.from(bytes));

    // 2. 解压 ZIP
    const extractDir = join(tmpDir, "extracted");
    await decompress(zipPath, extractDir);

    // 3. 校验清单
    const manifestPath = join(extractDir, "backup-manifest.json");
    if (!existsSync(manifestPath)) {
      await rm(tmpDir, { recursive: true, force: true });
      return Response.json({ error: "无效的备份文件：缺少 backup-manifest.json" }, { status: 400 });
    }
    const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
    const sqlPath = join(extractDir, "backup.sql");
    if (!existsSync(sqlPath)) {
      await rm(tmpDir, { recursive: true, force: true });
      return Response.json({ error: "无效的备份文件：缺少 backup.sql" }, { status: 400 });
    }

    // 4. 先备份当前数据（快照）
    const snapshotDir = await mkdtemp(join(tmpdir(), "tkd-snapshot-"));
    const snapshotPath = join(snapshotDir, `snapshot-${timestamp}.sql`);
    let snapshotCmd = `${prefix}pg_dump -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -F p -f "${snapshotPath}"`;
    let restoreCmd = `${prefix}psql -h ${db.host} -p ${db.port} -U ${db.user} -d ${db.database} -f "${sqlPath}"`;
    
    // 检测本地 psql 是否可用
    const { stdout: psqlCheck } = await execAsync("which psql 2>/dev/null || echo 'NOT_FOUND'").catch(() => ({ stdout: "NOT_FOUND" }));
    if (psqlCheck.trim() === "NOT_FOUND") {
      snapshotCmd = `docker exec taekwondo-db pg_dump -U ${db.user} -d ${db.database} -F p > "${snapshotPath}"`;
      restoreCmd = `cat "${sqlPath}" | docker exec -i taekwondo-db psql -U ${db.user} -d ${db.database}`;
    }
    
    await execAsync(snapshotCmd);
    await execAsync(restoreCmd);

    // 6. 解压照片文件到上传目录
    const uploadStudentsSrc = join(extractDir, "uploads", "students");
    const uploadCoachesSrc = join(extractDir, "uploads", "coaches");
    const uploadStudentsDest = join(UPLOAD_ROOT, "students");
    const uploadCoachesDest = join(UPLOAD_ROOT, "coaches");

    if (existsSync(uploadStudentsSrc)) {
      mkdirSync(uploadStudentsDest, { recursive: true });
      await execAsync(`cp -R "${uploadStudentsSrc}/"* "${uploadStudentsDest}/" 2>/dev/null || true`);
    }
    if (existsSync(uploadCoachesSrc)) {
      mkdirSync(uploadCoachesDest, { recursive: true });
      await execAsync(`cp -R "${uploadCoachesSrc}/"* "${uploadCoachesDest}/" 2>/dev/null || true`);
    }

    // 清理临时目录
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    await rm(snapshotDir, { recursive: true, force: true }).catch(() => {});

    return Response.json({
      success: true,
      manifest,
      snapshot: snapshotPath,
      message: "数据恢复成功",
    });
  } catch (err) {
    console.error("恢复失败:", err);
    const message = err instanceof Error ? err.message : "恢复失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
