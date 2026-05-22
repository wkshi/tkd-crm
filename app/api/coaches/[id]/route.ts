import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 更新教练的验证模式
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  gender: z.enum(["male", "female"]).optional(),
  birthDate: z.string().optional(),
  idCard: z.string().optional(),
  phone: z.string().optional(),
  joinDate: z.string().optional(),
  bio: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).optional(),
});

// 获取单个教练详情（包含所授课程）
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const coach = await prisma.coach.findUnique({
    where: { id },
    include: {
      courses: {
        orderBy: { startTime: "desc" },
        take: 20,
      },
    },
  });

  if (!coach) {
    return Response.json({ error: "教练不存在" }, { status: 404 });
  }

  return Response.json(coach);
}

// 更新教练信息
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data = updateSchema.parse(body);

  const coach = await prisma.coach.update({
    where: { id },
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
    },
  });

  return Response.json(coach);
}

// 软删除教练（将状态设为 inactive）
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.coach.update({
    where: { id },
    data: { status: "inactive" },
  });

  return Response.json({ success: true });
}
