import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  competitionDate: z.string().min(1).optional(),
  competitionName: z.string().min(1).optional(),
  category: z.string().optional(),
  result: z.string().optional(),
  award: z.string().optional(),
});

/**
 * GET /api/competition/[id]
 * 查询单条比赛记录详情
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  if (!competition) {
    return Response.json({ error: "比赛记录不存在" }, { status: 404 });
  }

  return Response.json(competition);
}

/**
 * PUT /api/competition/[id]
 * 更新比赛记录
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const competition = await prisma.competition.update({
      where: { id },
      data: {
        ...(data.competitionDate && {
          competitionDate: new Date(data.competitionDate),
        }),
        ...(data.competitionName && { competitionName: data.competitionName }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.result !== undefined && { result: data.result }),
        ...(data.award !== undefined && { award: data.award }),
      },
    });

    return Response.json(competition);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "请求参数错误", details: err.issues },
        { status: 400 },
      );
    }
    console.error("更新比赛记录失败:", err);
    return Response.json({ error: "更新比赛记录失败" }, { status: 500 });
  }
}

/**
 * DELETE /api/competition/[id]
 * 删除比赛记录
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.competition.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "删除比赛记录失败" }, { status: 500 });
  }
}
