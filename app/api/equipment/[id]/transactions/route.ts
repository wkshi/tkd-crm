import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { EquipmentTransactionType } from "@prisma/client";

// 查询指定装备的出入库流水
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: {
    equipmentId: string;
    type?: EquipmentTransactionType;
  } = { equipmentId: id };
  if (type) {
    where.type = type as EquipmentTransactionType;
  }

  const [transactions, total] = await Promise.all([
    prisma.equipmentTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        relatedStudent: { select: { id: true, name: true } },
        relatedCoach: { select: { id: true, name: true } },
      },
    }),
    prisma.equipmentTransaction.count({ where }),
  ]);

  return Response.json({ transactions, total, page, pageSize });
}
