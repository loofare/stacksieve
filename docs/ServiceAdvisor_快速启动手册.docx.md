

**ServiceAdvisor MCP**

AI-First 三方服务推荐引擎

*快速启动手册  ·  产品方案  ·  执行指南  ·  技术规范*

| 核心定位 给 AI Agent 使用的工具，不是给人类看的平台 直接用户：Claude Code、Cursor、Windsurf 等 AI 编程工具 交付形式：MCP Server \+ CLI \+ 开源数据库 | 核心价值主张 用自然语言描述你的产品需求 ↓ AI 立即返回最佳三方服务推荐 含选型理由 \+ 文档链接 \+ 接入命令 |
| :---- | :---- |

| Phase 1 数据库 第1-2周 | Phase 2 MCP Server 第3-4周 | Phase 3 CLI 工具 第5-6周 | Phase 4 增长飞轮 第7周起 |
| :---: | :---: | :---: | :---: |

*本手册面向 AI 辅助开发（AI & D）工作流，所有章节均可直接作为 Claude 的上下文使用。版本 v1.0 · 2025*

# **如何使用本手册**

本手册专为 AI 辅助开发（AI & D）工作流设计。你不需要一次读完全部——按需取用，每个章节都是独立可执行的模块。

| 📖 使用说明 |
| :---- |
| 给 AI（Claude）的用法：将任意章节内容粘贴为上下文，AI 会按照规范执行对应任务。 给开发者（D）的用法：按章节顺序执行，每个 Phase 结束后有明确的 Checklist 验收。 两者结合：开发者描述目标，AI 读取手册规范，协作完成对应 Phase 的交付物。 |

| 章节 | 主题 | 内容摘要 |
| :---- | :---- | :---- |
| **第一章** | 产品定义 | 你在做什么、为谁做、核心边界 |
| **第二章** | 系统架构 | 三层架构设计和数据规范 |
| **第三章** | 数据初始化 | 如何快速获取和填充初始数据 |
| **第四章** | MCP Server | 核心产品的开发规范 |
| **第五章** | CLI 工具 | 辅助工具的开发规范 |
| **第六章** | 开源策略 | License、README、社区运营 |
| **第七章** | 增长路径 | 从 0 到影响力的具体步骤 |
| **第八章** | 商业化边界 | 开源与盈利的清晰划分 |
| **第九章** | 执行 Checklist | 可直接勾选的行动清单 |

# **第一章　产品定义**

## **1.1 一句话定位**

| ServiceAdvisor MCP 是一个让 AI Agent 通过自然语言查询、 获取最佳三方服务推荐的 MCP Server。 它不是给人类浏览的服务目录，它是 AI 工具链中的一个工具节点。 |
| :---- |

## **1.2 用户层次**

| 用户类型 | 描述 |
| :---- | :---- |
| **直接用户（AI Agent）** | Claude Code / Cursor / Windsurf / 任何支持 MCP 的 AI 工具。它们通过调用 MCP 工具获取推荐结果，不需要界面。 |
| **间接用户（开发者）** | 使用上述 AI 工具的独立开发者、Indie Hacker。他们通过 AI 工具间接消费 ServiceAdvisor 的价值。 |
| **贡献者（社区）** | 向 GitHub 仓库提交数据更新的开发者。他们维持数据库的新鲜度。 |

## **1.3 产品边界（做什么 / 不做什么）**

| ✅  做 | ❌  不做 |
| :---- | :---- |
| 结构化的三方服务推荐（MCP 工具） | 面向人类的可视化聚合平台 |
| 机器可读的 JSON 推荐结果 | 替用户自动完成服务集成（那是 Composio 的事） |
| 持续维护的开源 YAML 数据库 | 收录所有 API（保持聚焦，只收录开发者工具类服务） |
| 开发者文档和接入指南 | 设计复杂的推荐算法（MVP 用规则引擎即可） |
| CLI 工具（覆盖非 MCP 用户） | 做一个需要持续运营的内容平台 |

## **1.4 差异化定位**

市场上已有 StackShare（面向人类）、awesome-xxx 列表（静态 Markdown）、直接问 AI（数据过时）这三种现有解法，但没有任何一个产品满足以下三点的同时成立：

* 机器可消费（AI Agent 可直接调用，返回结构化 JSON）

* 场景匹配推荐（不是穷举列表，是有理由的最优推荐）

* 持续维护的数据质量（有 Schema 约束、社区贡献机制、定期验证）

这三点同时成立，就是 ServiceAdvisor MCP 的差异化定位。

# **第二章　系统架构**

## **2.1 三层架构**

| 接入层 Access Layer | MCP Server（主）/ CLI 工具（辅）/ 未来 REST API（可选） AI Agent 通过这一层调用推荐能力 |
| :---: | :---- |
| 服务层 **Intelligence Layer** | 需求解析引擎：自然语言 → 场景标签 推荐排序：基于多维评分的最优推荐 输出格式化：结构化 JSON，AI 直接消费 |
| 数据层 **Data Layer** | GitHub 开源 YAML 数据库 30+ 场景 × 200+ 服务条目 每条记录含 12 个标准字段 |

## **2.2 仓库结构**

| 📁 仓库结构 |
| :---- |
| service-advisor/                 ← GitHub 根目录 │ ├── /data/                       ← 核心数据资产（MIT License） │   ├── \_schema.yaml             ← 数据格式规范（唯一标准） │   ├── email.yaml │   ├── payment.yaml │   ├── auth.yaml │   ├── database.yaml │   ├── ai-llm.yaml │   ├── file-storage.yaml │   ├── search.yaml │   ├── analytics.yaml │   ├── logging.yaml │   ├── queue.yaml │   ├── cdn.yaml │   └── notification.yaml │ ├── /packages/ │   ├── /mcp-server/             ← MCP Server（MIT License） │   │   ├── src/ │   │   │   ├── index.ts         ← MCP 入口，注册三个工具 │   │   │   ├── loader.ts        ← YAML 数据加载 & 验证 │   │   │   ├── recommender.ts   ← 推荐核心逻辑 │   │   │   └── types.ts         ← TypeScript 类型定义 │   │   └── package.json │   │ │   └── /cli/                    ← CLI 工具（MIT License） │       ├── src/index.ts │       └── package.json │ ├── /docs/ │   ├── quickstart.md            ← 5 分钟接入指南 │   ├── schema.md                ← 数据字段说明 │   └── contributing.md          ← 贡献指南 │ └── README.md                    ← 产品核心页面 |

## **2.3 数据 Schema（\_schema.yaml 内容规范）**

每一条服务记录必须包含以下 12 个字段，这是整个产品的数据契约：

| 📋 Schema 规范 |
| :---- |
| \# \_schema.yaml — 每条服务记录的标准格式 name:              string    \# 服务名称，必填 category:          string    \# 主场景分类，必填（见下方分类表） tags:              list      \# 补充标签，如 \[free-tier, open-source\] pricing\_tier:      enum      \# free / freemium / paid / enterprise free\_tier:         string    \# 免费额度描述，无则填 null ai\_friendliness:   int(1-5)  \# 文档质量 \+ SDK 完整度 \+ MCP 支持 dx\_score:          int(1-5)  \# 开发者体验评分（接入难度反向） official\_docs:     url       \# 官方文档 URL，必填 mcp\_available:     bool      \# 是否有官方 MCP Server mcp\_url:           url       \# MCP Server 地址，无则 null quick\_install:     string    \# 安装命令，如 npm install resend best\_for:          list      \# 推荐使用场景 not\_for:           list      \# 明确不适合的场景 last\_verified:     date      \# 最后人工验证日期，格式 YYYY-MM |

### **12 个初始场景分类**

| email | payment | auth | database |
| :---: | :---: | :---: | :---: |
| **ai-llm** | **file-storage** | **search** | **analytics** |
| **logging** | **queue** | **cdn** | **notification** |

# **第三章　数据初始化**

## **3.1 信息来源优先级**

按照以下顺序获取初始数据，越靠前的来源质量越高、效率越高：

| 优先级 | 来源 | 用途 |
| :---- | :---- | :---- |
| **1st** | agamm/awesome-developer-first | GitHub 最高质量开发者工具策展列表，已分类整理，直接提取服务名称和链接 |
| **2nd** | ripienaar/free-for-dev | 专注免费计划的服务列表，填充 free\_tier 字段的最佳来源 |
| **3rd** | modelcontextprotocol/servers | 官方 MCP Server 仓库，确认 mcp\_available 字段的唯一权威来源 |
| **4th** | 各服务官网 Quick Start 页面 | 提取 quick\_install 和代码示例，需人工核实 |
| **5th** | StackShare（参考，不引用） | 判断真实使用率，辅助 dx\_score 评分，不直接引用文字 |

## **3.2 AI 辅助数据生成工作流**

使用以下 Prompt 模板让 Claude 批量生成 YAML 草稿，你负责审核和修正：

| 🤖 AI 数据生成 Prompt |
| :---- |
| \# 给 Claude 的标准 Prompt 模板 我在构建一个三方服务推荐数据库，Schema 如下： （粘贴 \_schema.yaml 内容） 请帮我生成以下服务的 YAML 记录： 1\. Resend（email 场景） 2\. Clerk（auth 场景） 3\. Supabase（database 场景） 要求： \- official\_docs 和 mcp\_url 必须是真实可访问的 URL \- pricing\_tier 和 free\_tier 根据 2025 年官网定价页填写 \- quick\_install 只写安装命令，不写代码 \- ai\_friendliness 评分理由需说明 \- 每条记录独立输出为合法 YAML 格式 |

## **3.3 必须人工验证的字段**

| ⚠️ 人工核实清单 |
| :---- |
| ⚠️  以下字段 AI 生成后必须人工核实，不能盲目信任： pricing\_tier / free\_tier — 定价变化最频繁，AI 训练数据可能已过期，必须访问官网定价页确认 mcp\_available / mcp\_url — 必须去 modelcontextprotocol/servers 仓库实际查找确认 official\_docs URL — 确认链接可访问、指向正确页面（不是营销页） last\_verified — 填写你核实的当月日期，格式 YYYY-MM |

## **3.4 初始化目标与节奏**

| 时间节点 | 目标 |
| :---- | :---- |
| **第 1 周末** | 12 个场景各 1 个首选推荐 \= 12 条记录。目标：每个场景有一个无可争议的最优解 |
| **第 2 周末** | 每个场景扩展到 3-5 个选项 \= 约 60 条记录。可以发布 v0.1 |
| **第 4 周末** | 补充长尾服务和开源自托管替代品 \= 约 150 条记录。正式 Launch |
| **持续维护** | 每月 2-3 小时：处理社区 PR \+ 运行链接有效性检测 \+ 更新定价变化 |

| 核心原则：不追求数量，追求每个场景有一个明确的首选推荐（Top Pick）。 AI Agent 需要的是决策，不是列表。给 10 个选项和不给没有区别。 |
| :---- |

# **第四章　MCP Server 开发规范**

## **4.1 三个核心工具（MCP Tools）**

| 工具名 | 类型 | 接口定义 |
| :---- | :---- | :---- |
| **recommend\_services** | 主工具 | 输入：description(string), limit?(number=5)输出：按场景分组的推荐列表，每项含 top\_pick \+ reason \+ docs \+ quick\_install |
| **get\_service\_detail** | 查询工具 | 输入：service\_name(string)输出：该服务的完整 YAML 记录（所有 12 个字段） |
| **list\_categories** | 辅助工具 | 输入：无输出：所有已收录的场景分类列表，辅助 Agent 结构化查询 |

## **4.2 技术栈**

| 技术 | 选型 |
| :---- | :---- |
| **运行时** | Node.js 20+（LTS） |
| **语言** | TypeScript 5+（严格模式） |
| **MCP SDK** | @modelcontextprotocol/sdk（官方，最新版） |
| **数据验证** | Zod（Schema 运行时验证） |
| **YAML 解析** | js-yaml |
| **传输协议** | stdio（本地）/ SSE（远程，Phase 4） |
| **发布渠道** | npm（package: @username/service-advisor-mcp） |

## **4.3 核心代码结构**

| 💻 index.ts |
| :---- |
| // src/index.ts — MCP Server 入口 import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'; import { z } from 'zod'; import { loadData } from './loader.js'; import { recommend, getDetail, listCategories } from './recommender.js'; const server \= new McpServer({   name: 'service-advisor',   version: '1.0.0', }); // Tool 1: recommend\_services server.tool('recommend\_services',   { description: z.string(), limit: z.number().optional().default(5) },   async ({ description, limit }) \=\> ({     content: \[{ type: 'text', text: JSON.stringify(recommend(description, limit)) }\]   }) ); // Tool 2: get\_service\_detail server.tool('get\_service\_detail',   { service\_name: z.string() },   async ({ service\_name }) \=\> ({     content: \[{ type: 'text', text: JSON.stringify(getDetail(service\_name)) }\]   }) ); // Tool 3: list\_categories server.tool('list\_categories', {},   async () \=\> ({     content: \[{ type: 'text', text: JSON.stringify(listCategories()) }\]   }) ); const transport \= new StdioServerTransport(); await server.connect(transport); |

## **4.4 Claude Code 接入配置**

| ⚙️ 接入配置示例 |
| :---- |
| // \~/.claude/mcp.json — Claude Code 配置 {   "mcpServers": {     "service-advisor": {       "command": "npx",       "args": \["-y", "@username/service-advisor-mcp"\]     }   } } // Cursor / .cursor/mcp.json — 同样格式 // Claude Desktop — 在设置中添加相同配置 |

## **4.5 输出格式规范（recommend\_services 返回值）**

| 📤 输出格式 |
| :---- |
| // recommend\_services 标准返回结构 {   "query": "我需要邮件通知、支付和用户认证",   "detected\_categories": \["email", "payment", "auth"\],   "recommendations": \[     {       "category": "email",       "top\_pick": "Resend",       "reason": "开发者友好，免费额度 100封/天，SDK 一行代码接入，有官方 MCP Server",       "pricing\_tier": "freemium",       "free\_tier": "100 emails/day",       "ai\_friendliness": 5,       "official\_docs": "https://resend.com/docs",       "quick\_install": "npm install resend",       "mcp\_available": true,       "alternatives": \["SendGrid", "Postmark"\]     }   \] } |

# **第五章　CLI 工具开发规范**

## **5.1 CLI 的定位**

CLI 工具是 MCP Server 的辅助渠道，覆盖不使用 MCP 的开发者群体。它不是核心产品，是扩大受众的手段。

| ⌨️ CLI 命令示例 |
| :---- |
| \# 基础用法 npx service-advisor "我需要做一个有支付和邮件功能的 SaaS" \# 指定场景 npx service-advisor \--category email \# JSON 格式输出（供脚本处理） npx service-advisor "auth 方案" \--format json \# 查看某服务详情 npx service-advisor \--detail Resend \# 列出所有场景分类 npx service-advisor \--list-categories |

## **5.2 技术栈**

| 技术 | 选型 |
| :---- | :---- |
| **CLI 框架** | Commander.js（命令行参数解析） |
| **输出美化** | chalk（彩色输出）+ cli-table3（表格） |
| **演示录制** | VHS by Charm（录制 README 用的 GIF） |
| **复用逻辑** | 直接 import recommender.ts，和 MCP Server 共用核心 |
| **发布** | npm bin 字段，支持 npx 直接调用，无需全局安装 |

# **第六章　开源策略**

## **6.1 License 划分**

| 内容 | License | 理由 |
| :---- | :---- | :---- |
| **YAML 数据库 /data/** | CC BY 4.0 | 允许任何人使用，要求署名。数据是公共品，越开放越能吸引贡献。 |
| **MCP Server & CLI 代码** | MIT License | 让开发者无顾虑地集成。开源是 MCP 生态的文化前提。 |
| **未来平台服务代码** | 不开源 / BSL | 商业护城河，不对外暴露。BSL 可在 4 年后自动转 MIT。 |

## **6.2 README 必须包含的内容**

README 是你唯一需要对人类优化的页面，也是你的产品主页。必须包含以下六个部分，顺序不变：

1. **一句话介绍** — 什么是 ServiceAdvisor MCP，为谁服务

2. **演示 GIF** — 用 VHS 录制的 CLI 或 MCP 调用演示，30 秒以内

3. **快速接入（Claude Code / Cursor 配置示例）** — 三行配置，复制即用

4. **已覆盖场景列表** — 展示 12 个场景，附条目数量

5. **数据贡献指南** — 简单说明如何提交 PR 添加新服务

6. **License 声明** — 数据 CC BY 4.0，代码 MIT

## **6.3 GitHub 关键词优化**

在 GitHub 仓库设置中添加以下 Topics，这是免费的 SEO 流量来源：

| 🏷️ 推荐 Topics 标签 |
| :---- |
| mcp  mcp-server  model-context-protocol  ai-agents  developer-tools saas-starter  indie-hacker  awesome-services  api-recommendations  typescript |

## **6.4 提交这些平台获取初始流量**

| 平台 | 备注 |
| :---- | :---- |
| **awesome-mcp-servers** | 最重要，MCP 开发者的首选参考列表，必须提交 |
| **Smithery.ai** | MCP Server 专属目录，有托管和发现功能 |
| **mcp.so** | MCP 中文社区目录，中文用户曝光 |
| **Glama.ai** | 另一个主流 MCP 目录 |
| **awesome-developer-first** | 开发者工具策展列表，你的数据来源也是你的推广渠道 |
| **Hacker News（Show HN）** | 发布时的核心推广渠道，标题格式：Show HN: ServiceAdvisor – MCP server... |

# **第七章　增长路径**

| Phase 1 第 1-2 周 | 建立数据资产 目标：*有一个可用的开源 YAML 数据库* 创建 GitHub 仓库，设置 Topics 和 License 完成 \_schema.yaml 规范定义 完成 12 个场景各 1 个首选推荐（12 条 Top Pick 记录） 使用 AI 批量生成 \+ 人工核实的方式扩展到 60 条 提交 awesome-developer-first 等列表 发布 README v1（含场景列表和贡献指南） 工具栈：GitHub \+ YAML \+ Claude（数据生成） 交付物：可用的开源数据库，GitHub 仓库上线 |
| ----- | :---- |

| Phase 2 第 3-4 周 | 发布核心产品 目标：*AI 工具可以实际调用 ServiceAdvisor* 搭建 TypeScript monorepo（packages/mcp-server \+ packages/cli） 实现三个 MCP 工具（recommend / detail / categories） 实现 YAML 加载、Zod 验证、推荐排序逻辑 发布到 npm（@username/service-advisor-mcp） 完成 Claude Code 和 Cursor 的接入文档 提交 Smithery.ai / mcp.so / Glama.ai 工具栈：TypeScript \+ @modelcontextprotocol/sdk \+ Zod \+ npm 交付物：MCP Server v1.0 发布到 npm，可被 AI 工具调用 |
| ----- | :---- |

| Phase 3 第 5-6 周 | 扩大受众覆盖 目标：*覆盖不使用 MCP 的开发者* 开发 CLI 工具（复用 MCP Server 的推荐逻辑） 用 VHS 录制演示 GIF（CLI 和 MCP 各一个） 更新 README，嵌入演示 GIF Product Hunt 正式 Launch（准备 tagline \+ 截图 \+ 评论） Hacker News Show HN 发帖 数据库扩展到 150 条 工具栈：Commander.js \+ chalk \+ VHS \+ Product Hunt 交付物：CLI 发布 \+ Product Hunt Launch \+ 150+ 条数据 |
| ----- | :---- |

| Phase 4 第 7 周起 | 建立增长飞轮 目标：*形成自我维持的社区贡献循环* 开放社区贡献：建立 PR 模板，降低贡献门槛 设置 GitHub Actions 自动链接检测（每月运行） 在 Twitter/X 开始 Build in Public：记录数据增长和使用案例 写 1-2 篇技术文章：「为什么要为 AI Agent 而非人类构建工具」 监控 npm 下载量 \+ GitHub Stars 增长节奏 收集用户 use case，反哺数据库优化 工具栈：GitHub Actions \+ Twitter/X \+ 个人博客 交付物：社区自运转，每周有新 PR，Stars 持续增长 |
| ----- | :---- |

# **第八章　商业化边界**

## **8.1 核心原则**

| 开源是获客漏斗的顶端，商业化是价值转化的底端。 永远不要为了商业化而损害开源版本的核心功能。 付费用户得到的是「更多」，而不是开源用户失去了「什么」。 |
| :---- |

## **8.2 开源版 vs 未来付费版的边界**

| 功能 | 策略 | 说明 |
| :---- | :---- | :---- |
| **数据库（基础）** | 免费开源 | 12 场景 × 主流服务，MIT License，永久免费 |
| **MCP Server（核心）** | 免费开源 | 三个核心工具，MIT License，自托管，永久免费 |
| **CLI 工具** | 免费开源 | 基础查询功能，MIT License，永久免费 |
| **Premium 数据集** | 未来付费 | 早期服务预测、定价历史、私有 API 数据、更新频率 10x |
| **托管 MCP 端点** | 未来付费 | 远程 SSE 端点，无需自己跑本地 Server，含 SLA 保障 |
| **团队功能** | 未来付费 | 私有服务目录、团队推荐偏好、调用分析面板 |

## **8.3 未来平台的正确形态**

如果未来要做平台，形态是开发者控制台（Developer Console），不是消费者界面：

* 只有三个页面：登录 → API Key 管理 → 使用量分析

* 付费用户得到：托管远程 MCP 端点 \+ Premium 数据集 \+ 高频率调用

* 技术选型：Next.js \+ Supabase \+ Cloudflare Workers（托管 MCP 端点）

* 这是 Phase 4 之后的事，现在不要碰

| 🧭 决策过滤器 |
| :---- |
| 判断标准：每新增一个功能，问自己——这是 AI Agent 需要的，还是人类用户需要的？ 如果答案是后者，大概率不值得做。 |

# **第九章　执行 Checklist**

以下是按时间顺序排列的行动清单，可以直接作为项目管理工具使用。每完成一项，打勾。

## **Week 1 — 数据基础**

* 创建 GitHub 仓库，命名 service-advisor，设置 12 个 Topics

* 添加 MIT License（代码）和 CC BY 4.0（数据）

* 创建 /data/\_schema.yaml，定义 12 个字段

* 完成 email.yaml（Resend 为 Top Pick，含 3 个替代方案）

* 完成 payment.yaml（Stripe 为 Top Pick）

* 完成 auth.yaml（Clerk 为 Top Pick）

* 完成 database.yaml（Supabase 为 Top Pick）

* 写 README v1：定位说明 \+ 场景列表 \+ 贡献方式

* 提交 PR 到 awesome-developer-first

## **Week 2 — 数据扩展**

* 完成剩余 8 个场景的 Top Pick 记录（ai-llm / file-storage / search / analytics / logging / queue / cdn / notification）

* 每个场景扩展到 3-5 个选项（使用 AI 批量生成 \+ 人工核实）

* 验证所有 official\_docs URL 可访问

* 验证所有 mcp\_available 字段（去 modelcontextprotocol/servers 核实）

* 验证所有 pricing\_tier 和 free\_tier（去官网定价页核实）

* 设置 GitHub Actions：PR 时自动验证 Schema 合规性

* 提交 awesome-mcp-servers 和 Glama.ai

## **Week 3-4 — MCP Server**

* 初始化 TypeScript monorepo（pnpm workspaces）

* 安装 @modelcontextprotocol/sdk / zod / js-yaml

* 实现 loader.ts：加载所有 YAML 文件，Zod 验证

* 实现 recommender.ts：关键词提取 \+ 场景匹配 \+ 评分排序

* 实现 index.ts：注册三个 MCP 工具

* 本地测试：用 Claude Desktop 实际调用三个工具

* 发布 npm：@username/service-advisor-mcp v1.0.0

* 完成接入文档（Claude Code \+ Cursor 配置示例）

* 提交 Smithery.ai 和 mcp.so

## **Week 5-6 — CLI \+ Launch**

* 实现 CLI（Commander.js），复用 recommender.ts 逻辑

* 支持四个命令：默认查询 / \--category / \--detail / \--format json

* 用 VHS 录制 CLI 演示 GIF（30 秒内）

* 用 VHS 录制 MCP 演示 GIF（在 Claude Code 中调用）

* 更新 README：嵌入两个 GIF，更新数据统计

* 准备 Product Hunt 发布材料（tagline \+ 图片 \+ 描述）

* Product Hunt Launch

* Hacker News Show HN 发帖

## **Week 7+ — 持续增长**

* 设置 GitHub Actions 月度链接检测工作流

* 创建 CONTRIBUTING.md 和 PR 模板

* 在 Twitter/X 开始 Build in Public 系列

* 写第一篇技术文章并发布到 dev.to

* 每月审查：处理社区 PR \+ 更新过期定价数据

* 监控 npm 周下载量和 GitHub Stars，每月记录

*ServiceAdvisor MCP · 快速启动手册 v1.0*  
*本手册可直接作为 AI 上下文使用 · 按章节执行，每章独立可操作*