"use client";

import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Package, AlertTriangle, History } from "lucide-react";
import { EquipmentFormDialog } from "@/components/equipment/equipment-form";
import { TransactionDialog } from "@/components/equipment/transaction-dialog";

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

const categoryMap: Record<string, string> = {
  uniform: "道服",
  gear: "护具",
  belt: "腰带",
  pad: "脚靶",
  accessory: "配件",
  other: "其他",
};

const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: "正常", color: "bg-green-500/10 text-green-700" },
  inactive: { label: "停用", color: "bg-black/[0.06] text-[#6E6E73]" },
  suspended: { label: "暂停", color: "bg-orange-500/10 text-orange-700" },
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("pageSize", "9999");

      const res = await fetch(`/api/equipment?${params.toString()}`);
      const data = await res.json();
      setEquipment(data.equipment || []);
    } catch (err) {
      console.error("加载装备数据失败", err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEquipment();
  }, [fetchEquipment]);

  function handleAdd() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function handleEdit(item: Equipment) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  function handleOpenTransactions(item: Equipment) {
    setSelectedEquipment(item);
    setTransactionDialogOpen(true);
  }

  async function handleDelete(item: Equipment) {
    if (!confirm(`确定要删除装备「${item.name}」吗？`)) return;

    try {
      const res = await fetch(`/api/equipment/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchEquipment();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch (err) {
      console.error(err);
      alert("删除失败");
    }
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
  }

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-end">
        <Button
          onClick={handleAdd}
          className="rounded-full bg-[#1D1D1F] text-white hover:bg-black/80"
        >
          <Plus className="w-4 h-4 mr-1" />
          新增装备
        </Button>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A6]" />
          <Input
            placeholder="搜索装备名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/[0.06] border-0 rounded-full focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 bg-black/[0.06] border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
        >
          <option value="">全部类型</option>
          {Object.entries(categoryMap).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 bg-black/[0.06] border-0 rounded-[10px] text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white focus:outline-none"
        >
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="inactive">停用</option>
          <option value="suspended">暂停</option>
        </select>

        {(search || categoryFilter || statusFilter) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="rounded-full text-[#6E6E73] hover:text-[#1D1D1F]"
          >
            清除筛选
          </Button>
        )}
      </div>

      {/* 装备列表 */}
      <Card className="bg-white rounded-[20px] shadow-none overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#A1A1A6]">加载中...</div>
        ) : equipment.length === 0 ? (
          <div className="p-12 text-center text-[#A1A1A6]">
            {search || categoryFilter || statusFilter
              ? "未找到匹配的装备"
              : "暂无装备，点击右上角新增"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-black/[0.04] hover:bg-transparent">
                <TableHead className="text-[#6E6E73] font-medium">装备名称</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">类型</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">规格</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">当前库存</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">最低库存</TableHead>
                <TableHead className="text-[#6E6E73] font-medium">状态</TableHead>
                <TableHead className="text-[#6E6E73] font-medium text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => {
                const isLowStock =
                  item.status === "active" && item.currentStock <= item.minStock;

                return (
                  <TableRow
                    key={item.id}
                    className="border-black/[0.04] hover:bg-black/[0.02]"
                  >
                    <TableCell className="font-medium text-[#1D1D1F]">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#A1A1A6]" />
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-[#6E6E73]">
                      {categoryMap[item.category] || item.category}
                    </TableCell>
                    <TableCell className="text-[#6E6E73]">
                      {item.specification || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-medium ${
                          isLowStock ? "text-[#D9264A]" : "text-[#1D1D1F]"
                        }`}
                      >
                        {isLowStock && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {item.currentStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#6E6E73]">
                      {item.minStock}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${
                          statusMap[item.status]?.color ||
                          "bg-black/[0.06] text-[#6E6E73]"
                        } border-0`}
                      >
                        {statusMap[item.status]?.label || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenTransactions(item)}
                        className="rounded-full text-[#6E6E73] hover:text-[#1D1D1F]"
                      >
                        <History className="w-3.5 h-3.5 mr-1" />
                        流水
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="rounded-full text-[#6E6E73] hover:text-[#1D1D1F]"
                      >
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="rounded-full text-[#D9264A] hover:text-[#D9264A] hover:bg-[#D9264A]/10"
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <EquipmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingItem}
        onSuccess={fetchEquipment}
      />

      {selectedEquipment && (
        <TransactionDialog
          equipment={selectedEquipment}
          open={transactionDialogOpen}
          onOpenChange={setTransactionDialogOpen}
          onSuccess={fetchEquipment}
        />
      )}
    </div>
  );
}
