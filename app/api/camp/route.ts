import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  studentId: z.string().min(1),
  activityDate: z.string().min(1),
  activityName: z.string().min(1),
  location: z.string().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/camp?studentId=xxx
 * 查询集训记录，支持按学员过滤
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;

  const where: Prisma.CampWhereInput = {};
  if (studentId) where.studentId = studentId;

  const camps = await prisma.camp.findMany({
    where,
    orderBy: { activityDate: "desc" },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  return Response.json({ camps });
}

/**
 * POST /api/camp
 * 创建集训记录
 */
export async function POST(req: Request) {
  const body = await req.json();
  const data = createSchema.parse(body);

  const camp = await prisma.camp.create({
    data: {
      studentId: data.studentId,
      activityDate: new Date(data.activityDate),
      activityName: data.activityName,
      location: data.location,
      duration: data.duration,
      notes: data.notes,
    },
  });

  return Response.json(camp);
}
