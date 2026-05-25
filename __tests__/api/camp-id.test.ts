import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as idHandler from "@/app/api/camp/[id]/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("集训单条 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("GET /api/camp/[id] 查询单条集训记录", async () => {
    const student = await createTestStudent({ name: "集训学员" });
    const { prisma } = await import("@/lib/prisma");
    const camp = await prisma.camp.create({
      data: {
        studentId: student.id,
        activityDate: new Date("2024-07-10"),
        activityName: "测试集训",
        location: "基地",
        duration: 3,
        notes: "备注",
      },
    });

    await testApiHandler({
      appHandler: idHandler,
      params: { id: camp.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.activityName).toBe("测试集训");
        expect(json.student.name).toBe("[test]集训学员");
      },
    });
  });

  it("GET /api/camp/[id] 不存在返回 404", async () => {
    await testApiHandler({
      appHandler: idHandler,
      params: { id: "non-existent-id" },
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error).toBe("集训记录不存在");
      },
    });
  });

  it("PUT /api/camp/[id] 更新集训记录", async () => {
    const student = await createTestStudent({ name: "更新学员" });
    const { prisma } = await import("@/lib/prisma");
    const camp = await prisma.camp.create({
      data: {
        studentId: student.id,
        activityDate: new Date("2024-07-10"),
        activityName: "原集训",
      },
    });

    await testApiHandler({
      appHandler: idHandler,
      params: { id: camp.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityDate: "2024-08-15",
            activityName: "更新后的集训",
            location: "新基地",
            duration: 5,
            notes: "新备注",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.activityName).toBe("更新后的集训");
        expect(json.location).toBe("新基地");
        expect(json.duration).toBe(5);
        expect(json.notes).toBe("新备注");
      },
    });
  });

  it("DELETE /api/camp/[id] 删除集训记录", async () => {
    const student = await createTestStudent({ name: "删除学员" });
    const { prisma } = await import("@/lib/prisma");
    const camp = await prisma.camp.create({
      data: {
        studentId: student.id,
        activityDate: new Date("2024-07-10"),
        activityName: "删除集训",
      },
    });

    await testApiHandler({
      appHandler: idHandler,
      params: { id: camp.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        expect(res.status).toBe(200);

        const deleted = await prisma.camp.findUnique({
          where: { id: camp.id },
        });
        expect(deleted).toBeNull();
      },
    });
  });
});
