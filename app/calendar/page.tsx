"use client";

import { useEffect, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
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
  Users,
  Pencil,
  Trash2,
  ClipboardCheck,
} from "lucide-react";

// 课程类型颜色映射
const typeColorMap: Record<string, string> = {
  regular: "#3b82f6", // 蓝色
  exam_prep: "#a855f7", // 紫色
  camp: "#f97316", // 橙色
  competition: "#ef4444", // 红色
};

const typeLabelMap: Record<string, string> = {
  regular: "常规课",
  exam_prep: "考前集训",
  camp: "集训营",
  competition: "比赛",
};

// 教练数据类型
interface Coach {
  id: string;
  name: string;
}

// 课程数据类型
interface Course {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  coachId: string | null;
  location: string | null;
  maxStudents: number;
  description: string | null;
  coach?: { name: string } | null;
}

export default function CalendarPage() {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "regular",
    "exam_prep",
    "camp",
    "competition",
  ]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 新建/编辑课程表单状态
  const [form, setForm] = useState({
    title: "",
    type: "regular" as Course["type"],
    startTime: "",
    endTime: "",
    coachId: "",
    location: "",
    maxStudents: 30,
    description: "",
  });

  // 加载课程和教练数据
  useEffect(() => {
    fetchCourses();
    fetchCoaches();
  }, []);

  async function fetchCourses() {
    const res = await fetch("/api/courses?pageSize=9999");
    const data = await res.json();
    setCourses((data.courses || []) as Course[]);
  }

  async function fetchCoaches() {
    const res = await fetch("/api/coaches?pageSize=9999");
    const data = await res.json();
    setCoaches(data.coaches || []);
  }

  // 根据筛选条件生成日历事件
  const events = courses
    .filter((c) => selectedTypes.includes(c.type))
    .map((course) => ({
      id: course.id,
      title: course.title,
      start: course.startTime,
      end: course.endTime,
      backgroundColor: typeColorMap[course.type] || "#3b82f6",
      borderColor: typeColorMap[course.type] || "#3b82f6",
      extendedProps: { course },
    }));

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
    setForm({
      title: selectedCourse.title,
      type: selectedCourse.type as Course["type"],
      startTime: selectedCourse.startTime.slice(0, 16),
      endTime: selectedCourse.endTime.slice(0, 16),
      coachId: selectedCourse.coachId || "",
      location: selectedCourse.location || "",
      maxStudents: selectedCourse.maxStudents,
      description: selectedCourse.description || "",
    });
    setEditMode(true);
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
      setShowForm(false);
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

  // 切换课程类型筛选
  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function resetForm() {
    setForm({
      title: "",
      type: "regular",
      startTime: "",
      endTime: "",
      coachId: "",
      location: "",
      maxStudents: 30,
      description: "",
    });
  }

  // 课程表单 JSX（复用）- 使用渲染函数避免 static-components 警告
  function renderCourseForm(
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string
  ) {
    return (
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">课程名称 *</Label>
          <Input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">课程类型</Label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as Course["type"] })
            }
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="regular">常规课</option>
            <option value="exam_prep">考前集训</option>
            <option value="camp">集训营</option>
            <option value="competition">比赛</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">开始时间 *</Label>
          <Input
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) =>
              setForm({ ...form, startTime: e.target.value })
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">结束时间 *</Label>
          <Input
            type="datetime-local"
            required
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">教练</Label>
          <select
            value={form.coachId}
            onChange={(e) =>
              setForm({ ...form, coachId: e.target.value })
            }
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
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
          <Label className="text-xs">地点</Label>
          <Input
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">人数上限</Label>
          <Input
            type="number"
            value={form.maxStudents}
            onChange={(e) =>
              setForm({
                ...form,
                maxStudents: parseInt(e.target.value) || 0,
              })
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">备注</Label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm resize-none"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1 bg-red-600 hover:bg-red-700 h-8 text-sm"
          >
            {submitLabel}
          </Button>
          {editMode && (
            <Button
              type="button"
              variant="outline"
              className="h-8 text-sm"
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
      {/* 左侧边栏 */}
      <div className="w-[280px] shrink-0 space-y-6 overflow-y-auto pr-2">
        {/* 快速创建课程 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">快速创建</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "收起" : "展开"}
            </Button>
          </div>
          {showForm && renderCourseForm(handleCreateCourse, "创建课程")}
        </Card>

        {/* 课程类型筛选 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">课程筛选</h3>
          <div className="space-y-2">
            {Object.entries(typeLabelMap).map(([type, label]) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeColorMap[type] }}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      {/* 日历主体 */}
      <Card className="flex-1 p-4 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          locale={zhCnLocale}
          firstDay={1}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          events={events}
          eventClick={handleEventClick}
          height="100%"
          buttonText={{
            today: "今天",
            month: "月",
            week: "周",
            day: "日",
          }}
        />
      </Card>

      {/* 课程详情/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
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
                      <Badge
                        style={{
                          backgroundColor:
                            typeColorMap[selectedCourse.type] || "#3b82f6",
                        }}
                      >
                        {typeLabelMap[selectedCourse.type] ||
                          selectedCourse.type}
                      </Badge>
                      <span>{selectedCourse.title}</span>
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>
              {selectedCourse && (
                <div className="space-y-4 py-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
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
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedCourse.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>人数上限: {selectedCourse.maxStudents} 人</span>
                    </div>
                    {selectedCourse.coach && (
                      <div className="text-slate-600">
                        教练: {selectedCourse.coach.name}
                      </div>
                    )}
                    {selectedCourse.description && (
                      <div className="text-slate-600 bg-slate-50 rounded-lg p-3 mt-2">
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
                          `/attendance?courseId=${selectedCourse!.id}`
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
