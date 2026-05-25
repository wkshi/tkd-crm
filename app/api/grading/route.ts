import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  studentId: z.string().min(1),
  examDate: z.string().min(1),
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
  ]),
  notes: z.string().optional(),
});

/**
 * GET /api/grading?studentId=xxx
 * 查询考级记录，支持按学员过滤
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;

  const where: Prisma.GradingWhereInput = {};
  if (studentId) where.studentId = studentId;

  const gradings = await prisma.grading.findMany({
    where,
    orderBy: { examDate: "desc" },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  return Response.json({ gradings });
}

/**
 * POST /api/grading
 * 创建考级记录
 */
export async function POST(req: Request) {
  const body = await req.json();
  const data = createSchema.parse(body);

  const grading = await prisma.grading.create({
    data: {
      studentId: data.studentId,
      examDate: new Date(data.examDate),
      beltLevel: data.beltLevel,
      notes: data.notes,
    },
  });

  return Response.json(grading);
}
