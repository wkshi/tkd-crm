import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, CourseType } from "@prisma/client";
import { z } from "zod";

// 创建课程的验证模式
const createSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["regular", "exam_prep", "camp", "competition"]).default("regular"),
  startTime: z.string(),
  endTime: z.string(),
  coachId: z.string().optional(),
  location: z.string().optional(),
  maxStudents: z.number().default(30),
  description: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
});

// 获取课程列表（支持类型筛选、教练筛选和时间范围）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const coachId = searchParams.get("coachId") || undefined;
  const start = searchParams.get("start") || undefined;
  const end = searchParams.get("end") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");

  const where: Prisma.CourseWhereInput = {};
  if (type) {
    where.type = type as CourseType;
  }
  if (coachId) {
    where.coachId = coachId;
  }
  if (start && end) {
    where.startTime = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { startTime: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        coach: { select: { id: true, name: true } },
        students: { select: { id: true, name: true } },
        _count: { select: { students: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return Response.json({ courses, total, page, pageSize });
}

// 创建新课程
export async function POST(req: Request) {
  const body = await req.json();
  const data = createSchema.parse(body);

  const course = await prisma.course.create({
    data: {
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      coachId: data.coachId || null,
      students: data.studentIds?.length
        ? { connect: data.studentIds.map((id) => ({ id })) }
        : undefined,
    },
    include: {
      coach: { select: { id: true, name: true } },
      students: { select: { id: true, name: true } },
    },
  });

  return Response.json(course);
}
