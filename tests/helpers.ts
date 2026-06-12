import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * 清理测试数据
 */
export async function cleanupTestData() {
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

  const testClasses = await prisma.class.findMany({
    where: { name: { startsWith: "[test]" } },
    select: { id: true },
  });
  const testClassIds = testClasses.map((c) => c.id);

  const testEquipment = await prisma.equipment.findMany({
    where: { name: { startsWith: "[test]" } },
    select: { id: true },
  });
  const testEquipmentIds = testEquipment.map((e) => e.id);

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
  if (testClassIds.length > 0) {
    await prisma.class.deleteMany({ where: { id: { in: testClassIds } } });
  }
  if (testEquipmentIds.length > 0) {
    await prisma.equipment.deleteMany({ where: { id: { in: testEquipmentIds } } });
  }
}

export async function createTestStudent(data?: Partial<Prisma.StudentCreateInput>) {
  const prefixedName = data?.name ? `[test]${data.name}` : "[test]学员";
  const base: Prisma.StudentCreateInput = {
    name: prefixedName,
    gender: "male",
    enrollmentDate: new Date(),
    remainingSessions: 20,
    status: "active",
  };
  return prisma.student.create({
    data: { ...base, ...data, name: prefixedName },
  });
}

export async function createTestCoach(data?: Partial<Prisma.CoachCreateInput>) {
  const prefixedName = data?.name ? `[test]${data.name}` : "[test]教练";
  const base: Prisma.CoachCreateInput = {
    name: prefixedName,
    gender: "male",
    joinDate: new Date(),
    status: "active",
  };
  return prisma.coach.create({
    data: { ...base, ...data, name: prefixedName },
  });
}

export async function createTestClass(data?: Partial<Prisma.ClassCreateInput>) {
  const prefixedName = data?.name ? `[test]${data.name}` : "[test]班级";
  const base: Prisma.ClassCreateInput = {
    name: prefixedName,
    maxStudents: 30,
    status: "active",
  };
  return prisma.class.create({
    data: { ...base, ...data, name: prefixedName },
  });
}

export async function createTestEquipment(data?: Partial<Prisma.EquipmentCreateInput>) {
  const prefixedName = data?.name ? `[test]${data.name}` : "[test]装备";
  const base: Prisma.EquipmentCreateInput = {
    name: prefixedName,
    category: "gear",
    currentStock: 10,
    minStock: 2,
    status: "active",
  };
  return prisma.equipment.create({
    data: { ...base, ...data, name: prefixedName },
  });
}

export async function createTestCourse(data?: Partial<Prisma.CourseUncheckedCreateInput>) {
  const prefixedTitle = data?.title ? `[test]${data.title}` : "[test]课程";

  let classId = data?.classId;
  if (!classId) {
    const testClass = await createTestClass();
    classId = testClass.id;
  }

  const base: Prisma.CourseUncheckedCreateInput = {
    title: prefixedTitle,
    startTime: new Date(Date.now() + 86400000),
    endTime: new Date(Date.now() + 90000000),
    location: "主训练馆",
    maxStudents: 30,
    classId,
  };

  return prisma.course.create({
    data: { ...base, ...data, title: prefixedTitle, classId },
  });
}
