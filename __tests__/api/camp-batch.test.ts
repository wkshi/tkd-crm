import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as batchHandler from "@/app/api/camp/batch/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("集训批量 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/camp/batch 批量创建集训记录", async () => {
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
                activityDate: "2024-07-10",
                activityName: "暑期特训营",
                location: "郊外基地",
                duration: 3,
                notes: "包含体能训练",
              },
              {
                studentId: studentB.id,
                activityDate: "2024-07-10",
                activityName: "暑期特训营",
                location: "郊外基地",
                duration: 3,
                notes: "包含体能训练",
              },
            ],
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.data).toHaveLength(2);
        expect(json.count).toBe(2);
        expect(json.data[0].activityName).toBe("暑期特训营");
        expect(json.data[1].activityName).toBe("暑期特训营");
      },
    });
  });

  it("POST /api/camp/batch 参数校验失败返回 400", async () => {
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
                activityDate: "",
                activityName: "",
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

  it("POST /api/camp/batch 空数组返回 400", async () => {
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
