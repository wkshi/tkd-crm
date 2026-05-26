"use client";

import { useState, useRef, useEffect } from "react";
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
  initialData?: Partial<CoachFormData & { photoUrl?: string | null }>;
  coachId?: string;
}

export function CoachForm({ initialData, coachId }: CoachFormProps) {
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

  // 当初始数据变化时同步表单状态（支持客户端导航复用组件）
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: initialData.name || "",
        gender: initialData.gender || "male",
        birthDate: initialData.birthDate
          ? new Date(initialData.birthDate).toISOString().split("T")[0]
          : "",
        idCard: initialData.idCard || "",
        phone: initialData.phone || "",
        joinDate: initialData.joinDate
          ? new Date(initialData.joinDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        bio: initialData.bio || "",
        status: initialData.status || "active",
      });
    }
  }, [initialData]);

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
      const url = coachId ? `/api/coaches/${coachId}` : "/api/coaches";
      const method = coachId ? "PUT" : "POST";

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

      const newCoachId = coachId || data.id;

      // 上传照片（如果有新选择的文件）
      if (photoFile && newCoachId) {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("id", newCoachId);
        formData.append("type", "coach");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          alert(uploadData.error || "照片上传失败，教练信息已保存");
        }
      }

      router.push(coachId ? `/coaches/${coachId}` : `/coaches/${newCoachId}`);
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
              <>
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  src={previewSrc}
                  alt="照片预览"
                  className="w-full h-full object-cover"
                />
                {/* eslint-enable @next/next/no-img-element */}
              </>
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
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
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
              max="9999-12-31"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>身份证号</Label>
            <Input
              value={form.idCard}
              onChange={(e) => setForm({ ...form, idCard: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>电话号码</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>入职日期 *</Label>
            <Input
              type="date"
              max="9999-12-31"
              required
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>个人简介</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
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
