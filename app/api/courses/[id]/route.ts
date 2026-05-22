import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 更新课程的验证模式
const updateSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(["regular", "exam_prep", "camp", "competition"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  coachId: z.string().optional(),
  location: z.string().optional(),
  maxStudents: z.number().optional(),
  description: z.string().optional(),
});

// 获取单个课程详情
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      coach: { select: { id: true, name: true } },
      attendances: {
        include: {
          student: { select: { id: true, name: true, photoUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) {
    return Response.json({ error: "课程不存在" }, { status: 404 });
  }

  return Response.json(course);
}

// 更新课程信息
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data = updateSchema.parse(body);

  const course = await prisma.course.update({
    where: { id },
    data: {
      ...data,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      coachId: data.coachId === undefined ? undefined : data.coachId || null,
    },
  });

  return Response.json(course);
}

// 删除课程
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.course.delete({ where: { id } });

  return Response.json({ success: true });
}
