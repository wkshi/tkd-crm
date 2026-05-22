import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, UIMessage } from "ai";
import { getModel } from "@/lib/ai-model";
import {
  searchStudents,
  getStudentDetail,
  createStudent,
  updateStudent,
  deleteStudent,
  searchCoaches,
  getCoachDetail,
  createCoach,
  updateCoach,
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  takeAttendance,
  getAttendance,
  getCurrentTime,
} from "@/lib/ai-tools";

// 系统提示词，定义 AI 助手的角色和行为边界
const SYSTEM_PROMPT = `你是跆拳道馆 CRM 系统的 AI 助手，可以帮助用户管理学员、教练、课程和考勤数据。

你可以执行以下操作：
- 查询、创建、更新、删除学员信息
- 查询、创建、更新教练信息
- 查询、创建、更新、删除课程信息
- 登记和查询考勤记录

注意事项：
- 所有日期请使用 ISO 8601 格式
- 删除学员和教练时执行软删除（将状态设为 inactive）
- 回复使用中文，保持专业、简洁、友好
- 当你需要知道当前日期或时间时，调用 getCurrentTime 工具获取`;

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 将 UI 消息转换为模型消息
  const modelMessages = await convertToModelMessages(messages);

  // 使用 streamText 进行流式对话，并绑定所有工具
  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: {
      searchStudents,
      getStudentDetail,
      createStudent,
      updateStudent,
      deleteStudent,
      searchCoaches,
      getCoachDetail,
      createCoach,
      updateCoach,
      listCourses,
      createCourse,
      updateCourse,
      deleteCourse,
      takeAttendance,
      getAttendance,
      getCurrentTime,
    },
  });

  // 返回 UI 消息流响应，供前端 useChat 消费
  return result.toUIMessageStreamResponse();
}
