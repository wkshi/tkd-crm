import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const batchSchema = z.object({
  courseId: z.string().min(1),
  attendanceDate: z.string().optional(),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(["unmarked", "present", "absent", "late", "leave"]),
    })
  ),
});

/**
 * POST /api/attendance/batch
 * 批量点名：使用 Prisma $transaction 批量 upsert 考勤记录，
 * 并对出勤/迟到的学员扣减 remainingSessions
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { courseId, attendanceDate: dateStr, records } = batchSchema.parse(body);

  // 校验课程是否存在
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, startTime: true },
  });
  if (!course) {
    return Response.json({ error: "课程不存在" }, { status: 404 });
  }

  let attendanceDate: Date;
  if (dateStr) {
    attendanceDate = new Date(dateStr);
  } else {
    // 未提供日期时使用课程开始时间的日期
    const courseDate = new Date(course.startTime);
    attendanceDate = new Date(courseDate.getFullYear(), courseDate.getMonth(), courseDate.getDate());
  }

  await prisma.$transaction(async (tx) => {
    for (const record of records) {
      // upsert 考勤记录，复合唯一索引防止重复
      await tx.attendance.upsert({
        where: {
          courseId_studentId_attendanceDate: {
            courseId,
            studentId: record.studentId,
            attendanceDate,
          },
        },
        update: {
          status: record.status,
          checkedAt: new Date(),
        },
        create: {
          courseId,
          studentId: record.studentId,
          attendanceDate,
          status: record.status,
          checkedAt: new Date(),
        },
      });

      // 出勤或迟到时扣减课时
      if (record.status === "present" || record.status === "late") {
        await tx.student.update({
          where: { id: record.studentId },
          data: {
            remainingSessions: {
              decrement: 1,
            },
          },
        });
      }
    }
  });

  return Response.json({ success: true, count: records.length });
}
