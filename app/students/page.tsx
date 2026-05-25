"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, GraduationCap } from "lucide-react";

interface Student {
  id: string;
  name: string;
  gender: string;
  enrollmentDate: string;
  remainingSessions: number;
  expiryDate: string | null;
  status: string;
  photoUrl: string | null;
  classes: { id: string; name: string }[];
}

interface ClassItem {
  id: string;
  name: string;
}

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [sessionsFilter, setSessionsFilter] = useState(searchParams.get("sessions") || "");
  const [expiryFilter, setExpiryFilter] = useState(searchParams.get("expiry") || "");
  const [classFilter, setClassFilter] = useState("");
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const router = useRouter();

  const pageSize = 20;

  // 加载班级列表（用于班级筛选下拉）
  useEffect(() => {
    fetch("/api/classes?pageSize=9999")
      .then((res) => res.json())
      .then((data) => setClassesList(data.classes || []))
      .catch(() => setClassesList([]));
  }, []);

  const fetchStudents = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (sessionsFilter) params.set("sessions", sessionsFilter);
    if (expiryFilter) params.set("expiry", expiryFilter);
    if (classFilter) params.set("classId", classFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data.students || []);
    setTotal(data.total || 0);
  }, [search, page, statusFilter, sessionsFilter, expiryFilter, classFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  async function handleDelete(id: string) {
    if (!confirm("确定删除该学员吗？此操作将软删除学员记录。")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    fetchStudents();
  }

  const statusMap: Record<string, { label: string; className: string }> = {
    active: { label: "在籍", className: "bg-[#34C759]/10 text-[#34C759]" },
    inactive: { label: "已结业", className: "bg-[#8E8E93]/10 text-[#8E8E93]" },
    suspended: { label: "暂停", className: "bg-[#FF9500]/10 text-[#FF9500]" },
  };

  const activeFilterCount = [
    statusFilter,
    sessionsFilter,
    expiryFilter,
    classFilter,
  ].filter(Boolean).length;

  function resetFilters() {
    setStatusFilter("");
    setSessionsFilter("");
    setExpiryFilter("");
    setClassFilter("");
    setSearch("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Link href="/students/new">
          <Button className="rounded-full bg-black/[0.06] text-[#1D1D1F] px-5 py-2.5 hover:bg-black/[0.1]">
            <Plus className="w-4 h-4 mr-2" />
            新增学员
          </Button>
        </Link>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
          <Input
            placeholder="搜索学员姓名..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
        >
          <option value="">全部状态</option>
          <option value="active">在籍</option>
          <option value="inactive">已结业</option>
          <option value="suspended">暂停</option>
        </select>

        <select
          value={sessionsFilter}
          onChange={(e) => { setSessionsFilter(e.target.value); setPage(1); }}
          className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
        >
          <option value="">全部课时</option>
          <option value="plenty">&gt; 20节（充足）</option>
          <option value="normal">10-20节（正常）</option>
          <option value="low">6-9节（不足）</option>
          <option value="critical">≤ 5节（预警）</option>
          <option value="empty">≤ 0节（已用完）</option>
        </select>

        <select
          value={expiryFilter}
          onChange={(e) => { setExpiryFilter(e.target.value); setPage(1); }}
          className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
        >
          <option value="">全部到期时间</option>
          <option value="7days">7天内到期</option>
          <option value="30days">30天内到期</option>
          <option value="expired">已过期</option>
          <option value="unset">未设置</option>
        </select>

        <select
          value={classFilter}
          onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
          className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
        >
          <option value="">全部班级</option>
          {classesList.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-[13px] font-medium text-[#0071E3] hover:underline bg-transparent border-none cursor-pointer px-2"
          >
            清除筛选 ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="bg-white rounded-[20px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black/[0.04]">
              <TableHead className="w-[160px] text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">姓名</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">性别</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">入学时间</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">剩余课时</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">到期时间</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">班级</TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">状态</TableHead>
              <TableHead className="text-right text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="hover:bg-black/[0.04] border-b border-black/[0.04]">
                <TableCell>
                  <Link href={`/students/${student.id}`} className="font-medium text-[#1D1D1F] hover:text-[#6E6E73]">
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>{student.gender === "male" ? "男" : "女"}</TableCell>
                <TableCell>{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString("zh-CN") : "-"}</TableCell>
                <TableCell className={student.remainingSessions <= 5 ? "text-[#FF9500] font-bold" : ""}>
                  {student.remainingSessions}
                </TableCell>
                <TableCell className={student.expiryDate && new Date(student.expiryDate) < new Date() ? "text-[#FF3B30]" : ""}>
                  {student.expiryDate ? new Date(student.expiryDate).toLocaleDateString("zh-CN") : "-"}
                </TableCell>
                <TableCell>
                  {student.classes && student.classes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {student.classes.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/[0.04] text-[12px] text-[#6E6E73]"
                        >
                          <GraduationCap className="w-3 h-3" />
                          {c.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#A1A1A6] text-[13px]">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={statusMap[student.status]?.className || ""}>
                    {statusMap[student.status]?.label || student.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/students/${student.id}/edit`)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                      className="text-[#FF3B30] hover:text-[#FF3B30]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-[#A1A1A6]">
                  暂无学员数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.04]">
          <span className="text-sm text-[#6E6E73]">共 {total} 条</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full"
            >
              上一页
            </Button>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/[0.06] text-[#1D1D1F] text-sm font-medium">{page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= total}
              className="rounded-full"
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
