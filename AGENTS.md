# 跆拳道馆 CRM 系统 —— AI 代理指南

> 本文档供 AI 编码代理阅读。如果你正在阅读此文件，说明你对本项目一无所知——本文档将告诉你需要了解的一切。

---

## 项目概述

本项目是一个为跆拳道馆量身打造的客户关系管理（CRM）平台，覆盖学员全生命周期管理——从个人基本资料的录入，到课务与时间的精细化管理，再到成长与活动的完整记录，以及课表排期与考勤点名的一体化操作。系统深度集成 AI Agent 能力，用户可通过自然语言对话完成学员与课程的增删改查、课程点名等核心操作。

**当前状态**：项目处于规划/文档阶段，已实现详细的产品需求文档（PRD）和 UI 设计文档，但尚未开始编码。代码目录结构、配置文件、依赖安装等均待初始化。

---

## 技术栈

| 层级 | 技术方案 |
|------|----------|
| **前端框架** | Next.js 15 + App Router + React 19 |
| **语言** | TypeScript 5 |
| **样式** | Tailwind CSS 3 + shadcn/ui |
| **日历组件** | @fullcalendar/react |
| **数据库** | PostgreSQL 14+ |
| **ORM** | Prisma 6 |
| **AI SDK** | Vercel AI SDK 4 + Provider Registry |
| **数据表格** | TanStack Table |
| **图表** | Recharts |
| **图标** | Lucide React |
| **容器化** | Docker + Docker Compose |
| **校验** | Zod |

### 支持的 LLM 提供商

通过 Vercel AI SDK 的 Provider Registry 支持多提供商动态切换：

- OpenAI (`@ai-sdk/openai`) —— 同时用于兼容 OpenAI API 的第三方服务
- Anthropic Claude (`@ai-sdk/anthropic`)
- Google Gemini (`@ai-sdk/google`)
- DeepSeek (`@ai-sdk/deepseek`)
- Groq (`@ai-sdk/groq`)

模型通过环境变量 `MODEL=provider:model-id` 格式指定，例如 `openai:gpt-4o`。

---

## 项目文件结构（目标）

项目文档中规划了以下文件结构，实际编码阶段需要逐步实现：

```
taekwondo-crm/
├── app/                            # Next.js App Router
│   ├── api/                        # API 路由
│   │   ├── students/route.ts
│   │   ├── students/[id]/route.ts
│   │   ├── coaches/route.ts
│   │   ├── coaches/[id]/route.ts
│   │   ├── courses/route.ts
│   │   ├── courses/[id]/route.ts
│   │   ├── attendance/route.ts
│   │   ├── attendance/batch/route.ts
│   │   ├── grading/route.ts
│   │   ├── competition/route.ts
│   │   ├── camp/route.ts
│   │   ├── chat/route.ts           # AI 对话流式接口
│   │   ├── upload/route.ts         # 照片上传/删除
│   │   └── backup/route.ts         # 数据备份/恢复
│   ├── page.tsx                    # 仪表盘首页
│   ├── layout.tsx                  # 根布局（侧边栏导航）
│   ├── globals.css
│   ├── students/
│   ├── coaches/
│   ├── calendar/
│   ├── attendance/
│   ├── ai/
│   └── backup/
├── components/                     # 可复用组件
│   ├── ui/                         # shadcn/ui 组件
│   ├── layout/                     # sidebar.tsx, header.tsx
│   ├── students/
│   ├── coaches/
│   ├── calendar/
│   └── ai/
├── lib/                            # 工具函数与配置
│   ├── prisma.ts                   # Prisma Client 单例
│   ├── ai-model.ts                 # AI 模型路由（Provider Registry）
│   ├── ai-tools.ts                 # AI 工具函数封装
│   └── utils.ts
├── prisma/
│   ├── schema.prisma               # 数据库 Schema
│   └── migrations/
├── hooks/                          # 自定义 React Hooks
├── types/                          # TypeScript 类型定义
├── public/
│   └── uploads/                    # 照片本地存储（students/ + coaches/）
├── docker-compose.yml              # PostgreSQL 容器配置
├── .env.local                      # 环境变量
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**注意**：当前项目中以上代码文件均不存在，仅有 `docs/` 目录下的 PRD 和 UI 设计文档作为开发依据。

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
# OPENAI_BASE_URL=http://localhost:1234/v1
```

---

## 构建与启动命令

### 初始化（首次）

```bash
# 1. 使用 shadcn 初始化 Next.js 项目
echo "my-app" | npx shadcn@latest init --yes --template next --base-color slate

# 2. 安装核心依赖
npm install @prisma/client ai @ai-sdk/openai zod
npm install -D prisma

# 3. 按需安装其他 LLM Provider
npm install @ai-sdk/anthropic @ai-sdk/google @ai-sdk/deepseek @ai-sdk/groq

# 4. 安装 UI 依赖
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid \
  @fullcalendar/interaction @tanstack/react-table recharts lucide-react

# 5. 安装备份相关依赖
npm install archiver decompress
```

### 数据库启动

```bash
# 启动 PostgreSQL 容器
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f postgres

# 停止
docker-compose down

# 完全重置（删除数据卷）
docker-compose down -v
```

### 开发与运行

```bash
# 数据库迁移
npx prisma migrate dev --name init

# 生成 Prisma Client 类型
npx prisma generate

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

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
- Docker 部署时必须挂载 `uploads` 目录到宿主机持久化存储

### 事务处理

点名操作需要保证原子性：

```typescript
await prisma.$transaction([
  // 1. 批量创建/更新考勤记录
  prisma.attendance.upsert({ ... }),
  // 2. 扣减课时（present/late 的学员）
  prisma.student.updateMany({
    where: { id: { in: presentIds }, remainingSessions: { gt: 0 } },
    data: { remainingSessions: { decrement: 1 } }
  })
]);
```

### AI 流式响应

服务端必须返回流式响应：

```typescript
return result.toDataStreamResponse();
```

客户端使用 `useChat` hook 自动处理流式消费。

---

## 测试策略

当前项目尚未建立测试基础设施。建议按以下顺序补充：

1. **Prisma 单元测试**：使用 `@faker-js/faker` 生成测试数据，验证 CRUD 和关联查询
2. **API 路由测试**：使用 Vitest + `next-test-api-route-handler` 测试 API 端点
3. **AI 工具测试**：模拟 LLM 工具调用，验证参数解析和数据库操作正确性
4. **照片上传测试**：验证文件类型、大小限制，以及上传后的文件存在性
5. **备份恢复测试**：验证 ZIP 打包结构、manifest 校验、SQL 导入正确性

---

## 部署

### 推荐方案：Vercel + Supabase

- Supabase 提供 PostgreSQL 托管，与 Vercel 集成可自动配置 `DATABASE_URL`
- 在 Vercel Dashboard 中配置环境变量：`DATABASE_URL`、`MODEL`、`OPENAI_API_KEY` 等
- 执行 `vercel --prod` 部署

### Docker 部署（推荐用于数据备份功能）

由于备份功能依赖 `pg_dump` 和 `psql` 命令，Docker 镜像需要内置 PostgreSQL 客户端：

```dockerfile
FROM node:20-alpine
RUN apk add --no-cache postgresql-client
```

**重要**：`./uploads:/app/public/uploads` 挂载必须配置，否则容器重启后照片数据将丢失。

---

## 安全考虑

1. **身份证加密存储**：身份证号等敏感数据需要使用对称加密（Node.js `crypto` 模块）存储，数据库中不存明文
2. **照片文件安全**：上传 API 需校验文件类型（仅 `image/*`）和大小（最大 5MB），防止恶意文件上传
3. **备份导入安全**：导入前自动备份当前数据；SQL 导入先 `DROP SCHEMA public CASCADE` 再重建；导入失败自动回滚
4. **并发控制**：点名扣减课时使用 PostgreSQL 事务保证原子性，避免并发导致数据不一致
5. **环境变量隔离**：`.env.local` 不提交到版本控制；生产环境 API Key 通过 Vercel Dashboard 管理

---

## 开发参考资料

本项目所有功能细节均在以下两份文档中定义，开发前请务必阅读：

| 文档 | 路径 | 内容 |
|------|------|------|
| **产品需求文档（PRD）** | `docs/跆拳道馆CRM系统_PRD.md` | 功能需求、数据库设计、API 设计、AI Agent 架构、核心代码示例、安装部署指南 |
| **UI 设计文档** | `docs/跆拳道馆CRM系统_UI设计文档.md` | 设计系统（色彩/字体/间距/圆角/阴影）、全局布局、各页面详细 UI 设计、组件规范、交互设计、响应式适配、图标系统 |

两份文档使用**中文**编写，是本项目开发的核心依据。
