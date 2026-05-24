"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Users, BookOpen, CalendarDays } from "lucide-react";

interface Student {
  id: string;
  name: string;
  photoUrl?: string | null;
  status: string;
}

interface Course {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

interface ClassDetail {
  id: string;
  name: string;
  level: string | null;
  description: string | null;
  maxStudents: number;
  status: string;
  students: Student[];
  courses: Course[];
  _count: { students: number; courses: number };
}

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/classes/${id}`);
      const data = await res.json();
      if (!cancelled) {
        setCls(data);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="p-8 text-center text-[#A1A1A6]">加载中...</div>;
  if (!cls) return <div className="p-8 text-center text-[#A1A1A6]">班级不存在</div>;

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "正常", color: "bg-green-500/10 text-green-700" },
    inactive: { label: "停用", color: "bg-black/[0.06] text-[#6E6E73]" },
    suspended: { label: "暂停", color: "bg-orange-500/10 text-orange-700" },
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/classes")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
        </div>
        <Button
          size="sm"
          onClick={() => router.push(`/classes/${id}/edit`)}
          className="rounded-full bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1]"
        >
          <Pencil className="w-4 h-4 mr-2" />
          编辑
        </Button>
      </div>

      {/* 班级信息卡 */}
      <Card className="p-8 bg-white rounded-[20px]">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-[#1D1D1F]">{cls.name}</h2>
              <Badge
                variant="secondary"
                className={`${statusMap[cls.status]?.color || ""} border-0`}
              >
                {statusMap[cls.status]?.label || cls.status}
              </Badge>
            </div>
            {cls.level && (
              <p className="text-sm text-[#6E6E73]">级别：{cls.level}</p>
            )}
            {cls.description && (
              <p className="text-sm text-[#6E6E73]">{cls.description}</p>
            )}
            <div className="flex gap-6 text-sm text-[#6E6E73]">
              <span className="inline-flex items-center gap-1">
                <Users className="w-4 h-4" />
                学员 {cls._count.students} / {cls.maxStudents}
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                课程 {cls._count.courses}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 学员列表 */}
      <Card className="p-6 bg-white rounded-[20px]">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#1D1D1F]" />
          <h3 className="text-lg font-semibold">班级学员（{cls.students.length} 人）</h3>
        </div>
        {cls.students.length === 0 ? (
          <p className="text-[#A1A1A6] text-center py-4">暂无学员</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cls.students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-[14px] bg-black/[0.04] cursor-pointer hover:bg-black/[0.06] transition-colors"
                onClick={() => router.push(`/students/${student.id}`)}
              >
                <div className="w-10 h-10 rounded-full bg-black/[0.06] flex items-center justify-center text-sm font-medium text-[#1D1D1F] shrink-0">
                  {student.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    student.name.charAt(0)
                  )}
                </div>
                <span className="text-sm font-medium text-[#1D1D1F] truncate">
                  {student.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 课程列表 */}
      <Card className="p-6 bg-white rounded-[20px]">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[#1D1D1F]" />
          <h3 className="text-lg font-semibold">近期课程</h3>
        </div>
        {cls.courses.length === 0 ? (
          <p className="text-[#A1A1A6] text-center py-4">暂无课程</p>
        ) : (
          <div className="space-y-2">
            {cls.courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between py-2 border-b border-black/[0.04] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#6E6E73]" />
                  <span className="text-sm font-medium text-[#1D1D1F]">
                    {course.title || "未命名课程"}
                  </span>
                </div>
                <span className="text-xs text-[#A1A1A6]">
                  {new Date(course.startTime).toLocaleDateString("zh-CN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
