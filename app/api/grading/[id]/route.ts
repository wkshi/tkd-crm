import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  examDate: z.string().min(1).optional(),
  beltLevel: z.enum([
    "white",
    "white_yellow",
    "yellow",
    "yellow_green",
    "green",
    "green_blue",
    "blue",
    "blue_red",
    "red",
    "red_black",
    "black",
  ]).optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/grading/[id]
 * 查询单条考级记录详情
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const grading = await prisma.grading.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  if (!grading) {
    return Response.json({ error: "考级记录不存在" }, { status: 404 });
  }

  return Response.json(grading);
}

/**
 * PUT /api/grading/[id]
 * 更新考级记录
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const grading = await prisma.grading.update({
      where: { id },
      data: {
        ...(data.examDate && { examDate: new Date(data.examDate) }),
        ...(data.beltLevel && { beltLevel: data.beltLevel }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return Response.json(grading);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "请求参数错误", details: err.issues },
        { status: 400 },
      );
    }
    console.error("更新考级记录失败:", err);
    return Response.json({ error: "更新考级记录失败" }, { status: 500 });
  }
}

/**
 * DELETE /api/grading/[id]
 * 删除考级记录
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.grading.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "删除考级记录失败" }, { status: 500 });
  }
}
