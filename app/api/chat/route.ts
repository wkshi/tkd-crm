import { NextRequest } from "next/server";
import { streamText, convertToModelMessages, UIMessage, stepCountIs } from "ai";
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
  deleteCoach,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  addStudentsToClass,
  removeStudentsFromClass,
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  takeAttendance,
  getAttendance,
  createRecharge,
  searchRecharges,
  createGrading,
  updateGrading,
  deleteGrading,
  searchGradings,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  searchCompetitions,
  createCamp,
  updateCamp,
  deleteCamp,
  searchCamps,
  searchEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  searchEquipmentTransactions,
  createEquipmentTransaction,
  getCurrentTime,
} from "@/lib/ai-tools";

// 系统提示词，定义 AI 助手的角色和行为边界
const SYSTEM_PROMPT = `你是跆拳道馆 CRM 系统的 AI 助手，可以帮助用户管理学员、教练、班级、课程、考勤、充值、考级、比赛和集训数据。

你可以执行以下操作：
- 查询、创建、更新、删除学员信息
- 查询、创建、更新、删除教练信息
- 查询、创建、更新、删除班级信息
- 将学员添加到班级或从班级移除
- 查询、创建、更新、删除课程信息（课程必须关联到一个活动状态的班级）
- 登记和查询考勤记录
- 创建和查询充值记录（同时更新学员课时）
- 查询、创建、更新、删除考级晋升记录
- 查询、创建、更新、删除比赛记录
- 查询、创建、更新、删除集训/拓展活动记录
- 查询、创建、更新、删除装备库存记录（库存变更请通过出入库流水完成）
- 查询、创建装备出入库流水记录（入库、出库、盘点调整）

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
  // stopWhen 覆盖默认值 stepCountIs(1)，允许 AI 多步推理
  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    stopWhen: stepCountIs(10),
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
      deleteCoach,
      listClasses,
      createClass,
      updateClass,
      deleteClass,
      addStudentsToClass,
      removeStudentsFromClass,
      listCourses,
      createCourse,
      updateCourse,
      deleteCourse,
      takeAttendance,
      getAttendance,
      createRecharge,
      searchRecharges,
      createGrading,
      updateGrading,
      deleteGrading,
      searchGradings,
      createCompetition,
      updateCompetition,
      deleteCompetition,
      searchCompetitions,
      createCamp,
      updateCamp,
      deleteCamp,
      searchCamps,
      searchEquipment,
      createEquipment,
      updateEquipment,
      deleteEquipment,
      searchEquipmentTransactions,
      createEquipmentTransaction,
      getCurrentTime,
    },
  });

  // 返回 UI 消息流响应，供前端 useChat 消费
  return result.toUIMessageStreamResponse();
}
