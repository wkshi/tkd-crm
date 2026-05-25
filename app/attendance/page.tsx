"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { Search, CalendarDays, User, BookOpen, X } from "lucide-react";

interface AttendanceRecord {
  id: string;
  attendanceDate: string;
  status: string;
  student: { id: string; name: string } | null;
  course: { id: string; title: string; startTime: string; class: { id: string; name: string } } | null;
}

interface ClassItem {
  id: string;
  name: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  present: { label: "出勤", color: "bg-green-500/10 text-green-700" },
  absent: { label: "缺勤", color: "bg-red-500/10 text-[#FF3B30]" },
  late: { label: "迟到", color: "bg-yellow-500/10 text-yellow-700" },
  leave: { label: "请假", color: "bg-blue-500/10 text-blue-700" },
  unmarked: { label: "未点名", color: "bg-black/[0.06] text-[#6E6E73]" },
};

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [yearFilter, setYearFilter] = useState(
    searchParams.get("year") || String(currentYear)
  );
  const [monthFilter, setMonthFilter] = useState(
    searchParams.get("month") || String(currentMonth)
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // 年份选项基于实际考勤数据（去重、降序），始终保留"全部年份"
  const yearOptions = useMemo(() => {
    const years = availableYears.length > 0
      ? availableYears.map((y) => String(y))
      : [String(currentYear)];
    return ["", ...years];
  }, [availableYears, currentYear]);

  const monthOptions = [
    { value: "", label: "全部月份" },
    { value: "1", label: "1月" },
    { value: "2", label: "2月" },
    { value: "3", label: "3月" },
    { value: "4", label: "4月" },
    { value: "5", label: "5月" },
    { value: "6", label: "6月" },
    { value: "7", label: "7月" },
    { value: "8", label: "8月" },
    { value: "9", label: "9月" },
    { value: "10", label: "10月" },
    { value: "11", label: "11月" },
    { value: "12", label: "12月" },
  ];

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (studentName.trim()) params.set("studentName", studentName.trim());
    if (className.trim()) params.set("className", className.trim());
    if (yearFilter) params.set("year", yearFilter);
    if (monthFilter) params.set("month", monthFilter);

    const res = await fetch(`/api/attendance?${params}`);
    const data = await res.json();
    setAttendances(data.attendances || []);
    setAvailableYears(data.availableYears || []);
    setLoading(false);
  }, [studentName, className, yearFilter, monthFilter]);

  const fetchClasses = useCallback(async () => {
    const res = await fetch("/api/classes?pageSize=9999&status=active");
    const data = await res.json();
    setClasses(data.classes || []);
  }, []);

  useEffect(() => {
    fetchClasses(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchClasses]);

  useEffect(() => {
    fetchAttendances(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchAttendances]);

  // 按学员聚合考勤记录
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      { student: AttendanceRecord["student"]; records: AttendanceRecord[] }
    >();
    attendances.forEach((a) => {
      const key = a.student?.id || "unknown";
      if (!map.has(key)) {
        map.set(key, { student: a.student, records: [] });
      }
      map.get(key)!.records.push(a);
    });
    return Array.from(map.values());
  }, [attendances]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1D1D1F]">考勤查询</h2>
      </div>

      {/* 查询条件 */}
      <Card className="p-4 bg-white rounded-[20px] shadow-none">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
            <Input
              placeholder="按学员姓名查询..."
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <div className="relative flex-1 min-w-[240px]">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
            <Input
              placeholder="按班级名称查询..."
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              list="class-options"
              className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
            <datalist id="class-options">
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name} />
              ))}
            </datalist>
          </div>
          {/* 年份筛选 */}
          <div className="relative min-w-[120px]">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full h-10 px-3 bg-black/[0.06] border-0 rounded-[10px] text-sm text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white appearance-none cursor-pointer"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y ? `${y}年` : "全部年份"}
                </option>
              ))}
            </select>
          </div>
          {/* 月份筛选 */}
          <div className="relative min-w-[100px]">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full h-10 px-3 bg-black/[0.06] border-0 rounded-[10px] text-sm text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white appearance-none cursor-pointer"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={fetchAttendances}
            className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
            disabled={loading}
          >
            <Search className="w-4 h-4 mr-2" />
            查询
          </Button>
          <Button
            onClick={() => {
              setStudentName("");
              setClassName("");
              setYearFilter("");
              setMonthFilter("");
            }}
            variant="outline"
            className="rounded-full border-black/[0.08] text-[#6E6E73] hover:text-[#1D1D1F]"
          >
            <X className="w-4 h-4 mr-1.5" />
            清除
          </Button>
        </div>
      </Card>

      {/* 按学员聚合的考勤记录 */}
      {grouped.map(({ student, records }) => {
        const stats = {
          present: records.filter((r) => r.status === "present").length,
          absent: records.filter((r) => r.status === "absent").length,
          late: records.filter((r) => r.status === "late").length,
          leave: records.filter((r) => r.status === "leave").length,
        };
        return (
          <Card
            key={student?.id || "unknown"}
            className="bg-white rounded-[20px] shadow-none overflow-hidden"
          >
            {/* 学员头部 */}
            <div className="p-4 border-b border-black/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black/[0.06] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#1D1D1F]" />
                </div>
                <div>
                  {student ? (
                    <Link
                      href={`/attendance/students/${student.id}`}
                      className="font-medium text-[15px] text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
                    >
                      {student.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-[15px] text-[#1D1D1F]">未知学员</span>
                  )}
                  <p className="text-xs text-black/40">
                    共 {records.length} 条记录
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 text-xs">
                  {stats.present > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-700">
                      出勤 {stats.present}
                    </span>
                  )}
                  {stats.absent > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-[#FF3B30]">
                      缺勤 {stats.absent}
                    </span>
                  )}
                  {stats.late > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-700">
                      迟到 {stats.late}
                    </span>
                  )}
                  {stats.leave > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700">
                      请假 {stats.leave}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* 该学员的考勤记录表格 */}
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/[0.04]">
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    班级
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    课程时间
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    考勤日期
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    状态
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((a) => (
                  <TableRow
                    key={a.id}
                    className="hover:bg-black/[0.04] border-b border-black/[0.04]"
                  >
                    <TableCell>{a.course?.class?.name || "-"}</TableCell>
                    <TableCell className="text-sm text-[#6E6E73]">
                      {a.course
                        ? new Date(a.course.startTime).toLocaleString("zh-CN", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </TableCell>
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
              </TableBody>
            </Table>
          </Card>
        );
      })}

      {grouped.length === 0 && !loading && (
        <Card className="p-12 bg-white rounded-[20px] shadow-none text-center text-[#A1A1A6]">
          暂无考勤记录
        </Card>
      )}
    </div>
  );
}
