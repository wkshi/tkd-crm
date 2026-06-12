import { prisma } from "@/lib/prisma";
import { EquipmentCategory, Status } from "@prisma/client";
import { z } from "zod";

// 更新装备的验证模式（库存只能通过出入库流水变更）
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z
    .enum(["uniform", "gear", "belt", "pad", "accessory", "other"])
    .optional(),
  specification: z.string().optional(),
  minStock: z.number().int().min(0).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  remark: z.string().optional(),
});

// 获取单个装备详情
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!item) {
    return Response.json({ error: "装备不存在" }, { status: 404 });
  }

  return Response.json(item);
}

// 更新装备信息
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data = updateSchema.parse(body);

  const item = await prisma.equipment.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category as EquipmentCategory | undefined,
      specification: data.specification,
      minStock: data.minStock,
      status: data.status as Status | undefined,
      remark: data.remark,
    },
  });

  return Response.json(item);
}

// 删除装备（软删除）
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.equipment.update({
    where: { id },
    data: { status: "inactive" },
  });

  return Response.json({ success: true });
}
