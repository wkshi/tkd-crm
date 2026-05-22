"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Student {
  id: string;
  name: string;
  gender: string;
  enrollmentDate: string;
  remainingSessions: number;
  expiryDate: string | null;
  status: string;
  photoUrl: string | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const pageSize = 20;

  useEffect(() => {
    fetchStudents();
  }, [search, page, statusFilter]);

  async function fetchStudents() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data.students || []);
    setTotal(data.total || 0);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除该学员吗？此操作将软删除学员记录。")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    fetchStudents();
  }

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    active: { label: "在籍", variant: "default" },
    inactive: { label: "已结业", variant: "secondary" },
    suspended: { label: "暂停", variant: "destructive" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">学员管理</h2>
        <Link href="/students/new">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            新增学员
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索学员姓名..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">全部状态</option>
          <option value="active">在籍</option>
          <option value="inactive">已结业</option>
          <option value="suspended">暂停</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[200px]">姓名</TableHead>
              <TableHead>性别</TableHead>
              <TableHead>入学时间</TableHead>
              <TableHead>剩余课时</TableHead>
              <TableHead>到期时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <Link href={`/students/${student.id}`} className="font-medium text-slate-800 hover:text-red-600">
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>{student.gender === "male" ? "男" : "女"}</TableCell>
                <TableCell>{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString("zh-CN") : "-"}</TableCell>
                <TableCell className={student.remainingSessions <= 5 ? "text-red-600 font-bold" : ""}>
                  {student.remainingSessions}
                </TableCell>
                <TableCell className={student.expiryDate && new Date(student.expiryDate) < new Date() ? "text-red-600" : ""}>
                  {student.expiryDate ? new Date(student.expiryDate).toLocaleDateString("zh-CN") : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusMap[student.status]?.variant || "default"}>
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
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  暂无学员数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <span className="text-sm text-slate-500">共 {total} 条</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              上一页
            </Button>
            <span className="text-sm text-slate-600 px-2 py-1">{page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= total}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
