"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Pencil,
  Phone,
  Calendar,
  Trophy,
  Award,
  MapPin,
  BarChart3,
  Plus,
} from "lucide-react";

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 成长记录弹窗状态
  const [gradingOpen, setGradingOpen] = useState(false);
  const [competitionOpen, setCompetitionOpen] = useState(false);
  const [campOpen, setCampOpen] = useState(false);

  // 考级表单
  const [gradingForm, setGradingForm] = useState({
    examDate: "",
    beltLevel: "white",
    certificateNo: "",
    notes: "",
  });

  // 比赛表单
  const [competitionForm, setCompetitionForm] = useState({
    competitionDate: "",
    competitionName: "",
    category: "",
    result: "",
    award: "",
  });

  // 集训表单
  const [campForm, setCampForm] = useState({
    activityDate: "",
    activityName: "",
    location: "",
    duration: "",
    notes: "",
  });

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchStudent() {
    const res = await fetch(`/api/students/${id}`);
    const data = await res.json();
    setStudent(data);
    setLoading(false);
  }

  async function submitGrading(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/grading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...gradingForm, studentId: id }),
    });
    if (res.ok) {
      setGradingOpen(false);
      setGradingForm({ examDate: "", beltLevel: "white", certificateNo: "", notes: "" });
      fetchStudent();
    } else {
      alert("添加考级记录失败");
    }
  }

  async function submitCompetition(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/competition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...competitionForm, studentId: id }),
    });
    if (res.ok) {
      setCompetitionOpen(false);
      setCompetitionForm({ competitionDate: "", competitionName: "", category: "", result: "", award: "" });
      fetchStudent();
    } else {
      alert("添加比赛记录失败");
    }
  }

  async function submitCamp(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/camp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...campForm,
        studentId: id,
        duration: campForm.duration ? parseInt(campForm.duration) : undefined,
      }),
    });
    if (res.ok) {
      setCampOpen(false);
      setCampForm({ activityDate: "", activityName: "", location: "", duration: "", notes: "" });
      fetchStudent();
    } else {
      alert("添加集训记录失败");
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-400">加载中...</div>;
  if (!student) return <div className="p-8 text-center text-slate-400">学员不存在</div>;

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "在籍", color: "bg-green-50 text-green-700" },
    inactive: { label: "已结业", color: "bg-slate-100 text-slate-600" },
    suspended: { label: "暂停", color: "bg-yellow-50 text-yellow-700" },
  };

  const beltLabelMap: Record<string, string> = {
    white: "白带",
    white_yellow: "白黄带",
    yellow: "黄带",
    yellow_green: "黄绿带",
    green: "绿带",
    green_blue: "绿蓝带",
    blue: "蓝带",
    blue_red: "蓝红带",
    red: "红带",
    red_black: "红黑带",
    black: "黑带",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/students")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
        </div>
        <Button size="sm" onClick={() => router.push(`/students/${id}/edit`)}>
          <Pencil className="w-4 h-4 mr-2" />
          编辑
        </Button>
      </div>

      {/* 个人信息卡 */}
      <Card className="p-8">
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-slate-400">{student.name[0]}</span>
              )}
            </div>
            <p className="text-xl font-bold mt-4">{student.name}</p>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">{student.name}</h2>
              <span className={statusMap[student.status]?.color + " px-3 py-1 rounded-full text-sm font-medium"}>
                {statusMap[student.status]?.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {student.phone && (
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{student.phone}</span>
              )}
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />入学 {new Date(student.enrollmentDate).toLocaleDateString("zh-CN")}</span>
              <span>性别: {student.gender === "male" ? "男" : "女"}</span>
            </div>
            <div className="flex gap-8 mt-4">
              <div>
                <p className="text-3xl font-bold text-red-600">{student.remainingSessions}</p>
                <p className="text-sm text-slate-500">剩余课时</p>
              </div>
              {student.expiryDate && (
                <div>
                  <p className="text-lg font-semibold">{new Date(student.expiryDate).toLocaleDateString("zh-CN")}</p>
                  <p className="text-sm text-slate-500">到期时间</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 成长时间线 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">成长时间线</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setGradingOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            添加考级
          </Button>
        </div>
        {student.gradings?.length > 0 ? (
          <div className="space-y-4">
            {student.gradings.map((g: any) => (
              <div key={g.id} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-sm text-slate-500">{new Date(g.examDate).toLocaleDateString("zh-CN")}</span>
                <span className="font-semibold">{beltLabelMap[g.beltLevel] || g.beltLevel}</span>
                {g.certificateNo && <span className="text-xs text-slate-400">证书: {g.certificateNo}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">暂无考级记录</p>
        )}
      </Card>

      {/* 比赛记录 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">比赛记录</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCompetitionOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            添加比赛
          </Button>
        </div>
        {student.competitions?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {student.competitions.map((c: any) => (
              <div key={c.id} className="bg-slate-50 rounded-lg p-4">
                <p className="font-semibold">{c.competitionName}</p>
                <p className="text-sm text-slate-500">{new Date(c.competitionDate).toLocaleDateString("zh-CN")}</p>
                {c.result && <p className="text-sm text-slate-600">成绩: {c.result}</p>}
                {c.award && <p className="text-sm text-amber-600">获奖: {c.award}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">暂无比赛记录</p>
        )}
      </Card>

      {/* 集训记录 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">集训与拓展记录</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCampOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            添加集训
          </Button>
        </div>
        {student.camps?.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {student.camps.map((c: any) => (
              <div key={c.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs text-slate-500">{new Date(c.activityDate).toLocaleDateString("zh-CN")}</p>
                <p className="text-sm font-semibold mt-1">{c.activityName}</p>
                {c.location && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</p>}
                {c.duration && <p className="text-xs text-slate-400 mt-1">时长: {c.duration}小时</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">暂无集训记录</p>
        )}
      </Card>

      {/* 考勤统计 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold">考勤统计</h3>
        </div>
        {student.attendances?.length > 0 ? (
          <div className="space-y-2">
            {student.attendances.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-600">{new Date(a.attendanceDate).toLocaleDateString("zh-CN")}</span>
                <span className="text-sm font-medium">{a.course?.title || "课程"}</span>
                <Badge variant={a.status === "present" ? "default" : a.status === "absent" ? "destructive" : "secondary"}>
                  {a.status === "present" ? "出勤" : a.status === "absent" ? "缺勤" : a.status === "late" ? "迟到" : a.status === "leave" ? "请假" : "未点名"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">暂无考勤记录</p>
        )}
      </Card>

      {/* 添加考级记录弹窗 */}
      <Dialog open={gradingOpen} onOpenChange={setGradingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加考级记录</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitGrading} className="space-y-4">
            <div className="space-y-2">
              <Label>考级日期 *</Label>
              <Input
                type="date"
                required
                value={gradingForm.examDate}
                onChange={(e) => setGradingForm({ ...gradingForm, examDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>腰带等级 *</Label>
              <select
                required
                value={gradingForm.beltLevel}
                onChange={(e) => setGradingForm({ ...gradingForm, beltLevel: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="white">白带</option>
                <option value="white_yellow">白黄带</option>
                <option value="yellow">黄带</option>
                <option value="yellow_green">黄绿带</option>
                <option value="green">绿带</option>
                <option value="green_blue">绿蓝带</option>
                <option value="blue">蓝带</option>
                <option value="blue_red">蓝红带</option>
                <option value="red">红带</option>
                <option value="red_black">红黑带</option>
                <option value="black">黑带</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>证书编号</Label>
              <Input
                value={gradingForm.certificateNo}
                onChange={(e) => setGradingForm({ ...gradingForm, certificateNo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Input
                value={gradingForm.notes}
                onChange={(e) => setGradingForm({ ...gradingForm, notes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setGradingOpen(false)}>取消</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 添加比赛记录弹窗 */}
      <Dialog open={competitionOpen} onOpenChange={setCompetitionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加比赛记录</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCompetition} className="space-y-4">
            <div className="space-y-2">
              <Label>比赛日期 *</Label>
              <Input
                type="date"
                required
                value={competitionForm.competitionDate}
                onChange={(e) => setCompetitionForm({ ...competitionForm, competitionDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>比赛名称 *</Label>
              <Input
                required
                value={competitionForm.competitionName}
                onChange={(e) => setCompetitionForm({ ...competitionForm, competitionName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>参赛项目</Label>
              <Input
                value={competitionForm.category}
                onChange={(e) => setCompetitionForm({ ...competitionForm, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>成绩</Label>
              <Input
                value={competitionForm.result}
                onChange={(e) => setCompetitionForm({ ...competitionForm, result: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>获奖情况</Label>
              <Input
                value={competitionForm.award}
                onChange={(e) => setCompetitionForm({ ...competitionForm, award: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCompetitionOpen(false)}>取消</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 添加集训记录弹窗 */}
      <Dialog open={campOpen} onOpenChange={setCampOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加集训记录</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCamp} className="space-y-4">
            <div className="space-y-2">
              <Label>活动日期 *</Label>
              <Input
                type="date"
                required
                value={campForm.activityDate}
                onChange={(e) => setCampForm({ ...campForm, activityDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>活动名称 *</Label>
              <Input
                required
                value={campForm.activityName}
                onChange={(e) => setCampForm({ ...campForm, activityName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>地点</Label>
              <Input
                value={campForm.location}
                onChange={(e) => setCampForm({ ...campForm, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>时长（小时）</Label>
              <Input
                type="number"
                value={campForm.duration}
                onChange={(e) => setCampForm({ ...campForm, duration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Input
                value={campForm.notes}
                onChange={(e) => setCampForm({ ...campForm, notes: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCampOpen(false)}>取消</Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
