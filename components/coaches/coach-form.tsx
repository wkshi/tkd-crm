"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 教练表单数据结构
interface CoachFormData {
  name: string;
  gender: "male" | "female";
  birthDate: string;
  idCard: string;
  phone: string;
  joinDate: string;
  bio: string;
  status: "active" | "inactive" | "on_leave";
}

interface CoachFormProps {
  initialData?: Partial<CoachFormData>;
  coachId?: string;
}

export function CoachForm({ initialData, coachId }: CoachFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CoachFormData>({
    name: initialData?.name || "",
    gender: initialData?.gender || "male",
    birthDate: initialData?.birthDate
      ? new Date(initialData.birthDate).toISOString().split("T")[0]
      : "",
    idCard: initialData?.idCard || "",
    phone: initialData?.phone || "",
    joinDate: initialData?.joinDate
      ? new Date(initialData.joinDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    bio: initialData?.bio || "",
    status: initialData?.status || "active",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const url = coachId ? `/api/coaches/${coachId}` : "/api/coaches";
    const method = coachId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push(coachId ? `/coaches/${coachId}` : `/coaches/${data.id}`);
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
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as "male" | "female" })
              }
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
          <div className="space-y-2">
            <Label>入职日期 *</Label>
            <Input
              type="date"
              required
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>个人简介</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="请输入教练的资质、特长、教学经验等..."
            />
          </div>
          <div className="space-y-2">
            <Label>在职状态</Label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as "active" | "inactive" | "on_leave",
                })
              }
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="active">在职</option>
              <option value="on_leave">休假中</option>
              <option value="inactive">已离职</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/coaches")}
        >
          取消
        </Button>
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700"
          disabled={loading}
        >
          {loading ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
