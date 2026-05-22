import { describe, it, expect } from "vitest";

/**
 * Prisma Client 单例模式验证
 * 确保开发环境下模块热重载不会导致多实例化
 */
describe("Prisma Client 单例", () => {
  it("多次导入返回同一实例", async () => {
    const { prisma: prisma1 } = await import("@/lib/prisma");
    const { prisma: prisma2 } = await import("@/lib/prisma");
    expect(prisma1).toBe(prisma2);
  });

  it("Prisma 实例具有预期的模型方法", async () => {
    const { prisma } = await import("@/lib/prisma");
    expect(prisma.student).toBeDefined();
    expect(prisma.coach).toBeDefined();
    expect(prisma.course).toBeDefined();
    expect(prisma.attendance).toBeDefined();
    expect(prisma.grading).toBeDefined();
    expect(prisma.competition).toBeDefined();
    expect(prisma.camp).toBeDefined();
  });

  it("Prisma 实例支持事务方法", async () => {
    const { prisma } = await import("@/lib/prisma");
    expect(prisma.$transaction).toBeDefined();
    expect(typeof prisma.$transaction).toBe("function");
  });
});
