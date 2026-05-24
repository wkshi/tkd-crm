import { prisma } from "@/lib/prisma";
import { Gender, Status, CoachStatus, BeltLevel } from "@prisma/client";

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

  // 按依赖顺序反向删除，只删除关联到测试数据的记录
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
    await prisma.camp.deleteMany({ where: { studentId: { in: testStudentIds } } });
    await prisma.competition.deleteMany({ where: { studentId: { in: testStudentIds } } });
    await prisma.grading.deleteMany({ where: { studentId: { in: testStudentIds } } });
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

export async function createTestStudent(data: Partial<{
  name: string;
  gender: Gender;
  remainingSessions: number;
  phone: string;
  status: Status;
}>) {
  const prefixedName = data.name ? `[test]${data.name}` : "[test]学员";
  return prisma.student.create({
    data: {
      name: prefixedName,
      gender: data.gender ?? Gender.male,
      remainingSessions: data.remainingSessions ?? 20,
      phone: data.phone ?? "13800138000",
      status: data.status ?? Status.active,
    },
  });
}

export async function createTestCoach(data: Partial<{
  name: string;
  gender: Gender;
  phone: string;
  status: CoachStatus;
}>) {
  const prefixedName = data.name ? `[test]${data.name}` : "[test]教练";
  return prisma.coach.create({
    data: {
      name: prefixedName,
      gender: data.gender ?? Gender.male,
      phone: data.phone ?? "13900139000",
      status: data.status ?? CoachStatus.active,
    },
  });
}

export async function createTestCourse(data: Partial<{
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  maxStudents: number;
  coachId?: string;
}>) {
  const startTime = data.startTime ?? new Date();
  const endTime = data.endTime ?? new Date(startTime.getTime() + 60 * 60 * 1000);
  const prefixedTitle = data.title ? `[test]${data.title}` : "[test]课程";

  return prisma.course.create({
    data: {
      title: prefixedTitle,
      startTime,
      endTime,
      location: data.location,
      maxStudents: data.maxStudents,
      coachId: data.coachId,
    },
  });
}

export async function createTestGrading(data: Partial<{
  studentId: string;
  examDate: Date;
  beltLevel: string;
  certificateNo: string;
  notes: string;
}>) {
  return prisma.grading.create({
    data: {
      studentId: data.studentId!,
      examDate: data.examDate ?? new Date(),
      beltLevel: (data.beltLevel as BeltLevel) ?? BeltLevel.white,
      certificateNo: data.certificateNo,
      notes: data.notes,
    },
  });
}

export async function createTestCompetition(data: Partial<{
  studentId: string;
  competitionDate: Date;
  competitionName: string;
  category: string;
  result: string;
  award: string;
}>) {
  return prisma.competition.create({
    data: {
      studentId: data.studentId!,
      competitionDate: data.competitionDate ?? new Date(),
      competitionName: data.competitionName ?? "测试比赛",
      category: data.category,
      result: data.result,
      award: data.award,
    },
  });
}

export async function createTestCamp(data: Partial<{
  studentId: string;
  activityDate: Date;
  activityName: string;
  location: string;
  duration: number;
  notes: string;
}>) {
  return prisma.camp.create({
    data: {
      studentId: data.studentId!,
      activityDate: data.activityDate ?? new Date(),
      activityName: data.activityName ?? "测试集训",
      location: data.location,
      duration: data.duration,
      notes: data.notes,
    },
  });
}
