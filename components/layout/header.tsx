"use client";

import { usePathname } from "next/navigation";

const pageTitleMap: Record<string, string> = {
  "/": "仪表盘",
  "/students": "学员管理",
  "/students/new": "新增学员",
  "/coaches": "教练管理",
  "/coaches/new": "新增教练",
  "/classes": "班级管理",
  "/classes/new": "新增班级",
  "/calendar": "课表日历",
  "/attendance": "考勤查询",
  "/backup": "数据备份",
  "/ai": "AI 助手",
};

function getPageTitle(pathname: string): string {
  if (pageTitleMap[pathname]) return pageTitleMap[pathname];
  if (pathname.startsWith("/students/") && pathname.endsWith("/edit"))
    return "编辑学员";
  if (pathname.startsWith("/students/")) return "学员详情";
  if (pathname.startsWith("/coaches/") && pathname.endsWith("/edit"))
    return "编辑教练";
  if (pathname.startsWith("/coaches/")) return "教练详情";
  if (pathname.startsWith("/classes/") && pathname.endsWith("/edit"))
    return "编辑班级";
  if (pathname.startsWith("/classes/")) return "班级详情";
  if (pathname.startsWith("/attendance/rollcall")) return "课堂点名";
  if (pathname.startsWith("/attendance/students/")) return "学员考勤";
  return "";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="h-[52px] border-b border-black/[0.06] backdrop-blur-xl bg-white/78 flex items-center px-7 sticky top-0 z-30">
      {/* 当前页面标题 */}
      <h1 className="text-[17px] font-semibold text-[#1D1D1F]">{title}</h1>
    </header>
  );
}
