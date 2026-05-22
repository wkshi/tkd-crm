"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CoachForm } from "@/components/coaches/coach-form";

export default function EditCoachPage() {
  const { id } = useParams();
  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoach();
  }, [id]);

  async function fetchCoach() {
    const res = await fetch(`/api/coaches/${id}`);
    const data = await res.json();
    setCoach(data);
    setLoading(false);
  }

  if (loading)
    return <div className="p-8 text-center text-slate-400">加载中...</div>;
  if (!coach)
    return <div className="p-8 text-center text-slate-400">教练不存在</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">编辑教练</h2>
      <CoachForm initialData={coach} coachId={coach.id} />
    </div>
  );
}
