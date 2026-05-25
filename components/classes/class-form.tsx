"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface ClassFormData {
  name: string;
  level: string;
  description: string;
  maxStudents: number;
  status: "active" | "inactive" | "suspended";
  studentIds: string[];
}

interface AvailableStudent {
  id: string;
  name: string;
}

interface ClassFormProps {
  initialData?: Partial<ClassFormData>;
  classId?: string;
}

export function ClassForm({ initialData, classId }: ClassFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);

  const [form, setForm] = useState<ClassFormData>({
    name: initialData?.name || "",
    level: initialData?.level || "",
    description: initialData?.description || "",
    maxStudents: initialData?.maxStudents ?? 30,
    status: initialData?.status || "active",
    studentIds: initialData?.studentIds || [],
  });

  // 加载可用学员列表
  useEffect(() => {
    async function fetchStudents() {
      const res = await fetch("/api/students?pageSize=9999&status=active");
      const data = await res.json();
      setAvailableStudents(data.students || []);
    }
    fetchStudents();
  }, []);

  // 切换学员选择
  function toggleStudentId(studentId: string) {
    setForm((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = classId ? `/api/classes/${classId}` : "/api/classes";
      const method = classId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "操作失败");
        setLoading(false);
        return;
      }

      router.push(classId ? `/classes/${classId}` : `/classes/${data.id}`);
    } catch (err) {
      console.error(err);
      alert("操作失败");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* 基本信息 */}
      <div className="bg-white rounded-[20px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1D1D1F] rounded-full" />
          <h3 className="text-lg font-semibold">基本信息</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>班级名称 *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>级别/段位</Label>
            <Input
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              placeholder="如：白带、黄带"
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>人数上限</Label>
            <Input
              type="number"
              value={form.maxStudents}
              onChange={(e) =>
                setForm({ ...form, maxStudents: parseInt(e.target.value) || 0 })
              }
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>状态</Label>
            <div className="bg-black/[0.06] rounded-[10px] p-1 flex">
              {[
                { value: "active", label: "正常" },
                { value: "inactive", label: "停用" },
                { value: "suspended", label: "暂停" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      status: opt.value as "active" | "inactive" | "suspended",
                    })
                  }
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    form.status === opt.value
                      ? "bg-white shadow-sm text-[#1D1D1F]"
                      : "text-[#6E6E73]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>备注</Label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>
      </div>

      {/* 学员选择 */}
      <div className="bg-white rounded-[20px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1D1D1F] rounded-full" />
          <h3 className="text-lg font-semibold">
            班级学员 ({form.studentIds.length} 人)
          </h3>
        </div>
        {availableStudents.length === 0 ? (
          <p className="text-sm text-[#A1A1A6]">暂无可选学员</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto">
            {availableStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-black/[0.04] rounded-[10px] px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={form.studentIds.includes(student.id)}
                  onChange={() => toggleStudentId(student.id)}
                  className="rounded accent-[#1D1D1F]"
                />
                <span className="text-[#1D1D1F] truncate">{student.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          onClick={() => router.push("/classes")}
          className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
        >
          取消
        </Button>
        <Button
          type="submit"
          className="rounded-full bg-[#1D1D1F] text-white hover:bg-black/80"
          disabled={loading}
        >
          {loading ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
