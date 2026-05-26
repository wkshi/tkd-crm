"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

// 课程数据类型
interface Course {
  id: string;
  coachId: string | null;
  startTime: string;
  title: string | null;
  hasAttendanceChecked?: boolean;
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  // 课时统计筛选状态
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonthNums, setSelectedMonthNums] = useState<number[]>([]);

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

  // 加载课程列表（用于课时统计）
  const fetchCourses = useCallback(async () => {
    const res = await fetch(
      "/api/courses?pageSize=9999&includeAttendanceStatus=true"
    );
    const data = await res.json();
    setCourses(data.courses || []);
  }, []);

  // 提取所有有课程的年份（用于年份筛选）
  const allYears = useMemo(() => {
    const yearSet = new Set<number>();
    courses.forEach((c) => {
      const d = new Date(c.startTime);
      if (!isNaN(d.getTime()) && c.coachId) {
        yearSet.add(d.getFullYear());
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [courses]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      fetchCoaches();
      fetchCourses();
    });
    return () => cancelAnimationFrame(id);
  }, [fetchCoaches, fetchCourses]);

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

  // 课时统计：按教练+月份聚合计数，区分已完成点名和未完成点名
  // 支持按教练、年份、月份筛选
  const statsData = useMemo(() => {
    // 只统计有教练的课程
    let validCourses = courses.filter((c) => c.coachId);

    // 年份筛选
    if (selectedYear) {
      validCourses = validCourses.filter(
        (c) => new Date(c.startTime).getFullYear() === selectedYear
      );
    }

    // 提取所有有课程的月份，格式："2025年5月"
    const monthSet = new Set<string>();
    validCourses.forEach((c) => {
      const d = new Date(c.startTime);
      if (!isNaN(d.getTime())) {
        monthSet.add(`${d.getFullYear()}年${d.getMonth() + 1}月`);
      }
    });
    let months = Array.from(monthSet).sort((a, b) => {
      const parse = (s: string) => {
        const m = s.match(/(\d+)年(\d+)月/);
        if (!m) return 0;
        return Number(m[1]) * 12 + Number(m[2]);
      };
      return parse(b) - parse(a); // 倒序，最近月份在前
    });

    // 月份筛选（按月份数字）
    if (selectedMonthNums.length > 0) {
      months = months.filter((m) => {
        const match = m.match(/(\d+)年(\d+)月/);
        if (!match) return false;
        return selectedMonthNums.includes(Number(match[2]));
      });
    }

    // 教练筛选
    let displayCoaches = coaches;
    if (selectedCoachIds.length > 0) {
      displayCoaches = coaches.filter((c) =>
        selectedCoachIds.includes(c.id)
      );
    }

    // 按教练统计每月课时（区分已点名 / 未点名）
    const coachStats = displayCoaches.map((coach) => {
      const monthly: Record<string, { checked: number; unchecked: number }> =
        {};
      months.forEach((m) => {
        monthly[m] = { checked: 0, unchecked: 0 };
      });
      validCourses
        .filter((c) => c.coachId === coach.id)
        .forEach((c) => {
          const d = new Date(c.startTime);
          const key = `${d.getFullYear()}年${d.getMonth() + 1}月`;
          if (monthly[key] !== undefined) {
            if (c.hasAttendanceChecked) {
              monthly[key].checked += 1;
            } else {
              monthly[key].unchecked += 1;
            }
          }
        });
      const totalChecked = Object.values(monthly).reduce(
        (sum, n) => sum + n.checked,
        0
      );
      const totalUnchecked = Object.values(monthly).reduce(
        (sum, n) => sum + n.unchecked,
        0
      );
      return { coach, monthly, totalChecked, totalUnchecked };
    });

    // 每月合计
    const monthlyTotals: Record<string, { checked: number; unchecked: number }> =
      {};
    months.forEach((m) => {
      monthlyTotals[m] = {
        checked: coachStats.reduce((sum, s) => sum + s.monthly[m].checked, 0),
        unchecked: coachStats.reduce(
          (sum, s) => sum + s.monthly[m].unchecked,
          0
        ),
      };
    });

    return { months, coachStats, monthlyTotals };
  }, [coaches, courses, selectedCoachIds, selectedYear, selectedMonthNums]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Link href="/coaches/new">
          <Button className="rounded-full bg-black/[0.06] text-[#1D1D1F] px-5 py-2.5 hover:bg-black/[0.1]">
            <Plus className="w-4 h-4 mr-2" />
            新增教练
          </Button>
        </Link>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-black/[0.06] rounded-[10px] p-1 w-fit">
        {[
          { key: "list", label: "教练列表" },
          { key: "stats", label: "课时统计" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "list" | "stats")}
            className={`px-4 py-1.5 rounded-[8px] text-[14px] font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#1D1D1F] shadow-sm"
                : "text-[#6E6E73] hover:text-[#1D1D1F]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "list" && (
        <>
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
        </>
      )}

      {activeTab === "stats" && (
        <div className="space-y-4">
          {/* 筛选栏 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 bg-white rounded-[20px]">
            {/* 教练筛选 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] text-[#6E6E73] shrink-0">
                教练：
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedCoachIds([])}
                  className={`px-3 py-1 rounded-[8px] text-[13px] transition-all ${
                    selectedCoachIds.length === 0
                      ? "bg-[#1D1D1F] text-white"
                      : "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
                  }`}
                >
                  全部
                </button>
                {coaches.map((coach) => (
                  <button
                    key={coach.id}
                    onClick={() => {
                      setSelectedCoachIds((prev) =>
                        prev.includes(coach.id)
                          ? prev.filter((id) => id !== coach.id)
                          : [...prev, coach.id]
                      );
                    }}
                    className={`px-3 py-1 rounded-[8px] text-[13px] transition-all ${
                      selectedCoachIds.includes(coach.id)
                        ? "bg-[#1D1D1F] text-white"
                        : "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
                    }`}
                  >
                    {coach.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 年份筛选 */}
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#6E6E73] shrink-0">
                年份：
              </span>
              <select
                value={selectedYear ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedYear(val ? Number(val) : null);
                }}
                className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-1.5 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
              >
                <option value="">全部</option>
                {allYears.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
            </div>

            {/* 月份筛选 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] text-[#6E6E73] shrink-0">
                月份：
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedMonthNums([])}
                  className={`px-2.5 py-1 rounded-[8px] text-[13px] transition-all ${
                    selectedMonthNums.length === 0
                      ? "bg-[#1D1D1F] text-white"
                      : "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
                  }`}
                >
                  全部
                </button>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonthNums((prev) =>
                        prev.includes(m)
                          ? prev.filter((n) => n !== m)
                          : [...prev, m]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-[8px] text-[13px] transition-all ${
                      selectedMonthNums.includes(m)
                        ? "bg-[#1D1D1F] text-white"
                        : "bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
                    }`}
                  >
                    {m}月
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] overflow-hidden">
            {statsData.months.length === 0 ? (
              <div className="text-center py-12 text-[#A1A1A6]">
                暂无课程数据
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-black/[0.04]">
                    <TableHead className="sticky left-0 bg-white text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal min-w-[100px]">
                      教练姓名
                    </TableHead>
                    {statsData.months.map((m) => (
                      <TableHead
                        key={m}
                        className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal text-center min-w-[80px]"
                      >
                        {m}
                      </TableHead>
                    ))}
                    <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal text-center min-w-[70px]">
                      总计
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsData.coachStats.map((s) => (
                    <TableRow
                      key={s.coach.id}
                      className="hover:bg-black/[0.04] border-b border-black/[0.04]"
                    >
                      <TableCell className="sticky left-0 bg-white font-medium text-[#1D1D1F]">
                        {s.coach.name}
                      </TableCell>
                      {statsData.months.map((m) => (
                        <TableCell
                          key={m}
                          className="text-[14px] text-[#1D1D1F] text-center"
                        >
                          {(() => {
                            const { checked, unchecked } = s.monthly[m];
                            if (checked === 0 && unchecked === 0) return "—";
                            return (
                              <div className="flex flex-col items-center gap-0.5">
                                <span>{checked}</span>
                                {unchecked > 0 && (
                                  <span className="text-[11px] text-[#A1A1A6]">
                                    {unchecked} 未点名
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                      ))}
                      <TableCell className="text-[14px] font-semibold text-[#1D1D1F] text-center">
                        {(() => {
                          if (s.totalChecked === 0 && s.totalUnchecked === 0)
                            return "—";
                          return (
                            <div className="flex flex-col items-center gap-0.5">
                              <span>{s.totalChecked}</span>
                              {s.totalUnchecked > 0 && (
                                <span className="text-[11px] text-[#A1A1A6]">
                                  {s.totalUnchecked} 未点名
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* 合计行 */}
                  <TableRow className="bg-black/[0.02] border-b border-black/[0.04]">
                    <TableCell className="sticky left-0 bg-black/[0.02] font-semibold text-[#1D1D1F]">
                      合计
                    </TableCell>
                    {statsData.months.map((m) => (
                      <TableCell
                        key={m}
                        className="text-[14px] font-semibold text-[#1D1D1F] text-center"
                      >
                        {(() => {
                          const { checked, unchecked } =
                            statsData.monthlyTotals[m];
                          if (checked === 0 && unchecked === 0) return "—";
                          return (
                            <div className="flex flex-col items-center gap-0.5">
                              <span>{checked}</span>
                              {unchecked > 0 && (
                                <span className="text-[11px] text-[#A1A1A6]">
                                  {unchecked} 未点名
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                    ))}
                    <TableCell className="text-[14px] font-semibold text-[#1D1D1F] text-center">
                      {(() => {
                        const totalChecked = Object.values(
                          statsData.monthlyTotals
                        ).reduce((sum, n) => sum + n.checked, 0);
                        const totalUnchecked = Object.values(
                          statsData.monthlyTotals
                        ).reduce((sum, n) => sum + n.unchecked, 0);
                        if (totalChecked === 0 && totalUnchecked === 0)
                          return "—";
                        return (
                          <div className="flex flex-col items-center gap-0.5">
                            <span>{totalChecked}</span>
                            {totalUnchecked > 0 && (
                              <span className="text-[11px] text-[#A1A1A6]">
                                {totalUnchecked} 未点名
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
