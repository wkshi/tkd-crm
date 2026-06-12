"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Equipment {
  id: string;
  name: string;
  currentStock: number;
}

interface Transaction {
  id: string;
  type: "in" | "out" | "adjust";
  quantity: number;
  reason: string | null;
  operator: string | null;
  createdAt: string;
  relatedStudent: { id: string; name: string } | null;
  relatedCoach: { id: string; name: string } | null;
}

interface StudentOption {
  id: string;
  name: string;
}

interface CoachOption {
  id: string;
  name: string;
}

interface TransactionDialogProps {
  equipment: Equipment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const typeMap: Record<string, { label: string; color: string }> = {
  in: { label: "入库", color: "text-[#34C759]" },
  out: { label: "出库", color: "text-[#D9264A]" },
  adjust: { label: "盘点", color: "text-[#FF9500]" },
};

export function TransactionDialog({
  equipment,
  open,
  onOpenChange,
  onSuccess,
}: TransactionDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);

  const [form, setForm] = useState({
    type: "in" as "in" | "out" | "adjust",
    quantity: 1,
    reason: "",
    operator: "",
    relatedStudentId: "",
    relatedCoachId: "",
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/equipment/${equipment.id}/transactions?pageSize=9999`
      );
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("加载流水失败", err);
    } finally {
      setLoading(false);
    }
  }, [equipment.id]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();

    // 加载学员与教练下拉选项
    Promise.all([
      fetch("/api/students?pageSize=9999&status=active")
        .then((res) => res.json())
        .then((data) => setStudents(data.students || []))
        .catch(() => setStudents([])),
      fetch("/api/coaches?pageSize=9999&status=active")
        .then((res) => res.json())
        .then((data) => setCoaches(data.coaches || []))
        .catch(() => setCoaches([])),
    ]);
  }, [open, fetchTransactions]);

  function resetForm() {
    setForm({
      type: "in",
      quantity: 1,
      reason: "",
      operator: "",
      relatedStudentId: "",
      relatedCoachId: "",
    });
  }

  async function handleSubmit() {
    if (form.quantity <= 0) {
      alert("数量必须大于 0");
      return;
    }

    try {
      const res = await fetch("/api/equipment/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: equipment.id,
          type: form.type,
          quantity: form.quantity,
          reason: form.reason || undefined,
          operator: form.operator || undefined,
          relatedStudentId: form.relatedStudentId || undefined,
          relatedCoachId: form.relatedCoachId || undefined,
        }),
      });

      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // 服务端返回非 JSON（如 500 HTML），忽略解析失败
      }
      if (!res.ok) {
        alert(data.error || `登记失败（${res.status}）`);
        return;
      }

      resetForm();
      fetchTransactions();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("登记失败");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            「{equipment.name}」出入库流水
            <span className="ml-2 text-[14px] font-normal text-[#6E6E73]">
              当前库存 {equipment.currentStock}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* 登记表单 */}
          <div className="bg-black/[0.03] rounded-[14px] p-4 space-y-4">
            <h4 className="text-[14px] font-medium text-[#1D1D1F]">
              登记变动
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-[#1D1D1F]">
                  类型
                </Label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as "in" | "out" | "adjust",
                    }))
                  }
                  className="w-full h-10 px-3 bg-white border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:outline-none"
                >
                  <option value="in">入库</option>
                  <option value="out">出库</option>
                  <option value="adjust">盘点调整</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-[#1D1D1F]">
                  数量
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                  className="bg-white border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-[#1D1D1F]">
                  原因/备注
                </Label>
                <Input
                  value={form.reason}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="采购、领用、盘点盈亏等"
                  className="bg-white border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-[#1D1D1F]">
                  操作人
                </Label>
                <Input
                  value={form.operator}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, operator: e.target.value }))
                  }
                  placeholder="管理员姓名"
                  className="bg-white border-0 rounded-[10px] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-[#1D1D1F]">
                  关联学员
                </Label>
                <select
                  value={form.relatedStudentId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      relatedStudentId: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 bg-white border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:outline-none"
                >
                  <option value="">无</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-[#1D1D1F]">
                  关联教练
                </Label>
                <select
                  value={form.relatedCoachId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      relatedCoachId: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 bg-white border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:outline-none"
                >
                  <option value="">无</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                className="rounded-full bg-[#1D1D1F] text-white hover:bg-black/80"
              >
                登记
              </Button>
            </div>
          </div>

          {/* 流水列表 */}
          <div className="space-y-2">
            <h4 className="text-[14px] font-medium text-[#1D1D1F]">
              历史流水
            </h4>
            {loading ? (
              <div className="p-8 text-center text-[#A1A1A6]">加载中...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-[#A1A1A6]">
                暂无出入库记录
              </div>
            ) : (
              <div className="border border-black/[0.06] rounded-[14px] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-black/[0.04] hover:bg-transparent">
                      <TableHead className="text-[#6E6E73] font-medium">
                        时间
                      </TableHead>
                      <TableHead className="text-[#6E6E73] font-medium">
                        类型
                      </TableHead>
                      <TableHead className="text-[#6E6E73] font-medium">
                        数量
                      </TableHead>
                      <TableHead className="text-[#6E6E73] font-medium">
                        原因
                      </TableHead>
                      <TableHead className="text-[#6E6E73] font-medium">
                        关联人
                      </TableHead>
                      <TableHead className="text-[#6E6E73] font-medium">
                        操作人
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow
                        key={tx.id}
                        className="border-black/[0.04] hover:bg-black/[0.02]"
                      >
                        <TableCell className="text-[13px] text-[#6E6E73]">
                          {new Date(tx.createdAt).toLocaleString("zh-CN")}
                        </TableCell>
                        <TableCell
                          className={`text-[13px] font-medium ${
                            typeMap[tx.type]?.color || "text-[#1D1D1F]"
                          }`}
                        >
                          {typeMap[tx.type]?.label || tx.type}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#1D1D1F]">
                          {tx.quantity}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#6E6E73]">
                          {tx.reason || "—"}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#6E6E73]">
                          {tx.relatedStudent?.name ||
                            tx.relatedCoach?.name ||
                            "—"}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#6E6E73]">
                          {tx.operator || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
