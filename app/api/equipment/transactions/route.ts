import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  Prisma,
  EquipmentTransactionType,
} from "@prisma/client";
import { z } from "zod";

// 创建流水的验证模式
const createSchema = z.object({
  equipmentId: z.string().min(1),
  type: z.enum(["in", "out", "adjust"]),
  quantity: z.number().int(),
  reason: z.string().optional(),
  operator: z.string().optional(),
  relatedStudentId: z.string().optional(),
  relatedCoachId: z.string().optional(),
});

// 查询流水列表（支持按装备、类型筛选和分页）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get("equipmentId") || undefined;
    const type = searchParams.get("type") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Prisma.EquipmentTransactionWhereInput = {};
    if (equipmentId) {
      where.equipmentId = equipmentId;
    }
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "查询失败";
    return Response.json({ error: message }, { status: 500 });
  }
}

// 创建流水并原子更新库存
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
  const type = data.type as EquipmentTransactionType;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 锁定装备记录
      const equipment = await tx.equipment.findUnique({
        where: { id: data.equipmentId },
      });
      if (!equipment) {
        throw new Error("装备不存在");
      }

      let stockDelta = 0;
      if (type === "in") {
        if (data.quantity <= 0) {
          throw new Error("入库数量必须大于 0");
        }
        stockDelta = data.quantity;
      } else if (type === "out") {
        if (data.quantity <= 0) {
          throw new Error("出库数量必须大于 0");
        }
        if (equipment.currentStock < data.quantity) {
          throw new Error("库存不足，无法出库");
        }
        stockDelta = -data.quantity;
      } else if (type === "adjust") {
        const newStock = equipment.currentStock + data.quantity;
        if (newStock < 0) {
          throw new Error("盘点调整后库存不能为负");
        }
        stockDelta = data.quantity;
      }

      const transaction = await tx.equipmentTransaction.create({
        data: {
          equipmentId: data.equipmentId,
          type,
          quantity: data.quantity,
          reason: data.reason,
          operator: data.operator,
          relatedStudentId: data.relatedStudentId,
          relatedCoachId: data.relatedCoachId,
        },
      });

      await tx.equipment.update({
        where: { id: data.equipmentId },
        data: { currentStock: { increment: stockDelta } },
      });

      return transaction;
    });

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "操作失败";
    return Response.json({ error: message }, { status: 400 });
  }
}
