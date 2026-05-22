import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as attendanceHandler from "@/app/api/attendance/route";
import * as batchAttendanceHandler from "@/app/api/attendance/batch/route";
import {
  cleanupTestData,
  createTestStudent,
  createTestCourse,
} from "@/tests/helpers";

describe("考勤 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/attendance/batch 批量点名并扣减课时", async () => {
    const student = await createTestStudent({
      name: "点名学员",
      remainingSessions: 10,
    });
    const course = await createTestCourse({ title: "点名课程" });

    await testApiHandler({
      appHandler: batchAttendanceHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            records: [{ studentId: student.id, status: "present" }],
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.count).toBe(1);

        // 验证课时扣减
        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.student.findUnique({
          where: { id: student.id },
        });
        expect(updated?.remainingSessions).toBe(9);
      },
    });
  });

  it("POST /api/attendance/batch 缺勤不扣减课时", async () => {
    const student = await createTestStudent({
      name: "缺勤学员",
      remainingSessions: 10,
    });
    const course = await createTestCourse({ title: "缺勤课程" });

    await testApiHandler({
      appHandler: batchAttendanceHandler,
      test: async ({ fetch }) => {
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            records: [{ studentId: student.id, status: "absent" }],
          }),
        });

        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.student.findUnique({
          where: { id: student.id },
        });
        expect(updated?.remainingSessions).toBe(10);
      },
    });
  });

  it("重复点名同课程同一天不会创建重复记录", async () => {
    const student = await createTestStudent({ remainingSessions: 10 });
    const course = await createTestCourse({});

    await testApiHandler({
      appHandler: batchAttendanceHandler,
      test: async ({ fetch }) => {
        // 第一次点名
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            records: [{ studentId: student.id, status: "present" }],
          }),
        });

        // 第二次点名（同一天同一课程）
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            records: [{ studentId: student.id, status: "late" }],
          }),
        });

        // 验证只扣减一次课时
        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.student.findUnique({
          where: { id: student.id },
        });
        expect(updated?.remainingSessions).toBe(9);

        // 验证考勤记录只有一条
        const attendances = await prisma.attendance.findMany({
          where: { courseId: course.id, studentId: student.id },
        });
        expect(attendances).toHaveLength(1);
      },
    });
  });

  it("GET /api/attendance?courseId= 按课程查询考勤", async () => {
    const student = await createTestStudent({});
    const course = await createTestCourse({});

    const { prisma } = await import("@/lib/prisma");
    await prisma.attendance.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        attendanceDate: new Date(),
        status: "present",
      },
    });

    await testApiHandler({
      appHandler: attendanceHandler,
      url: `/api/attendance?courseId=${course.id}`,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.attendances).toHaveLength(1);
        expect(json.attendances[0].status).toBe("present");
      },
    });
  });

  it("GET /api/attendance?studentId= 按学员查询考勤", async () => {
    const student = await createTestStudent({});
    const course = await createTestCourse({});

    const { prisma } = await import("@/lib/prisma");
    await prisma.attendance.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        attendanceDate: new Date(),
        status: "late",
      },
    });

    await testApiHandler({
      appHandler: attendanceHandler,
      url: `/api/attendance?studentId=${student.id}`,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.attendances).toHaveLength(1);
        expect(json.attendances[0].status).toBe("late");
      },
    });
  });
});
