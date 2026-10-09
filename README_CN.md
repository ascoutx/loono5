# LOONO

> English: [README.md](./README.md)

跨国婚恋交友平台的前端工程。一套代码同时承载两个面向完全不同的站点：

| 站点 | 面向 | 视觉 | 入口 |
| --- | --- | --- | --- |
| **B2C 主站** | 普通会员 | 轻奢浅色调（Light Luxury） | `loono.com` · 本地 `:3000` |
| **B2B 合作伙伴后台** | 已授权的合作伙伴／运营 | 暗色数据风 | `partner.loono.com` · 本地 `:3001` |

主站**不出现任何代理人／代理机构字样**，底部导航固定为三个核心 Tab（搜索、聊天、个人中心）；对外只说「合伙」（Partners），入口是一个申请表单。合作伙伴后台**仅限账号密码登录**，与主站互不链接。

> 当前仓库是**前端原型**：无后端、无数据库，登录态用 cookie 模拟，业务数据为 mock。各模块的注释里已标出接入后端时的替换点。

---

## 技术栈

| 层 | 选型 | 版本 |
| --- | --- | --- |
| 框架 | Next.js（App Router / RSC / Server Actions） | 15 |
| 运行时 | React | 19 |
| 语言 | TypeScript（`strict`） | 5 |
| 样式 | Tailwind CSS（`@theme` 令牌 / `oklch()` 色彩空间） | 4 |
| 组件库 | shadcn/ui（`base-nova` style，底座 `@base-ui/react`） | — |
| 图标 | lucide-react | — |
| 国际化 | next-intl（`zh` / `ru` / `en`） | 4 |
| 字体 | Geist / Geist Mono / Noto Sans SC（`next/font`） | — |
| 校验 | ESLint（`next/core-web-vitals` + `next/typescript`）、Prettier（含 `prettier-plugin-tailwindcss`） | 9 / 3 |

设计约束：**移动优先的 H5**，重点适配微信内置浏览器（禁缩放、处理 `safe-area-inset`），同时向上适配到桌面画布。

---

## 快速开始

### 环境要求

Node.js 20 及以上（Next.js 15 要求 18.18+），npm。

### 安装与运行

```bash
npm install

# 分别启动（推荐，两个终端）
npm run dev            # B2C 主站 → http://localhost:3000
npm run dev:partner    # B2B 后台 → http://localhost:3001

# 或一条命令同时起
npm run dev:all
```

两个 dev server **不能共用构建目录**，所以 `dev:partner` 走 `.next-partner`（已在 `.gitignore` 中排除），由 `next.config.ts` 的 `NEXT_DIST_DIR` 环境变量控制。

端口可用环境变量覆盖：

```bash
SITE_PORT=4000 PARTNER_PORT=4001 npm run dev:all
```

### 演示账号

| 场景 | 凭据 |
| --- | --- |
| 会员登录（手机 + 验证码，mock） | 任意手机号，验证码固定 `1234` |
| 合作伙伴后台 | 账号 `partner` / 密码 `loono2026` |

后台账号大小写不敏感；会员与合作伙伴的 cookie 是独立的（分别 30 天 / 8 小时）。

---

## 双站点架构

生产环境按**域名**分流，本地没有 DNS，按**端口**分流 —— 全部由 `src/middleware.ts` 处理：

```
partner.loono.com/login   →  rewrite  →  /[locale]/partner/login   （地址栏保持 partner 域）
localhost:3001/login      →  rewrite  →  /[locale]/partner/login
localhost:3000/partner/login → redirect 307 → localhost:3001/login  （剥离 /partner 前缀）
```

三个关键实现细节：

1. **rewrite 而非 redirect**：生产下访问 `partner.loono.com` 时地址栏不跳到 `/partner`。
2. **改写后交回 next-intl**：应用树是 `[locale]/partner/...`，裸路径 `/partner/login` 匹配不到任何路由，必须由 intl middleware 补上 locale 段。
3. **跨端口跳转仅在开发环境生效**（`NODE_ENV !== "production"`），避免生产部署恰好监听 3000 端口时劫持自身的 `/partner` 流量。

路由守卫不由 middleware 承担，而在**页面级**：后台每个受保护页面首行调用 `requirePartnerSession()`，无会话则跳转登录页。

---

## 功能清单

### B2C 主站

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 落地页 | `/` | `<lg` 轻奢单页（暖光晕背景、轮播标题、特性卡、数据条）；`lg+` 长版营销页（Hero / 支柱 / 案例 / 定价 / FAQ / 地区 / 页脚），纯 CSS 切换，无 viewport JS |
| 登录 | `/auth` | 手机号 + 验证码（mock）、微信 / Apple 入口占位 |
| 注册引导 | `/onboarding/*` | 五步向导：基本资料 → 个人属性 → 择偶条件 → 实名认证 → 选择套餐，带步骤条 |
| 搜索（会员目录） | `/catalog` | 卡片网格，Tab 分组（全部 / 附近 / 新加入 / 在线），受层级可见矩阵控制 |
| 会员详情 | `/user/[id]` | 大头像 + 资料；超出可见层级时模糊遮罩 + 升级引导 |
| 聊天列表 | `/chats` | 会话列表，未读角标；桌面端列表移至左侧栏 |
| 聊天详情 | `/chats/[id]` | 双语消息气泡 + 输入框 |
| 个人中心 | `/profile` | 身份卡、当前等级与到期、资料完整度、择偶条件摘要、认证墙、功能入口 |
| 完善个人信息 | `/profile/edit` | 「个人资料」「择偶条件」双 Tab 编辑器（`?tab=partner` 直达后者） |
| 订阅 | `/profile/subscription` | 套餐选择器（月付 / 年付、折扣标注） |
| 设置 | `/settings` | 账号 / 通知 / 隐私分组，含语言切换、注销入口 |
| 注销账号 | `/settings/delete-account` | 独立多步注销流程（刻意移出 Tab 组，避免中途走神） |
| 合伙申请 | `/partners/apply` | **主站唯一的对外合作入口**：四档合作类型 + 联系信息表单 |

### B2B 合作伙伴后台

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 登录 | `/partner/login` | 账号密码表单，`useActionState` + Server Action |
| 数据看板 | `/partner` | 合作伙伴**自己的**经营看板：KPI 条、收益趋势、转化比值、近期转化表、提现历史 |
| 代理商查询 | `/partner/agents` | 运营视角：按**代理商 × 时间段**检索收益、会员与活动 |

顶栏 `OperatorBar` 在两个板块间切换，并显示当前账号与登出。

### 跨模块能力

| 能力 | 位置 |
| --- | --- |
| 三语文案 | `src/messages/{zh,en,ru}.json`，共 **715 个键**，三语键集完全对齐 |
| 语言切换 | `LocaleSwitcher`，浅色主站与暗色后台各适配一套配色 |
| 主题令牌 | `globals.css` 的 `@theme`：B2C 暖色板 + B2B 炭黑板 |
| 响应式三档 | `<md` 全出血 H5 · `md–xl` 居中单列 · `xl+` 桌面画布（侧栏替代底部导航） |
| 会话与守卫 | `lib/auth/*`（会员）、`lib/partner/*`（合作伙伴） |
| 会员认证徽章 | 8 类（实名 / 学历 / 婚姻 / 资产 / 无犯罪 / 职业 / 收入 / 房产），带有效期与状态机 |

---

## 核心业务规则

规则来自 `PRD.md` 与《会员与合伙申请方案》，落地在 `src/lib/` 的纯函数中。

**1. 平等付费（Equal Pay）** — 无论男女，所有会员都必须持有有效订阅才能浏览资料与聊天。见 `lib/tiers.ts` 的 `hasActiveSubscription()`。

**2. 层级可见矩阵** — 会员只能看到不高于自身等级的资料，更高层级的资料模糊显示并提示升级：

```
L1 → L1
L2 → L1, L2
L3 → L1, L2, L3
```

见 `canView()` / `isLocked()` / `visibleLevels()`。

**3. 免费试用** — 推广码激活 Level 1 的 30 天试用（`TRIAL_DURATION_DAYS`）。

**4. 实时翻译的双语消息** — 每条消息同时携带原文与译文。界面采用**主辅文本结合**：

- **主文本（大字，15px）**：翻译为**当前读者语言**的内容
- **辅文本（小字，灰色，11px，带 🈯 图标）**：发送者的原始文本

自己发出的消息不重复显示原文行。见 `components/chat/message-bubble.tsx`。

**5. 合伙体系四档** — 合作类型与分成比例：线上推广 50% / 城市·省级 60% / 国家 70% / 股东 75%，取自《会员与合伙申请方案》，写入申请表单选项与后台 `PartnerTier`。

---

## 路由总表

| 路径 | 组 | 说明 |
| --- | --- | --- |
| `/` | 公开 | 落地页 |
| `/auth` | 公开 | 登录 |
| `/onboarding/profile` · `attributes` · `partner` · `kyc` · `subscription` | 公开 | 注册五步 |
| `/partners/apply` | 公开 | 合伙申请 |
| `/agent/join` | — | **重定向** → `/partners/apply`（旧链接与二维码兜底） |
| `/catalog` · `/user/[id]` · `/chats` · `/chats/[id]` · `/profile` · `/profile/edit` · `/profile/subscription` · `/settings` | `(main)` | 登录后主体，共享底部 Tab |
| `/settings/delete-account` | 公开 | 注销流程（无 Tab） |
| `/agent/dashboard` | — | **重定向** → `/partner` |
| `/partner/login` | `/partner` | B2B 登录 |
| `/partner` · `/partner/agents` | `/partner` | B2B 看板与查询（**受守卫保护**） |

`(main)` 是 route group，不进入 URL —— 它让底部导航在所有登录页面上复用，同时保持 URL 与 PRD 站点图一致。

---

## 目录结构

```
src/
├── app/
│   ├── globals.css             # 主题令牌（@theme）与 B2C/B2B 两套 surface
│   ├── layout.tsx  · not-found.tsx  · favicon.ico
│   └── [locale]/
│       ├── layout.tsx          # 字体、metadata、viewport、NextIntlClientProvider
│       ├── page.tsx            # 落地页（移动 / 桌面两棵树）
│       ├── (main)/             # 登录后主体（含底部 Tab）
│       ├── onboarding/         # 注册五步
│       ├── partners/apply/     # 合伙申请
│       ├── partner/            # B2B 后台（login / 看板 / agents）
│       ├── agent/              # 旧路径重定向
│       └── settings/           # 注销流程
├── components/
│   ├── ui/                     # 19 个 shadcn 原子组件
│   ├── layout/                 # AppShell / AppFrame / 底部导航 / 侧栏 / 页头
│   ├── landing/                # 移动端落地组件 + desktop/ 桌面长页
│   ├── chat/  catalog/  profile/  onboarding/  account/  auth/  agent/
│   └── partner/                # 表单、筛选条、顶栏、面板、图表
├── i18n/                       # routing / request / navigation
├── lib/
│   ├── auth/                   # 会员会话与当前用户
│   ├── partner/                # 后台会话、登录 Action、代理商数据与查询层
│   ├── mock-data.ts            # 会员、消息、会话、套餐、代理商自身看板数据
│   ├── tiers.ts  plans.ts  agent.ts  profile-options.ts  verification.ts  utils.ts
├── messages/                   # zh.json / en.json / ru.json
├── types/                      # user / chat / agent / partner / profile / verification
└── middleware.ts               # 域名 + 端口分流，locale 处理
```

规模：约 125 个源文件、22 个路由页面、65 个业务组件。

---

## 国际化

- 语言：`zh`（默认）/ `ru` / `en`，配置在 `src/i18n/routing.ts`。
- `localePrefix: "as-needed"` —— 默认语言不带前缀（`/catalog`），其余带前缀（`/ru/catalog`，`/en/catalog`）。
- 文案分命名空间组织，共 20 个（`common` / `nav` / `guest` / `portal` / `auth` / `onboarding` / `catalog` / `user` / `verification` / `chats` / `profile` / `profileForm` / `partnerPref` / `subscription` / `settings` / `deleteAccount` / `agent` / `tier` / `partners` / `partner`）。
- **注意**：`t()` 只能取到字符串叶节点。取对象型命名空间会抛 `INSUFFICIENT_PATH`，且**静默回退成 key 原文而不报错** —— 需要整块取数组时用 `t.raw()`。

新增文案时三语必须同步，键集、占位符都要对齐。

---

## 主题与响应式

**B2C「Soft Porcelain」**：暖象牙底 + 纯白卡片 + 墨色文字 + 香槟金点缀（`.loono-surface` / `.glass-card` / `.loono-cta`）。

**B2B 数据风**：炭黑面板 + 32px 工程网格 + 天蓝强调色 + 大号等宽数字（`.partner-surface` / `.partner-panel`）。

响应式全部走 **纯 CSS 断点**（`lg:hidden` / `hidden lg:block` 切换两棵树），**不读 viewport 尺寸**，以避免 hydration mismatch。

---

## 数据与 Mock 说明

- 会员、会话、消息、套餐、代理商看板数据集中在 `src/lib/mock-data.ts`。
- 后台的**代理商花名册与日度流水**在 `src/lib/partner/mock-agents.ts`：8 家代理商 + 约 190 天流水，由**种子 PRNG（mulberry32）确定性生成** —— 保证跨渲染字节稳定（否则日期筛选看起来像坏了），窗口**锚定今天**（否则「近 7 天」这类预设过几天就落空）。其中一家中途停业，用来验证区间筛选与空态。
- 查询与聚合是**纯函数**，集中在 `src/lib/partner/query.ts`：区间解析（预设 / 自定义 / 边界校验 / 上限 366 天）、汇总、按天-周-月分桶、花名册汇总。与 UI 解耦，便于替换真实上报接口。

---

## 开发脚本

```bash
npm run dev            # 启动 B2C（:3000）
npm run dev:partner    # 启动 B2B（:3001，独立构建目录）
npm run dev:all        # 同时启动两者
npm run build          # 生产构建
npm run start          # 生产启动
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run format         # Prettier 写入
npm run format:check   # Prettier 校验
```

工程约定：

- 路径别名 `@/*` → `src/*`（`tsconfig.json`）。
- Prettier 带 `prettier-plugin-tailwindcss`，会自动按 `globals.css` 排序类名；`.md` 不在格式化范围内。
- shadcn 组件配置见 `components.json`（style `base-nova`，图标 lucide，CSS 变量模式）。
- `@base-ui/react` 组件的受控写法：`RadioGroup` 用 `value` / `onValueChange`，`Checkbox` 用 `checked` / `onCheckedChange`。
- Next.js 会自动把 `.next-partner/types/**/*.ts` 写进 `tsconfig.json` 的 `include`，属正常现象。

---

## 接入后端时需要替换的位置

| 位置 | 现状 | 待办 |
| --- | --- | --- |
| `lib/auth/*` | cookie 模拟会话，验证码固定 `1234` | 真实短信 / 会话服务 |
| `lib/partner/{constants,session,actions}.ts` | 硬编码账号密码 | 合作伙伴身份服务 + 限流 + 锁定 |
| `lib/mock-data.ts` | 静态 mock 数据 | 会员、消息、订阅 API |
| `lib/partner/mock-agents.ts` | 种子生成的流水 | 经营上报接口（保持 `query.ts` 的入参形状） |
| `components/partner/apply-form.tsx` | `handleSubmit` 为本地 stub | `POST /partners/applications`，并加服务端限流与验证码（该接口公开） |
| `components/agent/promo-tools.tsx` | 推广链接与推广码为占位 | 推广工具接口 |

---

## 相关文档

- `PRD.md` —— 产品需求与技术栈基线（含站点图与核心规则）。

