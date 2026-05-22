import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  studentId: z.string().min(1),
  competitionDate: z.string().min(1),
  competitionName: z.string().min(1),
  category: z.string().optional(),
  result: z.string().optional(),
  award: z.string().optional(),
});

/**
 * GET /api/competition?studentId=xxx
 * 查询比赛记录，支持按学员过滤
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;

  const where: any = {};
  if (studentId) where.studentId = studentId;

  const competitions = await prisma.competition.findMany({
    where,
    orderBy: { competitionDate: "desc" },
    include: {
      student: { select: { id: true, name: true } },
    },
  });

  return Response.json({ competitions });
}

/**
 * POST /api/competition
 * 创建比赛记录
 */
export async function POST(req: Request) {
  const body = await req.json();
  const data = createSchema.parse(body);

  const competition = await prisma.competition.create({
    data: {
      studentId: data.studentId,
      competitionDate: new Date(data.competitionDate),
      competitionName: data.competitionName,
      category: data.category,
      result: data.result,
      award: data.award,
    },
  });

  return Response.json(competition);
}
