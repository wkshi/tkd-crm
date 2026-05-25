import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const batchSchema = z.object({
  items: z
    .array(
      z.object({
        studentId: z.string().min(1),
        competitionDate: z.string().min(1),
        competitionName: z.string().min(1),
        category: z.string().optional(),
        result: z.string().optional(),
        award: z.string().optional(),
      }),
    )
    .min(1),
});

/**
 * POST /api/competition/batch
 * 批量创建比赛记录
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = batchSchema.parse(body);

    const results = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const item of items) {
        const record = await tx.competition.create({
          data: {
            studentId: item.studentId,
            competitionDate: new Date(item.competitionDate),
            competitionName: item.competitionName,
            category: item.category,
            result: item.result,
            award: item.award,
          },
        });
        created.push(record);
      }
      return created;
    });

    return Response.json({ data: results, count: results.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "请求参数错误", details: err.issues },
        { status: 400 },
      );
    }
    console.error("批量创建比赛记录失败:", err);
    return Response.json({ error: "批量创建比赛记录失败" }, { status: 500 });
  }
}
