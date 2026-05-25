import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  notes: z.string().optional(),
});

/**
 * GET /api/recharges/[id]
 * 查询单条充值记录详情
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const recharge = await prisma.recharge.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  if (!recharge) {
    return Response.json({ error: "充值记录不存在" }, { status: 404 });
  }

  return Response.json(recharge);
}

/**
 * PUT /api/recharges/[id]
 * 仅允许修改备注
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const recharge = await prisma.recharge.update({
      where: { id },
      data: {
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return Response.json(recharge);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "请求参数错误", details: err.issues },
        { status: 400 },
      );
    }
    console.error("更新充值记录失败:", err);
    return Response.json({ error: "更新充值记录失败" }, { status: 500 });
  }
}

/**
 * DELETE /api/recharges/[id]
 * 删除充值记录并回滚学员课时
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. 查询充值记录
      const recharge = await tx.recharge.findUnique({
        where: { id },
      });
      if (!recharge) {
        throw new Error("充值记录不存在");
      }

      // 2. 查询学员
      const student = await tx.student.findUnique({
        where: { id: recharge.studentId },
      });
      if (!student) {
        throw new Error("学员不存在");
      }

      // 3. 回滚课时
      let newRemaining = student.remainingSessions;
      if (recharge.action === "increment") {
        newRemaining = Math.max(0, student.remainingSessions - recharge.sessions);
      } else {
        newRemaining = student.remainingSessions + recharge.sessions;
      }

      await tx.student.update({
        where: { id: recharge.studentId },
        data: { remainingSessions: newRemaining },
      });

      // 4. 删除充值记录
      await tx.recharge.delete({ where: { id } });
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("删除充值记录失败:", err);
    return Response.json({ error: "删除充值记录失败" }, { status: 500 });
  }
}
