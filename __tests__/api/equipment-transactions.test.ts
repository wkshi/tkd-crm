import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import * as transactionsHandler from "@/app/api/equipment/transactions/route";
import * as equipmentTransactionsHandler from "@/app/api/equipment/[id]/transactions/route";
import {
  cleanupTestData,
  createTestEquipment,
  createTestStudent,
  createTestCoach,
} from "@/tests/helpers";

describe("装备出入库流水 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/equipment/transactions 入库增加库存", async () => {
    const equipment = await createTestEquipment({
      name: "入库测试",
      currentStock: 10,
    });

    await testApiHandler({
      appHandler: transactionsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "in",
            quantity: 5,
            reason: "采购入库",
            operator: "管理员",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.type).toBe("in");
        expect(json.quantity).toBe(5);

        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.equipment.findUnique({
          where: { id: equipment.id },
        });
        expect(updated?.currentStock).toBe(15);
      },
    });
  });

  it("POST /api/equipment/transactions 出库减少库存", async () => {
    const equipment = await createTestEquipment({
      name: "出库测试",
      currentStock: 10,
    });

    await testApiHandler({
      appHandler: transactionsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "out",
            quantity: 3,
            reason: "学员领用",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.type).toBe("out");

        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.equipment.findUnique({
          where: { id: equipment.id },
        });
        expect(updated?.currentStock).toBe(7);
      },
    });
  });

  it("POST /api/equipment/transactions 出库超额返回 400", async () => {
    const equipment = await createTestEquipment({
      name: "超额出库",
      currentStock: 2,
    });

    await testApiHandler({
      appHandler: transactionsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "out",
            quantity: 5,
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toContain("库存不足");
      },
    });
  });

  it("POST /api/equipment/transactions 盘点调整可正可负", async () => {
    const equipment = await createTestEquipment({
      name: "盘点调整",
      currentStock: 10,
    });

    await testApiHandler({
      appHandler: transactionsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "adjust",
            quantity: -2,
            reason: "盘点盈亏",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.type).toBe("adjust");

        const { prisma } = await import("@/lib/prisma");
        const updated = await prisma.equipment.findUnique({
          where: { id: equipment.id },
        });
        expect(updated?.currentStock).toBe(8);
      },
    });
  });

  it("POST /api/equipment/transactions 盘点调整后库存不能为负", async () => {
    const equipment = await createTestEquipment({
      name: "负库存盘点",
      currentStock: 5,
    });

    await testApiHandler({
      appHandler: transactionsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "adjust",
            quantity: -10,
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toContain("不能为负");
      },
    });
  });

  it("POST /api/equipment/transactions 可关联学员与教练", async () => {
    const equipment = await createTestEquipment({
      name: "关联测试",
      currentStock: 10,
    });
    const student = await createTestStudent({ name: "领用学员" });
    const coach = await createTestCoach({ name: "经办教练" });

    await testApiHandler({
      appHandler: transactionsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "out",
            quantity: 1,
            relatedStudentId: student.id,
            relatedCoachId: coach.id,
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.relatedStudentId).toBe(student.id);
        expect(json.relatedCoachId).toBe(coach.id);
      },
    });
  });

  it("GET /api/equipment/transactions 查询流水列表", async () => {
    const equipment = await createTestEquipment({ currentStock: 0 });

    await testApiHandler({
      appHandler: transactionsHandler,
      test: async ({ fetch }) => {
        // 先创建两条流水
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "in",
            quantity: 5,
          }),
        });
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "in",
            quantity: 3,
          }),
        });

        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.transactions.length).toBeGreaterThanOrEqual(2);
        expect(json.total).toBeGreaterThanOrEqual(2);
      },
    });
  });

  it("GET /api/equipment/[id]/transactions 查询指定装备流水", async () => {
    const equipment = await createTestEquipment({ currentStock: 0 });

    await testApiHandler({
      appHandler: transactionsHandler,
      test: async ({ fetch }) => {
        await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            equipmentId: equipment.id,
            type: "in",
            quantity: 5,
          }),
        });
      },
    });

    await testApiHandler({
      appHandler: equipmentTransactionsHandler,
      params: { id: equipment.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.transactions.length).toBeGreaterThanOrEqual(1);
        expect(json.transactions.every((t: { equipmentId: string }) => t.equipmentId === equipment.id)).toBe(true);
      },
    });
  });
});
