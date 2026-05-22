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
      // 查询现有记录，避免重复扣减课时
      const existing = await tx.attendance.findUnique({
        where: {
          courseId_studentId_attendanceDate: {
            courseId,
            studentId: record.studentId,
            attendanceDate,
          },
        },
      });

      const oldStatus = existing?.status;
      const newStatus = record.status;
      const oldCounted = oldStatus === "present" || oldStatus === "late";
      const newCounted = newStatus === "present" || newStatus === "late";

      // upsert 考勤记录
      await tx.attendance.upsert({
        where: {
          courseId_studentId_attendanceDate: {
            courseId,
            studentId: record.studentId,
            attendanceDate,
          },
        },
        update: {
          status: newStatus,
          checkedAt: new Date(),
        },
        create: {
          courseId,
          studentId: record.studentId,
          attendanceDate,
          status: newStatus,
          checkedAt: new Date(),
        },
      });

      // 仅在状态变化导致需要扣减/加回课时时操作
      if (!oldCounted && newCounted) {
        // 新状态需要扣减
        await tx.student.update({
          where: { id: record.studentId },
          data: { remainingSessions: { decrement: 1 } },
        });
      } else if (oldCounted && !newCounted) {
        // 旧状态已扣减，新状态不需要，加回
        await tx.student.update({
          where: { id: record.studentId },
          data: { remainingSessions: { increment: 1 } },
        });
      }
    }
  });

  return Response.json({ success: true, count: records.length });
}
