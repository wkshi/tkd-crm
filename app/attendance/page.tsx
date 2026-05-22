"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CalendarDays, User, BookOpen } from "lucide-react";

interface AttendanceRecord {
  id: string;
  attendanceDate: string;
  status: string;
  student: { id: string; name: string } | null;
  course: { id: string; title: string; startTime: string } | null;
}

const statusMap: Record<string, { label: string; color: string }> = {
  present: { label: "出勤", color: "bg-green-50 text-green-700" },
  absent: { label: "缺勤", color: "bg-red-50 text-red-700" },
  late: { label: "迟到", color: "bg-yellow-50 text-yellow-700" },
  leave: { label: "请假", color: "bg-blue-50 text-blue-700" },
  unmarked: { label: "未点名", color: "bg-slate-100 text-slate-600" },
};

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchAttendances() {
    setLoading(true);
    const params = new URLSearchParams();
    if (studentId.trim()) params.set("studentId", studentId.trim());
    if (courseId.trim()) params.set("courseId", courseId.trim());

    const res = await fetch(`/api/attendance?${params}`);
    const data = await res.json();
    setAttendances(data.attendances || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAttendances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">考勤查询</h2>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="按学员ID查询..."
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1 min-w-[240px]">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="按课程ID查询..."
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={fetchAttendances}
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            <Search className="w-4 h-4 mr-2" />
            查询
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>学员</TableHead>
              <TableHead>课程</TableHead>
              <TableHead>考勤日期</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.map((a) => (
              <TableRow key={a.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  {a.student?.name || "-"}
                </TableCell>
                <TableCell>{a.course?.title || "-"}</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(a.attendanceDate).toLocaleDateString("zh-CN")}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusMap[a.status]?.color
                    }`}
                  >
                    {statusMap[a.status]?.label || a.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {attendances.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-slate-400"
                >
                  暂无考勤记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
