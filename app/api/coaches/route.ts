import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, CoachStatus } from "@prisma/client";
import { z } from "zod";

// 创建教练的验证模式
const createSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().optional(),
  idCard: z.string().optional(),
  phone: z.string().optional(),
  joinDate: z.string().optional(),
  bio: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
});

// 获取教练列表（支持搜索、状态筛选和分页）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const where: Prisma.CoachWhereInput = {};
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (status) {
    where.status = status as CoachStatus;
  }

  const [coaches, total] = await Promise.all([
    prisma.coach.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.coach.count({ where }),
  ]);

  return Response.json({ coaches, total, page, pageSize });
}

// 创建新教练
export async function POST(req: Request) {
  const body = await req.json();
  const data = createSchema.parse(body);

  const coach = await prisma.coach.create({
    data: {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
    },
  });

  return Response.json(coach);
}
