import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  gender: z.enum(["male", "female"]).optional(),
  birthDate: z.string().optional(),
  idCard: z.string().optional(),
  phone: z.string().optional(),
  enrollmentDate: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  classIds: z.array(z.string()).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      classes: { select: { id: true, name: true } },
      gradings: { orderBy: { examDate: "desc" } },
      competitions: { orderBy: { competitionDate: "desc" } },
      camps: { orderBy: { activityDate: "desc" } },
      attendances: {
        orderBy: { attendanceDate: "desc" },
        take: 10,
        include: { course: { select: { title: true } } },
      },
    },
  });

  if (!student) {
    return Response.json({ error: "学员不存在" }, { status: 404 });
  }

  return Response.json(student);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { classIds, ...data } = updateSchema.parse(body);

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        enrollmentDate: data.enrollmentDate
          ? new Date(data.enrollmentDate)
          : undefined,
        classes:
          classIds !== undefined
            ? { set: classIds.map((cid) => ({ id: cid })) }
            : undefined,
      },
      include: {
        classes: { select: { id: true, name: true } },
      },
    });

    return Response.json(student);
  } catch (error) {
    console.error("更新学员失败:", error);
    if (error instanceof z.ZodError) {
      return Response.json({ error: "请求参数错误", details: error.issues }, { status: 400 });
    }
    return Response.json({ error: "更新学员失败" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.student.update({
    where: { id },
    data: { status: "inactive" },
  });

  return Response.json({ success: true });
}
