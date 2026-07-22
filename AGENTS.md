# 跆拳道馆 CRM 系统 —— AI 代理指南

> 本文档供 AI 编码代理阅读。如果你正在阅读此文件，说明你对本项目一无所知——本文档将告诉你需要了解的一切。

---

## 项目概述

本项目是一个为跆拳道馆量身打造的客户关系管理（CRM）平台，覆盖学员全生命周期管理——从个人基本资料的录入，到课务与时间的精细化管理，再到成长与活动的完整记录，以及课表排期、考勤点名、装备库存的一体化操作。系统深度集成 AI Agent 能力，用户可通过自然语言对话完成学员、教练、班级、课程、考勤、充值、考级、比赛、集训、装备库存等核心操作。

**当前状态**：项目已完成核心功能编码，包括数据库 Schema、REST API、前端页面、AI 对话流、照片上传、数据备份与恢复、装备库存管理，以及完整的测试基础设施。`docs/` 目录下保留有产品需求文档（PRD）和 UI 设计文档作为参考。

前端页面已完整实现：仪表盘、学员管理、教练管理、班级管理、课表日历、考勤查询与点名、充值管理、考级记录、比赛记录、集训记录、装备库存、AI 助手对话、数据备份管理。

---

## 技术栈

| 层级 | 技术方案 |
|------|----------|
| **前端框架** | Next.js 16.1.7 + App Router + React 19.2.4 |
| **语言** | TypeScript 5.9.3 |
| **样式** | Tailwind CSS 4.2.1 + shadcn/ui（base-nova 风格） |
| **UI 底层** | `@base-ui/react`（shadcn/ui 组件基于此构建） |
| **日历组件** | `@fullcalendar/react`（daygrid / timegrid / interaction / list） |
| **数据库** | PostgreSQL 16 |
| **ORM** | Prisma 6.19.3 |
| **AI SDK** | Vercel AI SDK 6.0.190 + Provider Registry |
| **数据表格** | TanStack Table 8.21.3 |
| **图表** | Recharts 3.8.1 |
| **图标** | Lucide React |
| **容器化** | Docker + Docker Compose |
| **校验** | Zod 4.4.3 |
| **测试** | Vitest 4.1.7 + jsdom + `@testing-library/react` + `next-test-api-route-handler` |
| **构建工具** | Turbopack（开发模式） |
| **其他** | `react-markdown` + `remark-gfm`（AI 消息渲染）、`archiver` + `decompress`（备份 ZIP）、`@faker-js/faker`（测试数据）、`next-themes`（主题切换） |

### 支持的 LLM 提供商

通过 Vercel AI SDK 的 Provider Registry 支持多提供商动态切换（见 `lib/ai-model.ts`）：

- OpenAI (`@ai-sdk/openai`)
- Anthropic Claude (`@ai-sdk/anthropic`)
- Google Gemini (`@ai-sdk/google`)
- DeepSeek (`@ai-sdk/deepseek`)
- Groq (`@ai-sdk/groq`)

模型通过环境变量 `MODEL=provider:model-id` 格式指定，例如 `openai:gpt-4o`（未设置时默认 `openai:gpt-4o`）。额外支持 `custom:` 前缀，通过 `CUSTOM_OPENAI_BASE_URL` 和 `CUSTOM_OPENAI_API_KEY` 接入自定义 OpenAI 兼容端点。

> **注意**：`lib/ai-model.ts` 中 Google 提供商读取的是 `GOOGLE_API_KEY` 环境变量（不是 `GOOGLE_GENERATIVE_AI_API_KEY`）。仓库自带的 `.env` 模板中注释掉的是 `GOOGLE_GENERATIVE_AI_API_KEY`，使用时需要自行改成 `GOOGLE_API_KEY`。

---

## 关键配置文件

| 文件 | 用途 |
|------|------|
| `package.json` | 项目依赖与 npm 脚本定义 |
| `next.config.mjs` | Next.js 配置：output 由 `NEXT_OUTPUT` 环境变量控制（生产 Docker 镜像内置 `NEXT_OUTPUT=standalone`）、图片优化、trailingSlash、客户端环境变量 `APP_NAME`（跆拳道 CRM）/ `APP_VERSION` |
| `vitest.config.ts` | 测试配置：jsdom 环境、全局模式、`fileParallelism: false`、别名 `@` 指向项目根目录 |
| `tsconfig.json` | TypeScript 编译配置，路径别名 `@/*` 映射 `./*` |
| `eslint.config.mjs` | ESLint v9 flat config，继承 `eslint-config-next/core-web-vitals` 和 `eslint-config-next/typescript` |
| `.prettierrc` | 代码格式化：无分号、双引号、2 空格缩进、printWidth 80、prettier-plugin-tailwindcss |
| `postcss.config.mjs` | PostCSS 配置（Tailwind CSS v4） |
| `components.json` | shadcn/ui 项目配置（style: base-nova，baseColor: neutral） |
| `docker-compose.yml` | 开发环境：PostgreSQL 16 + pgAdmin + 本地生产数据库（postgres-prod） |
| `docker-compose.prod.yml` | 生产环境编排：App + PostgreSQL + 持久化卷 |
| `Dockerfile` | 多阶段构建（builder + runner），基于 `node:22-alpine`，内置 `postgresql-client` |
| `.github/workflows/ci.yml` | GitHub Actions：测试 + 类型检查 + Lint + 构建 + Ansible 语法检查 |

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
│  /api/competition/batch  /api/camp/batch  /api/chat          │
│  /api/equipment  /api/equipment/transactions  /api/backup    │
│  /api/upload  /api/config  /api/correct                      │
├─────────────────────────────────────────────────────────────┤
│                      数据处理层                               │
│  Prisma ORM + Zod Validation + PostgreSQL 事务               │
├─────────────────────────────────────────────────────────────┤
│                      数据存储层                               │
│  PostgreSQL 16 (Docker)  +  本地文件系统照片存储             │
└─────────────────────────────────────────────────────────────┘
```

- **开发服务器**：`npm run dev` 启动 Turbopack（前台运行），监听 `localhost:3000`
- **生产服务器**：`npm run build` 构建后，`npm start` 启动。Docker 镜像通过 `NEXT_OUTPUT=standalone` 输出 standalone 模式
- **数据库连接**：通过 `DATABASE_URL` 环境变量，Prisma Client 单例模式管理连接
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
│   │   ├── recharges/route.ts          # 充值记录列表与创建
│   │   ├── recharges/[id]/route.ts     # 充值记录详情与删除
│   │   ├── grading/route.ts
│   │   ├── grading/[id]/route.ts
│   │   ├── grading/batch/route.ts      # 批量创建考级记录
│   │   ├── competition/route.ts
│   │   ├── competition/[id]/route.ts
│   │   ├── competition/batch/route.ts  # 批量创建比赛记录
│   │   ├── camp/route.ts
│   │   ├── camp/[id]/route.ts
│   │   ├── camp/batch/route.ts         # 批量创建集训记录
│   │   ├── equipment/route.ts          # 装备库存列表与创建
│   │   ├── equipment/[id]/route.ts     # 装备详情、更新、删除（软删除）
│   │   ├── equipment/[id]/transactions/route.ts
│   │   ├── equipment/transactions/route.ts # 装备出入库流水
│   │   ├── chat/route.ts               # AI 对话流式接口
│   │   ├── correct/route.ts            # 语音输入文本矫正
│   │   ├── config/route.ts             # 返回客户端可用的系统配置（当前模型名）
│   │   ├── upload/route.ts             # 照片上传/删除
│   │   └── backup/route.ts             # 数据备份/恢复（ZIP + pg_dump/psql）
│   ├── students/                   # 学员列表、新增（new/）、详情与编辑（[id]/）页面
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
│   ├── equipment/                  # 装备库存管理页面（列表 + 创建/编辑弹窗 + 出入库流水）
│   └── backup/                     # 数据备份管理页面
├── components/                     # 可复用组件
│   ├── ui/                         # shadcn/ui 组件（badge, button, card, dialog, input, label, select, table）
│   ├── layout/                     # sidebar.tsx, header.tsx
│   ├── students/                   # student-form.tsx（含拍照上传、班级多选）
│   ├── coaches/                    # coach-form.tsx（基本信息、在职状态切换）
│   ├── classes/                    # class-form.tsx（基本信息、学员多选）
│   ├── equipment/                  # equipment-form.tsx, transaction-dialog.tsx
│   └── theme-provider.tsx          # next-themes 主题提供者（dark/light 切换）
├── hooks/                          # 预留的自定义 Hooks 目录（当前为空）
├── lib/                            # 工具函数与配置
│   ├── prisma.ts                   # Prisma Client 单例
│   ├── ai-model.ts                 # AI Provider Registry + getModel()
│   ├── ai-tools.ts                 # AI 工具函数封装（供 chat route 调用）
│   ├── belt-level.tsx              # 腰带级别中文映射、样式映射、BeltBadge 组件
│   └── utils.ts                    # cn() 工具（clsx + tailwind-merge）
├── __tests__/                      # 测试文件
│   ├── api/                        # API 路由测试（students, coaches, classes, courses, attendance, recharges, grading, competition, camp, equipment, config）
│   ├── components/                 # 组件测试（sidebar, coaches-page, student-form）
│   ├── lib/                        # 工具函数测试（prisma 单例, utils, ai-tools）
│   ├── helpers.ts                  # 备用测试辅助函数（与 tests/helpers.ts 内容重叠）
│   └── setup.ts                    # Vitest 全局 setup（mock next/navigation、next/head）
├── tests/                          # 主要测试辅助函数
│   └── helpers.ts                  # cleanupTestData, createTestStudent 等（API 测试从此导入）
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
├── ansible/                        # Ansible 自动化部署（RedHat/Fedora RPM + systemd）
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
- **Course**（课程）：标题（可空，自动生成默认名称）、时间、关联教练和班级
- **Attendance**（考勤）：课程-学员关联、出勤状态
- **Recharge**（充值记录）：学员课时变动记录，`action` 为 `increment`/`decrement`（String 字段，非枚举），包含变动次数和有效天数
- **Grading**（考级晋升记录）
- **Competition**（比赛记录）
- **Camp**（集训与拓展记录）
- **Equipment**（装备库存）：名称、类型、规格、当前库存、最低库存预警线、状态、备注
- **EquipmentTransaction**（装备出入库流水）：类型（入库/出库/盘点调整）、数量、原因、操作人、关联学员/教练

### 关键关联关系

```
Student (1) ──────< (N) Grading
Student (1) ──────< (N) Competition
Student (1) ──────< (N) Camp
Student (1) ──────< (N) Recharge
Student (1) ──────< (N) Attendance
Student (1) ──────< (N) EquipmentTransaction
Student (N) ──────< (M) Class      (@relation("ClassToStudent"))
Coach   (1) ──────< (N) Course
Coach   (1) ──────< (N) EquipmentTransaction
Class   (1) ──────< (N) Course
Class   (1) ──────< (M) Student    (@relation("ClassToStudent"))
Course  (1) ──────< (N) Attendance
Equipment (1) ─────< (N) EquipmentTransaction
```

- Coach 删除时，`Course.coachId` 自动设为 NULL（`onDelete: SetNull`）
- Class 删除时，关联 Course 级联删除（`onDelete: Cascade`）
- Student/Course/Equipment 删除时，关联 Attendance/Grading/Competition/Camp/Recharge/EquipmentTransaction 级联删除（`onDelete: Cascade`）
- 学员/教练与装备流水关联删除时设为 NULL（`onDelete: SetNull`）

### 索引设计

- 每个可列表实体均对 `name` 和 `status` 建立索引
- `Course` 对 `startTime`、`coachId`、`classId` 建立索引
- `Attendance` 对 `studentId`、`courseId` 建立索引
- `Grading` 对 `studentId`、`examDate` 建立复合索引
- `Equipment` 对 `name`、`category`、`status` 建立索引
- `EquipmentTransaction` 对 `equipmentId`、`createdAt`、`type` 建立索引

### 唯一索引与约束

- `Attendance` 有复合唯一索引：`@@unique([courseId, studentId, attendanceDate])` —— 防止同一学员同一天同一课程重复考勤

### 枚举定义

| 枚举 | 值 |
|------|-----|
| `Gender` | `male`, `female` |
| `Status`（学员/班级/装备） | `active`, `inactive`, `suspended` |
| `CoachStatus` | `active`, `inactive`, `on_leave` |
| `AttendanceStatus` | `present`, `absent`, `late`, `leave`, `unmarked` |
| `BeltLevel` | `white` → `white_yellow` → `yellow` → `yellow_green` → `green` → `green_blue` → `blue` → `blue_red` → `red` → `red_black` → `black`（共 11 级，数据库中带连字符存储，如 `white-yellow`） |
| `EquipmentCategory` | `uniform`, `gear`, `belt`, `pad`, `accessory`, `t_shirt`, `tracksuit`, `taekwondo_shoes`, `backpack`, `other` |
| `EquipmentTransactionType` | `in`（入库）, `out`（出库）, `adjust`（盘点调整） |

### 迁移历史

当前 `prisma/migrations/` 下包含以下迁移（按时间顺序）：

1. `20260522015634_init` —— 初始 Schema
2. `20260524201935_add_course_students` —— 课程与学员关联
3. `20260524211711_add_class_model` —— 班级模型
4. `20260524213856_remove_course_type` —— 移除课程类型字段
5. `20260524214701_make_course_title_optional` —— 课程标题可选
6. `20260525144713_add_recharge` —— 充值记录
7. `20260612130244_add_equipment` —— 装备库存
8. `20260612132527_add_equipment_transactions` —— 装备出入库流水
9. `20260612135324_add_equipment_categories` —— 扩展装备类型
10. `20260612215747_rename_sneakers_to_taekwondo_shoes` —— 装备类型重命名

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

# 数据库迁移
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
2. 等待数据库就绪（`pg_isready` 轮询）
3. 设置 `DATABASE_URL` 指向生产数据库
4. 执行 `prisma migrate deploy`
5. `NODE_ENV=production npm run build`
6. `NODE_ENV=production npx next start -p $PORT`
7. **退出时自动停止**生产数据库容器（`trap EXIT/INT/TERM`）

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
- **主色**：`#0071E3`（蓝色），用于图标、链接、主按钮高亮
- **危险操作**：`#FF3B30`（红）或 `#D9264A`，用于删除确认
- **次要按钮**：`bg-black/[0.06]` 灰色背景，hover `bg-black/[0.1]`
- **圆角风格**：大圆角为主，如消息气泡 `rounded-[18px]`、卡片 `rounded-[14px]` / `rounded-[20px]`、内嵌元素 `rounded-[10px]`
- **阴影层次**：极轻阴影或无边框，使用 `border-0 shadow-none`
- **输入框样式**：`bg-black/[0.06] rounded-[10px] border-0`，无 focus ring（或使用 `focus:ring-2 focus:ring-[#1D1D1F]/10`）
- **选择高亮**：`selection:bg-[#1D1D1F] selection:text-white`
- **页面背景**：`bg-[#F5F5F7]`
- **主文字**：`text-[#1D1D1F]`
- **次要文字**：`text-[#6E6E73]` / `text-[#86868B]`
- **弱化文字**：`text-[#A1A1A6]`
- **成功色**：`text-[#34C759]`
- **警告色**：`text-[#FF9500]`

### API 路由风格

- 列表查询：`GET /api/students?search=xxx&status=xxx&page=1&pageSize=20`
- 详情/更新/删除：`GET/PUT/DELETE /api/students/[id]`
- 批量操作：`POST /api/attendance/batch`、`POST /api/grading/batch`、`POST /api/competition/batch`、`POST /api/camp/batch`
- 使用 Zod 进行请求体验证，schema 定义在文件顶部
- 分页标准：`skip: (page - 1) * pageSize`，返回 `{ data, total, page, pageSize }`
- 搜索使用 Prisma `contains` + `mode: "insensitive"`
- 错误响应：`Response.json({ error: "..." }, { status: XXX })`

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

充值操作同样使用事务，保证 Recharge 记录创建与 Student 课时/到期时间更新的一致性。

装备出入库流水也使用事务，保证 EquipmentTransaction 记录创建与 Equipment 当前库存更新的原子性，并在库存不足时拒绝出库。

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

---

## 测试策略

测试基础设施已建立，使用 Vitest + jsdom + `@testing-library/react` + `next-test-api-route-handler`。

### 测试目录结构

- `__tests__/api/` —— API 路由测试（students, coaches, classes, courses, attendance, recharges, grading, competition, camp, equipment, config）
- `__tests__/components/` —— 组件测试（sidebar, coaches-page, student-form）
- `__tests__/lib/` —— 工具函数测试（prisma 单例, utils, ai-tools）
- `__tests__/setup.ts` —— 全局 setup，mock `next/navigation` 和 `next/head`
- `tests/helpers.ts` —— **主要**测试辅助函数（API 测试从此文件导入）
- `__tests__/helpers.ts` —— 备用测试辅助函数（与 tests/helpers.ts 内容重叠）

### 测试规范

- API 测试使用真实数据库连接（依赖 `docker compose up -d postgres` 启动的开发数据库），通过 `cleanupTestData()` 在每个测试前清理数据
- 测试并行已关闭（`fileParallelism: false`），避免数据库冲突
- 测试数据使用 `[test]` 前缀隔离（如 `[test]学员`、`[test]课程`）
- 使用 `@faker-js/faker` 生成测试数据（已安装）
- 组件测试使用 `@testing-library/react`，需在 `__tests__/setup.ts` 中 mock Next.js 路由相关模块
- AI 工具测试直接调用 `tool.execute(input, mockOptions)`，无需经过 HTTP 层

### 测试辅助函数（`tests/helpers.ts`）

| 函数 | 用途 |
|------|------|
| `cleanupTestData()` | 删除所有名称以 `[test]` 开头的记录（按依赖顺序：attendance → grading/competition/camp → course → student → coach → class → equipmentTransaction → equipment；Recharge 依赖 Student 的级联删除自动清理） |
| `createTestStudent(data?)` | 创建测试学员，名称自动加 `[test]` 前缀 |
| `createTestCoach(data?)` | 创建测试教练 |
| `createTestClass(data?)` | 创建测试班级 |
| `createTestCourse(data?)` | 创建测试课程（如未提供 classId 则自动创建班级） |
| `createTestEquipment(data?)` | 创建测试装备 |
| `createTestEquipmentTransaction(data?)` | 创建测试装备流水，并同步更新库存 |

---

## 持续集成

GitHub Actions 工作流定义在 `.github/workflows/ci.yml`，包含两个 job：

**test** job：
1. 启动 PostgreSQL 16 服务容器
2. 安装依赖：`npm ci`
3. 生成 Prisma Client：`npx prisma generate`
4. 执行数据库迁移：`npx prisma migrate deploy`
5. 运行测试：`npx vitest run --reporter=default --reporter=junit --outputFile=./test-results/junit.xml`
6. 发布测试报告（使用 dorny/test-reporter）
7. 类型检查：`npm run typecheck`
8. 代码检查：`npm run lint`
9. 构建检查：`npm run build`

**ansible-test** job：
1. 安装 Ansible 与 ansible-lint
2. `ansible-lint ansible/`
3. 复制 `inventory.yml.example` 为 `inventory.yml`，对 `playbook.yml` 和 `deploy-only.yml` 执行 `--syntax-check`

---

## 部署

### 推荐方案：Vercel + Supabase

- Supabase 提供 PostgreSQL 托管，与 Vercel 集成可自动配置 `DATABASE_URL`
- 在 Vercel Dashboard 中配置环境变量：`DATABASE_URL`、`MODEL`、`OPENAI_API_KEY` 等
- 执行 `vercel --prod` 部署

### Docker 生产部署

项目已内置 Dockerfile 和 `docker-compose.prod.yml`，支持手动 Docker 部署。

#### 文件说明

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 多阶段构建，最终镜像基于 `node:22-alpine`，内置 `postgresql-client` |
| `docker-compose.prod.yml` | 生产编排：App（`tkd-crm-app`）+ PostgreSQL（`tkd-crm-db`）+ 持久化卷 |
| `.dockerignore` | 构建排除规则 |

#### 持久化说明

- **数据库数据**：`tkd_postgres_data` Docker Volume
- **照片文件**：`tkd_uploads` Docker Volume（挂载到 `/app/public/uploads`）
- 容器重启或更新后数据不会丢失

#### 手动 Docker 运维（在目标服务器执行）

```bash
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

项目内置 Ansible 自动化部署方案，**当前仅支持 RedHat 系操作系统**（CentOS/RHEL/Rocky/AlmaLinux/Fedora），通过 RPM 包安装 Node.js + PostgreSQL，并使用 systemd 直接管理 Node.js 进程。详细使用说明另见 `ansible/README.md`。

#### 部署方式详情

**RPM 包 + systemd 方案**：
- 确认目标系统为 RedHat 系（`ansible_facts['os_family'] == "RedHat"`）
- 通过 `dnf` 安装 `nodejs` 和 `postgresql-server` / `postgresql-contrib`
- 初始化 PostgreSQL 数据库、创建应用用户和数据库
- 创建专用用户 `tkd-crm`
- 同步代码到 `/opt/tkd-crm/`
- 在目标机器上执行 `npm ci` + `npm run build`（standalone 模式）
- 创建 systemd service 管理 Node.js 进程
- 持久化：数据库在本地 PostgreSQL，照片在 `/opt/tkd-crm/public/uploads`

#### 文件结构

```
ansible/
├── ansible.cfg                  # Ansible 配置
├── README.md                    # Ansible 部署详细使用说明
├── inventory.yml.example        # 主机清单模板（复制为 inventory.yml 后配置）
├── playbook.yml                 # 主入口：安装环境 + 部署应用
├── deploy-only.yml              # 仅更新应用（不重复安装基础环境）
├── group_vars/
│   ├── all.yml.example          # 全局变量模板（数据库密码、API Keys 等）
│   └── all.yml                  # 实际变量（Git 忽略）
└── roles/
    ├── precheck/                # 环境检测（确认 RedHat 系）
    ├── system_setup/            # 安装 Node.js + PostgreSQL，初始化数据库
    │   └── handlers/main.yml    # 重启 PostgreSQL
    ├── app_deploy/              # 同步代码、渲染 .env、构建
    │   └── templates/env-native.j2
    └── systemd_service/         # 创建 systemd 服务
        └── templates/tkd-crm-native.service.j2
```

#### 前置要求

- 控制机（你的电脑）已安装 **Ansible >= 2.12**
- 控制机已安装 **rsync**
- 目标服务器可通过 SSH 登录（支持密码或密钥）
- 目标服务器为 RedHat 系，且能访问 dnf 仓库

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

复制并编辑 `ansible/group_vars/all.yml`（基于 `all.yml.example`）：

```yaml
app_name: "跆拳道馆 CRM"
app_version: "1.0.0"
deploy_dir: /opt/tkd-crm
app_port: 3000
db_port: 5432

postgres_user: taekwondo
postgres_password: CHANGE_ME_TO_STRONG_PASSWORD
postgres_db: taekwondo_crm

# Fedora 默认路径，其他 RedHat 系发行版按需覆盖
postgresql_service_name: postgresql
postgresql_data_dir: "/var/lib/pgsql/data"
postgresql_bin_dir: "/usr/bin"
postgresql_packages:
  - postgresql-server
  - postgresql-contrib

model: "openai:gpt-4o"
openai_api_key: ""
anthropic_api_key: ""
google_api_key: ""
deepseek_api_key: ""
groq_api_key: ""

custom_openai_base_url: ""
custom_openai_api_key: ""

# npm 镜像源（国内服务器建议用 npmmirror 加速）
npm_registry: "https://registry.npmmirror.com"

# npm HTTP 代理（可选，留空不使用，可指向控制机局域网代理）
npm_proxy: ""

health_check_retries: 12
health_check_delay: 5
```

**3. 执行部署**

```bash
# 完整部署（安装环境 + 部署应用）
ansible-playbook -i ansible/inventory.yml ansible/playbook.yml

# 仅更新应用
ansible-playbook -i ansible/inventory.yml ansible/deploy-only.yml
```

部署完成后，可通过 `http://<服务器IP>:3000` 访问，使用 systemd 管理服务：

```bash
systemctl start tkd-crm      # 启动服务
systemctl stop tkd-crm       # 停止服务
systemctl restart tkd-crm    # 重启服务
systemctl status tkd-crm     # 查看状态
journalctl -u tkd-crm -f     # 查看日志
```

---

## 安全注意事项

1. **API Keys**：`.env.local` 和 `ansible/group_vars/all.yml` 包含敏感 API Key，均已加入 `.gitignore`，切勿提交到 Git。
2. **数据库密码**：Ansible `group_vars/all.yml` 中的 `postgres_password` 必须设置为强密码。
3. **照片上传限制**：上传接口限制文件类型为 `image/*`、大小不超过 5MB，并统一存储为 `.jpg`。
4. **备份恢复风险**：`/api/backup` POST 导入会覆盖当前数据库，导入前会自动创建快照，但仍建议在维护窗口操作。
5. **软删除**：学员、教练、装备删除时仅将状态设为 `inactive`，不会物理删除关联数据。
6. **Prisma 查询**：避免在 Server Component 中暴露过多关联数据，注意权限和敏感字段过滤。
7. **CORS 与鉴权**：当前系统为内部 CRM，未实现登录鉴权。如需对外开放，必须补充身份认证和授权机制。

---

## 最近重要变更

- 新增装备库存管理模块（`Equipment`、`EquipmentTransaction`）及对应页面、API、AI 工具、测试。
- Ansible 部署方案重构为 RedHat/Fedora 专用的 RPM 包 + systemd 方案（不再使用 Podman）。
- 装备类型枚举扩展并标准化（如 `taekwondo_shoes` 道鞋）。
