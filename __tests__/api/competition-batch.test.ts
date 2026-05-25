import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as batchHandler from "@/app/api/competition/batch/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("比赛批量 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/competition/batch 批量创建比赛记录", async () => {
    const studentA = await createTestStudent({ name: "学员A" });
    const studentB = await createTestStudent({ name: "学员B" });

    await testApiHandler({
      appHandler: batchHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [
              {
                studentId: studentA.id,
                competitionDate: "2024-08-20",
                competitionName: "全市跆拳道锦标赛",
                category: "少儿组 32kg",
                result: "冠军",
                award: "金牌",
              },
              {
                studentId: studentB.id,
                competitionDate: "2024-08-20",
                competitionName: "全市跆拳道锦标赛",
                category: "少儿组 28kg",
                result: "亚军",
              },
            ],
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.count).toBe(2);
        expect(json.data).toHaveLength(2);
        expect(json.data[0].studentId).toBe(studentA.id);
        expect(json.data[0].competitionName).toBe("全市跆拳道锦标赛");
        expect(json.data[1].studentId).toBe(studentB.id);
        expect(json.data[1].result).toBe("亚军");
      },
    });
  });

  it("POST /api/competition/batch 参数校验失败返回 400", async () => {
    await testApiHandler({
      appHandler: batchHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [
              {
                studentId: "",
                competitionDate: "2024-08-20",
                competitionName: "",
              },
            ],
          }),
        });
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("请求参数错误");
      },
    });
  });

  it("POST /api/competition/batch 空数组返回 400", async () => {
    await testApiHandler({
      appHandler: batchHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: [] }),
        });
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("请求参数错误");
      },
    });
  });
});
