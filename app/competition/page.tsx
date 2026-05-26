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
  Trophy,
  GraduationCap,
  Pencil,
  Trash2,
  Info,
  X,
} from "lucide-react";

import { BeltBadge } from "@/lib/belt-level";

interface Student {
  id: string;
  name: string;
  gender: string;
  classes: { id: string; name: string }[];
}

interface Competition {
  id: string;
  studentId: string;
  competitionDate: string;
  competitionName: string;
  category: string | null;
  result: string | null;
  award: string | null;
  student?: { id: string; name: string };
}

interface ClassItem {
  id: string;
  name: string;
}

export default function CompetitionPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [competitionDate, setCompetitionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [competitionName, setCompetitionName] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState("");
  const [award, setAward] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"entry" | "list">("entry");

  // 编辑弹窗状态
  const [editing, setEditing] = useState<Competition | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editResult, setEditResult] = useState("");
  const [editAward, setEditAward] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // 比赛记录筛选
  const [listSearch, setListSearch] = useState("");
  const [listClassFilter, setListClassFilter] = useState("");
  const [compNameFilter, setCompNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("")

  // 清除所有筛选条件
  function clearFilters() {
    setListSearch("");
    setListClassFilter("");
    setCompNameFilter("");
    setCategoryFilter("");
    setYearFilter("");
    setMonthFilter("");
    setDayFilter("");
  }

  // 加载班级列表
  useEffect(() => {
    fetch("/api/classes?pageSize=9999&status=active")
      .then((res) => res.json())
      .then((data) => setClassesList(data.classes || []))
      .catch(() => setClassesList([]));
  }, []);

  // 加载学员和比赛记录
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, competitionsRes] = await Promise.all([
        fetch("/api/students?pageSize=9999&status=active"),
        fetch("/api/competition"),
      ]);
      const studentsData = await studentsRes.json();
      const competitionsData = await competitionsRes.json();
      setStudents(studentsData.students || []);
      setCompetitions(competitionsData.competitions || []);
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
    // 需要加载 grading 数据来计算当前级别
    return map;
  }, []);

  // 加载 grading 数据用于显示学员当前带位
  useEffect(() => {
    async function fetchGradings() {
      try {
        const res = await fetch("/api/grading");
        const data = await res.json();
        const gradings = data.gradings || [];
        const grouped = new Map<string, { examDate: string; beltLevel: string }[]>();
        gradings.forEach((g: { studentId: string; examDate: string; beltLevel: string }) => {
          if (!grouped.has(g.studentId)) grouped.set(g.studentId, []);
          grouped.get(g.studentId)!.push(g);
        });
        grouped.forEach((list, studentId) => {
          const latest = list.sort(
            (a, b) =>
              new Date(b.examDate).getTime() - new Date(a.examDate).getTime(),
          )[0];
          if (latest) currentBeltMap.set(studentId, latest.beltLevel);
        });
      } catch (err) {
        console.error("加载考级数据失败", err);
      }
    }
    fetchGradings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!competitionName.trim()) {
      alert("请输入比赛名称");
      return;
    }

    setSubmitting(true);
    try {
      const items = Array.from(selectedIds).map((studentId) => ({
        studentId,
        competitionDate,
        competitionName: competitionName.trim(),
        category: category || undefined,
        result: result || undefined,
        award: award || undefined,
      }));

      const res = await fetch("/api/competition/batch", {
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

      setSuccessMsg(`成功为 ${json.count} 名学员录入比赛记录`);
      setSelectedIds(new Set());
      setCompetitionName("");
      setCategory("");
      setResult("");
      setAward("");
      fetchData();

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("录入失败");
    } finally {
      setSubmitting(false);
    }
  }

  // 学员 ID → 班级 ID 列表 映射
  const studentClassMap = useMemo(() => {
    const map = new Map<string, string[]>();
    students.forEach((s) => {
      map.set(s.id, s.classes.map((c) => c.id));
    });
    return map;
  }, [students]);

  // 提取所有不重复的参赛组别
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    competitions.forEach((c) => {
      if (c.category?.trim()) set.add(c.category.trim());
    });
    return Array.from(set).sort();
  }, [competitions]);

  // 提取所有不重复的年份
  const yearOptions = useMemo(() => {
    const set = new Set<number>();
    competitions.forEach((c) => {
      set.add(new Date(c.competitionDate).getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [competitions]);

  // 月份选项（1-12）
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1));
  }, []);

  // 日期选项（1-31）
  const dayOptions = useMemo(() => {
    return Array.from({ length: 31 }, (_, i) => String(i + 1));
  }, []);

  // 筛选比赛记录
  const filteredCompetitions = useMemo(() => {
    return competitions.filter((c) => {
      const matchSearch =
        !listSearch.trim() ||
        (c.student?.name || "")
          .toLowerCase()
          .includes(listSearch.trim().toLowerCase());
      const matchClass =
        !listClassFilter ||
        (studentClassMap.get(c.studentId) || []).includes(listClassFilter);
      const matchCompName =
        !compNameFilter.trim() ||
        c.competitionName
          .toLowerCase()
          .includes(compNameFilter.trim().toLowerCase());
      const matchCategory =
        !categoryFilter || c.category === categoryFilter;
      const d = new Date(c.competitionDate);
      const matchYear = !yearFilter || d.getFullYear() === Number(yearFilter);
      const matchMonth =
        !monthFilter || d.getMonth() + 1 === Number(monthFilter);
      const matchDay = !dayFilter || d.getDate() === Number(dayFilter);
      return (
        matchSearch &&
        matchClass &&
        matchCompName &&
        matchCategory &&
        matchYear &&
        matchMonth &&
        matchDay
      );
    });
  }, [
    competitions,
    listSearch,
    listClassFilter,
    compNameFilter,
    categoryFilter,
    yearFilter,
    monthFilter,
    dayFilter,
    studentClassMap,
  ]);

  // 打开编辑弹窗
  function openEdit(comp: Competition) {
    setEditing(comp);
    setEditDate(new Date(comp.competitionDate).toISOString().split("T")[0]);
    setEditName(comp.competitionName);
    setEditCategory(comp.category || "");
    setEditResult(comp.result || "");
    setEditAward(comp.award || "");
  }

  // 保存编辑
  async function handleEditSave() {
    if (!editing) return;
    if (!editName.trim()) {
      alert("请输入比赛名称");
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/competition/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionDate: editDate,
          competitionName: editName.trim(),
          category: editCategory || undefined,
          result: editResult || undefined,
          award: editAward || undefined,
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

  // 删除比赛记录
  async function handleDelete(id: string, studentName: string) {
    if (!confirm(`确定删除学员 "${studentName}" 的这条比赛记录吗？`))
      return;

    try {
      const res = await fetch(`/api/competition/${id}`, { method: "DELETE" });
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
      {/* Tab 切换 */}
      <div className="flex gap-1 bg-black/[0.06] rounded-[10px] p-1 w-fit">
        {[
          { key: "entry", label: "比赛录入" },
          { key: "list", label: "比赛记录" },
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
                            <BeltBadge beltLevel={currentBelt} />
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

            {/* 右栏：比赛信息表单 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[20px] p-6 space-y-5 sticky top-5">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-500" />
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
                    比赛信息
                  </h3>
                </div>

                {/* 提示：单独编辑请切换至比赛记录 */}
                <div className="flex items-start gap-1.5 text-[12px] text-[#A1A1A6]">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    如需单独编辑某位选手的比赛信息，请切换到「比赛记录」页面
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#1D1D1F]">
                    比赛日期 *
                  </label>
                  <Input
                    type="date" max="9999-12-31"
                    value={competitionDate}
                    onChange={(e) => setCompetitionDate(e.target.value)}
                    className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#1D1D1F]">
                    比赛名称 *
                  </label>
                  <Input
                    placeholder="请输入比赛名称"
                    value={competitionName}
                    onChange={(e) => setCompetitionName(e.target.value)}
                    className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#1D1D1F]">
                    参赛组别
                  </label>
                  <Input
                    placeholder="选填"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#1D1D1F]">
                    成绩/名次
                  </label>
                  <Input
                    placeholder="选填"
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#1D1D1F]">
                    备注
                  </label>
                  <Input
                    placeholder="选填"
                    value={award}
                    onChange={(e) => setAward(e.target.value)}
                    className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[13px] text-[#6E6E73]">
                  <Users className="w-4 h-4" />
                  {selectedIds.size > 0
                    ? `将为 ${selectedIds.size} 名学员录入比赛信息`
                    : "请先选择学员"}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={
                    selectedIds.size === 0 ||
                    !competitionName.trim() ||
                    submitting
                  }
                  className="w-full h-11 rounded-full bg-[#1D1D1F] text-white text-[14px] font-medium hover:bg-black/80 disabled:opacity-40"
                >
                  {submitting
                    ? "录入中..."
                    : selectedIds.size === 0
                      ? "请先选择学员"
                      : `为 ${selectedIds.size} 名学员录入比赛信息`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 比赛记录列表 ==================== */}
      {activeTab === "list" && (
        <div className="space-y-5">
          {/* 比赛记录筛选栏 */}
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
            <div className="relative min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
              <Input
                placeholder="搜索比赛名称..."
                value={compNameFilter}
                onChange={(e) => setCompNameFilter(e.target.value)}
                className="pl-10 bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
            >
              <option value="">全部组别</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
              共 {filteredCompetitions.length} 条
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
                    比赛日期
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    比赛名称
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    参赛组别
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    成绩/名次
                  </TableHead>
                  <TableHead className="text-right text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitions.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-black/[0.04] border-b border-black/[0.04]"
                  >
                    <TableCell className="font-medium text-[#1D1D1F]">
                      {c.student?.name || "—"}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#6E6E73]">
                      {new Date(c.competitionDate).toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#1D1D1F]">
                      {c.competitionName}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#6E6E73]">
                      {c.category || "—"}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#6E6E73]">
                      {c.result || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(c)}
                          className="text-[#6E6E73] hover:text-[#1D1D1F]"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(c.id, c.student?.name || "")
                          }
                          className="text-[#FF3B30] hover:text-[#FF3B30]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCompetitions.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-[#A1A1A6]"
                    >
                      暂无比赛记录
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
              编辑比赛记录
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
                比赛日期 *
              </label>
              <Input
                type="date" max="9999-12-31"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1D1D1F]">
                比赛名称 *
              </label>
              <Input
                placeholder="请输入比赛名称"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1D1D1F]">
                参赛组别
              </label>
              <Input
                placeholder="选填"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1D1D1F]">
                成绩/名次
              </label>
              <Input
                placeholder="选填"
                value={editResult}
                onChange={(e) => setEditResult(e.target.value)}
                className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#1D1D1F]">
                备注
              </label>
              <Input
                placeholder="选填"
                value={editAward}
                onChange={(e) => setEditAward(e.target.value)}
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
                disabled={!editName.trim() || editSubmitting}
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
