import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Status } from "@prisma/client";
import { z } from "zod";

// 创建班级的验证模式
const createSchema = z.object({
  name: z.string().min(1),
  level: z.string().optional(),
  description: z.string().optional(),
  maxStudents: z.number().default(30),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  studentIds: z.array(z.string()).optional(),
});

// 获取班级列表（支持名称搜索和状态筛选）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Prisma.ClassWhereInput = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (status) {
    where.status = status as Status;
  }

  const [classes, total] = await Promise.all([
    prisma.class.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { students: true, courses: true } },
      },
    }),
    prisma.class.count({ where }),
  ]);

  return Response.json({ classes, total, page, pageSize });
}

// 创建新班级
export async function POST(req: Request) {
  const body = await req.json();
  const data = createSchema.parse(body);

  const cls = await prisma.class.create({
    data: {
      name: data.name,
      level: data.level,
      description: data.description,
      maxStudents: data.maxStudents,
      status: data.status,
      students: data.studentIds?.length
        ? { connect: data.studentIds.map((id) => ({ id })) }
        : undefined,
    },
    include: {
      students: { select: { id: true, name: true } },
      _count: { select: { students: true, courses: true } },
    },
  });

  return Response.json(cls);
}
