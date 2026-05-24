import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as campHandler from "@/app/api/camp/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("集训 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/camp 创建集训记录", async () => {
    const student = await createTestStudent({ name: "集训学员" });

    await testApiHandler({
      appHandler: campHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            activityDate: "2024-07-10",
            activityName: "暑期特训营",
            location: "郊外基地",
            duration: 3,
            notes: "包含体能和战术训练",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.studentId).toBe(student.id);
        expect(json.activityName).toBe("暑期特训营");
        expect(json.location).toBe("郊外基地");
        expect(json.duration).toBe(3);
        expect(json.notes).toBe("包含体能和战术训练");
      },
    });
  });

  it("GET /api/camp 查询所有集训记录", async () => {
    const student = await createTestStudent({ name: "集训学员A" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.camp.create({
      data: {
        studentId: student.id,
        activityDate: new Date("2024-07-10"),
        activityName: "测试集训",
      },
    });

    await testApiHandler({
      appHandler: campHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.camps.length).toBeGreaterThanOrEqual(1);
        const camp = json.camps.find((c: { activityName: string }) => c.activityName === "测试集训");
        expect(camp).toBeDefined();
        expect(camp.student.name).toBe("[test]集训学员A");
      },
    });
  });

  it("GET /api/camp?studentId= 按学员筛选", async () => {
    const studentA = await createTestStudent({ name: "学员A" });
    const studentB = await createTestStudent({ name: "学员B" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.camp.create({
      data: { studentId: studentA.id, activityDate: new Date(), activityName: "A集训" },
    });
    await prisma.camp.create({
      data: { studentId: studentB.id, activityDate: new Date(), activityName: "B集训" },
    });

    await testApiHandler({
      appHandler: campHandler,
      url: `/api/camp?studentId=${studentA.id}`,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.camps).toHaveLength(1);
        expect(json.camps[0].studentId).toBe(studentA.id);
      },
    });
  });
});
