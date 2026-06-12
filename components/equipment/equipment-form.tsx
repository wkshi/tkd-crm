"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Equipment {
  id: string;
  name: string;
  category: string;
  specification: string | null;
  currentStock: number;
  minStock: number;
  status: string;
  remark: string | null;
}

export interface EquipmentFormData {
  name: string;
  category: "uniform" | "gear" | "belt" | "pad" | "accessory" | "other";
  specification: string;
  minStock: number;
  status: "active" | "inactive" | "suspended";
  remark: string;
}

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Equipment | null;
  onSuccess?: () => void;
}

const categoryOptions = [
  { value: "uniform", label: "道服" },
  { value: "gear", label: "护具" },
  { value: "belt", label: "腰带" },
  { value: "pad", label: "脚靶" },
  { value: "accessory", label: "配件" },
  { value: "other", label: "其他" },
];

const statusOptions = [
  { value: "active", label: "正常" },
  { value: "inactive", label: "停用" },
  { value: "suspended", label: "暂停" },
];

export function EquipmentFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: EquipmentFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EquipmentFormData>({
    name: "",
    category: "gear",
    specification: "",
    minStock: 0,
    status: "active",
    remark: "",
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: initialData.name || "",
        category: (initialData.category as EquipmentFormData["category"]) || "gear",
        specification: initialData.specification || "",
        minStock: initialData.minStock || 0,
        status: (initialData.status as EquipmentFormData["status"]) || "active",
        remark: initialData.remark || "",
      });
    } else {
      setForm({
        name: "",
        category: "gear",
        specification: "",
        minStock: 0,
        status: "active",
        remark: "",
      });
    }
  }, [initialData, open]);

  function handleChange(
    field: keyof EquipmentFormData,
    value: string | number
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      alert("请输入装备名称");
      return;
    }

    setLoading(true);
    try {
      const url = initialData
        ? `/api/equipment/${initialData.id}`
        : "/api/equipment";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "操作失败");
        return;
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("操作失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "编辑装备" : "新增装备"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-[14px] font-medium text-[#1D1D1F]">
              装备名称 *
            </Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="例如：跆拳道道服"
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-[#1D1D1F]">
                装备类型
              </Label>
              <select
                value={form.category}
                onChange={(e) =>
                  handleChange(
                    "category",
                    e.target.value as EquipmentFormData["category"]
                  )
                }
                className="w-full h-10 px-3 bg-black/[0.06] border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-[#1D1D1F]">
                状态
              </Label>
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange(
                    "status",
                    e.target.value as EquipmentFormData["status"]
                  )
                }
                className="w-full h-10 px-3 bg-black/[0.06] border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[14px] font-medium text-[#1D1D1F]">
              规格/尺码
            </Label>
            <Input
              value={form.specification}
              onChange={(e) => handleChange("specification", e.target.value)}
              placeholder="例如：L 码、白色"
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-[#1D1D1F]">
                当前库存
              </Label>
              <div className="h-10 px-3 flex items-center bg-black/[0.04] rounded-[10px] text-[14px] text-[#6E6E73]">
                {initialData?.currentStock ?? 0}
                <span className="ml-2 text-[12px] text-[#A1A1A6]">
                  通过出入库流水变更
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[14px] font-medium text-[#1D1D1F]">
                最低库存预警
              </Label>
              <Input
                type="number"
                min={0}
                value={form.minStock}
                onChange={(e) =>
                  handleChange(
                    "minStock",
                    e.target.value === "" ? 0 : Number(e.target.value)
                  )
                }
                className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[14px] font-medium text-[#1D1D1F]">
              备注
            </Label>
            <Input
              value={form.remark}
              onChange={(e) => handleChange("remark", e.target.value)}
              placeholder="选填"
              className="bg-black/[0.06] border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-full text-[#6E6E73] hover:text-[#1D1D1F]"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full bg-[#1D1D1F] text-white hover:bg-black/80"
          >
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
