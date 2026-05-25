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
  GraduationCap,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "仪表盘" },
  { href: "/students", icon: Users, label: "学员管理" },
  { href: "/coaches", icon: UserCog, label: "教练管理" },
  { href: "/classes", icon: GraduationCap, label: "班级管理" },
  { href: "/calendar", icon: CalendarDays, label: "课表日历" },
  { href: "/attendance", icon: ClipboardCheck, label: "考勤查询" },
  { href: "/backup", icon: HardDrive, label: "数据备份" },
  { href: "/ai", icon: Sparkles, label: "AI 助手" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 border-r border-black/[0.04] backdrop-blur-xl bg-white/70 flex flex-col h-screen sticky top-0 z-40">
      <div className="h-14 flex items-center px-5 gap-2">
        <GraduationCap className="w-[22px] h-[22px] text-[#1D1D1F]" />
        <span className="text-[17px] font-bold tracking-tight text-[#1D1D1F]">跆拳道 CRM</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center h-11 px-3 rounded-[10px] text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-[#0071E3]/8 text-[#0071E3] font-semibold"
                  : "text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
              )}
            >
              <Icon className="w-[18px] h-[18px] mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
