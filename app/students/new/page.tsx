import { StudentForm } from "@/components/students/student-form";

export default function NewStudentPage() {
 return (
 <div className="space-y-6">
 <h2 className="text-2xl font-bold text-[#1D1D1F]">新增学员</h2>
 <StudentForm />
 </div>
 );
}
