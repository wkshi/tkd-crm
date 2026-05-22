"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { UIMessage, isTextUIPart, isToolUIPart, DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Bot, User, Wrench, Sparkles } from "lucide-react";

// 快捷指令列表
const quickCommands = [
  { label: "查找学员", text: "帮我查找所有在籍学员" },
  { label: "今日课程", text: "今天有哪些课程？" },
  { label: "教练列表", text: "列出所有教练" },
  { label: "登记考勤", text: "帮我登记考勤" },
];

export default function AIPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 提交消息
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    await sendMessage({ text });
  }

  // 点击快捷指令
  function handleQuickCommand(text: string) {
    if (isLoading) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">AI 助手</h2>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          {process.env.MODEL || "openai:gpt-4o"}
        </Badge>
      </div>

      {/* 快捷指令栏 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {quickCommands.map((cmd) => (
          <Button
            key={cmd.label}
            variant="outline"
            size="sm"
            onClick={() => handleQuickCommand(cmd.text)}
            disabled={isLoading}
          >
            {cmd.label}
          </Button>
        ))}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Bot className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">我是跆拳道馆 CRM 的 AI 助手</p>
            <p className="text-sm mt-1">可以帮您查询和管理学员、教练、课程与考勤</p>
          </div>
        )}

        {messages.map((msg: UIMessage) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* 头像 */}
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-red-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* 消息内容 */}
              <div className="space-y-2">
                {msg.parts.map((part, idx) => {
                  if (isTextUIPart(part)) {
                    return (
                      <Card
                        key={idx}
                        className={`px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }`}
                      >
                        {part.text}
                      </Card>
                    );
                  }

                  if (isToolUIPart(part)) {
                    const toolName = part.type.replace("tool-", "");
                    const toolState = (part as Record<string, unknown>).state as string;
                    const toolInput = (part as Record<string, unknown>).input as Record<string, unknown>;
                    const toolOutput = (part as Record<string, unknown>).output as Record<string, unknown>;

                    return (
                      <Card
                        key={idx}
                        className="px-4 py-3 text-sm border-amber-200 bg-amber-50"
                      >
                        <div className="flex items-center gap-2 text-amber-700 font-medium mb-1">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>工具调用：{toolName}</span>
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                            {toolState === "input-streaming" && "解析参数中..."}
                            {toolState === "input-available" && "准备执行"}
                            {toolState === "output-available" && "已完成"}
                            {toolState === "error" && "执行失败"}
                          </Badge>
                        </div>
                        {toolInput && (
                          <pre className="text-xs text-slate-600 bg-white/60 rounded p-2 mt-1 overflow-auto max-h-32">
                            {JSON.stringify(toolInput, null, 2)}
                          </pre>
                        )}
                        {toolOutput && (
                          <div className="mt-2 text-xs text-green-700 bg-green-50 rounded p-2">
                            <strong>结果：</strong>
                            <pre className="mt-1 overflow-auto max-h-32">
                              {JSON.stringify(toolOutput, null, 2)}
                            </pre>
                          </div>
                        )}
                      </Card>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        ))}

        {error && (
          <div className="flex justify-center">
            <Badge variant="destructive">发生错误：{error.message}</Badge>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入问题，例如：查找所有在籍学员..."
          disabled={isLoading}
          className="flex-1"
        />
        {isLoading ? (
          <Button type="button" variant="outline" onClick={stop}>
            <Loader2 className="w-4 h-4 animate-spin" />
            停止
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim()} className="bg-red-600 hover:bg-red-700">
            <Send className="w-4 h-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
