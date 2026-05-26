"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CoachForm } from "@/components/coaches/coach-form";

export default function EditCoachPage() {
 const { id } = useParams();
 const [coach, setCoach] = useState<(Partial<import("@/components/coaches/coach-form").CoachFormData> & { id?: string; photoUrl?: string | null }) | null>(null);
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

 return (
 <div className="space-y-6">
 <CoachForm initialData={coach} coachId={coach.id} />
 </div>
 );
}
