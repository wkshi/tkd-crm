"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Users,
  Check,
  Award,
  GraduationCap,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

// belt 级别中文映射
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

const beltLevelOptions = Object.entries(beltLevelMap).map(
  ([value, label]) => ({ value, label }),
);

interface Student {
  id: string;
  name: string;
  gender: string;
  classes: { id: string; name: string }[];
}

interface Grading {
  id: string;
  studentId: string;
  examDate: string;
  beltLevel: string;
  notes: string | null;
  student?: { id: string; name: string };
}

interface ClassItem {
  id: string;
  name: string;
}

export default function GradingPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [gradings, setGradings] = useState<Grading[]>([]);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // 考级记录筛选
  const [listSearch, setListSearch] = useState("");
  const [listClassFilter, setListClassFilter] = useState("");
  const [beltLevelFilter, setBeltLevelFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("")

  // 清除所有筛选条件
  function clearFilters() {
    setListSearch("");
    setListClassFilter("");
    setBeltLevelFilter("");
    setYearFilter("");
    setMonthFilter("");
    setDayFilter("");
  }

  const [examDate, setExamDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [beltLevel, setBeltLevel] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"entry" | "list">("entry");

  // 编辑弹窗状态
  const [editing, setEditing] = useState<Grading | null>(null);
  const [editExamDate, setEditExamDate] = useState("");
  const [editBeltLevel, setEditBeltLevel] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // 加载班级列表
  useEffect(() => {
    fetch("/api/classes?pageSize=9999&status=active")
      .then((res) => res.json())
      .then((data) => setClassesList(data.classes || []))
      .catch(() => setClassesList([]));
  }, []);

  // 加载学员和考级记录
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, gradingsRes] = await Promise.all([
        fetch("/api/students?pageSize=9999&status=active"),
        fetch("/api/grading"),
      ]);
      const studentsData = await studentsRes.json();
      const gradingsData = await gradingsRes.json();
      setStudents(studentsData.students || []);
      setGradings(gradingsData.gradings || []);
    } catch (err) {
      console.error("加载数据失败", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchData]);

  // 计算每个学员的当前腰带级别
  const currentBeltMap = useMemo(() => {
    const map = new Map<string, string>();
    const grouped = new Map<string, Grading[]>();
    gradings.forEach((g) => {
      if (!grouped.has(g.studentId)) grouped.set(g.studentId, []);
      grouped.get(g.studentId)!.push(g);
    });
    grouped.forEach((list, studentId) => {
      const latest = list.sort(
        (a, b) =>
          new Date(b.examDate).getTime() - new Date(a.examDate).getTime(),
      )[0];
      if (latest) map.set(studentId, latest.beltLevel);
    });
    return map;
  }, [gradings]);

  // 筛选学员
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchClass =
        !classFilter || s.classes.some((c) => c.id === classFilter);
      return matchSearch && matchClass;
    });
  }, [students, search, classFilter]);

  // 学员 ID → 班级 ID 列表 映射（用于考级记录班级筛选）
  const studentClassMap = useMemo(() => {
    const map = new Map<string, string[]>();
    students.forEach((s) => {
      map.set(s.id, s.classes.map((c) => c.id));
    });
    return map;
  }, [students]);

  // 提取所有不重复的年份
  const yearOptions = useMemo(() => {
    const set = new Set<number>();
    gradings.forEach((g) => {
      set.add(new Date(g.examDate).getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [gradings]);

  // 月份选项（1-12）
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1));
  }, []);

  // 日期选项（1-31）
  const dayOptions = useMemo(() => {
    return Array.from({ length: 31 }, (_, i) => String(i + 1));
  }, []);

  // 筛选考级记录
  const filteredGradings = useMemo(() => {
    return gradings.filter((g) => {
      const matchSearch =
        !listSearch.trim() ||
        (g.student?.name || "")
          .toLowerCase()
          .includes(listSearch.trim().toLowerCase());
      const matchClass =
        !listClassFilter ||
        (studentClassMap.get(g.studentId) || []).includes(listClassFilter);
      const matchBeltLevel =
        !beltLevelFilter || g.beltLevel === beltLevelFilter;
      const d = new Date(g.examDate);
      const matchYear = !yearFilter || d.getFullYear() === Number(yearFilter);
      const matchMonth =
        !monthFilter || d.getMonth() + 1 === Number(monthFilter);
      const matchDay = !dayFilter || d.getDate() === Number(dayFilter);
      return (
        matchSearch &&
        matchClass &&
        matchBeltLevel &&
        matchYear &&
        matchMonth &&
        matchDay
      );
    });
  }, [
    gradings,
    listSearch,
    listClassFilter,
    beltLevelFilter,
    yearFilter,
    monthFilter,
    dayFilter,
    studentClassMap,
  ]);

  // 全选/全不选
  const allSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.has(s.id));

  function toggleSelectAll() {
    if (allSelected) {
      const next = new Set(selectedIds);
      filteredStudents.forEach((s) => next.delete(s.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredStudents.forEach((s) => next.add(s.id));
      setSelectedIds(next);
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function clearAll() {
    setSelectedIds(new Set());
  }

  async function handleSubmit() {
    if (selectedIds.size === 0) return;
    if (!beltLevel) {
      alert("请选择新腰带级别");
      return;
    }

    setSubmitting(true);
    try {
      const items = Array.from(selectedIds).map((studentId) => ({
        studentId,
        examDate,
        beltLevel,
        notes: notes || undefined,
      }));

      const res = await fetch("/api/grading/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "录入失败");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(`成功为 ${json.count} 名学员录入考级记录`);
      setSelectedIds(new Set());
      setNotes("");
      fetchData();

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("录入失败");
    } finally {
      setSubmitting(false);
    }
  }

  // 打开编辑弹窗
  function openEdit(grading: Grading) {
    setEditing(grading);
    setEditExamDate(
      new Date(grading.examDate).toISOString().split("T")[0],
    );
    setEditBeltLevel(grading.beltLevel);
    setEditNotes(grading.notes || "");
  }

  // 保存编辑
  async function handleEditSave() {
    if (!editing) return;
    if (!editBeltLevel) {
      alert("请选择腰带级别");
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/grading/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate: editExamDate,
          beltLevel: editBeltLevel,
          notes: editNotes || undefined,
        }),
      });

      if (!res.ok) {
        alert("更新失败");
        setEditSubmitting(false);
        return;
      }

      setEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("更新失败");
    } finally {
      setEditSubmitting(false);
    }
  }

  // 删除考级记录
  async function handleDelete(id: string, studentName: string) {
    if (!confirm(`确定删除学员 "${studentName}" 的这条考级记录吗？`))
      return;

    try {
      const res = await fetch(`/api/grading/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("删除失败");
        return;
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert("删除失败");
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1D1D1F]">考级管理</h2>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-black/[0.06] rounded-[10px] p-1 w-fit">
        {[
          { key: "entry", label: "考级录入" },
          { key: "list", label: "考级记录" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "entry" | "list")}
            className={`px-4 py-1.5 rounded-lg text-[14px] font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white shadow-sm text-[#1D1D1F]"
                : "text-[#6E6E73] hover:text-[#1D1D1F]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 成功提示 */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-[#34C759]/8 text-[#34C759] text-[14px] font-medium">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* ==================== 录入区域 ==================== */}
      {activeTab === "entry" && (
      <div className="space-y-5">
        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
          >
            <option value="">全部班级</option>
            {classesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
            <Input
              placeholder="搜索学员姓名..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>

          <label className="flex items-center gap-2 text-[14px] text-[#1D1D1F] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="rounded accent-[#1D1D1F] w-4 h-4"
            />
            全选
          </label>

          {selectedIds.size > 0 && (
            <>
              <span className="text-[13px] text-[#0071E3] font-medium">
                已选 {selectedIds.size} 人
              </span>
              <button
                onClick={clearAll}
                className="text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] bg-transparent border-none cursor-pointer"
              >
                清空
              </button>
            </>
          )}
        </div>

        {/* 分栏主体 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* 左栏：学员列表 */}
          <div className="lg:col-span-3 bg-white rounded-[20px] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-black/[0.04]">
                  <TableHead className="w-[40px] text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal"></TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    姓名
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    性别
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    当前带位
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    班级
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const currentBelt = currentBeltMap.get(student.id);
                  const isSelected = selectedIds.has(student.id);
                  return (
                    <TableRow
                      key={student.id}
                      className={`hover:bg-black/[0.04] border-b border-black/[0.04] cursor-pointer ${
                        isSelected ? "bg-[#0071E3]/[0.04]" : ""
                      }`}
                      onClick={() => toggleSelect(student.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(student.id)}
                          className="rounded accent-[#1D1D1F] w-4 h-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-[#1D1D1F]">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-[14px] text-[#6E6E73]">
                        {student.gender === "male" ? "男" : "女"}
                      </TableCell>
                      <TableCell>
                        {currentBelt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-[12px] font-medium">
                            <Award className="w-3 h-3" />
                            {beltLevelMap[currentBelt] || currentBelt}
                          </span>
                        ) : (
                          <span className="text-[#A1A1A6] text-[13px]">—</span>
                        )}
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
                    </TableRow>
                  );
                })}
                {filteredStudents.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-[#A1A1A6]"
                    >
                      {search || classFilter
                        ? "未找到匹配的学员"
                        : "暂无学员数据"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 右栏：考级信息表单 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[20px] p-6 space-y-5 sticky top-5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
                  考级信息
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#1D1D1F]">
                  考试日期 *
                </label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#1D1D1F]">
                  新腰带级别 *
                </label>
                <select
                  value={beltLevel}
                  onChange={(e) => setBeltLevel(e.target.value)}
                  className="w-full h-10 px-3 bg-black/[0.06] border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none appearance-none"
                >
                  <option value="">请选择</option>
                  {beltLevelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[#1D1D1F]">
                  备注
                </label>
                <Input
                  placeholder="选填"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[13px] text-[#6E6E73]">
                <Users className="w-4 h-4" />
                {selectedIds.size > 0
                  ? `将为 ${selectedIds.size} 名学员录入考级信息`
                  : "请先选择学员"}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={selectedIds.size === 0 || !beltLevel || submitting}
                className="w-full h-11 rounded-full bg-[#1D1D1F] text-white text-[14px] font-medium hover:bg-black/80 disabled:opacity-40"
              >
                {submitting
                  ? "录入中..."
                  : selectedIds.size === 0
                    ? "请先选择学员"
                    : `为 ${selectedIds.size} 名学员录入考级信息`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      )}

      {/* ==================== 考级记录列表 ==================== */}
      {activeTab === "list" && (
      <div className="space-y-5">
        {/* 考级记录筛选栏 */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={listClassFilter}
            onChange={(e) => setListClassFilter(e.target.value)}
            className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
          >
            <option value="">全部班级</option>
            {classesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="relative min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
            <Input
              placeholder="搜索学员姓名..."
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <select
            value={beltLevelFilter}
            onChange={(e) => setBeltLevelFilter(e.target.value)}
            className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
          >
            <option value="">全部级别</option>
            {beltLevelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
          >
            <option value="">全部年份</option>
            {yearOptions.map((y) => (
              <option key={y} value={String(y)}>
                {y}年
              </option>
            ))}
          </select>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
          >
            <option value="">全部月份</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
          >
            <option value="">全部日期</option>
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}日
              </option>
            ))}
          </select>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 h-10 bg-black/[0.06] hover:bg-black/[0.1] rounded-[10px] text-[13px] text-[#6E6E73] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            清除筛选
          </button>
          <span className="text-[13px] text-[#6E6E73]">
            共 {filteredGradings.length} 条
          </span>
        </div>

        <div className="bg-white rounded-[20px] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black/[0.04]">
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                学员姓名
              </TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                考试日期
              </TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                腰带级别
              </TableHead>
              <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                备注
              </TableHead>
              <TableHead className="text-right text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGradings.map((g) => (
              <TableRow
                key={g.id}
                className="hover:bg-black/[0.04] border-b border-black/[0.04]"
              >
                <TableCell className="font-medium text-[#1D1D1F]">
                  {g.student?.name || "—"}
                </TableCell>
                <TableCell className="text-[14px] text-[#6E6E73]">
                  {new Date(g.examDate).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-[12px] font-medium">
                    <Award className="w-3 h-3" />
                    {beltLevelMap[g.beltLevel] || g.beltLevel}
                  </span>
                </TableCell>
                <TableCell className="text-[14px] text-[#6E6E73] max-w-[200px] truncate">
                  {g.notes || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(g)}
                      className="text-[#6E6E73] hover:text-[#1D1D1F]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDelete(g.id, g.student?.name || "")
                      }
                      className="text-[#FF3B30] hover:text-[#FF3B30]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredGradings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-[#A1A1A6]"
                >
                  暂无考级记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      )}

      {/* 编辑弹窗 */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="bg-white rounded-[20px] border-black/[0.06] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-semibold text-[#1D1D1F]">
              编辑考级记录
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1D1D1F]">
                学员
              </label>
              <div className="h-10 px-3 flex items-center bg-black/[0.04] rounded-[10px] text-[14px] text-[#6E6E73]">
                {editing?.student?.name || "—"}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1D1D1F]">
                考试日期 *
              </label>
              <Input
                type="date"
                value={editExamDate}
                onChange={(e) => setEditExamDate(e.target.value)}
                className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1D1D1F]">
                腰带级别 *
              </label>
              <select
                value={editBeltLevel}
                onChange={(e) => setEditBeltLevel(e.target.value)}
                className="w-full h-10 px-3 bg-black/[0.06] border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none appearance-none"
              >
                <option value="">请选择</option>
                {beltLevelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1D1D1F]">
                备注
              </label>
              <Input
                placeholder="选填"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditing(null)}
                className="flex-1 h-10 rounded-full border-black/[0.08] text-[#6E6E73] hover:text-[#1D1D1F]"
              >
                取消
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={!editBeltLevel || editSubmitting}
                className="flex-1 h-10 rounded-full bg-[#1D1D1F] text-white hover:bg-black/80 disabled:opacity-40"
              >
                {editSubmitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
