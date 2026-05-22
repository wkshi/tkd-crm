import { CoachForm } from "@/components/coaches/coach-form";

export default function NewCoachPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">新增教练</h2>
      <CoachForm />
    </div>
  );
}
