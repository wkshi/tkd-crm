"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Upload, AlertTriangle, CheckCircle, HardDrive } from "lucide-react";

export default function BackupPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 立即备份
  async function handleBackup() {
    setIsBackingUp(true);
    setMessage(null);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "备份失败");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tkd-crm-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "备份下载成功" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "备份失败" });
    } finally {
      setIsBackingUp(false);
    }
  }

  // 拖放处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".zip")) {
        setRestoreFile(file);
        setShowConfirm(true);
      } else {
        setMessage({ type: "error", text: "请上传 ZIP 格式的备份文件" });
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // 选择文件
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".zip")) {
        setRestoreFile(file);
        setShowConfirm(true);
      } else {
        setMessage({ type: "error", text: "请上传 ZIP 格式的备份文件" });
      }
    }
  }

  // 确认恢复
  async function handleConfirmRestore() {
    if (!restoreFile) return;
    setShowConfirm(false);
    setIsRestoring(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", restoreFile);
      const res = await fetch("/api/backup", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "恢复失败");
      }
      setMessage({ type: "success", text: "数据恢复成功，页面将刷新..." });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "恢复失败" });
    } finally {
      setIsRestoring(false);
      setRestoreFile(null);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">数据备份与恢复</h2>
        <HardDrive className="w-6 h-6 text-slate-400" />
      </div>

      {/* 操作提示 */}
      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* 备份区域 */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">数据备份</h3>
            <p className="text-sm text-slate-500 mt-1">
              导出数据库和上传的照片文件为 ZIP 压缩包
            </p>
          </div>
          <Button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="bg-red-600 hover:bg-red-700"
          >
            {isBackingUp ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isBackingUp ? "备份中..." : "立即备份"}
          </Button>
        </div>
      </Card>

      {/* 恢复区域 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">数据恢复</h3>
        <p className="text-sm text-slate-500 mb-4">
          上传之前导出的 ZIP 备份文件，系统将自动恢复数据库和照片
        </p>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-red-400 bg-red-50"
              : "border-slate-300 hover:border-slate-400 bg-slate-50"
          }`}
        >
          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-600">
            点击或拖放 ZIP 备份文件到此处
          </p>
          <p className="text-xs text-slate-400 mt-1">
            支持格式：.zip（包含 backup.sql 和 uploads/）
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {isRestoring && (
          <div className="flex items-center gap-2 mt-4 text-sm text-amber-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            正在恢复数据，请稍候...
          </div>
        )}
      </Card>

      {/* 确认恢复模态框 */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              确认恢复数据
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                您即将从备份文件 <Badge variant="outline">{restoreFile?.name}</Badge>{" "}
                恢复数据。
              </p>
              <p className="text-red-600 font-medium">
                此操作将覆盖当前数据库和照片文件，且无法撤销！
              </p>
              <p className="text-sm text-slate-500">
                系统会先自动创建当前数据的快照，以便紧急回滚。
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRestore}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              确认恢复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
