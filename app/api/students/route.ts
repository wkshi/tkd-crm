import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().optional(),
  idCard: z.string().optional(),
  phone: z.string().optional(),
  enrollmentDate: z.string().optional(),
  remainingSessions: z.number().default(0),
  expiryDate: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  classIds: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Prisma.StudentWhereInput = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (status) {
    where.status = status as Status;
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        classes: { select: { id: true, name: true } },
        _count: { select: { classes: true } },
      },
    }),
    prisma.student.count({ where }),
  ]);

  return Response.json({ students, total, page, pageSize });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { classIds, ...data } = createSchema.parse(body);

  const student = await prisma.student.create({
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      enrollmentDate: data.enrollmentDate
        ? new Date(data.enrollmentDate)
        : new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      classes: classIds?.length
        ? { connect: classIds.map((id) => ({ id })) }
        : undefined,
    },
    include: {
      classes: { select: { id: true, name: true } },
    },
  });

  return Response.json(student);
}
