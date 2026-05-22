# 跆拳道馆 CRM 系统

> 为跆拳道馆量身打造的客户关系管理（CRM）平台，覆盖学员全生命周期管理——从个人基本资料的录入，到课务与时间的精细化管理，再到成长与活动的完整记录，以及课表排期与考勤点名的一体化操作。系统深度集成 AI Agent 能力，用户可通过自然语言对话完成学员与课程的增删改查、课程点名等核心操作。

---

## 功能特性

| 模块 | 功能说明 |
|------|----------|
| **仪表盘首页** | 在籍学员总数、今日课程、本月出勤率、即将到期学员数等核心指标统计；今日课程列表；快捷入口网格 |
| **学员管理** | 学员 CRUD（姓名、性别、出生日期、身份证、电话、照片）；课务信息（入学时间、剩余课时、到期时间、在籍状态）；学员详情页（成长时间线、比赛记录、集训记录、考勤统计） |
| **教练管理** | 教练 CRUD（基本信息、执教时间、个人简介、在职状态）；教练详情页（所授课程列表） |
| **课表日历** | FullCalendar 月/周/日视图；课程类型颜色编码；左侧快速创建课程表单；课程类型筛选器；课程详情弹窗（编辑/删除/开始点名） |
| **考勤点名** | 课程内批量点名；出勤/缺勤/迟到/请假/未点名五种状态；"全部出勤"快捷按钮；点名自动扣减剩余课时；事务保证原子性 |
| **成长记录** | 考级晋升记录（带位级别、证书编号）；比赛记录（名次、获奖）；集训与拓展记录（地点、时长） |
| **AI 助手** | 基于 Vercel AI SDK 的流式对话；支持 OpenAI/Anthropic/Google/DeepSeek/Groq 多模型切换；工具调用（学员查询、课程创建、点名等） |
| **数据备份** | 一键导出：pg_dump SQL + 照片 ZIP 打包下载；一键导入：上传 ZIP 自动恢复数据库和照片；导入前自动创建快照 |

---

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js 16)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ 学员管理页 │  │ 日历/课表 │  │ 学员详情页 │  │  AI 对话页   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│  shadcn/ui + Tailwind CSS 4 + FullCalendar + Recharts        │
├─────────────────────────────────────────────────────────────┤
│                       API 路由层                              │
│  /api/students  /api/coaches  /api/courses  /api/attendance  │
│  /api/grading   /api/competition  /api/camp  /api/chat       │
│  /api/backup    /api/upload                                    │
├─────────────────────────────────────────────────────────────┤
│                      数据处理层                               │
│  Prisma ORM + Zod Validation + PostgreSQL 事务               │
├─────────────────────────────────────────────────────────────┤
│                      数据存储层                               │
│  PostgreSQL 16 (Docker)  +  本地文件系统照片存储             │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术方案 | 版本 |
|------|----------|------|
| **前端框架** | Next.js + App Router | 16.1.7 |
| **UI 组件库** | shadcn/ui + Tailwind CSS | v4 |
| **日历组件** | @fullcalendar/react | v6 |
| **数据库** | PostgreSQL | 16 |
| **ORM** | Prisma | 6.19.3 |
| **AI SDK** | Vercel AI SDK + Provider Registry | v4 |
| **数据表格** | TanStack Table | v8 |
| **图表** | Recharts | v2 |
| **图标** | Lucide React | latest |
| **容器化** | Docker + Docker Compose | — |
| **校验** | Zod | v3 |

---

## 项目结构

```
├── app/                              # Next.js App Router
│   ├── api/                          # API 路由
│   │   ├── students/route.ts         # GET/POST 学员列表
│   │   ├── students/[id]/route.ts    # GET/PUT/DELETE 单个学员
│   │   ├── coaches/route.ts          # GET/POST 教练列表
│   │   ├── coaches/[id]/route.ts     # GET/PUT/DELETE 单个教练
│   │   ├── courses/route.ts          # GET/POST 课程列表
│   │   ├── courses/[id]/route.ts     # GET/PUT/DELETE 单个课程
│   │   ├── attendance/route.ts       # GET/POST 考勤记录
│   │   ├── attendance/batch/route.ts # POST 批量点名
│   │   ├── grading/route.ts          # GET/POST 考级记录
│   │   ├── competition/route.ts      # GET/POST 比赛记录
│   │   ├── camp/route.ts             # GET/POST 集训记录
│   │   ├── chat/route.ts             # POST AI 流式对话
│   │   ├── upload/route.ts           # POST/DELETE 照片上传
│   │   └── backup/route.ts           # GET 导出 / POST 导入备份
│   ├── page.tsx                      # 仪表盘首页
│   ├── layout.tsx                    # 根布局（侧边栏 + 顶部栏）
│   ├── globals.css                   # 全局样式（Tailwind v4）
│   ├── students/                     # 学员列表/新增/详情/编辑
│   ├── coaches/                      # 教练列表/新增/详情/编辑
│   ├── calendar/                     # 课表日历（FullCalendar）
│   ├── attendance/                   # 考勤查询页
│   ├── ai/                           # AI 对话页
│   └── backup/                       # 数据备份与恢复页
├── components/                       # 可复用组件
│   ├── ui/                           # shadcn/ui 组件
│   ├── layout/                       # sidebar.tsx, header.tsx
│   ├── students/student-form.tsx     # 学员表单（新增/编辑共用）
│   └── coaches/coach-form.tsx        # 教练表单（新增/编辑共用）
├── lib/                              # 工具函数与配置
│   ├── prisma.ts                     # Prisma Client 单例
│   ├── ai-model.ts                   # AI 模型路由（Provider Registry）
│   ├── ai-tools.ts                   # AI 工具函数封装
│   └── utils.ts                      # cn() 等通用工具
├── prisma/
│   ├── schema.prisma                 # 数据库 Schema 定义
│   └── migrations/                   # 数据库迁移文件
├── public/uploads/                   # 照片本地存储
│   ├── students/                     # 学员照片
│   └── coaches/                      # 教练照片
├── docker-compose.yml                # PostgreSQL + pgAdmin 容器配置
├── .env.local                        # 环境变量（开发）
└── package.json
```

---

## 快速开始

### 前置要求

- Node.js 18+
- npm 9+
- Docker + Docker Compose

### 1. 克隆项目并安装依赖

```bash
git clone <repository-url>
cd tkd-crm
npm install
```

### 2. 配置环境变量

复制 `.env.local` 模板并填写你的 API Key：

```bash
cp .env.local .env.local
```

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

### 3. 启动数据库

```bash
docker-compose up -d
```

容器说明：
- `taekwondo-db`：PostgreSQL 16，端口 `5432`
- `taekwondo-pgadmin`：pgAdmin 4，端口 `5050`（可选，用于可视化）

### 4. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 即可使用系统。

---

## 使用说明

### 学员管理

1. 点击侧边栏「学员管理」进入列表页
2. 支持按姓名搜索、按状态筛选、分页浏览
3. 点击「新增学员」填写表单，支持设置姓名、性别、入学时间、剩余课时、到期时间等
4. 点击学员姓名进入详情页，查看个人资料、成长时间线、比赛记录、集训记录、考勤统计
5. 在详情页点击「编辑」修改信息，点击删除图标执行软删除

### 教练管理

1. 点击侧边栏「教练管理」进入列表页
2. 新增教练时填写基本信息和个人简介
3. 教练详情页展示个人信息和所授课程列表
4. 删除教练为软删除，关联课程的 coachId 自动设为 NULL

### 课表日历

1. 点击侧边栏「课表日历」进入日历视图
2. 支持月/周/日三种视图切换
3. 左侧边栏可快速创建课程，支持选择课程类型和教练
4. 点击日历中的课程卡片查看详情，支持编辑、删除、开始点名
5. 课程类型颜色编码：常规课（蓝）、考前集训（紫）、集训营（橙）、比赛（红）

### 考勤点名

1. 在课程详情弹窗中点击「开始点名」
2. 弹出点名模态框，展示所有在籍学员
3. 为每位学员选择出勤状态（出勤/缺勤/迟到/请假/未点名）
4. 点击「全部出勤」一键标记所有学员为出勤
5. 点击「提交点名」保存记录，出勤和迟到的学员自动扣减 1 次剩余课时

### AI 助手

1. 点击侧边栏「AI 助手」进入对话页面
2. 在底部输入框输入自然语言指令，例如：
   - "查找叫张小明 的学员"
   - "创建一个明天下午3点的常规课"
   - "给少儿基础班点名"
3. AI 会自动调用对应工具完成操作，并在对话中展示执行结果
4. 支持快捷指令按钮（查看学员、今日课程、教练列表等）

### 数据备份与恢复

1. 点击侧边栏「数据备份」进入备份页
2. 点击「立即备份」下载包含数据库 SQL 和照片文件的 ZIP 包
3. 恢复时上传之前备份的 ZIP 文件，系统自动解压并恢复
4. 导入前会自动创建当前数据的快照，防止误操作

---

## 环境变量参考

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 连接字符串 |
| `MODEL` | ✅ | AI 模型选择，格式 `provider:model-id`，如 `openai:gpt-4o` |
| `OPENAI_API_KEY` | 条件 | OpenAI API Key（使用 OpenAI 时必填） |
| `ANTHROPIC_API_KEY` | 条件 | Anthropic API Key（使用 Claude 时必填） |
| `GOOGLE_GENERATIVE_AI_API_KEY` | 条件 | Google API Key（使用 Gemini 时必填） |
| `DEEPSEEK_API_KEY` | 条件 | DeepSeek API Key（使用 DeepSeek 时必填） |
| `GROQ_API_KEY` | 条件 | Groq API Key（使用 Groq 时必填） |
| `OPENAI_BASE_URL` | 可选 | 兼容 OpenAI API 的自定义端点 |

### 支持的模型格式

```env
MODEL=openai:gpt-4o
MODEL=openai:gpt-4o-mini
MODEL=anthropic:claude-3-5-sonnet-20241022
MODEL=google:gemini-2.0-flash
MODEL=deepseek:deepseek-chat
MODEL=groq:llama-3.3-70b-versatile
MODEL=custom:local-model   # 通过 OPENAI_BASE_URL 指向本地服务
```

---

## API 概览

### 学员 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/students?search=&status=&page=` | 查询学员列表 |
| `POST` | `/api/students` | 新增学员 |
| `GET` | `/api/students/[id]` | 获取学员详情（含关联记录） |
| `PUT` | `/api/students/[id]` | 更新学员信息 |
| `DELETE` | `/api/students/[id]` | 软删除学员 |

### 教练 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/coaches?search=&status=&page=` | 查询教练列表 |
| `POST` | `/api/coaches` | 新增教练 |
| `GET` | `/api/coaches/[id]` | 获取教练详情（含所授课程） |
| `PUT` | `/api/coaches/[id]` | 更新教练信息 |
| `DELETE` | `/api/coaches/[id]` | 软删除教练 |

### 课程 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/courses?start=&end=` | 查询课程列表 |
| `POST` | `/api/courses` | 创建课程 |
| `GET` | `/api/courses/[id]` | 获取课程详情 |
| `PUT` | `/api/courses/[id]` | 更新课程信息 |
| `DELETE` | `/api/courses/[id]` | 删除课程 |

### 考勤 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/attendance?studentId=或courseId=` | 查询考勤记录 |
| `POST` | `/api/attendance` | 提交单次考勤 |
| `POST` | `/api/attendance/batch` | 批量点名（事务） |

### 其他 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET/POST` | `/api/grading?studentId=` | 考级记录查询/新增 |
| `GET/POST` | `/api/competition?studentId=` | 比赛记录查询/新增 |
| `GET/POST` | `/api/camp?studentId=` | 集训记录查询/新增 |
| `POST` | `/api/upload` | 上传照片（学员/教练） |
| `DELETE` | `/api/upload?id=&type=` | 删除照片 |
| `GET` | `/api/backup` | 导出备份 ZIP |
| `POST` | `/api/backup` | 导入备份 ZIP |
| `POST` | `/api/chat` | AI 流式对话 |

---

## 部署指南

### 开发环境

使用 Docker Compose 一键启动 PostgreSQL：

```bash
docker-compose up -d
npm run dev
```

### 生产构建

```bash
npm run build
npm start
```

### Docker 部署注意事项

- `pg_dump` / `psql` 需要在容器内可用，建议在 Dockerfile 中安装 `postgresql-client`
- 照片目录 `public/uploads/` 必须挂载到宿主机持久化存储
- `.env.local` 中的环境变量需在生产环境正确配置

### 推荐部署方案：Vercel + Supabase

- 使用 Supabase 托管 PostgreSQL，自动配置 `DATABASE_URL`
- 在 Vercel Dashboard 中配置环境变量
- 执行 `vercel --prod` 部署

---

## 数据库设计

核心模型关系：

```
Student (1) ──────< (N) Grading        一个学员有多条考级记录
Student (1) ──────< (N) Competition    一个学员有多条比赛记录
Student (1) ──────< (N) Camp           一个学员有多条集训记录
Student (1) ──────< (N) Attendance     一个学员有多条考勤记录
Coach   (1) ──────< (N) Course         一个教练可教授多门课程
Course  (1) ──────< (N) Attendance     一个课程有多条考勤记录
```

- Coach 删除时，Course.coachId 自动设为 NULL（`onDelete: SetNull`）
- Attendance 复合唯一索引：`@@unique([courseId, studentId, attendanceDate])` 防止重复点名
- 学员/教练删除为软删除（status → inactive），保留历史记录

---

## 开发规范

- **代码注释**：全部使用中文
- **变量命名**：数据库字段使用 camelCase，Prisma Schema 中使用 `@map` 映射到 snake_case
- **文件命名**：使用 kebab-case（如 `student-form.tsx`）
- **照片存储**：`public/uploads/students/{id}.jpg`、`public/uploads/coaches/{id}.jpg`
- **事务处理**：点名扣减课时使用 Prisma `$transaction` 保证原子性
- **AI 流式响应**：服务端必须返回 `result.toDataStreamResponse()`

---

## 常见问题

### Q: `pg_dump` 命令未找到？

A: 备份/恢复功能依赖 PostgreSQL 客户端。开发环境可通过 Docker 容器内执行命令自动回退，无需本地安装。生产环境请在部署镜像中安装 `postgresql-client`。

### Q: 如何切换 AI 模型？

A: 修改 `.env.local` 中的 `MODEL` 环境变量即可，格式为 `provider:model-id`。例如切换到 Claude：`MODEL=anthropic:claude-3-5-sonnet-20241022`。

### Q: 照片上传后丢失？

A: 照片存储在 `public/uploads/` 目录下。Docker 部署时务必将该目录挂载到宿主机持久化卷，否则容器重启后照片会丢失。

### Q: 如何重置数据库？

A: 执行 `docker-compose down -v` 删除数据卷，然后重新 `docker-compose up -d` 和 `npx prisma migrate dev`。

---

## 文档索引

| 文档 | 路径 | 内容 |
|------|------|------|
| **产品需求文档（PRD）** | `docs/跆拳道馆CRM系统_PRD.md` | 功能需求、数据库设计、API 设计、AI Agent 架构 |
| **UI 设计文档** | `docs/跆拳道馆CRM系统_UI设计文档.md` | 设计系统、页面布局、组件规范、交互设计 |
| **实施计划** | `docs/实施计划.md` | 分阶段实施计划、测试策略、风险分析 |
| **AI 代理指南** | `AGENTS.md` | 项目结构、技术栈、编码规范 |

---

## License

MIT
