import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as handler from "@/app/api/recharges/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("充值 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/recharges 增加课时并更新学员过期日期", async () => {
    const student = await createTestStudent({ name: "充值学员", remainingSessions: 0 });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            action: "increment",
            sessions: 10,
            durationDays: 30,
            notes: "暑期班充值",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.action).toBe("increment");
        expect(json.sessions).toBe(10);
        expect(json.durationDays).toBe(30);

        // 验证学员课时已更新
        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.student.findUnique({
          where: { id: student.id },
        });
        expect(updated?.remainingSessions).toBe(10);
        expect(updated?.expiryDate).not.toBeNull();
      },
    });
  });

  it("POST /api/recharges 减少课时", async () => {
    const student = await createTestStudent({
      name: "扣课学员",
      remainingSessions: 20,
    });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            action: "decrement",
            sessions: 5,
            durationDays: 0,
            notes: "请假扣课",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.action).toBe("decrement");

        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.student.findUnique({
          where: { id: student.id },
        });
        expect(updated?.remainingSessions).toBe(15);
      },
    });
  });

  it("GET /api/recharges 查询充值记录", async () => {
    const student = await createTestStudent({ name: "查询学员" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.recharge.create({
      data: {
        studentId: student.id,
        action: "increment",
        sessions: 10,
        durationDays: 30,
      },
    });

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.recharges.length).toBeGreaterThanOrEqual(1);
      },
    });
  });

  it("GET /api/recharges?studentId= 按学员筛选", async () => {
    const studentA = await createTestStudent({ name: "学员A" });
    const studentB = await createTestStudent({ name: "学员B" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.recharge.create({
      data: { studentId: studentA.id, action: "increment", sessions: 10, durationDays: 30 },
    });
    await prisma.recharge.create({
      data: { studentId: studentB.id, action: "increment", sessions: 5, durationDays: 15 },
    });

    await testApiHandler({
      appHandler: handler,
      url: `/api/recharges?studentId=${studentA.id}`,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.recharges).toHaveLength(1);
        expect(json.recharges[0].studentId).toBe(studentA.id);
      },
    });
  });
});
