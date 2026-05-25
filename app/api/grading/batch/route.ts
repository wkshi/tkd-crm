import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const batchSchema = z.object({
  items: z
    .array(
      z.object({
        studentId: z.string().min(1),
        examDate: z.string().min(1),
        beltLevel: z.enum([
          "white",
          "white_yellow",
          "yellow",
          "yellow_green",
          "green",
          "green_blue",
          "blue",
          "blue_red",
          "red",
          "red_black",
          "black",
        ]),
        notes: z.string().optional(),
      }),
    )
    .min(1),
});

/**
 * POST /api/grading/batch
 * 批量创建考级记录
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = batchSchema.parse(body);

    const results = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const item of items) {
        const record = await tx.grading.create({
          data: {
            studentId: item.studentId,
            examDate: new Date(item.examDate),
            beltLevel: item.beltLevel,
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
    console.error("批量创建考级记录失败:", err);
    return Response.json({ error: "批量创建考级记录失败" }, { status: 500 });
  }
}
