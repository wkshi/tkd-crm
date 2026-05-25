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

// 教练数据类型
interface Coach {
  id: string;
  name: string;
  gender: string;
  joinDate: string;
  phone: string | null;
  status: string;
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const pageSize = 20;

  // 加载教练列表
  const fetchCoaches = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const res = await fetch(`/api/coaches?${params}`);
    const data = await res.json();
    setCoaches(data.coaches || []);
    setTotal(data.total || 0);
  }, [search, page, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCoaches();
  }, [fetchCoaches]);

  // 软删除教练
  async function handleDelete(id: string) {
    if (!confirm("确定删除该教练吗？此操作将软删除教练记录。")) return;
    await fetch(`/api/coaches/${id}`, { method: "DELETE" });
    fetchCoaches();
  }

  const statusMap: Record<string, { label: string; className: string }> = {
    active: { label: "在职", className: "bg-[#34C759]/10 text-[#34C759]" },
    on_leave: { label: "休假中", className: "bg-[#FF9500]/10 text-[#FF9500]" },
    inactive: { label: "已离职", className: "bg-[#8E8E93]/10 text-[#8E8E93]" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1D1D1F]">教练管理</h2>
        <Link href="/coaches/new">
          <Button className="rounded-full bg-black/[0.06] text-[#1D1D1F] px-5 py-2.5 hover:bg-black/[0.1]">
            <Plus className="w-4 h-4 mr-2" />
            新增教练
          </Button>
        </Link>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="flex items-center gap-4 p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
          <Input
            placeholder="搜索教练姓名..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
        >
          <option value="">全部状态</option>
          <option value="active">在职</option>
          <option value="on_leave">休假中</option>
          <option value="inactive">已离职</option>
        </select>
      </div>

      {/* 教练表格 */}
      <div className="bg-white rounded-[20px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black/[0.04]">
              <TableHead className="w-[200px] text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                姓名
              </TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                性别
              </TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                入职时间
              </TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                电话
              </TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                状态
              </TableHead>
              <TableHead className="text-right text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.map((coach) => (
              <TableRow
                key={coach.id}
                className="hover:bg-black/[0.04] border-b border-black/[0.04]"
              >
                <TableCell>
                  <Link
                    href={`/coaches/${coach.id}`}
                    className="font-medium text-[#1D1D1F] hover:text-[#6E6E73]"
                  >
                    {coach.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {coach.gender === "male" ? "男" : "女"}
                </TableCell>
                <TableCell>
                  {coach.joinDate
                    ? new Date(coach.joinDate).toLocaleDateString("zh-CN")
                    : "-"}
                </TableCell>
                <TableCell>{coach.phone || "-"}</TableCell>
                <TableCell>
                  <Badge
                    className={statusMap[coach.status]?.className || ""}
                  >
                    {statusMap[coach.status]?.label || coach.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/coaches/${coach.id}/edit`)
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coach.id)}
                      className="text-[#FF3B30] hover:text-[#FF3B30]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {coaches.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-[#A1A1A6]"
                >
                  暂无教练数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
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
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/[0.06] text-[#1D1D1F] text-sm font-medium">
              {page}
            </span>
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
