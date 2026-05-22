"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  "/": "仪表盘",
  "/students": "学员管理",
  "/coaches": "教练管理",
  "/calendar": "课表日历",
  "/attendance": "考勤查询",
  "/backup": "数据备份",
  "/ai": "AI 助手",
};

export function Header() {
  const pathname = usePathname();
  const title = breadcrumbMap[pathname] || "";

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center px-6 sticky top-0 z-30">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
    </header>
  );
}
