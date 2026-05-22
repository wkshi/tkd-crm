# 跆拳道馆 CRM 系统 —— UI 设计文档

## 1. 设计理念

### 1.1 设计目标

为跆拳道馆打造一套**专业、沉稳、高效**的管理界面。视觉风格参考现代 SaaS 仪表盘，融入跆拳道运动的**力量感与仪式感**，让管理员和教练能快速完成操作，同时让学员/家长在查看详情页时感受到道馆的专业品质。

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **效率优先** | 高频操作（点名、查学员）三步以内可达，表格信息密度适中 |
| **视觉清晰** | 状态通过颜色+图标双重编码，数据层级分明，不堆砌装饰 |
| **跆拳道基因** | 黑红金配色贯穿全局，圆角克制（以锐利小圆角体现力量感），留白有度 |
| **一致性** | 所有页面共享同一套设计系统，交互模式统一，降低学习成本 |

---

## 2. 设计系统（Design System）

### 2.1 色彩体系

#### 主色调（Primary）

| 名称 | 色值 | Tailwind 类 | 用途 |
|------|------|-------------|------|
| **道馆黑** | `#1A1A2E` | `bg-slate-900` / `text-slate-900` | 侧边栏背景、顶部栏、主标题文字 |
| **道馆红** | `#DC2626` | `bg-red-600` / `text-red-600` | 强调色、主按钮、危险操作、激活状态 |
| **道馆红深** | `#B91C1C` | `bg-red-700` | 按钮悬停、主色调加深 |
| **道馆红浅** | `#FEE2E2` | `bg-red-50` | 红色背景浅底、高亮区域 |

#### 中性色（Neutral）

| 名称 | 色值 | Tailwind 类 | 用途 |
|------|------|-------------|------|
| **背景浅灰** | `#F8FAFC` | `bg-slate-50` | 页面底层背景 |
| **卡片白** | `#FFFFFF` | `bg-white` | 卡片、模态框、面板背景 |
| **边框灰** | `#E2E8F0` | `border-slate-200` | 卡片边框、分割线、表头下划线 |
| **文字主色** | `#334155` | `text-slate-700` | 正文、表格数据 |
| **文字次要** | `#64748B` | `text-slate-500` | 辅助文字、占位符、时间戳 |
| **文字禁用** | `#94A3B8` | `text-slate-400` | 禁用状态、非常次要信息 |

#### 功能色（Semantic）

| 状态 | 色值 | Tailwind 类 | 用途 |
|------|------|-------------|------|
| **成功/出勤** | `#16A34A` | `text-green-600` / `bg-green-50` | 在籍状态、出勤标记、成功提示 |
| **警告** | `#EAB308` | `text-yellow-600` / `bg-yellow-50` | 暂停状态、到期预警、课时不足 |
| **危险/缺勤** | `#DC2626` | `text-red-600` / `bg-red-50` | 缺勤标记、删除操作、已过期 |
| **信息/请假** | `#2563EB` | `text-blue-600` / `bg-blue-50` | 请假标记、提示信息 |
| **次要/迟到** | `#F97316` | `text-orange-500` / `bg-orange-50` | 迟到标记、次要警示 |

#### 强调色（Accent）

| 名称 | 色值 | Tailwind 类 | 用途 |
|------|------|-------------|------|
| **道馆金** | `#D97706` | `text-amber-600` / `bg-amber-50` | 成就徽章、带位晋升高亮、重要数据 |
| **道馆金浅** | `#FEF3C7` | `bg-amber-100` | 金色背景底、VIP/优秀标识 |

### 2.2 字体系统

| 层级 | 字号 | 字重 | 行高 | 字间距 | Tailwind 类 | 用途 |
|------|------|------|------|--------|-------------|------|
| **Display** | 28px | 700 | 1.2 | -0.02em | `text-3xl font-bold` | 页面大标题（仪表盘标题） |
| **H1** | 22px | 600 | 1.3 | -0.01em | `text-2xl font-semibold` | 模块标题、学员姓名 |
| **H2** | 18px | 600 | 1.4 | 0 | `text-lg font-semibold` | 卡片标题、分区标题 |
| **H3** | 15px | 600 | 1.4 | 0 | `text-base font-semibold` | 小标题、表头 |
| **Body** | 14px | 400 | 1.6 | 0 | `text-sm` | 正文、表格内容 |
| **Caption** | 12px | 400 | 1.5 | 0 | `text-xs` | 辅助说明、时间戳、标签 |

**字体栈**：`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`

> 英文/数字使用 Inter，中文回退到系统字体，保证代码编号和数据的等宽对齐感。

### 2.3 间距系统

基于 4px 的基数（Tailwind 默认）：

| 令牌 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| `space-1` | 4px | `p-1` / `m-1` | 图标与文字的紧间距 |
| `space-2` | 8px | `p-2` / `gap-2` | 按钮内边距、小间距 |
| `space-3` | 12px | `p-3` | 表单控件内边距 |
| `space-4` | 16px | `p-4` / `gap-4` | 卡片内边距、常规间距 |
| `space-6` | 24px | `p-6` / `gap-6` | 模块间间距 |
| `space-8` | 32px | `p-8` / `gap-8` | 页面级间距 |
| `space-10` | 40px | `p-10` | 大模块间距 |

**页面布局间距**：
- 页面主体 padding：`px-6 py-6`（24px 左右，24px 上下）
- 卡片网格 gap：`gap-6`（24px）
- 卡片内部 padding：`p-6`（24px）
- 表单字段间距：`space-y-4`（16px）

### 2.4 圆角系统

| 令牌 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| `radius-sm` | 4px | `rounded` | 按钮、标签、输入框 |
| `radius-md` | 8px | `rounded-lg` | 卡片、下拉面板 |
| `radius-lg` | 12px | `rounded-xl` | 大卡片、模态框 |
| `radius-xl` | 16px | `rounded-2xl` | 特殊容器、照片预览区 |
| `radius-full` | 9999px | `rounded-full` | 头像、状态点、圆形按钮 |

### 2.5 阴影系统

| 令牌 | Tailwind | 用途 |
|------|----------|------|
| `shadow-sm` | `shadow-sm` | 卡片默认状态、输入框 |
| `shadow-md` | `shadow-md` | 卡片悬停、下拉面板、浮动元素 |
| `shadow-lg` | `shadow-lg` | 模态框、抽屉面板 |
| `shadow-xl` | `shadow-xl` | 全屏覆盖层、重要弹窗 |

### 2.6 动画与过渡

| 场景 | 过渡效果 | Tailwind |
|------|----------|----------|
| 按钮悬停 | 背景色 150ms + 轻微上浮 | `transition-all duration-150 hover:-translate-y-0.5` |
| 卡片悬停 | 阴影加深 200ms | `transition-shadow duration-200 hover:shadow-md` |
| 页面切换 | 淡入 200ms | `animate-in fade-in duration-200` |
| 模态框弹出 | 淡入 + 轻微上滑 200ms | `animate-in fade-in slide-in-from-bottom-4 duration-200` |
| 侧边栏展开 | 宽度 300ms ease-in-out | `transition-all duration-300 ease-in-out` |
| 数据加载 | 骨架屏脉冲 | `animate-pulse` |
| Toast 通知 | 从右滑入 300ms，停留 3s 后滑出 | `animate-in slide-in-from-right duration-300` |
| 照片预览切换 | 淡入 150ms | `transition-opacity duration-150` |
| 摄像头模态框 | 从底部滑入 300ms | `animate-in slide-in-from-bottom duration-300` |

---

## 3. 全局布局架构

### 3.1 整体页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ 顶部栏 (Header)  高度 56px                                   │
│  [Logo]  [页面标题]                    [通知] [设置] [头像]   │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                    │
│ 侧边栏   │              页面主体 (Main Content)               │
│ (Sidebar)│              px-6 py-6, bg-slate-50               │
│ 宽度 220px│                                                   │
│ 折叠 64px│              [面包屑导航]                          │
│          │              [页面标题 + 操作按钮]                  │
│          │                                                    │
│          │              ┌────────────────────┐               │
│          │              │   内容区域          │               │
│          │              │   (卡片/表格/表单)  │               │
│          │              └────────────────────┘               │
│          │                                                    │
└──────────┴──────────────────────────────────────────────────┘
```

### 3.2 侧边栏（Sidebar）

**默认状态**：宽度 `220px`，白色背景，右边框 `border-r border-slate-200`

**折叠状态**：宽度 `64px`，只显示图标，文字隐藏

**布局结构**：
- 顶部：Logo 区域（高度 56px，与顶部栏对齐），折叠时显示简化图标
- 中部：导航菜单
- 底部：折叠切换按钮 + 用户信息缩略

**导航菜单项**：

| 路由 | 图标 | 标签 | 说明 |
|------|------|------|------|
| `/` | `LayoutDashboard` | 仪表盘 | 首页入口 |
| `/students` | `Users` | 学员管理 | 核心高频入口 |
| `/coaches` | `UserCog` | 教练管理 | 教练信息维护 |
| `/calendar` | `CalendarDays` | 课表日历 | 课程管理核心 |
| `/attendance` | `ClipboardCheck` | 考勤查询 | 点名记录查询 |
| `/backup` | `HardDrive` | 数据备份 | 备份/导入操作入口 |
| `/ai` | `Sparkles` | AI 助手 | 智能交互入口 |

**菜单项样式**：
- 默认：`text-slate-500`，hover 时 `text-slate-700 bg-slate-50`
- 激活（当前路由）：`text-red-600 bg-red-50 border-r-2 border-red-600`
- 图标：`w-5 h-5 mr-3`
- 菜单项高度：`h-10`，圆角 `rounded-lg`，padding `px-3`
- 菜单项间距：`space-y-1`

### 3.3 顶部栏（Header）

**高度**：`56px (h-14)`
**背景**：白色，底部边框 `border-b border-slate-200`
**布局**：Flex 两端对齐，`items-center px-4`

**左侧**：
- 侧边栏折叠/展开按钮（小屏下为汉堡菜单）
- 页面标题：`text-lg font-semibold text-slate-800`
- 面包屑（可选）：`text-sm text-slate-500`，分隔符 `/`

**右侧**：
- 通知图标（铃铛）+ 红点徽章：`relative` 定位，`w-2 h-2 bg-red-500 rounded-full absolute -top-0.5 -right-0.5`
- 设置图标（齿轮）
- 用户头像：`w-8 h-8 rounded-full bg-slate-200`

### 3.4 面包屑导航

在页面主体顶部显示当前路径：

```
首页 / 学员管理 / 张小明
```

样式：`text-sm text-slate-500`，当前页 `text-slate-800 font-medium`，分隔符 `text-slate-300 mx-2`

点击可跳转的面包屑项 hover 时 `text-red-600 underline`

---

## 4. 页面详细 UI 设计

### 4.1 仪表盘首页（`/`）

#### 整体布局

```
[面包屑：首页]
[标题：仪表盘                              日期选择器]

┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  统计卡片1  │ │  统计卡片2  │ │  统计卡片3  │ │  统计卡片4  │
└────────────┘ └────────────┘ └────────────┘ └────────────┘

┌─────────────────────────────┐  ┌────────────────────────┐
│                             │  │                        │
│   今日课程列表               │  │   快捷入口              │
│                             │  │   (2×3 网格)            │
│                             │  │                        │
└─────────────────────────────┘  └────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                         │
│   最近活动                                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 统计卡片（4 列网格，`grid-cols-4 gap-6`）

每张卡片：白色背景，`rounded-xl shadow-sm p-6`

**内部结构**：
- 顶部一行：左侧图标（圆形背景，`w-10 h-10 rounded-full`），右侧趋势箭头（绿色向上/红色向下）+ 百分比
- 中部：大数字 `text-3xl font-bold text-slate-800 mt-4`
- 底部：标签 `text-sm text-slate-500 mt-1`

**图标配色**：
- 在籍学员：`bg-blue-50 text-blue-600`（图标 `Users`）
- 今日课程：`bg-green-50 text-green-600`（图标 `CalendarDays`）
- 本月出勤率：`bg-amber-50 text-amber-600`（图标 `TrendingUp`）
- 即将到期：`bg-red-50 text-red-600`（图标 `AlertCircle`）

#### 今日课程列表（左侧，占 8 列）

白色卡片，`rounded-xl shadow-sm`
- 卡片头部：`p-6 border-b border-slate-100`，标题 `text-lg font-semibold` + 右侧 "查看全部" 链接 `text-sm text-red-600`
- 列表内容：每条课程是一个行项，`px-6 py-4 border-b border-slate-50 last:border-0`
- 行项结构：
  ```
  [时间色块: bg-slate-100 rounded-lg px-3 py-1 text-sm font-medium]
  [课程名: text-sm font-medium text-slate-800]
  [教练: text-xs text-slate-500]
  [状态徽章/点名按钮: ml-auto]
  ```
- 如果课程已开始且未点名：显示红色 "待点名" 徽章 + 点名按钮
- 如果已点名：显示绿色 "已完成" 徽章

#### 快捷入口（右侧，占 4 列）

白色卡片，`rounded-xl shadow-sm p-6`
- 标题：`text-lg font-semibold mb-4`
- 2×3 网格：`grid-cols-2 gap-4`
- 每个入口项：
  ```
  ┌─────────────────┐
  │  [图标]         │
  │  新增学员        │
  │  text-xs text-   │
  │  slate-500      │
  └─────────────────┘
  ```
  - 背景 `bg-slate-50 rounded-lg p-4 text-center`
  - hover：`bg-red-50 text-red-600 shadow-sm transition-all duration-200`
  - 图标：`w-8 h-8 mx-auto mb-2`

**6 个入口**：新增学员、查看日历、考勤查询、考级录入、比赛录入、AI 助手

---

### 4.2 学员列表页（`/students`）

#### 整体布局

```
[面包屑：首页 / 学员管理]
[标题：学员管理                                     [+ 新增学员]]

┌────────────────────────────────────────────────────────────┐
│ [🔍 搜索学员姓名...          ] [状态 ▼]  [每页 20 ▼]       │
└────────────────────────────────────────────────────────────├
│ 头像 姓名  性别   入学时间    剩余课时  到期时间   状态   操作 │
├────────────────────────────────────────────────────────────┤
│ [👤] 张小明  男   2024-01-15    24     2025-06-30  在籍   ✏️ 🗑│
│ [👤] 李小红  女   2024-02-01     3 ⚠️   2025-03-15  在籍   ✏️ 🗑│
│ [📷] 王大力  男   2023-09-10     0 ❌   已过期       已结业  ✏️  │
├────────────────────────────────────────────────────────────┤
│ 共 128 条         < 1  2  3  ... 10 >              1-20/128 │
└────────────────────────────────────────────────────────────┘
```

#### 搜索与筛选栏

白色卡片，`rounded-xl shadow-sm p-4 mb-6`
- Flex 布局，`items-center gap-4`
- 搜索框：
  - `relative flex-1 max-w-md`
  - 左侧搜索图标 `absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`
  - 输入框 `pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent`
  - placeholder：`搜索学员姓名...`
- 状态筛选下拉：
  - `w-36`，触发器 `border border-slate-200 rounded-lg px-3 py-2 text-sm`
  - 选项：`全部` / `在籍` / `已结业` / `暂停`
- 每页条数下拉：`w-24`，选项 `10` / `20` / `50`
- 右侧"新增学员"按钮：
  - `bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium`
  - hover：`bg-red-700`
  - 左侧加号图标 `w-4 h-4 mr-2`

#### 数据表格

白色卡片，`rounded-xl shadow-sm overflow-hidden`

**表头**：`bg-slate-50 px-6 py-3 border-b border-slate-200`
- 文字：`text-xs font-semibold text-slate-500 uppercase tracking-wider`
- 列宽分配：头像(6%) 姓名(18%) 性别(8%) 入学时间(13%) 剩余课时(12%) 到期时间(14%) 状态(10%) 操作(19%)

**数据行**：`px-6 py-4 border-b border-slate-50 last:border-0`
- hover：`bg-slate-50/50`
- 文字：`text-sm text-slate-700`

**头像列（表格首列）**：
- 有照片：`<img>`，`w-10 h-10 rounded-full object-cover border border-slate-200`
- 无照片：占位头像，`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400`，显示姓名首字母
- 点击头像可跳转学员详情页

**特殊样式规则**：
- **剩余课时 ≤ 5**：数字 `text-red-600 font-bold`，右侧显示警告图标 `AlertTriangle w-4 h-4 text-yellow-500`
- **剩余课时 = 0**：数字 `text-red-600 font-bold line-through`
- **到期时间已过期**：日期 `text-red-600 font-medium`，显示 "已过期"
- **到期时间 ≤ 30 天**：日期 `text-yellow-600`

**状态徽章样式**：

| 状态 | 背景 | 文字 | 圆点 |
|------|------|------|------|
| 在籍 | `bg-green-50` | `text-green-700` | `w-2 h-2 bg-green-500 rounded-full mr-2` |
| 已结业 | `bg-slate-100` | `text-slate-600` | `w-2 h-2 bg-slate-400 rounded-full mr-2` |
| 暂停 | `bg-yellow-50` | `text-yellow-700` | `w-2 h-2 bg-yellow-500 rounded-full mr-2` |

**操作列**：
- 编辑按钮：图标 `Pencil`，`text-slate-400 hover:text-blue-600 transition-colors`
- 删除按钮：图标 `Trash2`，`text-slate-400 hover:text-red-600 transition-colors`
- 按钮间距：`gap-2`

**分页器**：卡片底部，`px-6 py-4 border-t border-slate-100`
- 左侧：共 X 条 `text-sm text-slate-500`
- 中间：页码按钮组
  - 当前页：`bg-red-600 text-white w-8 h-8 rounded-lg text-sm font-medium`
  - 其他页：`text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg text-sm`
  - 上一页/下一页：箭头图标按钮
- 右侧：`text-sm text-slate-500`

---

### 4.2b 教练列表页（`/coaches`）

#### 整体布局

教练列表页与学员列表页保持一致的布局和交互模式，方便用户复用操作习惯。

```
[面包屑：首页 / 教练管理]
[标题：教练管理                                     [+ 新增教练]]

┌────────────────────────────────────────────────────────────┐
│ [🔍 搜索教练姓名...          ] [状态 ▼]  [每页 20 ▼]       │
└────────────────────────────────────────────────────────────├
│ 头像 姓名  性别   执教时间    状态       操作       │
├────────────────────────────────────────────────────────────┤
│ [👤] 李教练  男   2022-03-01  在职       ✏️ 🗑│
│ [👤] 王教练  女   2023-06-15  在职       ✏️ 🗑│
│ [📷] 张教练  男   2021-01-10  —         休假       ✏️    │
├────────────────────────────────────────────────────────────┤
│ 共 12 条          < 1  2 >                   1-20/12      │
└────────────────────────────────────────────────────────────┘
```

#### 与学员列表页的差异

| 维度 | 学员列表 | 教练列表 |
|------|----------|----------|
| 标题 | "学员管理" | "教练管理" |
| 搜索占位符 | "搜索学员姓名..." | "搜索教练姓名..." |
| 新增按钮 | "+ 新增学员" | "+ 新增教练" |
| 表头列 | 头像 姓名 性别 入学时间 剩余课时 到期时间 状态 操作 | 头像 姓名 性别 执教时间 状态 操作 |
| 剩余课时预警 | 有（≤5次标红/0次删除线） | 无（教练无课时概念） |
| 到期时间 | 有 | 无（教练无到期时间） |

#### 教练状态徽章

| 状态 | 背景 | 文字 | 圆点 |
|------|------|------|------|
| 在职 | `bg-green-50` | `text-green-700` | `w-2 h-2 bg-green-500 rounded-full mr-2` |
| 离职 | `bg-slate-100` | `text-slate-600` | `w-2 h-2 bg-slate-400 rounded-full mr-2` |
| 休假 | `bg-blue-50` | `text-blue-700` | `w-2 h-2 bg-blue-500 rounded-full mr-2` |

---

### 4.3 学员详情页（`/students/[id]`）

**核心目标**：美观专业的只读展示页，面向学员和家长。

#### 整体布局

```
[面包屑：首页 / 学员管理 / 张小明]

┌─────────────────────────────────────────────────────────────┐
│ [返回]                                                      │
│                                                             │
│  ┌──────────┐  ┌─────────────────────────────────────────┐ │
│  │           │  │  姓名 状态                              │ │
│  │  学员     │  │  📞 电话  📅 入学时间                   │ │
│  │  照片     │  │                                         │ │
│  │  (大头像) │  │  剩余课时进度环                          │ │
│  │           │  │  到期倒计时                              │ │
│  └──────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  成长时间线                                                  │
│  ●────────●────────●────────●                               │
│  白带     黄带     绿带     蓝带...                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐  ┌────────────────────────────┐
│  比赛记录                   │  │  集训记录                   │
│  ┌──┬──┬──┬──┐            │  │  ┌────┐ ┌────┐ ┌────┐     │
│  │  │  │  │  │            │  │  │    │ │    │ │    │     │
│  └──┴──┴──┴──┘            │  │  └────┘ └────┘ └────┘     │
└─────────────────────────────┘  └────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  考勤统计                                                    │
│  [柱状图]                                                    │
│  最近考勤记录列表                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 顶部信息卡

白色卡片，`rounded-xl shadow-sm p-8`，**跆拳道黑红金主题**

**左侧区域（占 30%）—— 学员大头像**：
- 照片容器：`w-36 h-36 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm`
- 有照片：`<img src={photoUrl} className="w-full h-full object-cover" />`
- 无照片：占位头像 `bg-slate-100 flex items-center justify-center`
  - 图标 `User w-16 h-16 text-slate-300`
  - 或姓名首字母 `text-4xl font-bold text-slate-400`
- 照片下方：学员姓名 `text-xl font-bold text-center mt-4`
- 照片悬停效果（管理员视角）：半透明遮罩 + "更换照片" 提示（如可编辑）

**右侧区域（占 70%）**：
- 返回按钮：`text-slate-500 hover:text-slate-800 text-sm mb-4 flex items-center gap-1`
- 学员姓名：`text-3xl font-bold text-slate-900`，旁边性别图标（男 `Mars` / 女 `Venus`），`w-5 h-5 text-slate-400 ml-2`
- 状态徽章：跟在姓名后，`ml-3`
- 信息行：`mt-4 flex flex-wrap gap-x-6 gap-y-2`
  - 每项：`flex items-center gap-2 text-sm text-slate-500`
  - 图标 + 文字，如 `📞 13800138001` / `📅 入学 2024-01-15`
- 环形进度图（Recharts）：展示 `剩余课时 / 总课时`
  - 圆环主色：`#DC2626`（道馆红）
  - 背景色：`#E2E8F0`
  - 中心文字：剩余课时大数字 `text-2xl font-bold` + "剩余课时" 标签
- 到期倒计时：到期时间 `text-lg font-semibold` + 剩余天数徽章
  - 正常：`bg-green-50 text-green-700`
  - 即将到期（≤30天）：`bg-yellow-50 text-yellow-700`
  - 已过期：`bg-red-50 text-red-700`

#### 成长时间线

白色卡片，`rounded-xl shadow-sm p-6 mt-6`

**卡片头部**：`flex items-center justify-between mb-6`
- 标题：`text-lg font-semibold text-slate-800`，左侧带 `Trophy` 图标 `w-5 h-5 text-amber-500 mr-2`
- 右侧："共 X 次考级" `text-sm text-slate-500`

**时间线设计**：纵向时间线
- 时间轴：左侧竖线 `w-0.5 bg-slate-200 absolute left-6 top-0 bottom-0`
- 每个节点：`relative pl-12 pb-8 last:pb-0`
  - 节点圆点：`absolute left-0 w-4 h-4 rounded-full border-2`
    - 最新节点：`bg-red-600 border-red-600`（实心）
    - 其他节点：`bg-white border-slate-300`
  - 日期：`text-xs text-slate-500 mb-1`
  - Belt 级别名称：`text-base font-semibold`
    - 白带-绿带：`text-slate-700`
    - 蓝带-红带：`text-blue-700`
    - 红黑带-黑带：`text-amber-700 font-bold`（高阶带位金色）
  - 证书编号：`text-xs text-slate-400 mt-1`
  - 备注（如有）：`text-sm text-slate-500 mt-1 bg-slate-50 rounded px-2 py-1 inline-block`

**Belt 颜色编码**：每个 belt 级别用对应颜色的竖条标识 `w-1 h-full absolute left-0 rounded`

#### 比赛记录表格

白色卡片，`rounded-xl shadow-sm p-6`

- 标题行：`flex items-center mb-4`，`Award` 图标 `w-5 h-5 text-amber-500 mr-2` + "比赛记录"
- 表格样式同学员列表页的表格，列：日期、比赛名称、组别、成绩、获奖
- 空状态：`text-center py-8 text-slate-400`，图标 `Award` + "暂无比赛记录"

#### 集训记录卡片网格

白色卡片，`rounded-xl shadow-sm p-6`

- 标题行：`MapPin` 图标 + "集训与拓展记录"
- 网格：`grid-cols-3 gap-4`
- 每张卡片：`bg-slate-50 rounded-lg p-4 border border-slate-100`
  - 日期：`text-xs text-slate-500`
  - 活动名：`text-sm font-semibold text-slate-800 mt-1`
  - 地点：`text-xs text-slate-400 mt-1 flex items-center gap-1` + `MapPin w-3 h-3`
  - 时长：`text-xs text-slate-400 mt-1`

#### 考勤统计区

白色卡片，`rounded-xl shadow-sm p-6 mt-6`

- 标题：`BarChart3` 图标 + "考勤统计"
- 柱状图（Recharts）：
  - X 轴：近 6 个月（YYYY-MM）
  - Y 轴：出勤率 %
  - 柱子颜色：`#DC2626`，圆角顶部
  - 网格线：`#E2E8F0` 虚线
  - 高度：`240px`
- 最近考勤记录列表（图下方）：
  - 最多 10 条
  - 每行：`flex items-center justify-between py-2 border-b border-slate-50`
    - 左侧：日期 `text-sm text-slate-600` + 课程名 `text-sm text-slate-800 ml-4`
    - 右侧：状态徽章（同功能色定义）

---

### 4.3b 教练详情页（`/coaches/[id]`）

#### 整体布局

教练详情页与学员详情页保持一致的页面结构和视觉风格，信息区域根据教练特点调整。

```
[面包屑：首页 / 教练管理 / 李教练]

┌─────────────────────────────────────────────────────────────┐
│ [返回]                                                      │
│                                                             │
│  ┌──────────┐  ┌─────────────────────────────────────────┐ │
│  │           │  │  姓名 状态                              │ │
│  │  教练     │  │  📞 电话  📅 执教时间                    │ │
│  │  照片     │  │                                         │ │
│  │  (大头像) │  │  执教年限: 3年                          │ │
│  │           │  │                                         │ │
│  └──────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  个人简介                                                    │
│  国家级跆拳道教练员，从事跆拳道教学10余年...                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  所授课程                                                    │
│  ┌──┬──────────┬──────────┬──────────────┬────────────┐    │
│  │  │ 课程名称  │ 类型      │ 上课时间      │ 学员人数   │    │
│  ├──┼──────────┼──────────┼──────────────┼────────────┤    │
│  │  │ 少儿基础班│ 常规课    │ 周二 16:00   │ 18人       │    │
│  │  │ 考级辅导  │ 考级辅导  │ 周四 18:00   │ 12人       │    │
└──┴──────────┴──────────┴──────────────┴────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### 顶部信息卡

白色卡片，`rounded-xl shadow-sm p-8`

**左侧区域（占 30%）—— 教练大头像**：
- 与学员详情页完全一致：照片容器 `w-36 h-36 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm`
- 有照片：`<img>` `object-cover`
- 无照片：占位头像 `bg-slate-100` + `User` 图标 `w-16 h-16 text-slate-300` 或姓名首字母

**右侧区域（占 70%）**：
- 返回按钮
- 教练姓名 `text-3xl font-bold text-slate-900` + 性别图标
- 在职状态徽章（在职/离职/休假）
- 信息行：电话、执教时间
- **执教年限**：根据 `joinDate` 自动计算，如"执教 3 年 2 个月" `text-lg font-semibold text-amber-600`

#### 个人简介卡片

白色卡片，`rounded-xl shadow-sm p-6 mt-6`

- 标题：`text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2`
  - `FileText` 图标 `w-5 h-5 text-slate-500 mr-1` + "个人简介"
- 内容：`text-sm text-slate-600 leading-relaxed whitespace-pre-line`
  - 如果 `bio` 为空：显示 `text-slate-400 italic` "暂无简介"

#### 所授课程列表

白色卡片，`rounded-xl shadow-sm p-6 mt-6`

- 标题：`CalendarDays` 图标 + "所授课程"
- 表格列：课程名称、类型（彩色徽章）、上课时间、学员人数
- 空状态：`CalendarX w-12 h-12 text-slate-300 mx-auto mb-3` + "暂无授课记录"
- 课程类型颜色编码与日历页一致（蓝色-常规课/紫色-考级辅导/橙色-集训营/红色-比赛预备）

---

### 4.4 日历/课表页（`/calendar`）

#### 整体布局

```
[面包屑：首页 / 课表日历]
[标题：课表日历                              [+ 新建课程]]

┌──────────┬─────────────────────────────────────────────────┐
│  侧边栏   │                                                  │
│  (可收起) │              FullCalendar                        │
│           │                                                  │
│  快速创建  │         月/周/日 视图切换                        │
│  课程表单  │                                                  │
│           │                                                  │
│  课程筛选  │                                                  │
│  (按类型)  │                                                  │
│           │                                                  │
└──────────┴─────────────────────────────────────────────────┘

[课程详情/创建抽屉面板 (点击课程弹出)]
```

#### 左侧边栏（可收起，默认展开，宽 `280px`）

白色背景，`border-r border-slate-200 p-4`

**快速创建课程表单**：
- 标题：`text-sm font-semibold mb-3`
- 表单字段（紧凑版）：
  - 课程名称：`input text-sm`，placeholder "课程名称"
  - 日期时间：并排两个 `input type="datetime-local"`
  - 课程类型：下拉选择，`regular` / `exam_prep` / `camp` / `competition`
  - **教练**：下拉选择框（从 Coach 表中选择），展示教练头像 + 姓名
    - 触发器：`flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm`
      - 左侧教练头像 `w-6 h-6 rounded-full object-cover`（无照片则显示首字母占位）
      - 教练姓名 `text-slate-700`
      - 右侧下拉箭头 `ChevronDown w-4 h-4 text-slate-400 ml-auto`
    - 下拉面板：
      - 在职教练列表，按姓名排序
      - 每项：`flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer`
        - 头像 `w-8 h-8 rounded-full`
        - 姓名 `text-sm text-slate-700`
      - 选中项：`bg-red-50 text-red-700`
      - 底部："+ 新增教练" 快捷链接 `text-xs text-red-600 hover:underline px-3 py-2`
    - 无教练选项：列表顶部添加 "不指定教练" 选项
  - 地点：`input text-sm` placeholder "上课地点"
- 提交按钮：`w-full bg-red-600 text-white py-2 rounded-lg text-sm mt-3`

**课程筛选器**：
- 标题：`text-sm font-semibold mt-6 mb-3`
- 复选框列表：
  - `☑ 常规课` — 蓝色左侧色条标识
  - `☑ 考级辅导` — 紫色色条
  - `☑ 集训营` — 橙色色条
  - `☑ 比赛预备` — 红色色条
- 每个复选框：`flex items-center gap-2 text-sm text-slate-600 mb-2`

#### 日历主区域

**FullCalendar 自定义样式**：

| 元素 | 样式 |
|------|------|
| 日历头部工具栏 | 白色背景，`border-b border-slate-200`，按钮圆角 `rounded-lg` |
| "今天" 按钮 | `bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm` |
| 上/下箭头按钮 | `border border-slate-200 text-slate-600 hover:bg-slate-50 w-8 h-8 rounded-lg` |
| 视图切换按钮组 | `border border-slate-200 rounded-lg overflow-hidden`，激活项 `bg-slate-800 text-white` |
| 月视图网格 | 单元格最小高度 `120px`，边框 `border-slate-100` |
| 日期数字 | `text-sm text-slate-700`，今天高亮 `bg-red-600 text-white w-7 h-7 rounded-full` |

**课程事件卡片（日历格内）**：

```
┌────────────────────┐
│ █ 09:00-10:30      │  ← 左侧色条表示课程类型
│   少儿基础班         │
│   👤 李教练         │
└────────────────────┘
```

- 容器：`rounded-md px-2 py-1 text-xs cursor-pointer hover:opacity-90 transition-opacity`
- 左侧色条：`w-1 rounded-full absolute left-0 top-1 bottom-1`
- 课程类型颜色：

| 类型 | 背景 | 左侧色条 |
|------|------|----------|
| 常规课 | `bg-blue-50` | `bg-blue-500` |
| 考级辅导 | `bg-purple-50` | `bg-purple-500` |
| 集训营 | `bg-orange-50` | `bg-orange-500` |
| 比赛预备 | `bg-red-50` | `bg-red-500` |

#### 课程详情/创建抽屉面板

右侧滑出抽屉：`w-96 bg-white shadow-xl h-full fixed right-0 top-0 z-50`
- 动画：`animate-in slide-in-from-right duration-300`
- 头部：`p-4 border-b border-slate-200 flex items-center justify-between`
  - 标题 `text-lg font-semibold` + 关闭按钮 `X`
- 内容区：`p-4 overflow-auto`
- 底部操作栏：`p-4 border-t border-slate-200 flex gap-3`
  - "编辑" 按钮：`flex-1 border border-slate-200 py-2 rounded-lg text-sm`
  - "开始点名" 按钮：`flex-1 bg-red-600 text-white py-2 rounded-lg text-sm`

---

### 4.5 点名模态框（Attendance Modal）

**触发**：在课程详情面板点击"开始点名"

#### 模态框设计

居中模态框，`max-w-2xl w-full mx-auto`，背景遮罩 `bg-black/50 backdrop-blur-sm`

**头部**：`p-6 border-b border-slate-200`
- 课程名：`text-xl font-semibold`
- 时间/教练：`text-sm text-slate-500 mt-1`
- 右侧："全部出勤" 快捷按钮 `bg-green-600 text-white px-4 py-2 rounded-lg text-sm`

**学员列表区**：`max-h-[60vh] overflow-auto`
- 每行：`flex items-center px-6 py-3 border-b border-slate-50 hover:bg-slate-50`
- 左侧：
  - 学员头像：有照片则 `w-8 h-8 rounded-full object-cover`，无照片则 `w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500`
  - 姓名：`text-sm font-medium text-slate-800 ml-3`
  - 剩余课时：`text-xs text-slate-500 ml-2`
    - 正常：`text-slate-500`
    - ≤5次：`text-yellow-600 font-medium`
    - 0次：`text-red-600 font-bold`
- 右侧：状态选择器（5 个单选按钮组成的按钮组）

**状态按钮组**：`flex gap-1`

| 状态 | 默认 | 选中 |
|------|------|------|
| 未点名 | `bg-slate-100 text-slate-400` | — |
| 出勤 | `hover:bg-green-50 hover:text-green-700` | `bg-green-600 text-white` |
| 缺勤 | `hover:bg-red-50 hover:text-red-700` | `bg-red-600 text-white` |
| 迟到 | `hover:bg-orange-50 hover:text-orange-700` | `bg-orange-500 text-white` |
| 请假 | `hover:bg-blue-50 hover:text-blue-700` | `bg-blue-600 text-white` |

按钮样式：`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150`

**底部**：`p-6 border-t border-slate-200 flex justify-between items-center`
- 左侧：已点 X / 共 Y 人 `text-sm text-slate-500`
- 右侧：
  - "取消"：`border border-slate-200 px-4 py-2 rounded-lg text-sm`
  - "提交点名"：`bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium`

---

### 4.6 AI 对话页（`/ai`）

#### 整体布局（全屏聊天界面）

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 AI 助手                                    [状态: ● 就绪] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI: 你好！我是道馆 AI 助手...                       │  │
│  │       有什么可以帮你的？                              │  │
│  │                                                      │  │
│  │                                         用户: 帮我查  │  │
│  │                                                一下张 │  │
│  │                                                小明   │  │
│  │                                                      │  │
│  │  AI: 正在查找学员 "张小明"...                        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  正在执行: searchStudents                     │   │  │
│  │  │  参数: {"keyword": "张小明"}                   │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [查看今日课程] [搜索学员] [开始点名] [创建课程]             │
├─────────────────────────────────────────────────────────────┤
│  [输入指令，例如：帮我查找叫张三的学员...          ] [➤]   │
└─────────────────────────────────────────────────────────────┘
```

#### 聊天消息区

全屏高度减去输入区，`flex-1 overflow-auto p-6 space-y-4`

**AI 消息气泡**：
- 容器：`flex items-start gap-3`
- AI 头像：`w-8 h-8 rounded-full bg-red-600 flex items-center justify-center`
  - 内部图标 `Sparkles w-5 h-5 text-white`
- 气泡：`bg-white rounded-xl rounded-tl-none shadow-sm px-4 py-3 max-w-[80%]`
- 文字：`text-sm text-slate-700 leading-relaxed`
- 时间戳：`text-xs text-slate-400 mt-1`

**用户消息气泡**：
- 容器：`flex items-start gap-3 flex-row-reverse`
- 气泡：`bg-slate-800 text-white rounded-xl rounded-tr-none shadow-sm px-4 py-3 max-w-[80%]`
- 文字：`text-sm leading-relaxed`

**工具调用状态卡片**：
- 嵌套在 AI 消息气泡内
- `bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2`
- 标题：`text-xs font-medium text-slate-600 flex items-center gap-2`
  - 加载中：`Loader2 w-3 h-3 animate-spin`
  - 完成：`CheckCircle w-3 h-3 text-green-600`
- 内容：`text-xs text-slate-500 mt-1`
  - 工具名 + 参数摘要

#### 快捷指令栏

输入框上方，`p-3 border-t border-slate-200 bg-white`

水平滚动条：`flex gap-2 overflow-x-auto`

快捷按钮：
- `bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors`
- 预置指令：
  - "查看今日课程" + `CalendarDays w-3 h-3 mr-1`
  - "搜索学员" + `Users w-3 h-3 mr-1`
  - "开始点名" + `ClipboardCheck w-3 h-3 mr-1`
  - "创建课程" + `Plus w-3 h-3 mr-1`

#### 输入框区

固定在底部，`p-4 border-t border-slate-200 bg-white`

```
┌────────────────────────────────────────────────────────────┐
│ [📎] [输入指令...                           ] [➤ 发送]     │
└────────────────────────────────────────────────────────────┘
```

- 容器：`flex items-center gap-3`
- 输入框：`flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none`
- 发送按钮：`w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors`
  - 图标 `Send w-5 h-5`
  - 加载中：`Loader2 w-5 h-5 animate-spin`

---

### 4.7 学员表单页（新增/编辑）

#### 整体布局

```
[面包屑：首页 / 学员管理 / 新增学员]
[标题：新增学员]

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

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  基本信息                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  姓名 *          性别 *                               │  │
│  │  [________]      ( )男  ( )女                         │  │
│  │                                                      │  │
│  │  出生日期        身份证号                              │  │
│  │  [________]      [________]                          │  │
│  │                                                      │  │
│  │  电话号码                                             │  │
│  │  [________]                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  课务信息                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  入学时间 *      剩余课时 *     到期时间               │  │
│  │  [________]      [________]    [________]             │  │
│  │                                                      │  │
│  │  在籍状态                                             │  │
│  │  ( )在籍  ( )已结业  ( )暂停                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                                    [取消]  [保存]           │
└─────────────────────────────────────────────────────────────┘
```

#### 照片采集区域

白色卡片，`rounded-xl shadow-sm p-8 mb-6`

**卡片标题**：`text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2`
- 左侧色条 `w-1 h-5 bg-red-600 rounded-full`
- 文字 "学员照片"

**照片预览区**：居中 `flex flex-col items-center`

- 预览容器：`w-48 h-48 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center transition-all duration-200`
  - 有照片时边框变为实线 `border-solid border-red-200`
  - 悬停时 `border-red-300 bg-red-50/30`

- **无照片状态**：
  - `User` 图标 `w-16 h-16 text-slate-300`
  - 文字 `text-sm text-slate-400 mt-2` "暂无照片"

- **有照片状态**（预览/已保存）：
  - `<img>` `w-full h-full object-cover`
  - 悬停遮罩：`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200`
  - 遮罩文字：`text-white text-sm font-medium` "更换照片"

**操作按钮组**：`flex gap-3 justify-center mt-6`

| 按钮 | 图标 | 样式 | 功能 |
|------|------|------|------|
| **打开摄像头** | `Camera` | `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2` | 调起摄像头拍照 |
| **选择文件** | `FolderOpen` | `border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2` | 打开文件选择器 |
| **清除照片** | `Trash2` | `text-slate-400 hover:text-red-600 px-3 py-2 rounded-lg transition-colors` | 清除已选照片 |

- 隐藏的文件输入：`<input type="file" accept="image/*" className="hidden" ref={fileInputRef} />`

**头像列特殊交互**：点击"选择文件"按钮时触发隐藏的 `input[type=file]` 点击事件。

---

### 4.7b 教练表单页（新增/编辑）

#### 整体布局

教练表单与学员表单保持一致的布局和交互模式，字段分组调整为教练业务场景。

```
[面包屑：首页 / 教练管理 / 新增教练]
[标题：新增教练]

┌─────────────────────────────────────────────────────────────┐
│  教练照片                                                    │
│  （与学员照片采集组件完全一致）                               │
│  ┌──────────────────────────────────────────────┐          │
│  │           [照片预览区域]                       │          │
│  └──────────────────────────────────────────────┘          │
│  [📷 打开摄像头]  [📁 选择文件]  [🗑 清除照片]              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  基本信息                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  姓名 *          性别 *                               │  │
│  │  [________]      ( )男  ( )女                         │  │
│  │                                                      │  │
│  │  出生日期        身份证号      电话号码                │  │
│  │  [________]      [________]   [________]             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  工作信息                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  执教时间 *                                           │  │
│  │  [________]                                           │  │
│  │                                                      │  │
│  │  个人简介                                              │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  多行文本输入框，支持换行                      │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                      │  │
│  │  在职状态                                             │  │
│  │  ( )在职  ( )离职  ( )休假                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                                    [取消]  [保存]           │
└─────────────────────────────────────────────────────────────┘
```

#### 与学员表单的差异

| 维度 | 学员表单 | 教练表单 |
|------|----------|----------|
| 页面标题 | "新增学员" / "编辑学员" | "新增教练" / "编辑教练" |
| 照片标题 | "学员照片" | "教练照片" |
| 分组标题 | "基本信息" / "课务信息" | "基本信息" / "工作信息" |
| 课务信息组 | 入学时间 / 剩余课时 / 到期时间 / 在籍状态 | 执教时间 / 个人简介 / 在职状态 |
| 个人简介 | 无 | `<textarea>` 多行文本框，`h-24 resize-none`，placeholder "填写个人简介、工作经历..." |
| 状态选项 | 在籍 / 已结业 / 暂停 | 在职 / 离职 / 休假 |

所有表单控件样式与学员表单完全一致，照片采集组件复用 `PhotoCapture`。

---

### 4.8 摄像头拍照模态框

**触发**：点击表单中"打开摄像头"按钮

#### 模态框结构

```
┌─────────────────────────────────────────────┐
│  📷 拍照                                    │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │                                       │  │
│  │        [摄像头实时画面]               │  │
│  │                                       │  │
│  │        等待摄像头权限...               │  │
│  │                                       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  │
│  │  │📷拍│ │重拍│ │确认│ │取消│       │  │
│  │  └────┘ └────┘ └────┘ └────┘       │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**遮罩**：`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center`
**容器**：`bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden`
**动画**：`animate-in fade-in zoom-in-95 duration-200`

**头部**：`px-6 py-4 border-b border-slate-100 flex items-center gap-3`
- `Camera` 图标 `w-5 h-5 text-red-600`
- 标题 `text-lg font-semibold text-slate-800` "拍照"
- 关闭按钮：`X w-5 h-5 text-slate-400 hover:text-slate-600 ml-auto`

**视频区域**：`relative bg-black aspect-[4/3]`
- `<video>` 元素 `w-full h-full object-cover`
- **权限请求状态**：居中显示
  - `Camera w-12 h-12 text-slate-400 mb-3`
  - `text-sm text-slate-500` "请允许使用摄像头进行拍照"
  - "请求权限" 按钮：`bg-red-600 text-white px-4 py-2 rounded-lg text-sm mt-3`
- **加载状态**：`Loader2 w-8 h-8 text-white animate-spin mx-auto`
- **错误状态**：
  - `AlertCircle w-12 h-12 text-red-500 mb-3`
  - `text-sm text-red-600` "无法访问摄像头"
  - `text-xs text-slate-500 mt-1` "请检查摄像头连接和权限设置"

**操作栏**：`px-6 py-4 border-t border-slate-100 flex justify-center gap-4`

**状态 1 —— 实时预览中**：
- 快门按钮（居中突出）：
  - `w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105`
  - 内部：`Camera w-7 h-7`
- 取消按钮：`text-slate-500 hover:text-slate-700 text-sm px-4 py-2`

**状态 2 —— 已拍照，待确认**：
- 视频暂停，显示定格画面
- "重拍" 按钮：`border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm flex items-center gap-1`
  - `RotateCcw w-4 h-4` + "重拍"
- "确认使用" 按钮：`bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-1`
  - `Check w-4 h-4` + "确认使用"

**视频帧转图片后的处理**：
1. 关闭模态框
2. 表单照片预览区显示拍到的照片
3. 照片文件对象保存到组件 state，随表单一起提交

---

## 5. 组件设计规范

### 5.1 按钮（Button）

| 变体 | 默认 | Hover | 禁用 |
|------|------|-------|------|
| **Primary** | `bg-red-600 text-white` | `bg-red-700 -translate-y-0.5 shadow-md` | `opacity-50 cursor-not-allowed` |
| **Secondary** | `bg-white border border-slate-200 text-slate-700` | `bg-slate-50 border-slate-300` | `opacity-50 cursor-not-allowed` |
| **Ghost** | `bg-transparent text-slate-600` | `bg-slate-100 text-slate-800` | `opacity-50 cursor-not-allowed` |
| **Danger** | `bg-white border border-red-200 text-red-600` | `bg-red-50 border-red-300` | `opacity-50 cursor-not-allowed` |
| **Icon** | `bg-transparent text-slate-400 p-2 rounded-lg` | `bg-slate-100 text-slate-600` | `opacity-50 cursor-not-allowed` |

**尺寸**：

| 尺寸 | Padding | 字号 | 用途 |
|------|---------|------|------|
| **sm** | `px-3 py-1.5` | `text-xs` | 表格操作、标签按钮 |
| **md** | `px-4 py-2` | `text-sm` | 表单提交、常规操作 |
| **lg** | `px-6 py-3` | `text-base` | 重要操作、CTA |

**统一圆角**：`rounded-lg`
**过渡**：`transition-all duration-150`

### 5.2 卡片（Card）

**基础卡片**：
```
bg-white rounded-xl shadow-sm border border-slate-100
```

**卡片变体**：

| 变体 | 样式 | 用途 |
|------|------|------|
| **默认** | `bg-white rounded-xl shadow-sm` | 一般内容容器 |
| **hoverable** | + `hover:shadow-md transition-shadow duration-200` | 可点击卡片 |
| **bordered** | `bg-white rounded-xl border border-slate-200` | 强调边界 |
| **colored-header** | 顶部 `4px` 色条 + 白色主体 | 带类型标识的卡片 |
| **stats** | `bg-white rounded-xl shadow-sm p-6` | 统计数字卡片 |

### 5.3 表格（Table）

**容器**：`bg-white rounded-xl shadow-sm overflow-hidden`

**表头**：`bg-slate-50 border-b border-slate-200`
- 文字：`text-xs font-semibold text-slate-500 uppercase tracking-wider`
- padding：`px-6 py-3`

**数据行**：
- 默认：`border-b border-slate-50`
- hover：`bg-slate-50/50 transition-colors`
- padding：`px-6 py-4`
- 文字：`text-sm text-slate-700`

**空状态**：
- 居中图标 + 文字 `py-12`
- 图标：`w-12 h-12 text-slate-300 mx-auto mb-3`
- 主文字：`text-sm text-slate-500`
- 次文字（可选）：`text-xs text-slate-400 mt-1`

**加载状态**：
- 骨架屏：5 行灰色脉冲条 `animate-pulse`
- 每行：`h-12 bg-slate-100 rounded mb-2`

### 5.4 模态框（Modal）

**遮罩**：`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center`
**容器**：`bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden`

**结构**：
- 头部：`px-6 py-4 border-b border-slate-100 flex items-center justify-between`
  - 标题 `text-lg font-semibold` + 关闭按钮 `X w-5 h-5 text-slate-400 hover:text-slate-600`
- 内容：`px-6 py-4 max-h-[60vh] overflow-auto`
- 底部：`px-6 py-4 border-t border-slate-100 flex justify-end gap-3`

**动画**：`animate-in fade-in zoom-in-95 duration-200`

### 5.5 抽屉（Drawer）

**遮罩**：同模态框
**容器**：`fixed right-0 top-0 h-full bg-white shadow-xl z-50 w-96 flex flex-col`
**动画**：`animate-in slide-in-from-right duration-300`

**结构**：
- 头部：`px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0`
- 内容：`flex-1 overflow-auto px-6 py-4`
- 底部：`px-6 py-4 border-t border-slate-100 shrink-0`

### 5.6 徽章（Badge）

| 变体 | 样式 | 用途 |
|------|------|------|
| **default** | `bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium` | 默认标签 |
| **success** | `bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium` | 成功/在籍 |
| **warning** | `bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium` | 警告/暂停 |
| **danger** | `bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-medium` | 危险/过期 |
| **info** | `bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium` | 信息/请假 |
| **accent** | `bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-medium` | 强调/成就 |

### 5.7 Toast 通知

**位置**：右上角，`fixed top-4 right-4 z-50`

**成功 Toast**：
- `bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4 flex items-start gap-3 max-w-sm`
- 图标：`CheckCircle w-5 h-5 text-green-500`
- 标题：`text-sm font-medium text-slate-800`
- 描述：`text-xs text-slate-500 mt-0.5`

**错误 Toast**：
- 边框 `border-red-500`，图标 `XCircle text-red-500`

**动画**：`animate-in slide-in-from-right duration-300`
**自动消失**：3 秒后淡出 `animate-out fade-out slide-out-to-right duration-300`

### 5.8 输入框（Input）

**基础样式**：
```
w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800
placeholder:text-slate-400
focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500
disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
transition-all duration-150
```

**前置图标**：`relative` 容器，图标 `absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`，输入框 `pl-10`

**错误状态**：`border-red-500 focus:ring-red-500/30 focus:border-red-500`

### 5.9 下拉选择（Select）

**触发器**：同输入框样式，右侧下拉箭头 `ChevronDown w-4 h-4 text-slate-400 absolute right-3`

**下拉面板**：
- `absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1`
- 动画：`animate-in fade-in zoom-in-95 duration-100`

**选项**：
- 默认：`px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer`
- 选中：`bg-red-50 text-red-700 font-medium`
- 分隔线：`border-t border-slate-100 my-1`

### 5.10 日期时间选择器

**输入框**：同基础输入框，右侧日历图标 `Calendar w-4 h-4`

**弹出面板**：
- `bg-white rounded-xl shadow-xl border border-slate-200 p-4 absolute z-50`
- 日历网格：7 列，日期单元格 `w-9 h-9 rounded-lg text-sm flex items-center justify-center`
  - 默认：`text-slate-700 hover:bg-slate-100`
  - 今天：`border border-red-500 text-red-600 font-medium`
  - 选中：`bg-red-600 text-white`
  - 其他月份：`text-slate-400`
- 时间选择：底部并排小时/分钟下拉

### 5.11 头像组件（Avatar）

头像在系统中多处使用（学员列表、详情页、点名模态框），统一设计规范：

**尺寸变体**：

| 尺寸 | 像素 | Tailwind | 使用场景 |
|------|------|----------|----------|
| **xs** | 24px | `w-6 h-6 text-[10px]` | 紧凑列表、标签 |
| **sm** | 32px | `w-8 h-8 text-xs` | 点名列表、评论 |
| **md** | 40px | `w-10 h-10 text-sm` | 学员列表表格 |
| **lg** | 64px | `w-16 h-16 text-xl` | 卡片展示 |
| **xl** | 144px | `w-36 h-36 text-4xl` | 学员详情页大头像 |

**有照片状态**：
- `<img>` `w-full h-full object-cover rounded-full`
- 外层容器 `overflow-hidden` 保证圆角裁切

**无照片状态（占位头像）**：
- 背景 `bg-slate-100`
- 显示姓名首字母 `font-bold text-slate-400 uppercase`
- 或显示 `User` 图标 `text-slate-300`

**圆角规则**：
- 表格/列表中：`rounded-full`（圆形）
- 详情页大头像：`rounded-2xl`（大圆角方形，更具展示感）
- 卡片式布局中：`rounded-xl`（中圆角）

### 5.12 照片采集组件（PhotoCapture）

照片采集组件是系统特色组件，嵌入学员表单中，提供摄像头拍照和文件上传两种方式。

**组件结构**：
```
<PhotoCapture>
  ├── 预览区（PreviewArea）
  │     ├── 有照片 → <img> + 悬停遮罩
  │     └── 无照片 → 占位图标 + 提示文字
  ├── 操作按钮组（ActionButtons）
  │     ├── 打开摄像头按钮
  │     ├── 选择文件按钮
  │     └── 清除照片按钮（有条件显示）
  └── 摄像头模态框（CameraModal）
        ├── 视频预览区
        ├── 权限请求状态
        └── 操作栏（快门/重拍/确认/取消）
```

**组件状态机**：

| 状态 | 预览区 | 摄像头按钮 | 文件按钮 | 清除按钮 | 说明 |
|------|--------|-----------|---------|---------|------|
| **empty** | 占位图标 | 可用 | 可用 | 隐藏 | 无照片 |
| **preview** | DataURL 预览 | 可用 | 可用 | 显示 | 已选新照片（未提交） |
| **saved** | 已有照片 URL | 可用 | 可用 | 显示 | 编辑时显示已保存照片 |
| **capturing** | 不变 | 禁用 | 禁用 | 禁用 | 摄像头模态框打开中 |
| **confirming** | 不变 | 禁用 | 禁用 | 禁用 | 已拍照待确认 |

---

## 6. 交互设计

### 6.1 页面导航

**侧边栏导航**：
- 点击菜单项：立即切换路由，当前项高亮
- 页面切换过渡：内容区域淡入 `animate-in fade-in duration-200`

**面包屑导航**：
- 可点击项 hover：`text-red-600 underline cursor-pointer`
- 点击后跳转对应页面

### 6.2 数据操作反馈

| 操作 | 反馈方式 | 内容 |
|------|----------|------|
| **新增学员成功** | Toast 成功通知 | "学员 XXX 添加成功" |
| **编辑学员成功** | Toast 成功通知 | "学员信息已更新" |
| **删除学员** | 二次确认弹窗 → Toast | "确定删除学员 XXX 吗？此操作不可撤销" → "已删除" |
| **点名提交成功** | Toast 成功通知 | "点名完成，已记录 X 人出勤" |
| **照片上传成功** | Toast 成功通知 | "照片上传成功" |
| **照片删除成功** | Toast 成功通知 | "照片已清除" |
| **摄像头权限被拒绝** | Toast 错误通知 | "需要摄像头权限才能拍照，请在浏览器设置中开启" |
| **AI 工具调用中** | 消息内状态卡片 | "正在执行: searchStudents..." + 加载动画 |
| **AI 工具调用完成** | 状态卡片更新 | 绿色对勾 + 执行结果摘要 |
| **表单验证失败** | 字段级错误提示 | 红色边框 + 错误文字说明 |
| **API 请求失败** | Toast 错误通知 | "操作失败：网络错误，请重试" |

### 6.3 加载状态

| 场景 | 加载方式 | 样式 |
|------|----------|------|
| **页面初始加载** | 骨架屏 | 灰色脉冲块占位 |
| **表格数据加载** | 骨架行 | 5 行 `h-12 bg-slate-100 rounded animate-pulse` |
| **表单提交中** | 按钮加载态 | 按钮文字替换为 `Loader2 w-4 h-4 animate-spin mr-2` + "提交中..." |
| **AI 响应中** | 输入框加载态 | 发送按钮变为旋转图标，输入框 disabled |
| **日历事件加载** | 全屏遮罩 | `absolute inset-0 bg-white/80 flex items-center justify-center` + Spinner |
| **照片上传中** | 预览区遮罩 | `absolute inset-0 bg-black/30 flex items-center justify-center` + `Loader2 animate-spin text-white` |
| **摄像头初始化** | 视频区加载 | `Loader2 w-8 h-8 text-white animate-spin mx-auto` |

### 6.4 空状态

| 场景 | 图标 | 主文字 | 操作建议 |
|------|------|--------|----------|
| **学员列表为空** | `Users w-12 h-12` | "暂无学员数据" | "点击"新增学员"添加第一位学员" |
| **课程日历为空** | `CalendarDays w-12 h-12` | "本月暂无课程" | "点击左侧表单或"+新建课程"" |
| **考勤记录为空** | `ClipboardCheck w-12 h-12` | "暂无考勤记录" | "前往课表页面进行点名" |
| **搜索结果为空** | `Search w-12 h-12` | "未找到匹配的学员" | "请尝试其他关键词" |
| **成长记录为空** | `Trophy w-12 h-12` | "暂无考级记录" | "在学员管理中添加考级记录" |
| **比赛记录为空** | `Award w-12 h-12` | "暂无比赛记录" | "在学员管理中添加比赛记录" |
| **集训记录为空** | `MapPin w-12 h-12` | "暂无集训记录" | "在学员管理中添加集训记录" |
| **学员无照片** | `User w-12 h-12` | "暂无照片" | "点击"打开摄像头"或"选择文件"添加" |
| **教练列表为空** | `UserCog w-12 h-12` | "暂无教练数据" | "点击"新增教练"添加第一位教练" |
| **教练无简介** | `FileText w-12 h-12` | "暂无简介" | "在教练管理中添加个人简介" |
| **教练无授课** | `CalendarX w-12 h-12` | "暂无授课记录" | "在课表日历中为该教练排课" |

**空状态样式**：
- 居中 `text-center py-16`
- 图标：`w-12 h-12 text-slate-300 mx-auto mb-4`
- 主文字：`text-sm text-slate-500 font-medium`
- 次文字：`text-xs text-slate-400 mt-2`
- 操作按钮（可选）：`mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm`

### 6.5 确认对话框

**删除确认**：
- 模态框标题：`text-lg font-semibold text-slate-800`
- 警告图标：`AlertTriangle w-10 h-10 text-yellow-500 mx-auto mb-3`
- 内容：`text-sm text-slate-600 text-center`
- 操作：`flex gap-3 justify-center mt-6`
  - "取消"：Secondary 按钮
  - "确认删除"：Danger 按钮 `bg-red-600 text-white`

---

## 7. 响应式设计

### 7.1 断点定义

| 断点 | 宽度 | 设备 |
|------|------|------|
| **sm** | ≥ 640px | 小平板 |
| **md** | ≥ 768px | 平板竖屏 |
| **lg** | ≥ 1024px | 平板横屏/小桌面 |
| **xl** | ≥ 1280px | 标准桌面 |
| **2xl** | ≥ 1536px | 大屏桌面 |

### 7.2 布局适配

**≥ 1280px（标准桌面）**：
- 侧边栏：展开 `220px`
- 仪表盘统计卡片：`grid-cols-4`
- 学员详情页：双栏布局（照片左 + 信息右）
- 表单照片区：大预览 `w-48 h-48`

**≥ 1024px 且 < 1280px**：
- 侧边栏：展开 `220px`
- 仪表盘统计卡片：`grid-cols-2`
- 学员详情页：双栏布局（照片占 1/3 + 信息占 2/3）
- 表单照片区：预览 `w-40 h-40`

**≥ 768px 且 < 1024px**：
- 侧边栏：折叠 `64px`
- 仪表盘统计卡片：`grid-cols-2`
- 所有页面：单栏布局
- 学员详情页照片：居中展示 `w-32 h-32`
- 表单照片区：预览 `w-36 h-36`

**< 768px（移动端）**：
- 侧边栏：完全隐藏，通过汉堡菜单触发抽屉
- 顶部栏：显示汉堡菜单按钮
- 仪表盘统计卡片：`grid-cols-1`
- 学员列表：卡片式布局替代表格（每学员一张卡片，含头像、姓名、状态）
- 点名模态框：全屏 `max-w-none h-full rounded-none`
- 摄像头拍照模态框：全屏 `max-w-none rounded-none`
- AI 对话页：全屏，快捷指令栏可横向滚动
- 表单照片区：预览 `w-32 h-32`，按钮组垂直堆叠

### 7.3 移动端特殊处理

**学员列表（移动端）**：
表格转为卡片列表，每张卡片包含：
- 左侧头像（有照片则显示，无照片则占位）
- 姓名 + 状态徽章
- 信息行：性别、入学时间、剩余课时
- 操作按钮组（底部）

**日历页（移动端）**：
- 默认显示日视图而非月视图
- 左右滑动切换日期
- 课程详情为底部 sheet 弹出（从底部滑上）

**点名页（移动端）**：
- 全屏模态框
- 状态选择器改为下拉选择（节省空间）
- "全部出勤" 按钮固定底部

**摄像头拍照（移动端）**：
- 全屏模态框
- 视频区域占满屏幕
- 快门按钮放大 `w-20 h-20` 便于触摸
- 操作按钮固定在底部安全区

---

## 8. 图标系统

统一使用 **Lucide React** 图标库，按功能场景分类：

### 8.1 导航图标

| 图标 | 名称 | 用途 |
|------|------|------|
| `LayoutDashboard` | 仪表盘 | 首页导航 |
| `Users` | 用户组 | 学员管理 |
| `CalendarDays` | 日历 | 课表日历 |
| `ClipboardCheck` | 考勤板 | 考勤查询 |
| `Sparkles` | 闪光 | AI 助手 |

### 8.2 操作图标

| 图标 | 名称 | 用途 |
|------|------|------|
| `Plus` | 加号 | 新增 |
| `Pencil` | 铅笔 | 编辑 |
| `Trash2` | 垃圾桶 | 删除 |
| `Search` | 搜索 | 搜索 |
| `Filter` | 筛选 | 筛选器 |
| `X` | 关闭 | 关闭弹窗/清除 |
| `ChevronDown` | 下箭头 | 下拉展开 |
| `ChevronLeft/Right` | 左右箭头 | 分页/导航 |
| `Send` | 发送 | AI 对话发送 |
| `RotateCcw` | 逆时针旋转 | 重拍照片 |
| `Check` | 勾选 | 确认使用照片 |

### 8.3 状态图标

| 图标 | 名称 | 用途 |
|------|------|------|
| `CheckCircle` | 勾选圆 | 成功状态 |
| `XCircle` | 错误圆 | 错误状态 |
| `AlertTriangle` | 警告三角 | 警告/确认 |
| `AlertCircle` | 警示圆 | 重要提示 |
| `Info` | 信息 | 提示说明 |
| `Loader2` | 加载圈 | 加载中 |

### 8.4 学员详情页图标

| 图标 | 名称 | 用途 |
|------|------|------|
| `Trophy` | 奖杯 | 考级记录 |
| `Award` | 奖章 | 比赛记录 |
| `MapPin` | 定位 | 集训地点 |
| `BarChart3` | 柱状图 | 考勤统计 |
| `Phone` | 电话 | 联系方式 |
| `Calendar` | 日历 | 日期信息 |
| `Clock` | 时钟 | 时间信息 |
| `TrendingUp` | 上升 | 统计数据 |

### 8.5 性别图标

| 图标 | 名称 | 用途 |
|------|------|------|
| `Mars` | 火星 | 男性 |
| `Venus` | 金星 | 女性 |

### 8.6 照片相关图标

| 图标 | 名称 | 用途 |
|------|------|------|
| `Camera` | 相机 | 打开摄像头按钮、拍照快门 |
| `FolderOpen` | 打开文件夹 | 选择文件按钮 |
| `User` | 用户 | 无照片时的占位头像 |
| `Image` | 图片 | 图片相关提示 |
| `ImagePlus` | 添加图片 | 添加照片提示 |

### 8.7 备份相关图标

| 图标 | 名称 | 用途 |
|------|------|------|
| `UserCog` | 用户设置 | 教练管理导航 |
| `HardDrive` | 硬盘 | 数据备份导航、存储相关 |
| `Download` | 下载 | 备份导出按钮 |
| `Upload` | 上传 | 备份导入按钮 |
| `Database` | 数据库 | 数据库备份说明项 |
| `FileJson` | JSON 文件 | 备份元数据说明项 |
| `FileText` | 文本文件 | 个人简介卡片 |
| `CalendarX` | 日历X | 暂无授课记录空状态 |
| `RotateCcw` | 逆时针旋转 | 重拍照片 |
| `CheckCircle` | 勾选圆 | 备份成功、恢复成功 |
| `XCircle` | 错误圆 | 备份/恢复失败 |

---

## 9. 暗黑模式（可选扩展）

为未来扩展预留的暗黑模式配色方案：

| 元素 | 亮色模式 | 暗黑模式 |
|------|----------|----------|
| 页面背景 | `bg-slate-50` | `bg-slate-950` |
| 卡片背景 | `bg-white` | `bg-slate-900` |
| 侧边栏 | `bg-white` | `bg-slate-900 border-slate-800` |
| 顶部栏 | `bg-white` | `bg-slate-900 border-slate-800` |
| 主文字 | `text-slate-700` | `text-slate-200` |
| 次要文字 | `text-slate-500` | `text-slate-400` |
| 边框 | `border-slate-200` | `border-slate-700` |
| 输入框背景 | `bg-white` | `bg-slate-800` |
| 表格交替行 | `bg-slate-50/50` | `bg-slate-800/50` |

---

**文档版本**：v3.0  
**编写日期**：2026-05-22  
**关联文档**：《跆拳道馆 CRM 系统_PRD.md》  
**变更记录**：
- v3.0 新增教练管理（教练列表页、教练详情页、教练表单页）、课程教练下拉选择、教练相关图标
- v2.0 新增学员照片采集组件（摄像头拍照 + 文件上传）、头像组件规范、点名列表头像展示
