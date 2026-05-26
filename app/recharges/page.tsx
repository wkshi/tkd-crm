"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Users,
  Check,
  Wallet,
  GraduationCap,
  X,
} from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { beltLevelMap, BeltBadge } from "@/lib/belt-level"

interface Student {
  id: string
  name: string
  gender: string
  remainingSessions: number
  expiryDate: string | null
  classes: { id: string; name: string }[]
}

interface Recharge {
  id: string
  studentId: string
  action: string
  sessions: number
  durationDays: number
  notes: string | null
  createdAt: string
  student?: { id: string; name: string }
}

interface ClassItem {
  id: string
  name: string
}

export default function RechargePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [recharges, setRecharges] = useState<Recharge[]>([])
  const [classesList, setClassesList] = useState<ClassItem[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("")

  const [action, setAction] = useState<"increment" | "decrement">("increment")
  const [sessions, setSessions] = useState<number | "">("")
  const [durationDays, setDurationDays] = useState<number | "">("")
  const [notes, setNotes] = useState("")

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [activeTab, setActiveTab] = useState<"entry" | "list">("entry")

  // 充值记录筛选
  const [listSearch, setListSearch] = useState("")
  const [listClassFilter, setListClassFilter] = useState("")
  const [actionFilter, setActionFilter] = useState<"" | "increment" | "decrement">("")
  const [yearFilter, setYearFilter] = useState("")
  const [monthFilter, setMonthFilter] = useState("")
  const [dayFilter, setDayFilter] = useState("")

  // 清除所有筛选条件
  function clearFilters() {
    setListSearch("")
    setListClassFilter("")
    setActionFilter("")
    setYearFilter("")
    setMonthFilter("")
    setDayFilter("")
  }

  // 加载班级列表
  useEffect(() => {
    fetch("/api/classes?pageSize=9999&status=active")
      .then((res) => res.json())
      .then((data) => setClassesList(data.classes || []))
      .catch(() => setClassesList([]))
  }, [])

  // 加载学员和充值记录
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [studentsRes, rechargesRes] = await Promise.all([
        fetch("/api/students?pageSize=9999&status=active"),
        fetch("/api/recharges"),
      ])
      const studentsData = await studentsRes.json()
      const rechargesData = await rechargesRes.json()
      setStudents(studentsData.students || [])
      setRecharges(rechargesData.recharges || [])
    } catch (err) {
      console.error("加载数据失败", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData() // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchData])

  // 筛选学员
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.trim().toLowerCase())
      const matchClass =
        !classFilter || s.classes.some((c) => c.id === classFilter)
      return matchSearch && matchClass
    })
  }, [students, search, classFilter])

  // 全选/全不选
  const allSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.has(s.id))

  function toggleSelectAll() {
    if (allSelected) {
      const next = new Set(selectedIds)
      filteredStudents.forEach((s) => next.delete(s.id))
      setSelectedIds(next)
    } else {
      const next = new Set(selectedIds)
      filteredStudents.forEach((s) => next.add(s.id))
      setSelectedIds(next)
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function clearAll() {
    setSelectedIds(new Set())
  }

  async function handleSubmit() {
    if (selectedIds.size === 0) return
    if (sessions === "" || Number(sessions) < 0) {
      alert("请输入有效的变动次数")
      return
    }
    if (durationDays === "" || Number(durationDays) < 0) {
      alert("请输入有效的有效天数")
      return
    }

    setSubmitting(true)
    try {
      const items = Array.from(selectedIds).map((studentId) => ({
        studentId,
        action,
        sessions: Number(sessions),
        durationDays: Number(durationDays),
        notes: notes.trim() || undefined,
      }))

      // 逐个提交充值记录
      const results = await Promise.all(
        items.map((item) =>
          fetch("/api/recharges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          }),
        ),
      )

      const allOk = results.every((res) => res.ok)
      if (!allOk) {
        alert("部分充值记录录入失败")
        setSubmitting(false)
        return
      }

      setSuccessMsg(`成功为 ${items.length} 名学员录入充值记录`)
      setSelectedIds(new Set())
      setAction("increment")
      setSessions("")
      setDurationDays("")
      setNotes("")
      fetchData()

      setTimeout(() => setSuccessMsg(""), 3000)
    } catch (err) {
      console.error(err)
      alert("录入失败")
    } finally {
      setSubmitting(false)
    }
  }

  // 学员 ID → 班级 ID 列表 映射
  const studentClassMap = useMemo(() => {
    const map = new Map<string, string[]>()
    students.forEach((s) => {
      map.set(s.id, s.classes.map((c) => c.id))
    })
    return map
  }, [students])

  // 提取所有不重复的年份
  const yearOptions = useMemo(() => {
    const set = new Set<number>()
    recharges.forEach((r) => {
      const d = new Date(r.createdAt)
      if (!isNaN(d.getTime())) set.add(d.getFullYear())
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [recharges])

  // 月份选项（1-12）
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1))
  }, [])

  // 日期选项（1-31）
  const dayOptions = useMemo(() => {
    return Array.from({ length: 31 }, (_, i) => String(i + 1))
  }, [])

  // 筛选充值记录
  const filteredRecharges = useMemo(() => {
    return recharges.filter((r) => {
      const matchSearch =
        !listSearch.trim() ||
        (r.student?.name || "")
          .toLowerCase()
          .includes(listSearch.trim().toLowerCase())
      const matchClass =
        !listClassFilter ||
        (studentClassMap.get(r.studentId) || []).includes(listClassFilter)
      const matchAction = !actionFilter || r.action === actionFilter
      const d = new Date(r.createdAt)
      const matchYear = !yearFilter || d.getFullYear() === Number(yearFilter)
      const matchMonth =
        !monthFilter || d.getMonth() + 1 === Number(monthFilter)
      const matchDay = !dayFilter || d.getDate() === Number(dayFilter)
      return (
        matchSearch && matchClass && matchAction && matchYear && matchMonth && matchDay
      )
    })
  }, [
    recharges,
    listSearch,
    listClassFilter,
    actionFilter,
    yearFilter,
    monthFilter,
    dayFilter,
    studentClassMap,
  ])

  // 行为中文映射
  const actionLabelMap: Record<string, string> = {
    increment: "增加课时",
    decrement: "减少课时",
  }

  return (
    <div className="space-y-6">
      {/* Tab 切换 */}
      <div className="flex gap-1 bg-black/[0.06] rounded-[10px] p-1 w-fit">
        {[
          { key: "entry", label: "充值录入" },
          { key: "list", label: "充值记录" },
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
                    <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal text-center">
                      剩余课时
                    </TableHead>
                    <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal text-center">
                      有效期
                    </TableHead>
                    <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                      班级
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const isSelected = selectedIds.has(student.id)
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
                        <TableCell className="text-[14px] text-[#1D1D1F] text-center">
                          {student.remainingSessions}
                        </TableCell>
                        <TableCell className="text-[14px] text-[#6E6E73] text-center">
                          {student.expiryDate
                            ? new Date(student.expiryDate).toLocaleDateString("zh-CN")
                            : "—"}
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
                    )
                  })}
                  {filteredStudents.length === 0 && !loading && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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

            {/* 右栏：充值信息表单 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[20px] p-6 space-y-5 sticky top-5">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#0071E3]" />
                  <h3 className="text-[17px] font-semibold text-[#1D1D1F]">
                    充值信息
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#1D1D1F]">
                    行为 *
                  </label>
                  <select
                    value={action}
                    onChange={(e) =>
                      setAction(e.target.value as "increment" | "decrement")
                    }
                    className="w-full bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
                  >
                    <option value="increment">增加课时</option>
                    <option value="decrement">减少课时</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#1D1D1F]">
                    次数 *
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="请输入变动次数"
                    value={sessions}
                    onChange={(e) =>
                      setSessions(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[14px] font-medium text-[#1D1D1F]">
                    有效天数 *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      placeholder="例如：30"
                      value={durationDays}
                      onChange={(e) =>
                        setDurationDays(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6E6E73]">
                      天
                    </span>
                  </div>
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
                    ? `将为 ${selectedIds.size} 名学员录入充值记录`
                    : "请先选择学员"}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={
                    selectedIds.size === 0 ||
                    sessions === "" ||
                    Number(sessions) < 0 ||
                    durationDays === "" ||
                    Number(durationDays) < 0 ||
                    submitting
                  }
                  className="w-full h-11 rounded-full bg-[#1D1D1F] text-white text-[14px] font-medium hover:bg-black/80 disabled:opacity-40"
                >
                  {submitting
                    ? "录入中..."
                    : selectedIds.size === 0
                      ? "请先选择学员"
                      : `为 ${selectedIds.size} 名学员录入充值记录`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 充值记录列表 ==================== */}
      {activeTab === "list" && (
        <div className="space-y-5">
          {/* 充值记录筛选栏 */}
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
              value={actionFilter}
              onChange={(e) =>
                setActionFilter(e.target.value as "" | "increment" | "decrement")
              }
              className="bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none h-10"
            >
              <option value="">全部行为</option>
              <option value="increment">增加课时</option>
              <option value="decrement">减少课时</option>
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
              共 {filteredRecharges.length} 条
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
                    充值时间
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    行为
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    变动次数
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    有效天数
                  </TableHead>
                  <TableHead className="text-[13px] font-medium text-[#6E6E73] normal-case tracking-normal">
                    备注
                  </TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecharges.map((r) => (
                  <TableRow
                    key={r.id}
                    className="hover:bg-black/[0.04] border-b border-black/[0.04]"
                  >
                    <TableCell className="font-medium text-[#1D1D1F]">
                      {r.student?.name || "—"}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#6E6E73]">
                      {new Date(r.createdAt).toLocaleString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell
                      className={`text-[14px] font-medium ${
                        r.action === "increment"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {actionLabelMap[r.action] || r.action}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#1D1D1F]">
                      {r.sessions}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#6E6E73]">
                      {r.durationDays}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#6E6E73]">
                      {r.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecharges.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-[#A1A1A6]"
                    >
                      暂无充值记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

    </div>
  )
}
