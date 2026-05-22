import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";
import { existsSync } from "fs";
import { prisma } from "@/lib/prisma";

const UPLOAD_CONFIG = {
  student: { dir: "students", table: "student" as const },
  coach: { dir: "coaches", table: "coach" as const },
};

type UploadType = keyof typeof UPLOAD_CONFIG;

function getUploadDir(type: UploadType) {
  return join(process.cwd(), "public", "uploads", UPLOAD_CONFIG[type].dir);
}

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const id = formData.get("id") as string;
    const type = (formData.get("type") as UploadType) || "student";

    if (!file || !id) {
      return Response.json({ error: "缺少文件或ID" }, { status: 400 });
    }

    if (!UPLOAD_CONFIG[type]) {
      return Response.json({ error: "无效的上传类型" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "仅支持图片文件" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "文件大小不能超过 5MB" }, { status: 400 });
    }

    const config = UPLOAD_CONFIG[type];
    const uploadDir = getUploadDir(type);
    await ensureDir(uploadDir);

    const ext = "jpg";
    const filename = `${id}.${ext}`;
    const filepath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const photoUrl = `/uploads/${config.dir}/${filename}`;

    if (type === "student") {
      await prisma.student.update({ where: { id }, data: { photoUrl } });
    } else {
      await prisma.coach.update({ where: { id }, data: { photoUrl } });
    }

    return Response.json({ success: true, photoUrl });
  } catch (err) {
    console.error("上传失败:", err);
    return Response.json({ error: "上传失败" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = (searchParams.get("type") as UploadType) || "student";

    if (!id) {
      return Response.json({ error: "缺少ID" }, { status: 400 });
    }

    const config = UPLOAD_CONFIG[type];
    const filename = `${id}.jpg`;
    const filepath = join(getUploadDir(type), filename);

    try {
      await unlink(filepath);
    } catch {
      /* 忽略 */
    }

    if (type === "student") {
      await prisma.student.update({ where: { id }, data: { photoUrl: null } });
    } else {
      await prisma.coach.update({ where: { id }, data: { photoUrl: null } });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "删除失败" }, { status: 500 });
  }
}
