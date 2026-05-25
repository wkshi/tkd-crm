# 跆拳道馆 CRM 系统 —— 产品需求文档（PRD）

## 1. 项目概述

### 1.1 项目背景

本系统为跆拳道馆量身打造的客户关系管理（CRM）平台，覆盖学员全生命周期管理——从个人基本资料的录入，到课务与时间的精细化管理，再到成长与活动的完整记录，以及课表排期与考勤点名的一体化操作。系统以 **Next.js** 为前端框架，**PostgreSQL** 为数据存储，通过现代化的全栈技术方案，为道馆提供高效、直观、可扩展的信息化管理能力。

此外，系统深度集成 **AI Agent** 能力，用户可通过自然语言对话完成学员与课程的增删改查、课程点名等核心操作，显著降低操作门槛，提升管理效率。

### 1.2 目标用户

| 角色 | 职责 | 核心诉求 |
|------|------|----------|
| **道馆管理员** | 负责学员信息维护、课程排期、考勤管理 | 一站式管理所有学员和课程数据，操作便捷 |
| **教练** | 负责上课点名、查看学员成长记录 | 快速完成点名，了解学员历史表现 |
| **学员/家长** | 查看个人信息、考级记录、考勤情况 | 美观的只读信息页，信息透明可查 |

### 1.3 技术栈选型

| 层级 | 技术方案 | 选型理由 |
|------|----------|----------|
| **前端框架** | Next.js 15 + App Router | React 生态标杆，App Router 提供更优雅的 API 路由与页面组织方式，内置 SSR/SSG 支持 |
| **UI 组件库** | shadcn/ui + Tailwind CSS | 基于 Radix UI 的无头组件，Tailwind 提供原子化样式能力，快速搭建专业界面 |
| **日历组件** | @fullcalendar/react | 业界标准日历库，支持月/周/日视图、事件拖拽、点击交互，适合课表展示 |
| **数据库** | PostgreSQL 14+ | 关系型数据库完美契合学员-课程-考勤等多表关联场景，ACID 事务保证数据一致性 |
| **ORM** | Prisma | Next.js 生态标配 ORM，自动 TypeScript 类型生成、可视化 Studio、迁移管理 |
| **容器化** | Docker + Docker Compose | 一键启动 PostgreSQL + 应用服务，开发环境零配置，生产部署标准化 |
| **AI Agent** | Vercel AI SDK + 多 LLM 提供商 | 支持 OpenAI、Anthropic、Google、DeepSeek 等，通过 Provider Registry 动态切换 |
| **数据表格** | TanStack Table | 头部分离的表格方案，支持排序、筛选、分页，适合学员列表页 |
| **图表展示** | Recharts | 轻量 React 图表库，用于学员数据统计可视化 |

---

## 2. 功能需求

### 2.1 学员基本资料管理（CRUD）

#### 2.1.1 学员信息字段

| 分类 | 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| **基本资料** | `name` | String | 是 | 学员姓名 |
| | `gender` | Enum | 是 | 性别：男 / 女 |
| | `birthDate` | Date | 否 | 出生日期 |
| | `idCard` | String | 否 | 身份证号（加密存储） |
| | `phone` | String | 否 | 联系电话 |
| **照片** | `photoUrl` | String | 否 | 学员照片文件路径（本地存储），支持摄像头拍摄或文件上传 |
| **课务信息** | `enrollmentDate` | Date | 是 | 入学时间 |
| | `remainingSessions` | Number | 是 | 剩余课时次数，默认 0 |
| | `expiryDate` | Date | 否 | 课程到期时间 |
| | `status` | Enum | 是 | 在籍状态：`active`（在籍）/`inactive`（已结业）/`suspended`（暂停） |
| | `classes` | Class[] | 否 | 所属班级（多对多关联） |
| **元数据** | `createdAt` / `updatedAt` | Date | 自动 | 创建与更新时间 |

#### 2.1.2 功能操作

- **新增学员**：填写表单后提交，系统自动生成 `_id` 与时间戳。支持为学员拍照或上传照片
- **编辑学员**：支持全部字段的修改，身份证号编辑需二次确认。可更换学员照片
- **删除学员**：软删除（将 `status` 置为 `inactive`），保留历史记录。同步删除照片文件
- **查询学员**：支持按姓名模糊搜索、按状态筛选、分页展示
- **学员拍照**：新增/编辑学员时，可调起系统摄像头拍照，或从本地选择文件上传
- **学员详情页**：只读的信息汇总页面，展示个人资料、课务信息、考级记录、比赛记录、集训记录、考勤历史，UI 美观适合展示给学员/家长查看

#### 2.1.3 学员详情页（只读展示页）设计

该页面是系统的核心展示界面之一，面向学员和家长，设计要求**美观、专业、信息完整**。

页面结构从上到下依次为：

1. **个人信息卡片**：顶部展示学员姓名、性别、在籍状态标签（彩色徽章）、入学时间。右侧展示剩余课时与到期时间，用环形进度条（Recharts）直观展示剩余课时比例
2. **成长时间线**：纵向时间线形式展示考级晋升记录，每条记录包含：考级日期、 belt 级别（白带→白黄带→黄带→黄绿带→绿带→绿蓝带→蓝带→蓝红带→红带→红黑带→黑带）、证书编号、备注
3. **比赛记录表格**：卡片式布局，展示参赛日期、比赛名称、项目/组别、成绩/名次、备注
4. **集训与拓展记录**：卡片式布局，展示活动日期、活动名称、活动地点、时长、备注
5. **考勤统计**：小型柱状图展示近 6 个月的出勤率趋势，下方列出最近 10 次考勤记录（日期、课程名、出勤状态）

配色方案采用 Apple 风格通透设计——以系统灰白背景层级构建空间感，Apple 蓝（`#0071E3`）作为强调色（accent tint）点缀于按钮、选中态与徽章中，界面清透无负担。

---

### 2.2 教练管理

#### 2.2.1 教练信息字段

教练信息与学员的基本个人信息结构一致，方便复用表单和照片采集组件。

| 分类 | 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| **基本资料** | `name` | String | 是 | 教练姓名 |
| | `gender` | Enum | 是 | 性别：男 / 女 |
| | `birthDate` | Date | 否 | 出生日期 |
| | `idCard` | String | 否 | 身份证号（加密存储） |
| | `phone` | String | 否 | 联系电话 |
| **照片** | `photoUrl` | String | 否 | 教练照片文件路径，支持摄像头拍照或文件上传 |
| **工作信息** | `joinDate` | Date | 是 | 执教时间 |
| | `bio` | String | 否 | 个人简介/工作经历 |
| | `status` | Enum | 是 | 在职状态：`active`（在职）/`inactive`（离职）/`on_leave`（休假） |
| **元数据** | `createdAt` / `updatedAt` | Date | 自动 | 创建与更新时间 |

#### 2.2.2 功能操作

- **新增教练**：填写表单后提交，含个人信息和工作经历。支持摄像头拍照或上传照片
- **编辑教练**：支持全部字段修改，可更换照片
- **删除教练**：软删除（将 `status` 置为 `inactive`），保留历史记录。同步删除照片文件
- **查询教练**：支持按姓名模糊搜索、按状态筛选、分页展示
- **教练拍照**：新增/编辑教练时，可调起系统摄像头拍照，或从本地选择文件上传
- **教练详情页**：只读的展示页面，展示个人信息、工作信息、所授课程列表

#### 2.2.3 教练详情页设计

页面结构与学员详情页保持一致，信息区域替换为教练相关内容：

1. **个人信息卡片**：教练姓名、性别、在职状态标签、执教时间。右侧展示执教年限统计
2. **简介卡片**：个人简介/工作经历文本
3. **所授课程列表**：表格展示该教练教授的所有课程（课程名、类型、上课时间、学员人数）

---

### 2.3 成长与活动记录管理

#### 2.3.1 考级晋升记录

| 字段 | 类型 | 说明 |
|------|------|------|
| `studentId` | ObjectId | 关联学员 |
| `examDate` | Date | 考级日期 |
| `beltLevel` | Enum | 带位级别（11 级枚举） |
| `notes` | String | 备注 |

- 支持为每个学员添加多条考级记录
- 学员详情页按时间倒序展示，形成成长轨迹

#### 2.3.2 比赛记录

| 字段 | 类型 | 说明 |
|------|------|------|
| `studentId` | ObjectId | 关联学员 |
| `competitionDate` | Date | 比赛日期 |
| `competitionName` | String | 比赛名称 |
| `category` | String | 参赛项目/组别 |
| `result` | String | 成绩/名次 |
| `award` | String | 备注 |

#### 2.3.3 拓展与集训记录

| 字段 | 类型 | 说明 |
|------|------|------|
| `studentId` | ObjectId | 关联学员 |
| `activityDate` | Date | 活动日期 |
| `activityName` | String | 活动名称 |
| `location` | String | 活动地点 |
| `duration` | Number | 时长（小时） |
| `notes` | String | 备注 |

---

### 2.4 课表与考勤管理

#### 2.4.1 日历视图

系统提供全功能日历视图，作为课表管理的核心界面：

- **视图模式切换**：月视图（默认）/ 周视图 / 日视图
- **课程事件展示**：日历格中以色块卡片展示课程，显示课程名称、时间段、教练
- **点击交互**：点击日历空白区域 → 弹出创建课程表单；点击已有课程 → 弹出课程详情与编辑面板
- **课程拖拽**：支持拖拽调整课程时间（可选）

#### 2.4.2 课程数据模型

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | 自动 | 主键 |
| `title` | String | 否 | 课程名称，未填写时自动生成：`{班级名} {日期}` |
| `startTime` | Date | 是 | 课程开始时间 |
| `endTime` | Date | 是 | 课程结束时间 |
| `coachId` | ObjectId | 否 | 关联教练（下拉选择），删除教练时自动置空 |
| `classId` | ObjectId | 是 | 关联班级（下拉选择），删除班级时级联删除课程 |
| `location` | String | 否 | 上课地点 |
| `maxStudents` | Number | 否 | 最大人数 |
| `description` | String | 否 | 课程描述 |
| `createdAt` / `updatedAt` | Date | 自动 | 时间戳 |

**班级选择**：课程创建/编辑时，班级字段为必填，通过下拉选择框从 `Class` 表中选择。所关联的班级删除后，该课程级联删除（`onDelete: Cascade`）。

**教练选择**：课程创建/编辑时，教练字段通过下拉选择框从 `Coach` 表中选择（而非手动输入）。下拉框展示教练头像 + 姓名 + 在职状态。所关联的教练删除后，该字段自动置为 `NULL`（`onDelete: SetNull`）。

#### 2.4.3 考勤（点名）功能

每次课程可针对所有在籍学员进行点名操作：

- **点名入口**：课程详情面板中提供"开始点名"按钮
- **点名页面**：从课程所属班级获取学员名单，展示所有在籍学员列表，每行显示：学员姓名、性别、剩余课时、出勤状态选择器
- **出勤状态选项**：
  - `present` — 出勤（绿色）
  - `absent` — 缺勤（红色）
  - `late` — 迟到（橙色）
  - `leave` — 请假（蓝色）
  - `unmarked` — 未点名（灰色，默认）
- **批量操作**：支持"全部出勤"快捷按钮
- **自动扣减**：标记为 `present` 或 `late` 时，自动扣减该学员 1 次剩余课时
- **考勤记录**：每次点名操作生成独立的考勤记录文档

#### 2.4.4 考勤记录数据模型

| 字段 | 类型 | 说明 |
|------|------|------|
| `courseId` | ObjectId | 关联课程 |
| `studentId` | ObjectId | 关联学员 |
| `attendanceDate` | Date | 考勤日期（取课程日期） |
| `status` | Enum | `present` / `absent` / `late` / `leave` |
| `checkedAt` | Date | 点名操作时间 |

---

### 2.5 信息管理功能汇总

| 功能模块 | 增 | 删 | 改 | 查 | 特殊说明 |
|----------|----|----|----|----|----------|
| 学员管理 | 表单录入 | 软删除 | 全字段编辑 | 列表+搜索+筛选 | 含只读详情页、照片采集 |
| 教练管理 | 表单录入 | 软删除 | 全字段编辑 | 列表+搜索+筛选 | 含只读详情页、照片采集、课程下拉关联 |
| 课程管理 | 日历点击+表单 | 确认删除 | 全字段编辑 | 日历视图+列表 | 教练字段为 Coach 表下拉选择 |
| 考勤管理 | 课程内点名 | — | 修改出勤状态 | 学员维度+课程维度 | 联动扣减课时 |
| 考级记录 | 关联学员添加 | 确认删除 | 全字段编辑 | 学员详情页时间线 | |
| 比赛记录 | 关联学员添加 | 确认删除 | 全字段编辑 | 学员详情页表格 | |
| 集训记录 | 关联学员添加 | 确认删除 | 全字段编辑 | 学员详情页卡片 | |
| 数据备份 | 全量导出 | — | — | — | PostgreSQL SQL + 照片 ZIP 打包下载 |
| 数据导入 | ZIP 上传导入 | — | — | — | 自动恢复 SQL + 解压照片 |

---

### 2.6 数据备份与导入功能

#### 2.6.1 数据导出（备份）

系统提供一键数据备份功能，管理员点击"备份数据"按钮后：

1. **导出 PostgreSQL 数据**：调用 `pg_dump` 命令行工具，将数据库中所有表结构和数据导出为 `.sql` 文件
2. **导出照片文件**：将 `public/uploads/students/` 目录下的所有学员照片打包
3. **生成 ZIP 包**：将 SQL 文件和照片目录统一打包为一个 ZIP 文件，文件名含时间戳（如 `taekwondo-backup-20250115-143052.zip`）
4. **触发下载**：通过 HTTP 响应将 ZIP 文件流推送给浏览器下载

**备份包结构**：
```
taekwondo-backup-20250115-143052.zip
├── backup/                          # 备份根目录
│   ├── db/                          # 数据库备份
│   │   └── taekwondo_backup.sql     # pg_dump 导出的全量 SQL
│   └── uploads/                     # 照片备份
│       └── students/                # 学员照片目录
│           ├── abc-123.jpg
│           ├── def-456.jpg
│           └── ...
└── backup-manifest.json             # 备份元数据（时间、版本、表列表）
```

**backup-manifest.json**：
```json
{
  "version": "1.0",
  "createdAt": "2025-01-15T14:30:52.000Z",
  "dbEngine": "postgresql",
  "tables": ["students", "coaches", "classes", "courses", "attendances", "gradings", "competitions", "camps"],
  "photoCount": 128,
  "appVersion": "1.0.0"
}
```

#### 2.6.2 数据导入（恢复）

系统支持从之前导出的 ZIP 备份包恢复数据：

1. **上传 ZIP 包**：管理员选择之前备份的 ZIP 文件上传
2. **校验备份包**：解压 ZIP，读取 `backup-manifest.json` 校验格式合法性
3. **导入 PostgreSQL 数据**：使用 `psql` 命令行工具执行 SQL 文件，恢复所有表结构和数据
4. **导入照片文件**：将 ZIP 中的 `uploads/students/` 目录解压到 `public/uploads/students/`
5. **完成提示**：显示导入结果（恢复记录数、照片数）

**导入安全策略**：
- 导入前自动备份当前数据（生成当前状态的快照 ZIP，防止误操作）
- 导入操作需要二次确认弹窗
- SQL 导入使用 `pg_restore` 的 `--clean` 参数，先清空现有表再导入
- 照片导入采用覆盖策略，同名文件会被备份包中的版本替换
- 导入失败时自动回滚（事务机制）

---

## 3. 系统架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ 学员管理页 │  │ 日历/课表 │  │ 学员详情页 │  │  AI 对话页   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ shadcn/ui │  │FullCalendar│  │Vercel AI SDK│                │
│  └──────────┘  └──────────┘  └──────────┘                    │
├─────────────────────────────────────────────────────────────┤
│                       API 路由层                              │
│  /api/students    /api/courses    /api/attendance            │
│  /api/grading     /api/competition /api/camp                │
│  /api/chat        (AI Agent 对话接口)                         │
├─────────────────────────────────────────────────────────────┤
│                      数据处理层                               │
│  Server Actions    Prisma ORM          Zod Validation         │
├─────────────────────────────────────────────────────────────┤
│                      数据存储层                               │
│  PostgreSQL (prisma)                                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Next.js App Router 路由规划

| 路由 | 页面功能 | 说明 |
|------|----------|------|
| `/` | 仪表盘首页 | 数据统计概览：学员总数、今日课程、本月出勤率等 |
| `/students` | 学员列表页 | 表格展示，支持搜索、筛选、分页 |
| `/students/new` | 新增学员 | 表单页面 |
| `/students/[id]` | 学员详情页 | **只读展示页**，含个人资料、考勤统计、成长记录 |
| `/students/[id]/edit` | 编辑学员 | 表单页面，预填充数据 |
| `/calendar` | 日历/课表页 | FullCalendar 视图，课程 CRUD 核心入口 |
| `/attendance` | 考勤查询页 | 按学员或按课程查询考勤记录 |
| `/coaches` | 教练列表页 | 表格展示，支持搜索、筛选 |
| `/coaches/new` | 新增教练 | 表单页面，含照片采集 |
| `/coaches/[id]` | 教练详情页 | 只读展示页，含个人信息、所授课程 |
| `/coaches/[id]/edit` | 编辑教练 | 表单页面，预填充数据 |
| `/classes` | 班级列表页 | 表格展示，支持搜索、筛选 |
| `/classes/new` | 新增班级 | 表单页面 |
| `/classes/[id]` | 班级详情页 | 只读展示页，含班级信息、学员列表、课程列表 |
| `/classes/[id]/edit` | 编辑班级 | 表单页面，预填充数据 |
| `/ai` | AI 对话页 | AI Agent 交互界面 |
| `/backup` | 数据备份页 | 备份/导入操作入口，含导出按钮和导入上传区 |

### 3.3 API 路由设计

#### 学员 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/students` | 查询学员列表（支持 `?search=姓名&status=active&page=1`） |
| `POST` | `/api/students` | 新增学员 |
| `GET` | `/api/students/[id]` | 获取单个学员详情（含关联记录） |
| `PUT` | `/api/students/[id]` | 更新学员信息 |
| `DELETE` | `/api/students/[id]` | 删除学员（软删除） |

#### 教练 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/coaches` | 查询教练列表（支持 `?search=姓名&status=active`） |
| `POST` | `/api/coaches` | 新增教练 |
| `GET` | `/api/coaches/[id]` | 获取单个教练详情（含所授课程列表） |
| `PUT` | `/api/coaches/[id]` | 更新教练信息 |
| `DELETE` | `/api/coaches/[id]` | 删除教练（软删除） |

#### 文件上传 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `POST` | `/api/upload` | 上传照片（学员/教练），通过 `type` 参数区分目录 |
| `DELETE` | `/api/upload` | 删除照片文件 |

#### 班级 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/classes` | 查询班级列表（支持 `?search=名称&status=active`） |
| `POST` | `/api/classes` | 创建班级 |
| `GET` | `/api/classes/[id]` | 获取班级详情（含学员列表、课程列表） |
| `PUT` | `/api/classes/[id]` | 更新班级信息 |
| `DELETE` | `/api/classes/[id]` | 删除班级 |

#### 课程 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/courses` | 查询课程列表（支持 `?start=日期&end=日期&classId=班级ID` 范围查询） |
| `POST` | `/api/courses` | 创建课程 |
| `GET` | `/api/courses/[id]` | 获取课程详情 |
| `PUT` | `/api/courses/[id]` | 更新课程信息 |
| `DELETE` | `/api/courses/[id]` | 删除课程 |

#### 考勤 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/attendance` | 查询考勤记录（支持 `?studentId=或courseId=`） |
| `POST` | `/api/attendance` | 提交单次考勤记录 |
| `POST` | `/api/attendance/batch` | 批量提交考勤（整堂课点名） |
| `PUT` | `/api/attendance/[id]` | 修改考勤状态 |

#### 成长记录 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET/POST` | `/api/grading` | 考级记录查询/新增 |
| `GET/POST` | `/api/competition` | 比赛记录查询/新增 |
| `GET/POST` | `/api/camp` | 集训记录查询/新增 |

#### AI Agent API

| 方法 | 路由 | 功能 |
|------|------|------|
| `POST` | `/api/chat` | AI 对话接口，接收消息流，返回流式响应 |

#### 数据备份与导入 API

| 方法 | 路由 | 功能 |
|------|------|------|
| `GET` | `/api/backup` | 导出全量数据：pg_dump SQL + 照片目录 → ZIP 包下载 |
| `POST` | `/api/backup` | 导入备份 ZIP：上传 ZIP → 恢复 SQL + 解压照片 |

---

## 4. 数据库设计（PostgreSQL + Prisma）

### 4.0 Docker 容器化配置

项目根目录提供 `docker-compose.yml`，一键启动 PostgreSQL 服务，开发环境零配置。

```yaml
# docker-compose.yml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: taekwondo-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: taekwondo
      POSTGRES_PASSWORD: taekwondo123
      POSTGRES_DB: taekwondo_crm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taekwondo -d taekwondo_crm"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 可选：PgAdmin 可视化工具
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: taekwondo-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@taekwondo.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:

# 照片文件存储说明：
# 学员照片保存在项目 public/uploads/students/ 目录下
# 生产环境部署时，务必将 uploads 目录挂载到持久化存储
# 例：docker run -v /host/data/uploads:/app/public/uploads ...
```

启动命令：

```bash
# 1. 启动 PostgreSQL 容器
docker-compose up -d

# 2. 查看容器状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f postgres

# 4. 停止容器
docker-compose down

# 5. 完全重置（删除数据卷）
docker-compose down -v
```

环境变量配置（`.env.local`）：

```env
# 本地开发（Docker）
DATABASE_URL="postgresql://taekwondo:taekwondo123@localhost:5432/taekwondo_crm"

# 生产环境（Vercel + Supabase 等）
# DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

### 4.1 Prisma Schema 定义

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 学员表
model Student {
  id                String     @id @default(uuid())
  name              String
  gender            Gender
  birthDate         DateTime?  @db.Date
  idCard            String?    @map("id_card")
  phone             String?
  photoUrl          String?    @map("photo_url")  // 照片文件路径，如 "/uploads/students/abc123.jpg"
  enrollmentDate    DateTime   @default(now()) @map("enrollment_date") @db.Date
  remainingSessions Int        @default(0) @map("remaining_sessions")
  expiryDate        DateTime?  @map("expiry_date") @db.Date
  status            Status     @default(active)
  createdAt         DateTime   @default(now()) @map("created_at")
  updatedAt         DateTime   @updatedAt @map("updated_at")

  // 关联
  gradings     Grading[]
  competitions Competition[]
  camps        Camp[]
  attendances  Attendance[]
  classes      Class[]      @relation("ClassToStudent")

  @@index([name])
  @@index([status])
  @@map("students")
}

// 教练表
model Coach {
  id         String      @id @default(uuid())
  name       String
  gender     Gender
  birthDate  DateTime?   @db.Date
  idCard     String?     @map("id_card")
  phone      String?
  photoUrl   String?     @map("photo_url")  // 教练照片路径，如 "/uploads/coaches/abc123.jpg"
  joinDate   DateTime    @default(now()) @map("join_date") @db.Date
  bio        String?     // 个人简介/工作经历
  status     CoachStatus @default(active)
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")

  // 关联
  courses Course[]

  @@index([name])
  @@index([status])
  @@map("coaches")
}

// 班级表
model Class {
  id          String   @id @default(uuid())
  name        String
  level       String?  // 段位/级别，如"白带","黄带"
  description String?
  maxStudents Int      @default(30) @map("max_students")
  status      Status   @default(active)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // 关联
  students Student[] @relation("ClassToStudent")
  courses  Course[]

  @@index([name])
  @@index([status])
  @@map("classes")
}

// 课程表
model Course {
  id          String   @id @default(uuid())
  title       String?  // 未填写时自动生成：{班级名} {日期}
  startTime   DateTime @map("start_time")
  endTime     DateTime @map("end_time")
  coachId     String?  @map("coach_id")   // 关联 Coach 表
  classId     String   @map("class_id")   // 关联 Class 表
  location    String?
  maxStudents Int      @default(30) @map("max_students")
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // 关联
  coach       Coach?       @relation(fields: [coachId], references: [id], onDelete: SetNull)
  class       Class        @relation(fields: [classId], references: [id], onDelete: Cascade)
  attendances Attendance[]

  @@index([startTime])
  @@index([coachId])
  @@index([classId])
  @@map("courses")
}

// 考勤记录表
model Attendance {
  id             String           @id @default(uuid())
  courseId       String           @map("course_id")
  studentId      String           @map("student_id")
  attendanceDate DateTime         @map("attendance_date") @db.Date
  status         AttendanceStatus @default(unmarked)
  checkedAt      DateTime?        @map("checked_at")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")

  // 关联
  course  Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  // 同一学员同一天同一课程只能有一条考勤记录
  @@unique([courseId, studentId, attendanceDate])
  @@index([studentId])
  @@index([courseId])
  @@map("attendances")
}

// 考级晋升记录表
model Grading {
  id            String    @id @default(uuid())
  studentId     String    @map("student_id")
  examDate      DateTime  @map("exam_date") @db.Date
  beltLevel     BeltLevel @map("belt_level")
  certificateNo String?   @map("certificate_no")
  notes         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // 关联
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId, examDate])
  @@map("gradings")
}

// 比赛记录表
model Competition {
  id              String   @id @default(uuid())
  studentId       String   @map("student_id")
  competitionDate DateTime @map("competition_date") @db.Date
  competitionName String   @map("competition_name")
  category        String?
  result          String?
  award           String?
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // 关联
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId])
  @@map("competitions")
}

// 拓展与集训记录表
model Camp {
  id           String   @id @default(uuid())
  studentId    String   @map("student_id")
  activityDate DateTime @map("activity_date") @db.Date
  activityName String   @map("activity_name")
  location     String?
  duration     Int?     // 小时
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // 关联
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@index([studentId])
  @@map("camps")
}

// 枚举定义
enum Gender {
  male
  female
}

enum Status {
  active
  inactive
  suspended
}

enum CoachStatus {
  active     // 在职
  inactive   // 离职
  on_leave   // 休假
}

enum AttendanceStatus {
  present
  absent
  late
  leave
  unmarked
}

enum BeltLevel {
  white
  white_yellow   @map("white-yellow")
  yellow
  yellow_green   @map("yellow-green")
  green
  green_blue     @map("green-blue")
  blue
  blue_red       @map("blue-red")
  red
  red_black      @map("red-black")
  black
}
```

### 4.2 数据关系图

```
Student (1) ──────< (N) Grading        一个学员有多条考级记录
Student (1) ──────< (N) Competition    一个学员有多条比赛记录
Student (1) ──────< (N) Camp           一个学员有多条集训记录
Student (1) ──────< (N) Attendance     一个学员有多条考勤记录
Student (N) ──────< (M) Class          一个学员可属于多个班级，一个班级有多个学员
Coach (1)   ──────< (N) Course         一个教练可教授多门课程
Class (1)   ──────< (N) Course         一个班级有多门课程
Class (1)   ──────< (N) Student        一个班级有多个学员（通过多对多关系）
Course (1)  ──────< (N) Attendance     一个课程有多条考勤记录
```

关联关系通过 PostgreSQL 外键约束 + Prisma `relation` 定义。Prisma 自动处理 JOIN 查询，支持级联删除。`Coach` 删除时，`Course.coachId` 自动设为 `NULL`（`onDelete: SetNull`）；`Class` 删除时，关联的 `Course` 级联删除（`onDelete: Cascade`）。

#### 4.3.1 教练存储目录

教练照片与学员照片分开存储，避免文件名冲突：
```
public/
└── uploads/
    ├── students/        # 学员照片
    └── coaches/         # 教练照片
```

上传 API 通过 `type=coach` 参数区分存储目录。详见 8.4 节文件上传实现。

### 4.3 数据库初始化脚本

```sql
-- init.sql（可选：Docker 首次启动时执行，用于插入示例数据）
-- Prisma Migrate 会自动创建表结构，此脚本仅用于种子数据

INSERT INTO students (id, name, gender, birth_date, phone, enrollment_date, remaining_sessions, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '张小明', 'male', '2015-03-15', '13800138001', '2024-01-15', 24, 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', '李小红', 'female', '2016-07-22', '13800138002', '2024-02-01', 18, 'active')
ON CONFLICT DO NOTHING;
```

### 4.4 索引策略

Prisma Schema 中通过 `@@index` 声明索引，迁移时自动生成。已定义的索引覆盖所有查询场景：

| 表 | 索引字段 | 类型 | 目的 |
|----|----------|------|------|
| `students` | `name` | B-tree | 姓名模糊搜索（ILIKE） |
| `students` | `status` | B-tree | 状态筛选 |
| `coaches` | `name` | B-tree | 教练姓名搜索 |
| `coaches` | `status` | B-tree | 教练状态筛选 |
| `classes` | `name` | B-tree | 班级名称搜索 |
| `classes` | `status` | B-tree | 班级状态筛选 |
| `courses` | `startTime` | B-tree | 日历范围查询 |
| `courses` | `coachId` | B-tree | 按教练查询课程 |
| `courses` | `classId` | B-tree | 按班级查询课程 |
| `attendances` | `courseId` + `studentId` + `attendanceDate` | 复合唯一索引 | 防止重复点名 |
| `attendances` | `studentId` | B-tree | 学员考勤查询 |
| `attendances` | `courseId` | B-tree | 课程考勤查询 |
| `gradings` | `studentId` + `examDate` | 复合索引 | 成长时间线查询 |

---

## 5. AI Agent 设计

### 5.1 架构概述

AI Agent 基于 **Vercel AI SDK** 的 `streamText` + `tools` + `createProviderRegistry` 能力构建，采用**多 LLM 提供商架构**，核心设计如下：

1. **对话接口**：`/api/chat` 路由接收用户消息，调用 `streamText` 生成流式响应
2. **模型路由**：通过 `createProviderRegistry` 统一管理多个 LLM 提供商，运行时根据环境变量动态选择模型
3. **工具定义**：使用 AI SDK 的 `tool` helper 定义系统操作工具集（学员 CRUD、课程 CRUD、点名）
4. **工具执行**：LLM 根据用户意图自动选择并调用工具，工具函数通过 Prisma 操作 PostgreSQL
5. **密钥存储**：各提供商的 API Key 以纯文本形式存储在 `.env.local` 中，按需配置

### 5.2 支持的 LLM 提供商

系统通过 Vercel AI SDK 的 Provider Registry 支持以下提供商，按需安装对应的 provider 包并配置环境变量即可：

| 提供商 | Provider 包名 | 环境变量 | 推荐模型 |
|--------|--------------|----------|----------|
| **OpenAI** | `@ai-sdk/openai` | `OPENAI_API_KEY` | `gpt-4o` / `gpt-4o-mini` |
| **Anthropic** | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` | `claude-3-5-sonnet` / `claude-3-haiku` |
| **Google Gemini** | `@ai-sdk/google` | `GOOGLE_GENERATIVE_AI_API_KEY` | `gemini-2.0-flash` / `gemini-1.5-pro` |
| **DeepSeek** | `@ai-sdk/deepseek` | `DEEPSEEK_API_KEY` | `deepseek-chat` / `deepseek-reasoner` |
| **Mistral** | `@ai-sdk/mistral` | `MISTRAL_API_KEY` | `mistral-large-latest` |
| **Groq** | `@ai-sdk/groq` | `GROQ_API_KEY` | `llama-3.3-70b` / `mixtral-8x7b` |
| **Azure OpenAI** | `@ai-sdk/azure` | `AZURE_API_KEY` + `AZURE_RESOURCE_NAME` | 部署名自定义 |
| **兼容 OpenAI API** | `@ai-sdk/openai` | `OPENAI_API_KEY` + `OPENAI_BASE_URL` | 本地模型/其他兼容服务 |

### 5.3 模型选择与配置

通过**单一环境变量** `MODEL` 指定使用的模型，格式为 `提供商:模型ID`：

```env
# .env.local —— AI 配置示例（只需配置你实际使用的）

# 选择模型的统一入口（格式：provider:model-id）
MODEL=openai:gpt-4o
# MODEL=anthropic:claude-3-5-sonnet-20241022
# MODEL=google:gemini-2.0-flash
# MODEL=deepseek:deepseek-chat
# MODEL=groq:llama-3.3-70b-versatile

# 各提供商的 API Key（按需配置，用不到的可不填）
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
DEEPSEEK_API_KEY=your-deepseek-key
GROQ_API_KEY=gsk-your-groq-key

# 如果使用兼容 OpenAI API 的本地/第三方服务
# OPENAI_BASE_URL=http://localhost:1234/v1
```

### 5.4 模型路由层实现

创建统一的模型路由模块，所有 AI 路由通过该模块获取模型实例：

```typescript
// lib/ai-model.ts
import { createProviderRegistry, LanguageModel } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { groq } from '@ai-sdk/groq';

// 注册所有提供商
const registry = createProviderRegistry({
  openai,
  anthropic,
  google,
  deepseek,
  groq,
  // 兼容 OpenAI API 的自定义端点（如 LM Studio、Ollama 等）
  custom: openai,
});

/**
 * 根据环境变量 MODEL 获取模型实例
 * 格式：provider:model-id，如 "openai:gpt-4o"
 * 未设置时默认使用 openai:gpt-4o
 */
export function getModel(): LanguageModel {
  const modelSpec = process.env.MODEL || 'openai:gpt-4o';

  // 兼容自定义 OpenAI 端点
  if (modelSpec.startsWith('custom:')) {
    const modelId = modelSpec.split(':')[1];
    return openai(modelId, {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  return registry.languageModel(modelSpec);
}
```

### 5.5 AI 工具集定义

系统为 AI Agent 注册以下工具，每个工具对应一个系统操作：

#### 学员管理工具

| 工具名 | 功能 | 参数 |
|--------|------|------|
| `searchStudents` | 搜索学员 | `keyword` (姓名关键词) |
| `getStudentDetail` | 获取学员详情 | `studentId` |
| `createStudent` | 新增学员 | `name`, `gender`, `birthDate?`, `phone?`, `enrollmentDate?`, `remainingSessions?` |
| `updateStudent` | 更新学员 | `studentId`, 可变字段 |
| `deleteStudent` | 删除学员 | `studentId` |

#### 课程管理工具

| 工具名 | 功能 | 参数 |
|--------|------|------|
| `listCourses` | 列出课程 | `startDate?`, `endDate?`, `classId?` |
| `createCourse` | 创建课程 | `title?`, `startTime`, `endTime`, `classId`, `coachId?`, `location?` |
| `updateCourse` | 更新课程 | `courseId`, 可变字段 |
| `deleteCourse` | 删除课程 | `courseId` |

#### 考勤工具

| 工具名 | 功能 | 参数 |
|--------|------|------|
| `takeAttendance` | 课程点名 | `courseId`, `records` (学员ID+状态数组) |
| `getAttendance` | 查询考勤 | `courseId?`, `studentId?`, `date?` |

### 5.6 工具实现示例

```typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getModel } from '@/lib/ai-model';  // 统一模型路由入口

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: getModel(),  // 动态路由到用户选择的模型
    system: `你是跆拳道馆 CRM 系统的 AI 助手。你可以帮助用户管理学员信息、课程安排和考勤点名。
    操作前请确认关键信息，删除操作需要二次确认。回复使用中文。`,
    messages,
    tools: {
      // --- 学员工具 ---
      searchStudents: tool({
        description: '根据姓名关键词搜索学员',
        parameters: z.object({ keyword: z.string().describe('学员姓名关键词') }),
        execute: async ({ keyword }) => {
          const students = await prisma.student.findMany({
            where: {
              name: { contains: keyword, mode: 'insensitive' },
              status: 'active'
            },
            select: { id: true, name: true, gender: true, remainingSessions: true, expiryDate: true },
            take: 20
          });
          return students.map(s => ({
            id: s.id,
            name: s.name,
            gender: s.gender === 'male' ? '男' : '女',
            remainingSessions: s.remainingSessions,
            expiryDate: s.expiryDate
          }));
        }
      }),

      createStudent: tool({
        description: '新增学员',
        parameters: z.object({
          name: z.string().describe('姓名'),
          gender: z.enum(['male', 'female']).describe('性别：male 或 female'),
          phone: z.string().optional().describe('电话号码'),
          remainingSessions: z.number().optional().describe('剩余课时，默认0'),
        }),
        execute: async (input) => {
          const student = await prisma.student.create({
            data: { ...input, enrollmentDate: new Date(), status: 'active' }
          });
          return { success: true, studentId: student.id, name: student.name };
        }
      }),

      // --- 课程工具 ---
      listCourses: tool({
        description: '查询课程列表',
        parameters: z.object({
          startDate: z.string().optional().describe('起始日期 ISO 格式'),
          endDate: z.string().optional().describe('结束日期 ISO 格式'),
        }),
        execute: async ({ startDate, endDate }) => {
          const where: any = {};
          if (startDate && endDate) {
            where.startTime = { gte: new Date(startDate), lte: new Date(endDate) };
          }
          const courses = await prisma.course.findMany({
            where, orderBy: { startTime: 'asc' }, take: 50
          });
          return courses.map(c => ({
            id: c.id, title: c.title,
            startTime: c.startTime, endTime: c.endTime,
            coach: c.coach, classId: c.classId
          }));
        }
      }),

      createCourse: tool({
        description: '创建课程',
        parameters: z.object({
          title: z.string().optional().describe('课程名称，未填写时自动生成'),
          startTime: z.string().describe('开始时间 ISO 格式'),
          endTime: z.string().describe('结束时间 ISO 格式'),
          classId: z.string().describe('班级ID（必填）'),
          coachId: z.string().optional().describe('教练ID（如需指定教练）'),
        }),
        execute: async (input) => {
          const course = await prisma.course.create({
            data: {
              ...input,
              startTime: new Date(input.startTime),
              endTime: new Date(input.endTime)
            }
          });
          return { success: true, courseId: course.id };
        }
      }),

      // --- 教练工具 ---
      searchCoaches: tool({
        description: '根据姓名关键词搜索教练',
        parameters: z.object({ keyword: z.string().describe('教练姓名关键词') }),
        execute: async ({ keyword }) => {
          const coaches = await prisma.coach.findMany({
            where: {
              name: { contains: keyword, mode: 'insensitive' },
              status: 'active'
            },
            select: { id: true, name: true, gender: true, photoUrl: true },
            take: 20
          });
          return coaches.map(c => ({
            id: c.id,
            name: c.name,
            gender: c.gender === 'male' ? '男' : '女',
            photoUrl: c.photoUrl
          }));
        }
      }),

      // --- 考勤工具 ---
      takeAttendance: tool({
        description: '为课程进行学员点名',
        parameters: z.object({
          courseId: z.string().describe('课程ID'),
          records: z.array(z.object({
            studentId: z.string().describe('学员ID'),
            status: z.enum(['present', 'absent', 'late', 'leave']).describe('出勤状态')
          })).describe('点名记录数组'),
        }),
        execute: async ({ courseId, records }) => {
          const course = await prisma.course.findUnique({ where: { id: courseId } });
          if (!course) throw new Error('课程不存在');

          await prisma.$transaction([
            // 1. 批量 upsert 考勤记录
            ...records.map(r => prisma.attendance.upsert({
              where: {
                courseId_studentId_attendanceDate: {
                  courseId, studentId: r.studentId,
                  attendanceDate: course.startTime
                }
              },
              update: { status: r.status, checkedAt: new Date() },
              create: {
                courseId, studentId: r.studentId,
                attendanceDate: course.startTime,
                status: r.status, checkedAt: new Date()
              }
            })),
            // 2. 扣减课时（present 和 late 扣 1 次）
            prisma.student.updateMany({
              where: {
                id: { in: records.filter(r => r.status === 'present' || r.status === 'late').map(r => r.studentId) },
                remainingSessions: { gt: 0 }
              },
              data: { remainingSessions: { decrement: 1 } }
            })
          ]);

          return { success: true, checkedCount: records.length };
        }
      }),
    }
  });

  return result.toDataStreamResponse();
}
```

### 5.7 前端 AI 对话页面

AI 对话页面 (`/ai`) 采用经典的聊天界面布局：

- **左侧**：对话历史列表（支持新建对话）
- **右侧**：消息展示区 + 底部输入框
- **消息气泡**：用户消息右对齐（深色背景），AI 消息左对齐（浅色背景）
- **工具调用展示**：AI 调用工具时，以卡片形式展示"正在执行：xxx"的状态反馈
- **快捷指令**：底部提供快捷按钮（"查看今日课程"、"搜索学员 xxx"、"开始点名"等）

使用 Vercel AI SDK 的 `useChat` hook：

```typescript
'use client';
import { useChat } from '@ai-sdk/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block px-4 py-3 rounded-[18px] ${
              msg.role === 'user' ? 'bg-[#D9264A] text-white rounded-tr-sm' : 'bg-white rounded-tl-sm'
            }`}>
              {msg.content}
              {msg.toolInvocations?.map(tool => (
                <div key={tool.toolCallId} className="text-[12px] text-[#6E6E73] mt-1">
                  正在执行: {tool.toolName}...
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-black/[0.04]">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="输入指令，例如：帮我查找叫张三的学员"
          className="w-full bg-black/[0.06] rounded-full px-5 py-3 text-[15px] text-[#1D1D1F] placeholder:text-[#A1A1A6] border-0 focus:ring-2 focus:ring-[#D9264A]/20 focus:bg-white transition-all duration-200"
        />
      </form>
    </div>
  );
}
```

---

## 6. 页面详细设计

### 6.1 仪表盘首页 (`/`)

页面布局：顶部统计卡片 + 中部双栏（今日课程 + 快捷入口）+ 底部最近活动。

**统计卡片（4 列网格）**：
- 在籍学员总数（icon: Users）
- 今日课程数（icon: Calendar）
- 本月出勤率（icon: TrendingUp，百分比 + 趋势箭头）
- 即将到期学员数（icon: AlertCircle，红色警示）

**今日课程列表**：展示当天所有课程，每行显示时间、课程名、教练、操作按钮（"点名"快捷入口）

**快捷入口（2×3 网格图标按钮）**：新增学员、查看日历、考勤查询、考级录入、比赛录入、AI 助手

### 6.2 学员列表页 (`/students`)

页面布局：顶部搜索栏 + 筛选器 + 操作按钮 → 数据表格 → 底部分页器。

**搜索与筛选**：
- 搜索框：姓名模糊搜索，Enter 触发
- 状态筛选下拉：`全部` / `在籍` / `已结业` / `暂停`
- 右侧"新增学员"主按钮

**表格列定义**：

| 列名 | 字段 | 说明 |
|------|------|------|
| 姓名 | `name` | 点击跳转详情页 |
| 性别 | `gender` | 男/女标签展示 |
| 入学时间 | `enrollmentDate` | 格式化：YYYY-MM-DD |
| 剩余课时 | `remainingSessions` | 数字展示，低于 5 次标红 |
| 到期时间 | `expiryDate` | 已过期标红 |
| 状态 | `status` | 彩色徽章（绿-在籍/灰-结业/橙-暂停） |
| 操作 | — | 编辑 / 删除 图标按钮 |

**分页**：默认每页 20 条，支持 10/20/50 切换。

### 6.3 学员详情页 (`/students/[id]`)

**该页面为只读展示页，UI 设计目标是美观专业，适合向学员/家长展示。**

页面采用卡片式布局，配色方案为 Apple 风格通透设计，以背景色层级替代阴影表达深度。

**顶部信息卡片**：
- 左侧：学员姓名（大号字体）、性别图标、在籍状态徽章
- 右侧：圆形进度图展示剩余课时 / 总课时比例，到期时间倒计时

**成长时间线**：
- 纵向时间线，从最新到最旧排列
- 每个节点：带位颜色圆点 + 考级日期 + belt 级别中文名 + 备注
- belt 级别中文对照：white→白带, white-yellow→白黄带, yellow→黄带, yellow-green→黄绿带, green→绿带, green-blue→绿蓝带, blue→蓝带, blue-red→蓝红带, red→红带, red-black→红黑带, black→黑带

**比赛记录区**：表格卡片，列：日期、比赛名称、组别、成绩、获奖

**集训记录区**：网格卡片，每张卡片：日期、活动名称、地点、时长

**考勤统计区**：
- 小型柱状图：近 6 个月出勤率
- 列表：最近 10 次考勤记录（日期、课程名、状态色点+文字）

### 6.4 考级管理页 (`/grading`)

**核心场景**：统一管理考级相关操作，包括为多名学员统一录入晋升记录，以及查看、编辑、删除历史考级数据。页面顶部提供 Tab 切换，分为"考级录入"和"考级记录"两个视图。

**页面布局**：

```
┌─────────────────────────────────────────────────────────────┐
│  考级管理                                                    │
│  [考级录入] [考级记录]                                       │
├─────────────────────────────────────────────────────────────┤
│  [班级▼] [搜索姓名...] [全选] [已选 5 人]    [清空]          │
├──────────────────────────────┬──────────────────────────────┤
│                              │  考级信息                     │
│  📋 学员列表                  │  ┌────────────────────────┐ │
│  ┌────────────────────────┐  │  │ 考试日期              │ │
│  │ ☑ 张三   男  黄带  一班 │  │ │ [2026-05-25        ] │ │
│  │ ☑ 李四   女  黄带  一班 │  │  └────────────────────────┘ │
│  │ ☐ 王五   男  绿带  二班 │  │  ┌────────────────────────┐ │
│  │ ☐ 赵六   女  白带  二班 │  │  │ 新腰带级别            │ │
│  │    ...                 │  │ │ [黄绿带 ▼          ] │ │
│  └────────────────────────┘  │  └────────────────────────┘ │
│                              │  ┌────────────────────────┐ │
│                              │  │ 备注（可选）          │ │
│                              │ │ [                  ] │ │
│                              │  └────────────────────────┘ │
│                              │                             │
│                              │  [    📝 批量录入    ]      │
│                              │                             │
└──────────────────────────────┴──────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  📋 考级记录列表（共 X 条）                                   │
│  ┌────────┬──────────┬──────────┬────────┬──────────────┐  │
│  │ 学员   │ 考试日期 │ 腰带级别 │ 备注   │ 操作         │  │
│  │ 张三   │ 2026-05  │ 黄绿带   │ —      │ [编辑][删除] │  │
│  │ 李四   │ 2026-05  │ 黄绿带   │ —      │ [编辑][删除] │  │
│  └────────┴──────────┴──────────┴────────┴──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Tab 切换**：
- `bg-black/[0.06] rounded-[10px] p-1` 容器
- 每个 Tab：`px-4 py-1.5 rounded-lg text-[14px] font-medium`
  - 激活态：`bg-white shadow-sm text-[#1D1D1F]`
  - 非激活态：`text-[#6E6E73] hover:text-[#1D1D1F]`

**交互流程（考级录入 Tab）**：

1. **筛选学员**：顶部提供班级下拉筛选 + 姓名实时搜索输入框
2. **勾选学员**：表格每行左侧复选框，表头支持"全选/全不选"切换
3. **填写考级信息**：右侧面板统一填写（考试日期默认当天、新腰带级别下拉选择 11 级枚举、备注可选）
4. **提交录入**：按钮实时显示"为 N 名学员录入考级信息"，点击后调用 `/api/grading/batch` 批量创建
5. **成功反馈**：Toast 提示成功条数，清空选择态，学员列表当前级别即时刷新

**学员列表字段**：

| 字段 | 来源 | 说明 |
|------|------|------|
| 复选框 | 本地 state | 选中态控制 |
| 姓名 | Student.name | 文字 |
| 性别 | Student.gender | 男/女 |
| **当前腰带级别** | Grading 表最新记录 | 白/白黄/黄/黄绿/绿/绿蓝/蓝/蓝红/红/红黑/黑，无记录显示"—" |
| 所属班级 | Student.classes | 标签形式展示 |

**考级记录列表字段**：

| 字段 | 说明 |
|------|------|
| 学员姓名 | 关联 Student.name |
| 考试日期 | 格式化：YYYY-MM-DD |
| 腰带级别 | pill 徽章，中文展示 |
| 备注 | 文字，空显示"—" |
| 操作 | 编辑 / 删除 图标按钮 |

**编辑弹窗**：点击编辑按钮弹出 Dialog，可修改考试日期、腰带级别、备注，保存后刷新列表。

**删除确认**：点击删除按钮弹出浏览器 `confirm`，确认后调用 `DELETE /api/grading/[id]` 删除。

**批量 API**：`POST /api/grading/batch`

```typescript
// Request Body
{
  items: [
    { studentId: "uuid", examDate: "2026-05-25", beltLevel: "yellow_green", notes?: "" }
  ]
}
```

- 使用 Prisma `$transaction` 保证原子性
- 失败时返回具体失败项及错误原因，成功项不回滚

**单条 API**：`GET/PUT/DELETE /api/grading/[id]`

- `GET`：查询单条考级记录详情
- `PUT`：更新考试日期、腰带级别、备注
- `DELETE`：删除考级记录

### 6.5 比赛管理页 (`/competition`)

**核心场景**：统一管理比赛相关操作，包括为多名学员统一录入比赛记录，以及查看、编辑、删除历史比赛数据。页面顶部提供 Tab 切换，分为"比赛录入"和"比赛记录"两个视图。

**页面布局**：

```
┌─────────────────────────────────────────────────────────────┐
│  比赛管理                                                    │
│  [比赛录入] [比赛记录]                                       │
├─────────────────────────────────────────────────────────────┤
│  [班级▼] [搜索姓名...] [全选] [已选 5 人]    [清空]          │
├──────────────────────────────┬──────────────────────────────┤
│                              │  比赛信息                     │
│  📋 学员列表                  │  ┌────────────────────────┐ │
│  ┌────────────────────────┐  │  │ 比赛日期              │ │
│  │ ☑ 张三   男  黄带  一班 │  │ │ [2026-05-25        ] │ │
│  │ ☑ 李四   女  黄带  一班 │  │  └────────────────────────┘ │
│  │ ☐ 王五   男  绿带  二班 │  │  ┌────────────────────────┐ │
│  │ ☐ 赵六   女  白带  二班 │  │  │ 比赛名称 *            │ │
│  │    ...                 │  │ │ [全市跆拳道锦标赛 ] │ │
│  └────────────────────────┘  │  └────────────────────────┘ │
│                              │  ┌────────────────────────┐ │
│                              │  │ 参赛组别（可选）      │ │
│                              │ │ [少儿组 32kg      ] │ │
│                              │  └────────────────────────┘ │
│                              │  ┌────────────────────────┐ │
│                              │  │ 成绩/名次（可选）     │ │
│                              │ │ [冠军             ] │ │
│                              │  └────────────────────────┘ │
│                              │  ┌────────────────────────┐ │
│                              │  │ 备注（可选）      │ │
│                              │ │ [金牌             ] │ │
│                              │  └────────────────────────┘ │
│                              │                             │
│                              │  [    📝 批量录入    ]      │
│                              │                             │
└──────────────────────────────┴──────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  📋 比赛记录列表（共 X 条）                                   │
│  ┌────────┬──────────┬──────────┬────────┬────────┬────────┐ │
│  │ 学员   │ 比赛日期 │ 比赛名称 │ 组别   │ 成绩   │ 操作   │ │
│  │ 张三   │ 2026-05  │ 全市赛   │ 少儿组 │ 冠军   │ 编辑删除│ │
│  │ 李四   │ 2026-05  │ 全市赛   │ 少儿组 │ 亚军   │ 编辑删除│ │
│  └────────┴──────────┴──────────┴────────┴────────┴────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Tab 切换**：
- `bg-black/[0.06] rounded-[10px] p-1` 容器
- 每个 Tab：`px-4 py-1.5 rounded-lg text-[14px] font-medium`
  - 激活态：`bg-white shadow-sm text-[#1D1D1F]`
  - 非激活态：`text-[#6E6E73] hover:text-[#1D1D1F]`

**交互流程（比赛录入 Tab）**：

1. **筛选学员**：顶部提供班级下拉筛选 + 姓名实时搜索输入框
2. **勾选学员**：表格每行左侧复选框，表头支持"全选/全不选"切换
3. **填写比赛信息**：右侧面板统一填写（比赛日期默认当天、比赛名称必填、参赛组别/成绩/获奖可选）
4. **提交录入**：按钮实时显示"为 N 名学员录入比赛信息"，点击后调用 `/api/competition/batch` 批量创建
5. **成功反馈**：Toast 提示成功条数，清空选择态，刷新列表

**学员列表字段**：

| 字段 | 来源 | 说明 |
|------|------|------|
| 复选框 | 本地 state | 选中态控制 |
| 姓名 | Student.name | 文字 |
| 性别 | Student.gender | 男/女 |
| **当前腰带级别** | Grading 表最新记录 | 白/白黄/黄/黄绿/绿/绿蓝/蓝/蓝红/红/红黑/黑，无记录显示"—" |
| 所属班级 | Student.classes | 标签形式展示 |

**比赛记录列表字段**：

| 字段 | 说明 |
|------|------|
| 学员姓名 | 关联 Student.name |
| 比赛日期 | 格式化：YYYY-MM-DD |
| 比赛名称 | 文字 |
| 参赛组别 | 文字，空显示"—" |
| 成绩/名次 | 文字，空显示"—" |
| 操作 | 编辑 / 删除 图标按钮 |

**编辑弹窗**：点击编辑按钮弹出 Dialog，可修改比赛日期、比赛名称、参赛组别、成绩、获奖，保存后刷新列表。

**删除确认**：点击删除按钮弹出浏览器 `confirm`，确认后调用 `DELETE /api/competition/[id]` 删除。

**批量 API**：`POST /api/competition/batch`

```typescript
// Request Body
{
  items: [
    { studentId: "uuid", competitionDate: "2026-05-25", competitionName: "全市跆拳道锦标赛", category?: "", result?: "", award?: "" }
  ]
}
```

- 使用 Prisma `$transaction` 保证原子性
- 失败时返回具体失败项及错误原因，成功项不回滚

**单条 API**：`GET/PUT/DELETE /api/competition/[id]`

- `GET`：查询单条比赛记录详情
- `PUT`：更新比赛日期、比赛名称、参赛组别、成绩、获奖
- `DELETE`：删除比赛记录

### 6.5b 集训管理页 (`/camp`)

**核心场景**：统一管理集训相关操作，包括为多名学员统一录入集训记录，以及查看、编辑、删除历史集训数据。页面顶部提供 Tab 切换，分为"集训录入"和"集训记录"两个视图。

**页面布局**：

```
┌─────────────────────────────────────────────────────────────┐
│  集训管理                                                    │
│  [集训录入] [集训记录]                                       │
├─────────────────────────────────────────────────────────────┤
│  [班级▼] [搜索姓名...] [全选] [已选 5 人]    [清空]          │
├──────────────────────────────┬──────────────────────────────┤
│                              │  集训信息                     │
│  📋 学员列表                  │  ┌────────────────────────┐ │
│  ┌────────────────────────┐  │  │ 活动日期              │ │
│  │ ☑ 张三   男  黄带  一班 │  │ │ [2026-05-25        ] │ │
│  │ ☑ 李四   女  黄带  一班 │  │  └────────────────────────┘ │
│  │ ☐ 王五   男  绿带  二班 │  │  ┌────────────────────────┐ │
│  │ ☐ 赵六   女  白带  二班 │  │  │ 活动名称 *            │ │
│  │    ...                 │  │ │ [暑期集训营        ] │ │
│  └────────────────────────┘  │  └────────────────────────┘ │
│                              │  ┌────────────────────────┐ │
│                              │  │ 活动地点（可选）      │ │
│                              │ │ [市体育中心       ] │ │
│                              │  └────────────────────────┘ │
│                              │  ┌────────────────────────┐ │
│                              │  │ 时长/天（可选）       │ │
│                              │ │ [7                ] │ │
│                              │  └────────────────────────┘ │
│                              │  ┌────────────────────────┐ │
│                              │  │ 备注（可选）          │ │
│                              │ │ [全天封闭式训练   ] │ │
│                              │  └────────────────────────┘ │
│                              │                             │
│                              │  [    📝 批量录入    ]      │
│                              │                             │
└──────────────────────────────┴──────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  📋 集训记录列表（共 X 条）                                   │
│  ┌────────┬──────────┬──────────┬────────┬────────┬────────┐ │
│  │ 学员   │ 活动日期 │ 活动名称 │ 地点   │ 时长   │ 操作   │ │
│  │ 张三   │ 2026-05  │ 暑期集训 │ 市体育 │ 7天    │ 编辑删除│ │
│  │ 李四   │ 2026-05  │ 暑期集训 │ 市体育 │ 7天    │ 编辑删除│ │
│  └────────┴──────────┴──────────┴────────┴────────┴────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Tab 切换**：
- `bg-black/[0.06] rounded-[10px] p-1` 容器
- 每个 Tab：`px-4 py-1.5 rounded-lg text-[14px] font-medium`
  - 激活态：`bg-white shadow-sm text-[#1D1D1F]`
  - 非激活态：`text-[#6E6E73] hover:text-[#1D1D1F]`

**交互流程（集训录入 Tab）**：

1. **筛选学员**：顶部提供班级下拉筛选 + 姓名实时搜索输入框
2. **勾选学员**：表格每行左侧复选框，表头支持"全选/全不选"切换
3. **填写集训信息**：右侧面板统一填写（活动日期默认当天、活动名称必填、活动地点/时长/备注可选）
4. **提交录入**：按钮实时显示"为 N 名学员录入集训信息"，点击后调用 `/api/camp/batch` 批量创建
5. **成功反馈**：Toast 提示成功条数，清空选择态，刷新列表

**学员列表字段**：

| 字段 | 来源 | 说明 |
|------|------|------|
| 复选框 | 本地 state | 选中态控制 |
| 姓名 | Student.name | 文字 |
| 性别 | Student.gender | 男/女 |
| **当前腰带级别** | Grading 表最新记录 | 白/白黄/黄/黄绿/绿/绿蓝/蓝/蓝红/红/红黑/黑，无记录显示"—" |
| 所属班级 | Student.classes | 标签形式展示 |

**集训记录列表字段**：

| 字段 | 说明 |
|------|------|
| 学员姓名 | 关联 Student.name |
| 活动日期 | 格式化：YYYY-MM-DD |
| 活动名称 | 文字 |
| 活动地点 | 文字，空显示"—" |
| 时长（天） | 数字，空显示"—" |
| 操作 | 编辑 / 删除 图标按钮 |

**编辑弹窗**：点击编辑按钮弹出 Dialog，可修改活动日期、活动名称、活动地点、时长、备注，保存后刷新列表。

**删除确认**：点击删除按钮弹出浏览器 `confirm`，确认后调用 `DELETE /api/camp/[id]` 删除。

**批量 API**：`POST /api/camp/batch`

```typescript
// Request Body
{
  items: [
    { studentId: "uuid", activityDate: "2026-05-25", activityName: "暑期集训营", location?: "", duration?: 0, notes?: "" }
  ]
}
```

- 使用 Prisma `$transaction` 保证原子性
- 失败时返回具体失败项及错误原因，成功项不回滚

**单条 API**：`GET/PUT/DELETE /api/camp/[id]`

- `GET`：查询单条集训记录详情
- `PUT`：更新活动日期、活动名称、活动地点、时长、备注
- `DELETE`：删除集训记录

### 6.6 日历/课表页 (`/calendar`)

核心管理页面，以 FullCalendar 为中心。

**页面布局**：
- 左侧边栏（可收起）：快速创建课程表单
- 主区域：FullCalendar 组件
- 顶部工具栏：视图切换（月/周/日）、今天按钮、上/下导航

**月视图交互**：
- 每个日期格内以色块展示课程，色块上显示课程名和时间段
- 点击课程色块 → 右侧滑出课程详情面板，含"编辑"、"删除"、"开始点名"按钮
- 点击日期格空白处 → 右侧滑出创建课程表单，日期自动填充

**课程表单**：
- 新增"所属班级"下拉选择（必填），选择班级后自动关联该班级的学员

**点名流程**：
1. 在课程详情面板点击"开始点名"
2. 弹出点名模态框，展示该课程时间范围内所有在籍学员
3. 每行：学员姓名、剩余课时、状态选择器（5 个状态单选按钮组）
4. 顶部"全部出勤"快捷按钮
5. 底部"提交点名"按钮 → 批量创建考勤记录 + 自动扣减课时

### 6.5 AI 对话页 (`/ai`)

页面布局：全屏聊天界面。

- 顶部：页面标题"AI 助手" + 状态指示器（连接中/就绪）
- 中部：消息滚动区，支持 Markdown 渲染
- 底部：输入框 + 发送按钮 + 快捷指令栏
- 快捷指令示例按钮：
  - "查看今天有什么课"
  - "帮我找一下叫 [姓名] 的学员"
  - "给 [课程名] 点名"
  - "创建一个明天下午3点的常规课"

### 6.6 学员照片采集组件

照片采集组件嵌入在学员表单（新增/编辑）页面中，提供两种照片录入方式：**摄像头拍照**和**本地文件上传**。

#### 6.6.1 照片区域布局

```
┌─────────────────────────────────────────────────────────────┐
│  学员照片                                                    │
│                                                              │
│  ┌──────────────────────────────────────────────┐          │
│  │                                               │          │
│  │           [照片预览区域]                       │          │
│  │                                               │          │
│  │    默认显示占位头像（姓名首字母）               │          │
│  │    拍照/上传后显示实际照片                     │          │
│  │                                               │          │
│  └──────────────────────────────────────────────┘          │
│                                                              │
│  [📷 打开摄像头]  [📁 选择文件]  [🗑 清除照片]              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 6.6.2 照片预览区域

- 尺寸：`w-48 h-48`（192×192px），居中显示
- 圆角：`rounded-[20px]`
- 边框：`border-2 border-dashed border-black/[0.12]`
- 背景：`bg-black/[0.04]`

**无照片状态**：
- 居中显示 `User` 图标 `w-16 h-16 text-[#A1A1A6]`
- 下方文字：`text-[14px] text-[#A1A1A6] mt-2` "暂无照片"

**有照片状态**：
- 显示照片图片 `object-cover w-full h-full rounded-2xl`
- 悬停显示半透明遮罩 + "更换照片" 文字

#### 6.6.3 操作按钮组

三个按钮水平排列，`flex gap-3 justify-center mt-4`

| 按钮 | 图标 | 样式 | 功能 |
|------|------|------|------|
| **打开摄像头** | `Camera` | `bg-[#D9264A] text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90` | 调起系统摄像头 |
| **选择文件** | `FolderOpen` | `bg-black/[0.06] text-[#1D1D1F] px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-black/[0.1]` | 打开文件选择器 |
| **清除照片** | `Trash2` | `text-[#A1A1A6] hover:text-red-500 px-3 py-2 rounded-full hover:bg-red-500/10 transition-colors` | 清除已选照片 |

#### 6.6.4 摄像头拍照流程

点击"打开摄像头"按钮后，弹出模态框进行拍照：

**步骤 1：请求摄像头权限**
- 调用 `navigator.mediaDevices.getUserMedia({ video: true })`
- 用户允许后进入步骤 2
- 用户拒绝：显示提示 "需要摄像头权限才能拍照"

**步骤 2：实时预览**
- 模态框中央显示 `<video>` 元素，实时展示摄像头画面
- 模态框尺寸：`max-w-lg w-full`
- 视频区域：`w-full aspect-[4/3] bg-black rounded-b-[20px] overflow-hidden`
- 底部操作栏：`flex justify-center gap-4 mt-4`
  - "拍照" 按钮：`bg-[#D9264A] text-white w-14 h-14 rounded-full flex items-center justify-center hover:opacity-90`（圆形大按钮，模拟相机快门）
  - "取消" 按钮：`text-[#6E6E73] hover:text-[#1D1D1F] text-[14px] px-4 py-2 rounded-full hover:bg-black/[0.06]`

**步骤 3：拍照确认**
- 点击快门后，视频暂停，展示定格画面
- 底部按钮变为：
  - "重拍"：`bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1] px-4 py-2 rounded-full text-[14px] font-medium flex items-center gap-1`
  - "确认使用"：`bg-[#D9264A] text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90`
- 点击"确认使用"：将视频帧转为 JPEG 文件，关闭模态框，预览区域显示照片
- 点击"重拍"：视频继续播放，回到步骤 2

**视频帧转图片实现**：
```typescript
function capturePhoto(video: HTMLVideoElement): File {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0);
  
  // 转为 JPEG 文件
  const blob = canvas.toBlobSync('image/jpeg', 0.9);
  return new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
}
```

#### 6.6.5 文件上传流程

点击"选择文件"按钮：
- 触发隐藏的 `<input type="file" accept="image/*" />` 点击
- 用户选择图片后：
  1. 使用 `FileReader` 读取为 DataURL
  2. 预览区域显示图片
  3. 文件对象保存在组件 state 中，待表单提交时上传

**图片预览实现**：
```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    setPreviewUrl(event.target?.result as string); // 预览用 DataURL
    setPhotoFile(file); // 保存文件对象，提交时上传
  };
  reader.readAsDataURL(file);
};
```

#### 6.6.6 表单提交时的照片处理

学员表单提交时，照片作为独立的第二步上传：

```typescript
async function handleSubmit(formData: StudentFormData) {
  // 步骤 1：先创建/更新学员记录
  const student = await fetch('/api/students', {
    method: isEdit ? 'PUT' : 'POST',
    body: JSON.stringify(formData)
  }).then(r => r.json());
  
  // 步骤 2：如果有照片文件，上传照片
  if (photoFile && student.id) {
    const uploadForm = new FormData();
    uploadForm.append('file', photoFile);
    uploadForm.append('studentId', student.id);
    
    await fetch('/api/upload', {
      method: 'POST',
      body: uploadForm
    });
  }
  
  // 步骤 3：跳转
  router.push(`/students/${student.id}`);
}
```

#### 6.6.7 已保存照片的展示

编辑学员时，如果学员已有照片（`photoUrl` 不为空）：
- 预览区域显示已有照片：`<img src={student.photoUrl} />`
- "清除照片"按钮可用，点击后删除照片文件并清空 `photoUrl`

### 6.7 数据备份页（`/backup`）

#### 整体布局

```
[面包屑：首页 / 数据备份]
[标题：数据备份与恢复]

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  备份数据                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │   💾 备份当前系统数据                                  │  │
│  │                                                      │  │
│  │   将以下数据打包为 ZIP 文件供下载：                     │  │
│  │   ● PostgreSQL 数据库（所有表结构和数据）               │  │
│  │   ● 学员照片文件（uploads/students/ 目录）              │  │
│  │   ● 备份元数据（时间戳、版本信息）                      │  │
│  │                                                      │  │
│  │              [📥 立即备份]                            │  │
│  │                                                      │  │
│  │   上次备份：2025-01-15 14:30:52（从未备份）            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  恢复数据                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │   📤 从备份文件恢复                                    │  │
│  │                                                      │  │
│  │   上传之前备份的 ZIP 文件，系统将自动恢复：            │  │
│  │   ● 数据库表结构和数据                                 │  │
│  │   ● 学员照片文件                                       │  │
│  │                                                      │  │
│  │   ⚠️ 注意：恢复操作会覆盖当前所有数据，请谨慎操作      │  │
│  │                                                      │  │
│  │   ┌──────────────────────────────────────────────┐  │  │
│  │   │  📁 拖拽 ZIP 文件到此处，或点击选择文件       │  │  │
│  │   │                                               │  │  │
│  │   │  仅接受 .zip 格式的备份文件                    │  │  │
│  │   └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 备份数据卡片

白色卡片，`bg-white rounded-[20px] p-8`

**卡片标题**：`text-[17px] font-semibold text-[#1D1D1F] mb-6 flex items-center gap-2`
- 左侧色条 `w-1 h-5 bg-[#D9264A] rounded-full`
- `HardDrive` 图标 `w-5 h-5 text-[#D9264A] mr-1`
- 文字 "备份数据"

**内容区域**：
- 说明文字 `text-[14px] text-[#6E6E73] mb-6`
- 备份项列表 `space-y-3 mb-8`：
  - 每项 `flex items-center gap-3 text-[14px] text-[#1D1D1F]`
  - 图标 `Database w-4 h-4 text-blue-500` + "PostgreSQL 数据库（所有表结构和数据）"
  - 图标 `Image w-4 h-4 text-green-500` + "学员照片文件（uploads/students/ 目录）"
  - 图标 `FileJson w-4 h-4 text-amber-500` + "备份元数据（时间戳、版本信息）"

**备份按钮**：`bg-[#D9264A] text-white px-6 py-3 rounded-full text-[14px] font-medium hover:opacity-90 flex items-center gap-2 mx-auto`
- 图标 `Download w-4 h-4`
- 文字 "立即备份"
- 加载状态：`Loader2 w-4 h-4 animate-spin` + "备份中..."
- 成功状态：`CheckCircle w-4 h-4` + "备份完成"

**上次备份信息**：`text-[12px] text-[#A1A1A6] mt-4 text-center`
- "上次备份：2025-01-15 14:30:52"
- "从未备份" 时显示灰色文字

#### 恢复数据卡片

白色卡片，`bg-white rounded-[20px] p-8 mt-6`

**卡片标题**：`text-[17px] font-semibold text-[#1D1D1F] mb-6 flex items-center gap-2`
- `Upload` 图标 `w-5 h-5 text-[#D9264A] mr-1`
- 文字 "恢复数据"

**内容区域**：
- 说明文字 `text-[14px] text-[#6E6E73] mb-4`
- **警告提示**：`bg-orange-500/10 rounded-[14px] p-4 mb-6 flex items-start gap-3`
  - `AlertTriangle w-5 h-5 text-orange-500 shrink-0 mt-0.5`
  - `text-[14px] text-orange-600` "恢复操作会覆盖当前所有数据，建议在恢复前先备份当前数据。"

**上传区域**：`border-2 border-dashed border-black/[0.12] rounded-[20px] p-8 text-center hover:border-[#D9264A]/40 hover:bg-[#D9264A]/[0.02] transition-colors cursor-pointer`
- 点击触发隐藏 `<input type="file" accept=".zip" />`
- 拖拽状态：`border-red-500 bg-red-50/30`
- 上传中状态：进度条 `w-full h-1 bg-black/[0.06] rounded-full overflow-hidden mt-4`
  - 进度填充 `h-full bg-[#D9264A] transition-all duration-300`
- 上传完成：`CheckCircle w-8 h-8 text-green-500 mx-auto mb-2`

**确认恢复模态框**（上传 ZIP 后弹出）：
- 标题：`text-[17px] font-semibold text-[#1D1D1F]` "确认恢复数据"
- 内容：
  - 备份信息卡片 `bg-black/[0.04] rounded-[14px] p-4 mb-4`
    - 备份时间、数据库引擎、表列表、照片数量
  - `AlertTriangle w-8 h-8 text-yellow-500 mx-auto mb-3`
  - `text-[14px] text-[#6E6E73] text-center` "此操作将清空当前所有数据并用备份数据替换，是否继续？"
- 操作按钮：
  - "取消"：`bg-black/[0.06] text-[#1D1D1F] px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-black/[0.1]`
  - "确认恢复"：`bg-[#D9264A] text-white px-6 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90`

**恢复进度**（确认后显示）：
- 步骤指示器（3 步）：
  1. 解压备份包（加载动画 → 对勾）
  2. 恢复数据库（进度百分比）
  3. 导入照片文件（文件计数）
- 成功提示：`CheckCircle w-12 h-12 text-green-500 mx-auto mb-3` + "数据恢复成功"
- 失败提示：`XCircle w-12 h-12 text-red-500 mx-auto mb-3` + "恢复失败，已自动回滚"

---

## 7. 项目文件结构

```
taekwondo-crm/
├── app/                            # Next.js App Router
│   ├── api/                        # API 路由
│   │   ├── students/
│   │   │   └── route.ts            # GET/POST 学员列表
│   │   ├── students/[id]/
│   │   │   └── route.ts            # GET/PUT/DELETE 单个学员
│   │   ├── courses/
│   │   │   └── route.ts            # GET/POST 课程列表
│   │   ├── courses/[id]/
│   │   │   └── route.ts            # GET/PUT/DELETE 单个课程
│   │   ├── coaches/
│   │   │   └── route.ts            # GET/POST 教练列表
│   │   ├── coaches/[id]/
│   │   │   └── route.ts            # GET/PUT/DELETE 单个教练
│   │   ├── classes/
│   │   │   └── route.ts            # GET/POST 班级列表
│   │   ├── classes/[id]/
│   │   │   └── route.ts            # GET/PUT/DELETE 单个班级
│   │   ├── attendance/
│   │   │   └── route.ts            # GET/POST 考勤
│   │   ├── attendance/batch/
│   │   │   └── route.ts            # POST 批量点名
│   │   ├── grading/
│   │   │   └── route.ts            # GET/POST 考级记录
│   │   ├── competition/
│   │   │   └── route.ts            # GET/POST 比赛记录
│   │   ├── camp/
│   │   │   └── route.ts            # GET/POST 集训记录
│   │   └── chat/
│   │       └── route.ts            # POST AI 对话
│   ├── page.tsx                    # 仪表盘首页
│   ├── layout.tsx                  # 根布局（侧边栏导航）
│   ├── globals.css                 # 全局样式
│   ├── students/
│   │   ├── page.tsx                # 学员列表页
│   │   ├── new/
│   │   │   └── page.tsx            # 新增学员页
│   │   └── [id]/
│   │       ├── page.tsx            # 学员详情页（只读展示）
│   │       └── edit/
│   │           └── page.tsx        # 编辑学员页
│   ├── calendar/
│   │   └── page.tsx                # 日历/课表页
│   ├── attendance/
│   │   └── page.tsx                # 考勤查询页
│   ├── coaches/
│   │   ├── page.tsx                # 教练列表页
│   │   ├── new/
│   │   │   └── page.tsx            # 新增教练页
│   │   └── [id]/
│   │       ├── page.tsx            # 教练详情页（只读展示）
│   │       └── edit/
│   │           └── page.tsx        # 编辑教练页
│   ├── classes/
│   │   ├── page.tsx                # 班级列表页
│   │   ├── new/
│   │   │   └── page.tsx            # 新增班级页
│   │   └── [id]/
│   │       ├── page.tsx            # 班级详情页（只读展示）
│   │       └── edit/
│   │           └── page.tsx        # 编辑班级页
│   ├── ai/
│   │   └── page.tsx                # AI 对话页
│   ├── backup/
│   │   └── page.tsx                # 数据备份与恢复页
│   └── api/
│       └── backup/
│           └── route.ts            # GET 导出备份 / POST 导入备份
├── components/                     # 可复用组件
│   ├── ui/                         # shadcn/ui 组件
│   ├── layout/
│   │   ├── sidebar.tsx             # 侧边栏导航
│   │   └── header.tsx              # 顶部导航栏
│   ├── students/
│   │   ├── student-form.tsx        # 学员表单（新增/编辑共用）
│   │   ├── student-table.tsx       # 学员表格
│   │   ├── student-detail-card.tsx # 详情页顶部信息卡
│   │   ├── student-timeline.tsx    # 成长时间线
│   │   ├── student-stats.tsx       # 考勤统计图表
│   │   └── photo-capture.tsx       # 摄像头拍照 + 文件上传组件
│   ├── coaches/
│   │   ├── coach-form.tsx          # 教练表单（新增/编辑共用）
│   │   ├── coach-table.tsx         # 教练表格
│   │   ├── coach-detail-card.tsx   # 教练详情页信息卡
│   │   └── coach-courses.tsx       # 教练所授课程列表
│   ├── classes/
│   │   ├── class-form.tsx          # 班级表单（新增/编辑共用）
│   │   ├── class-table.tsx         # 班级表格
│   │   └── class-detail-card.tsx   # 班级详情页信息卡
│   ├── calendar/
│   ├── calendar/
│   │   ├── course-calendar.tsx     # FullCalendar 封装
│   │   ├── course-form.tsx         # 课程表单
│   │   ├── course-detail-panel.tsx # 课程详情侧板
│   │   └── attendance-modal.tsx    # 点名模态框
│   └── ai/
│       └── chat-interface.tsx      # 聊天界面组件
├── lib/                            # 工具函数与配置
│   ├── prisma.ts                   # Prisma Client 单例
│   ├── ai-model.ts                 # AI 模型路由（Provider Registry）
│   ├── utils.ts                    # 通用工具函数
│   └── ai-tools.ts                 # AI 工具函数封装（DB 操作）
├── prisma/                         # Prisma 配置
│   ├── schema.prisma               # 数据库 Schema 定义
│   └── migrations/                 # 数据库迁移文件
├── hooks/                          # 自定义 React Hooks
│   ├── use-students.ts             # 学员数据查询
│   ├── use-courses.ts              # 课程数据查询
│   └── use-attendance.ts           # 考勤数据查询
├── types/                          # TypeScript 类型定义
│   └── index.ts
├── public/                         # 静态资源
├── .env.local                      # 环境变量（API Key 等）
├── next.config.js                  # Next.js 配置
├── tailwind.config.ts              # Tailwind 配置
├── tsconfig.json                   # TypeScript 配置
└── package.json
```

---

## 8. 核心开发要点

### 8.1 Prisma Client 单例

Next.js 开发环境下模块热重载会导致 Prisma Client 多次实例化，必须使用单例模式：

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

所有 API route 直接导入 `prisma` 实例即可使用，无需额外连接逻辑：

```typescript
import { prisma } from '@/lib/prisma';

// 直接使用
const students = await prisma.student.findMany();
```

### 8.2 数据查询与关联填充

学员详情页需要聚合多条关联数据，Prisma 的 `include` 自动处理 JOIN：

```typescript
const student = await prisma.student.findUnique({
  where: { id },
  include: {
    gradings: { orderBy: { examDate: 'desc' } },
    competitions: { orderBy: { competitionDate: 'desc' } },
    camps: { orderBy: { activityDate: 'desc' } },
    attendances: {
      orderBy: { attendanceDate: 'desc' },
      take: 10,
      include: { course: { select: { title: true } } }
    }
  }
});
```

### 8.3 事务处理（点名操作）

点名时需要保证"创建考勤记录 + 扣减课时"的原子性：

```typescript
await prisma.$transaction([
  // 1. 批量创建/更新考勤记录
  prisma.attendance.createMany({
    data: records,
    skipDuplicates: true
  }),
  // 2. 扣减课时（present/late 的学员）
  prisma.student.updateMany({
    where: { id: { in: presentIds }, remainingSessions: { gt: 0 } },
    data: { remainingSessions: { decrement: 1 } }
  })
]);
// 两步要么都成功，要么都回滚
```

### 8.4 文件上传与照片存储

学员照片采用**本地文件系统存储**方案，保存在 `public/uploads/students/` 目录下，PostgreSQL 只存相对路径。

#### 8.4.1 存储目录结构

```
public/
└── uploads/
    └── students/
        ├── abc-123.jpg    # 学员照片（文件名使用 studentId）
        ├── def-456.jpg
        └── ...
```

**目录初始化**：项目启动时自动创建目录（API Route 中检查并创建）。

#### 8.4.2 文件上传 API（`/api/upload`）

```typescript
// app/api/upload/route.ts
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextRequest } from 'next/server';
import { existsSync } from 'fs';

// 上传配置：支持学员(students)和教练(coaches)两种类型
const UPLOAD_CONFIG = {
  student: { dir: 'students', modelField: 'studentId', table: 'student' },
  coach:   { dir: 'coaches',   modelField: 'coachId',   table: 'coach'   }
} as const;
type UploadType = keyof typeof UPLOAD_CONFIG;

function getUploadDir(type: UploadType) {
  return join(process.cwd(), 'public', 'uploads', UPLOAD_CONFIG[type].dir);
}

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

// POST /api/upload —— 上传照片（支持学员和教练）
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const id = formData.get('id') as string;
    const type = (formData.get('type') as UploadType) || 'student';
    
    if (!file || !id) {
      return Response.json({ error: '缺少文件或ID' }, { status: 400 });
    }
    
    if (!UPLOAD_CONFIG[type]) {
      return Response.json({ error: '无效的上传类型' }, { status: 400 });
    }
    
    // 校验文件类型
    if (!file.type.startsWith('image/')) {
      return Response.json({ error: '仅支持图片文件' }, { status: 400 });
    }
    
    // 校验文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: '文件大小不能超过 5MB' }, { status: 400 });
    }
    
    const config = UPLOAD_CONFIG[type];
    const uploadDir = getUploadDir(type);
    await ensureDir(uploadDir);
    
    // 写入文件
    const ext = 'jpg';
    const filename = `${id}.${ext}`;
    const filepath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
    
    // 返回可访问的 URL
    const photoUrl = `/uploads/${config.dir}/${filename}`;
    
    // 更新数据库记录
    if (type === 'student') {
      await prisma.student.update({ where: { id }, data: { photoUrl } });
    } else {
      await prisma.coach.update({ where: { id }, data: { photoUrl } });
    }
    
    return Response.json({ success: true, photoUrl });
  } catch (err) {
    console.error('上传失败:', err);
    return Response.json({ error: '上传失败' }, { status: 500 });
  }
}

// DELETE /api/upload —— 删除照片
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = (searchParams.get('type') as UploadType) || 'student';
    
    if (!id) {
      return Response.json({ error: '缺少ID' }, { status: 400 });
    }
    
    const config = UPLOAD_CONFIG[type];
    const filename = `${id}.jpg`;
    const filepath = join(getUploadDir(type), filename);
    
    // 删除文件（忽略文件不存在的错误）
    try { await unlink(filepath); } catch { /* 忽略 */ }
    
    // 清空数据库记录
    if (type === 'student') {
      await prisma.student.update({ where: { id }, data: { photoUrl: null } });
    } else {
      await prisma.coach.update({ where: { id }, data: { photoUrl: null } });
    }
    
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: '删除失败' }, { status: 500 });
  }
}
```

#### 8.4.3 学员删除时级联删除照片

```typescript
// 删除学员时同步删除照片文件
async function deleteStudentWithPhoto(studentId: string) {
  const student = await prisma.student.findUnique({ 
    where: { id: studentId },
    select: { photoUrl: true }
  });
  
  // 1. 软删除学员
  await prisma.student.update({
    where: { id: studentId },
    data: { status: 'inactive' }
  });
  
  // 2. 异步删除照片文件（失败不影响主业务）
  if (student?.photoUrl) {
    const filepath = join(process.cwd(), 'public', student.photoUrl);
    unlink(filepath).catch(() => {}); // 静默忽略错误
  }
}
```

#### 8.4.4 Docker 持久化注意事项

使用 Docker 部署时，`public/uploads` 目录必须挂载到宿主机，否则容器重启后照片丢失：

```yaml
# docker-compose.yml（生产部署补充）
services:
  app:
    # ...
    volumes:
      - ./uploads:/app/public/uploads  # 照片持久化
```

### 8.5 AI Agent 流式响应

AI 对话接口必须使用流式响应，以提供良好的交互体验：

```typescript
// 服务端：返回流
return result.toDataStreamResponse();

// 客户端：useChat 自动处理流式消费
const { messages, input, handleInputChange, handleSubmit } = useChat();
```

### 8.6 错误处理

API 层统一错误响应格式：

```typescript
// 统一错误响应
return Response.json({ error: '学员不存在' }, { status: 404 });
return Response.json({ error: '数据库操作失败', detail: err.message }, { status: 500 });
```

### 8.7 数据备份与导入实现

#### 8.7.1 备份导出 API（`GET /api/backup`）

备份导出使用 `pg_dump` 命令行工具导出数据库，使用 `archiver` 库打包 ZIP。

```typescript
// app/api/backup/route.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { createWriteStream, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import archiver from 'archiver';
import { NextRequest } from 'next/server';

const execAsync = promisify(exec);
const BACKUP_DIR = join(process.cwd(), 'tmp', 'backup');
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads', 'students');

// GET /api/backup —— 导出全量数据为 ZIP
export async function GET() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupId = `taekwondo-backup-${timestamp}`;
    const workDir = join(BACKUP_DIR, backupId);
    
    // 1. 创建工作目录
    mkdirSync(join(workDir, 'backup', 'db'), { recursive: true });
    mkdirSync(join(workDir, 'backup', 'uploads', 'students'), { recursive: true });
    
    // 2. 使用 pg_dump 导出数据库
    const dbUrl = process.env.DATABASE_URL!;
    const sqlPath = join(workDir, 'backup', 'db', 'taekwondo_backup.sql');
    await execAsync(`pg_dump "${dbUrl}" > "${sqlPath}"`);
    
    // 3. 复制照片文件
    if (existsSync(UPLOADS_DIR)) {
      const files = readdirSync(UPLOADS_DIR);
      for (const file of files) {
        const src = join(UPLOADS_DIR, file);
        const dest = join(workDir, 'backup', 'uploads', 'students', file);
        // 使用流复制避免大文件占用内存
        const { pipeline } = require('stream/promises');
        const { createReadStream, createWriteStream } = require('fs');
        await pipeline(createReadStream(src), createWriteStream(dest));
      }
    }
    
    // 4. 生成 manifest.json
    const photoCount = existsSync(UPLOADS_DIR) ? readdirSync(UPLOADS_DIR).length : 0;
    const manifest = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      dbEngine: 'postgresql',
      tables: ['students', 'coaches', 'classes', 'courses', 'attendances', 'gradings', 'competitions', 'camps'],
      photoCount,
      appVersion: '1.0.0'
    };
    require('fs').writeFileSync(
      join(workDir, 'backup', 'backup-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    // 5. 打包 ZIP
    const zipPath = join(BACKUP_DIR, `${backupId}.zip`);
    await new Promise<void>((resolve, reject) => {
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 6 } });
      
      output.on('close', () => resolve());
      archive.on('error', reject);
      archive.on('warning', (err: any) => { if (err.code !== 'ENOENT') reject(err); });
      
      archive.pipe(output);
      archive.directory(join(workDir, 'backup'), false);
      archive.finalize();
    });
    
    // 6. 读取 ZIP 并返回流（下载完成后清理临时文件）
    const { readFileSync, unlinkSync, rmSync } = require('fs');
    const zipBuffer = readFileSync(zipPath);
    
    // 异步清理临时文件
    setTimeout(() => {
      try { unlinkSync(zipPath); } catch {}
      try { rmSync(workDir, { recursive: true }); } catch {}
    }, 60000);
    
    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${backupId}.zip"`,
        'Content-Length': zipBuffer.length.toString()
      }
    });
  } catch (err) {
    console.error('备份失败:', err);
    return Response.json({ error: '备份失败: ' + (err as Error).message }, { status: 500 });
  }
}
```

**环境要求**：`pg_dump` 命令必须在系统 PATH 中可用。Docker 部署时可在容器内安装 PostgreSQL 客户端：

```dockerfile
# Dockerfile 补充
RUN apk add --no-cache postgresql-client
```

#### 8.7.2 备份导入 API（`POST /api/backup`）

```typescript
// app/api/backup/route.ts（续）
import { createWriteStream, mkdirSync, existsSync, createReadStream } from 'fs';
import { join } from 'path';
import { unzip } from 'decompress';
import { pipeline } from 'stream/promises';

const RESTORE_DIR = join(process.cwd(), 'tmp', 'restore');

// POST /api/backup —— 导入备份 ZIP
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json({ error: '缺少文件' }, { status: 400 });
    }
    
    // 1. 校验文件类型
    if (!file.name.endsWith('.zip')) {
      return Response.json({ error: '仅接受 .zip 格式的备份文件' }, { status: 400 });
    }
    
    // 2. 保存上传的 ZIP
    const timestamp = Date.now();
    const workDir = join(RESTORE_DIR, `restore-${timestamp}`);
    mkdirSync(workDir, { recursive: true });
    
    const zipPath = join(workDir, 'backup.zip');
    const bytes = await file.arrayBuffer();
    require('fs').writeFileSync(zipPath, Buffer.from(bytes));
    
    // 3. 解压 ZIP
    const extractDir = join(workDir, 'extracted');
    mkdirSync(extractDir, { recursive: true });
    await unzip(zipPath, extractDir);
    
    // 4. 校验 manifest
    const manifestPath = join(extractDir, 'backup-manifest.json');
    if (!existsSync(manifestPath)) {
      return Response.json({ error: '无效的备份文件：缺少 backup-manifest.json' }, { status: 400 });
    }
    const manifest = JSON.parse(require('fs').readFileSync(manifestPath, 'utf-8'));
    
    // 5. 导入 PostgreSQL 数据
    const dbUrl = process.env.DATABASE_URL!;
    const sqlPath = join(extractDir, 'db', 'taekwondo_backup.sql');
    
    if (existsSync(sqlPath)) {
      // 先清空现有数据（谨慎操作）
      await execAsync(`psql "${dbUrl}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`);
      // 执行 SQL 恢复
      await execAsync(`psql "${dbUrl}" < "${sqlPath}"`);
    }
    
    // 6. 导入照片文件
    const backupUploadsDir = join(extractDir, 'uploads', 'students');
    if (existsSync(backupUploadsDir)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
      const files = require('fs').readdirSync(backupUploadsDir);
      for (const file of files) {
        const src = join(backupUploadsDir, file);
        const dest = join(UPLOADS_DIR, file);
        await pipeline(createReadStream(src), createWriteStream(dest));
      }
    }
    
    // 7. 清理临时文件
    setTimeout(() => {
      try { require('fs').rmSync(workDir, { recursive: true }); } catch {}
    }, 30000);
    
    return Response.json({
      success: true,
      message: '数据恢复成功',
      restoredTables: manifest.tables,
      photoCount: manifest.photoCount || 0
    });
  } catch (err) {
    console.error('导入失败:', err);
    return Response.json({ error: '导入失败: ' + (err as Error).message }, { status: 500 });
  }
}
```

**安全策略**：
- 导入前先自动备份当前数据（调用 GET /api/backup 生成当前快照）
- SQL 导入使用 `DROP SCHEMA public CASCADE` 清空后重建，确保数据一致性
- 临时文件 30 秒后自动清理
- 大文件使用流式处理，避免内存溢出

#### 8.7.3 客户端下载与上传实现

**备份下载（客户端）**：
```typescript
// hooks/use-backup.ts
export async function exportBackup() {
  const response = await fetch('/api/backup');
  if (!response.ok) throw new Error('备份失败');
  
  // 从响应头获取文件名
  const disposition = response.headers.get('Content-Disposition');
  const filename = disposition?.match(/filename="(.+)"/)?.[1] || 'backup.zip';
  
  // 创建下载链接
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
```

**备份上传（客户端）**：
```typescript
export async function importBackup(file: File, onProgress?: (percent: number) => void) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/backup', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '导入失败');
  }
  
  return response.json();
}
```

---

## 9. 实施路线图

### Phase 1：基础框架搭建（第 1 周）

| 任务 | 产出 |
|------|------|
| 初始化 Next.js 15 项目 + shadcn/ui | 可运行的空项目 |
| 配置 Docker Compose + Prisma Schema | PostgreSQL 容器 + 数据库迁移 |
| 搭建页面路由与侧边栏导航 | 所有页面路由可访问 |
| 编写 .env.local 模板 | 环境变量配置文档 |

### Phase 2：学员管理模块（第 2 周）

| 任务 | 产出 |
|------|------|
| 学员 CRUD API 路由 | 完整的学员 API |
| 学员列表页（表格 + 搜索 + 分页） | 可操作的列表界面 |
| 学员表单页（新增/编辑） | 表单验证与提交 |
| 学员详情页（只读展示） | 美观的信息展示页 |

### Phase 3：课表与考勤模块（第 2-3 周）

| 任务 | 产出 |
|------|------|
| 课程 CRUD API 路由 | 完整的课程 API |
| FullCalendar 集成与课程展示 | 日历视图可交互 |
| 考勤 API 与点名功能 | 点名流程可闭环 |
| 考勤查询页 | 按学员/课程查询 |

### Phase 4：成长记录模块（第 3 周）

| 任务 | 产出 |
|------|------|
| 考级/比赛/集训 API 路由 | 三个模块的 API |
| 学员详情页接入成长数据 | 时间线 + 表格 + 卡片 |
| 各记录的管理入口 | 增删改查界面 |

### Phase 5：AI Agent 模块（第 3-4 周）

| 任务 | 产出 |
|------|------|
| 配置多提供商 AI SDK（Provider Registry）| AI SDK 可调用任意模型 |
| 定义并实现 AI 工具集 | 学员/课程/考勤工具 |
| 开发 AI 对话页面 | 聊天界面可交互 |
| 测试 AI 工具调用的准确率 | 工具调用稳定 |

### Phase 6：数据备份与收尾（第 4 周）

| 任务 | 产出 |
|------|------|
| 仪表盘首页统计卡片 | 数据概览 |
| 备份/导入 API 实现（pg_dump + archiver） | 一键导出 ZIP、上传恢复 |
| 备份管理页面 UI | 备份下载按钮 + ZIP 上传导入区 |
| 全局测试与 Bug 修复 | 系统稳定运行 |
| 部署文档编写 | README + 部署指南 |

---

## 10. 技术依赖清单

### 核心依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `next` | ^15 | Next.js 框架 |
| `react` / `react-dom` | ^19 | React 核心 |
| `@prisma/client` | ^6 | Prisma ORM 客户端，自动生成类型 |
| `prisma` | ^6 | Prisma CLI，迁移与代码生成 |
| `ai` | ^4 | Vercel AI SDK 核心（streamText、tool、Provider Registry） |
| `@ai-sdk/openai` | ^1 | OpenAI Provider（必选，同时用于兼容 OpenAI API 的第三方服务） |
| `@ai-sdk/anthropic` | ^1 | Anthropic Claude Provider（可选） |
| `@ai-sdk/google` | ^1 | Google Gemini Provider（可选） |
| `@ai-sdk/deepseek` | ^1 | DeepSeek Provider（可选） |
| `@ai-sdk/groq` | ^1 | Groq Provider（可选，高速推理） |
| `zod` | ^3 | Schema 校验（AI 工具参数 + API 入参） |
| `archiver` | ^7 | ZIP 打包（数据备份导出） |
| `decompress` | ^4 | ZIP 解压（数据备份导入） |

### UI 依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `@fullcalendar/react` | ^6 | 日历组件 |
| `@fullcalendar/daygrid` | ^6 | 月视图 |
| `@fullcalendar/timegrid` | ^6 | 周/日视图 |
| `@fullcalendar/interaction` | ^6 | 拖拽/点击交互 |
| `@tanstack/react-table` | ^8 | 数据表格 |
| `recharts` | ^2 | 图表 |
| `lucide-react` | ^0.400 | 图标库 |
| `class-variance-authority` | ^0.7 | shadcn 依赖 |
| `clsx` / `tailwind-merge` | latest | 样式工具 |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `typescript` | ^5 | 类型系统 |
| `@types/react` / `@types/node` | ^19 / ^20 | 类型定义 |
| `tailwindcss` | ^3 | 原子化 CSS |
| `eslint` / `eslint-config-next` | ^9 | 代码检查 |

---

## 11. 安装与启动指南

### 11.1 环境准备

- Node.js 18+
- Docker + Docker Compose
- 至少一个 LLM 提供商的 API Key（OpenAI / Anthropic / Google / DeepSeek / Groq 等）

### 11.2 安装步骤

```bash
# 1. 创建 Next.js 项目（使用 shadcn 初始化）
echo "my-app" | npx shadcn@latest init --yes --template next --base-color slate

cd my-app

# 2. 安装核心依赖（Prisma + AI SDK + 所需的 Provider）
npm install @prisma/client ai @ai-sdk/openai zod
npm install -D prisma

# 按需安装其他 LLM Provider（可选，用不到的可不装）
npm install @ai-sdk/anthropic @ai-sdk/google @ai-sdk/deepseek @ai-sdk/groq

# 3. 安装 UI 依赖
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid \
  @fullcalendar/interaction @tanstack/react-table recharts lucide-react

# 4. 安装备份相关依赖
npm install archiver decompress

# 5. 创建 Prisma Schema 文件（将上文 Schema 写入 prisma/schema.prisma）
mkdir -p prisma

# 6. 创建 Docker Compose 配置
cat > docker-compose.yml << 'EOF'
version: "3.8"
services:
  postgres:
    image: postgres:16-alpine
    container_name: taekwondo-db
    environment:
      POSTGRES_USER: taekwondo
      POSTGRES_PASSWORD: taekwondo123
      POSTGRES_DB: taekwondo_crm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taekwondo -d taekwondo_crm"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  postgres_data:
EOF

# 7. 确保本地环境安装 PostgreSQL 客户端（pg_dump 命令需要）
# macOS: brew install libpq
# Ubuntu/Debian: sudo apt-get install postgresql-client
# Docker 部署时见下方 Dockerfile 配置

# 8. 启动 PostgreSQL 容器
docker-compose up -d

# 9. 配置环境变量
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://taekwondo:taekwondo123@localhost:5432/taekwondo_crm"

# AI 模型选择（格式：provider:model-id）
MODEL=openai:gpt-4o

# 至少配置一个可用的 API Key
OPENAI_API_KEY=sk-your-openai-api-key-here
# ANTHROPIC_API_KEY=sk-ant-your-key
# GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
# DEEPSEEK_API_KEY=your-deepseek-key
# GROQ_API_KEY=gsk-your-groq-key
EOF

# 10. 执行数据库迁移（生成表结构）
npx prisma migrate dev --name init

# 11. 生成 Prisma Client 类型
npx prisma generate

# 12. 启动开发服务器
npm run dev
```

### 11.3 生产部署

推荐使用 **Vercel + Supabase** 组合部署：

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 在 Vercel Dashboard 中链接 Supabase 项目（自动配置 DATABASE_URL）

# 3. 配置环境变量（Vercel Dashboard → Project Settings → Environment Variables）
#    DATABASE_URL = postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
#    MODEL = openai:gpt-4o        （或 anthropic:claude-3-5-sonnet 等）
#    OPENAI_API_KEY = sk-your-key （根据 MODEL 的值配置对应的 Key）

# 4. 部署
vercel --prod
```

Supabase 提供免费的 PostgreSQL 托管，与 Vercel 集成可自动配置连接字符串。

### Docker 部署（推荐用于数据备份功能）

由于备份功能依赖 `pg_dump` 和 `psql` 命令，Docker 部署时需要确保容器内有 PostgreSQL 客户端：

```dockerfile
# Dockerfile
FROM node:20-alpine

# 安装 PostgreSQL 客户端（pg_dump / psql）
RUN apk add --no-cache postgresql-client

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.prod.yml（生产环境）
version: "3.8"
services:
  app:
    build: .
    container_name: taekwondo-app
    restart: unless-stopped
    environment:
      DATABASE_URL: "postgresql://taekwondo:taekwondo123@postgres:5432/taekwondo_crm"
      MODEL: "openai:gpt-4o"
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/public/uploads  # 照片持久化（关键！）
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    container_name: taekwondo-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: taekwondo
      POSTGRES_PASSWORD: taekwondo123
      POSTGRES_DB: taekwondo_crm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**重要**：`./uploads:/app/public/uploads` 挂载必须配置，否则容器重启后照片数据将丢失。

---

## 12. 风险评估与应对

| 风险点 | 影响 | 应对方案 |
|--------|------|----------|
| LLM API 调用延迟/失败 | AI 功能不可用 | 所有 AI 操作均有对应的手动操作入口，API 失败时降级提示；支持切换备用提供商 |
| 身份证号敏感数据泄露 | 合规风险 | 使用对称加密存储（如 `crypto` 模块），数据库中不存明文 |
| 并发点名导致课时扣减不一致 | 数据错乱 | 使用 PostgreSQL 事务（`$transaction`）保证原子性 |
| 数据库连接泄漏 | 服务不可用 | Prisma Client 单例模式 + 连接池自动管理 |
| 备份导入覆盖误操作 | 数据丢失 | 导入前自动备份当前数据；二次确认弹窗；导入失败自动回滚 |
| Docker 容器重启照片丢失 | 数据丢失 | 必须挂载 `uploads` 目录到宿主机持久化存储 |
| pg_dump / psql 命令缺失 | 备份功能不可用 | Docker 镜像内置 postgresql-client；本地开发需安装 PostgreSQL 客户端 |

---

## 13. 附录

### 13.1 带位级别对照表

| 英文标识 | 中文名 | 级别序号 |
|----------|--------|----------|
| `white` | 白带 | 10 级 |
| `white-yellow` | 白黄带 | 9 级 |
| `yellow` | 黄带 | 8 级 |
| `yellow-green` | 黄绿带 | 7 级 |
| `green` | 绿带 | 6 级 |
| `green-blue` | 绿蓝带 | 5 级 |
| `blue` | 蓝带 | 4 级 |
| `blue-red` | 蓝红带 | 3 级 |
| `red` | 红带 | 2 级 |
| `red-black` | 红黑带 | 1 级 |
| `black` | 黑带 | 段 |

### 13.2 状态颜色编码

| 状态 | 颜色 | Tailwind 类 |
|------|------|-------------|
| 在籍 (active) | 绿色 | `bg-green-100 text-green-800` |
| 已结业 (inactive) | 灰色 | `bg-gray-100 text-gray-800` |
| 暂停 (suspended) | 橙色 | `bg-orange-100 text-orange-800` |
| 出勤 (present) | 绿色 | `bg-green-500` |
| 缺勤 (absent) | 红色 | `bg-red-500` |
| 迟到 (late) | 橙色 | `bg-orange-500` |
| 请假 (leave) | 蓝色 | `bg-blue-500` |

---

**文档版本**：v1.0  
**编写日期**：2026-05-22  
**适用项目**：跆拳道馆 CRM 系统
