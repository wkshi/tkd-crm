import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as gradingIdHandler from "@/app/api/grading/[id]/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("考级单条 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("GET /api/grading/[id] 查询单条考级记录", async () => {
    const student = await createTestStudent({ name: "考级学员" });
    const { prisma } = await import("@/lib/prisma");
    const grading = await prisma.grading.create({
      data: {
        studentId: student.id,
        examDate: new Date("2024-06-15"),
        beltLevel: "yellow",
        notes: "表现优秀",
      },
    });

    await testApiHandler({
      appHandler: gradingIdHandler,
      params: { id: grading.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.id).toBe(grading.id);
        expect(json.beltLevel).toBe("yellow");
        expect(json.student.name).toBe("[test]考级学员");
      },
    });
  });

  it("GET /api/grading/[id] 记录不存在返回 404", async () => {
    await testApiHandler({
      appHandler: gradingIdHandler,
      params: { id: "non-existent-id" },
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(404);
      },
    });
  });

  it("PUT /api/grading/[id] 更新考级记录", async () => {
    const student = await createTestStudent({ name: "更新学员" });
    const { prisma } = await import("@/lib/prisma");
    const grading = await prisma.grading.create({
      data: {
        studentId: student.id,
        examDate: new Date("2024-06-15"),
        beltLevel: "yellow",
      },
    });

    await testApiHandler({
      appHandler: gradingIdHandler,
      params: { id: grading.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examDate: "2024-07-01",
            beltLevel: "green",
            notes: "升级成功",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.beltLevel).toBe("green");
        expect(json.notes).toBe("升级成功");
      },
    });
  });

  it("DELETE /api/grading/[id] 删除考级记录", async () => {
    const student = await createTestStudent({ name: "删除学员" });
    const { prisma } = await import("@/lib/prisma");
    const grading = await prisma.grading.create({
      data: {
        studentId: student.id,
        examDate: new Date("2024-06-15"),
        beltLevel: "white",
      },
    });

    await testApiHandler({
      appHandler: gradingIdHandler,
      params: { id: grading.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);

        // 验证已删除
        const found = await prisma.grading.findUnique({
          where: { id: grading.id },
        });
        expect(found).toBeNull();
      },
    });
  });
});
