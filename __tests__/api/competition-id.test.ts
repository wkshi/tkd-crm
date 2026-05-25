import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as competitionIdHandler from "@/app/api/competition/[id]/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("比赛单条 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("GET /api/competition/[id] 查询单条比赛记录", async () => {
    const student = await createTestStudent({ name: "比赛学员" });
    const { prisma } = await import("@/lib/prisma");
    const competition = await prisma.competition.create({
      data: {
        studentId: student.id,
        competitionDate: new Date("2024-08-20"),
        competitionName: "全市跆拳道锦标赛",
        category: "少儿组 32kg",
        result: "冠军",
        award: "金牌",
      },
    });

    await testApiHandler({
      appHandler: competitionIdHandler,
      params: { id: competition.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.id).toBe(competition.id);
        expect(json.competitionName).toBe("全市跆拳道锦标赛");
        expect(json.result).toBe("冠军");
        expect(json.student.name).toBe("[test]比赛学员");
      },
    });
  });

  it("GET /api/competition/[id] 记录不存在返回 404", async () => {
    await testApiHandler({
      appHandler: competitionIdHandler,
      params: { id: "non-existent-id" },
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(404);
      },
    });
  });

  it("PUT /api/competition/[id] 更新比赛记录", async () => {
    const student = await createTestStudent({ name: "更新学员" });
    const { prisma } = await import("@/lib/prisma");
    const competition = await prisma.competition.create({
      data: {
        studentId: student.id,
        competitionDate: new Date("2024-08-20"),
        competitionName: "测试比赛",
      },
    });

    await testApiHandler({
      appHandler: competitionIdHandler,
      params: { id: competition.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            competitionDate: "2024-09-01",
            competitionName: "省级跆拳道锦标赛",
            category: "青少年组 40kg",
            result: "季军",
            award: "铜牌",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.competitionName).toBe("省级跆拳道锦标赛");
        expect(json.result).toBe("季军");
        expect(json.award).toBe("铜牌");
      },
    });
  });

  it("DELETE /api/competition/[id] 删除比赛记录", async () => {
    const student = await createTestStudent({ name: "删除学员" });
    const { prisma } = await import("@/lib/prisma");
    const competition = await prisma.competition.create({
      data: {
        studentId: student.id,
        competitionDate: new Date("2024-08-20"),
        competitionName: "测试比赛",
      },
    });

    await testApiHandler({
      appHandler: competitionIdHandler,
      params: { id: competition.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);

        const found = await prisma.competition.findUnique({
          where: { id: competition.id },
        });
        expect(found).toBeNull();
      },
    });
  });
});
