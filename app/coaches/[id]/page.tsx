"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Phone, Calendar, MapPin } from "lucide-react";

// 课程数据类型
interface Course {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string | null;
}

// 教练数据类型
interface Coach {
  id: string;
  name: string;
  gender: string;
  birthDate: string | null;
  phone: string | null;
  joinDate: string;
  bio: string | null;
  status: string;
  courses: Course[];
}

export default function CoachDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoach() {
      const res = await fetch(`/api/coaches/${id}`);
      const data = await res.json();
      setCoach(data);
      setLoading(false);
    }
    fetchCoach();
  }, [id]);

  if (loading)
    return <div className="p-8 text-center text-[#A1A1A6]">加载中...</div>;
  if (!coach)
    return <div className="p-8 text-center text-[#A1A1A6]">教练不存在</div>;

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "在职", color: "bg-[#34C759]/10 text-[#34C759]" },
    on_leave: { label: "休假中", color: "bg-[#FF9500]/10 text-[#FF9500]" },
    inactive: { label: "已离职", color: "bg-[#8E8E93]/10 text-[#8E8E93]" },
  };

  const typeMap: Record<string, string> = {
    regular: "常规课",
    exam_prep: "考前集训",
    camp: "集训营",
    competition: "比赛",
  };

  const typeColorMap: Record<string, string> = {
    regular: "bg-blue-500/10 text-blue-700",
    exam_prep: "bg-purple-500/10 text-purple-700",
    camp: "bg-orange-500/10 text-orange-700",
    competition: "bg-red-500/10 text-[#D9264A]",
  };

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/coaches")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
        </div>
        <Button size="sm" onClick={() => router.push(`/coaches/${id}/edit`)}>
          <Pencil className="w-4 h-4 mr-2" />
          编辑
        </Button>
      </div>

      {/* 个人信息卡 */}
      <Card className="p-8">
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 rounded-[20px] overflow-hidden bg-black/[0.06] flex items-center justify-center">
              <span className="text-4xl font-bold text-[#A1A1A6]">
                {coach.name[0]}
              </span>
            </div>
            <p className="text-xl font-bold mt-4">{coach.name}</p>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">{coach.name}</h2>
              <span
                className={
                  statusMap[coach.status]?.color +
                  " px-3 py-1 rounded-full text-sm font-medium"
                }
              >
                {statusMap[coach.status]?.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6E6E73]">
              {coach.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {coach.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                入职 {new Date(coach.joinDate).toLocaleDateString("zh-CN")}
              </span>
              <span>性别: {coach.gender === "male" ? "男" : "女"}</span>
            </div>
            {coach.bio && (
              <div className="mt-4 text-sm text-[#6E6E73] bg-black/[0.06] rounded-[10px] p-4">
                <p className="font-medium mb-1">个人简介</p>
                <p className="whitespace-pre-wrap">{coach.bio}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 所授课程列表 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">所授课程</h3>
          <span className="text-sm text-[#6E6E73]">
            共 {coach.courses?.length || 0} 节
          </span>
        </div>
        {coach.courses?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {coach.courses.map((course) => (
              <div
                key={course.id}
                className="bg-black/[0.04] rounded-[14px] p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={typeColorMap[course.type] || "bg-black/[0.06]"}
                  >
                    {typeMap[course.type] || course.type}
                  </Badge>
                  <span className="font-medium">{course.title}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6E6E73]">
                  <span>
                    {new Date(course.startTime).toLocaleDateString("zh-CN")}
                  </span>
                  <span>
                    {new Date(course.startTime).toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    ~
                    {new Date(course.endTime).toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {course.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {course.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#A1A1A6] text-center py-8">暂无课程记录</p>
        )}
      </Card>
    </div>
  );
}
