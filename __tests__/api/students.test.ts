import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import { Status } from "@prisma/client";
import * as studentListHandler from "@/app/api/students/route";
import * as studentDetailHandler from "@/app/api/students/[id]/route";
import { cleanupTestData, createTestStudent, createTestClass } from "@/tests/helpers";

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
            name: "[test]张小明",
            gender: "male",
            phone: "13800138001",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("[test]张小明");
        expect(json.gender).toBe("male");
        expect(json.remainingSessions).toBe(0);
        expect(json.status).toBe("active");
      },
    });
  });

  it("POST /api/students 创建学员时关联班级", async () => {
    const cls = await createTestClass({ name: "关联班级" });

    await testApiHandler({
      appHandler: studentListHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "[test]带班级学员",
            gender: "female",
            classIds: [cls.id],
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.classes).toHaveLength(1);
        expect(json.classes[0].name).toBe("[test]关联班级");
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
        expect(json.students.length).toBeGreaterThanOrEqual(2);
        expect(json.total).toBeGreaterThanOrEqual(2);
        const names = json.students.map((s: { name: string }) => s.name);
        expect(names).toContain("[test]学员A");
        expect(names).toContain("[test]学员B");
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
        expect(json.students.length).toBeGreaterThanOrEqual(1);
        expect(json.students.some((s: { name: string }) => s.name === "[test]张三")).toBe(true);
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
        expect(json.students.length).toBeGreaterThanOrEqual(1);
        expect(json.students.some((s: { name: string }) => s.name === "[test]在籍学员")).toBe(true);
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
        expect(json.name).toBe("[test]详情测试");
        expect(json.gradings).toBeDefined();
        expect(json.competitions).toBeDefined();
        expect(json.camps).toBeDefined();
        expect(json.attendances).toBeDefined();
        expect(json.classes).toBeDefined();
      },
    });
  });

  it("GET /api/students/[id] 返回学员关联的班级", async () => {
    const cls = await createTestClass({ name: "学员所在班级" });
    const student = await createTestStudent({ name: "有班级学员" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.student.update({
      where: { id: student.id },
      data: { classes: { connect: { id: cls.id } } },
    });

    await testApiHandler({
      appHandler: studentDetailHandler,
      params: { id: student.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.classes).toHaveLength(1);
        expect(json.classes[0].name).toBe("[test]学员所在班级");
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
          body: JSON.stringify({ name: "[test]更新后" }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("[test]更新后");
      },
    });
  });

  it("PUT /api/students/[id] 更新学员关联班级", async () => {
    const student = await createTestStudent({ name: "换班级学员" });
    const clsA = await createTestClass({ name: "班级A" });
    const clsB = await createTestClass({ name: "班级B" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.student.update({
      where: { id: student.id },
      data: { classes: { connect: { id: clsA.id } } },
    });

    await testApiHandler({
      appHandler: studentDetailHandler,
      params: { id: student.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ classIds: [clsB.id] }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.classes).toHaveLength(1);
        expect(json.classes[0].name).toBe("[test]班级B");
      },
    });
  });

  it("GET /api/students?sessions= 支持剩余课时筛选", async () => {
    await createTestStudent({ name: "充足课时", remainingSessions: 25 });
    await createTestStudent({ name: "正常课时", remainingSessions: 15 });
    await createTestStudent({ name: "偏少课时", remainingSessions: 7 });
    await createTestStudent({ name: "临界课时", remainingSessions: 3 });
    await createTestStudent({ name: "无课时", remainingSessions: 0 });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?sessions=plenty",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]充足课时")).toBe(true);
        expect(json.students.every((s: { remainingSessions: number }) => s.remainingSessions > 20)).toBe(true);
      },
    });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?sessions=normal",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]正常课时")).toBe(true);
        expect(json.students.every((s: { remainingSessions: number }) => s.remainingSessions >= 10 && s.remainingSessions <= 20)).toBe(true);
      },
    });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?sessions=low",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]偏少课时")).toBe(true);
        expect(json.students.every((s: { remainingSessions: number }) => s.remainingSessions >= 6 && s.remainingSessions <= 9)).toBe(true);
      },
    });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?sessions=critical",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]临界课时")).toBe(true);
        expect(json.students.every((s: { remainingSessions: number }) => s.remainingSessions <= 5)).toBe(true);
      },
    });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?sessions=empty",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]无课时")).toBe(true);
        expect(json.students.every((s: { remainingSessions: number }) => s.remainingSessions <= 0)).toBe(true);
      },
    });
  });

  it("GET /api/students?expiry= 支持到期时间筛选", async () => {
    const now = new Date();
    const fiveDaysLater = new Date(now);
    fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
    const thirtyFiveDaysLater = new Date(now);
    thirtyFiveDaysLater.setDate(thirtyFiveDaysLater.getDate() + 35);

    await createTestStudent({ name: "快到期", remainingSessions: 10, expiryDate: fiveDaysLater });
    await createTestStudent({ name: "已过期", remainingSessions: 10, expiryDate: new Date(now.getTime() - 86400000) });
    await createTestStudent({ name: "无到期日", remainingSessions: 10 });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?expiry=7days",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]快到期")).toBe(true);
      },
    });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?expiry=30days",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]快到期")).toBe(true);
      },
    });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?expiry=expired",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]已过期")).toBe(true);
      },
    });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?expiry=unset",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.some((s: { name: string }) => s.name === "[test]无到期日")).toBe(true);
      },
    });
  });

  it("GET /api/students?classId= 支持班级筛选", async () => {
    const cls = await createTestClass({ name: "筛选班级" });
    const student = await createTestStudent({ name: "班级学员" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.student.update({
      where: { id: student.id },
      data: { classes: { connect: { id: cls.id } } },
    });
    await createTestStudent({ name: "其他学员" });

    await testApiHandler({
      appHandler: studentListHandler,
      url: `/api/students?classId=${cls.id}`,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.length).toBe(1);
        expect(json.students[0].name).toBe("[test]班级学员");
      },
    });
  });

  it("GET /api/students?page=&pageSize= 支持分页", async () => {
    await createTestStudent({ name: "分页A" });
    await createTestStudent({ name: "分页B" });

    await testApiHandler({
      appHandler: studentListHandler,
      url: "/api/students?page=1&pageSize=1",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.students.length).toBe(1);
        expect(json.page).toBe(1);
        expect(json.pageSize).toBe(1);
        expect(json.total).toBeGreaterThanOrEqual(2);
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
