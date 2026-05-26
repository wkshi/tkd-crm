"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  ClipboardCheck,
} from "lucide-react";

// 教练数据类型
interface Coach {
  id: string;
  name: string;
}

// 班级数据类型
interface ClassItem {
  id: string;
  name: string;
}

// 课程数据类型
interface Course {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  coachId: string | null;
  classId: string;
  location: string | null;
  maxStudents: number;
  description: string | null;
  coach?: { name: string } | null;
  class?: { name: string } | null;
  hasAttendanceChecked?: boolean;
}

// 预定义颜色池，相同（班级+教练）组合始终使用同一种颜色
const COLOR_POOL = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#84cc16",
  "#6366f1",
];

function getCourseColor(className: string, coachName?: string | null) {
  const key = `${className}-${coachName || "none"}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_POOL.length;
  return COLOR_POOL[index];
}

export default function CalendarPage() {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 新建/编辑课程表单状态
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    coachId: "",
    classId: "",
    location: "",
    maxStudents: 30,
    description: "",
  });

  const [durationMinutes, setDurationMinutes] = useState(90);

  // 视图模式：calendar（日历） / schedule（周课表）
  const [viewMode, setViewMode] = useState<"calendar" | "schedule">("calendar");

  // 周课表当前周起始（周一）
  const [scheduleWeekStart, setScheduleWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // 加载课程、教练和班级数据
  useEffect(() => {
    fetchCourses();
    fetchCoaches();
    fetchClasses();
  }, []);

  async function fetchClasses() {
    const res = await fetch("/api/classes?pageSize=9999&status=active");
    const data = await res.json();
    setClasses(data.classes || []);
  }

  async function fetchCourses() {
    const res = await fetch(
      "/api/courses?pageSize=9999&includeAttendanceStatus=true"
    );
    const data = await res.json();
    setCourses((data.courses || []) as Course[]);
  }

  async function fetchCoaches() {
    const res = await fetch("/api/coaches?pageSize=9999");
    const data = await res.json();
    setCoaches(data.coaches || []);
  }

  // 根据筛选条件生成日历事件，根据点名状态调整样式
  const events = courses.map((course) => {
    const baseColor = getCourseColor(
      course.class?.name || "",
      course.coach?.name
    );
    const isPast = new Date(course.endTime) < new Date();
    const hasChecked = course.hasAttendanceChecked;

    let bgColor = baseColor;
    let borderColor = baseColor;
    let textColor = "#fff";
    let suffix = "";

    if (isPast && !hasChecked) {
      bgColor = "#d1d5db";
      borderColor = "#9ca3af";
      textColor = "#6b7280";
      suffix = " ⚠️ 未点名";
    } else if (hasChecked) {
      borderColor = "#34C759";
      suffix = " ✅";
    }

    return {
      id: course.id,
      title: `${course.class?.name || "未命名课程"}${course.coach?.name ? " · " + course.coach.name : ""}${suffix}`,
      start: course.startTime,
      end: course.endTime,
      backgroundColor: bgColor,
      borderColor: borderColor,
      textColor: textColor,
      extendedProps: { course },
    };
  });

  // 点击课程事件
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEventClick(info: any) {
    setSelectedCourse(info.event.extendedProps.course);
    setEditMode(false);
    setDialogOpen(true);
  }

  // 切换到编辑模式
  function openEditMode() {
    if (!selectedCourse) return;
    const s = selectedCourse.startTime.slice(0, 16);
    const e = selectedCourse.endTime.slice(0, 16);
    const diff =
      Math.round((new Date(e).getTime() - new Date(s).getTime()) / 60000);
    setDurationMinutes(diff > 0 ? diff : 90);
    setForm({
      title: selectedCourse.title || "",
      startTime: s,
      endTime: e,
      coachId: selectedCourse.coachId || "",
      classId: selectedCourse.classId,
      location: selectedCourse.location || "",
      maxStudents: selectedCourse.maxStudents,
      description: selectedCourse.description || "",
    });
    setEditMode(true);
  }

  // 将 Date 对象格式化为 datetime-local 所需的 YYYY-MM-DDTHH:MM 格式（本地时间）
  function formatDateTimeLocal(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  // 点击日历空白处：根据点击时间创建课程（默认 90 分钟）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleDateClick(info: any) {
    const start = info.date as Date;
    const startStr = formatDateTimeLocal(start);
    const endStr = computeEndTime(startStr, 90);
    resetForm();
    setDurationMinutes(90);
    setForm((prev) => ({
      ...prev,
      startTime: startStr,
      endTime: endStr,
    }));
    setCreateDialogOpen(true);
  }

  // 拖拽选择时间段创建课程
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleSelect(info: any) {
    const start = info.start as Date;
    const end = info.end as Date;
    const startStr = formatDateTimeLocal(start);
    const endStr = formatDateTimeLocal(end);
    const diff = Math.round((end.getTime() - start.getTime()) / 60000);
    resetForm();
    setDurationMinutes(diff > 0 ? diff : 90);
    setForm((prev) => ({
      ...prev,
      startTime: startStr,
      endTime: endStr,
    }));
    setCreateDialogOpen(true);
  }

  // 拖动课程调整时间
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleEventDrop(info: any) {
    const courseId = info.event.id as string;
    const newStart = info.event.start as Date;
    const newEnd = info.event.end as Date;
    if (!newStart || !newEnd) return;

    const startStr = formatDateTimeLocal(newStart);
    const endStr = formatDateTimeLocal(newEnd);

    const res = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: startStr, endTime: endStr }),
    });

    if (!res.ok) {
      alert("调整课程时间失败");
      info.revert();
    } else {
      fetchCourses();
    }
  }

  // 调整课程时长
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleEventResize(info: any) {
    const courseId = info.event.id as string;
    const newStart = info.event.start as Date;
    const newEnd = info.event.end as Date;
    if (!newStart || !newEnd) return;

    const startStr = formatDateTimeLocal(newStart);
    const endStr = formatDateTimeLocal(newEnd);

    const res = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: startStr, endTime: endStr }),
    });

    if (!res.ok) {
      alert("调整课程时长失败");
      info.revert();
    } else {
      fetchCourses();
    }
  }

  // 新建课程
  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setCreateDialogOpen(false);
      resetForm();
      fetchCourses();
    } else {
      alert("创建失败");
    }
  }

  // 更新课程
  async function handleUpdateCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;

    const res = await fetch(`/api/courses/${selectedCourse.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updated = await res.json();
      setSelectedCourse(updated);
      setEditMode(false);
      fetchCourses();
    } else {
      alert("更新失败");
    }
  }

  // 删除课程
  async function handleDeleteCourse(id: string) {
    if (!confirm("确定删除该课程吗？此操作不可恢复。")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    setDialogOpen(false);
    fetchCourses();
  }

  function resetForm() {
    setDurationMinutes(90);
    setForm({
      title: "",
      startTime: "",
      endTime: "",
      coachId: "",
      classId: "",
      location: "",
      maxStudents: 30,
      description: "",
    });
  }

  // 根据开始时间和课程时长计算结束时间（使用本地时间避免时区偏移）
  function computeEndTime(startTime: string, duration: number) {
    if (!startTime) return "";
    const d = new Date(startTime);
    d.setMinutes(d.getMinutes() + duration);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  function openCreateDialog() {
    resetForm();
    setCreateDialogOpen(true);
  }

  // 根据班级和开始时间自动生成课程名称
  function generateAutoTitle(classId: string, startTime: string) {
    if (!classId || !startTime) return "";
    const cls = classes.find((c) => c.id === classId);
    const dateStr = new Date(startTime).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return `${cls?.name || "未命名课程"} ${dateStr}`;
  }

  // 课程表单 JSX（复用）- 使用渲染函数避免 static-components 警告
  function renderCourseForm(
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string
  ) {
    return (
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label className="text-[13px]">所属班级 *</Label>
          <select
            required
            value={form.classId}
            onChange={(e) => {
              const newClassId = e.target.value;
              setForm((prev) => ({
                ...prev,
                classId: newClassId,
                title: !editMode && prev.startTime
                  ? generateAutoTitle(newClassId, prev.startTime)
                  : prev.title,
              }));
            }}
            className="w-full bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
          >
            <option value="">请选择班级</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {classes.length === 0 && (
            <p className="text-xs text-[#FF3B30]">
              暂无可选班级，请先创建班级
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-[13px]">开始时间 *</Label>
          <Input
            type="datetime-local" max="9999-12-31T23:59"
            required
            value={form.startTime}
            onChange={(e) => {
              const newStart = e.target.value;
              setForm((prev) => ({
                ...prev,
                startTime: newStart,
                endTime: computeEndTime(newStart, durationMinutes),
                title: !editMode && prev.classId
                  ? generateAutoTitle(prev.classId, newStart)
                  : prev.title,
              }));
            }}
            className="h-8 text-sm bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[13px]">课程时长（分钟）*</Label>
          <Input
            type="number"
            min={1}
            required
            value={durationMinutes}
            onChange={(e) => {
              const newDuration = parseInt(e.target.value) || 90;
              setDurationMinutes(newDuration);
              setForm((prev) => ({
                ...prev,
                endTime: computeEndTime(prev.startTime, newDuration),
              }));
            }}
            className="h-8 text-sm bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[13px]">结束时间</Label>
          <Input
            type="datetime-local" max="9999-12-31T23:59"
            value={form.endTime}
            disabled
            className="h-8 text-sm bg-black/[0.06] border-0 rounded-[10px] disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
        {form.startTime && form.endTime && (
          <p className="text-xs text-black/40">
            {new Date(form.startTime).toLocaleString("zh-CN", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ~{" "}
            {new Date(form.endTime).toLocaleString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        <div className="space-y-1">
          <Label className="text-[13px]">课程名称</Label>
          <Input
            value={form.title}
            disabled={!editMode}
            onChange={(e) => editMode && setForm({ ...form, title: e.target.value })}
            className="h-8 text-sm bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {!editMode && (
            <p className="text-xs text-black/40">选择班级和开始时间后自动生成</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-[13px]">教练</Label>
          <select
            value={form.coachId}
            onChange={(e) =>
              setForm({ ...form, coachId: e.target.value })
            }
            className="w-full bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
          >
            <option value="">请选择教练</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-[13px]">地点</Label>
          <Input
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            className="h-8 text-sm bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[13px]">人数上限</Label>
          <Input
            type="number"
            value={form.maxStudents}
            onChange={(e) =>
              setForm({
                ...form,
                maxStudents: parseInt(e.target.value) || 0,
              })
            }
            className="h-8 text-sm bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[13px]">备注</Label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={2}
            className="w-full bg-black/[0.06] border-0 rounded-[10px] px-2 py-1.5 text-sm resize-none focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1] h-8 text-sm"
          >
            {submitLabel}
          </Button>
          {editMode && (
            <Button
              type="button"
              variant="outline"
              className="h-8 text-sm rounded-full"
              onClick={() => setEditMode(false)}
            >
              取消
            </Button>
          )}
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* 视图切换 + 内容 */}
      <Card className="flex-1 p-4 overflow-hidden flex flex-col">
        {/* 视图切换按钮 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 bg-black/[0.06] rounded-full p-0.5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                viewMode === "calendar"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#1D1D1F] hover:bg-black/[0.06]"
              }`}
            >
              日历
            </button>
            <button
              onClick={() => setViewMode("schedule")}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                viewMode === "schedule"
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#1D1D1F] hover:bg-black/[0.06]"
              }`}
            >
              周课表
            </button>
          </div>
          {viewMode === "schedule" && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const d = new Date(scheduleWeekStart);
                  d.setDate(d.getDate() - 7);
                  setScheduleWeekStart(d);
                }}
                className="h-7 px-2 text-xs rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
              >
                上一周
              </Button>
              <Button
                onClick={() => {
                  const now = new Date();
                  const day = now.getDay();
                  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                  const monday = new Date(now);
                  monday.setDate(diff);
                  monday.setHours(0, 0, 0, 0);
                  setScheduleWeekStart(monday);
                }}
                className="h-7 px-2 text-xs rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
              >
                本周
              </Button>
              <Button
                onClick={() => {
                  const d = new Date(scheduleWeekStart);
                  d.setDate(d.getDate() + 7);
                  setScheduleWeekStart(d);
                }}
                className="h-7 px-2 text-xs rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
              >
                下一周
              </Button>
              <span className="text-xs text-[#6E6E73] ml-1">
                {scheduleWeekStart.toLocaleDateString("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                })}
                {" ~ "}
                {new Date(
                  scheduleWeekStart.getTime() + 6 * 86400000
                ).toLocaleDateString("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {viewMode === "calendar" ? (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locale={zhCnLocale}
            firstDay={1}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            events={events}
            eventClick={handleEventClick}
            height="100%"
            editable={true}
            selectable={true}
            selectMirror={true}
            dateClick={handleDateClick}
            select={handleSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            customButtons={{
              createCourse: {
                text: "新建课程",
                click: openCreateDialog,
              },
            }}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "createCourse dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "今天",
              month: "月",
              week: "周",
              day: "日",
            }}
          />
        ) : (
          <WeeklySchedule
            courses={courses}
            weekStart={scheduleWeekStart}
            onCourseClick={(course) => {
              setSelectedCourse(course);
              setEditMode(false);
              setDialogOpen(true);
            }}
            onCellClick={(date, classId) => {
              const startStr = formatDateTimeLocal(date);
              const endStr = computeEndTime(startStr, 90);
              resetForm();
              setDurationMinutes(90);
              setForm((prev) => ({
                ...prev,
                classId,
                startTime: startStr,
                endTime: endStr,
                title: generateAutoTitle(classId, startStr),
              }));
              setCreateDialogOpen(true);
            }}
            onCourseDrop={async (course, newDate, newClassId) => {
              const oldStart = new Date(course.startTime);
              const oldEnd = new Date(course.endTime);
              const diff = oldEnd.getTime() - oldStart.getTime();

              const newStart = new Date(newDate);
              newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
              const newEnd = new Date(newStart.getTime() + diff);

              const startStr = formatDateTimeLocal(newStart);
              const endStr = formatDateTimeLocal(newEnd);

              const payload: Record<string, unknown> = {
                startTime: startStr,
                endTime: endStr,
              };
              if (newClassId && newClassId !== course.classId) {
                payload.classId = newClassId;
              }

              const res = await fetch(`/api/courses/${course.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (!res.ok) {
                alert("调整课程失败");
              } else {
                fetchCourses();
              }
            }}
          />
        )}
      </Card>

      {/* 新建课程弹窗 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-[20px]">
          <DialogHeader>
            <DialogTitle>新建课程</DialogTitle>
          </DialogHeader>
          {renderCourseForm(handleCreateCourse, "创建课程")}
        </DialogContent>
      </Dialog>

      {/* 课程详情/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-l-[20px] shadow-[-8px_0_40px_rgba(0,0,0,0.08)]">
          {editMode ? (
            <>
              <DialogHeader>
                <DialogTitle>编辑课程</DialogTitle>
              </DialogHeader>
              {renderCourseForm(handleUpdateCourse, "保存修改")}
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedCourse && (
                    <>
                      <span>{selectedCourse.title || "未命名课程"}</span>
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>
              {selectedCourse && (
                <div className="space-y-4 py-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#6E6E73]">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        {new Date(
                          selectedCourse.startTime
                        ).toLocaleDateString("zh-CN")}
                      </span>
                      <span>
                        {new Date(
                          selectedCourse.startTime
                        ).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        ~
                        {new Date(
                          selectedCourse.endTime
                        ).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {selectedCourse.location && (
                      <div className="flex items-center gap-2 text-[#6E6E73]">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedCourse.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[#6E6E73]">
                      <span>班级: {selectedCourse.class?.name || "未知"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6E6E73]">
                      <span>人数上限: {selectedCourse.maxStudents} 人</span>
                    </div>
                    {selectedCourse.coach && (
                      <div className="text-[#6E6E73]">
                        教练: {selectedCourse.coach.name}
                      </div>
                    )}
                    {selectedCourse.description && (
                      <div className="text-[#6E6E73] bg-black/[0.06] rounded-[10px] p-3 mt-2">
                        {selectedCourse.description}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2">
                {selectedCourse && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/attendance/rollcall?courseId=${selectedCourse!.id}`
                        )
                      }
                    >
                      <ClipboardCheck className="w-4 h-4 mr-1" />
                      开始点名
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openEditMode}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDeleteCourse(selectedCourse!.id)
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      删除
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 周课表组件：横轴为周一~周日，纵轴为班级
function WeeklySchedule({
  courses,
  weekStart,
  onCourseClick,
  onCellClick,
  onCourseDrop,
}: {
  courses: Course[];
  weekStart: Date;
  onCourseClick: (course: Course) => void;
  onCellClick: (date: Date, classId: string) => void;
  onCourseDrop: (course: Course, newDate: Date, newClassId: string) => void;
}) {
  const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekCourses = courses.filter((c) => {
    const d = new Date(c.startTime);
    return d >= weekStart && d < weekEnd;
  });

  const scheduleData = useMemo(() => {
    const map = new Map<
      string,
      { classId: string; className: string; byDay: Course[][] }
    >();
    weekCourses.forEach((course) => {
      const classId = course.classId;
      const className = course.class?.name || "未命名班级";
      if (!map.has(classId)) {
        map.set(classId, {
          classId,
          className,
          byDay: Array.from({ length: 7 }, () => []),
        });
      }
      const data = map.get(classId)!;
      const dayIndex = new Date(course.startTime).getDay();
      const idx = dayIndex === 0 ? 6 : dayIndex - 1;
      data.byDay[idx].push(course);
    });
    return Array.from(map.values());
  }, [weekCourses]);

  // 获取某单元格对应的日期
  function getCellDate(dayIndex: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIndex);
    return d;
  }

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b border-black/[0.04]">
            <th className="text-left p-2 text-[#6E6E73] font-medium w-28 min-w-[7rem]">
              班级
            </th>
            {weekDays.map((day, i) => (
              <th
                key={day}
                className="text-left p-2 text-[#6E6E73] font-medium min-w-[8rem]"
              >
                <div>{day}</div>
                <div className="text-xs font-normal text-black/40">
                  {new Date(
                    weekStart.getTime() + i * 86400000
                  ).toLocaleDateString("zh-CN", {
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scheduleData.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="text-center py-12 text-[#A1A1A6]"
              >
                本周暂无课程
              </td>
            </tr>
          )}
          {scheduleData.map(({ classId, className, byDay }) => (
            <tr key={classId} className="border-b border-black/[0.04]">
              <td className="p-2 font-medium text-[#1D1D1F] align-top">
                {className}
              </td>
              {byDay.map((dayCourses, i) => (
                <td
                  key={i}
                  className="p-1 align-top min-h-[3rem]"
                  onClick={(e) => {
                    // 仅点击空白处时触发创建，避免点击课程卡片时冒泡
                    if (e.target === e.currentTarget) {
                      onCellClick(getCellDate(i), classId);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const courseId = e.dataTransfer.getData("courseId");
                    const droppedCourse = weekCourses.find(
                      (c) => c.id === courseId
                    );
                    if (droppedCourse) {
                      onCourseDrop(droppedCourse, getCellDate(i), classId);
                    }
                  }}
                >
                  {dayCourses.map((c) => {
                    const baseColor = getCourseColor(
                      c.class?.name || "",
                      c.coach?.name
                    );
                    const isPast = new Date(c.endTime) < new Date();
                    const hasChecked = c.hasAttendanceChecked;

                    let bgColor = baseColor;
                    let hoverBgColor = baseColor;
                    let textColor = "#fff";
                    let suffix = "";

                    if (isPast && !hasChecked) {
                      bgColor = "#d1d5db";
                      hoverBgColor = "#c4c8ce";
                      textColor = "#6b7280";
                      suffix = " ⚠️ 未点名";
                    } else if (hasChecked) {
                      suffix = " ✅";
                    }

                    return (
                      <button
                        key={c.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("courseId", c.id);
                        }}
                        onClick={() => onCourseClick(c)}
                        className="w-full text-left mb-1 p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{
                          backgroundColor: bgColor,
                          borderLeft: hasChecked
                            ? "3px solid #34C759"
                            : isPast && !hasChecked
                              ? "3px solid #9ca3af"
                              : undefined,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            hoverBgColor;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                            bgColor;
                        }}
                      >
                        <div
                          className="text-xs font-medium"
                          style={{ color: textColor }}
                        >
                          {new Date(c.startTime).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" ~ "}
                          {new Date(c.endTime).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {c.coach?.name && ` · ${c.coach.name}`}
                          {suffix}
                        </div>
                        {c.location && (
                          <div
                            className="text-[10px] mt-0.5 flex items-center gap-0.5"
                            style={{ color: textColor }}
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            {c.location}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
