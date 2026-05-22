"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { useChat } from "@ai-sdk/react";
import { UIMessage, isTextUIPart, isToolUIPart, DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Bot, User, Wrench, Sparkles, RotateCcw, Mic, Check, X, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Web Speech API 类型声明（Chrome/Safari 支持，非标准 DOM 类型）
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const STORAGE_KEY = "tkd-crm-ai-chat-history";
const EMPTY_MESSAGES: UIMessage[] = [];

// 从 localStorage 加载历史消息
function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return EMPTY_MESSAGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : EMPTY_MESSAGES;
  } catch {
    return EMPTY_MESSAGES;
  }
}

// 保存消息到 localStorage
function saveMessages(msgs: UIMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    // storage full or serialization error — ignore
  }
}

// 快捷指令列表
const quickCommands = [
  { label: "查找学员", text: "帮我查找所有在籍学员" },
  { label: "今日课程", text: "今天有哪些课程？" },
  { label: "教练列表", text: "列出所有教练" },
  { label: "登记考勤", text: "帮我登记考勤" },
];

export default function AIPage() {
  const [input, setInput] = useState("");
  const [modelName, setModelName] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesCacheRef = useRef<UIMessage[] | null>(null);
  const voiceTextRef = useRef("");

  // 使用 useSyncExternalStore 避免 hydration 不匹配
  // getSnapshot 必须返回稳定引用，否则会导致无限重渲染
  const isSpeechSupported = useSyncExternalStore(
    () => () => {},
    () => "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
    () => false
  );

  const initialMessages = useSyncExternalStore(
    () => () => {},
    () => {
      if (messagesCacheRef.current === null) {
        messagesCacheRef.current = loadMessages();
      }
      return messagesCacheRef.current;
    },
    () => EMPTY_MESSAGES
  );

  // 从服务端获取当前模型配置（客户端无法直接读取 process.env）
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setModelName(data.model || ""))
      .catch(() => setModelName(""));
  }, []);

  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: initialMessages,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // 消息变化时自动保存到 localStorage
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // 清除对话历史，重新开始
  function handleReset() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setMessages([]);
  }

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 清理语音识别实例
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

  // 语音输入停止后，调用 AI 进行文本矫正
  async function correctVoiceText(rawText: string) {
    if (!rawText.trim()) return;
    setIsCorrecting(true);
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      if (!res.ok) throw new Error("矫正失败");
      const data = (await res.json()) as { corrected: string };
      setCorrectedText(data.corrected || rawText);
      setShowCorrection(true);
    } catch {
      // 矫正失败时直接使用原文
      setCorrectedText(rawText);
      setShowCorrection(true);
    } finally {
      setIsCorrecting(false);
    }
  }

  // 确认使用矫正后的文本
  function applyCorrectedText(text: string) {
    setInput((prev) => (prev ? prev + text : text));
    setShowCorrection(false);
    setVoiceText("");
    setCorrectedText("");
  }

  // 取消矫正，丢弃语音内容
  function cancelCorrection() {
    setShowCorrection(false);
    setVoiceText("");
    setCorrectedText("");
  }

  // 重新录音
  function retryVoiceInput() {
    setShowCorrection(false);
    setVoiceText("");
    setCorrectedText("");
    // 短暂延迟后自动开始录音
    setTimeout(() => startVoiceRecording(), 200);
  }

  // 开始录音
  function startVoiceRecording() {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) return;

    voiceTextRef.current = "";
    setVoiceText("");

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        voiceTextRef.current += finalTranscript;
        setVoiceText(voiceTextRef.current);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.error("语音识别错误:", event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // 录音结束后，如果识别到了文本，自动触发 AI 矫正
      const finalText = voiceTextRef.current.trim();
      if (finalText) {
        correctVoiceText(finalText);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  // 切换语音输入
  function toggleVoiceInput() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (showCorrection) {
      cancelCorrection();
    }

    setVoiceText("");
    startVoiceRecording();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#1D1D1F]">AI 助手</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading || messages.length === 0}
            className="rounded-full text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.06] h-8 px-3"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            新对话
          </Button>
          <Badge className="gap-1 bg-black/[0.06] text-[#6E6E73] hover:bg-black/[0.06] border-0">
            <Sparkles className="w-3 h-3" />
            {modelName || "AI 助手"}
          </Badge>
        </div>
      </div>

      {/* 快捷指令栏 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {quickCommands.map((cmd) => (
          <Button
            key={cmd.label}
            onClick={() => handleQuickCommand(cmd.text)}
            disabled={isLoading}
            className="bg-black/[0.06] hover:bg-black/[0.1] hover:text-[#1D1D1F] text-[#6E6E73] px-3.5 py-1.5 rounded-full text-[12px] font-medium h-auto border-0 shadow-none"
          >
            {cmd.label}
          </Button>
        ))}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#A1A1A6]">
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
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-black/[0.06] text-[#1D1D1F]"
                    : "bg-black/[0.06] text-[#6E6E73]"
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
                        className={`px-4 py-3 text-sm leading-relaxed border-0 shadow-none ${
                          msg.role === "user"
                            ? "bg-[#1D1D1F] text-white rounded-[18px] rounded-tr-sm"
                            : "bg-white rounded-[18px] rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "user" ? (
                          part.text
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              code: ({ children }) => (
                                <code className="bg-black/[0.08] rounded px-1 py-0.5 text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-black/[0.06] rounded-[10px] p-3 overflow-auto text-xs font-mono my-2">
                                  {children}
                                </pre>
                              ),
                              ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              a: ({ children, href }) => (
                                <a href={href} className="underline text-[#1D1D1F]/80 hover:text-[#1D1D1F]" target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                              h1: ({ children }) => <h1 className="text-lg font-bold my-2">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-bold my-2">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-bold my-1">{children}</h3>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-black/[0.15] pl-3 italic my-2 text-[#6E6E73]">
                                  {children}
                                </blockquote>
                              ),
                              hr: () => <hr className="my-3 border-black/[0.08]" />,
                              table: ({ children }) => (
                                <table className="w-full text-xs my-2 border-collapse">
                                  {children}
                                </table>
                              ),
                              thead: ({ children }) => <thead className="bg-black/[0.04]">{children}</thead>,
                              th: ({ children }) => (
                                <th className="text-left px-2 py-1.5 font-semibold border border-black/[0.08]">
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className="px-2 py-1.5 border border-black/[0.08]">
                                  {children}
                                </td>
                              ),
                            }}
                          >
                            {part.text}
                          </ReactMarkdown>
                        )}
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
                        className="px-4 py-3 text-sm bg-black/[0.04] rounded-[14px] border-0 shadow-none"
                      >
                        <div className="flex items-center gap-2 text-[#1D1D1F] font-medium mb-1">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>工具调用：{toolName}</span>
                          <Badge className="text-xs bg-transparent text-[#6E6E73] border-black/[0.1] hover:bg-transparent">
                            {toolState === "input-streaming" && "解析参数中..."}
                            {toolState === "input-available" && "准备执行"}
                            {toolState === "output-available" && "已完成"}
                            {toolState === "error" && "执行失败"}
                          </Badge>
                        </div>
                        {toolInput && (
                          <pre className="text-xs text-[#6E6E73] bg-black/[0.04] rounded p-2 mt-1 overflow-auto max-h-32">
                            {JSON.stringify(toolInput, null, 2)}
                          </pre>
                        )}
                        {toolOutput && (
                          <div className="mt-2 text-xs text-[#1D1D1F] bg-black/[0.04] rounded p-2">
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
            <Badge className="bg-[#D9264A] text-white hover:bg-[#D9264A] border-0">发生错误：{error.message}</Badge>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 语音矫正卡片 */}
      {isCorrecting && (
        <Card className="mt-4 bg-white rounded-[20px] border-0 shadow-none p-5">
          <div className="flex items-center gap-2 text-[#6E6E73] text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI 正在矫正语音内容...</span>
          </div>
        </Card>
      )}

      {showCorrection && (
        <Card className="mt-4 bg-white rounded-[20px] border-0 shadow-none p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#1D1D1F] font-medium text-sm">
            <Pencil className="w-4 h-4" />
            <span>语音输入矫正</span>
          </div>

          {/* 原文 */}
          <div className="space-y-1">
            <p className="text-xs text-[#6E6E73]">识别原文</p>
            <div className="text-sm text-[#6E6E73] bg-black/[0.04] rounded-[10px] px-3 py-2">
              {voiceText}
            </div>
          </div>

          {/* 矫正后（可编辑） */}
          <div className="space-y-1">
            <p className="text-xs text-[#6E6E73]">AI 矫正后（可编辑）</p>
            <textarea
              value={correctedText}
              onChange={(e) => setCorrectedText(e.target.value)}
              className="w-full text-sm text-[#1D1D1F] bg-black/[0.04] rounded-[10px] px-3 py-2 border-0 outline-none focus-visible:ring-1 focus-visible:ring-[#1D1D1F]/20 resize-none"
              rows={3}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => applyCorrectedText(correctedText)}
              className="flex-1 bg-[#1D1D1F] hover:bg-black/80 text-white rounded-full h-9 text-sm font-medium border-0 shadow-none"
            >
              <Check className="w-4 h-4 mr-1.5" />
              使用矫正结果
            </Button>
            <Button
              type="button"
              onClick={() => applyCorrectedText(voiceText)}
              className="flex-1 bg-black/[0.06] hover:bg-black/[0.1] text-[#1D1D1F] rounded-full h-9 text-sm font-medium border-0 shadow-none"
            >
              <X className="w-4 h-4 mr-1.5" />
              使用原文
            </Button>
            <Button
              type="button"
              onClick={retryVoiceInput}
              className="bg-black/[0.06] hover:bg-black/[0.1] text-[#6E6E73] rounded-full h-9 text-sm font-medium border-0 shadow-none px-4"
            >
              <Mic className="w-4 h-4 mr-1.5" />
              重录
            </Button>
          </div>
        </Card>
      )}

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening
              ? voiceText || "正在聆听，请说话..."
              : "输入问题，例如：查找所有在籍学员..."
          }
          disabled={isLoading || isCorrecting}
          className="flex-1 bg-black/[0.06] rounded-full px-5 py-3 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {isSpeechSupported && !isLoading && (
          <Button
            type="button"
            onClick={toggleVoiceInput}
            className={`w-9 h-9 rounded-full p-0 flex items-center justify-center border-0 shadow-none transition-colors ${
              isListening
                ? "bg-[#1D1D1F] text-white"
                : "bg-black/[0.06] text-[#6E6E73] hover:bg-black/[0.1] hover:text-[#1D1D1F]"
            }`}
            title={isListening ? "停止语音输入" : "语音输入"}
          >
            <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
          </Button>
        )}
        {isLoading ? (
          <Button type="button" onClick={stop} className="rounded-full bg-black/[0.06] hover:bg-black/[0.1] text-[#6E6E73] px-4 h-9 text-sm font-medium border-0 shadow-none">
            <Loader2 className="w-4 h-4 animate-spin" />
            停止
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim()} className="w-9 h-9 rounded-full bg-[#1D1D1F] hover:bg-black/80 p-0 flex items-center justify-center border-0 shadow-none">
            <Send className="w-4 h-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
