import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 更新班级的验证模式
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  level: z.string().optional(),
  description: z.string().optional(),
  maxStudents: z.number().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  studentIds: z.array(z.string()).optional(),
});

// 获取单个班级详情
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      students: { select: { id: true, name: true, photoUrl: true, status: true } },
      courses: {
        select: { id: true, title: true, startTime: true, endTime: true },
        orderBy: { startTime: "desc" },
        take: 10,
      },
      _count: { select: { students: true, courses: true } },
    },
  });

  if (!cls) {
    return Response.json({ error: "班级不存在" }, { status: 404 });
  }

  return Response.json(cls);
}

// 更新班级信息
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data = updateSchema.parse(body);

  const cls = await prisma.class.update({
    where: { id },
    data: {
      name: data.name,
      level: data.level,
      description: data.description,
      maxStudents: data.maxStudents,
      status: data.status,
      students:
        data.studentIds !== undefined
          ? { set: data.studentIds.map((sid) => ({ id: sid })) }
          : undefined,
    },
    include: {
      students: { select: { id: true, name: true, photoUrl: true } },
      _count: { select: { students: true, courses: true } },
    },
  });

  return Response.json(cls);
}

// 删除班级
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 软删除：将状态设为 inactive，保留关联数据
  await prisma.class.update({
    where: { id },
    data: { status: "inactive" },
  });

  return Response.json({ success: true });
}
