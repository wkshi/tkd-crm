"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";

export default function EditStudentPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<(Partial<import("@/components/students/student-form").StudentFormData> & { id?: string; photoUrl?: string | null }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();
      // 将 classes 数组转换为 classIds 数组
      const classIds = data.classes?.map((c: { id: string }) => c.id) || [];
      setStudent({ ...data, classIds });
      setLoading(false);
    }
    fetchStudent();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-[#A1A1A6]">加载中...</div>;
  if (!student) return <div className="p-8 text-center text-[#A1A1A6]">学员不存在</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1D1D1F]">编辑学员</h2>
      <StudentForm key={student.id} initialData={student} studentId={student.id} />
    </div>
  );
}
