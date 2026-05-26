import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// 创建课程的验证模式
const createSchema = z.object({
  title: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  coachId: z.string().optional(),
  classId: z.string().min(1),
  location: z.string().optional(),
  maxStudents: z.number().default(30),
  description: z.string().optional(),
});

// 获取课程列表（支持类型筛选、教练筛选、班级筛选和时间范围）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId") || undefined;
  const classId = searchParams.get("classId") || undefined;
  const start = searchParams.get("start") || undefined;
  const end = searchParams.get("end") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");
  const includeAttendanceStatus = searchParams.get("includeAttendanceStatus") === "true";

  const where: Prisma.CourseWhereInput = {};
  if (coachId) {
    where.coachId = coachId;
  }
  if (classId) {
    where.classId = classId;
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
        class: { select: { id: true, name: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  // 如果请求包含点名状态，为每个课程附加 hasAttendanceChecked 字段
  let coursesResult = courses;
  if (includeAttendanceStatus) {
    const courseIds = courses.map((c) => c.id);
    const checkedAttendances = await prisma.attendance.findMany({
      where: {
        courseId: { in: courseIds },
        checkedAt: { not: null },
      },
      select: { courseId: true },
      distinct: ["courseId"],
    });
    const checkedCourseIds = new Set(
      checkedAttendances.map((a) => a.courseId)
    );
    coursesResult = courses.map((c) => ({
      ...c,
      hasAttendanceChecked: checkedCourseIds.has(c.id),
    }));
  }

  return Response.json({
    courses: coursesResult,
    total,
    page,
    pageSize,
  });
}

// 创建新课程
export async function POST(req: Request) {
  const body = await req.json();
  const data = createSchema.parse(body);

  // 如果未提供课程名称，自动生成：班级名 + 日期
  let title = data.title;
  if (!title) {
    const cls = await prisma.class.findUnique({
      where: { id: data.classId },
      select: { name: true },
    });
    const dateStr = new Date(data.startTime).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    title = `${cls?.name || "未命名课程"} ${dateStr}`;
  }

  const course = await prisma.course.create({
    data: {
      title,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      coachId: data.coachId || null,
      classId: data.classId,
      location: data.location,
      maxStudents: data.maxStudents,
      description: data.description,
    },
    include: {
      coach: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
    },
  });

  return Response.json(course);
}
