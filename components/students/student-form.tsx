"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface StudentFormData {
  name: string;
  gender: "male" | "female";
  birthDate: string;
  idCard: string;
  phone: string;
  enrollmentDate: string;
  remainingSessions: number;
  expiryDate: string;
  status: "active" | "inactive" | "suspended";
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  studentId?: string;
}

export function StudentForm({ initialData, studentId }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<StudentFormData>({
    name: initialData?.name || "",
    gender: initialData?.gender || "male",
    birthDate: initialData?.birthDate
      ? new Date(initialData.birthDate).toISOString().split("T")[0]
      : "",
    idCard: initialData?.idCard || "",
    phone: initialData?.phone || "",
    enrollmentDate: initialData?.enrollmentDate
      ? new Date(initialData.enrollmentDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    remainingSessions: initialData?.remainingSessions ?? 0,
    expiryDate: initialData?.expiryDate
      ? new Date(initialData.expiryDate).toISOString().split("T")[0]
      : "",
    status: initialData?.status || "active",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url = studentId ? `/api/students/${studentId}` : "/api/students";
    const method = studentId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push(studentId ? `/students/${studentId}` : `/students/${data.id}`);
    } else {
      alert(data.error || "操作失败");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">基本信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>姓名 *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>性别 *</Label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as "male" | "female" })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>出生日期</Label>
            <Input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>身份证号</Label>
            <Input
              value={form.idCard}
              onChange={(e) => setForm({ ...form, idCard: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>电话号码</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">课务信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>入学时间 *</Label>
            <Input
              type="date"
              required
              value={form.enrollmentDate}
              onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>剩余课时 *</Label>
            <Input
              type="number"
              required
              value={form.remainingSessions}
              onChange={(e) => setForm({ ...form, remainingSessions: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>到期时间</Label>
            <Input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>在籍状态</Label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" | "suspended" })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="active">在籍</option>
              <option value="inactive">已结业</option>
              <option value="suspended">暂停</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/students")}>
          取消
        </Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
