import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Calendar,
  ClipboardCheck,
  Award,
  Trophy,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

/**
 * 仪表盘首页（Server Component）
 * 直接从 Prisma 查询统计数据，无需额外 API 调用
 */
export default async function DashboardPage() {
  // ---------- 1. 统计查询 ----------

  // 在籍学员总数
  const totalStudents = await prisma.student.count({
    where: { status: "active" },
  });

  // 今日起止时间
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 今日课程数
  const todayCoursesCount = await prisma.course.count({
    where: {
      startTime: { gte: startOfToday, lte: endOfToday },
    },
  });

  // 本月出勤率
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const totalAttendance = await prisma.attendance.count({
    where: {
      attendanceDate: { gte: startOfMonth, lte: endOfMonth },
      status: { not: "unmarked" },
    },
  });

  const presentAttendance = await prisma.attendance.count({
    where: {
      attendanceDate: { gte: startOfMonth, lte: endOfMonth },
      status: "present",
    },
  });

  const attendanceRate =
    totalAttendance === 0
      ? 0
      : Math.round((presentAttendance / totalAttendance) * 100);

  // 即将到期学员（30 天内到期且仍在籍）
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const expiringSoonCount = await prisma.student.count({
    where: {
      status: "active",
      expiryDate: {
        gte: startOfToday,
        lte: thirtyDaysLater,
      },
    },
  });

  // ---------- 2. 今日课程列表 ----------
  const todayCourses = await prisma.course.findMany({
    where: {
      startTime: { gte: startOfToday, lte: endOfToday },
    },
    include: {
      coach: true,
      class: {
        include: {
          students: { select: { id: true, name: true } },
        },
      },
      attendances: {
        where: {
          attendanceDate: { gte: startOfToday, lte: endOfToday },
        },
        select: { status: true, studentId: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // ---------- 3. 最近活动（聚合多表最近操作记录） ----------
  const recentStudents = await prisma.student.findMany({
    take: 3,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true, status: true },
  });

  const recentCourses = await prisma.course.findMany({
    take: 3,
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  const recentAttendances = await prisma.attendance.findMany({
    take: 3,
    orderBy: { checkedAt: "desc" },
    select: {
      id: true,
      status: true,
      checkedAt: true,
      student: { select: { name: true } },
      course: { select: { title: true } },
    },
  });

  // 合并并排序，生成最近活动列表
  type Activity = {
    id: string;
    text: string;
    time: Date;
    icon: React.ReactNode;
    color: string;
  };

  const activities: Activity[] = [
    ...recentStudents.map((s) => ({
      id: `student-${s.id}`,
      text: `学员 "${s.name}" 信息已更新`,
      time: s.updatedAt,
      icon: <Users className="w-4 h-4" />,
      color: "bg-black/[0.06] text-[#6E6E73]",
    })),
    ...recentCourses.map((c) => ({
      id: `course-${c.id}`,
      text: `课程 "${c.title}" 已更新`,
      time: c.updatedAt,
      icon: <CalendarDays className="w-4 h-4" />,
      color: "bg-black/[0.06] text-[#6E6E73]",
    })),
    ...recentAttendances
      .filter((a) => a.checkedAt)
      .map((a) => ({
        id: `attendance-${a.id}`,
        text: `${a.student?.name || "未知学员"} 在 "${a.course?.title || "未知课程"}" 中${
          a.status === "present" ? "签到" : a.status === "absent" ? "缺勤" : "请假"
        }`,
        time: a.checkedAt!,
        icon: <ClipboardCheck className="w-4 h-4" />,
        color: "bg-black/[0.06] text-[#6E6E73]",
      })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 6);

  // ---------- 4. 快捷入口配置 ----------
  const shortcuts = [
    {
      label: "新增学员",
      href: "/students/new",
      icon: UserPlus,
      color: "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]",
    },
    {
      label: "查看日历",
      href: "/calendar",
      icon: Calendar,
      color: "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]",
    },
    {
      label: "考勤查询",
      href: "/attendance",
      icon: ClipboardCheck,
      color: "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]",
    },
    {
      label: "考级录入",
      href: "/grading",
      icon: Award,
      color: "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]",
    },
    {
      label: "比赛录入",
      href: "/competition",
      icon: Trophy,
      color: "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]",
    },
    {
      label: "AI 助手",
      href: "/ai",
      icon: Sparkles,
      color: "bg-black/[0.06] text-[#6E6E73] hover:bg-black/[0.06]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ==================== 顶部统计卡片 ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 在籍学员总数 */}
        <Card className="bg-white rounded-[20px] ">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6E6E73]">在籍学员总数</p>
              <p className="text-3xl font-bold text-[#1D1D1F]">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-[10px] bg-black/[0.06] flex items-center justify-center">
              <Users className="w-6 h-6 text-[#1D1D1F]" />
            </div>
          </CardContent>
        </Card>

        {/* 今日课程数 */}
        <Card className="bg-white rounded-[20px] ">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6E6E73]">今日课程数</p>
              <p className="text-3xl font-bold text-[#1D1D1F]">{todayCoursesCount}</p>
            </div>
            <div className="w-12 h-12 rounded-[10px] bg-black/[0.06] flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-[#1D1D1F]" />
            </div>
          </CardContent>
        </Card>

        {/* 本月出勤率 */}
        <Card className="bg-white rounded-[20px] ">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6E6E73]">本月出勤率</p>
              <p className="text-3xl font-bold text-[#1D1D1F]">{attendanceRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-[10px] bg-black/[0.06] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#1D1D1F]" />
            </div>
          </CardContent>
        </Card>

        {/* 即将到期学员 */}
        <Card className="bg-white rounded-[20px] ">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#6E6E73]">即将到期学员</p>
              <p className="text-3xl font-bold text-[#1D1D1F]">{expiringSoonCount}</p>
            </div>
            <div className="w-12 h-12 rounded-[10px] bg-black/[0.06] flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[#1D1D1F]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== 中部双栏 ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：今日课程列表（占 8 列） */}
        <div className="lg:col-span-8">
          <Card className="bg-white rounded-[20px] h-full">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-base font-medium text-[#1D1D1F]">
                今日课程
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {todayCourses.length === 0 ? (
                <div className="py-12 text-center text-[#A1A1A6] text-sm">
                  今日暂无课程安排
                </div>
              ) : (
                <div className="space-y-3">
                  {todayCourses.map((course) => {
                    const start = new Date(course.startTime);
                    const end = new Date(course.endTime);
                    const timeStr = `${start.getHours().toString().padStart(2, "0")}:${start
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")} - ${end
                      .getHours()
                      .toString()
                      .padStart(2, "0")}:${end
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`;

                    const classStudents = course.class?.students || [];
                    const allChecked =
                      classStudents.length > 0 &&
                      classStudents.every((s) =>
                        course.attendances.some(
                          (a) => a.studentId === s.id && a.status !== "unmarked"
                        )
                      );

                    return (
                      <div
                        key={course.id}
                        className="flex items-center gap-4 rounded-[10px] border border-black/[0.04] p-4 hover:bg-black/[0.06] transition-colors"
                      >
                        {/* 时间色块 */}
                        <div className="shrink-0 w-16 h-14 rounded-[10px] bg-black/[0.06] flex flex-col items-center justify-center text-[#1D1D1F]">
                          <Clock className="w-4 h-4 mb-0.5" />
                          <span className="text-xs font-semibold">{timeStr}</span>
                        </div>

                        {/* 课程信息 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1D1D1F] truncate">
                            {course.title || "未命名课程"}
                          </p>
                          <p className="text-xs text-[#6E6E73] mt-0.5">
                            教练：{course.coach?.name || "待定"}
                            {course.location ? ` · ${course.location}` : ""}
                            {course.class ? ` · ${course.class.name}` : ""}
                          </p>
                        </div>

                        {/* 点名状态 */}
                        <div className="shrink-0">
                          {allChecked ? (
                            <Badge
                              variant="secondary"
                              className="bg-black/[0.06] text-[#1D1D1F] border-black/[0.04]"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              已点名
                            </Badge>
                          ) : (
                            <Link href={`/attendance/rollcall?courseId=${course.id}`}>
                              <Button size="sm" variant="outline" className="text-xs">
                                点名
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：快捷入口网格（占 4 列） */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[20px] h-full">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-base font-medium text-[#1D1D1F]">
                快捷入口
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-3">
                {shortcuts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex flex-col items-center justify-center gap-2 rounded-[20px] p-4 transition-all ${item.color} border border-transparent hover:border-current/10`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================== 底部：最近活动 ==================== */}
      <Card className="bg-white rounded-[20px] ">
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-base font-medium text-[#1D1D1F]">
            最近活动
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-[#A1A1A6] text-sm">
              暂无最近活动记录
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-[10px] border border-black/[0.04] p-4 hover:bg-black/[0.06] transition-colors"
                >
                  <div
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${activity.color}`}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1D1D1F] truncate">{activity.text}</p>
                    <p className="text-xs text-[#A1A1A6] mt-0.5">
                      {activity.time.toLocaleString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A1A1A6] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
