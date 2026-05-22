import { NextResponse } from "next/server";

/**
 * 返回客户端可用的系统配置
 * 注意：只返回非敏感的配置项
 */
export async function GET() {
  return NextResponse.json({
    model: process.env.MODEL || "openai:gpt-4o",
  });
}
