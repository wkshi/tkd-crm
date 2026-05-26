import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as attendanceHandler from "@/app/api/attendance/route";
import * as batchAttendanceHandler from "@/app/api/attendance/batch/route";
import {
  cleanupTestData,
  createTestStudent,
  createTestCourse,
  createTestClass,
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

  it("GET /api/attendance?studentName= 支持按学员姓名筛选", async () => {
    const student = await createTestStudent({ name: "考勤张三" });
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
      url: "/api/attendance?studentName=张三",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.attendances.length).toBeGreaterThanOrEqual(1);
        expect(json.attendances[0].student.name).toBe("[test]考勤张三");
      },
    });
  });

  it("GET /api/attendance?className= 支持按班级名称筛选", async () => {
    const cls = await createTestClass({ name: "考勤班级" });
    const student = await createTestStudent({});
    const { prisma } = await import("@/lib/prisma");
    const course = await prisma.course.create({
      data: {
        title: "[test]考勤课程",
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 90000000),
        classId: cls.id,
        location: "主训练馆",
      },
    });
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
      url: "/api/attendance?className=考勤班级",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.attendances.length).toBeGreaterThanOrEqual(1);
        expect(json.attendances[0].course.class.name).toBe("[test]考勤班级");
      },
    });
  });

  it("GET /api/attendance?startDate=&endDate= 支持日期范围筛选", async () => {
    const student = await createTestStudent({});
    const course = await createTestCourse({});
    const { prisma } = await import("@/lib/prisma");
    await prisma.attendance.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        attendanceDate: new Date("2024-06-15"),
        status: "present",
      },
    });

    await testApiHandler({
      appHandler: attendanceHandler,
      url: "/api/attendance?startDate=2024-06-01&endDate=2024-06-30",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.attendances.length).toBeGreaterThanOrEqual(1);
      },
    });
  });

  it("GET /api/attendance?year=&month= 支持年月筛选", async () => {
    const student = await createTestStudent({});
    const course = await createTestCourse({});
    const { prisma } = await import("@/lib/prisma");
    await prisma.attendance.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        attendanceDate: new Date("2024-06-15"),
        status: "present",
      },
    });

    await testApiHandler({
      appHandler: attendanceHandler,
      url: "/api/attendance?year=2024&month=6",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.attendances.length).toBeGreaterThanOrEqual(1);
        expect(json.availableYears).toContain(2024);
      },
    });
  });

  it("GET /api/attendance?year= 支持仅按年筛选", async () => {
    const student = await createTestStudent({});
    const course = await createTestCourse({});
    const { prisma } = await import("@/lib/prisma");
    await prisma.attendance.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        attendanceDate: new Date("2024-03-01"),
        status: "present",
      },
    });

    await testApiHandler({
      appHandler: attendanceHandler,
      url: "/api/attendance?year=2024",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.attendances.length).toBeGreaterThanOrEqual(1);
      },
    });
  });

  it("GET /api/attendance?month= 支持仅按月筛选", async () => {
    const student = await createTestStudent({});
    const course = await createTestCourse({});
    const { prisma } = await import("@/lib/prisma");
    const currentYear = new Date().getFullYear();
    await prisma.attendance.create({
      data: {
        courseId: course.id,
        studentId: student.id,
        attendanceDate: new Date(currentYear, 5, 15),
        status: "present",
      },
    });

    await testApiHandler({
      appHandler: attendanceHandler,
      url: "/api/attendance?month=6",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.attendances.length).toBeGreaterThanOrEqual(1);
      },
    });
  });

  it("POST /api/attendance 单条考勤 upsert", async () => {
    const student = await createTestStudent({});
    const course = await createTestCourse({});

    await testApiHandler({
      appHandler: attendanceHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            studentId: student.id,
            attendanceDate: "2024-06-01",
            status: "present",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.courseId).toBe(course.id);
        expect(json.studentId).toBe(student.id);
        expect(json.status).toBe("present");

        // 再次提交同一组合应更新而非创建新记录
        const res2 = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            studentId: student.id,
            attendanceDate: "2024-06-01",
            status: "absent",
          }),
        });
        const json2 = await res2.json();
        expect(json2.status).toBe("absent");
        expect(json2.id).toBe(json.id);
      },
    });
  });
});
