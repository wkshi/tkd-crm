import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  CalendarDays,
  ClipboardCheck,
  Award,
  Trophy,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

/**
 * 仪表盘首页（Server Component）
 * 直接从 Prisma 查询统计数据，无需额外 API 调用
 */
export default async function DashboardPage() {
  // ---------- 1. 统计查询 ----------

  const totalStudents = await prisma.student.count({
    where: { status: "active" },
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const todayCoursesCount = await prisma.course.count({
    where: { startTime: { gte: startOfToday, lte: endOfToday } },
  });

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
    totalAttendance === 0 ? 0 : Math.round((presentAttendance / totalAttendance) * 100);

  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  // 即将到期学员（30天内且已设置到期日期）
  const expiringSoonCount = await prisma.student.count({
    where: {
      status: "active",
      expiryDate: { gte: now, lte: thirtyDaysLater },
    },
  });

  // 课时预警学员（剩余课时 <= 5）
  const lowSessionsCount = await prisma.student.count({
    where: {
      status: "active",
      remainingSessions: { lte: 5 },
    },
  });

  // ---------- 2. 今日课程列表 ----------
  const todayCourses = await prisma.course.findMany({
    where: { startTime: { gte: startOfToday, lte: endOfToday } },
    include: {
      coach: true,
      class: { include: { students: { select: { id: true, name: true } } } },
      attendances: {
        where: { attendanceDate: { gte: startOfToday, lte: endOfToday } },
        select: { status: true, studentId: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // ---------- 3. 最近活动 ----------
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
      color: "bg-[#0071E3]/8 text-[#0071E3]",
    })),
    ...recentCourses.map((c) => ({
      id: `course-${c.id}`,
      text: `课程 "${c.title}" 已更新`,
      time: c.updatedAt,
      icon: <CalendarDays className="w-4 h-4" />,
      color: "bg-[#34C759]/8 text-[#34C759]",
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
        color: "bg-[#FF9500]/8 text-[#FF9500]",
      })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 6);

  // ---------- 4. 快捷入口 ----------
  const shortcuts = [
    { label: "新增学员", href: "/students/new", icon: UserPlus, color: "text-[#0071E3]" },
    { label: "查看日历", href: "/calendar", icon: Calendar, color: "text-[#34C759]" },
    { label: "考勤查询", href: "/attendance", icon: ClipboardCheck, color: "text-[#FF9500]" },
    { label: "考级录入", href: "/grading", icon: Award, color: "text-[#AF52DE]" },
    { label: "比赛录入", href: "/competition", icon: Trophy, color: "text-[#FF3B30]" },
    { label: "AI 助手", href: "/ai", icon: Sparkles, color: "text-[#6E6E73]" },
  ];

  return (
    <div className="space-y-6">
      {/* ==================== 页面头部 ==================== */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">仪表盘</h1>
          <p className="text-sm text-[#86868B] mt-1">
            欢迎回来，今天有 {todayCoursesCount} 节课
          </p>
        </div>

      </div>

      {/* ==================== 统计卡片 ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 在籍学员 */}
        <Link href="/students?status=active">
          <Card className="bg-white rounded-[14px] border-black/[0.06] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer hover:-translate-y-px">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#0071E3]/8 flex items-center justify-center">
                  <Users className="w-[18px] h-[18px] text-[#0071E3]" />
                </div>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-[#34C759]/10 text-[#34C759]">
                  +3
                </span>
              </div>
              <div className="text-[32px] font-bold text-[#1D1D1F] leading-none">{totalStudents}</div>
              <div className="text-[13px] text-[#86868B] mt-1.5 font-medium">在册学员</div>
              <div className="h-[3px] bg-black/[0.05] rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#0071E3] rounded-full" style={{ width: "80%" }} />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 本月出勤率 */}
        <Link href={`/attendance?year=${now.getFullYear()}&month=${now.getMonth() + 1}`}>
          <Card className="bg-white rounded-[14px] border-black/[0.06] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer hover:-translate-y-px">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#AF52DE]/8 flex items-center justify-center">
                  <TrendingUp className="w-[18px] h-[18px] text-[#AF52DE]" />
                </div>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-[#AF52DE]/10 text-[#AF52DE]">
                  {attendanceRate >= 90 ? "优秀" : attendanceRate >= 75 ? "良好" : "需关注"}
                </span>
              </div>
              <div className="text-[32px] font-bold text-[#1D1D1F] leading-none">{attendanceRate}%</div>
              <div className="text-[13px] text-[#86868B] mt-1.5 font-medium">本月出勤率</div>
              <div className="h-[3px] bg-black/[0.05] rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#AF52DE] rounded-full" style={{ width: `${attendanceRate}%` }} />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 即将到期 */}
        <Link href="/students?expiry=30days">
          <Card className="bg-white rounded-[14px] border-black/[0.06] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer hover:-translate-y-px">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#FF9500]/8 flex items-center justify-center">
                  <Clock className="w-[18px] h-[18px] text-[#FF9500]" />
                </div>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-[#FF9500]/10 text-[#FF9500]">
                  30天内
                </span>
              </div>
              <div className="text-[32px] font-bold text-[#1D1D1F] leading-none">{expiringSoonCount}</div>
              <div className="text-[13px] text-[#86868B] mt-1.5 font-medium">即将到期</div>
              <div className="h-[3px] bg-black/[0.05] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#FF9500] rounded-full"
                  style={{ width: `${expiringSoonCount > 0 ? Math.min(expiringSoonCount * 10, 100) : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 课时预警 */}
        <Link href="/students?sessions=critical">
          <Card className="bg-white rounded-[14px] border-black/[0.06] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all cursor-pointer hover:-translate-y-px">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#FF3B30]/8 flex items-center justify-center">
                  <AlertTriangle className="w-[18px] h-[18px] text-[#FF3B30]" />
                </div>
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-[#FF3B30]/10 text-[#FF3B30]">
                  ≤5 课时
                </span>
              </div>
              <div className="text-[32px] font-bold text-[#1D1D1F] leading-none">{lowSessionsCount}</div>
              <div className="text-[13px] text-[#86868B] mt-1.5 font-medium">课时预警</div>
              <div className="h-[3px] bg-black/[0.05] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#FF3B30] rounded-full"
                  style={{ width: `${lowSessionsCount > 0 ? Math.min(lowSessionsCount * 10, 100) : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ==================== 双栏：今日课程 + 快捷入口 ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：今日课程（占 8 列） */}
        <div className="lg:col-span-8">
          <Card className="bg-white rounded-[14px] border-black/[0.06] h-full">
            <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-[15px] font-semibold text-[#1D1D1F]">今日课程</CardTitle>
              <Link
                href="/calendar"
                className="text-[13px] font-medium text-[#0071E3] hover:underline"
              >
                查看全部
              </Link>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {todayCourses.length === 0 ? (
                <div className="py-12 text-center text-[#A1A1A6] text-sm">
                  今日暂无课程安排
                </div>
              ) : (
                <div className="space-y-2">
                  {todayCourses.map((course) => {
                    const start = new Date(course.startTime);
                    const timeStr = `${start.getHours().toString().padStart(2, "0")}:${start
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
                        className="flex items-center gap-4 rounded-[10px] p-3.5 hover:bg-black/[0.03] transition-colors cursor-pointer border border-transparent hover:border-black/[0.04]"
                      >
                        {/* 时间 */}
                        <div className="shrink-0 w-14 text-center">
                          <div className="text-[15px] font-semibold text-[#0071E3]">{timeStr}</div>
                        </div>

                        {/* 课程信息 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-[#1D1D1F] truncate">
                            {course.title || "未命名课程"}
                          </p>
                          <p className="text-[13px] text-[#86868B] mt-0.5">
                            {course.coach?.name || "待定"}
                            {course.location ? ` · ${course.location}` : ""}
                            {course.class ? ` · ${course.class.name}` : ""}
                          </p>
                        </div>

                        {/* 状态 */}
                        <div className="shrink-0">
                          {allChecked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[#34C759]/8 text-[#34C759]">
                              <CheckCircle2 className="w-3 h-3" />
                              已完成
                            </span>
                          ) : (
                            <Link href={`/attendance/rollcall?courseId=${course.id}`}>
                              <Button
                                size="sm"
                                className="h-7 px-3 rounded-full text-[12px] font-medium bg-[#0071E3] hover:bg-[#0068D1] text-white"
                              >
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

        {/* 右侧：快捷入口（占 4 列） */}
        <div className="lg:col-span-4">
          <Card className="bg-white rounded-[14px] border-black/[0.06] h-full">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-[15px] font-semibold text-[#1D1D1F]">快捷入口</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-3">
                {shortcuts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col items-center justify-center gap-2 rounded-[12px] p-4 bg-black/[0.03] hover:bg-black/[0.06] transition-all border border-transparent hover:border-black/[0.04]"
                    >
                      <Icon className={`w-6 h-6 ${item.color}`} />
                      <span className="text-[13px] font-medium text-[#1D1D1F]">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ==================== 最近动态 ==================== */}
      <Card className="bg-white rounded-[14px] border-black/[0.06]">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle className="text-[15px] font-semibold text-[#1D1D1F]">最近动态</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-[#A1A1A6] text-sm">
              暂无最近活动记录
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 rounded-[10px] p-3.5 hover:bg-black/[0.03] transition-colors cursor-pointer"
                >
                  <div
                    className={`shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center ${activity.color}`}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-[#1D1D1F] truncate">{activity.text}</p>
                    <p className="text-[12px] text-[#A1A1A6] mt-0.5">
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
