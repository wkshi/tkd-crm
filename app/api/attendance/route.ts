import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  courseId: z.string().min(1),
  studentId: z.string().min(1),
  attendanceDate: z.string().min(1),
  status: z.enum(["unmarked", "present", "absent", "late", "leave"]).default("unmarked"),
});

/**
 * GET /api/attendance?studentId=xxx 或 ?courseId=xxx
 * 查询考勤记录，支持按学员或课程过滤
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;
  const courseId = searchParams.get("courseId") || undefined;

  const where: Prisma.AttendanceWhereInput = {};
  if (studentId) where.studentId = studentId;
  if (courseId) where.courseId = courseId;

  const attendances = await prisma.attendance.findMany({
    where,
    orderBy: { attendanceDate: "desc" },
    include: {
      student: { select: { id: true, name: true } },
      course: { select: { id: true, title: true, startTime: true } },
    },
  });

  return Response.json({ attendances });
}

/**
 * POST /api/attendance
 * 创建或更新单条考勤记录（基于复合唯一索引 upsert）
 */
export async function POST(req: Request) {
  const body = await req.json();
  const data = createSchema.parse(body);

  const attendanceDate = new Date(data.attendanceDate);

  const attendance = await prisma.attendance.upsert({
    where: {
      courseId_studentId_attendanceDate: {
        courseId: data.courseId,
        studentId: data.studentId,
        attendanceDate,
      },
    },
    update: {
      status: data.status,
      checkedAt: new Date(),
    },
    create: {
      courseId: data.courseId,
      studentId: data.studentId,
      attendanceDate,
      status: data.status,
      checkedAt: new Date(),
    },
  });

  return Response.json(attendance);
}
