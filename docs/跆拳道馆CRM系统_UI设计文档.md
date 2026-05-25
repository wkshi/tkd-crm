# 跆拳道馆 CRM 系统 —— UI 设计文档

## 1. 设计理念

### 1.1 设计目标

为跆拳道馆打造一套**通透、精致、高效**的管理界面。视觉风格深度参照 Apple Human Interface Guidelines，融入 macOS System Settings 与 iPadOS 管理类 App 的设计语言，让管理员和教练在清爽、无干扰的环境中快速完成操作。学员/家长查看详情页时，感受到的是如同原生 Apple 应用般的专业品质与精致细节。

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **通透层级** | 通过背景色差异与毛玻璃材质（vibrancy）表达层级，废除厚重阴影，界面呼吸感极强 |
| **充裕留白** | 信息密度适中，列表行高 44px+，卡片间距 20px+，眼睛不易疲劳 |
| **精致圆角** | 全面采用大圆角与 pill 形状，按钮、卡片、头像均呈现 Apple 标志性的柔和边缘 |
| **品牌克制** | 道馆红仅作为系统强调色（accent tint）出现，不主导大面积背景，保持界面清透 |
| **一致动效** | 所有交互反馈通过透明度与背景色变化表达，过渡自然流畅，无突兀位移 |

---

## 2. 设计系统（Design System）

### 2.1 色彩体系

#### 系统背景层级（System Background Levels）

Apple 风格通过背景色的细微差异构建层级，而非依赖阴影。

| 令牌 | 色值 | Tailwind 实现 | 用途 |
|------|------|---------------|------|
| **system-background** | `#FFFFFF` | `bg-white` | 页面最底层背景、卡片表面 |
| **secondary-background** | `#F5F5F7` | `bg-[#F5F5F7]` | 分组列表背景、页面主体底色 |
| **tertiary-background** | `#FFFFFF` | `bg-white` | 位于 secondary 之上的列表项、输入框 |
| **system-fill** | `rgba(120,120,128,0.12)` | `bg-black/[0.08]` | 轻微填充背景、hover 态、图标底色 |

#### 文字色（Label Colors）

| 令牌 | 色值 | Tailwind 实现 | 用途 |
|------|------|---------------|------|
| **label-primary** | `#1D1D1F` | `text-[#1D1D1F]` | 主标题、正文、表格数据 |
| **label-secondary** | `#6E6E73` | `text-[#6E6E73]` | 辅助文字、表头、时间戳 |
| **label-tertiary** | `#A1A1A6` | `text-[#A1A1A6]` | 占位符、禁用状态、非常次要信息 |

#### 分隔线（Separator）

| 令牌 | 色值 | Tailwind 实现 | 用途 |
|------|------|---------------|------|
| **separator** | `rgba(60,60,67,0.15)` | `border-black/[0.08]` | 卡片边框、列表分隔线、分割线 |

> 分隔线极其克制，仅在必要时使用，且颜色极淡。大量依赖留白实现内容分隔。

#### 强调色（Accent / Tint）

道馆红作为品牌强调色，降低饱和度以融入 Apple 审美：

| 名称 | 色值 | Tailwind 实现 | 用途 |
|------|------|---------------|------|
| **accent** | `#0071E3` | `bg-[#0071E3]` / `text-[#0071E3]` | 主按钮、选中状态、链接、激活指示器 |
| **accent-light** | `rgba(0,113,227,0.08)` | `bg-[#0071E3]/8` | 选中项背景、hover 高亮底 |

#### 功能色（Semantic Colors）

采用 Apple System Colors 语义，更清透：

| 状态 | 色值 | 背景实现 | 文字实现 | 用途 |
|------|------|----------|----------|------|
| **成功/出勤** | `#34C759` | `bg-green-500/10` | `text-green-600` | 在籍状态、出勤标记 |
| **警告** | `#FF9500` | `bg-orange-500/10` | `text-orange-600` | 暂停状态、课时不足预警 |
| **危险/缺勤** | `#FF3B30` | `bg-red-500/10` | `text-red-500` | 缺勤标记、删除操作 |
| **信息/请假** | `#007AFF` | `bg-blue-500/10` | `text-blue-500` | 请假标记、提示信息 |
| **次要/迟到** | `#FF9F0A` | `bg-amber-500/10` | `text-amber-600` | 迟到标记 |
| **成就/带位** | `#BF5AF2` | `bg-purple-500/10` | `text-purple-600` | 高阶带位、成就徽章 |

> 所有功能色背景均使用 10% 透明度，呈现 Apple 标志性的「色块标签」效果，而非实色填充。

### 2.2 字体系统

**字体栈**：`ui-sans-serif, -apple-system, "SF Pro Display", "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`

> 优先使用 Apple 设备原生字体（SF Pro / PingFang SC），Windows 设备回退至系统默认无衬线字体，保证跨平台一致的中西文混排体验。

| 层级 | 字号 | 字重 | 行高 | 字间距 | Tailwind 类 | 用途 |
|------|------|------|------|--------|-------------|------|
| **Large Title** | 34px | 700 | 1.2 | -0.02em | `text-[34px] font-bold` | 仪表盘大标题 |
| **Title 1** | 28px | 700 | 1.25 | -0.02em | `text-[28px] font-bold` | 页面标题（学员详情姓名等） |
| **Title 2** | 22px | 600 | 1.3 | -0.01em | `text-[22px] font-semibold` | 模块标题、卡片标题 |
| **Title 3** | 17px | 600 | 1.35 | 0 | `text-[17px] font-semibold` | 分区标题、小标题、表头 |
| **Body** | 15px | 400 | 1.5 | 0 | `text-[15px]` | 正文、表格内容、列表项 |
| **Callout** | 14px | 500 | 1.4 | 0 | `text-sm font-medium` | 辅助说明、按钮文字、操作标签 |
| **Caption** | 12px | 400 | 1.4 | 0 | `text-xs` | 时间戳、角标、脚注 |

### 2.3 间距系统

基于 4px 基数，但全面增大留白：

| 令牌 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| `space-1` | 4px | `p-1` / `m-1` | 图标与文字紧间距 |
| `space-2` | 8px | `p-2` / `gap-2` | 按钮内图标间距 |
| `space-3` | 12px | `p-3` | 紧凑内边距 |
| `space-4` | 16px | `p-4` / `gap-4` | 常规内边距 |
| `space-5` | 20px | `p-5` / `gap-5` | 卡片内边距、卡片网格间距 |
| `space-6` | 24px | `p-6` / `gap-6` | 模块间间距 |
| `space-8` | 32px | `p-8` / `gap-8` | 页面级间距 |
| `space-10` | 40px | `p-10` | 大模块间距 |

**页面布局间距**：
- 页面主体 padding：`px-8 py-8`（32px）
- 卡片网格 gap：`gap-5`（20px）
- 卡片内部 padding：`p-5`（20px）
- 表单字段间距：`space-y-5`（20px）
- 列表项高度：最小 44px（Apple 标准触控目标）

### 2.4 圆角系统

全面增大圆角，模拟 Apple 连续圆角（continuous corner radius）视觉：

| 令牌 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| `radius-sm` | 6px | `rounded-md` | 小标签、内嵌元素 |
| `radius-md` | 10px | `rounded-[10px]` | 按钮、输入框、下拉选项 |
| `radius-lg` | 14px | `rounded-[14px]` | 卡片、下拉面板、列表项 |
| `radius-xl` | 20px | `rounded-[20px]` | 大卡片、模态框、照片容器 |
| `radius-2xl` | 24px | `rounded-[24px]` | 特殊大容器 |
| `radius-full` | 9999px | `rounded-full` | pill 按钮、胶囊徽章 |

**头像圆角特殊规则**：
- 列表/表格头像：从纯圆改为 `rounded-xl`（圆角方形，Apple 现代审美）
- 详情页大头像：`rounded-[20px]`（大圆角方形）
- 极小头像（xs）：`rounded-lg`

### 2.5 材质与深度系统（替代阴影）

**核心原则：废除四级阴影系统，改用背景色层级 + 毛玻璃材质表达深度。**

| 层级 | 表达方式 | Tailwind 实现 |
|------|----------|---------------|
| **基础层** | 纯白背景 | `bg-white` |
| **页面底层** | Apple 经典分组灰 | `bg-[#F5F5F7]` |
| **卡片层** | 在灰色背景上纯白卡片，无阴影 | `bg-white rounded-[20px]` |
| **悬浮层** | 毛玻璃 + 极淡边框 | `backdrop-blur-xl bg-white/80 border border-white/20` |
| **模态层** | 淡遮罩 + 纯白面板 | `bg-black/25 backdrop-blur-md` + `bg-white rounded-[20px]` |
| **侧边栏/Header** | 半透明毛玻璃 | `backdrop-blur-xl bg-white/70 border-r border-black/[0.04]` |

**唯一保留的阴影**：仅模态框/抽屉使用微弱环境阴影：
- 模态框：`shadow-[0_20px_60px_rgba(0,0,0,0.12)]`
- 抽屉：`shadow-[-8px_0_40px_rgba(0,0,0,0.08)]`
- 下拉面板：`shadow-[0_8px_32px_rgba(0,0,0,0.1)]`

### 2.6 动画与过渡

**核心原则：废除位移类 hover 效果，采用透明度与背景色变化。**

| 场景 | 过渡效果 | Tailwind |
|------|----------|----------|
| 按钮悬停 | 不透明度降低或背景叠加 `bg-black/5`，150ms | `transition-opacity duration-150 hover:opacity-90` 或 `hover:bg-black/5` |
| 列表项悬停 | 背景填充色变化，150ms | `transition-colors duration-150 hover:bg-black/[0.06]` |
| 卡片悬停 | 背景色变化（列表卡片）或 opacity | `transition-colors duration-150` |
| 页面切换 | 淡入 200ms | `animate-in fade-in duration-200` |
| 模态框弹出 | 淡入 + 轻微缩放 200ms | `animate-in fade-in zoom-in-[0.98] duration-200` |
| 侧边栏展开 | 宽度 300ms ease-out | `transition-all duration-300 ease-out` |
| 数据加载 | 骨架屏脉冲 | `animate-pulse bg-black/[0.06]` |
| Toast 通知 | 从顶部淡入滑入 200ms，3s 后淡出 | `animate-in fade-in slide-in-from-top-2 duration-200` |
| 抽屉滑出 | 从右侧滑入 300ms ease-out | `animate-in slide-in-from-right duration-300 ease-out` |
| 照片预览切换 | 淡入 150ms | `transition-opacity duration-150` |

---

## 3. 全局布局架构

### 3.1 整体页面结构

```
┌─────────────────────────────────────────────────────────────┐
│ 顶部栏 (Header)  高度 56px   毛玻璃材质                       │
│  [Logo]  [页面标题]                    [通知] [设置] [头像]   │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                    │
│ 侧边栏   │              页面主体 (Main Content)               │
│ (Sidebar)│              px-8 py-8, bg-[#F5F5F7]              │
│ 宽度 220px│                                                   │
│ 折叠 64px│              [面包屑导航]                          │
│          │              [页面标题 + 操作按钮]                  │
│          │                                                    │
│          │              ┌────────────────────┐               │
│          │              │   内容区域          │               │
│          │              │   (纯白卡片/表格)   │               │
│          │              └────────────────────┘               │
│          │                                                    │
└──────────┴──────────────────────────────────────────────────┘
```

**背景层级**：
- 最底层：侧边栏与页面主体共享 `bg-[#F5F5F7]`（secondary-background）
- 内容卡片：`bg-white rounded-[20px]`，在灰色背景上自然浮现，无需阴影

### 3.2 侧边栏（Sidebar）

**背景**：`backdrop-blur-xl bg-white/70`，右边框 `border-r border-black/[0.04]`，选中项无左侧竖条，使用蓝色背景 pill 高亮

**默认状态**：宽度 `220px`
**折叠状态**：宽度 `64px`，只显示图标，文字隐藏

**布局结构**：
- 顶部：Logo 区域（高度 56px，与顶部栏对齐），去除底部边框，简洁文字 Logo
- 中部：导航菜单
- 底部：折叠切换按钮 + 用户信息缩略

**导航菜单项**：

| 路由 | 图标 | 标签 | 说明 |
|------|------|------|------|
| `/` | `LayoutDashboard` | 仪表盘 | 首页入口 |
| `/students` | `Users` | 学员管理 | 核心高频入口 |
| `/coaches` | `UserCog` | 教练管理 | 教练信息维护 |
| `/classes` | `GraduationCap` | 班级管理 | 班级与学员分组管理 |
| `/calendar` | `CalendarDays` | 课表日历 | 课程管理核心 |
| `/attendance` | `ClipboardCheck` | 考勤查询 | 点名记录查询 |
| `/backup` | `HardDrive` | 数据备份 | 备份/导入操作入口 |
| `/ai` | `Sparkles` | AI 助手 | 智能交互入口 |

**菜单项样式（Apple 风格）**：
- 默认：`text-[#6E6E73]`，`h-11`（44px），圆角 `rounded-[10px]`，padding `px-3`
- hover：`bg-black/[0.06] text-[#1D1D1F]`
- 激活（当前路由）：`bg-[#0071E3]/8 text-[#0071E3] font-semibold`
- 图标：`w-5 h-5 mr-3`
- 菜单项间距：`space-y-0.5`

### 3.3 顶部栏（Header）

**高度**：`56px (h-14)`
**背景**：`backdrop-blur-xl bg-white/70`，底部边框 `border-b border-black/[0.08]`
**布局**：Flex 两端对齐，`items-center px-5`

**左侧**：
- 侧边栏折叠/展开按钮（小屏下为汉堡菜单）：圆形触控区域 `w-9 h-9 rounded-full hover:bg-black/[0.06] flex items-center justify-center`
- 导航链接 pill：`px-3.5 py-1.5 rounded-lg text-[13px] font-medium`，hover `bg-black/[0.03]`，active `bg-[#0071E3]/8 text-[#0071E3]`
- 面包屑（可选）：`text-[13px] text-[#6E6E73]`，分隔符 `text-[#A1A1A6] mx-1.5`

**右侧**：
- 通知图标（铃铛）：圆形触控区域 `w-9 h-9 rounded-full hover:bg-black/[0.06] flex items-center justify-center`，红点徽章 `w-2 h-2 bg-accent rounded-full absolute top-1.5 right-1.5`
- 设置图标（齿轮）：同上圆形触控区域
- 用户头像：`w-8 h-8 rounded-xl bg-black/[0.06]`（圆角方形）

### 3.4 面包屑导航

在页面主体顶部显示当前路径：

```
首页 / 学员管理 / 张小明
```

样式：`text-[13px] text-[#6E6E73]`，当前页 `text-[#1D1D1F] font-medium`

可点击项 hover：`text-accent`

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

#### 统计卡片（4 列网格，`grid-cols-4 gap-5`）

每张卡片：`bg-white rounded-[20px] p-5`

> 无阴影！纯白卡片在 `#F5F5F7` 灰色背景上自然形成层级。

**内部结构**：
- 顶部一行：左侧图标（圆角方形背景 `w-9 h-9 rounded-[10px]`），右侧趋势标签（如 `+3`、`满`、`2节`、`+12%`），带语义色背景 pill
- 中部：大数字 `text-[32px] font-bold text-[#1D1D1F] mt-3`
- 底部：标签 `text-[13px] text-[#6E6E73] mt-1`
- 底部进度条：`h-[3px] bg-black/[0.05] rounded-full mt-3`，填充色使用对应语义色

**图标配色**：
- 在籍学员：`text-blue-500`（图标 `Users`，底 `bg-blue-500/10`）
- 今日课程：`text-green-500`（图标 `CalendarDays`，底 `bg-green-500/10`）
- 本月出勤率：`text-purple-500`（图标 `TrendingUp`，底 `bg-purple-500/10`）
- 即将到期：`text-orange-500`（图标 `AlertCircle`，底 `bg-orange-500/10`）

#### 今日课程列表（左侧，占 8 列）

白色卡片，`bg-white rounded-[20px]`
- 卡片头部：`p-5`，标题 `text-[17px] font-semibold text-[#1D1D1F]` + 右侧 "查看全部" 链接 `text-[13px] text-accent`
- 列表内容：每条课程是一个行项，`px-5 py-3.5`，分隔线 `border-b border-black/[0.04] last:border-0`
- 行项结构：
  ```
  [时间色块: bg-black/[0.06] rounded-lg px-3 py-1 text-[13px] font-medium]
  [课程名: text-[15px] font-medium text-[#1D1D1F]]
  [教练: text-[13px] text-[#6E6E73]]
  [状态徽章/点名按钮: ml-auto]
  ```
- 如果课程已开始且未点名：显示 accent 色 "待点名" pill 徽章 + 点名按钮
- 如果已点名：显示绿色 "已完成" pill 徽章

#### 快捷入口（右侧，占 4 列）

白色卡片，`bg-white rounded-[20px] p-5`
- 标题：`text-[17px] font-semibold mb-4`
- 2×3 网格：`grid-cols-2 gap-3`
- 每个入口项：
  ```
  bg-black/[0.06] rounded-[14px] p-4 text-center
  hover:bg-accent/10 hover:text-accent transition-colors duration-150
  ```
  - 图标：`w-7 h-7 mx-auto mb-2`
  - 标签：`text-[13px] text-[#6E6E73]`，hover 时继承 `text-accent`

**6 个入口**：新增学员、查看日历、考勤查询、考级管理、比赛录入、AI 助手

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

去除白色卡片容器，直接嵌入页面背景：
- Flex 布局，`items-center gap-3 mb-5`
- 搜索框：
  - `relative flex-1 max-w-md`
  - 左侧搜索图标 `absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1A6] w-4 h-4`
  - 输入框 `w-full bg-black/[0.06] rounded-[10px] pl-10 pr-4 py-2.5 text-[15px] text-[#1D1D1F] placeholder:text-[#A1A1A6] border-0 focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all duration-200`
  - placeholder：`搜索学员姓名...`
- 状态筛选下拉：
  - `bg-black/[0.06] rounded-full px-4 py-2 text-[14px] text-[#1D1D1F] font-medium`
  - 选项：`全部` / `在籍` / `已结业` / `暂停`
- 每页条数下拉：同上 pill 形状
- 右侧"新增学员"按钮：
  - `bg-accent text-white px-5 py-2.5 rounded-full text-[14px] font-medium`
  - hover：`opacity-90`
  - 左侧加号图标 `w-4 h-4 mr-2`

#### 数据表格

白色卡片容器：`bg-white rounded-[20px] overflow-hidden`

**表头**：`px-5 py-3`
- 文字：`text-[13px] font-medium text-[#6E6E73]`
- **去除** `uppercase tracking-wider`，Apple 不使用大写字母间距
- 列宽分配：头像(6%) 姓名(18%) 性别(8%) 入学时间(13%) 剩余课时(12%) 到期时间(14%) 状态(10%) 操作(19%)

**数据行**：`px-5 py-3.5`
- hover：`bg-black/[0.06] transition-colors duration-150`
- 分隔线：`border-b border-black/[0.04] last:border-0`
- 文字：`text-[15px] text-[#1D1D1F]`

**头像列（表格首列）**：
- 有照片：`<img>`，`w-10 h-10 rounded-xl object-cover`（**圆角方形**，非纯圆）
- 无照片：占位头像，`w-10 h-10 rounded-xl bg-black/[0.06] flex items-center justify-center text-[13px] font-bold text-[#A1A1A6]`，显示姓名首字母
- 点击头像可跳转学员详情页

**特殊样式规则**：
- **剩余课时 ≤ 5**：数字 `text-orange-600 font-semibold`，右侧显示警告图标 `AlertTriangle w-4 h-4 text-orange-500`
- **剩余课时 = 0**：数字 `text-red-500 font-semibold line-through`
- **到期时间已过期**：日期 `text-red-500 font-medium`
- **到期时间 ≤ 30 天**：日期 `text-orange-600`

**状态徽章样式（全部 pill 形状）**：

| 状态 | 样式 |
|------|------|
| 在籍 | `bg-green-500/10 text-green-600 px-2.5 py-1 rounded-full text-[12px] font-medium` + 绿色圆点 `w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5` |
| 已结业 | `bg-black/[0.06] text-[#6E6E73] px-2.5 py-1 rounded-full text-[12px] font-medium` |
| 暂停 | `bg-orange-500/10 text-orange-600 px-2.5 py-1 rounded-full text-[12px] font-medium` |

**操作列**：
- 编辑按钮：图标 `Pencil`，`text-[#A1A1A6] hover:text-accent transition-colors`
- 删除按钮：图标 `Trash2`，`text-[#A1A1A6] hover:text-red-500 transition-colors`
- 按钮间距：`gap-2`

**分页器**：卡片底部，`px-5 py-4`
- 左侧：共 X 条 `text-[13px] text-[#6E6E73]`
- 中间：页码按钮组
  - 当前页：`bg-accent text-white w-8 h-8 rounded-full text-[13px] font-medium`
  - 其他页：`text-[#6E6E73] hover:bg-black/[0.06] w-8 h-8 rounded-full text-[13px]`
  - 上一页/下一页：箭头图标按钮，圆形触控区域
- 右侧：`text-[13px] text-[#6E6E73]`

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
| 剩余课时预警 | 有（≤5次标橙/0次标红） | 无（教练无课时概念） |
| 到期时间 | 有 | 无（教练无到期时间） |

---

### 4.2c 班级列表页（`/classes`）

#### 整体布局

班级列表页与学员/教练列表页保持一致的布局和交互模式。

```
[面包屑：首页 / 班级管理]
[标题：班级管理                                     [+ 新增班级]]

┌────────────────────────────────────────────────────────────┐
│ [🔍 搜索班级名称...          ] [状态 ▼]  [每页 20 ▼]       │
└────────────────────────────────────────────────────────────┤
│ 名称       级别      学员数    课程数    状态      操作     │
├────────────────────────────────────────────────────────────┤
│ 少儿基础班  白带      18人      4节/周   正常       ✏️ 🗑│
│ 竞技提高班  蓝带      12人      3节/周   正常       ✏️ 🗑│
│ 成人班      黑带       8人      2节/周   已结业     ✏️    │
├────────────────────────────────────────────────────────────┤
│ 共 8 条           < 1  2 >                   1-20/8       │
└────────────────────────────────────────────────────────────┘
```

#### 与学员列表页的差异

| 维度 | 学员列表 | 班级列表 |
|------|----------|----------|
| 标题 | "学员管理" | "班级管理" |
| 搜索占位符 | "搜索学员姓名..." | "搜索班级名称..." |
| 新增按钮 | "+ 新增学员" | "+ 新增班级" |
| 表头列 | 头像 姓名 性别 入学时间 剩余课时 到期时间 状态 操作 | 名称 级别 学员数 课程数 状态 操作 |
| 头像列 | 有 | 无（班级无头像） |
| 预警提示 | 剩余课时/到期时间 | 无 |

#### 班级状态徽章

| 状态 | 样式 |
|------|------|
| 正常 | `bg-green-500/10 text-green-600 px-2.5 py-1 rounded-full text-[12px] font-medium` |
| 已结业 | `bg-black/[0.06] text-[#6E6E73] px-2.5 py-1 rounded-full text-[12px] font-medium` |
| 暂停 | `bg-orange-500/10 text-orange-600 px-2.5 py-1 rounded-full text-[12px] font-medium` |

---

### 4.3c 班级详情页（`/classes/[id]`）

#### 整体布局

```
[面包屑：首页 / 班级管理 / 少儿基础班]

┌─────────────────────────────────────────────────────────────┐
│ [返回]                                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  班级名称          状态                                  ││
│  │  少儿基础班         正常                                  ││
│  │                                                         ││
│  │  级别：白带    人数上限：30人    当前人数：18人           ││
│  │   createdAt: 2024-01-15                                   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  班级学员                                                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ 👤   │ │ 👤   │ │ 👤   │ │ 👤   │ │ 👤   │ │ 👤   │    │
│  │ 张小明│ │ 李小红│ │ 王大力│ │ ...  │ │      │ │      │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  近期课程                                                    │
│  ┌──┬──────────┬──────────────┬────────────┐               │
│  │  │ 课程名称  │ 上课时间      │ 教练       │               │
│  ├──┼──────────┼──────────────┼────────────┤               │
│  │  │ 周二基础课│ 周二 16:00   │ 李教练     │               │
│  │  │ 周四提高课│ 周四 16:00   │ 王教练     │               │
│  └──┴──────────┴──────────────┴────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

#### 顶部信息卡

白色卡片，`bg-white rounded-[20px] p-8`

- 返回按钮：`text-[#6E6E73] hover:text-[#1D1D1F] text-[14px] mb-4 flex items-center gap-1`
- 班级名称：`text-[28px] font-bold text-[#1D1D1F]`
- 状态徽章：跟在名称后，`ml-3`，pill 形状（正常/已结业/暂停）
- 信息行：`mt-4 flex flex-wrap gap-x-6 gap-y-2`
  - 级别：`Trophy` 图标 + belt 级别名称
  - 人数上限：`Users` 图标 + "人数上限：X人"
  - 当前人数：`Users` 图标 + "当前人数：X人"
  - 创建时间：`Calendar` 图标 + "创建时间：YYYY-MM-DD"

#### 学员网格卡片

白色卡片，`bg-white rounded-[20px] p-6 mt-6`

- 标题：`Users` 图标 `w-5 h-5 text-blue-500 mr-2` + "班级学员" + `text-[13px] text-[#6E6E73] ml-auto` "共 X 人"
- 网格：`grid-cols-6 gap-4`
- 每个学员卡片：`bg-black/[0.04] rounded-[14px] p-4 text-center hover:bg-black/[0.08] transition-colors cursor-pointer`
  - 头像：`w-12 h-12 rounded-xl mx-auto object-cover`（无照片则显示首字母占位）
  - 姓名：`text-[14px] font-medium text-[#1D1D1F] mt-2 truncate`
  - 剩余课时：`text-[12px] text-[#6E6E73] mt-0.5`
- 空状态：`Users w-12 h-12 text-[#A1A1A6] mx-auto mb-3` + "暂无学员" + "点击下方"编辑班级"添加学员"

#### 近期课程列表

白色卡片，`bg-white rounded-[20px] p-6 mt-6`

- 标题：`CalendarDays` 图标 `w-5 h-5 text-blue-500 mr-2` + "近期课程"
- 表格列：课程名称、上课时间、教练
- 空状态：`CalendarX w-12 h-12 text-[#A1A1A6] mx-auto mb-3` + "暂无课程安排"

---

### 4.7c 班级表单页（新增/编辑）

#### 整体布局

```
[面包屑：首页 / 班级管理 / 新增班级]
[标题：新增班级]

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  基本信息                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  班级名称 *                                             │  │
│  │  [________]                                            │  │
│  │                                                      │  │
│  │  级别 *                                                 │  │
│  │  [ 白带 ▼ ]                                            │  │
│  │                                                      │  │
│  │  人数上限                                               │  │
│  │  [________]                                            │  │
│  │                                                      │  │
│  │  班级状态                                               │  │
│  │  [ 正常 | 已结业 | 暂停 ]                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  班级学员                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  ☑ 张小明（白带 · 剩余24课时）                        │  │
│  │  ☑ 李小红（黄带 · 剩余18课时）                        │  │
│  │  ☐ 王大力（蓝带 · 剩余6课时）                         │  │
│  │  ☐ ...                                                │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                                    [取消]  [保存]           │
└─────────────────────────────────────────────────────────────┘
```

#### 与学员表单的差异

| 维度 | 学员表单 | 班级表单 |
|------|----------|----------|
| 页面标题 | "新增学员" / "编辑学员" | "新增班级" / "编辑班级" |
| 分组标题 | "基本信息" / "课务信息" | "基本信息" / "班级学员" |
| 基本信息字段 | 姓名/性别/出生日期/身份证号/电话 | 班级名称/级别/人数上限/班级状态 |
| 照片采集 | 有 | 无 |
| 状态选项 | 在籍 / 已结业 / 暂停 | 正常 / 已结业 / 暂停 |
| 学员多选 | 无（底部"所属班级"checkbox） | 有（"班级学员"区域，全量学员 checkbox 多选） |

#### 班级学员选择区域

白色卡片，`bg-white rounded-[20px] p-6`

- 标题：`text-[17px] font-semibold text-[#1D1D1F] mb-6 flex items-center gap-2`
  - 左侧色条 `w-1 h-5 bg-accent rounded-full`
  - 文字 "班级学员" + `text-[13px] text-[#6E6E73] ml-auto` "已选 X 人"
- 学员列表：`max-h-[320px] overflow-auto space-y-2`
  - 每个学员项：`flex items-center gap-3 p-3 rounded-[10px] hover:bg-black/[0.04] transition-colors`
    - Checkbox：`w-4 h-4 rounded border-[#D1D1D6] accent-accent`
    - 头像：`w-8 h-8 rounded-lg object-cover`（无照片则首字母占位）
    - 姓名：`text-[15px] text-[#1D1D1F]`
    - 级别标签：`text-[12px] text-[#6E6E73] ml-auto`
    - 剩余课时：`text-[12px] text-[#6E6E73]`
- 空状态：`Users w-12 h-12 text-[#A1A1A6] mx-auto mb-3` + "暂无在籍学员" + "请先添加学员"

#### 教练状态徽章

| 状态 | 样式 |
|------|------|
| 在职 | `bg-green-500/10 text-green-600 px-2.5 py-1 rounded-full text-[12px] font-medium` |
| 离职 | `bg-black/[0.06] text-[#6E6E73] px-2.5 py-1 rounded-full text-[12px] font-medium` |
| 休假 | `bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full text-[12px] font-medium` |

---

### 4.3 学员详情页（`/students/[id]`）

**核心目标**：美观专业的只读展示页，面向学员和家长，呈现 Apple 原生应用般的精致感。

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

白色卡片，`bg-white rounded-[20px] p-8`，无阴影

**左侧区域（占 30%）—— 学员大头像**：
- 照片容器：`w-36 h-36 rounded-[20px] overflow-hidden`（**大圆角方形**，无边框）
- 有照片：`<img src={photoUrl} className="w-full h-full object-cover" />`
- 无照片：占位头像 `bg-black/[0.06] flex items-center justify-center`
  - 图标 `User w-16 h-16 text-[#A1A1A6]`
  - 或姓名首字母 `text-4xl font-bold text-[#A1A1A6]`
- 照片下方：学员姓名 `text-[17px] font-semibold text-center mt-4 text-[#1D1D1F]`
- 照片悬停效果（管理员视角）：半透明遮罩 `bg-black/30` + "更换照片" 提示

**右侧区域（占 70%）**：
- 返回按钮：`text-[#6E6E73] hover:text-[#1D1D1F] text-[14px] mb-4 flex items-center gap-1`
- 学员姓名：`text-[28px] font-bold text-[#1D1D1F]`，旁边性别图标（男 `Mars` / 女 `Venus`），`w-5 h-5 text-[#A1A1A6] ml-2`
- 状态徽章：跟在姓名后，`ml-3`，pill 形状
- 信息行：`mt-4 flex flex-wrap gap-x-6 gap-y-2`
  - 每项：`flex items-center gap-2 text-[15px] text-[#6E6E73]`
  - 图标 + 文字，如 `📞 13800138001` / `📅 入学 2024-01-15`
- **所属班级标签**：`mt-4 flex flex-wrap gap-2`
  - 每个班级：`bg-black/[0.06] text-[#6E6E73] px-2.5 py-1 rounded-full text-[12px] font-medium flex items-center gap-1`
    - `GraduationCap` 图标 `w-3 h-3`
    - 班级名称 + 级别，如 "少儿基础班 · 白带"
  - 无班级时显示 `text-[#A1A1A6] text-[13px]` "暂未分配班级"
- 环形进度图（Recharts）：展示 `剩余课时 / 总课时`
  - 圆环主色：`#D9264A`（accent）
  - 背景色：`bg-black/[0.06]`
  - 中心文字：剩余课时大数字 `text-[22px] font-bold` + "剩余课时" 标签 `text-[13px] text-[#6E6E73]`
- 到期倒计时：到期时间 `text-[17px] font-semibold` + 剩余天数 pill 徽章
  - 正常：`bg-green-500/10 text-green-600`
  - 即将到期（≤30天）：`bg-orange-500/10 text-orange-600`
  - 已过期：`bg-red-500/10 text-red-500`

#### 成长时间线

白色卡片，`bg-white rounded-[20px] p-6 mt-6`

**卡片头部**：`flex items-center justify-between mb-6`
- 标题：`text-[17px] font-semibold text-[#1D1D1F]`，左侧带 `Trophy` 图标 `w-5 h-5 text-purple-500 mr-2`
- 右侧："共 X 次考级" `text-[13px] text-[#6E6E73]`

**时间线设计**：纵向时间线
- 时间轴：左侧竖线 `w-[1.5px] bg-black/[0.08] absolute left-6 top-0 bottom-0`
- 每个节点：`relative pl-12 pb-8 last:pb-0`
  - 节点圆点：`absolute left-0 w-5 h-5 rounded-full`
    - 最新节点：`bg-accent`（实心）
    - 其他节点：`bg-white border-2 border-black/[0.12]`
  - 日期：`text-[12px] text-[#A1A1A6] mb-1`
  - Belt 级别名称：`text-[17px] font-semibold`
    - 白带-绿带：`text-[#1D1D1F]`
    - 蓝带-红带：`text-blue-600`
    - 红黑带-黑带：`text-purple-600 font-bold`（高阶带位高亮）
  - 备注（如有）：`text-[14px] text-[#6E6E73] mt-1`

**Belt 颜色编码**：每个 belt 级别用对应颜色的细竖条标识 `w-[3px] h-full absolute left-0 rounded-full`

#### 比赛记录表格

白色卡片，`bg-white rounded-[20px] p-6`

- 标题行：`flex items-center mb-4`，`Award` 图标 `w-5 h-5 text-purple-500 mr-2` + "比赛记录"
- 表格样式同学员列表页的表格，列：日期、比赛名称、组别、成绩、获奖
- 空状态：`text-center py-8`，图标 `Award w-12 h-12 text-[#A1A1A6] mx-auto mb-3` + "暂无比赛记录" `text-[14px] text-[#6E6E73]`

#### 集训记录卡片网格

白色卡片，`bg-white rounded-[20px] p-6`

- 标题行：`MapPin` 图标 `w-5 h-5 text-blue-500 mr-2` + "集训与拓展记录"
- 网格：`grid-cols-3 gap-4`
- 每张卡片：`bg-black/[0.04] rounded-[14px] p-4`
  - 日期：`text-[12px] text-[#A1A1A6]`
  - 活动名：`text-[15px] font-semibold text-[#1D1D1F] mt-1`
  - 地点：`text-[12px] text-[#6E6E73] mt-1 flex items-center gap-1` + `MapPin w-3 h-3`
  - 时长：`text-[12px] text-[#6E6E73] mt-1`

#### 考勤统计区

白色卡片，`bg-white rounded-[20px] p-6 mt-6`

- 标题：`BarChart3` 图标 `w-5 h-5 text-blue-500 mr-2` + "考勤统计"
- 柱状图（Recharts）：
  - X 轴：近 6 个月（YYYY-MM）
  - Y 轴：出勤率 %
  - 柱子颜色：`#D9264A`，圆角顶部
  - 网格线：`bg-black/[0.06]` 虚线
  - 高度：`240px`
- 最近考勤记录列表（图下方）：
  - 最多 10 条
  - 每行：`flex items-center justify-between py-2.5 border-b border-black/[0.04]`
    - 左侧：日期 `text-[15px] text-[#6E6E73]` + 课程名 `text-[15px] text-[#1D1D1F] ml-4`
    - 右侧：状态 pill 徽章（同功能色定义）

#### 考级管理页（`/grading`）

**页面结构**：分栏布局，左栏占 60%，右栏占 40%，间距 `gap-5`。

**顶部操作栏**：`flex items-center justify-between mb-4`
- 左侧筛选区：`flex items-center gap-3`
  - 班级下拉：`bg-black/[0.06] border-0 rounded-[10px] px-3 py-2 text-[14px]`
  - 搜索框：带 `Search w-4 h-4` 图标，占位符"搜索学员姓名..."
  - 全选复选框：`text-[14px] text-[#1D1D1F]`
  - 已选人数：`text-[13px] text-[#0071E3] font-medium`
- 右侧清空按钮：`text-[13px] text-[#6E6E73] hover:text-[#1D1D1F]`

**左栏：学员选择列表**

白色卡片，`bg-white rounded-[20px] overflow-hidden`，高度 `h-[calc(100vh-220px)]` 或自适应。

表格样式同学员列表页：
- 表头：`border-b border-black/[0.04]`，`text-[13px] font-medium text-[#6E6E73]`
- 列：复选框、姓名、性别、当前带位、班级
- 行：`hover:bg-black/[0.04] border-b border-black/[0.04]`
- 当前带位用 pill 徽章展示，无记录显示"—" `text-[#A1A1A6]`
- 班级标签：`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/[0.04] text-[12px] text-[#6E6E73]`

**右栏：考级信息表单**

白色卡片，`bg-white rounded-[20px] p-6`，sticky 定位跟随滚动。

表单字段：
- 标签：`text-[14px] font-medium text-[#1D1D1F] mb-2`
- 输入框/下拉：`bg-black/[0.06] border-0 rounded-[10px] h-10 px-3 text-[14px] text-[#1D1D1F] focus:ring-2 focus:ring-[#1D1D1F]/10 focus:bg-white`
- 日期输入：type="date"，默认值为当天
- 腰带级别下拉：11 级枚举，选项文字使用中文（白带、白黄带、黄带...）
- 备注：可选字段，placeholder 提示"选填"

已选提示：`text-[13px] text-[#6E6E73] mt-4`，图标 `Users w-4 h-4 mr-1`
- 示例："💡 将为 5 名学员录入考级信息"

提交按钮：`w-full h-11 rounded-full bg-[#1D1D1F] text-white text-[14px] font-medium hover:bg-black/80 disabled:opacity-40`
- 未选学员时：disabled，文字"请先选择学员"
- 已选学员时：文字"为 N 名学员录入考级信息"

**空状态**：当筛选结果为空时，列表区展示 `Search w-12 h-12 text-[#A1A1A6] mx-auto mb-3` + "未找到匹配的学员" `text-[14px] text-[#6E6E73]`

**成功反馈**：提交成功后，页面顶部显示 Toast 提示（可复用全局 toast 样式）："成功为 5 名学员录入考级记录"，随后清空选择态并刷新列表。

#### 考级记录列表（页面下半部分）

白色卡片，`bg-white rounded-[20px] overflow-hidden`

**卡片头部**：`px-5 pt-5 pb-3 flex items-center gap-2`
- 图标：`Award w-5 h-5 text-purple-500`
- 标题：`text-[17px] font-semibold text-[#1D1D1F]` "考级记录"
- 数量：`text-[13px] text-[#6E6E73] ml-2` "共 X 条"

**表格样式**：
- 表头：同学员列表页表头样式
- 列：学员姓名、考试日期、腰带级别、备注、操作
- 腰带级别：`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-[12px] font-medium`
- 备注：`text-[14px] text-[#6E6E73] max-w-[200px] truncate`
- 操作列：`flex justify-end gap-2`
  - 编辑按钮：`Pencil w-4 h-4`，颜色 `text-[#6E6E73] hover:text-[#1D1D1F]`
  - 删除按钮：`Trash2 w-4 h-4`，颜色 `text-[#FF3B30] hover:text-[#FF3B30]`
- 空状态：`text-center py-12 text-[#A1A1A6]` "暂无考级记录"

#### 编辑弹窗

白色弹窗，`bg-white rounded-[20px] border-black/[0.06] max-w-md`

**弹窗头部**：`DialogTitle text-[17px] font-semibold text-[#1D1D1F]` "编辑考级记录"

**表单字段**（同录入表单样式）：
- 学员：只读展示，`h-10 px-3 flex items-center bg-black/[0.04] rounded-[10px] text-[14px] text-[#6E6E73]`
- 考试日期：type="date"
- 腰带级别：下拉选择
- 备注：输入框

**底部按钮**：`flex gap-3 pt-2`
- 取消：`flex-1 h-10 rounded-full border-black/[0.08] text-[#6E6E73]`
- 保存：`flex-1 h-10 rounded-full bg-[#1D1D1F] text-white`

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

白色卡片，`bg-white rounded-[20px] p-8`

**左侧区域（占 30%）—— 教练大头像**：
- 与学员详情页完全一致：照片容器 `w-36 h-36 rounded-[20px] overflow-hidden`
- 有照片：`<img>` `object-cover`
- 无照片：占位头像 `bg-black/[0.06]` + `User` 图标 `w-16 h-16 text-[#A1A1A6]` 或姓名首字母

**右侧区域（占 70%）**：
- 返回按钮
- 教练姓名 `text-[28px] font-bold text-[#1D1D1F]` + 性别图标
- 在职状态徽章（在职/离职/休假），pill 形状
- 信息行：电话、执教时间
- **执教年限**：根据 `joinDate` 自动计算，如"执教 3 年 2 个月" `text-[17px] font-semibold text-purple-600`

#### 个人简介卡片

白色卡片，`bg-white rounded-[20px] p-6 mt-6`

- 标题：`text-[17px] font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2`
  - `FileText` 图标 `w-5 h-5 text-[#6E6E73] mr-1` + "个人简介"
- 内容：`text-[15px] text-[#6E6E73] leading-relaxed whitespace-pre-line`
  - 如果 `bio` 为空：显示 `text-[#A1A1A6] italic` "暂无简介"

#### 所授课程列表

白色卡片，`bg-white rounded-[20px] p-6 mt-6`

- 标题：`CalendarDays` 图标 `w-5 h-5 text-blue-500 mr-2` + "所授课程"
- 表格列：课程名称、上课时间、学员人数
- 空状态：`CalendarX w-12 h-12 text-[#A1A1A6] mx-auto mb-3` + "暂无授课记录"



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

背景：`bg-white/70 backdrop-blur-xl border-r border-black/[0.04] p-5`

**快速创建课程表单**：
- 标题：`text-[14px] font-semibold text-[#1D1D1F] mb-3`
- 表单字段（紧凑版）：
  - 课程名称：`input` `bg-black/[0.06] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px] text-[#1D1D1F] placeholder:text-[#A1A1A6] focus:ring-2 focus:ring-accent/20 focus:bg-white`，placeholder "课程名称"
  - 日期时间：并排两个 `input type="datetime-local"`，同上样式
  - 课程类型：下拉选择，`regular` / `exam_prep` / `camp` / `competition`
  - **教练**：下拉选择框（从 Coach 表中选择），展示教练头像 + 姓名
    - 触发器：`flex items-center gap-2 bg-black/[0.06] border-0 rounded-[10px] px-3.5 py-2.5 text-[14px]`
      - 左侧教练头像 `w-6 h-6 rounded-lg object-cover`（无照片则显示首字母占位）
      - 教练姓名 `text-[#1D1D1F]`
      - 右侧下拉箭头 `ChevronDown w-4 h-4 text-[#A1A1A6] ml-auto`
    - 下拉面板：
      - `bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-black/[0.04] py-2`
      - 在职教练列表，按姓名排序
      - 每项：`flex items-center gap-3 px-3.5 py-2.5 hover:bg-black/[0.06] cursor-pointer`
        - 头像 `w-8 h-8 rounded-lg`
        - 姓名 `text-[14px] text-[#1D1D1F]`
      - 选中项：`bg-accent/10 text-accent font-medium`
      - 底部："+ 新增教练" 快捷链接 `text-[12px] text-accent hover:underline px-3.5 py-2`
    - 无教练选项：列表顶部添加 "不指定教练" 选项
  - 地点：`input` 同上样式，placeholder "上课地点"
- 提交按钮：`w-full bg-accent text-white py-2.5 rounded-full text-[14px] font-medium mt-3`

#### 日历主区域

**FullCalendar 自定义样式**：

| 元素 | 样式 |
|------|------|
| 日历头部工具栏 | 透明背景，按钮圆角 `rounded-full` |
| "今天" 按钮 | `bg-accent text-white px-4 py-2 rounded-full text-[14px] font-medium` |
| 上/下箭头按钮 | `bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1] w-9 h-9 rounded-full flex items-center justify-center` |
| 视图切换按钮组 | `bg-black/[0.06] rounded-full overflow-hidden p-0.5`，激活项 `bg-[#1D1D1F] text-white rounded-full px-3 py-1.5` |
| 月视图网格 | 单元格最小高度 `120px`，边框 `border-black/[0.04]` |
| 日期数字 | `text-[14px] text-[#1D1D1F]`，今天高亮 `bg-accent text-white w-7 h-7 rounded-full flex items-center justify-center` |

**课程事件卡片（日历格内）**：

```
┌────────────────────┐
│ 09:00-10:30        │
│   少儿基础班         │
│   👤 李教练         │
└────────────────────┘
```

- 容器：`rounded-lg px-2 py-1.5 text-[12px] cursor-pointer hover:opacity-80 transition-opacity bg-black/[0.06]`
- 文字：`text-[#1D1D1F]`

#### 课程详情/创建抽屉面板

右侧滑出抽屉：`fixed right-0 top-0 h-full bg-white w-[420px] flex flex-col rounded-l-[20px] shadow-[-8px_0_40px_rgba(0,0,0,0.08)] z-50`
- 动画：`animate-in slide-in-from-right duration-300 ease-out`
- 头部：`p-5`，标题 `text-[17px] font-semibold text-[#1D1D1F]` + 关闭按钮 `X w-5 h-5 text-[#A1A1A6] hover:text-[#1D1D1F] rounded-full hover:bg-black/[0.06] w-8 h-8 flex items-center justify-center`
- 内容区：`flex-1 overflow-auto p-5`
- 底部操作栏：`p-5 flex gap-3`
  - "编辑" 按钮：`flex-1 bg-black/[0.06] text-[#1D1D1F] py-2.5 rounded-full text-[14px] font-medium hover:bg-black/[0.1]`
  - "开始点名" 按钮：`flex-1 bg-accent text-white py-2.5 rounded-full text-[14px] font-medium hover:opacity-90`

**抽屉表单字段（编辑/创建课程）**：
- 课程名称、日期时间、教练、地点 —— 同左侧快速创建表单
- **所属班级**：下拉选择框（必填），同左侧表单样式
- ~~报名学员多选区域~~（已移除，学员从班级自动关联）

---

### 4.5 点名模态框（Attendance Modal）

**触发**：在课程详情面板点击"开始点名"

#### 模态框设计

居中模态框，`max-w-2xl w-full mx-auto`

- 遮罩：`fixed inset-0 bg-black/25 backdrop-blur-md z-50 flex items-center justify-center`
- 容器：`bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] w-full mx-4 overflow-hidden`

**头部**：`px-6 py-5`
- 课程名：`text-[20px] font-semibold text-[#1D1D1F]`
- 时间/教练/班级：`text-[14px] text-[#6E6E73] mt-1`
  - 格式：`📅 周二 16:00-17:30  ·  👤 李教练  ·  🎓 少儿基础班（18人）`
  - `GraduationCap` 图标 `w-3.5 h-3.5 text-[#A1A1A6]` 标识班级
- 右侧："全部出勤" 快捷按钮 `bg-green-500 text-white px-4 py-2 rounded-full text-[14px] font-medium hover:opacity-90`

> 头部与内容区之间**不设置 border-b**，靠 `pb-5` 与内容区的 `pt-0` 自然分隔。

**学员名单来源**：
- 优先从课程所属班级获取学员名单
- 若课程无班级，则显示空状态提示 "该课程未关联班级，请先为课程设置所属班级"

**学员列表区**：`max-h-[60vh] overflow-auto`
- 每行：`flex items-center px-6 py-3 border-b border-black/[0.04] hover:bg-black/[0.04] transition-colors duration-150`
- 左侧：
  - 学员头像：有照片则 `w-9 h-9 rounded-lg object-cover`，无照片则 `w-9 h-9 rounded-lg bg-black/[0.06] flex items-center justify-center text-[12px] font-bold text-[#A1A1A6]`
  - 姓名：`text-[15px] font-medium text-[#1D1D1F] ml-3`
  - 剩余课时：`text-[12px] text-[#6E6E73] ml-2`
    - 正常：`text-[#6E6E73]`
    - ≤5次：`text-orange-600 font-medium`
    - 0次：`text-red-500 font-bold`
- 右侧：状态选择器（5 个 pill 单选按钮组成的按钮组）

**状态按钮组**：`flex gap-1.5`

| 状态 | 默认 | 选中 |
|------|------|------|
| 未点名 | `bg-black/[0.06] text-[#A1A1A6] rounded-full` | — |
| 出勤 | `hover:bg-green-500/10 hover:text-green-600 rounded-full` | `bg-green-500 text-white rounded-full` |
| 缺勤 | `hover:bg-red-500/10 hover:text-red-500 rounded-full` | `bg-red-500 text-white rounded-full` |
| 迟到 | `hover:bg-orange-500/10 hover:text-orange-600 rounded-full` | `bg-orange-500 text-white rounded-full` |
| 请假 | `hover:bg-blue-500/10 hover:text-blue-500 rounded-full` | `bg-blue-500 text-white rounded-full` |

按钮样式：`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors duration-150`

**底部**：`px-6 py-5 flex justify-between items-center`
- 左侧：已点 X / 共 Y 人 `text-[14px] text-[#6E6E73]`
- 右侧：
  - "取消"：`bg-black/[0.06] text-[#1D1D1F] px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-black/[0.1]`
  - "提交点名"：`bg-accent text-white px-6 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90`

---

### 4.6 AI 对话页（`/ai`）

#### 整体布局（全屏聊天界面）

参照 Apple Messages / macOS ChatGPT 客户端风格：

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

全屏高度减去输入区，`flex-1 overflow-auto p-6 space-y-5`

**背景**：`bg-[#F5F5F7]`（secondary-background），非纯白

**AI 消息气泡**：
- 容器：`flex items-start gap-3`
- AI 头像：`w-8 h-8 rounded-lg bg-accent flex items-center justify-center`
  - 内部图标 `Sparkles w-5 h-5 text-white`
- 气泡：`bg-white rounded-[18px] rounded-tl-sm px-4 py-3 max-w-[80%]`
  - 去除阴影！纯白气泡在灰色背景上自然可见
- 文字：`text-[15px] text-[#1D1D1F] leading-relaxed`
- 时间戳：`text-[12px] text-[#A1A1A6] mt-1`

**用户消息气泡**：
- 容器：`flex items-start gap-3 flex-row-reverse`
- 气泡：`bg-accent text-white rounded-[18px] rounded-tr-sm px-4 py-3 max-w-[80%]`
  - 从深色 slate 改为品牌强调色，更 Apple Messages 风格
- 文字：`text-[15px] leading-relaxed`

**工具调用状态卡片**：
- 嵌套在 AI 消息气泡内
- `bg-black/[0.04] rounded-[14px] p-3 mt-2`
- 标题：`text-[12px] font-medium text-[#6E6E73] flex items-center gap-2`
  - 加载中：`Loader2 w-3 h-3 animate-spin`
  - 完成：`CheckCircle w-3 h-3 text-green-500`
- 内容：`text-[12px] text-[#A1A1A6] mt-1`
  - 工具名 + 参数摘要

#### 快捷指令栏

输入框上方，`p-3 bg-white border-t border-black/[0.04]`

水平滚动条：`flex gap-2 overflow-x-auto`

快捷按钮：
- `bg-black/[0.06] hover:bg-accent/10 hover:text-accent text-[#6E6E73] px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors duration-150`
- 预置指令：
  - "查看今日课程" + `CalendarDays w-3 h-3 mr-1`
  - "搜索学员" + `Users w-3 h-3 mr-1`
  - "开始点名" + `ClipboardCheck w-3 h-3 mr-1`
  - "创建课程" + `Plus w-3 h-3 mr-1`

#### 输入框区

固定在底部，`p-4 bg-white border-t border-black/[0.04]`

```
┌────────────────────────────────────────────────────────────┐
│ [📎] [输入指令...                           ] [➤ 发送]     │
└────────────────────────────────────────────────────────────┘
```

- 容器：`flex items-center gap-3`
- 输入框：`flex-1 bg-black/[0.06] rounded-full px-5 py-3 text-[15px] text-[#1D1D1F] placeholder:text-[#A1A1A6] border-0 focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all duration-200 resize-none`
- 发送按钮：`w-9 h-9 bg-accent text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity`
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
│  │  [________]      [ ○男  ○女 ]                        │  │
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
│  │  [ 在籍 | 已结业 | 暂停 ]                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  所属班级                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  ☑ 少儿基础班（白带）                                 │  │
│  │  ☐ 竞技提高班（蓝带）                                 │  │
│  │  ☐ 成人班（黑带）                                     │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                                    [取消]  [保存]           │
└─────────────────────────────────────────────────────────────┘
```

#### 照片采集区域

白色卡片，`bg-white rounded-[20px] p-8 mb-6`

**卡片标题**：`text-[17px] font-semibold text-[#1D1D1F] mb-6 flex items-center gap-2`
- 左侧色条 `w-1 h-5 bg-accent rounded-full`
- 文字 "学员照片"

**照片预览区**：居中 `flex flex-col items-center`

- 预览容器：`w-48 h-48 rounded-[20px] overflow-hidden border-2 border-dashed border-black/[0.12] bg-black/[0.04] flex items-center justify-center transition-all duration-200`
  - 有照片时边框变为实线 `border-solid border-accent/20`
  - 悬停时 `border-accent/40 bg-accent/[0.02]`

- **无照片状态**：
  - `User` 图标 `w-16 h-16 text-[#A1A1A6]`
  - 文字 `text-[14px] text-[#A1A1A6] mt-2` "暂无照片"

- **有照片状态**（预览/已保存）：
  - `<img>` `w-full h-full object-cover`
  - 悬停遮罩：`absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-[20px]`
  - 遮罩文字：`text-white text-[14px] font-medium` "更换照片"

**操作按钮组**：`flex gap-3 justify-center mt-6`

| 按钮 | 图标 | 样式 | 功能 |
|------|------|------|------|
| **打开摄像头** | `Camera` | `bg-accent text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90 flex items-center gap-2` | 调起摄像头拍照 |
| **选择文件** | `FolderOpen` | `bg-black/[0.06] text-[#1D1D1F] px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-black/[0.1] flex items-center gap-2` | 打开文件选择器 |
| **清除照片** | `Trash2` | `text-[#A1A1A6] hover:text-red-500 px-3 py-2 rounded-full hover:bg-red-500/10 transition-colors` | 清除已选照片 |

- 隐藏的文件输入：`<input type="file" accept="image/*" className="hidden" ref={fileInputRef} />`

**头像列特殊交互**：点击"选择文件"按钮时触发隐藏的 `input[type=file]` 点击事件。

#### 所属班级区域

白色卡片，`bg-white rounded-[20px] p-6`，位于"课务信息"卡片下方

- 标题：`text-[17px] font-semibold text-[#1D1D1F] mb-6 flex items-center gap-2`
  - 左侧色条 `w-1 h-5 bg-accent rounded-full`
  - 文字 "所属班级"
- 班级列表：`space-y-2`
  - 每个班级项：`flex items-center gap-3 p-2.5 rounded-[10px] hover:bg-black/[0.04] transition-colors`
    - Checkbox：`w-4 h-4 rounded border-[#D1D1D6] accent-accent`
    - `GraduationCap` 图标 `w-4 h-4 text-[#6E6E73]`
    - 班级名称：`text-[15px] text-[#1D1D1F]`
    - 级别标签：`text-[12px] text-[#6E6E73] ml-auto`
  - 无班级可选项时显示：`text-[#A1A1A6] text-[14px] py-4 text-center` "暂无可选班级"

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
│  │  [________]      [ ○男  ○女 ]                        │  │
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
│  │  [ 在职 | 离职 | 休假 ]                               │  │
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
| 个人简介 | 无 | `<textarea>` 多行文本框，`h-24 resize-none bg-black/[0.06] border-0 rounded-[10px] px-3.5 py-2.5 text-[15px] placeholder:text-[#A1A1A6] focus:ring-2 focus:ring-accent/20 focus:bg-white`，placeholder "填写个人简介、工作经历..." |
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

**遮罩**：`fixed inset-0 bg-black/25 backdrop-blur-md z-50 flex items-center justify-center`
**容器**：`bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-w-lg w-full mx-4 overflow-hidden`
**动画**：`animate-in fade-in zoom-in-[0.98] duration-200`

**头部**：`px-6 py-5 flex items-center gap-3`
- `Camera` 图标 `w-5 h-5 text-accent`
- 标题 `text-[17px] font-semibold text-[#1D1D1F]` "拍照"
- 关闭按钮：`X w-5 h-5 text-[#A1A1A6] hover:text-[#1D1D1F] ml-auto rounded-full hover:bg-black/[0.06] w-8 h-8 flex items-center justify-center`

> 头部与内容区之间**不设置 border-b**。

**视频区域**：`relative bg-black aspect-[4/3]`
- `<video>` 元素 `w-full h-full object-cover rounded-b-[20px]`
- **权限请求状态**：居中显示
  - `Camera w-12 h-12 text-[#A1A1A6] mb-3`
  - `text-[14px] text-[#6E6E73]` "请允许使用摄像头进行拍照"
  - "请求权限" 按钮：`bg-accent text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90 mt-3`
- **加载状态**：`Loader2 w-8 h-8 text-white animate-spin mx-auto`
- **错误状态**：
  - `AlertCircle w-12 h-12 text-red-500 mb-3`
  - `text-[14px] text-red-500` "无法访问摄像头"
  - `text-[12px] text-[#6E6E73] mt-1` "请检查摄像头连接和权限设置"

**操作栏**：`px-6 py-5 flex justify-center gap-4`

**状态 1 —— 实时预览中**：
- 快门按钮（居中突出）：
  - `w-16 h-16 rounded-full bg-accent hover:opacity-90 text-white flex items-center justify-center transition-opacity`
  - 内部：`Camera w-7 h-7`
- 取消按钮：`text-[#6E6E73] hover:text-[#1D1D1F] text-[14px] px-4 py-2 rounded-full hover:bg-black/[0.06]`

**状态 2 —— 已拍照，待确认**：
- 视频暂停，显示定格画面
- "重拍" 按钮：`bg-black/[0.06] text-[#1D1D1F] hover:bg-black/[0.1] px-4 py-2 rounded-full text-[14px] font-medium flex items-center gap-1`
  - `RotateCcw w-4 h-4` + "重拍"
- "确认使用" 按钮：`bg-accent text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90 flex items-center gap-1`
  - `Check w-4 h-4` + "确认使用"

**视频帧转图片后的处理**：
1. 关闭模态框
2. 表单照片预览区显示拍到的照片
3. 照片文件对象保存到组件 state，随表单一起提交

---

## 5. 组件设计规范

### 5.1 按钮（Button）

全面采用 pill 形状（`rounded-full`）或大圆角，废除小圆角方形按钮。

| 变体 | 默认 | Hover | 禁用 |
|------|------|-------|------|
| **Primary** | `bg-accent text-white rounded-full px-5 py-2.5 text-[14px] font-medium` | `opacity-90` | `opacity-50 cursor-not-allowed` |
| **Secondary** | `bg-black/[0.06] text-[#1D1D1F] rounded-full px-5 py-2.5 text-[14px] font-medium` | `bg-black/[0.1]` | `opacity-50 cursor-not-allowed` |
| **Ghost** | `bg-transparent text-accent rounded-full px-4 py-2 text-[14px] font-medium` | `bg-accent/10` | `opacity-50 cursor-not-allowed` |
| **Danger** | `bg-red-500/10 text-red-500 rounded-full px-5 py-2.5 text-[14px] font-medium` | `bg-red-500/20` | `opacity-50 cursor-not-allowed` |
| **Icon** | `w-9 h-9 rounded-full bg-transparent flex items-center justify-center` | `bg-black/[0.06]` | `opacity-50 cursor-not-allowed` |

**统一特征**：
- 过渡：`transition-all duration-150`
- **去除** `hover:-translate-y-0.5` 上浮效果（Apple 不使用位移反馈）
- **去除** shadow 变化作为 hover 反馈

### 5.2 卡片（Card）

**基础卡片**：
```
bg-white rounded-[20px]
```
- **废除** `shadow-sm`！在 `bg-[#F5F5F7]` 页面上，纯白卡片自然形成层级
- **废除** `border`，除非在纯白背景上需要边界

**卡片变体**：

| 变体 | 样式 | 用途 |
|------|------|------|
| **默认** | `bg-white rounded-[20px]` | 一般内容容器 |
| **hoverable** | + `hover:bg-black/[0.04] transition-colors duration-150` | 可点击列表项 |
| **分组卡片** | `bg-white rounded-[20px] p-5` | 表单分组、信息面板 |
| **毛玻璃卡片** | `backdrop-blur-xl bg-white/70 rounded-[20px] border border-white/20` | 悬浮提示、特殊面板 |

### 5.3 表格（Table）

**容器**：`bg-white rounded-[20px] overflow-hidden`

**表头**：`px-5 py-3`
- 文字：`text-[13px] font-medium text-[#6E6E73]`
- **去除** `uppercase tracking-wider`

**数据行**：`px-5 py-3.5`
- 默认：`border-b border-black/[0.04] last:border-0`
- hover：`bg-black/[0.04] transition-colors duration-150`
- 文字：`text-[15px] text-[#1D1D1F]`

**空状态**：
- 居中 `text-center py-12`
- 图标：`w-12 h-12 text-[#A1A1A6] mx-auto mb-3`
- 主文字：`text-[14px] text-[#6E6E73]`
- 次文字（可选）：`text-[12px] text-[#A1A1A6] mt-1`

**加载状态**：
- 骨架屏：5 行灰色脉冲条 `animate-pulse`
- 每行：`h-12 bg-black/[0.06] rounded-[10px] mb-2`

### 5.4 模态框（Modal）

- 遮罩：`fixed inset-0 bg-black/25 backdrop-blur-md z-50 flex items-center justify-center`
- 容器：`bg-white rounded-[20px] max-w-lg w-full mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)]`

**结构**：
- 头部：`px-6 py-5`，**去除 border-b**，标题 `text-[17px] font-semibold text-[#1D1D1F]` + 关闭按钮
- 内容：`px-6 py-4 max-h-[60vh] overflow-auto`
- 底部：`px-6 py-5`，**去除 border-t**

**动画**：`animate-in fade-in zoom-in-[0.98] duration-200`

### 5.5 抽屉（Drawer）

- 遮罩同模态框
- 容器：`fixed right-0 top-0 h-full bg-white w-[420px] flex flex-col rounded-l-[20px] shadow-[-8px_0_40px_rgba(0,0,0,0.08)]`
- 头部：`px-5 py-5`，**去除 border-b**
- 内容：`flex-1 overflow-auto p-5`
- 底部：`px-5 py-5`，**去除 border-t**

### 5.6 徽章（Badge）

全部改为 **pill 形状（胶囊形）**：

| 变体 | 样式 |
|------|------|
| **default** | `bg-black/[0.06] text-[#6E6E73] px-2.5 py-1 rounded-full text-[12px] font-medium` |
| **success** | `bg-green-500/10 text-green-600 px-2.5 py-1 rounded-full text-[12px] font-medium` |
| **warning** | `bg-orange-500/10 text-orange-600 px-2.5 py-1 rounded-full text-[12px] font-medium` |
| **danger** | `bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full text-[12px] font-medium` |
| **info** | `bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full text-[12px] font-medium` |
| **accent** | `bg-accent/10 text-accent px-2.5 py-1 rounded-full text-[12px] font-medium` |

### 5.7 Toast 通知

从侧边彩色边框改为**顶部居中毛玻璃悬浮卡片**：

- 位置：`fixed top-4 left-1/2 -translate-x-1/2 z-50`
- 容器：`backdrop-blur-xl bg-white/80 border border-white/20 rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] px-5 py-3 flex items-center gap-3`
- 成功图标：`CheckCircle w-5 h-5 text-green-500`
- 错误图标：`XCircle w-5 h-5 text-red-500`
- 标题：`text-[14px] font-medium text-[#1D1D1F]`
- 动画：`animate-in fade-in slide-in-from-top-2 duration-200`
- 自动消失：3 秒后淡出 `animate-out fade-out slide-out-to-top-2 duration-200`

### 5.8 输入框（Input）

**基础样式**：
```
w-full bg-black/[0.06] rounded-[10px] px-4 py-3 text-[15px] text-[#1D1D1F]
placeholder:text-[#A1A1A6] border-0
focus:outline-none focus:ring-2 focus:ring-accent/20 focus:bg-white
disabled:opacity-50 disabled:cursor-not-allowed
transition-all duration-200
```

**前置图标**：`relative` 容器，图标 `absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1A6] w-4 h-4`，输入框 `pl-10`

**错误状态**：`ring-2 ring-red-500/30 bg-red-500/5`

### 5.9 下拉选择（Select）

**触发器**：同输入框样式，右侧 `ChevronDown w-4 h-4 text-[#A1A1A6]`

**下拉面板**：
- `absolute mt-1 w-full bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-black/[0.04] py-2 z-50`
- 动画：`animate-in fade-in zoom-in-[0.98] duration-100`

**选项**：
- 默认：`px-4 py-2.5 text-[15px] text-[#1D1D1F] hover:bg-black/[0.06] cursor-pointer`
- 选中：`bg-accent/10 text-accent font-medium`
- 分隔线：`border-t border-black/[0.04] my-1`

### 5.10 日期时间选择器

**输入框**：同基础输入框，右侧日历图标 `Calendar w-4 h-4 text-[#A1A1A6]`

**弹出面板**：
- `bg-white rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-black/[0.04] p-5 absolute z-50`
- 日历网格：7 列，日期单元格 `w-10 h-10 rounded-full text-[14px] flex items-center justify-center`
  - 默认：`text-[#1D1D1F] hover:bg-black/[0.06]`
  - 今天：`text-accent font-semibold`
  - 选中：`bg-accent text-white`
  - 其他月份：`text-[#A1A1A6]`
- 时间选择：底部并排小时/分钟下拉

### 5.11 Segmented Control（新增组件）

替代传统的 radio button 组（学员状态、教练状态等），Apple 标志性控件：

- 容器：`bg-black/[0.06] rounded-[10px] p-1 flex`
- 选项：`flex-1 py-2 text-[14px] font-medium text-[#6E6E73] text-center rounded-lg transition-all duration-200`
- 选中：`bg-white text-[#1D1D1F] shadow-sm`
- 悬停未选中：`text-[#1D1D1F]`

**使用场景**：
- 学员状态：在籍 / 已结业 / 暂停
- 教练状态：在职 / 离职 / 休假
- 性别选择：男 / 女

### 5.12 头像组件（Avatar）

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
- `<img>` `w-full h-full object-cover rounded-xl`（圆角方形）
- 外层容器 `overflow-hidden` 保证圆角裁切

**无照片状态（占位头像）**：
- 背景 `bg-black/[0.06]`
- 显示姓名首字母 `font-bold text-[#A1A1A6] uppercase`
- 或显示 `User` 图标 `text-[#A1A1A6]`

**圆角规则**：
- 表格/列表中：`rounded-xl`（圆角方形，Apple 现代审美）
- 详情页大头像：`rounded-[20px]`（大圆角方形）
- 极小头像（xs）：`rounded-lg`

### 5.13 照片采集组件（PhotoCapture）

照片采集组件是系统特色组件，嵌入学员表单中，提供摄像头拍照和文件上传两种方式。

**组件结构**：
```
<PhotoCapture>
  ├── 预览区（PreviewArea）
  │     ├── 有照片 → <img> + 悬停遮罩
  │     └── 无照片 → 占位图标 + 提示文字
  ├── 操作按钮组（ActionButtons）
  │     ├── 打开摄像头按钮（Primary pill）
  │     ├── 选择文件按钮（Secondary pill）
  │     └── 清除照片按钮（Ghost icon）
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
- 点击菜单项：立即切换路由，当前项高亮（`bg-accent/10 text-accent` + 左侧竖条）
- 页面切换过渡：内容区域淡入 `animate-in fade-in duration-200`

**面包屑导航**：
- 可点击项 hover：`text-accent cursor-pointer`
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
| **页面初始加载** | 骨架屏 | 灰色脉冲块占位 `bg-black/[0.06] rounded-[10px]` |
| **表格数据加载** | 骨架行 | 5 行 `h-12 bg-black/[0.06] rounded-[10px] mb-2 animate-pulse` |
| **表单提交中** | 按钮加载态 | 按钮文字替换为 `Loader2 w-4 h-4 animate-spin mr-2` + "提交中..." |
| **AI 响应中** | 输入框加载态 | 发送按钮变为旋转图标，输入框 disabled |
| **日历事件加载** | 全屏遮罩 | `absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center` + Spinner |
| **照片上传中** | 预览区遮罩 | `absolute inset-0 bg-black/30 flex items-center justify-center rounded-[20px]` + `Loader2 animate-spin text-white` |
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
- 图标：`w-12 h-12 text-[#A1A1A6] mx-auto mb-4`
- 主文字：`text-[14px] text-[#6E6E73] font-medium`
- 次文字：`text-[12px] text-[#A1A1A6] mt-2`
- 操作按钮（可选）：`mt-4 bg-accent text-white px-5 py-2.5 rounded-full text-[14px] font-medium hover:opacity-90`

### 6.5 确认对话框

**删除确认**：
- 模态框标题：`text-[17px] font-semibold text-[#1D1D1F]`
- 警告图标：`AlertTriangle w-10 h-10 text-orange-500 mx-auto mb-3`
- 内容：`text-[14px] text-[#6E6E73] text-center`
- 操作：`flex gap-3 justify-center mt-6`
  - "取消"：Secondary pill 按钮
  - "确认删除"：Danger pill 按钮

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
- 侧边栏：完全隐藏，通过汉堡菜单触发 **Bottom Sheet**（从底部滑上，大圆角顶部 `rounded-t-[20px]`，带拖拽指示条 `w-10 h-1 bg-black/20 rounded-full mx-auto mt-2`）
- 顶部栏：显示汉堡菜单按钮
- 仪表盘统计卡片：`grid-cols-1`
- 学员列表：卡片式布局替代表格（每学员一张卡片，`bg-white rounded-[20px] p-4`，无阴影）
- 点名模态框：全屏 `max-w-none h-full rounded-none`
- 摄像头拍照模态框：全屏 `max-w-none rounded-none`
- AI 对话页：全屏，快捷指令栏可横向滚动
- 表单照片区：预览 `w-32 h-32`，按钮组垂直堆叠

### 7.3 移动端特殊处理

**学员列表（移动端）**：
表格转为卡片列表，每张卡片包含：
- 左侧头像（圆角方形 `rounded-xl`，有照片则显示，无照片则占位）
- 姓名 + 状态 pill 徽章
- 信息行：性别、入学时间、剩余课时
- 操作按钮组（底部）

**日历页（移动端）**：
- 默认显示日视图而非月视图
- 左右滑动切换日期
- 课程详情为底部 sheet 弹出（从底部滑上，`rounded-t-[20px]`）

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

统一使用 **Lucide React** 图标库，按功能场景分类。Apple 风格偏好简洁、线条均匀的图标，Lucide 天然契合。

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
| `GraduationCap` | 毕业帽 | 班级管理导航 |
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

## 9. 暗黑模式

为未来扩展预留的暗黑模式配色方案，采用 Apple 暗黑模式规范：

| 元素 | 亮色模式 | 暗黑模式 |
|------|----------|----------|
| 页面背景 | `#F5F5F7` | `#1C1C1E` |
| 卡片背景 | `#FFFFFF` | `#2C2C2E` |
| 系统填充 | `rgba(120,120,128,0.12)` | `rgba(120,120,128,0.24)` |
| 分隔线 | `rgba(60,60,67,0.15)` | `rgba(84,84,88,0.3)` |
| 主文字 | `#1D1D1F` | `#FFFFFF` |
| 次要文字 | `#6E6E73` | `#8E8E93` |
| 三级文字 | `#A1A1A6` | `#636366` |
| 强调色 | `#D9264A` | `#FF375F`（更亮的红） |
| 成功 | `#34C759` | `#32D74B` |
| 警告 | `#FF9500` | `#FF9F0A` |
| 危险 | `#FF3B30` | `#FF453A` |
| 信息 | `#007AFF` | `#0A84FF` |

**暗黑模式下的材质调整**：
- 侧边栏/Header：`backdrop-blur-xl bg-[#1C1C1E]/80 border-r border-white/[0.06]`
- 模态框遮罩：`bg-black/50 backdrop-blur-md`
- 输入框：`bg-white/[0.08] text-white focus:bg-white/[0.12]`
- 系统填充：`bg-white/[0.12]`

---

**文档版本**：v4.1  
**编写日期**：2026-05-25  
**关联文档**：《跆拳道馆 CRM 系统_PRD.md》  
**变更记录**：
- v4.1 新增班级管理模块：班级列表页、班级详情页（学员网格/近期课程）、班级表单页；侧边栏新增"班级管理"导航；学员表单新增"所属班级"多选区域；学员详情页新增班级标签；日历页删除课程类型筛选与颜色编码，课程表单新增"所属班级"下拉；点名流程改为从班级获取学员名单；教练详情页所授课程删除类型 Badge
- v4.0 全面重构为 Apple Human Interface Guidelines 设计语言：通透层级、毛玻璃材质、充裕留白、大圆角与 pill 形状、System Background 层级、废除厚重阴影、增大字号、圆角方形头像、Segmented Control、顶部居中 Toast 等
- v3.0 新增教练管理（教练列表页、教练详情页、教练表单页）、课程教练下拉选择、教练相关图标
- v2.0 新增学员照片采集组件（摄像头拍照 + 文件上传）、头像组件规范、点名列表头像展示
