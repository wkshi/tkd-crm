"use client";

import { useEffect, useState, useCallback } from "react";
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
 present: { label: "出勤", color: "bg-green-500/10 text-green-700" },
 absent: { label: "缺勤", color: "bg-red-500/10 text-[#D9264A]" },
 late: { label: "迟到", color: "bg-yellow-500/10 text-yellow-700" },
 leave: { label: "请假", color: "bg-blue-500/10 text-blue-700" },
 unmarked: { label: "未点名", color: "bg-black/[0.06] text-[#6E6E73]" },
};

export default function AttendancePage() {
 const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
 const [studentId, setStudentId] = useState("");
 const [courseId, setCourseId] = useState("");
 const [loading, setLoading] = useState(false);

 const fetchAttendances = useCallback(async () => {
 setLoading(true);
 const params = new URLSearchParams();
 if (studentId.trim()) params.set("studentId", studentId.trim());
 if (courseId.trim()) params.set("courseId", courseId.trim());

 const res = await fetch(`/api/attendance?${params}`);
 const data = await res.json();
 setAttendances(data.attendances || []);
 setLoading(false);
 }, [studentId, courseId]);

 useEffect(() => {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 fetchAttendances();
 }, [fetchAttendances]);

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h2 className="text-2xl font-bold text-[#1D1D1F]">考勤查询</h2>
 </div>

 <Card className="p-4 bg-white rounded-[20px] shadow-none">
 <div className="flex flex-wrap items-center gap-4">
 <div className="relative flex-1 min-w-[240px]">
 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
 <Input
 placeholder="按学员ID查询..."
 value={studentId}
 onChange={(e) => setStudentId(e.target.value)}
 className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
 />
 </div>
 <div className="relative flex-1 min-w-[240px]">
 <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
 <Input
 placeholder="按课程ID查询..."
 value={courseId}
 onChange={(e) => setCourseId(e.target.value)}
 className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
 />
 </div>
 <Button
 onClick={fetchAttendances}
 className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
 disabled={loading}
>
 <Search className="w-4 h-4 mr-2" />
 查询
 </Button>
 </div>
 </Card>

 <Card className="overflow-hidden bg-white rounded-[20px] shadow-none">
 <Table>
 <TableHeader>
 <TableRow className="border-b border-black/[0.04]">
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">学员</TableHead>
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">课程</TableHead>
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">考勤日期</TableHead>
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">状态</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {attendances.map((a) => (
 <TableRow key={a.id} className="hover:bg-black/[0.04] border-b border-black/[0.04]">
 <TableCell className="font-medium">
 {a.student?.name || "-"}
 </TableCell>
 <TableCell>{a.course?.title || "-"}</TableCell>
 <TableCell>
 <span className="flex items-center gap-1 text-sm text-[#6E6E73]">
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
 className="text-center py-12 text-[#A1A1A6]"
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
