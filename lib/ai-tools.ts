import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { tool, zodSchema } from "ai";
import { z } from "zod";

// AI 工具函数封装，所有操作通过 Prisma 直接访问数据库

export const searchStudents = tool({
  description: "搜索学员列表，支持按姓名搜索、状态筛选和分页",
  inputSchema: zodSchema(
    z.object({
      search: z.string().optional().describe("搜索关键词（姓名）"),
      status: z.enum(["active", "inactive", "suspended"]).optional().describe("学员状态筛选"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ search, status, page, pageSize }) => {
    const where: Prisma.StudentWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.student.count({ where }),
    ]);
    return { students, total, page, pageSize };
  },
});

export const getStudentDetail = tool({
  description: "获取单个学员的详细信息，包括考级、比赛、营地和考勤记录",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("学员 ID"),
    })
  ),
  execute: async ({ id }) => {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        gradings: { orderBy: { examDate: "desc" } },
        competitions: { orderBy: { competitionDate: "desc" } },
        camps: { orderBy: { activityDate: "desc" } },
        attendances: {
          orderBy: { attendanceDate: "desc" },
          take: 10,
          include: { course: { select: { title: true } } },
        },
      },
    });
    if (!student) return { error: "学员不存在" };
    return student;
  },
});

export const createStudent = tool({
  description: "创建新学员",
  inputSchema: zodSchema(
    z.object({
      name: z.string().min(1).describe("姓名"),
      gender: z.enum(["male", "female"]).describe("性别"),
      birthDate: z.string().optional().describe("出生日期（ISO 字符串）"),
      idCard: z.string().optional().describe("身份证号"),
      phone: z.string().optional().describe("电话"),
      enrollmentDate: z.string().optional().describe("入学日期（ISO 字符串）"),
      remainingSessions: z.number().default(0).describe("剩余课时"),
      expiryDate: z.string().optional().describe("到期日期（ISO 字符串）"),
      status: z.enum(["active", "inactive", "suspended"]).default("active").describe("状态"),
    })
  ),
  execute: async (data) => {
    const student = await prisma.student.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        enrollmentDate: data.enrollmentDate
          ? new Date(data.enrollmentDate)
          : new Date(),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });
    return student;
  },
});

export const updateStudent = tool({
  description: "更新学员信息",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("学员 ID"),
      name: z.string().min(1).optional().describe("姓名"),
      gender: z.enum(["male", "female"]).optional().describe("性别"),
      birthDate: z.string().optional().describe("出生日期（ISO 字符串）"),
      idCard: z.string().optional().describe("身份证号"),
      phone: z.string().optional().describe("电话"),
      enrollmentDate: z.string().optional().describe("入学日期（ISO 字符串）"),
      remainingSessions: z.number().optional().describe("剩余课时"),
      expiryDate: z.string().optional().describe("到期日期（ISO 字符串）"),
      status: z.enum(["active", "inactive", "suspended"]).optional().describe("状态"),
    })
  ),
  execute: async ({ id, ...data }) => {
    const student = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        enrollmentDate: data.enrollmentDate
          ? new Date(data.enrollmentDate)
          : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });
    return student;
  },
});

export const deleteStudent = tool({
  description: "删除（软删除）学员，将状态设为 inactive",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("学员 ID"),
    })
  ),
  execute: async ({ id }) => {
    await prisma.student.update({
      where: { id },
      data: { status: "inactive" },
    });
    return { success: true, message: "学员已删除" };
  },
});

export const searchCoaches = tool({
  description: "搜索教练列表，支持按姓名搜索、状态筛选和分页",
  inputSchema: zodSchema(
    z.object({
      search: z.string().optional().describe("搜索关键词（姓名）"),
      status: z.enum(["active", "inactive", "on_leave"]).optional().describe("教练状态筛选"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ search, status, page, pageSize }) => {
    const where: Prisma.CoachWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }
    const [coaches, total] = await Promise.all([
      prisma.coach.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.coach.count({ where }),
    ]);
    return { coaches, total, page, pageSize };
  },
});

export const getCoachDetail = tool({
  description: "获取单个教练的详细信息，包含所授课程",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("教练 ID"),
    })
  ),
  execute: async ({ id }) => {
    const coach = await prisma.coach.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: { startTime: "desc" },
          take: 20,
        },
      },
    });
    if (!coach) return { error: "教练不存在" };
    return coach;
  },
});

export const createCoach = tool({
  description: "创建新教练",
  inputSchema: zodSchema(
    z.object({
      name: z.string().min(1).describe("姓名"),
      gender: z.enum(["male", "female"]).describe("性别"),
      birthDate: z.string().optional().describe("出生日期（ISO 字符串）"),
      idCard: z.string().optional().describe("身份证号"),
      phone: z.string().optional().describe("电话"),
      joinDate: z.string().optional().describe("入职日期（ISO 字符串）"),
      bio: z.string().optional().describe("简介"),
      status: z.enum(["active", "inactive", "on_leave"]).default("active").describe("状态"),
    })
  ),
  execute: async (data) => {
    const coach = await prisma.coach.create({
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
      },
    });
    return coach;
  },
});

export const updateCoach = tool({
  description: "更新教练信息",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("教练 ID"),
      name: z.string().min(1).optional().describe("姓名"),
      gender: z.enum(["male", "female"]).optional().describe("性别"),
      birthDate: z.string().optional().describe("出生日期（ISO 字符串）"),
      idCard: z.string().optional().describe("身份证号"),
      phone: z.string().optional().describe("电话"),
      joinDate: z.string().optional().describe("入职日期（ISO 字符串）"),
      bio: z.string().optional().describe("简介"),
      status: z.enum(["active", "inactive", "on_leave"]).optional().describe("状态"),
    })
  ),
  execute: async ({ id, ...data }) => {
    const coach = await prisma.coach.update({
      where: { id },
      data: {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      },
    });
    return coach;
  },
});

export const listClasses = tool({
  description: "获取班级列表，支持按名称搜索、状态筛选和分页",
  inputSchema: zodSchema(
    z.object({
      search: z.string().optional().describe("搜索关键词（班级名称）"),
      status: z.enum(["active", "inactive", "suspended"]).optional().describe("班级状态筛选"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ search, status, page, pageSize }) => {
    const where: Prisma.ClassWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }
    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { students: true, courses: true } } },
      }),
      prisma.class.count({ where }),
    ]);
    return { classes, total, page, pageSize };
  },
});

export const createClass = tool({
  description: "创建新班级",
  inputSchema: zodSchema(
    z.object({
      name: z.string().min(1).describe("班级名称"),
      level: z.string().optional().describe("段位/级别，如白带、黄带"),
      description: z.string().optional().describe("班级描述"),
      maxStudents: z.number().default(30).describe("最大学员数"),
      status: z.enum(["active", "inactive", "suspended"]).default("active").describe("状态"),
    })
  ),
  execute: async (data) => {
    const cls = await prisma.class.create({ data });
    return cls;
  },
});

export const updateClass = tool({
  description: "更新班级信息",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("班级 ID"),
      name: z.string().min(1).optional().describe("班级名称"),
      level: z.string().optional().describe("段位/级别，如白带、黄带"),
      description: z.string().optional().describe("班级描述"),
      maxStudents: z.number().optional().describe("最大学员数"),
      status: z.enum(["active", "inactive", "suspended"]).optional().describe("状态"),
    })
  ),
  execute: async ({ id, ...data }) => {
    const cls = await prisma.class.update({
      where: { id },
      data,
    });
    return cls;
  },
});

export const listCourses = tool({
  description: "获取课程列表，支持班级筛选、教练筛选、时间范围和分页",
  inputSchema: zodSchema(
    z.object({

      coachId: z.string().optional().describe("教练 ID 筛选"),
      start: z.string().optional().describe("开始时间（ISO 字符串）"),
      end: z.string().optional().describe("结束时间（ISO 字符串）"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(100).describe("每页数量"),
    })
  ),
  execute: async ({ coachId, start, end, page, pageSize }) => {
    const where: Prisma.CourseWhereInput = {};
    if (coachId) where.coachId = coachId;
    if (start && end) {
      where.startTime = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { startTime: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          coach: { select: { id: true, name: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);
    return { courses, total, page, pageSize };
  },
});

export const createCourse = tool({
  description: "创建新课程",
  inputSchema: zodSchema(
    z.object({
      title: z.string().optional().describe("课程标题"),

      startTime: z.string().describe("开始时间（ISO 字符串）"),
      endTime: z.string().describe("结束时间（ISO 字符串）"),
      classId: z.string().describe("班级 ID"),
      coachId: z.string().optional().describe("教练 ID"),
      location: z.string().optional().describe("上课地点"),
      maxStudents: z.number().default(30).describe("最大学员数"),
      description: z.string().optional().describe("课程描述"),
    })
  ),
  execute: async (data) => {
    // 校验班级必须存在且处于活动状态
    const cls = await prisma.class.findUnique({
      where: { id: data.classId },
      select: { id: true, name: true, status: true },
    });
    if (!cls) return { error: "班级不存在" };
    if (cls.status !== "active") return { error: `班级 "${cls.name}" 当前状态为 ${cls.status}，只有活动状态的班级才能添加课程` };

    // 如果未提供课程名称，自动生成：班级名 + 日期
    let title = data.title;
    if (!title) {
      const dateStr = new Date(data.startTime).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      title = `${cls.name} ${dateStr}`;
    }

    const course = await prisma.course.create({
      data: {
        ...data,
        title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        coachId: data.coachId || undefined,
      },
    });
    return course;
  },
});

export const updateCourse = tool({
  description: "更新课程信息",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("课程 ID"),
      title: z.string().min(1).optional().describe("课程标题"),
      classId: z.string().optional().describe("班级 ID"),
      startTime: z.string().optional().describe("开始时间（ISO 字符串）"),
      endTime: z.string().optional().describe("结束时间（ISO 字符串）"),
      coachId: z.string().optional().describe("教练 ID"),
      location: z.string().optional().describe("上课地点"),
      maxStudents: z.number().optional().describe("最大学员数"),
      description: z.string().optional().describe("课程描述"),
    })
  ),
  execute: async ({ id, ...data }) => {
    // 如果更换班级，校验新班级必须处于活动状态
    if (data.classId) {
      const cls = await prisma.class.findUnique({
        where: { id: data.classId },
        select: { id: true, name: true, status: true },
      });
      if (!cls) return { error: "班级不存在" };
      if (cls.status !== "active") return { error: `班级 "${cls.name}" 当前状态为 ${cls.status}，只有活动状态的班级才能关联课程` };
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        coachId: data.coachId || undefined,
        classId: data.classId,
      },
    });
    return course;
  },
});

export const deleteCourse = tool({
  description: "删除课程",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("课程 ID"),
    })
  ),
  execute: async ({ id }) => {
    await prisma.course.delete({ where: { id } });
    return { success: true, message: "课程已删除" };
  },
});

export const takeAttendance = tool({
  description: "为学员登记考勤记录",
  inputSchema: zodSchema(
    z.object({
      courseId: z.string().describe("课程 ID"),
      studentId: z.string().describe("学员 ID"),
      attendanceDate: z.string().describe("考勤日期（ISO 字符串）"),
      status: z.enum(["present", "absent", "late", "leave", "unmarked"]).default("present").describe("考勤状态"),
    })
  ),
  execute: async ({ courseId, studentId, attendanceDate, status }) => {
    const record = await prisma.attendance.upsert({
      where: {
        courseId_studentId_attendanceDate: {
          courseId,
          studentId,
          attendanceDate: new Date(attendanceDate),
        },
      },
      update: { status, checkedAt: new Date() },
      create: {
        courseId,
        studentId,
        attendanceDate: new Date(attendanceDate),
        status,
        checkedAt: new Date(),
      },
    });
    return record;
  },
});

export const getAttendance = tool({
  description: "查询考勤记录，支持按课程、学员、日期筛选",
  inputSchema: zodSchema(
    z.object({
      courseId: z.string().optional().describe("课程 ID"),
      studentId: z.string().optional().describe("学员 ID"),
      date: z.string().optional().describe("日期（ISO 字符串）"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(100).describe("每页数量"),
    })
  ),
  execute: async ({ courseId, studentId, date, page, pageSize }) => {
    const where: Prisma.AttendanceWhereInput = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;
    if (date) {
      where.attendanceDate = new Date(date);
    }
    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { attendanceDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          course: { select: { title: true } },
          student: { select: { id: true, name: true } },
        },
      }),
      prisma.attendance.count({ where }),
    ]);
    return { attendances, total, page, pageSize };
  },
});

export const getCurrentTime = tool({
  description: "获取当前系统时间，包括日期、时间、星期和时区信息。当用户询问今天日期、当前时间或涉及时间计算时调用此工具。",
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    const now = new Date();
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return {
      iso: now.toISOString(),
      date: now.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }),
      time: now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      weekday: weekdays[now.getDay()],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: now.getTime(),
    };
  },
});
