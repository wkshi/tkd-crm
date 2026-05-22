import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  gender: z.enum(["male", "female"]).optional(),
  birthDate: z.string().optional(),
  idCard: z.string().optional(),
  phone: z.string().optional(),
  enrollmentDate: z.string().optional(),
  remainingSessions: z.number().optional(),
  expiryDate: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
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
  const { id } = await params;
  const body = await req.json();
  const data = updateSchema.parse(body);

  const student = await prisma.student.update({
    where: { id },
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      enrollmentDate: data.enrollmentDate
        ? new Date(data.enrollmentDate)
        : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    },
  });

  return Response.json(student);
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
