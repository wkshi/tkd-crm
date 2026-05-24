import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * 清理测试数据
 * 按依赖关系逆序删除，避免外键约束冲突
 */
export async function cleanupTestData() {
  // 只清理测试数据（名称/标题以"[test]"开头），保留用户真实数据
  const testStudents = await prisma.student.findMany({
    where: { name: { startsWith: "[test]" } },
    select: { id: true },
  });
  const testStudentIds = testStudents.map((s) => s.id);

  const testCourses = await prisma.course.findMany({
    where: { title: { startsWith: "[test]" } },
    select: { id: true },
  });
  const testCourseIds = testCourses.map((c) => c.id);

  const testCoaches = await prisma.coach.findMany({
    where: { name: { startsWith: "[test]" } },
    select: { id: true },
  });
  const testCoachIds = testCoaches.map((c) => c.id);

  if (testStudentIds.length > 0 || testCourseIds.length > 0) {
    await prisma.attendance.deleteMany({
      where: {
        OR: [
          { studentId: { in: testStudentIds } },
          { courseId: { in: testCourseIds } },
        ],
      },
    });
  }
  if (testStudentIds.length > 0) {
    await prisma.grading.deleteMany({ where: { studentId: { in: testStudentIds } } });
    await prisma.competition.deleteMany({ where: { studentId: { in: testStudentIds } } });
    await prisma.camp.deleteMany({ where: { studentId: { in: testStudentIds } } });
  }
  if (testCourseIds.length > 0) {
    await prisma.course.deleteMany({ where: { id: { in: testCourseIds } } });
  }
  if (testStudentIds.length > 0) {
    await prisma.student.deleteMany({ where: { id: { in: testStudentIds } } });
  }
  if (testCoachIds.length > 0) {
    await prisma.coach.deleteMany({ where: { id: { in: testCoachIds } } });
  }
}

/**
 * 创建测试学员
 */
export async function createTestStudent(data?: Partial<Prisma.StudentCreateInput>) {
  const prefixedName = data?.name ? `[test]${data.name}` : "[test]学员";
  return prisma.student.create({
    data: {
      name: prefixedName,
      gender: "male",
      enrollmentDate: new Date(),
      remainingSessions: 20,
      status: "active",
      ...data,
      name: prefixedName,
    },
  });
}

/**
 * 创建测试教练
 */
export async function createTestCoach(data?: Partial<Prisma.CoachCreateInput>) {
  const prefixedName = data?.name ? `[test]${data.name}` : "[test]教练";
  return prisma.coach.create({
    data: {
      name: prefixedName,
      gender: "male",
      joinDate: new Date(),
      status: "active",
      ...data,
      name: prefixedName,
    },
  });
}

/**
 * 创建测试课程
 */
export async function createTestCourse(data?: Partial<Prisma.CourseCreateInput>) {
  const prefixedTitle = data?.title ? `[test]${data.title}` : "[test]课程";
  return prisma.course.create({
    data: {
      title: prefixedTitle,
      type: "regular",
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 90000000),
      location: "主训练馆",
      maxStudents: 30,
      ...data,
      title: prefixedTitle,
    },
  });
}
