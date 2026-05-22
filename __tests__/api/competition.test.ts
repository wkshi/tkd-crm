import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as competitionHandler from "@/app/api/competition/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("比赛 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/competition 创建比赛记录", async () => {
    const student = await createTestStudent({ name: "比赛学员" });

    await testApiHandler({
      appHandler: competitionHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            competitionDate: "2024-08-20",
            competitionName: "全市跆拳道锦标赛",
            category: "少儿组 32kg",
            result: "冠军",
            award: "金牌",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.studentId).toBe(student.id);
        expect(json.competitionName).toBe("全市跆拳道锦标赛");
        expect(json.result).toBe("冠军");
        expect(json.award).toBe("金牌");
      },
    });
  });

  it("GET /api/competition 查询所有比赛记录", async () => {
    const student = await createTestStudent({ name: "比赛学员A" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.competition.create({
      data: {
        studentId: student.id,
        competitionDate: new Date("2024-08-20"),
        competitionName: "测试比赛",
      },
    });

    await testApiHandler({
      appHandler: competitionHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.competitions).toHaveLength(1);
        expect(json.competitions[0].competitionName).toBe("测试比赛");
        expect(json.competitions[0].student.name).toBe("比赛学员A");
      },
    });
  });

  it("GET /api/competition?studentId= 按学员筛选", async () => {
    const studentA = await createTestStudent({ name: "学员A" });
    const studentB = await createTestStudent({ name: "学员B" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.competition.create({
      data: { studentId: studentA.id, competitionDate: new Date(), competitionName: "A比赛" },
    });
    await prisma.competition.create({
      data: { studentId: studentB.id, competitionDate: new Date(), competitionName: "B比赛" },
    });

    await testApiHandler({
      appHandler: competitionHandler,
      url: `/api/competition?studentId=${studentA.id}`,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.competitions).toHaveLength(1);
        expect(json.competitions[0].studentId).toBe(studentA.id);
      },
    });
  });
});
