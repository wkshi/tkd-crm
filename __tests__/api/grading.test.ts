import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as gradingHandler from "@/app/api/grading/route";
import { cleanupTestData, createTestStudent } from "@/tests/helpers";

describe("考级 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/grading 创建考级记录", async () => {
    const student = await createTestStudent({ name: "考级学员" });

    await testApiHandler({
      appHandler: gradingHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            examDate: "2024-06-15",
            beltLevel: "yellow",
            certificateNo: "CERT-2024-001",
            notes: "表现优秀",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.studentId).toBe(student.id);
        expect(json.beltLevel).toBe("yellow");
        expect(json.certificateNo).toBe("CERT-2024-001");
        expect(json.notes).toBe("表现优秀");
      },
    });
  });

  it("GET /api/grading 查询所有考级记录", async () => {
    const student = await createTestStudent({ name: "考级学员A" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.grading.create({
      data: {
        studentId: student.id,
        examDate: new Date("2024-06-15"),
        beltLevel: "yellow",
      },
    });

    await testApiHandler({
      appHandler: gradingHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.gradings.length).toBeGreaterThanOrEqual(1);
        const grading = json.gradings.find(
          (g: { beltLevel: string; student: { name: string } }) =>
            g.beltLevel === "yellow" && g.student.name === "[test]考级学员A"
        );
        expect(grading).toBeDefined();
      },
    });
  });

  it("GET /api/grading?studentId= 按学员筛选", async () => {
    const studentA = await createTestStudent({ name: "学员A" });
    const studentB = await createTestStudent({ name: "学员B" });
    const { prisma } = await import("@/lib/prisma");
    await prisma.grading.create({
      data: { studentId: studentA.id, examDate: new Date(), beltLevel: "white" },
    });
    await prisma.grading.create({
      data: { studentId: studentB.id, examDate: new Date(), beltLevel: "yellow" },
    });

    await testApiHandler({
      appHandler: gradingHandler,
      url: `/api/grading?studentId=${studentA.id}`,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.gradings).toHaveLength(1);
        expect(json.gradings[0].studentId).toBe(studentA.id);
      },
    });
  });
});
