"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  initialData?: Partial<StudentFormData & { photoUrl?: string | null }>;
  studentId?: string;
}

export function StudentForm({ initialData, studentId }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const existingPhotoUrl = initialData?.photoUrl || null;

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

  // 处理文件选择（拍照或选择文件共用）
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("仅支持图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("文件大小不能超过 5MB");
      return;
    }

    // 释放之前的预览 URL
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  // 清除已选照片
  function handleClearPhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  // 打开摄像头（桌面端用 getUserMedia，移动端回退到 capture input）
  async function openCamera() {
    // 优先尝试 getUserMedia（支持桌面端和移动端实时预览）
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        setShowCamera(true);
        setCameraReady(false);
        // 等待 video 元素挂载后再绑定 stream
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setCameraReady(true);
            };
          }
        }, 50);
        return;
      } catch {
        // 权限被拒绝或不支持，回退到 capture input
      }
    }
    // 回退：触发 capture input（移动端原生相机）
    cameraInputRef.current?.click();
  }

  // 拍照：从 video 流捕获帧
  function takePhoto() {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        closeCamera();
      },
      "image/jpeg",
      0.9
    );
  }

  // 关闭摄像头
  function closeCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraReady(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 创建/更新学员
      const url = studentId ? `/api/students/${studentId}` : "/api/students";
      const method = studentId ? "PUT" : "POST";

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

      const newStudentId = studentId || data.id;

      // 2. 上传照片（如果有新选择的文件）
      if (photoFile && newStudentId) {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("id", newStudentId);
        formData.append("type", "student");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          alert(uploadData.error || "照片上传失败，学员信息已保存");
          // 学员已创建/更新成功，仍然跳转
        }
      }

      router.push(
        studentId ? `/students/${studentId}` : `/students/${newStudentId}`
      );
    } catch (err) {
      console.error(err);
      alert("操作失败");
      setLoading(false);
    }
  }

  // 照片预览显示优先级：本地预览 > 已有照片 URL > 首字母占位符
  const previewSrc = photoPreview || existingPhotoUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* 照片预览 */}
      <div className="bg-white rounded-[20px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1D1D1F] rounded-full" />
          <h3 className="text-lg font-semibold">照片</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-[20px] border-2 border-dashed border-black/[0.12] bg-black/[0.04] flex items-center justify-center overflow-hidden">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="照片预览"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-[#A1A1A6]">
                {form.name?.[0] || "?"}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              {/* 拍照 input（移动端调用相机） */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={cameraInputRef}
                onChange={handleFileSelect}
              />
              {/* 选择文件 input */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                onClick={openCamera}
                className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
              >
                拍照
              </Button>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
              >
                选择文件
              </Button>
            </div>
            {photoFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearPhoto}
                className="text-[#A1A1A6] hover:text-[#1D1D1F] hover:bg-black/[0.06] rounded-full w-fit"
              >
                清除照片
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-[20px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1D1D1F] rounded-full" />
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
        </div>
      </div>

      {/* 课务信息 */}
      <div className="bg-white rounded-[20px] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1D1D1F] rounded-full" />
          <h3 className="text-lg font-semibold">课务信息</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>入学时间 *</Label>
            <Input
              type="date"
              required
              value={form.enrollmentDate}
              onChange={(e) =>
                setForm({ ...form, enrollmentDate: e.target.value })
              }
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>剩余课时 *</Label>
            <Input
              type="number"
              required
              value={form.remainingSessions}
              onChange={(e) =>
                setForm({
                  ...form,
                  remainingSessions: parseInt(e.target.value) || 0,
                })
              }
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>到期时间</Label>
            <Input
              type="date"
              value={form.expiryDate}
              onChange={(e) =>
                setForm({ ...form, expiryDate: e.target.value })
              }
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>在籍状态</Label>
            <div className="bg-black/[0.06] rounded-[10px] p-1 flex">
              {[
                { value: "active", label: "在籍" },
                { value: "inactive", label: "已结业" },
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
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          onClick={() => router.push("/students")}
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

      {/* 摄像头拍照弹窗 */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col h-screen">
          {/* 视频预览区 */}
          <div className="flex-1 min-h-0 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <span className="text-sm">正在启动摄像头...</span>
              </div>
            )}
          </div>
          {/* 底部操作栏 */}
          <div
            className="shrink-0 h-28 flex items-center justify-center gap-8 bg-black"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
          >
            <Button
              type="button"
              onClick={closeCamera}
              className="rounded-full bg-white/10 text-white hover:bg-white/20 border-0 h-11 px-5"
            >
              取消
            </Button>
            <button
              type="button"
              onClick={takePhoto}
              disabled={!cameraReady}
              className="w-[72px] h-[72px] rounded-full bg-white disabled:opacity-40 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full border-[3px] border-[#1D1D1F]" />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
