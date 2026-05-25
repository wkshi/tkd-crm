import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const batchSchema = z.object({
  items: z
    .array(
      z.object({
        studentId: z.string().min(1),
        activityDate: z.string().min(1),
        activityName: z.string().min(1),
        location: z.string().optional(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .min(1),
});

/**
 * POST /api/camp/batch
 * 批量创建集训记录
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = batchSchema.parse(body);

    const results = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const item of items) {
        const record = await tx.camp.create({
          data: {
            studentId: item.studentId,
            activityDate: new Date(item.activityDate),
            activityName: item.activityName,
            location: item.location,
            duration: item.duration,
            notes: item.notes,
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
    console.error("批量创建集训记录失败:", err);
    return Response.json({ error: "批量创建集训记录失败" }, { status: 500 });
  }
}
