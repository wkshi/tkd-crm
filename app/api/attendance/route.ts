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
 * GET /api/attendance?studentName=xxx&className=xxx&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&studentId=xxx&courseId=xxx&year=2026&month=5
 * 查询考勤记录，支持按学员姓名、班级名称、时间段、学员ID、课程ID、年月过滤
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;
  const studentName = searchParams.get("studentName") || undefined;
  const courseId = searchParams.get("courseId") || undefined;
  const className = searchParams.get("className") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const year = searchParams.get("year") || undefined;
  const month = searchParams.get("month") || undefined;

  const where: Prisma.AttendanceWhereInput = {};
  if (studentId) where.studentId = studentId;
  if (studentName) {
    where.student = {
      name: { contains: studentName, mode: "insensitive" },
    };
  }
  if (courseId) where.courseId = courseId;
  if (className) {
    where.course = {
      class: {
        name: { contains: className, mode: "insensitive" },
      },
    };
  }
  if (startDate || endDate) {
    where.attendanceDate = {} as Prisma.DateTimeFilter<"Attendance">;
    if (startDate) {
      where.attendanceDate.gte = new Date(startDate);
    }
    if (endDate) {
      const d = new Date(endDate);
      d.setDate(d.getDate() + 1);
      where.attendanceDate.lt = d;
    }
  }
  if (year || month) {
    where.attendanceDate = (where.attendanceDate || {}) as Prisma.DateTimeFilter<"Attendance">;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const m = month ? parseInt(month, 10) - 1 : 0;
    if (year && month) {
      // 精确到某年某月
      where.attendanceDate.gte = new Date(y, m, 1);
      where.attendanceDate.lt = new Date(y, m + 1, 1);
    } else if (year) {
      // 精确到某年全年
      where.attendanceDate.gte = new Date(parseInt(year, 10), 0, 1);
      where.attendanceDate.lt = new Date(parseInt(year, 10) + 1, 0, 1);
    } else if (month) {
      // 仅月份，默认使用今年
      const currentYear = new Date().getFullYear();
      where.attendanceDate.gte = new Date(currentYear, m, 1);
      where.attendanceDate.lt = new Date(currentYear, m + 1, 1);
    }
  }

  const attendances = await prisma.attendance.findMany({
    where,
    orderBy: { attendanceDate: "desc" },
    include: {
      student: { select: { id: true, name: true } },
      course: {
        select: {
          id: true,
          title: true,
          startTime: true,
          class: { select: { id: true, name: true } },
        },
      },
    },
  });

  // 查询所有有考勤记录的年份（去重、降序）
  const allAttendances = await prisma.attendance.findMany({
    select: { attendanceDate: true },
    distinct: ["attendanceDate"],
  });
  const yearSet = new Set<number>();
  allAttendances.forEach((a) => {
    yearSet.add(new Date(a.attendanceDate).getFullYear());
  });
  const availableYears = Array.from(yearSet).sort((a, b) => b - a);

  return Response.json({ attendances, availableYears });
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
