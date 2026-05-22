import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as courseListHandler from "@/app/api/courses/route";
import * as courseDetailHandler from "@/app/api/courses/[id]/route";
import { cleanupTestData, createTestCourse, createTestCoach } from "@/tests/helpers";

describe("课程 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/courses 创建课程", async () => {
    await testApiHandler({
      appHandler: courseListHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "少儿基础班",
            type: "regular",
            startTime: new Date(Date.now() + 86400000).toISOString(),
            endTime: new Date(Date.now() + 90000000).toISOString(),
            location: "主训练馆",
            maxStudents: 30,
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.title).toBe("少儿基础班");
        expect(json.type).toBe("regular");
      },
    });
  });

  it("GET /api/courses 查询课程列表", async () => {
    await createTestCourse({ title: "课程A" });
    await createTestCourse({ title: "课程B" });

    await testApiHandler({
      appHandler: courseListHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.courses.length).toBeGreaterThanOrEqual(2);
      },
    });
  });

  it("GET /api/courses?start=&end= 支持日期范围筛选", async () => {
    await createTestCourse({
      title: "明天课程",
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 90000000),
    });

    const start = new Date(Date.now() + 80000000).toISOString();
    const end = new Date(Date.now() + 100000000).toISOString();

    await testApiHandler({
      appHandler: courseListHandler,
      url: `/api/courses?start=${start}&end=${end}`,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.courses.length).toBeGreaterThanOrEqual(1);
      },
    });
  });

  it("GET /api/courses/[id] 获取课程详情", async () => {
    const coach = await createTestCoach({ name: "李教练" });
    const course = await createTestCourse({
      title: "详情课程",
      coachId: coach.id,
    });

    await testApiHandler({
      appHandler: courseDetailHandler,
      params: { id: course.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.title).toBe("详情课程");
        expect(json.coach).toBeDefined();
        expect(json.coach?.name).toBe("李教练");
      },
    });
  });

  it("PUT /api/courses/[id] 更新课程", async () => {
    const course = await createTestCourse({ title: "更新前" });

    await testApiHandler({
      appHandler: courseDetailHandler,
      params: { id: course.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location: "副训练馆", maxStudents: 25 }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.location).toBe("副训练馆");
        expect(json.maxStudents).toBe(25);
      },
    });
  });

  it("DELETE /api/courses/[id] 删除课程", async () => {
    const course = await createTestCourse({ title: "待删除" });

    await testApiHandler({
      appHandler: courseDetailHandler,
      params: { id: course.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);

        const { prisma } = await import("@/lib/prisma");
        const deleted = await prisma.course.findUnique({
          where: { id: course.id },
        });
        expect(deleted).toBeNull();
      },
    });
  });
});
