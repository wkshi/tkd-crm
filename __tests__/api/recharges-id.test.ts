import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as idHandler from "@/app/api/recharges/[id]/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("充值单条 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("GET /api/recharges/[id] 查询单条充值记录", async () => {
    const student = await createTestStudent({ name: "查询学员" });
    const { prisma } = await import("@/lib/prisma");
    const recharge = await prisma.recharge.create({
      data: {
        studentId: student.id,
        action: "increment",
        sessions: 10,
        durationDays: 30,
        notes: "测试",
      },
    });

    await testApiHandler({
      appHandler: idHandler,
      params: { id: recharge.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.sessions).toBe(10);
        expect(json.student.name).toBe("[test]查询学员");
      },
    });
  });

  it("GET /api/recharges/[id] 不存在返回 404", async () => {
    await testApiHandler({
      appHandler: idHandler,
      params: { id: "non-existent-id" },
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(404);
      },
    });
  });

  it("PUT /api/recharges/[id] 仅允许修改备注", async () => {
    const student = await createTestStudent({ name: "更新学员" });
    const { prisma } = await import("@/lib/prisma");
    const recharge = await prisma.recharge.create({
      data: {
        studentId: student.id,
        action: "increment",
        sessions: 10,
        durationDays: 30,
        notes: "原备注",
      },
    });

    await testApiHandler({
      appHandler: idHandler,
      params: { id: recharge.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: "新备注" }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.notes).toBe("新备注");
        expect(json.sessions).toBe(10); // 次数不变
      },
    });
  });

  it("DELETE /api/recharges/[id] 删除并回滚学员课时", async () => {
    const student = await createTestStudent({
      name: "删除学员",
      remainingSessions: 10,
    });
    const { prisma } = await import("@/lib/prisma");
    const recharge = await prisma.recharge.create({
      data: {
        studentId: student.id,
        action: "increment",
        sessions: 10,
        durationDays: 30,
      },
    });

    await testApiHandler({
      appHandler: idHandler,
      params: { id: recharge.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        expect(res.status).toBe(200);

        const deleted = await prisma.recharge.findUnique({
          where: { id: recharge.id },
        });
        expect(deleted).toBeNull();

        const updated = await prisma.student.findUnique({
          where: { id: student.id },
        });
        expect(updated?.remainingSessions).toBe(0);
      },
    });
  });
});
