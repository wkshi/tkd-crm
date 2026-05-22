"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CalendarDays,
  ClipboardCheck,
  HardDrive,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "仪表盘" },
  { href: "/students", icon: Users, label: "学员管理" },
  { href: "/coaches", icon: UserCog, label: "教练管理" },
  { href: "/calendar", icon: CalendarDays, label: "课表日历" },
  { href: "/attendance", icon: ClipboardCheck, label: "考勤查询" },
  { href: "/backup", icon: HardDrive, label: "数据备份" },
  { href: "/ai", icon: Sparkles, label: "AI 助手" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0">
      <div className="h-14 flex items-center px-4 border-b border-slate-200">
        <span className="text-lg font-bold text-slate-900">跆拳道 CRM</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-red-600 bg-red-50 border-r-2 border-red-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
