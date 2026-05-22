"use client";

import { usePathname } from "next/navigation";

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
    <header className="h-14 border-b border-black/[0.08] backdrop-blur-xl bg-white/70 flex items-center px-8 sticky top-0 z-30">
      <h1 className="text-[22px] font-semibold text-[#1D1D1F]">{title}</h1>
    </header>
  );
}
