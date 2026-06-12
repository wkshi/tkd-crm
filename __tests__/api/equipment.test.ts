import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { testApiHandler } from "next-test-api-route-handler";
import { EquipmentCategory, Status } from "@prisma/client";
import * as equipmentListHandler from "@/app/api/equipment/route";
import * as equipmentDetailHandler from "@/app/api/equipment/[id]/route";
import { cleanupTestData, createTestEquipment } from "@/tests/helpers";

describe("装备库存 API", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  it("POST /api/equipment 创建装备", async () => {
    await testApiHandler({
      appHandler: equipmentListHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "跆拳道护具",
            category: "gear",
            specification: "L 码",
            currentStock: 20,
            minStock: 5,
            status: "active",
            remark: "测试装备",
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("跆拳道护具");
        expect(json.category).toBe("gear");
        expect(json.specification).toBe("L 码");
        expect(json.currentStock).toBe(20);
        expect(json.minStock).toBe(5);
        expect(json.status).toBe("active");
        expect(json.remark).toBe("测试装备");
      },
    });
  });

  it("GET /api/equipment 查询装备列表", async () => {
    await createTestEquipment({ name: "护具A" });
    await createTestEquipment({ name: "护具B" });

    await testApiHandler({
      appHandler: equipmentListHandler,
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.equipment.length).toBeGreaterThanOrEqual(2);
        expect(json.total).toBeGreaterThanOrEqual(2);
      },
    });
  });

  it("GET /api/equipment?search= 支持搜索", async () => {
    await createTestEquipment({ name: "搜索目标" });
    await createTestEquipment({ name: "其他装备" });

    await testApiHandler({
      appHandler: equipmentListHandler,
      url: "/api/equipment?search=搜索",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.equipment.length).toBeGreaterThanOrEqual(1);
        expect(
          json.equipment.some(
            (e: { name: string }) => e.name === "[test]搜索目标"
          )
        ).toBe(true);
      },
    });
  });

  it("GET /api/equipment?category= 支持类型筛选", async () => {
    await createTestEquipment({
      name: "道服A",
      category: EquipmentCategory.uniform,
    });
    await createTestEquipment({
      name: "护具B",
      category: EquipmentCategory.gear,
    });

    await testApiHandler({
      appHandler: equipmentListHandler,
      url: "/api/equipment?category=gear",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.equipment.length).toBeGreaterThanOrEqual(1);
        expect(
          json.equipment.every((e: { category: string }) => e.category === "gear")
        ).toBe(true);
      },
    });
  });

  it("GET /api/equipment?status= 支持状态筛选", async () => {
    await createTestEquipment({ name: "活跃装备", status: Status.active });
    await createTestEquipment({ name: "停用装备", status: Status.inactive });

    await testApiHandler({
      appHandler: equipmentListHandler,
      url: "/api/equipment?status=active",
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(json.equipment.length).toBeGreaterThanOrEqual(1);
        expect(
          json.equipment.every((e: { status: string }) => e.status === "active")
        ).toBe(true);
      },
    });
  });

  it("GET /api/equipment/[id] 获取装备详情", async () => {
    const item = await createTestEquipment({ name: "详情装备" });

    await testApiHandler({
      appHandler: equipmentDetailHandler,
      params: { id: item.id },
      test: async ({ fetch }) => {
        const res = await fetch();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("[test]详情装备");
        expect(json.id).toBe(item.id);
      },
    });
  });

  it("GET /api/equipment/[id] 不存在返回 404", async () => {
    await testApiHandler({
      appHandler: equipmentDetailHandler,
      params: { id: "non-existent-id" },
      test: async ({ fetch }) => {
        const res = await fetch();
        expect(res.status).toBe(404);
      },
    });
  });

  it("PUT /api/equipment/[id] 更新装备基本信息（不直接修改库存）", async () => {
    const item = await createTestEquipment({ name: "更新前" });

    await testApiHandler({
      appHandler: equipmentDetailHandler,
      params: { id: item.id },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "更新后",
            category: "belt",
            minStock: 3,
          }),
        });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.name).toBe("更新后");
        expect(json.category).toBe("belt");
        // 库存不能直接通过 PUT 修改，应保持原值
        expect(json.currentStock).toBe(item.currentStock);
        expect(json.minStock).toBe(3);
      },
    });
  });

  it("DELETE /api/equipment/[id] 软删除装备", async () => {
    const item = await createTestEquipment({ name: "待删除" });

    await testApiHandler({
      appHandler: equipmentDetailHandler,
      params: { id: item.id },
      test: async ({ fetch }) => {
        const res = await fetch({ method: "DELETE" });
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);

        const { prisma } = await import("@/lib/prisma");
        const deleted = await prisma.equipment.findUnique({
          where: { id: item.id },
        });
        expect(deleted?.status).toBe("inactive");
      },
    });
  });
});
