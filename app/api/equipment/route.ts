import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, EquipmentCategory, Status } from "@prisma/client";
import { z } from "zod";

// 创建装备的验证模式
const createSchema = z.object({
  name: z.string().min(1),
  category: z
    .enum([
      "uniform",
      "gear",
      "belt",
      "pad",
      "accessory",
      "t_shirt",
      "tracksuit",
      "sneakers",
      "backpack",
      "other",
    ])
    .default("gear"),
  specification: z.string().optional(),
  currentStock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(0),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  remark: z.string().optional(),
});

// 获取装备列表（支持名称搜索、类型筛选和状态筛选）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Prisma.EquipmentWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (category) {
      where.category = category as EquipmentCategory;
    }
    if (status) {
      where.status = status as Status;
    }

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.equipment.count({ where }),
    ]);

    return Response.json({ equipment, total, page, pageSize });
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return Response.json({ error: message }, { status: 500 });
  }
}

// 创建新装备
export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "请求体必须是 JSON" }, { status: 400 });
  }

  const parseResult = createSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      { error: "请求参数无效", details: parseResult.error.format() },
      { status: 400 }
    );
  }
  const data = parseResult.data;

  try {
    const item = await prisma.equipment.create({
      data: {
        name: data.name,
        category: data.category as EquipmentCategory,
        specification: data.specification,
        currentStock: data.currentStock,
        minStock: data.minStock,
        status: data.status,
        remark: data.remark,
      },
    });

    return Response.json(item);
  } catch (err) {
    const message = err instanceof Error ? err.message : "创建失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
