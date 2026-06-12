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


// ==================== 教练删除工具 ====================

export const deleteCoach = tool({
  description: "删除（软删除）教练，将状态设为 inactive",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("教练 ID"),
    })
  ),
  execute: async ({ id }) => {
    await prisma.coach.update({
      where: { id },
      data: { status: "inactive" },
    });
    return { success: true, message: "教练已删除" };
  },
});

// ==================== 班级删除工具 ====================

export const deleteClass = tool({
  description: "删除班级",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("班级 ID"),
    })
  ),
  execute: async ({ id }) => {
    await prisma.class.delete({ where: { id } });
    return { success: true, message: "班级已删除" };
  },
});

// ==================== 学员班级关联工具 ====================

export const addStudentsToClass = tool({
  description: "将学员添加到指定班级",
  inputSchema: zodSchema(
    z.object({
      classId: z.string().describe("班级 ID"),
      studentIds: z
        .array(z.string())
        .describe("要添加的学员 ID 列表"),
    })
  ),
  execute: async ({ classId, studentIds }) => {
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true },
    });
    if (!cls) return { error: "班级不存在" };

    await prisma.class.update({
      where: { id: classId },
      data: {
        students: { connect: studentIds.map((id) => ({ id })) },
      },
    });
    return {
      success: true,
      message: `已将 ${studentIds.length} 名学员添加到班级「${cls.name}」`,
    };
  },
});

export const removeStudentsFromClass = tool({
  description: "将学员从指定班级移除",
  inputSchema: zodSchema(
    z.object({
      classId: z.string().describe("班级 ID"),
      studentIds: z
        .array(z.string())
        .describe("要移除的学员 ID 列表"),
    })
  ),
  execute: async ({ classId, studentIds }) => {
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true },
    });
    if (!cls) return { error: "班级不存在" };

    await prisma.class.update({
      where: { id: classId },
      data: {
        students: { disconnect: studentIds.map((id) => ({ id })) },
      },
    });
    return {
      success: true,
      message: `已将 ${studentIds.length} 名学员从班级「${cls.name}」移除`,
    };
  },
});

// ==================== 充值管理工具 ====================

export const createRecharge = tool({
  description: "为学员创建充值记录，同时更新学员的剩余课时和到期时间",
  inputSchema: zodSchema(
    z.object({
      studentId: z.string().describe("学员 ID"),
      action: z.enum(["increment", "decrement"]).describe("操作类型：increment 增加课时，decrement 减少课时"),
      sessions: z.number().min(1).describe("课时数量"),
      durationDays: z.number().min(0).default(0).describe("有效期延长天数"),
      notes: z.string().optional().describe("备注"),
    })
  ),
  execute: async ({ studentId, action, sessions, durationDays, notes }) => {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, expiryDate: true },
    });
    if (!student) return { error: "学员不存在" };

    const baseDate = student.expiryDate && new Date(student.expiryDate) > new Date()
      ? new Date(student.expiryDate)
      : new Date();
    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + durationDays);

    const recharge = await prisma.$transaction(async (tx) => {
      const record = await tx.recharge.create({
        data: {
          studentId,
          action,
          sessions,
          durationDays,
          notes: notes || undefined,
        },
      });
      await tx.student.update({
        where: { id: studentId },
        data: {
          remainingSessions: action === "increment"
            ? { increment: sessions }
            : { decrement: sessions },
          ...(action === "increment" && { expiryDate: newExpiryDate }),
        },
      });
      return record;
    });
    return recharge;
  },
});

export const searchRecharges = tool({
  description: "查询充值记录，支持按学员姓名搜索、行为筛选和分页",
  inputSchema: zodSchema(
    z.object({
      search: z.string().optional().describe("搜索关键词（学员姓名）"),
      action: z.enum(["increment", "decrement"]).optional().describe("行为筛选"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ search, action, page, pageSize }) => {
    const where: Prisma.RechargeWhereInput = {};
    if (action) where.action = action;
    if (search) {
      where.student = { name: { contains: search, mode: "insensitive" } };
    }
    const [recharges, total] = await Promise.all([
      prisma.recharge.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { student: { select: { id: true, name: true } } },
      }),
      prisma.recharge.count({ where }),
    ]);
    return { recharges, total, page, pageSize };
  },
});

// ==================== 考级管理工具 ====================

export const createGrading = tool({
  description: "为学员创建考级晋升记录",
  inputSchema: zodSchema(
    z.object({
      studentId: z.string().describe("学员 ID"),
      examDate: z.string().describe("考级日期（ISO 字符串）"),
      beltLevel: z.enum([
        "white", "white_yellow", "yellow", "yellow_green", "green",
        "green_blue", "blue", "blue_red", "red", "red_black", "black",
      ]).describe("腰带级别"),
      notes: z.string().optional().describe("备注"),
    })
  ),
  execute: async ({ studentId, examDate, beltLevel, notes }) => {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return { error: "学员不存在" };
    const grading = await prisma.grading.create({
      data: {
        studentId,
        examDate: new Date(examDate),
        beltLevel,
        notes: notes || undefined,
      },
    });
    return grading;
  },
});

export const updateGrading = tool({
  description: "更新考级晋升记录",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("考级记录 ID"),
      examDate: z.string().optional().describe("考级日期（ISO 字符串）"),
      beltLevel: z.enum([
        "white", "white_yellow", "yellow", "yellow_green", "green",
        "green_blue", "blue", "blue_red", "red", "red_black", "black",
      ]).optional().describe("腰带级别"),
      notes: z.string().optional().describe("备注"),
    })
  ),
  execute: async ({ id, ...data }) => {
    const grading = await prisma.grading.update({
      where: { id },
      data: {
        ...data,
        examDate: data.examDate ? new Date(data.examDate) : undefined,
      },
    });
    return grading;
  },
});

export const deleteGrading = tool({
  description: "删除考级晋升记录",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("考级记录 ID"),
    })
  ),
  execute: async ({ id }) => {
    await prisma.grading.delete({ where: { id } });
    return { success: true, message: "考级记录已删除" };
  },
});

export const searchGradings = tool({
  description: "查询考级记录，支持按学员姓名搜索、腰带级别筛选和分页",
  inputSchema: zodSchema(
    z.object({
      search: z.string().optional().describe("搜索关键词（学员姓名）"),
      beltLevel: z.enum([
        "white", "white_yellow", "yellow", "yellow_green", "green",
        "green_blue", "blue", "blue_red", "red", "red_black", "black",
      ]).optional().describe("腰带级别筛选"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ search, beltLevel, page, pageSize }) => {
    const where: Prisma.GradingWhereInput = {};
    if (beltLevel) where.beltLevel = beltLevel;
    if (search) {
      where.student = { name: { contains: search, mode: "insensitive" } };
    }
    const [gradings, total] = await Promise.all([
      prisma.grading.findMany({
        where,
        orderBy: { examDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { student: { select: { id: true, name: true } } },
      }),
      prisma.grading.count({ where }),
    ]);
    return { gradings, total, page, pageSize };
  },
});

// ==================== 比赛管理工具 ====================

export const createCompetition = tool({
  description: "为学员创建比赛记录",
  inputSchema: zodSchema(
    z.object({
      studentId: z.string().describe("学员 ID"),
      competitionDate: z.string().describe("比赛日期（ISO 字符串）"),
      competitionName: z.string().min(1).describe("比赛名称"),
      category: z.string().optional().describe("参赛项目/类别"),
      result: z.string().optional().describe("比赛结果"),
      award: z.string().optional().describe("获奖情况"),
    })
  ),
  execute: async ({ studentId, competitionDate, competitionName, category, result, award }) => {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return { error: "学员不存在" };
    const competition = await prisma.competition.create({
      data: {
        studentId,
        competitionDate: new Date(competitionDate),
        competitionName,
        category: category || undefined,
        result: result || undefined,
        award: award || undefined,
      },
    });
    return competition;
  },
});

export const updateCompetition = tool({
  description: "更新比赛记录",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("比赛记录 ID"),
      competitionDate: z.string().optional().describe("比赛日期（ISO 字符串）"),
      competitionName: z.string().optional().describe("比赛名称"),
      category: z.string().optional().describe("参赛项目/类别"),
      result: z.string().optional().describe("比赛结果"),
      award: z.string().optional().describe("获奖情况"),
    })
  ),
  execute: async ({ id, ...data }) => {
    const competition = await prisma.competition.update({
      where: { id },
      data: {
        ...data,
        competitionDate: data.competitionDate ? new Date(data.competitionDate) : undefined,
      },
    });
    return competition;
  },
});

export const deleteCompetition = tool({
  description: "删除比赛记录",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("比赛记录 ID"),
    })
  ),
  execute: async ({ id }) => {
    await prisma.competition.delete({ where: { id } });
    return { success: true, message: "比赛记录已删除" };
  },
});

export const searchCompetitions = tool({
  description: "查询比赛记录，支持按学员姓名或比赛名称搜索和分页",
  inputSchema: zodSchema(
    z.object({
      search: z.string().optional().describe("搜索关键词（学员姓名或比赛名称）"),
      competitionName: z.string().optional().describe("按比赛名称筛选"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ search, competitionName, page, pageSize }) => {
    const where: Prisma.CompetitionWhereInput = {};
    if (competitionName) {
      where.competitionName = { contains: competitionName, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { student: { name: { contains: search, mode: "insensitive" } } },
        { competitionName: { contains: search, mode: "insensitive" } },
      ];
    }
    const [competitions, total] = await Promise.all([
      prisma.competition.findMany({
        where,
        orderBy: { competitionDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { student: { select: { id: true, name: true } } },
      }),
      prisma.competition.count({ where }),
    ]);
    return { competitions, total, page, pageSize };
  },
});

// ==================== 集训管理工具 ====================

export const createCamp = tool({
  description: "为学员创建集训/拓展活动记录",
  inputSchema: zodSchema(
    z.object({
      studentId: z.string().describe("学员 ID"),
      activityDate: z.string().describe("活动日期（ISO 字符串）"),
      activityName: z.string().min(1).describe("活动名称"),
      duration: z.number().min(1).describe("活动时长（小时）"),
      location: z.string().optional().describe("活动地点"),
      notes: z.string().optional().describe("备注"),
    })
  ),
  execute: async ({ studentId, activityDate, activityName, duration, location, notes }) => {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return { error: "学员不存在" };
    const camp = await prisma.camp.create({
      data: {
        studentId,
        activityDate: new Date(activityDate),
        activityName,
        duration,
        location: location || undefined,
        notes: notes || undefined,
      },
    });
    return camp;
  },
});

export const updateCamp = tool({
  description: "更新集训/拓展活动记录",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("集训记录 ID"),
      activityDate: z.string().optional().describe("活动日期（ISO 字符串）"),
      activityName: z.string().optional().describe("活动名称"),
      duration: z.number().optional().describe("活动时长（小时）"),
      location: z.string().optional().describe("活动地点"),
      notes: z.string().optional().describe("备注"),
    })
  ),
  execute: async ({ id, ...data }) => {
    const camp = await prisma.camp.update({
      where: { id },
      data: {
        ...data,
        activityDate: data.activityDate ? new Date(data.activityDate) : undefined,
      },
    });
    return camp;
  },
});

export const deleteCamp = tool({
  description: "删除集训/拓展活动记录",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("集训记录 ID"),
    })
  ),
  execute: async ({ id }) => {
    await prisma.camp.delete({ where: { id } });
    return { success: true, message: "集训记录已删除" };
  },
});

export const searchCamps = tool({
  description: "查询集训/拓展活动记录，支持按学员姓名或活动名称搜索和分页",
  inputSchema: zodSchema(
    z.object({
      search: z.string().optional().describe("搜索关键词（学员姓名或活动名称）"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ search, page, pageSize }) => {
    const where: Prisma.CampWhereInput = {};
    if (search) {
      where.OR = [
        { student: { name: { contains: search, mode: "insensitive" } } },
        { activityName: { contains: search, mode: "insensitive" } },
      ];
    }
    const [camps, total] = await Promise.all([
      prisma.camp.findMany({
        where,
        orderBy: { activityDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { student: { select: { id: true, name: true } } },
      }),
      prisma.camp.count({ where }),
    ]);
    return { camps, total, page, pageSize };
  },
});

// ==================== 装备库存管理工具 ====================

export const searchEquipment = tool({
  description: "搜索装备库存列表，支持按名称搜索、类型筛选、状态筛选和分页",
  inputSchema: zodSchema(
    z.object({
      search: z.string().optional().describe("搜索关键词（装备名称）"),
      category: z
        .enum([
          "uniform",
          "gear",
          "belt",
          "pad",
          "accessory",
          "t_shirt",
          "tracksuit",
          "sneakers",
          "backpack",
          "other",
        ])
        .optional()
        .describe("装备类型筛选"),
      status: z.enum(["active", "inactive", "suspended"]).optional().describe("状态筛选"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ search, category, status, page, pageSize }) => {
    const where: Prisma.EquipmentWhereInput = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }
    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.equipment.count({ where }),
    ]);
    return { equipment, total, page, pageSize };
  },
});

export const createEquipment = tool({
  description: "创建新的装备库存记录",
  inputSchema: zodSchema(
    z.object({
      name: z.string().min(1).describe("装备名称"),
      category: z
        .enum([
          "uniform",
          "gear",
          "belt",
          "pad",
          "accessory",
          "t_shirt",
          "tracksuit",
          "sneakers",
          "backpack",
          "other",
        ])
        .default("gear")
        .describe("装备类型"),
      specification: z.string().optional().describe("规格/尺码"),
      currentStock: z.number().int().min(0).default(0).describe("当前库存"),
      minStock: z.number().int().min(0).default(0).describe("最低库存预警线"),
      status: z.enum(["active", "inactive", "suspended"]).default("active").describe("状态"),
      remark: z.string().optional().describe("备注"),
    })
  ),
  execute: async (data) => {
    const item = await prisma.equipment.create({
      data: {
        name: data.name,
        category: data.category,
        specification: data.specification || undefined,
        currentStock: data.currentStock,
        minStock: data.minStock,
        status: data.status,
        remark: data.remark || undefined,
      },
    });
    return item;
  },
});

export const updateEquipment = tool({
  description: "更新装备库存信息",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("装备 ID"),
      name: z.string().min(1).optional().describe("装备名称"),
      category: z
        .enum([
          "uniform",
          "gear",
          "belt",
          "pad",
          "accessory",
          "t_shirt",
          "tracksuit",
          "sneakers",
          "backpack",
          "other",
        ])
        .optional()
        .describe("装备类型"),
      specification: z.string().optional().describe("规格/尺码"),
      currentStock: z.number().int().min(0).optional().describe("当前库存"),
      minStock: z.number().int().min(0).optional().describe("最低库存预警线"),
      status: z.enum(["active", "inactive", "suspended"]).optional().describe("状态"),
      remark: z.string().optional().describe("备注"),
    })
  ),
  execute: async ({ id, ...data }) => {
    const item = await prisma.equipment.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        specification: data.specification,
        currentStock: data.currentStock,
        minStock: data.minStock,
        status: data.status,
        remark: data.remark,
      },
    });
    return item;
  },
});

export const deleteEquipment = tool({
  description: "删除装备库存记录",
  inputSchema: zodSchema(
    z.object({
      id: z.string().describe("装备 ID"),
    })
  ),
  execute: async ({ id }) => {
    await prisma.equipment.update({
      where: { id },
      data: { status: "inactive" },
    });
    return { success: true, message: "装备已删除" };
  },
});

// ==================== 装备出入库流水工具 ====================

export const searchEquipmentTransactions = tool({
  description: "查询装备出入库流水记录，支持按装备、类型筛选和分页",
  inputSchema: zodSchema(
    z.object({
      equipmentId: z.string().optional().describe("装备 ID（可选）"),
      type: z.enum(["in", "out", "adjust"]).optional().describe("流水类型：in 入库 / out 出库 / adjust 盘点调整"),
      page: z.number().default(1).describe("页码"),
      pageSize: z.number().default(20).describe("每页数量"),
    })
  ),
  execute: async ({ equipmentId, type, page, pageSize }) => {
    const where: Prisma.EquipmentTransactionWhereInput = {};
    if (equipmentId) {
      where.equipmentId = equipmentId;
    }
    if (type) {
      where.type = type;
    }
    const [transactions, total] = await Promise.all([
      prisma.equipmentTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          relatedStudent: { select: { id: true, name: true } },
          relatedCoach: { select: { id: true, name: true } },
        },
      }),
      prisma.equipmentTransaction.count({ where }),
    ]);
    return { transactions, total, page, pageSize };
  },
});

export const createEquipmentTransaction = tool({
  description: "登记装备出入库流水，自动更新装备当前库存。出库时若库存不足会失败。",
  inputSchema: zodSchema(
    z.object({
      equipmentId: z.string().describe("装备 ID"),
      type: z.enum(["in", "out", "adjust"]).describe("流水类型：in 入库 / out 出库 / adjust 盘点调整"),
      quantity: z.number().int().describe("数量。in/out 必须大于 0；adjust 可正可负"),
      reason: z.string().optional().describe("原因或备注"),
      operator: z.string().optional().describe("操作人"),
      relatedStudentId: z.string().optional().describe("关联学员 ID（可选）"),
      relatedCoachId: z.string().optional().describe("关联教练 ID（可选）"),
    })
  ),
  execute: async (data) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const equipment = await tx.equipment.findUnique({
          where: { id: data.equipmentId },
        });
        if (!equipment) {
          throw new Error("装备不存在");
        }

        let stockDelta = 0;
        if (data.type === "in") {
          if (data.quantity <= 0) {
            throw new Error("入库数量必须大于 0");
          }
          stockDelta = data.quantity;
        } else if (data.type === "out") {
          if (data.quantity <= 0) {
            throw new Error("出库数量必须大于 0");
          }
          if (equipment.currentStock < data.quantity) {
            throw new Error("库存不足，无法出库");
          }
          stockDelta = -data.quantity;
        } else if (data.type === "adjust") {
          const newStock = equipment.currentStock + data.quantity;
          if (newStock < 0) {
            throw new Error("盘点调整后库存不能为负");
          }
          stockDelta = data.quantity;
        }

        const transaction = await tx.equipmentTransaction.create({
          data: {
            equipmentId: data.equipmentId,
            type: data.type,
            quantity: data.quantity,
            reason: data.reason,
            operator: data.operator,
            relatedStudentId: data.relatedStudentId,
            relatedCoachId: data.relatedCoachId,
          },
        });

        await tx.equipment.update({
          where: { id: data.equipmentId },
          data: { currentStock: { increment: stockDelta } },
        });

        return transaction;
      });
      return { success: true, transaction: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : "操作失败";
      return { success: false, error: message };
    }
  },
});
