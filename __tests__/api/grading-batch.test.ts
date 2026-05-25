import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as batchHandler from "@/app/api/grading/batch/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("考级批量 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/grading/batch 批量创建考级记录", async () => {
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
                examDate: "2024-06-15",
                beltLevel: "yellow",
                notes: "表现优秀",
              },
              {
                studentId: studentB.id,
                examDate: "2024-06-15",
                beltLevel: "green",

              },
            ],
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.count).toBe(2);
        expect(json.data).toHaveLength(2);
        expect(json.data[0].studentId).toBe(studentA.id);
        expect(json.data[0].beltLevel).toBe("yellow");
        expect(json.data[1].studentId).toBe(studentB.id);
        expect(json.data[1].beltLevel).toBe("green");
      },
    });
  });

  it("POST /api/grading/batch 参数校验失败返回 400", async () => {
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
                examDate: "2024-06-15",
                beltLevel: "invalid_level",
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

  it("POST /api/grading/batch 空数组返回 400", async () => {
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
