"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// 教练表单数据结构
export interface CoachFormData {
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
      {/* 照片预览 */}
      <div className="bg-white rounded-[20px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#D9264A] rounded-full" />
          <h3 className="text-lg font-semibold">照片</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-[20px] border-2 border-dashed border-black/[0.12] bg-black/[0.04] flex items-center justify-center overflow-hidden">
            <span className="text-3xl font-bold text-[#A1A1A6]">
              {form.name?.[0] || "?"}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                type="button"
                className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
              >
                拍照
              </Button>
              <Button
                type="button"
                className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
              >
                选择文件
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[#A1A1A6] hover:text-[#1D1D1F] hover:bg-black/[0.06] rounded-full w-fit"
            >
              清除照片
            </Button>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-[20px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#D9264A] rounded-full" />
          <h3 className="text-lg font-semibold">基本信息</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>姓名 *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>性别 *</Label>
            <div className="bg-black/[0.06] rounded-[10px] p-1 flex">
              {[
                { value: "male", label: "男" },
                { value: "female", label: "女" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, gender: opt.value as "male" | "female" })
                  }
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    form.gender === opt.value
                      ? "bg-white shadow-sm text-[#1D1D1F]"
                      : "text-[#6E6E73]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>出生日期</Label>
            <Input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>身份证号</Label>
            <Input
              value={form.idCard}
              onChange={(e) => setForm({ ...form, idCard: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>电话号码</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>入职日期 *</Label>
            <Input
              type="date"
              required
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>个人简介</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white focus:outline-none"
              placeholder="请输入教练的资质、特长、教学经验等..."
            />
          </div>
          <div className="space-y-2">
            <Label>在职状态</Label>
            <div className="bg-black/[0.06] rounded-[10px] p-1 flex">
              {[
                { value: "active", label: "在职" },
                { value: "on_leave", label: "休假中" },
                { value: "inactive", label: "已离职" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      status: opt.value as "active" | "inactive" | "on_leave",
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
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          onClick={() => router.push("/coaches")}
          className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
        >
          取消
        </Button>
        <Button
          type="submit"
          className="rounded-full bg-[#D9264A] text-white hover:opacity-90"
          disabled={loading}
        >
          {loading ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  );
}
