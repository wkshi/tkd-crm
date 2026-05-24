import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as coachListHandler from "@/app/api/coaches/route";
import * as coachDetailHandler from "@/app/api/coaches/[id]/route";
import { cleanupTestData, createTestCoach } from "@/tests/helpers";

describe("教练 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/coaches 创建教练", async () => {
    await testApiHandler({
      appHandler: coachListHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "[test]王教练",
            gender: "female",
            phone: "13900139001",
            bio: "省级跆拳道冠军",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("[test]王教练");
        expect(json.gender).toBe("female");
        expect(json.status).toBe("active");
      },
    });
  });

  it("GET /api/coaches 查询教练列表", async () => {
    await createTestCoach({ name: "教练A" });
    await createTestCoach({ name: "教练B" });

    await testApiHandler({
      appHandler: coachListHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.coaches.length).toBeGreaterThanOrEqual(2);
        expect(json.total).toBeGreaterThanOrEqual(2);
        const names = json.coaches.map((c: { name: string }) => c.name);
        expect(names).toContain("[test]教练A");
        expect(names).toContain("[test]教练B");
      },
    });
  });

  it("GET /api/coaches/[id] 获取教练详情（含所授课程）", async () => {
    const coach = await createTestCoach({ name: "详情教练" });

    await testApiHandler({
      appHandler: coachDetailHandler,
      params: { id: coach.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("[test]详情教练");
        expect(json.courses).toBeDefined();
      },
    });
  });

  it("PUT /api/coaches/[id] 更新教练", async () => {
    const coach = await createTestCoach({ name: "更新前" });

    await testApiHandler({
      appHandler: coachDetailHandler,
      params: { id: coach.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bio: "更新后的简介" }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.bio).toBe("更新后的简介");
      },
    });
  });

  it("DELETE /api/coaches/[id] 软删除教练", async () => {
    const coach = await createTestCoach({ name: "待删除" });

    await testApiHandler({
      appHandler: coachDetailHandler,
      params: { id: coach.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);

        const { prisma } = await import("@/lib/prisma");
        const deleted = await prisma.coach.findUnique({
          where: { id: coach.id },
        });
        expect(deleted?.status).toBe("inactive");
      },
    });
  });
});
