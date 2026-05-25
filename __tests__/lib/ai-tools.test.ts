import { describe, it, expect, beforeEach, afterAll } from "vitest";
import type { ToolExecutionOptions } from "ai";
import type { Class, Course } from "@prisma/client";
import { cleanupTestData } from "@/tests/helpers";
import {
  listClasses,
  createClass,
  updateClass,
  createCourse,
  updateCourse,
  listCourses,
} from "@/lib/ai-tools";

const mockOptions: ToolExecutionOptions = { toolCallId: "test", messages: [] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function execTool<T>(tool: { execute?: (...args: any[]) => any }, input: any): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (tool.execute as any)(input, mockOptions);
  return result as T;
}

describe("AI 工具", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await (await import("@/lib/prisma")).prisma.$disconnect();
  });

  describe("班级工具", () => {
    it("createClass 创建班级", async () => {
      const result = await execTool<Class>(createClass, {
        name: "[test]新班级", level: "白带", maxStudents: 20, status: "active",
      });
      expect(result.name).toBe("[test]新班级");
      expect(result.level).toBe("白带");
      expect(result.maxStudents).toBe(20);
      expect(result.status).toBe("active");
    });

    it("listClasses 查询班级列表", async () => {
      await execTool<Class>(createClass, { name: "[test]班级A", maxStudents: 30, status: "active" });
      await execTool<Class>(createClass, { name: "[test]班级B", maxStudents: 30, status: "active" });

      const result = await execTool<{ classes: (Class & { _count: { students: number; courses: number } })[]; total: number; page: number; pageSize: number }>(listClasses, { page: 1, pageSize: 10 });
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.classes.length).toBeGreaterThanOrEqual(2);
    });

    it("listClasses 支持搜索", async () => {
      await execTool<Class>(createClass, { name: "[test]搜索目标", maxStudents: 30, status: "active" });
      await execTool<Class>(createClass, { name: "[test]其他班级", maxStudents: 30, status: "active" });

      const result = await execTool<{ classes: (Class & { _count: { students: number; courses: number } })[]; total: number; page: number; pageSize: number }>(listClasses, { search: "搜索", page: 1, pageSize: 10 });
      expect(result.classes.length).toBeGreaterThanOrEqual(1);
      expect(result.classes.some((c) => c.name === "[test]搜索目标")).toBe(true);
    });

    it("listClasses 支持状态筛选", async () => {
      await execTool<Class>(createClass, { name: "[test]活跃班级", maxStudents: 30, status: "active" });
      await execTool<Class>(createClass, { name: "[test]停用班级", maxStudents: 30, status: "inactive" });

      const result = await execTool<{ classes: (Class & { _count: { students: number; courses: number } })[]; total: number; page: number; pageSize: number }>(listClasses, { status: "active", page: 1, pageSize: 10 });
      expect(result.classes.every((c) => c.status === "active")).toBe(true);
    });

    it("updateClass 更新班级信息", async () => {
      const cls = await execTool<Class>(createClass, { name: "[test]更新前", maxStudents: 30, status: "active" });
      const result = await execTool<Class>(updateClass, {
        id: cls.id, name: "[test]更新后", level: "黄带", maxStudents: 15, status: "active",
      });
      expect(result.name).toBe("[test]更新后");
      expect(result.level).toBe("黄带");
      expect(result.maxStudents).toBe(15);
    });
  });

  describe("课程工具 - 班级状态校验", () => {
    it("createCourse 关联活动状态班级成功", async () => {
      const cls = await execTool<Class>(createClass, { name: "[test]活动班级", maxStudents: 30, status: "active" });
      const startTime = new Date(Date.now() + 86400000).toISOString();
      const endTime = new Date(Date.now() + 90000000).toISOString();

      const result = await execTool<Course>(createCourse, {
        classId: cls.id, startTime, endTime, location: "主训练馆", maxStudents: 30,
      });

      expect(result.classId).toBe(cls.id);
      expect(result.title).toContain("[test]活动班级");
    });

    it("createCourse 关联非活动状态班级失败", async () => {
      const cls = await execTool<Class>(createClass, { name: "[test]停用班级", maxStudents: 30, status: "inactive" });
      const startTime = new Date(Date.now() + 86400000).toISOString();
      const endTime = new Date(Date.now() + 90000000).toISOString();

      const result = await execTool<{ error: string }>(createCourse, {
        classId: cls.id, startTime, endTime, location: "主训练馆", maxStudents: 30,
      });

      expect(result.error).toContain("停用");
    });

    it("createCourse 关联 suspended 班级失败", async () => {
      const cls = await execTool<Class>(createClass, { name: "[test]暂停班级", maxStudents: 30, status: "suspended" });
      const startTime = new Date(Date.now() + 86400000).toISOString();
      const endTime = new Date(Date.now() + 90000000).toISOString();

      const result = await execTool<{ error: string }>(createCourse, {
        classId: cls.id, startTime, endTime, location: "主训练馆", maxStudents: 30,
      });

      expect(result).toHaveProperty("error");
    });

    it("updateCourse 更换为活动状态班级成功", async () => {
      const activeClass = await execTool<Class>(createClass, { name: "[test]活动班级", maxStudents: 30, status: "active" });
      const course = await execTool<Course>(createCourse, {
        classId: activeClass.id,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        maxStudents: 30,
      });

      const newActiveClass = await execTool<Class>(createClass, { name: "[test]新活动班级", maxStudents: 30, status: "active" });
      const result = await execTool<Course>(updateCourse, { id: course.id, classId: newActiveClass.id });

      expect(result.classId).toBe(newActiveClass.id);
    });

    it("updateCourse 更换为非活动状态班级失败", async () => {
      const activeClass = await execTool<Class>(createClass, { name: "[test]活动班级", maxStudents: 30, status: "active" });
      const course = await execTool<Course>(createCourse, {
        classId: activeClass.id,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        maxStudents: 30,
      });

      const inactiveClass = await execTool<Class>(createClass, { name: "[test]停用班级", maxStudents: 30, status: "inactive" });
      const result = await execTool<{ error: string }>(updateCourse, { id: course.id, classId: inactiveClass.id });

      expect(result).toHaveProperty("error");
    });

    it("updateCourse 不更换班级时不校验", async () => {
      const activeClass = await execTool<Class>(createClass, { name: "[test]活动班级", maxStudents: 30, status: "active" });
      const course = await execTool<Course>(createCourse, {
        classId: activeClass.id,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        maxStudents: 30,
      });

      const result = await execTool<Course>(updateCourse, { id: course.id, location: "副训练馆" });

      expect(result).not.toHaveProperty("error");
      expect(result.location).toBe("副训练馆");
    });
  });

  describe("课程工具 - 列表查询", () => {
    it("listCourses 支持班级筛选", async () => {
      const cls = await execTool<Class>(createClass, { name: "[test]筛选班级", maxStudents: 30, status: "active" });
      await execTool<Course>(createCourse, {
        classId: cls.id,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        maxStudents: 30,
      });

      const result = await execTool<{ courses: (Course & { coach: { id: string; name: string } | null })[]; total: number; page: number; pageSize: number }>(listCourses, { page: 1, pageSize: 10 });
      expect(result.total).toBeGreaterThanOrEqual(1);
    });
  });
});
