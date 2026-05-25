import { describe, it, expect, beforeEach, afterAll } from "vitest";
import type { ToolExecutionOptions } from "ai";
import type { Class, Course } from "@prisma/client";
import { cleanupTestData } from "@/tests/helpers";
import {
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  createCourse,
  updateCourse,
  listCourses,
  deleteCoach,
  createRecharge,
  searchRecharges,
  createGrading,
  updateGrading,
  deleteGrading,
  searchGradings,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  searchCompetitions,
  createCamp,
  updateCamp,
  deleteCamp,
  searchCamps,
} from "@/lib/ai-tools";
import { createTestStudent, createTestCoach } from "@/tests/helpers"; 
import type { Grading, Competition, Camp, Recharge } from "@prisma/client";

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


  describe("教练工具", () => {
    it("deleteCoach 软删除教练", async () => {
      const coach = await createTestCoach({ name: "待删除教练" });
      const result = await execTool<{ success: boolean; message: string }>(deleteCoach, { id: coach.id });
      expect(result.success).toBe(true);

      const updated = await (await import("@/lib/prisma")).prisma.coach.findUnique({ where: { id: coach.id } });
      expect(updated?.status).toBe("inactive");
    });
  });

  describe("班级工具 - 删除", () => {
    it("deleteClass 删除班级", async () => {
      const cls = await execTool<Class>(createClass, { name: "[test]待删除班级", maxStudents: 30, status: "active" });
      await execTool<{ success: boolean; message: string }>(deleteClass, { id: cls.id });

      const deleted = await (await import("@/lib/prisma")).prisma.class.findUnique({ where: { id: cls.id } });
      expect(deleted).toBeNull();
    });
  });

  describe("充值工具", () => {
    it("createRecharge 创建充值记录并更新学员课时", async () => {
      const student = await createTestStudent({ name: "充值学员", remainingSessions: 10 });
      const result = await execTool<Recharge>(createRecharge, {
        studentId: student.id,
        action: "increment",
        sessions: 20,
        durationDays: 90,
        notes: "季度卡续费",
      });
      expect(result.studentId).toBe(student.id);
      expect(result.action).toBe("increment");
      expect(result.sessions).toBe(20);

      const updated = await (await import("@/lib/prisma")).prisma.student.findUnique({ where: { id: student.id } });
      expect(updated?.remainingSessions).toBe(30);
    });

    it("searchRecharges 查询充值记录", async () => {
      const student = await createTestStudent({ name: "查询充值学员" });
      await execTool<Recharge>(createRecharge, {
        studentId: student.id,
        action: "increment",
        sessions: 10,
        durationDays: 30,
      });

      const result = await execTool<{ recharges: Recharge[]; total: number; page: number; pageSize: number }>(searchRecharges, { page: 1, pageSize: 10 });
      expect(result.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe("考级工具", () => {
    it("createGrading 创建考级记录", async () => {
      const student = await createTestStudent({ name: "考级学员" });
      const result = await execTool<Grading>(createGrading, {
        studentId: student.id,
        examDate: new Date().toISOString(),
        beltLevel: "yellow",
        notes: "通过",
      });
      expect(result.studentId).toBe(student.id);
      expect(result.beltLevel).toBe("yellow");
    });

    it("updateGrading 更新考级记录", async () => {
      const student = await createTestStudent({ name: "更新考级学员" });
      const grading = await execTool<Grading>(createGrading, {
        studentId: student.id,
        examDate: new Date().toISOString(),
        beltLevel: "white",
      });
      const result = await execTool<Grading>(updateGrading, {
        id: grading.id,
        beltLevel: "yellow",
        notes: "晋级",
      });
      expect(result.beltLevel).toBe("yellow");
      expect(result.notes).toBe("晋级");
    });

    it("deleteGrading 删除考级记录", async () => {
      const student = await createTestStudent({ name: "删除考级学员" });
      const grading = await execTool<Grading>(createGrading, {
        studentId: student.id,
        examDate: new Date().toISOString(),
        beltLevel: "white",
      });
      await execTool<{ success: boolean; message: string }>(deleteGrading, { id: grading.id });

      const deleted = await (await import("@/lib/prisma")).prisma.grading.findUnique({ where: { id: grading.id } });
      expect(deleted).toBeNull();
    });

    it("searchGradings 查询考级记录", async () => {
      const student = await createTestStudent({ name: "查询考级学员" });
      await execTool<Grading>(createGrading, {
        studentId: student.id,
        examDate: new Date().toISOString(),
        beltLevel: "yellow",
      });

      const result = await execTool<{ gradings: Grading[]; total: number; page: number; pageSize: number }>(searchGradings, { page: 1, pageSize: 10 });
      expect(result.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe("比赛工具", () => {
    it("createCompetition 创建比赛记录", async () => {
      const student = await createTestStudent({ name: "比赛学员" });
      const result = await execTool<Competition>(createCompetition, {
        studentId: student.id,
        competitionDate: new Date().toISOString(),
        competitionName: "市级跆拳道锦标赛",
        category: "个人品势",
        result: "第一名",
      });
      expect(result.studentId).toBe(student.id);
      expect(result.competitionName).toBe("市级跆拳道锦标赛");
    });

    it("updateCompetition 更新比赛记录", async () => {
      const student = await createTestStudent({ name: "更新比赛学员" });
      const comp = await execTool<Competition>(createCompetition, {
        studentId: student.id,
        competitionDate: new Date().toISOString(),
        competitionName: "旧名称",
      });
      const result = await execTool<Competition>(updateCompetition, {
        id: comp.id,
        competitionName: "新名称",
        result: "冠军",
      });
      expect(result.competitionName).toBe("新名称");
      expect(result.result).toBe("冠军");
    });

    it("deleteCompetition 删除比赛记录", async () => {
      const student = await createTestStudent({ name: "删除比赛学员" });
      const comp = await execTool<Competition>(createCompetition, {
        studentId: student.id,
        competitionDate: new Date().toISOString(),
        competitionName: "待删除",
      });
      await execTool<{ success: boolean; message: string }>(deleteCompetition, { id: comp.id });

      const deleted = await (await import("@/lib/prisma")).prisma.competition.findUnique({ where: { id: comp.id } });
      expect(deleted).toBeNull();
    });

    it("searchCompetitions 查询比赛记录", async () => {
      const student = await createTestStudent({ name: "查询比赛学员" });
      await execTool<Competition>(createCompetition, {
        studentId: student.id,
        competitionDate: new Date().toISOString(),
        competitionName: "搜索目标比赛",
      });

      const result = await execTool<{ competitions: Competition[]; total: number; page: number; pageSize: number }>(searchCompetitions, { search: "搜索目标", page: 1, pageSize: 10 });
      expect(result.competitions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("集训工具", () => {
    it("createCamp 创建集训记录", async () => {
      const student = await createTestStudent({ name: "集训学员" });
      const result = await execTool<Camp>(createCamp, {
        studentId: student.id,
        activityDate: new Date().toISOString(),
        activityName: "暑期集训营",
        duration: 40,
        location: "主训练馆",
      });
      expect(result.studentId).toBe(student.id);
      expect(result.activityName).toBe("暑期集训营");
    });

    it("updateCamp 更新集训记录", async () => {
      const student = await createTestStudent({ name: "更新集训学员" });
      const camp = await execTool<Camp>(createCamp, {
        studentId: student.id,
        activityDate: new Date().toISOString(),
        activityName: "旧名称",
        duration: 20,
      });
      const result = await execTool<Camp>(updateCamp, {
        id: camp.id,
        activityName: "新名称",
        duration: 30,
      });
      expect(result.activityName).toBe("新名称");
      expect(result.duration).toBe(30);
    });

    it("deleteCamp 删除集训记录", async () => {
      const student = await createTestStudent({ name: "删除集训学员" });
      const camp = await execTool<Camp>(createCamp, {
        studentId: student.id,
        activityDate: new Date().toISOString(),
        activityName: "待删除",
        duration: 20,
      });
      await execTool<{ success: boolean; message: string }>(deleteCamp, { id: camp.id });

      const deleted = await (await import("@/lib/prisma")).prisma.camp.findUnique({ where: { id: camp.id } });
      expect(deleted).toBeNull();
    });

    it("searchCamps 查询集训记录", async () => {
      const student = await createTestStudent({ name: "查询集训学员" });
      await execTool<Camp>(createCamp, {
        studentId: student.id,
        activityDate: new Date().toISOString(),
        activityName: "搜索目标集训",
        duration: 20,
      });

      const result = await execTool<{ camps: Camp[]; total: number; page: number; pageSize: number }>(searchCamps, { search: "搜索目标", page: 1, pageSize: 10 });
      expect(result.camps.length).toBeGreaterThanOrEqual(1);
    });
  });
