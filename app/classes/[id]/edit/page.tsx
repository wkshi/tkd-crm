"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ClassForm } from "@/components/classes/class-form";

export default function EditClassPage() {
  const { id } = useParams();
  const [cls, setCls] = useState<Partial<import("@/components/classes/class-form").ClassFormData> & { id?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClass() {
      const res = await fetch(`/api/classes/${id}`);
      const data = await res.json();
      const studentIds = data.students?.map((s: { id: string }) => s.id) || [];
      setCls({
        name: data.name,
        level: data.level || "",
        description: data.description || "",
        maxStudents: data.maxStudents,
        status: data.status,
        studentIds,
        id: data.id,
      });
      setLoading(false);
    }
    fetchClass();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-[#A1A1A6]">加载中...</div>;
  if (!cls) return <div className="p-8 text-center text-[#A1A1A6]">班级不存在</div>;

  return (
    <div className="space-y-6">
      <ClassForm initialData={cls} classId={cls.id} />
    </div>
  );
}
