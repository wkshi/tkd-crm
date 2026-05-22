"use client";

import { useEffect, useState, useCallback } from "react";
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

 const fetchStudents = useCallback(async () => {
 const params = new URLSearchParams();
 if (search) params.set("search", search);
 if (statusFilter) params.set("status", statusFilter);
 params.set("page", String(page));
 params.set("pageSize", String(pageSize));

 const res = await fetch(`/api/students?${params}`);
 const data = await res.json();
 setStudents(data.students || []);
 setTotal(data.total || 0);
 }, [search, page, statusFilter]);

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

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h2 className="text-2xl font-bold text-[#1D1D1F]">学员管理</h2>
 <Link href="/students/new">
 <Button className="rounded-full bg-black/[0.06] text-[#1D1D1F] px-5 py-2.5 hover:bg-black/[0.1]">
 <Plus className="w-4 h-4 mr-2" />
 新增学员
 </Button>
 </Link>
 </div>

 <div className="flex items-center gap-4 p-4">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
 <Input
 placeholder="搜索学员姓名..."
 value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
 className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
 />
 </div>
 <select
 value={statusFilter}
 onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
 className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white focus:outline-none"
>
 <option value="">全部状态</option>
 <option value="active">在籍</option>
 <option value="inactive">已结业</option>
 <option value="suspended">暂停</option>
 </select>
 </div>

 <div className="bg-white rounded-[20px] overflow-hidden">
 <Table>
 <TableHeader>
 <TableRow className="border-b border-black/[0.04]">
 <TableHead className="w-[200px] text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">姓名</TableHead>
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">性别</TableHead>
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">入学时间</TableHead>
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">剩余课时</TableHead>
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">到期时间</TableHead>
 <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">状态</TableHead>
 <TableHead className="text-right text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">操作</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {students.map((student) => (
 <TableRow key={student.id} className="hover:bg-black/[0.04] border-b border-black/[0.04]">
 <TableCell>
 <Link href={`/students/${student.id}`} className="font-medium text-[#1D1D1F] hover:text-[#D9264A]">
 {student.name}
 </Link>
 </TableCell>
 <TableCell>{student.gender === "male" ? "男" : "女"}</TableCell>
 <TableCell>{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString("zh-CN") : "-"}</TableCell>
 <TableCell className={student.remainingSessions <= 5 ? "text-[#D9264A] font-bold" : ""}>
 {student.remainingSessions}
 </TableCell>
 <TableCell className={student.expiryDate && new Date(student.expiryDate) < new Date() ? "text-[#D9264A]" : ""}>
 {student.expiryDate ? new Date(student.expiryDate).toLocaleDateString("zh-CN") : "-"}
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
 className="text-[#D9264A] hover:text-[#D9264A]"
>
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))}
 {students.length === 0 && (
 <TableRow>
 <TableCell colSpan={7} className="text-center py-12 text-[#A1A1A6]">
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
 disabled={page * pageSize>= total}
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
