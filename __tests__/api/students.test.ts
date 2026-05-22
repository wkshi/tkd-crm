import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import { Status } from "@prisma/client";
import * as studentListHandler from "@/app/api/students/route";
import * as studentDetailHandler from "@/app/api/students/[id]/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("学员 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/students 创建学员", async () => {
    await testApiHandler({
      appHandler: studentListHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "张小明",
            gender: "male",
            phone: "13800138001",
            remainingSessions: 24,
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("张小明");
        expect(json.gender).toBe("male");
        expect(json.remainingSessions).toBe(24);
        expect(json.status).toBe("active");
      },
    });
  });

  it("GET /api/students 查询学员列表", async () => {
    await createTestStudent({ name: "学员A" });
    await createTestStudent({ name: "学员B" });

    await testApiHandler({
      appHandler: studentListHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.students).toHaveLength(2);
        expect(json.total).toBe(2);
        expect(json.students[0].name).toMatch(/学员A|学员B/);
      },
    });
  });

  it("GET /api/students?search= 支持搜索", async () => {
    await createTestStudent({ name: "张三" });
    await createTestStudent({ name: "李四" });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?search=张",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students).toHaveLength(1);
        expect(json.students[0].name).toBe("张三");
      },
    });
  });

  it("GET /api/students?status= 支持状态筛选", async () => {
    await createTestStudent({ name: "在籍学员", status: Status.active });
    await createTestStudent({ name: "已结业学员", status: Status.inactive });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?status=active",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students).toHaveLength(1);
        expect(json.students[0].name).toBe("在籍学员");
      },
    });
  });

  it("GET /api/students/[id] 获取学员详情", async () => {
    const student = await createTestStudent({ name: "详情测试" });

    await testApiHandler({
      appHandler: studentDetailHandler,
      params: { id: student.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("详情测试");
        expect(json.gradings).toBeDefined();
        expect(json.competitions).toBeDefined();
        expect(json.camps).toBeDefined();
        expect(json.attendances).toBeDefined();
      },
    });
  });

  it("PUT /api/students/[id] 更新学员", async () => {
    const student = await createTestStudent({ name: "更新前" });

    await testApiHandler({
      appHandler: studentDetailHandler,
      params: { id: student.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "更新后", remainingSessions: 10 }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("更新后");
        expect(json.remainingSessions).toBe(10);
      },
    });
  });

  it("DELETE /api/students/[id] 软删除学员", async () => {
    const student = await createTestStudent({ name: "待删除" });

    await testApiHandler({
      appHandler: studentDetailHandler,
      params: { id: student.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);

        // 验证数据库中状态变为 inactive
        const { prisma } = await import("@/lib/prisma");
        const deleted = await prisma.student.findUnique({
          where: { id: student.id },
        });
        expect(deleted?.status).toBe("inactive");
      },
    });
  });
});
