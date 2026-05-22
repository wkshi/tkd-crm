import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * 清理测试数据
 * 按依赖关系逆序删除，避免外键约束冲突
 */
export async function cleanupTestData() {
  await prisma.attendance.deleteMany();
  await prisma.grading.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.camp.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.coach.deleteMany();
}

/**
 * 创建测试学员
 */
export async function createTestStudent(data?: Partial<Prisma.StudentCreateInput>) {
  return prisma.student.create({
    data: {
      name: "测试学员",
      gender: "male",
      enrollmentDate: new Date(),
      remainingSessions: 20,
      status: "active",
      ...data,
    },
  });
}

/**
 * 创建测试教练
 */
export async function createTestCoach(data?: Partial<Prisma.CoachCreateInput>) {
  return prisma.coach.create({
    data: {
      name: "测试教练",
      gender: "male",
      joinDate: new Date(),
      status: "active",
      ...data,
    },
  });
}

/**
 * 创建测试课程
 */
export async function createTestCourse(data?: Partial<Prisma.CourseCreateInput>) {
  return prisma.course.create({
    data: {
      title: "测试课程",
      type: "regular",
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 90000000),
      location: "主训练馆",
      maxStudents: 30,
      ...data,
    },
  });
}
