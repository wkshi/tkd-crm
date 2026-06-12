# 跆拳道馆 CRM 系统 —— AI 代理指南

> 本文档供 AI 编码代理阅读。如果你正在阅读此文件，说明你对本项目一无所知——本文档将告诉你需要了解的一切。

---

## 项目概述

本项目是一个为跆拳道馆量身打造的客户关系管理（CRM）平台，覆盖学员全生命周期管理：从个人基本资料录入、课务与时间精细化管理、成长与活动记录，到课表排期与考勤点名的一体化操作。系统深度集成 AI Agent 能力，用户可通过自然语言对话完成学员、教练、班级、课程、考勤、充值、考级、比赛、集训、装备库存等全模块的增删改查。

**当前状态**：项目已完成核心功能编码，包括数据库 Schema、REST API、前端页面、AI 对话流、照片上传、数据备份与恢复，以及完整的测试基础设施。`docs/` 目录下保留有产品需求文档（PRD）和 UI 设计文档作为参考。

前端已实现的页面包括：仪表盘首页、学员管理、教练管理、班级管理、课表日历、考勤查询与点名、充值管理、考级记录、比赛记录、集训记录、装备库存、AI 助手对话、数据备份管理。

---

## 技术栈

| 层级 | 技术方案 | 版本/说明 |
|------|----------|-----------|
| **前端框架** | Next.js + App Router + React | 16.1.7 / 19.2.4 |
| **语言** | TypeScript | 5.9.3 |
| **样式** | Tailwind CSS + shadcn/ui | 4.2.1 / base-nova 风格 |
| **UI 底层** | `@base-ui/react` | shadcn/ui 组件基于此构建 |
| **日历组件** | `@fullcalendar/react` | daygrid / timegrid / interaction / list |
| **状态/主题** | `next-themes` | 默认 light，支持 `D` 键切换 dark/light |
| **数据库** | PostgreSQL | 16 |
| **ORM** | Prisma | 6.19.3 |
| **AI SDK** | Vercel AI SDK + Provider Registry | 6.0.190 |
| **数据表格** | TanStack Table | 8.21.3 |
| **图表** | Recharts | 3.8.1 |
| **图标** | Lucide React | latest |
| **校验** | Zod | 4.4.3 |
| **测试** | Vitest + jsdom + `@testing-library/react` + `next-test-api-route-handler` | 4.1.7 |
| **容器化** | Docker + Docker Compose | — |
| **构建工具** | Turbopack（开发模式） | — |
| **其他** | `react-markdown` + `remark-gfm`（AI 消息渲染）、`archiver` + `decompress`（备份 ZIP）、`@faker-js/faker`（测试数据） | — |

### 支持的 LLM 提供商

通过 Vercel AI SDK 的 Provider Registry 支持多提供商动态切换：

- OpenAI（`@ai-sdk/openai`）
- Anthropic Claude（`@ai-sdk/anthropic`）
- Google Gemini（`@ai-sdk/google`）
- DeepSeek（`@ai-sdk/deepseek`）
- Groq（`@ai-sdk/groq`）

模型通过环境变量 `MODEL=provider:model-id` 指定，例如 `openai:gpt-4o`。额外支持 `custom:` 前缀，通过 `CUSTOM_OPENAI_BASE_URL` 和 `CUSTOM_OPENAI_API_KEY` 接入自定义 OpenAI 兼容端点。

> **注意**：`lib/ai-model.ts` 中 Google 提供商读取的是 `GOOGLE_API_KEY` 环境变量（不是 `GOOGLE_GENERATIVE_AI_API_KEY`）。

---

## 关键配置文件

| 文件 | 用途 |
|------|------|
| `package.json` | 项目依赖与 npm 脚本定义 |
| `next.config.mjs` | Next.js 配置：Docker 部署时输出 `standalone`、客户端可访问环境变量 `APP_NAME`/`APP_VERSION`、图片优化、`trailingSlash: false` |
| `vitest.config.ts` | 测试配置：`jsdom` 环境、全局模式、`fileParallelism: false`、别名 `@` 指向项目根目录 |
| `tsconfig.json` | TypeScript 编译配置，`baseUrl: "."`，`@/*` 映射到 `./*` |
| `eslint.config.mjs` | ESLint v9 flat config，继承 `eslint-config-next/core-web-vitals` 和 `eslint-config-next/typescript` |
| `.prettierrc` | 代码格式化：无分号、双引号、2 空格缩进、printWidth 80、`prettier-plugin-tailwindcss` |
| `postcss.config.mjs` | PostCSS 配置（Tailwind CSS v4） |
| `components.json` | shadcn/ui 项目配置，`style: base-nova`，`iconLibrary: lucide` |
| `docker-compose.yml` | 开发环境：PostgreSQL 16 + pgAdmin + 本地生产数据库（`postgres-prod`） |
| `docker-compose.prod.yml` | 生产环境编排：App + PostgreSQL + 持久化卷 |
| `Dockerfile` | 多阶段构建（builder + runner），基于 `node:22-alpine`，内置 `postgresql-client` |
| `.github/workflows/ci.yml` | GitHub Actions：测试 + 类型检查 + Lint + 构建 + Ansible 语法检查 |
| `ansible/` | Ansible 自动化部署方案：在 RedHat 系服务器上通过 RPM 包安装 Node.js + PostgreSQL，并封装为 systemd 服务 |

---

## 运行时架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js 16)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ 学员管理页 │  │ 日历/课表 │  │ 学员详情页 │  │  AI 对话页   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│  shadcn/ui + Tailwind CSS 4 + FullCalendar + Recharts        │
├─────────────────────────────────────────────────────────────┤
│                       API 路由层 (App Router)                 │
│  /api/students  /api/coaches  /api/classes  /api/courses     │
│  /api/attendance/batch  /api/recharges  /api/grading/batch   │
│  /api/competition/batch  /api/camp/batch  /api/equipment     │
│  /api/backup  /api/upload  /api/config  /api/chat  /api/correct│
├─────────────────────────────────────────────────────────────┤
│                      数据处理层                               │
│  Prisma ORM + Zod Validation + PostgreSQL 事务               │
├─────────────────────────────────────────────────────────────┤
│                      数据存储层                               │
│  PostgreSQL 16 (Docker)  +  本地文件系统照片存储             │
└─────────────────────────────────────────────────────────────┘
```

- **开发服务器**：`npm run dev` 启动 Turbopack（前台运行），监听 `localhost:3000`
- **生产服务器**：`npm run build` 构建后，`npm start` 启动；生产部署时设置 `NEXT_OUTPUT=standalone` 输出 standalone 包
- **数据库连接**：通过 `DATABASE_URL` 环境变量，Prisma Client 单例模式管理连接（见 `lib/prisma.ts`）
- **照片存储**：本地文件系统 `public/uploads/{students,coaches}/{id}.jpg`，数据库只存相对路径

---

## 项目文件结构

```
tkd-crm/
├── app/                            # Next.js App Router
│   ├── page.tsx                    # 仪表盘首页（Server Component，直接查 Prisma）
│   ├── layout.tsx                  # 根布局（侧边栏导航 + Header + ThemeProvider）
│   ├── globals.css                 # Tailwind CSS 入口 + CSS 变量主题 + FullCalendar 覆盖
│   ├── ai/
│   │   └── page.tsx                # AI 助手对话页面（Client Component，支持语音输入、文本矫正、localStorage 历史持久化）
│   ├── api/                        # API 路由
│   │   ├── students/route.ts
│   │   ├── students/[id]/route.ts
│   │   ├── coaches/route.ts
│   │   ├── coaches/[id]/route.ts
│   │   ├── classes/route.ts
│   │   ├── classes/[id]/route.ts
│   │   ├── courses/route.ts
│   │   ├── courses/[id]/route.ts
│   │   ├── attendance/route.ts
│   │   ├── attendance/batch/route.ts   # 批量点名（事务扣减课时）
│   │   ├── recharges/route.ts          # 充值记录列表（按学员过滤）与创建
│   │   ├── recharges/[id]/route.ts     # 充值记录详情、备注更新、删除并回滚课时
│   │   ├── grading/route.ts
│   │   ├── grading/[id]/route.ts
│   │   ├── grading/batch/route.ts      # 批量创建考级记录
│   │   ├── competition/route.ts
│   │   ├── competition/[id]/route.ts
│   │   ├── competition/batch/route.ts  # 批量创建比赛记录
│   │   ├── camp/route.ts
│   │   ├── camp/[id]/route.ts
│   │   ├── camp/batch/route.ts         # 批量创建集训记录
│   │   ├── chat/route.ts               # AI 对话流式接口
│   │   ├── correct/route.ts            # 语音输入文本矫正
│   │   ├── config/route.ts             # 返回客户端可用的系统配置（当前模型名）
│   │   ├── upload/route.ts             # 照片上传/删除
│   │   └── backup/route.ts             # 数据备份/恢复（ZIP + pg_dump/psql）
│   ├── students/                   # 学员列表、新增、详情、编辑页面
│   ├── coaches/                    # 教练管理（双Tab：教练列表 + 课时统计）、新增、详情、编辑页面
│   ├── classes/                    # 班级列表、新增、详情、编辑页面
│   ├── calendar/                   # 课表日历页面（FullCalendar 月/周/日 + 自定义周课表视图）
│   ├── attendance/                 # 考勤查询、点名、学员考勤详情页面
│   │   ├── page.tsx                # 考勤查询（按学员/班级/年月筛选）
│   │   ├── rollcall/page.tsx       # 课程点名（?courseId 参数）
│   │   └── students/[id]/page.tsx  # 学员个人考勤详情
│   ├── recharges/                  # 充值管理页面（列表 + 创建弹窗）
│   ├── grading/                    # 考级记录管理页面（列表 + 创建/编辑弹窗）
│   ├── competition/                # 比赛记录管理页面（列表 + 创建/编辑弹窗）
│   ├── camp/                       # 集训记录管理页面（列表 + 创建/编辑弹窗）
│   └── backup/                     # 数据备份管理页面
├── components/                     # 可复用组件
│   ├── ui/                         # shadcn/ui 组件（badge, button, card, dialog, input, label, select, table）
│   ├── layout/                     # sidebar.tsx, header.tsx
│   ├── students/                   # student-form.tsx（含拍照上传、班级多选）
│   ├── coaches/                    # coach-form.tsx（基本信息、在职状态切换）
│   └── classes/                    # class-form.tsx（基本信息、学员多选）
├── lib/                            # 工具函数与配置
│   ├── prisma.ts                   # Prisma Client 单例
│   ├── ai-model.ts                 # AI Provider Registry + getModel()
│   ├── ai-tools.ts                 # AI 工具函数封装（供 chat route 调用）
│   ├── belt-level.tsx              # 腰带级别中文映射、样式映射、BeltBadge 组件
│   └── utils.ts                    # cn() 工具（clsx + tailwind-merge）
├── __tests__/                      # 测试文件
│   ├── api/                        # API 路由测试（students, coaches, classes, courses, attendance, recharges, grading, competition, camp, config）
│   ├── components/                 # 组件测试（sidebar, coaches-page, student-form）
│   ├── lib/                        # 工具函数测试（prisma 单例, utils, ai-tools）
│   ├── helpers.ts                  # 备用测试辅助函数（与 tests/helpers.ts 内容重叠）
│   └── setup.ts                    # Vitest 全局 setup（mock next/navigation、next/head）
├── tests/                          # 主要测试辅助函数
│   └── helpers.ts                  # cleanupTestData, createTestStudent 等（API 测试从此文件导入）
├── prisma/
│   ├── schema.prisma               # 数据库 Schema
│   └── migrations/                 # 数据库迁移文件
├── public/
│   └── uploads/                    # 照片本地存储（students/ + coaches/）
├── scripts/
│   ├── start-local-prod.ps1        # Windows 本地生产环境启动脚本
│   └── start-local-prod.sh         # Linux/macOS 本地生产环境启动脚本
├── docs/                           # 开发参考文档
│   ├── 跆拳道馆CRM系统_PRD.md      # 产品需求文档
│   ├── 跆拳道馆CRM系统_UI设计文档.md # UI 设计文档
│   └── 实施计划.md                 # 分阶段实施计划
├── .github/workflows/ci.yml        # GitHub Actions CI 工作流
├── docker-compose.yml              # PostgreSQL 16 + pgAdmin + 本地生产数据库容器配置
├── docker-compose.prod.yml         # 生产环境 Docker Compose 配置
├── Dockerfile                      # 多阶段生产镜像构建
├── .env                            # 默认环境变量模板
├── .env.local                      # 本地环境变量（Git 忽略）
├── next.config.mjs
├── vitest.config.ts
├── eslint.config.mjs               # ESLint v9 flat config
├── postcss.config.mjs
├── .prettierrc
└── package.json
```

---

## 数据库设计

使用 PostgreSQL + Prisma。核心数据模型包括：

- **Student**（学员）：基本信息、课务信息、照片路径
- **Coach**（教练）：基本信息、工作信息、照片路径
- **Class**（班级）：名称、级别、最大人数、关联学员和课程
- **Course**（课程）：名称（可空，自动生成默认名称）、时间、关联教练和班级
- **Attendance**（考勤）：课程-学员关联、出勤状态
- **Recharge**（充值记录）：学员课时变动记录，包含 `increment`/`decrement` 操作和有效期
- **Grading**（考级晋升记录）
- **Competition**（比赛记录）
- **Camp**（集训与拓展活动记录）
- **Equipment**（装备库存）：装备台账，记录名称、类型、规格、当前库存、预警线与状态

### 关键关联关系

```
Student (1) ──────< (N) Grading
Student (1) ──────< (N) Competition
Student (1) ──────< (N) Camp
Student (1) ──────< (N) Recharge
Student (1) ──────< (N) Attendance
Student (N) ──────< (M) Class      (@relation("ClassToStudent"))
Coach   (1) ──────< (N) Course
Class   (1) ──────< (N) Course
Class   (1) ──────< (M) Student    (@relation("ClassToStudent"))
Course  (1) ──────< (N) Attendance
```

- Coach 删除时，Schema 层面 `Course.coachId` 自动设为 NULL（`onDelete: SetNull`）
- Class 删除时，Schema 层面关联 Course 级联删除（`onDelete: Cascade`）
- Student/Course 删除时，关联 Attendance/Grading/Competition/Camp/Recharge 级联删除（`onDelete: Cascade`）
- **应用层删除行为**：REST API 中 `/api/students/[id]/DELETE`、`/api/coaches/[id]/DELETE`、`/api/classes/[id]/DELETE`、`/api/equipment/[id]/DELETE` 均使用软删除（将 `status` 设为 `inactive`）；AI 工具 `deleteClass` 使用 Prisma 硬删除，会触发上述级联规则

### 索引设计

- 每个可列表实体均对 `name` 和 `status` 建立索引
- `Course` 对 `startTime`、`coachId`、`classId` 建立索引
- `Attendance` 对 `studentId`、`courseId` 建立索引
- `Grading` 对 `studentId`、`examDate` 建立复合索引

### 唯一索引与约束

- `Attendance` 有复合唯一索引：`@@unique([courseId, studentId, attendanceDate])` —— 防止同一学员同一天同一课程重复考勤

### 枚举定义

| 枚举 | 值 |
|------|-----|
| `Gender` | `male`, `female` |
| `Status`（学员/班级） | `active`, `inactive`, `suspended` |
| `CoachStatus` | `active`, `inactive`, `on_leave` |
| `AttendanceStatus` | `present`, `absent`, `late`, `leave`, `unmarked` |
| `BeltLevel` | `white` → `white_yellow` → `yellow` → `yellow_green` → `green` → `green_blue` → `blue` → `blue_red` → `red` → `red_black` → `black`（共 11 级） |
| `EquipmentCategory` | `uniform`（道服）、`gear`（护具）、`belt`（腰带）、`pad`（脚靶/手靶）、`accessory`（配件）、`other`（其他） |

---

## 环境变量

开发环境需要的 `.env.local`（基于 `.env` 模板）：

```env
# 数据库（本地 Docker）
DATABASE_URL="postgresql://taekwondo:taekwondo123@localhost:5432/taekwondo_crm"

# AI 模型选择（格式：provider:model-id）
MODEL=openai:gpt-4o

# 至少配置一个 API Key
OPENAI_API_KEY=sk-your-openai-api-key-here
# ANTHROPIC_API_KEY=sk-ant-your-key
# GOOGLE_API_KEY=your-google-key
# DEEPSEEK_API_KEY=your-deepseek-key
# GROQ_API_KEY=gsk-your-groq-key

# 兼容 OpenAI API 的自定义端点（可选）
# CUSTOM_OPENAI_BASE_URL=http://localhost:1234/v1
# CUSTOM_OPENAI_API_KEY=your-custom-key
```

> **注意**：`lib/ai-model.ts` 中 Google 提供商读取的是 `GOOGLE_API_KEY` 环境变量（不是 `GOOGLE_GENERATIVE_AI_API_KEY`）。

客户端可通过 `process.env.APP_NAME` 和 `process.env.APP_VERSION` 访问应用名称和版本（在 `next.config.mjs` 中定义）。

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

# 数据库迁移（开发环境）
npx prisma migrate dev --name init

# 生成 Prisma Client 类型
npx prisma generate

# 启动开发服务器（Turbopack，前台运行）
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

`package.json` 还定义了以下补充脚本：

| 脚本 | 说明 |
|------|------|
| `npm run prod` | 等效于 `npm run build && npm start` |
| `npm run prod:build` | `NODE_ENV=production next build` |
| `npm run prod:start` | `NODE_ENV=production next start` |

### 本地生产环境启动

```bash
# 一键启动本地生产环境（自动启动独立数据库、迁移、构建、启动服务器）
./scripts/start-local-prod.sh [端口]

# 默认端口 3000
./scripts/start-local-prod.sh
```

脚本行为：
1. 启动 `postgres-prod` 容器（端口 5433）
2. 等待数据库就绪（`pg_isready` 轮询，最多 30 秒）
3. 设置 `DATABASE_URL` 指向生产数据库
4. 执行 `prisma migrate deploy`
5. 生成 Prisma Client
6. `NODE_ENV=production npm run build`
7. `NODE_ENV=production npx next start -p $PORT`
8. **退出时自动停止**生产数据库容器（`trap EXIT/INT/TERM`）

### 测试命令

```bash
# 运行所有测试（单次）
npm test

# 监听模式
npm run test:watch

# UI 模式
npm run test:ui

# 覆盖率报告
npm run test:coverage
```

测试配置在 `vitest.config.ts` 中：
- 环境：`jsdom`
- 全局模式：开启（`globals: true`）
- 并行：`fileParallelism: false`（避免数据库并发冲突）
- 包含路径：`__tests__/**/*.test.ts` 和 `__tests__/**/*.test.tsx`
- Setup 文件：`__tests__/setup.ts`（mock `next/navigation`、`next/head`）
- 覆盖率：`v8` provider，输出 text / json / html，排除 `node_modules/`、`__tests__/`、配置文件、`prisma/`、`.next/`

---

## 代码风格指南

### 语言与注释

- **所有代码注释使用中文**
- 变量命名：数据库字段使用 camelCase（Prisma Schema 中使用 `@map` 映射到数据库 snake_case）
- 文件命名：使用 kebab-case（如 `student-form.tsx`）

### Prettier 配置

项目使用 `.prettierrc`：
- 无分号（`semi: false`）
- 双引号（`singleQuote: false`）
- 2 空格缩进
- ES5 兼容的尾随逗号
- 打印宽度 80
- 使用 `prettier-plugin-tailwindcss` 插件，配置 `tailwindStylesheet: "app/globals.css"`
- 识别 `cn()` 和 `cva()` 作为 Tailwind 类函数

### ESLint 配置

使用 ESLint v9 flat config（`eslint.config.mjs`）：
- 继承 `eslint-config-next/core-web-vitals` 和 `eslint-config-next/typescript`
- 忽略 `.next/`、`out/`、`build/`、`next-env.d.ts`、`coverage/`

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
- 上传 API 校验文件类型（仅 `image/*`）和大小（最大 5MB），固定存储为 `.jpg` 格式
- Docker 部署时必须挂载 `uploads` 目录到宿主机持久化存储

### UI 风格（Apple HIG）

前端设计遵循 Apple Human Interface Guidelines，特点如下：

- **默认 Light Mode**：系统通过 `ThemeProvider` 默认 `light` 主题，同时支持按 `D` 键切换 dark/light 主题
- **主按钮颜色**：`bg-[#1D1D1F]`（深黑），hover `bg-black/80`
- **危险操作**：仅破坏性操作使用 `bg-[#D9264A]`（红），如删除确认
- **次要按钮**：`bg-black/[0.06]` 灰色背景，hover `bg-black/[0.1]`
- **圆角风格**：大圆角为主，如消息气泡 `rounded-[18px]`、卡片 `rounded-[20px]`、内嵌元素 `rounded-[10px]`
- **阴影层次**：极轻阴影或无边框，使用 `border-0 shadow-none`
- **输入框样式**：`bg-black/[0.06] rounded-[10px] border-0`，无 focus ring（或使用 `focus:ring-2 focus:ring-[#1D1D1F]/10`）
- **选择高亮**：`selection:bg-[#1D1D1F] selection:text-white`
- **页面背景**：`bg-[#F5F5F7]`
- **主文字**：`text-[#1D1D1F]`
- **次要文字**：`text-[#6E6E73]`
- **弱化文字**：`text-[#A1A1A6]`
- **成功色**：`text-[#34C759]`
- **警告色**：`text-[#FF9500]`

### API 路由风格

- 列表查询：`GET /api/students?search=xxx&status=xxx&page=1&pageSize=20`
- 详情/更新/删除：`GET/PUT/DELETE /api/students/[id]`
- 批量操作：`POST /api/attendance/batch`、`POST /api/grading/batch`、`POST /api/competition/batch`、`POST /api/camp/batch`
- 使用 Zod 进行请求体验证，schema 定义在文件顶部
- 分页标准：`skip: (page - 1) * pageSize`，返回 `{ data, total, page, pageSize }`（不同路由字段名可能为 `students`/`courses` 等）
- 搜索使用 Prisma `contains` + `mode: "insensitive"`
- 错误响应：`Response.json({ error: "..." }, { status: XXX })`

#### 需要注意的实现细节

- **学员创建**：`POST /api/students` 会强制将 `remainingSessions` 设为 0、`expiryDate` 设为当前日期；课时和有效期应通过充值管理维护
- **充值记录**：`POST /api/recharges` 创建记录并在事务内更新学员课时和到期时间；`PUT /api/recharges/[id]` 仅允许修改备注；`DELETE /api/recharges/[id]` 会删除记录并回滚学员课时
- **班级删除**：REST API `/api/classes/[id]/DELETE` 为软删除（`status → inactive`），不会级联删除课程；AI 工具 `deleteClass` 使用硬删除，会级联删除关联课程

### Server Component vs Client Component

- **仪表盘/静态页**：使用 Server Component（如 `app/page.tsx`），直接调用 `prisma` 查询
- **列表页/交互页**：使用 `"use client"`，配合 `useState` + `useEffect` + `fetch()`
- **表单页**：通常使用 `"use client"`，调用 `useRouter()` 进行导航

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

充值操作同样使用事务，保证 `Recharge` 记录创建与 `Student` 课时/到期时间更新的一致性。

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

### AI 工具覆盖范围

`lib/ai-tools.ts` 中定义的 AI 工具覆盖以下模块：

| 模块 | 工具能力 |
|------|----------|
| 学员 | searchStudents、getStudentDetail、createStudent、updateStudent、deleteStudent |
| 教练 | searchCoaches、getCoachDetail、createCoach、updateCoach、deleteCoach |
| 班级 | listClasses、createClass、updateClass、deleteClass、addStudentsToClass、removeStudentsFromClass |
| 课程 | listCourses、createCourse、updateCourse、deleteCourse |
| 考勤 | takeAttendance、getAttendance |
| 充值 | createRecharge、searchRecharges |
| 考级 | createGrading、updateGrading、deleteGrading、searchGradings |
| 比赛 | createCompetition、updateCompetition、deleteCompetition、searchCompetitions |
| 集训 | createCamp、updateCamp、deleteCamp、searchCamps |
| 通用 | getCurrentTime（获取当前时间） |

---

## 测试策略

测试基础设施使用 Vitest + jsdom + `@testing-library/react` + `next-test-api-route-handler`。

### 测试目录结构

- `__tests__/api/` —— API 路由测试（students, coaches, classes, courses, attendance, recharges, grading, competition, camp, equipment, config）
- `__tests__/components/` —— 组件测试（sidebar, coaches-page, student-form）
- `__tests__/lib/` —— 工具函数测试（prisma 单例, utils, ai-tools）
- `__tests__/setup.ts` —— 全局 setup，mock `next/navigation` 和 `next/head`
- `tests/helpers.ts` —— **主要**测试辅助函数（API 测试从此文件导入）
- `__tests__/helpers.ts` —— 备用测试辅助函数（与 tests/helpers.ts 内容重叠）

### 测试规范

- API 测试使用真实数据库连接，通过 `cleanupTestData()` 在每个测试前清理数据
- 测试并行已关闭（`fileParallelism: false`），避免数据库冲突
- 测试数据使用 `[test]` 前缀隔离（如 `[test]学员`、`[test]课程`）
- 使用 `@faker-js/faker` 生成测试数据（已安装）
- 组件测试使用 `@testing-library/react`，需在 `__tests__/setup.ts` 中 mock Next.js 路由相关模块
- AI 工具测试直接调用 `tool.execute(input, mockOptions)`，无需经过 HTTP 层

### 测试辅助函数（`tests/helpers.ts`）

| 函数 | 用途 |
|------|------|
| `cleanupTestData()` | 删除所有名称以 `[test]` 开头的记录（按依赖顺序：attendance → grading/competition/camp/recharge → course → student → coach → class） |
| `createTestStudent(data?)` | 创建测试学员，名称自动加 `[test]` 前缀 |
| `createTestCoach(data?)` | 创建测试教练 |
| `createTestClass(data?)` | 创建测试班级 |
| `createTestCourse(data?)` | 创建测试课程（如未提供 classId 则自动创建班级） |
| `createTestEquipment(data?)` | 创建测试装备，名称自动加 `[test]` 前缀 |

---

## 持续集成

GitHub Actions 工作流定义在 `.github/workflows/ci.yml`：

1. 启动 PostgreSQL 16 服务容器
2. 安装依赖：`npm ci`
3. 生成 Prisma Client：`npx prisma generate`
4. 执行数据库迁移：`npx prisma migrate deploy`
5. 运行测试：`npx vitest run --reporter=default --reporter=junit --outputFile=./test-results/junit.xml`
6. 发布测试报告（使用 dorny/test-reporter）
7. 类型检查：`npm run typecheck`
8. 代码检查：`npm run lint`
9. 构建检查：`npm run build`
10. Ansible 语法检查：`ansible-lint ansible/` + `ansible-playbook --syntax-check`

CI 在 `push` 到 `main` 分支或针对 `main` 分支的 `pull_request` 时触发。

---

## 部署

### 推荐方案：Vercel + Supabase

- Supabase 提供 PostgreSQL 托管，与 Vercel 集成可自动配置 `DATABASE_URL`
- 在 Vercel Dashboard 中配置环境变量：`DATABASE_URL`、`MODEL`、`OPENAI_API_KEY` 等
- 执行 `vercel --prod` 部署

### Docker 生产部署

项目已内置 `Dockerfile` 和 `docker-compose.prod.yml`，支持手动 Docker 部署。

#### 文件说明

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 多阶段构建，最终镜像基于 `node:22-alpine`，内置 `postgresql-client`，启动时执行 `prisma migrate deploy` |
| `docker-compose.prod.yml` | 生产编排：App + PostgreSQL + 持久化卷 |
| `.dockerignore` | 构建排除规则 |

#### 持久化说明

- **数据库数据**：`tkd_postgres_data` Docker Volume
- **照片文件**：`tkd_uploads` Docker Volume（挂载到 `/app/public/uploads`）
- 容器重启或更新后数据不会丢失

#### 手动 Docker 运维（在目标服务器执行）

```bash
# 构建并启动生产环境
docker compose -f docker-compose.prod.yml up --build -d

# 查看日志
docker logs -f tkd-crm-app
docker logs -f tkd-crm-db

# 重启服务
cd /opt/tkd-crm
docker compose -f docker-compose.prod.yml restart

# 停止服务
docker compose -f docker-compose.prod.yml down

# 完全删除（包括数据卷，慎用）
docker compose -f docker-compose.prod.yml down -v

# 进入应用容器执行命令
docker exec -it tkd-crm-app sh
```

#### 独立 Docker 镜像构建

```bash
# 本地构建并测试
NEXT_OUTPUT=standalone docker build -t tkd-crm:latest .

# 本地启动（需外部 PostgreSQL）
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e MODEL="openai:gpt-4o" \
  -e OPENAI_API_KEY="sk-..." \
  -v tkd_uploads:/app/public/uploads \
  tkd-crm:latest
```

### Ansible 自动化部署

项目内置 Ansible 自动化部署方案，在 **RedHat 系服务器**上直接通过 RPM 包安装 Node.js 与 PostgreSQL，并将应用封装为 systemd 服务。默认配置适配 Fedora 默认仓库路径：

| 组件 | 说明 |
|------|------|
| 目标系统 | CentOS/RHEL/Rocky/AlmaLinux/Fedora 等 RedHat 系系统 |
| Node.js | 通过 NodeSource RPM 仓库安装 Node.js 22 |
| PostgreSQL | 通过系统默认 RPM 仓库安装（Fedora 默认包为 `postgresql-server`） |
| 服务管理 | systemd 服务 `tkd-crm.service`，依赖 PostgreSQL 服务 |
| 持久化 | 数据库数据在 PostgreSQL 默认目录，照片在 `/opt/tkd-crm/public/uploads/` |

#### 文件结构

```
ansible/
├── ansible.cfg                  # Ansible 配置
├── inventory.yml.example        # 主机清单模板（复制为 inventory.yml 后配置）
├── playbook.yml                 # 主入口：RPM 包安装 + systemd 服务部署
├── deploy-only.yml              # 仅更新应用（不重复安装基础环境）
├── group_vars/
│   └── all.yml.example          # 全局变量模板（数据库密码、API Keys 等）
└── roles/
    ├── precheck/                # 环境检测，校验 RedHat 系系统
    ├── system_setup/            # 通过 RPM 安装 Node.js + PostgreSQL，创建数据库/用户/运行用户
    ├── app_deploy/              # 同步代码、渲染 .env、npm ci、构建
    └── systemd_service/         # 创建并管理 tkd-crm systemd 服务
```

#### 前置要求

- 控制机（你的电脑）已安装 **Ansible >= 2.12**
- 控制机已安装 **rsync**
- 目标服务器可通过 SSH 登录（支持密码或密钥）

```bash
# macOS
brew install ansible rsync

# Ubuntu/Debian
sudo apt install ansible rsync

# CentOS/RHEL/Fedora
sudo dnf install ansible rsync
```

#### 配置部署

**1. 配置目标服务器**

复制并编辑 `ansible/inventory.yml`（基于 `inventory.yml.example`）：

```yaml
all:
  children:
    tkd_crm_servers:
      hosts:
        tkd-crm-prod:
          ansible_host: 192.168.1.100
          ansible_user: root
          ansible_ssh_private_key_file: ~/.ssh/id_rsa
```

**2. 配置环境变量**

复制并编辑 `ansible/group_vars/all.yml`（基于 `all.yml.example`），填写数据库密码和 API Keys：

```yaml
postgres_password: "your-secure-password"
openai_api_key: "sk-your-key"
model: "openai:gpt-4o"
```

> ⚠️ `inventory.yml` 和 `group_vars/all.yml` 已加入 `.gitignore`，请勿提交到 Git。

**3. 执行部署**

```bash
# 完整部署（首次安装，RPM 包 + systemd 服务）
ansible-playbook ansible/playbook.yml

# 仅更新应用（代码有变更时，不重复安装基础环境）
ansible-playbook ansible/deploy-only.yml

# 查看服务状态
ansible tkd_crm_servers -a "systemctl status tkd-crm"

# 查看应用日志
ansible tkd_crm_servers -a "journalctl -u tkd-crm -f"
```

#### 运维命令（部署后在目标机器执行）

**通用命令：**

```bash
systemctl start tkd-crm       # 启动服务
systemctl stop tkd-crm        # 停止服务
systemctl restart tkd-crm     # 重启服务
systemctl status tkd-crm      # 查看状态
journalctl -u tkd-crm -f      # 查看日志
```

**数据库服务命令：**

```bash
systemctl status postgresql        # 查看数据库服务状态
journalctl -u postgresql -f        # 查看数据库日志
```

---

## 安全考虑

1. **照片文件安全**：上传 API 已校验文件类型（仅 `image/*`）和大小（最大 5MB），防止恶意文件上传
2. **备份导入安全**：导入前自动创建当前数据快照（SQL 导出）；恢复后快照路径在响应中返回；ZIP 内含 `backup-manifest.json` 用于校验完整性
3. **并发控制**：批量点名扣减课时使用 PostgreSQL 事务保证原子性，并通过状态比对避免重复扣减
4. **软删除**：学员、教练、班级在 REST API 删除时执行软删除（将状态设为 `inactive`），保留历史记录
5. **环境变量隔离**：`.env.local` 不提交到版本控制（已在 `.gitignore` 中）；生产环境 API Key 通过环境变量管理
6. **身份证存储**：当前实现中身份证号以明文存储，如需加密请使用 Node.js `crypto` 模块进行对称加密后再存入数据库

---

## 提交前检查流程（强制）

**每次修改代码后，必须按以下顺序执行（与 CI 保持一致）：**

1. **生成 Prisma Client**：`npx prisma generate`
   - 确保 Prisma Client 类型与 Schema 同步

2. **数据库迁移**：`npx prisma migrate deploy`
   - 确保数据库 Schema 为最新
   - 本地开发使用 `.env.local` 中的 `DATABASE_URL`

3. **运行所有测试**：`npm test`
   - 所有测试必须通过
   - 如测试失败，先修复代码或更新测试

4. **类型检查**：`npm run typecheck`
   - 必须 0 errors
   - 如有类型错误，先修复

5. **Lint 检查**：`npm run lint`
   - 必须 0 errors、0 warnings
   - 如有 warning，先修复或添加合理的 eslint-disable 注释

6. **生产构建检查**：`npm run build`
   - 必须构建成功，0 errors
   - 如构建失败（例如 `useSearchParams` 未包裹 `Suspense`），先修复

7. **用户确认**：**必须经用户确认修改无误后，才能执行后续步骤**
   - 向用户展示修改摘要（改了哪些文件、核心变更点）
   - 等待用户明确回复"可以提交"或类似确认
   - **未经用户确认，不得擅自 commit**

8. **Commit**：`git commit`

9. **推送**：`git push origin main`
   - 仅在 lint、测试全部通过且用户确认后推送

---

## 开发参考资料

本项目所有功能细节均在以下文档中定义，开发前请务必阅读：

| 文档 | 路径 | 内容 |
|------|------|------|
| **产品需求文档（PRD）** | `docs/跆拳道馆CRM系统_PRD.md` | 功能需求、数据库设计、API 设计、AI Agent 架构、核心代码示例、安装部署指南 |
| **UI 设计文档** | `docs/跆拳道馆CRM系统_UI设计文档.md` | 设计系统（色彩/字体/间距/圆角/材质深度）、全局布局、各页面详细 UI 设计、组件规范、交互设计、响应式适配、图标系统 |
| **实施计划** | `docs/实施计划.md` | 分阶段实施计划、测试策略、风险分析 |

两份文档使用**中文**编写，是本项目开发的核心依据。
