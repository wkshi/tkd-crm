import { NextRequest } from "next/server";
import { generateText } from "ai";
import { getModel } from "@/lib/ai-model";

// 语音转文字矫正提示词
const CORRECT_PROMPT = `你是一个中文语音转文字矫正助手。请对用户的语音输入文本进行以下矫正：

1. 修正同音字错误（如"在"→"再"、"做"→"作"等）
2. 将口语化表达转为书面语
3. 补充适当的标点符号
4. 去除多余的语气词（如"啊"、"嗯"、"那个"等）
5. 修正明显的语法错误

注意：
- 保持用户的原意不变
- 保持专业术语准确（跆拳道相关术语不要改动）
- 只返回矫正后的文本，不要添加任何解释、前缀或后缀
- 如果原文已经很好，直接返回原文`;

/**
 * 语音文本矫正接口
 * POST /api/correct
 * Body: { text: string }
 * Response: { corrected: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return Response.json(
        { error: "文本不能为空" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: getModel(),
      system: CORRECT_PROMPT,
      prompt: text.trim(),
    });

    return Response.json({ corrected: result.text.trim() });
  } catch (error) {
    console.error("语音矫正失败:", error);
    return Response.json(
      { error: "矫正服务暂不可用" },
      { status: 500 }
    );
  }
}
