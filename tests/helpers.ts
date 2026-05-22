import { prisma } from "@/lib/prisma";
import { Gender, Status, CoachStatus } from "@prisma/client";

export async function cleanupTestData() {
  // 清理所有测试数据（按依赖顺序反向删除）
  await prisma.attendance.deleteMany({});
  await prisma.camp.deleteMany({});
  await prisma.competition.deleteMany({});
  await prisma.grading.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.coach.deleteMany({});
}

export async function createTestStudent(data: Partial<{
  name: string;
  gender: Gender;
  remainingSessions: number;
  phone: string;
  status: Status;
}>) {
  return prisma.student.create({
    data: {
      name: data.name ?? "测试学员",
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
  return prisma.coach.create({
    data: {
      name: data.name ?? "测试教练",
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

  return prisma.course.create({
    data: {
      title: data.title ?? "测试课程",
      startTime,
      endTime,
      location: data.location,
      maxStudents: data.maxStudents,
      coachId: data.coachId,
    },
  });
}
