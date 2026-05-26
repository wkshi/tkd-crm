import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  studentId: z.string().min(1),
  action: z.enum(["increment", "decrement"]),
  sessions: z.number().int().min(0),
  durationDays: z.number().int().min(0),
  notes: z.string().optional(),
});

/**
 * GET /api/recharges?studentId=xxx
 * 查询充值记录，支持按学员过滤
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;

  const where: Prisma.RechargeWhereInput = {};
  if (studentId) where.studentId = studentId;

  const recharges = await prisma.recharge.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  return Response.json({ recharges });
}

/**
 * POST /api/recharges
 * 创建充值记录（事务内同步更新学员课时和过期日期）
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建充值记录
      const recharge = await tx.recharge.create({
        data: {
          studentId: data.studentId,
          action: data.action,
          sessions: data.sessions,
          durationDays: data.durationDays,
          notes: data.notes,
        },
      });

      // 2. 查询学员当前状态
      const student = await tx.student.findUnique({
        where: { id: data.studentId },
      });
      if (!student) {
        throw new Error("学员不存在");
      }

      // 3. 更新学员课时和过期日期
      const updateData: Prisma.StudentUpdateInput = {};

      if (data.action === "increment") {
        updateData.remainingSessions = {
          increment: data.sessions,
        };

        // 更新过期日期
        if (data.durationDays > 0) {
          const baseDate =
            student.expiryDate && new Date(student.expiryDate) > new Date()
              ? new Date(student.expiryDate)
              : new Date();
          const newExpiryDate = new Date(baseDate);
          newExpiryDate.setDate(newExpiryDate.getDate() + data.durationDays);
          updateData.expiryDate = newExpiryDate;
        }
      } else {
        // decrement：只扣减剩余课时，保底 0
        const newRemaining = Math.max(
          0,
          student.remainingSessions - data.sessions,
        );
        updateData.remainingSessions = newRemaining;
      }

      await tx.student.update({
        where: { id: data.studentId },
        data: updateData,
      });

      return recharge;
    });

    return Response.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "请求参数错误", details: err.issues },
        { status: 400 },
      );
    }
    console.error("创建充值记录失败:", err);
    return Response.json({ error: "创建充值记录失败" }, { status: 500 });
  }
}
