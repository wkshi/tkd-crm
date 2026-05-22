import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGroq } from "@ai-sdk/groq";
import { createProviderRegistry } from "ai";

// 初始化各个 AI 提供商
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });
const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// 创建 Provider Registry，统一管理多模型路由
export const registry = createProviderRegistry({
  openai,
  anthropic,
  google,
  deepseek,
  groq,
});

/**
 * 根据环境变量 MODEL 获取对应的语言模型实例
 * 格式：provider:modelId，例如 openai:gpt-4o
 * 支持 custom: 前缀，用于兼容 OpenAI API 的自定义端点
 */
export function getModel() {
  const modelEnv = process.env.MODEL || "openai:gpt-4o";

  // 自定义 OpenAI 兼容端点
  if (modelEnv.startsWith("custom:")) {
    const baseURL = process.env.CUSTOM_OPENAI_BASE_URL;
    const apiKey = process.env.CUSTOM_OPENAI_API_KEY;
    const modelId = modelEnv.replace("custom:", "");

    const customOpenAI = createOpenAI({
      baseURL,
      apiKey,
    });

    return customOpenAI(modelId);
  }

  return registry.languageModel(modelEnv as Parameters<typeof registry.languageModel>[0]);
}
