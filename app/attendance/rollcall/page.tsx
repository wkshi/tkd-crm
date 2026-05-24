"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  ArrowLeft,
  CalendarDays,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// 学员数据类型
interface Student {
  id: string;
  name: string;
  photoUrl?: string | null;
}

// 课程数据类型
interface Course {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string | null;
  coach?: { name: string } | null;
  students: Student[];
}



type AttendanceStatus = "unmarked" | "present" | "absent" | "late" | "leave";

const statusConfig: Record<
  AttendanceStatus,
  { label: string; color: string; activeColor: string }
> = {
  unmarked: {
    label: "未点名",
    color: "bg-black/[0.06] text-[#6E6E73]",
    activeColor: "bg-black/[0.06] text-[#6E6E73] ring-2 ring-[#6E6E73]/20",
  },
  present: {
    label: "出勤",
    color: "bg-green-500/10 text-green-700",
    activeColor: "bg-green-500 text-white",
  },
  absent: {
    label: "缺勤",
    color: "bg-red-500/10 text-[#D9264A]",
    activeColor: "bg-[#D9264A] text-white",
  },
  late: {
    label: "迟到",
    color: "bg-yellow-500/10 text-yellow-700",
    activeColor: "bg-yellow-500 text-white",
  },
  leave: {
    label: "请假",
    color: "bg-blue-500/10 text-blue-700",
    activeColor: "bg-blue-500 text-white",
  },
};

// 判断两个日期是否为同一天
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function RollCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [course, setCourse] = useState<Course | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [todayAttendances, setTodayAttendances] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 加载数据
  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        // 并行获取课程详情和全部学员
        const [courseRes, studentsRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch("/api/students?pageSize=9999&status=active"),
        ]);

        if (cancelled) return;

        if (courseRes.ok) {
          const courseData: Course & {
            attendances: Array<{
              studentId: string;
              status: string;
              attendanceDate: string;
            }>;
          } = await courseRes.json();
          setCourse(courseData);

          // 从课程详情中过滤出今日考勤
          const today = new Date();
          const map: Record<string, AttendanceStatus> = {};
          (courseData.attendances || []).forEach((a) => {
            if (isSameDay(new Date(a.attendanceDate), today)) {
              map[a.studentId] = a.status as AttendanceStatus;
            }
          });
          setTodayAttendances(map);
        }

        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setAllStudents(data.students || []);
        }
      } catch (err) {
        console.error("加载点名数据失败:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // 确定要显示的学员列表
  const displayStudents =
    course && course.students.length > 0
      ? course.students
      : allStudents;

  // 设置学员出勤状态
  function setStudentStatus(studentId: string, status: AttendanceStatus) {
    setTodayAttendances((prev) => ({ ...prev, [studentId]: status }));
  }

  // 提交点名
  async function handleSubmit() {
    if (!courseId || displayStudents.length === 0) return;

    setSubmitting(true);
    try {
      const records = displayStudents.map((s) => ({
        studentId: s.id,
        status: todayAttendances[s.id] || "unmarked",
      }));

      const res = await fetch("/api/attendance/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          records,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
      } else {
        const err = await res.json();
        alert(err.error || "点名提交失败");
      }
    } catch (err) {
      console.error("提交点名失败:", err);
      alert("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  // 全勤快捷操作
  function markAllPresent() {
    const map: Record<string, AttendanceStatus> = {};
    displayStudents.forEach((s) => {
      map[s.id] = "present";
    });
    setTodayAttendances(map);
  }

  // 统计
  const presentCount = displayStudents.filter(
    (s) => todayAttendances[s.id] === "present"
  ).length;
  const absentCount = displayStudents.filter(
    (s) => todayAttendances[s.id] === "absent"
  ).length;
  const lateCount = displayStudents.filter(
    (s) => todayAttendances[s.id] === "late"
  ).length;
  const leaveCount = displayStudents.filter(
    (s) => todayAttendances[s.id] === "leave"
  ).length;
  const unmarkedCount = displayStudents.filter(
    (s) => !todayAttendances[s.id] || todayAttendances[s.id] === "unmarked"
  ).length;

  if (!courseId) {
    return (
      <div className="text-center py-20 text-[#A1A1A6]">
        <AlertCircle className="w-8 h-8 mx-auto mb-3" />
        <p>缺少课程参数</p>
        <Button
          variant="outline"
          className="mt-4 rounded-full"
          onClick={() => router.push("/calendar")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回日历
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => router.push("/calendar")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
        <h2 className="text-xl font-bold text-[#1D1D1F]">课程点名</h2>
      </div>

      {/* 课程信息卡片 */}
      {course && (
        <Card className="p-5 bg-white rounded-[20px] shadow-none">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#1D1D1F]">
                {course.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#6E6E73]">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {new Date(course.startTime).toLocaleDateString("zh-CN")}
                </span>
                <span>
                  {new Date(course.startTime).toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  ~
                  {new Date(course.endTime).toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {course.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {course.location}
                  </span>
                )}
              </div>
              {course.coach && (
                <p className="text-sm text-[#6E6E73]">
                  教练：{course.coach.name}
                </p>
              )}
            </div>
          </div>

          {/* 统计摘要 */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-black/[0.04]">
            <Badge
              variant="secondary"
              className="bg-green-500/10 text-green-700 border-0"
            >
              出勤 {presentCount}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-red-500/10 text-[#D9264A] border-0"
            >
              缺勤 {absentCount}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-yellow-500/10 text-yellow-700 border-0"
            >
              迟到 {lateCount}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-500/10 text-blue-700 border-0"
            >
              请假 {leaveCount}
            </Badge>
            {unmarkedCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-black/[0.06] text-[#6E6E73] border-0"
              >
                未点名 {unmarkedCount}
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* 无学员提示 */}
      {course && course.students.length === 0 && allStudents.length > 0 && (
        <Card className="p-4 bg-amber-50 rounded-[14px] shadow-none border-0">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                该课程暂无报名学员
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                下方显示全部在籍学员，建议先在课程编辑中添加报名学员。
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 rounded-full text-xs h-7"
                onClick={() => router.push(`/calendar?editCourse=${courseId}`)}
              >
                去添加学员
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 快捷操作 */}
      {displayStudents.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6E6E73]">
            共 {displayStudents.length} 人
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs h-8 bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1] border-0"
            onClick={markAllPresent}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            全勤
          </Button>
        </div>
      )}

      {/* 学员点名列表 */}
      {loading ? (
        <div className="text-center py-12 text-[#A1A1A6] text-sm">加载中...</div>
      ) : displayStudents.length === 0 ? (
        <Card className="p-8 text-center bg-white rounded-[20px] shadow-none">
          <Users className="w-8 h-8 mx-auto mb-3 text-[#A1A1A6]" />
          <p className="text-[#A1A1A6]">暂无学员</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayStudents.map((student) => {
            const currentStatus = todayAttendances[student.id] || "unmarked";
            return (
              <Card
                key={student.id}
                className="p-4 bg-white rounded-[14px] shadow-none flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-black/[0.06] flex items-center justify-center text-sm font-medium text-[#1D1D1F] shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-[#1D1D1F] truncate">
                    {student.name}
                  </span>
                </div>

                {/* 状态选择器 */}
                <div className="flex items-center gap-1 shrink-0">
                  {(
                    ["unmarked", "present", "absent", "late", "leave"] as AttendanceStatus[]
                  ).map((status) => {
                    const config = statusConfig[status];
                    const isActive = currentStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStudentStatus(student.id, status)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          isActive ? config.activeColor : config.color
                        }`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 提交按钮 */}
      {displayStudents.length > 0 && (
        <div className="pt-2 pb-6">
          <Button
            className={`w-full rounded-full h-12 text-sm font-medium transition-all ${
              submitted
                ? "bg-green-500 hover:bg-green-500"
                : "bg-[#1D1D1F] hover:bg-black/80"
            }`}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                点名成功
              </>
            ) : submitting ? (
              "提交中..."
            ) : (
              <>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                提交点名 ({displayStudents.length - unmarkedCount}/{displayStudents.length})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
