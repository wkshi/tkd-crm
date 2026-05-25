"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  ArrowLeft,
  User,
  TrendingUp,
  Clock,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  gender: string;
  beltLevel: string;
  remainingSessions: number;
}

interface AttendanceRecord {
  id: string;
  attendanceDate: string;
  status: string;
  course: {
    id: string;
    title: string;
    startTime: string;
    class: { id: string; name: string };
  } | null;
}

const statusMap: Record<string, { label: string; color: string }> = {
  present: { label: "出勤", color: "bg-green-500/10 text-green-700" },
  absent: { label: "缺勤", color: "bg-red-500/10 text-[#FF3B30]" },
  late: { label: "迟到", color: "bg-yellow-500/10 text-yellow-700" },
  leave: { label: "请假", color: "bg-blue-500/10 text-blue-700" },
  unmarked: { label: "未点名", color: "bg-black/[0.06] text-[#6E6E73]" },
};

const beltLevelMap: Record<string, string> = {
  white: "白带",
  white_yellow: "白黄带",
  yellow: "黄带",
  yellow_green: "黄绿带",
  green: "绿带",
  green_blue: "绿蓝带",
  blue: "蓝带",
  blue_red: "蓝红带",
  red: "红带",
  red_black: "红黑带",
  black: "黑带",
};

export default function StudentAttendancePage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentRes, attendanceRes] = await Promise.all([
        fetch(`/api/students/${studentId}`),
        fetch(`/api/attendance?studentId=${studentId}`),
      ]);

      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudent(studentData);
      }

      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendances(attendanceData.attendances || []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchData]);

  const stats = {
    total: attendances.length,
    present: attendances.filter((a) => a.status === "present").length,
    absent: attendances.filter((a) => a.status === "absent").length,
    late: attendances.filter((a) => a.status === "late").length,
    leave: attendances.filter((a) => a.status === "leave").length,
    unmarked: attendances.filter((a) => a.status === "unmarked").length,
  };

  return (
    <div className="space-y-6">
      {/* 返回链接 */}
      <Link
        href="/attendance"
        className="inline-flex items-center gap-1 text-sm text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回考勤查询
      </Link>

      {/* 学员信息 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1D1D1F]">
          {student?.name || "学员考勤详情"}
        </h2>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white rounded-[14px] shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs text-[#6E6E73]">出勤次数</p>
              <p className="text-xl font-semibold text-[#1D1D1F]">{stats.present}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white rounded-[14px] shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#0071E3]" />
            </div>
            <div>
              <p className="text-xs text-[#6E6E73]">缺勤次数</p>
              <p className="text-xl font-semibold text-[#1D1D1F]">{stats.absent}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white rounded-[14px] shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-xs text-[#6E6E73]">迟到次数</p>
              <p className="text-xl font-semibold text-[#1D1D1F]">{stats.late}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white rounded-[14px] shadow-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black/[0.06] flex items-center justify-center">
              <User className="w-5 h-5 text-[#1D1D1F]" />
            </div>
            <div>
              <p className="text-xs text-[#6E6E73]">剩余课时</p>
              <p className="text-xl font-semibold text-[#1D1D1F]">
                {student?.remainingSessions ?? "-"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 学员详情 */}
      {student && (
        <Card className="p-4 bg-white rounded-[14px] shadow-none">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-[#6E6E73]">性别：</span>
              <span className="text-[#1D1D1F]">
                {student.gender === "male" ? "男" : "女"}
              </span>
            </div>
            <div>
              <span className="text-[#6E6E73]">带色：</span>
              <span className="text-[#1D1D1F]">
                {beltLevelMap[student.beltLevel] || student.beltLevel || "-"}
              </span>
            </div>
            <div>
              <span className="text-[#6E6E73]">请假次数：</span>
              <span className="text-[#1D1D1F]">{stats.leave}</span>
            </div>
            <div>
              <span className="text-[#6E6E73]">未点名：</span>
              <span className="text-[#1D1D1F]">{stats.unmarked}</span>
            </div>
          </div>
        </Card>
      )}

      {/* 考勤记录表格 */}
      <Card className="overflow-hidden bg-white rounded-[20px] shadow-none">
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
            {attendances.map((a) => (
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
