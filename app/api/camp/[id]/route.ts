import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  activityDate: z.string().min(1).optional(),
  activityName: z.string().min(1).optional(),
  location: z.string().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/camp/[id]
 * 查询单条集训记录详情
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const camp = await prisma.camp.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  if (!camp) {
    return Response.json({ error: "集训记录不存在" }, { status: 404 });
  }

  return Response.json(camp);
}

/**
 * PUT /api/camp/[id]
 * 更新集训记录
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const camp = await prisma.camp.update({
      where: { id },
      data: {
        ...(data.activityDate && {
          activityDate: new Date(data.activityDate),
        }),
        ...(data.activityName && { activityName: data.activityName }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return Response.json(camp);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "请求参数错误", details: err.issues },
        { status: 400 },
      );
    }
    console.error("更新集训记录失败:", err);
    return Response.json({ error: "更新集训记录失败" }, { status: 500 });
  }
}

/**
 * DELETE /api/camp/[id]
 * 删除集训记录
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.camp.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    console.error("删除集训记录失败:", err);
    return Response.json({ error: "删除集训记录失败" }, { status: 500 });
  }
}
