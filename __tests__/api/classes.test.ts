import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import { Status } from "@prisma/client";
import * as classListHandler from "@/app/api/classes/route";
import * as classDetailHandler from "@/app/api/classes/[id]/route";
import { cleanupTestData, createTestClass, createTestStudent } from "@/tests/helpers";

describe("班级 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/classes 创建班级", async () => {
    await testApiHandler({
      appHandler: classListHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "[test]少儿基础班",
            level: "白带",
            description: "适合 5-8 岁学员",
            maxStudents: 25,
            status: "active",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("[test]少儿基础班");
        expect(json.level).toBe("白带");
        expect(json.description).toBe("适合 5-8 岁学员");
        expect(json.maxStudents).toBe(25);
        expect(json.status).toBe("active");
        expect(json._count).toBeDefined();
      },
    });
  });

  it("GET /api/classes 查询班级列表", async () => {
    await createTestClass({ name: "班级A" });
    await createTestClass({ name: "班级B" });

    await testApiHandler({
      appHandler: classListHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.classes.length).toBeGreaterThanOrEqual(2);
        expect(json.total).toBeGreaterThanOrEqual(2);
      },
    });
  });

  it("GET /api/classes?search= 支持搜索", async () => {
    await createTestClass({ name: "搜索目标" });
    await createTestClass({ name: "其他班级" });

    await testApiHandler({
      appHandler: classListHandler,
      url: "/api/classes?search=搜索",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.classes.length).toBeGreaterThanOrEqual(1);
        expect(json.classes.some((c: { name: string }) => c.name === "[test]搜索目标")).toBe(true);
      },
    });
  });

  it("GET /api/classes?status= 支持状态筛选", async () => {
    await createTestClass({ name: "活跃班级", status: Status.active });
    await createTestClass({ name: "停用班级", status: Status.inactive });

    await testApiHandler({
      appHandler: classListHandler,
      url: "/api/classes?status=active",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.classes.length).toBeGreaterThanOrEqual(1);
        expect(json.classes.every((c: { status: string }) => c.status === "active")).toBe(true);
      },
    });
  });

  it("GET /api/classes/[id] 获取班级详情", async () => {
    const cls = await createTestClass({ name: "详情班级" });

    await testApiHandler({
      appHandler: classDetailHandler,
      params: { id: cls.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("[test]详情班级");
        expect(json.students).toBeDefined();
        expect(json.courses).toBeDefined();
        expect(json._count).toBeDefined();
      },
    });
  });

  it("GET /api/classes/[id] 不存在返回 404", async () => {
    await testApiHandler({
      appHandler: classDetailHandler,
      params: { id: "non-existent-id" },
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(404);
      },
    });
  });

  it("PUT /api/classes/[id] 更新班级", async () => {
    const cls = await createTestClass({ name: "更新前" });

    await testApiHandler({
      appHandler: classDetailHandler,
      params: { id: cls.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "[test]更新后",
            level: "黄带",
            maxStudents: 20,
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("[test]更新后");
        expect(json.level).toBe("黄带");
        expect(json.maxStudents).toBe(20);
      },
    });
  });

  it("PUT /api/classes/[id] 更新学员关联", async () => {
    const cls = await createTestClass({ name: "关联班级" });
    const student = await createTestStudent({ name: "关联学员" });

    await testApiHandler({
      appHandler: classDetailHandler,
      params: { id: cls.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentIds: [student.id],
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.students).toHaveLength(1);
        expect(json.students[0].name).toBe("[test]关联学员");
      },
    });
  });

  it("DELETE /api/classes/[id] 软删除班级", async () => {
    const cls = await createTestClass({ name: "待删除" });

    await testApiHandler({
      appHandler: classDetailHandler,
      params: { id: cls.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);

        const { prisma } = await import("@/lib/prisma");
        const deleted = await prisma.class.findUnique({
          where: { id: cls.id },
        });
        expect(deleted?.status).toBe("inactive");
      },
    });
  });
});
