"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Users, BookOpen } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  level: string | null;
  maxStudents: number;
  status: string;
  _count: { students: number; courses: number };
}

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await fetch("/api/classes?pageSize=9999");
      const data = await res.json();
      if (!cancelled) {
        setClasses(data.classes || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "正常", color: "bg-green-500/10 text-green-700" },
    inactive: { label: "停用", color: "bg-black/[0.06] text-[#6E6E73]" },
    suspended: { label: "暂停", color: "bg-orange-500/10 text-orange-700" },
  };

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1D1D1F]">班级管理</h2>
        <Button
          onClick={() => router.push("/classes/new")}
          className="rounded-full bg-[#1D1D1F] text-white hover:bg-black/80"
        >
          <Plus className="w-4 h-4 mr-1" />
          新增班级
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
        <Input
          placeholder="搜索班级名称..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-black/[0.06] border-0 rounded-full focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
        />
      </div>

      {/* 班级列表 */}
      <Card className="bg-white rounded-[20px] shadow-none">
        {loading ? (
          <div className="p-12 text-center text-[#A1A1A6]">加载中...</div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-12 text-center text-[#A1A1A6]">
            {search ? "未找到匹配的班级" : "暂无班级，点击右上角新增"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-black/[0.04] hover:bg-transparent">
                <TableHead className="text-[#6E6E73] font-medium">班级名称</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">级别</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">学员数</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">课程数</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">状态</TableHead>
                <TableHead className="text-[#6E6E73] font-medium text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow
                  key={cls.id}
                  className="border-black/[0.04] cursor-pointer hover:bg-black/[0.02]"
                  onClick={() => router.push(`/classes/${cls.id}`)}
                >
                  <TableCell className="font-medium text-[#1D1D1F]">
                    {cls.name}
                  </TableCell>
                  <TableCell className="text-[#6E6E73]">
                    {cls.level || "-"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-[#6E6E73]">
                      <Users className="w-3.5 h-3.5" />
                      {cls._count.students}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-[#6E6E73]">
                      <BookOpen className="w-3.5 h-3.5" />
                      {cls._count.courses}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${statusMap[cls.status]?.color || "bg-black/[0.06] text-[#6E6E73]"} border-0`}
                    >
                      {statusMap[cls.status]?.label || cls.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-[#6E6E73] hover:text-[#1D1D1F]"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/classes/${cls.id}/edit`);
                      }}
                    >
                      编辑
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
