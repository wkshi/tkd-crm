<!-- From: /Users/wkshi/git/github/wkshi/tkd-crm/AGENTS.md -->
# 跆拳道馆 CRM 系统 —— AI 代理指南

> 本文档供 AI 编码代理阅读。如果你正在阅读此文件，说明你对本项目一无所知——本文档将告诉你需要了解的一切。

---

## 项目概述

本项目是一个为跆拳道馆量身打造的客户关系管理（CRM）平台，覆盖学员全生命周期管理——从个人基本资料的录入，到课务与时间的精细化管理，再到成长与活动的完整记录，以及课表排期与考勤点名的一体化操作。系统深度集成 AI Agent 能力，用户可通过自然语言对话完成学员与课程的增删改查、课程点名等核心操作。

**当前状态**：项目已完成核心功能编码，包括数据库 Schema、REST API、前端页面、AI 对话流、照片上传、数据备份与恢复，以及完整的测试基础设施。`docs/` 目录下保留有产品需求文档（PRD）和 UI 设计文档作为参考。

---

## 技术栈

| 层级 | 技术方案 |
|------|----------|
| **前端框架** | Next.js 16 + App Router + React 19 |
| **语言** | TypeScript 5 |
| **样式** | Tailwind CSS 4 + shadcn/ui（base-nova 风格） |
| **UI 底层** | `@base-ui/react`（shadcn/ui 组件基于此构建） |
| **日历组件** | `@fullcalendar/react` |
| **数据库** | PostgreSQL 16 |
| **ORM** | Prisma 6 |
| **AI SDK** | Vercel AI SDK 6 + Provider Registry |
| **数据表格** | TanStack Table |
| **图表** | Recharts |
| **图标** | Lucide React |
| **容器化** | Docker + Docker Compose |
| **校验** | Zod |
| **测试** | Vitest + jsdom + @testing-library/react + next-test-api-route-handler |
| **构建工具** | Turbopack（开发模式） |

### 支持的 LLM 提供商

通过 Vercel AI SDK 的 Provider Registry 支持多提供商动态切换：

- OpenAI (`@ai-sdk/openai`) —— 同时用于兼容 OpenAI API 的第三方服务
- Anthropic Claude (`@ai-sdk/anthropic`)
- Google Gemini (`@ai-sdk/google`)
- DeepSeek (`@ai-sdk/deepseek`)
- Groq (`@ai-sdk/groq`)

模型通过环境变量 `MODEL=provider:model-id` 格式指定，例如 `openai:gpt-4o`。额外支持 `custom:` 前缀，通过 `CUSTOM_OPENAI_BASE_URL` 和 `CUSTOM_OPENAI_API_KEY` 接入自定义 OpenAI 兼容端点。

---

## 项目文件结构

```
tkd-crm/
├── app/                            # Next.js App Router
│   ├── api/                        # API 路由
│   │   ├── students/route.ts
│   │   ├── students/[id]/route.ts
│   │   ├── coaches/route.ts
│   │   ├── coaches/[id]/route.ts
│   │   ├── courses/route.ts
│   │   ├── courses/[id]/route.ts
│   │   ├── attendance/route.ts
│   │   ├── attendance/batch/route.ts   # 批量点名（事务扣减课时）
│   │   ├── grading/route.ts
│   │   ├── competition/route.ts
│   │   ├── camp/route.ts
│   │   ├── chat/route.ts           # AI 对话流式接口
│   │   ├── correct/route.ts        # 语音输入文本矫正
│   │   ├── config/route.ts         # 返回客户端可用的系统配置（如当前模型名）
│   │   ├── upload/route.ts         # 照片上传/删除
│   │   └── backup/route.ts         # 数据备份/恢复（ZIP + pg_dump/psql）
│   ├── page.tsx                    # 仪表盘首页（Server Component，直接查 Prisma）
│   ├── layout.tsx                  # 根布局（侧边栏导航 + Header）
│   ├── globals.css                 # Tailwind CSS 入口 + CSS 变量主题
│   ├── students/                   # 学员列表、新增、详情、编辑页面
│   ├── coaches/                    # 教练列表、新增、详情、编辑页面
│   ├── calendar/                   # 课表日历页面
│   ├── attendance/                 # 考勤查询页面
│   ├── ai/                         # AI 助手对话页面
│   └── backup/                     # 数据备份页面
├── components/                     # 可复用组件
│   ├── ui/                         # shadcn/ui 组件（badge, button, card, dialog, input, label, select, table）
│   ├── layout/                     # sidebar.tsx, header.tsx
│   ├── students/                   # student-form.tsx
│   ├── coaches/                    # coach-form.tsx
│   └── theme-provider.tsx          # Next Themes 提供者（默认 light，支持 D 键切换）
├── lib/                            # 工具函数与配置
│   ├── prisma.ts                   # Prisma Client 单例
│   ├── ai-model.ts                 # AI Provider Registry + getModel()
│   ├── ai-tools.ts                 # AI 工具函数封装（供 chat route 调用）
│   └── utils.ts                    # cn() 工具（clsx + tailwind-merge）
├── __tests__/                      # 测试文件
│   ├── api/                        # API 路由测试
│   ├── components/                 # 组件测试
│   ├── lib/                        # 工具函数测试
│   ├── helpers.ts                  # 测试辅助函数（部分函数，不推荐使用）
│   └── setup.ts                    # Vitest 全局 setup（mock next/navigation）
├── tests/                          # 主要测试辅助函数
│   └── helpers.ts                  # 测试辅助函数（cleanupTestData, createTestStudent 等，API 测试从此导入）
├── prisma/
│   ├── schema.prisma               # 数据库 Schema
│   └── migrations/                 # Prisma 迁移文件
├── public/
│   └── uploads/                    # 照片本地存储（students/ + coaches/）
├── scripts/
│   └── start-local-prod.sh         # 本地生产环境启动脚本（自动启动独立数据库）
├── docker-compose.yml              # PostgreSQL 16 + pgAdmin + 本地生产数据库容器配置
├── .env.local                      # 本地环境变量（不提交 Git）
├── .env                            # 默认环境变量模板
├── next.config.mjs                 # Next.js 配置（standalone 输出由 DOCKER_DEPLOY 控制）
├── vitest.config.ts                # Vitest 配置（jsdom + @vitejs/plugin-react）
├── eslint.config.mjs               # ESLint 配置（next/core-web-vitals + next/typescript）
├── postcss.config.mjs              # PostCSS 配置（@tailwindcss/postcss）
├── components.json                 # shadcn/ui 配置
└── package.json
```

---

## 数据库设计

使用 PostgreSQL + Prisma。核心数据模型包括：

- **Student**（学员）：基本信息、课务信息、照片路径
- **Coach**（教练）：基本信息、工作信息、照片路径
- **Course**（课程）：名称、类型、时间、关联教练
- **Attendance**（考勤）：课程-学员关联、出勤状态
- **Grading**（考级晋升记录）
- **Competition**（比赛记录）
- **Camp**（集训与拓展记录）

### 关键关联关系

```
Student (1) ──────< (N) Grading
Student (1) ──────< (N) Competition
Student (1) ──────< (N) Camp
Student (1) ──────< (N) Attendance
Coach   (1) ──────< (N) Course
Course  (1) ──────< (N) Attendance
```

- Coach 删除时，Course.coachId 自动设为 NULL（`onDelete: SetNull`）
- Attendance 有复合唯一索引：`@@unique([courseId, studentId, attendanceDate])`

### 枚举定义

- `Gender`: `male` / `female`
- `Status`（学员）: `active` / `inactive` / `suspended`
- `CoachStatus`: `active` / `inactive` / `on_leave`
- `CourseType`: `regular` / `exam_prep` / `camp` / `competition`
- `AttendanceStatus`: `present` / `absent` / `late` / `leave` / `unmarked`
- `BeltLevel`: `white` → `white_yellow` → `yellow` → ... → `black`（共 11 级）

---

## 环境变量

开发环境需要的 `.env.local`：

```env
# 数据库（本地 Docker）
DATABASE_URL="postgresql://taekwondo:taekwondo123@localhost:5432/taekwondo_crm"

# AI 模型选择（格式：provider:model-id）
MODEL=openai:gpt-4o

# 至少配置一个 API Key
OPENAI_API_KEY=sk-your-openai-api-key-here
# ANTHROPIC_API_KEY=sk-ant-your-key
# GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
# DEEPSEEK_API_KEY=your-deepseek-key
# GROQ_API_KEY=gsk-your-groq-key

# 兼容 OpenAI API 的自定义端点（可选）
# CUSTOM_OPENAI_BASE_URL=http://localhost:1234/v1
# CUSTOM_OPENAI_API_KEY=your-custom-key
```

---

## 构建与启动命令

### 数据库启动

```bash
# 启动开发环境数据库（PostgreSQL + pgAdmin）
docker compose up -d postgres pgadmin

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f postgres

# 停止
docker compose down

# 完全重置（删除数据卷）
docker compose down -v
```

**本地生产环境数据库**（与开发环境完全隔离）：

| 属性 | 开发环境 | 本地生产环境 |
|------|---------|------------|
| 服务名 | `postgres` | `postgres-prod` |
| 容器名 | `taekwondo-db` | `taekwondo-db-prod` |
| 端口 | `5432` | `5433` |
| 数据库名 | `taekwondo_crm` | `taekwondo_crm_prod` |
| 数据卷 | `postgres_data` | `postgres_data_prod` |

生产数据库由 `scripts/start-local-prod.sh` 自动管理，无需手动操作。

### 开发与运行

```bash
# 安装依赖
npm install

# 数据库迁移
npx prisma migrate dev --name init

# 生成 Prisma Client 类型
npx prisma generate

# 启动开发服务器（Turbopack）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run typecheck

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 本地生产环境启动

```bash
# 一键启动本地生产环境（自动启动独立数据库、迁移、构建、启动服务器）
./scripts/start-local-prod.sh [端口]

# 默认端口 3000
./scripts/start-local-prod.sh
```

脚本行为：
1. 启动 `postgres-prod` 容器（端口 5433）
2. 等待数据库就绪（`pg_isready` 轮询）
3. 设置 `DATABASE_URL` 指向生产数据库
4. 执行 `prisma migrate deploy`
5. 生成 Prisma Client
6. `NODE_ENV=production npm run build`
7. `NODE_ENV=production npx next start`
8. **退出时自动停止**生产数据库容器（`trap EXIT/INT/TERM`）

### 测试命令

```bash
# 运行所有测试（单次）
npm test

# 监听模式
npm run test:watch

# UI 模式
npm run test:ui
```

测试配置在 `vitest.config.ts` 中：
- 环境：`jsdom`
- 全局模式：开启
- 并行：`fileParallelism: false`（避免数据库并发冲突）
- 包含路径：`__tests__/**/*.test.ts` 和 `__tests__/**/*.test.tsx`
- Setup 文件：`__tests__/setup.ts`（mock `next/navigation`）

---

## 代码风格指南

### 语言与注释

- 所有代码注释使用**中文**
- 变量命名：数据库字段使用 camelCase（Prisma Schema 中使用 `@map` 映射到数据库 snake_case）
- 文件命名：使用 kebab-case（如 `student-form.tsx`）

### Prisma Client 单例模式

Next.js 开发环境下模块热重载会导致 Prisma Client 多次实例化，必须使用单例：

```typescript
// lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 照片存储规范

- 学员照片：`public/uploads/students/{studentId}.jpg`
- 教练照片：`public/uploads/coaches/{coachId}.jpg`
- 数据库只存相对路径（如 `/uploads/students/abc123.jpg`）
- 上传 API 校验文件类型（仅 `image/*`）和大小（最大 5MB）
- Docker 部署时必须挂载 `uploads` 目录到宿主机持久化存储

### UI 风格（Apple HIG）

前端设计遵循 Apple Human Interface Guidelines，特点如下：

- **默认 Light Mode**：系统通过 `ThemeProvider` 默认 `light` 主题，同时支持按 `D` 键切换 dark/light 主题
- **主按钮颜色**：`bg-[#1D1D1F]`（深黑），hover `bg-black/80`
- **危险操作**：仅破坏性操作使用 `bg-[#D9264A]`（红），如删除确认
- **次要按钮**：`bg-black/[0.06]` 灰色背景，hover `bg-black/[0.1]`
- **圆角风格**：大圆角为主，如消息气泡 `rounded-[18px]`、卡片 `rounded-[14px]`
- **阴影层次**：极轻阴影或无边框，使用 `border-0 shadow-none`
- **输入框样式**：`bg-black/[0.06] rounded-full border-0`，无 focus ring
- **选择高亮**：`selection:bg-[#1D1D1F] selection:text-white`

### API 路由风格

- 列表查询：`GET /api/students?search=xxx&status=xxx&page=1&pageSize=20`
- 详情/更新/删除：`GET/PUT/DELETE /api/students/[id]`
- 批量操作：`POST /api/attendance/batch`
- 使用 Zod 进行请求体验证

### 事务处理

点名操作需要保证原子性，并避免重复扣减课时：

```typescript
await prisma.$transaction(async (tx) => {
  for (const record of records) {
    // 1. 查询现有记录，判断旧状态是否已扣减
    const existing = await tx.attendance.findUnique({ ... });
    const oldCounted = existing?.status === "present" || existing?.status === "late";
    const newCounted = record.status === "present" || record.status === "late";

    // 2. upsert 考勤记录
    await tx.attendance.upsert({ ... });

    // 3. 仅在状态变化导致需要扣减/加回课时时操作
    if (!oldCounted && newCounted) {
      await tx.student.update({ where: { id }, data: { remainingSessions: { decrement: 1 } } });
    } else if (oldCounted && !newCounted) {
      await tx.student.update({ where: { id }, data: { remainingSessions: { increment: 1 } } });
    }
  }
});
```

### AI 流式响应（AI SDK 6）

**服务端**使用 `streamText` + `convertToModelMessages()` + `toUIMessageStreamResponse()`：

```typescript
const { messages }: { messages: UIMessage[] } = await req.json();
const modelMessages = await convertToModelMessages(messages);

const result = streamText({
  model: getModel(),
  system: SYSTEM_PROMPT,
  messages: modelMessages,
  stopWhen: stepCountIs(10),  // 允许最多 10 步多步推理
  tools: { searchStudents, createStudent, ... },
});
return result.toUIMessageStreamResponse();
```

**客户端**使用 `useChat` + `DefaultChatTransport` + `messages`（初始状态）：

```typescript
const { messages, sendMessage, setMessages, status } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat" }),
  messages: loadMessages(),  // 从 localStorage 加载历史（不是 initialMessages）
});
```

**关键 API 差异**（AI SDK 6）：
- `streamText` 使用 `stopWhen` 控制多步推理（默认 `stepCountIs(1)`），**不是** `maxSteps`
- `useChat` 使用 `messages` 传递初始状态，**不是** `initialMessages`
- `sendAutomaticallyWhen` 会导致循环问题，**不要使用**
- 服务端必须用 `convertToModelMessages()` 将 `UIMessage[]` 转为模型消息
- 服务端返回 `result.toUIMessageStreamResponse()` 供前端消费

### 提交前检查流程（强制）

**每次修改代码后，必须按以下顺序执行：**

1. **Lint 检查**：`npm run lint`
   - 必须 0 errors、0 warnings
   - 如有 warning，先修复或添加合理的 eslint-disable 注释

2. **运行所有测试**：`npm test`
   - 所有测试必须通过
   - 如测试失败，先修复代码或更新测试

3. **用户确认**：**必须经用户确认修改无误后，才能执行后续步骤**
   - 向用户展示修改摘要（改了哪些文件、核心变更点）
   - 等待用户明确回复"可以提交"或类似确认
   - **未经用户确认，不得擅自 commit**

4. **Commit**：`git commit`

5. **推送**：`git push origin main`
   - 仅在 lint、测试全部通过且用户确认后推送

---

## 测试策略

测试基础设施已建立，使用 Vitest + jsdom + `@testing-library/react` + `next-test-api-route-handler`。

### 测试目录结构

- `__tests__/api/` —— API 路由测试（students, coaches, courses, attendance, grading, competition, camp, config）
- `__tests__/components/` —— 组件测试（sidebar, student-form）
- `__tests__/lib/` —— 工具函数测试（prisma 单例, utils）
- `__tests__/setup.ts` —— 全局 setup，mock `next/navigation` 和 `next/head`
- `tests/helpers.ts` —— 主要测试辅助函数（API 测试从此文件导入）
- `__tests__/helpers.ts` —— 备用测试辅助函数（部分函数，与 tests/helpers.ts 有重叠）

### 测试规范

- API 测试使用真实数据库连接，通过 `cleanupTestData()` 在每个测试前清理数据
- 测试并行已关闭（`fileParallelism: false`），避免数据库冲突
- 使用 `@faker-js/faker` 生成测试数据（已安装）
- 组件测试使用 `@testing-library/react`，需在 `__tests__/setup.ts` 中 mock Next.js 路由相关模块

### 持续集成

GitHub Actions 工作流定义在 `.github/workflows/ci.yml`：

1. 启动 PostgreSQL 16 服务容器
2. 安装依赖：`npm ci`
3. 生成 Prisma Client：`npx prisma generate`
4. 执行数据库迁移：`npx prisma migrate deploy`
5. 运行测试：`npm test`
6. 类型检查：`npm run typecheck`
7. 代码检查：`npm run lint`

---

## 部署

### 推荐方案：Vercel + Supabase

- Supabase 提供 PostgreSQL 托管，与 Vercel 集成可自动配置 `DATABASE_URL`
- 在 Vercel Dashboard 中配置环境变量：`DATABASE_URL`、`MODEL`、`OPENAI_API_KEY` 等
- 执行 `vercel --prod` 部署

### Docker 部署

`next.config.mjs` 中已配置：当 `DOCKER_DEPLOY=true` 时使用 `output: "standalone"`。

由于备份功能依赖 `pg_dump` 和 `psql` 命令，Docker 镜像需要内置 PostgreSQL 客户端：

```dockerfile
FROM node:22-alpine
RUN apk add --no-cache postgresql-client
```

**重要**：`./uploads:/app/public/uploads` 挂载必须配置，否则容器重启后照片数据将丢失。

---

## 安全考虑

1. **照片文件安全**：上传 API 已校验文件类型（仅 `image/*`）和大小（最大 5MB），防止恶意文件上传
2. **备份导入安全**：导入前自动创建当前数据快照（SQL 导出）；恢复后快照路径在响应中返回；ZIP 内含 `backup-manifest.json` 用于校验完整性
3. **并发控制**：批量点名扣减课时使用 PostgreSQL 事务保证原子性，并通过状态比对避免重复扣减
4. **软删除**：学员和教练删除时执行软删除（将状态设为 `inactive`），不实际删除数据库记录
5. **环境变量隔离**：`.env.local` 不提交到版本控制（已在 `.gitignore` 中）；生产环境 API Key 通过 Vercel Dashboard 管理
6. **身份证存储**：当前实现中身份证号以明文存储，如需加密请使用 Node.js `crypto` 模块进行对称加密后再存入数据库

---

## 开发参考资料

本项目所有功能细节均在以下两份文档中定义，开发前请务必阅读：

| 文档 | 路径 | 内容 |
|------|------|------|
| **产品需求文档（PRD）** | `docs/跆拳道馆CRM系统_PRD.md` | 功能需求、数据库设计、API 设计、AI Agent 架构、核心代码示例、安装部署指南 |
| **UI 设计文档** | `docs/跆拳道馆CRM系统_UI设计文档.md` | 设计系统（色彩/字体/间距/圆角/材质深度）、全局布局、各页面详细 UI 设计、组件规范、交互设计、响应式适配、图标系统 |

两份文档使用**中文**编写，是本项目开发的核心依据。
