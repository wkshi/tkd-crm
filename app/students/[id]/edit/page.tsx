"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";

export default function EditStudentPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  async function fetchStudent() {
    const res = await fetch(`/api/students/${id}`);
    const data = await res.json();
    setStudent(data);
    setLoading(false);
  }

  if (loading) return <div className="p-8 text-center text-slate-400">加载中...</div>;
  if (!student) return <div className="p-8 text-center text-slate-400">学员不存在</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">编辑学员</h2>
      <StudentForm initialData={student} studentId={student.id} />
    </div>
  );
}
