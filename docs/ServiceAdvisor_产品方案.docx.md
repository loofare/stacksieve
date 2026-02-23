

**ServiceAdvisor MCP**

AI Agent 时代的三方服务推荐引擎

*产品方案 · 落地步骤 · 工具清单*

# **一、产品定位与核心主张**

| 📌 产品快照 |
| :---- |
| 产品名称：ServiceAdvisor MCP（暂定） 定位：给 AI 编程工具使用的三方服务推荐引擎 一句话价值主张：用自然语言描述你的产品需求，AI 立即告诉你该选哪些三方服务，并给出理由、文档链接和快速接入指引。 交付形式：MCP Server（主）+ CLI 工具（辅）+ GitHub 开源数据库（基础） 目标直接用户：Claude Code、Cursor、Windsurf 等 AI 编程工具中的 AI Agent 最终受益用户：使用 AI 工具进行独立开发或产品搭建的开发者 |

## **1.1 产品解决什么问题**

开发者在启动一个新产品时，面临的第一个高摩擦决策就是：该用哪些三方服务？邮件用 Resend 还是 SendGrid？支付接 Stripe 还是 LemonSqueezy？AI 能力用哪家 API？数据库选 Supabase 还是 PlanetScale？

当前现有解决方案的问题：

* StackShare：面向人类浏览的 GUI，AI 工具无法直接消费其数据

* awesome-xxx 列表：纯静态 Markdown，无智能推荐，无结构化输出

* 直接问 AI 大模型：知识存在截止日期，缺乏实时定价和可靠性数据

* 自己搜索研究：平均需要 2-4 小时才能完成一个方向的服务选型

**ServiceAdvisor MCP 的解法：**让 AI 工具直接调用一个结构化、持续更新的推荐引擎，在 30 秒内返回经过筛选的服务推荐清单，含选型理由、定价级别和文档入口。

## **1.2 差异化定位（与竞品的本质区别）**

| 维度 | 现有工具（StackShare 等） | ServiceAdvisor MCP |
| :---- | :---- | :---- |
| 使用方式 | 人类打开网页浏览 | **AI Agent 直接调用工具** |
| 输入格式 | 关键词搜索 | **自然语言需求描述** |
| 输出格式 | HTML 页面，人类阅读 | **结构化 JSON，机器可消费** |
| 推荐逻辑 | 社区投票 / 使用量排名 | **场景匹配 \+ 多维度评分** |
| 更新机制 | 依赖用户提交 | **数据库 \+ AI 协同维护** |
| 接入方式 | 复制粘贴到配置文件 | **MCP 工具调用，零摩擦** |

# **二、产品架构**

## **2.1 三层架构设计**

整个产品由三个相互依赖的层次构成，从下往上分别是：数据层 → 服务层 → 接入层。

| 🏗️ 架构概览 |
| :---- |
| 【第三层：接入层 Access Layer】   MCP Server：让 Claude Code、Cursor 等 AI 工具直接调用推荐工具   CLI 工具：npx service-advisor \<需求描述\>，覆盖不使用 MCP 的开发者   REST API（可选，后期扩展）：为第三方集成提供标准接口 【第二层：服务层 Intelligence Layer】   需求解析引擎：将自然语言描述解析为场景标签（如 email、payment、auth）   推荐算法：基于场景标签 \+ 评分维度（定价友好度、DX 评分、AI 友好度）输出排序结果   结构化输出格式化器：确保输出为 AI 工具可直接消费的 JSON 结构 【第一层：数据层 Data Layer】   GitHub 开源数据库：YAML/JSON 格式，收录 30+ 场景 × 200+ 服务条目   每条服务记录包含：名称、场景标签、定价级别、官方文档 URL、AI 友好度评级、快速接入说明 |

## **2.2 核心数据结构（单条服务记录示例）**

| 📄 数据结构 Schema |
| :---- |
| \# 示例：Resend 邮件服务 name: "Resend" category: "email" tags: \["transactional", "developer-friendly", "free-tier"\] pricing\_tier: "freemium"        \# free / freemium / paid / enterprise free\_tier: "100 emails/day" ai\_friendliness: 5              \# 1-5 评分（文档质量、SDK 完整度、MCP 支持） dx\_score: 5                     \# 开发者体验评分 official\_docs: "https://resend.com/docs" mcp\_server: "https://github.com/resend/mcp-server"   \# 如有则标注 quick\_start: "npm install resend → const resend \= new Resend(API\_KEY)" best\_for: \["indie hackers", "AI apps", "SaaS starter"\] not\_recommended\_for: \["high volume \> 50k/day without paid plan"\] last\_verified: "2025-02" |

## **2.3 MCP 工具接口设计**

MCP Server 对外暴露以下三个核心工具：

* recommend\_services(description, limit?)：输入自然语言产品描述，返回推荐服务列表（默认 Top 5）

* get\_service\_detail(service\_name)：查询特定服务的完整信息，含文档链接和接入示例

* list\_categories()：列出所有已收录的服务场景分类，辅助 Agent 进行结构化查询

| 💻 接口设计示例 |
| :---- |
| // 调用示例（Agent 调用 recommend\_services） Input: "我在做一个 SaaS 产品，需要处理用户邮件通知、          支付订阅、用户认证和 AI 文本生成能力" // 返回结构 { "recommendations": \[     { "category": "email", "top\_pick": "Resend",       "reason": "开发者友好、有免费额度、SDK 一行代码接入",       "docs": "https://resend.com/docs",       "quick\_start": "npm install resend" },     { "category": "payment", "top\_pick": "Stripe",       "reason": "行业标准，文档完善，支持订阅模式",       "docs": "https://stripe.com/docs" },     { "category": "auth", "top\_pick": "Clerk",       "reason": "Next.js 生态最佳集成，免费计划足够 MVP",       "docs": "https://clerk.com/docs" },     { "category": "ai\_text", "top\_pick": "Anthropic Claude API",       "reason": "最强推理能力，有 MCP 原生支持",       "docs": "https://docs.anthropic.com" }   \] } |

# **三、落地路线图（四阶段）**

整体分为四个阶段，从 0 到有影响力的开源项目，预计总周期 6-8 个月。

| Phase 1 第 1-4 周 | 数据基础 —— 建立开源 GitHub 数据库 核心任务： 创建 GitHub 仓库，命名为 service-advisor 或 awesome-services-for-ai（关键词 SEO） 设计并确定 YAML Schema（参见 2.2 节数据结构） 首批收录 20-30 个场景，每个场景精选 3-5 个服务（优先覆盖高频场景） 高频场景清单：email / payment / auth / database / file-storage / ai-llm / analytics / logging 编写高质量 README（英文为主）：包含产品定位、使用方法、贡献指南 在 awesome-mcp-servers 等列表提交 PR，在 Hacker News 的 Show HN 发帖 *主要工具：YAML / Markdown / GitHub* |
| :---: | :---- |

| Phase 2 第 5-8 周 | MCP Server 开发 —— 核心产品功能 核心任务： 搭建 Node.js / TypeScript 项目（使用 @modelcontextprotocol/sdk） 实现三个核心 MCP 工具：recommend\_services / get\_service\_detail / list\_categories 实现需求解析逻辑：关键词提取 → 场景标签映射 → 推荐排序 发布到 npm（package name: @your-name/service-advisor-mcp） 编写完整的接入文档（Claude Code / Cursor / Claude Desktop 配置示例） 在 Smithery.ai / mcp.so / Glama 提交收录申请 *主要工具：TypeScript / @modelcontextprotocol/sdk / npm* |
| :---: | :---- |

| Phase 3 第 9-10 周 | CLI 工具开发 —— 扩大受众覆盖 核心任务： 开发 CLI 工具：npx service-advisor "我需要做一个有支付和邮件功能的 SaaS" 支持参数：--category 指定场景、--format json/table 指定输出格式 发布到 npm，配置 npx 直接调用 录制演示 GIF（对 GitHub SEO 和传播效果至关重要） Product Hunt 正式 Launch *主要工具：Node.js CLI / Commander.js / npm* |
| :---: | :---- |

| Phase 4 第 11-24 周 | 增长飞轮 —— 社区与影响力 核心任务： 开放社区贡献：建立 PR 模板，让开发者提交新服务或更新现有数据 建立定期更新节奏：每月审查服务定价变化、新 MCP 服务器上线情况 在 Twitter/X 建立「Build in Public」叙事，记录数据增长和使用案例 编写系列博客：「我如何在 30 秒内完成 SaaS 技术选型」 与 AI 编程工具社区（Cursor Discord / Claude Discord）建立存在感 探索影响力变现：Featured listing / 赞助商展示位 / Enterprise 私有库 *主要工具：GitHub / Twitter / 个人博客 / Product Hunt* |
| :---: | :---- |

# **四、完整技术栈与工具清单**

## **4.1 数据层技术**

| 类别 | 工具 / 技术 | 用途说明 |
| :---- | :---- | :---- |
| **数据格式** | **YAML \+ JSON** | 服务条目存储格式，人类可读、机器可解析、Git 友好 |
| **版本控制** | **GitHub** | 数据库托管、变更历史追踪、开源社区协作 |
| **数据验证** | **Zod / JSON Schema** | 确保每条服务记录符合 Schema，防止数据质量下降 |
| **CI 自动验证** | **GitHub Actions** | PR 合并前自动验证 Schema 合规性，每月自动检测文档链接有效性 |

## **4.2 MCP Server 技术**

| 类别 | 工具 / 技术 | 用途说明 |
| :---- | :---- | :---- |
| **运行时** | **Node.js 20+** | MCP SDK 官方支持的主要运行时环境 |
| **语言** | **TypeScript** | 类型安全、IDE 支持好、MCP SDK 原生 TS 支持 |
| **MCP SDK** | **@modelcontextprotocol/sdk** | Anthropic 官方 MCP 开发套件，处理协议底层通信 |
| **需求解析** | **关键词匹配 \+ 规则引擎** | MVP 阶段无需调用 LLM，用正则 \+ 词典映射场景标签 |
| **推荐排序** | **加权评分算法** | 基于 ai\_friendliness / dx\_score / pricing\_tier 的多维评分 |
| **输出格式** | **结构化 JSON** | MCP 工具返回值，AI 工具直接消费 |
| **发布渠道** | **npm** | package: @username/service-advisor-mcp，支持 npx 调用 |
| **传输协议** | **stdio（本地）/ SSE（远程）** | 本地运行用 stdio，后期云端部署用 SSE |

## **4.3 CLI 工具技术**

| 类别 | 工具 / 技术 | 用途说明 |
| :---- | :---- | :---- |
| **CLI 框架** | **Commander.js 或 Inquirer.js** | 构建友好的命令行交互界面 |
| **输出美化** | **chalk \+ cli-table3** | 彩色终端输出和表格格式化 |
| **发布方式** | **npm（带 bin 字段）** | 配置后可 npx 直接调用，无需全局安装 |
| **演示 GIF** | **VHS（Charm 出品）** | 录制高质量的终端演示 GIF，用于 README 展示 |

## **4.4 基础设施与部署**

| 类别 | 工具 / 技术 | 用途说明 |
| :---- | :---- | :---- |
| **代码托管** | **GitHub（单仓库）** | monorepo 结构：/data（数据库）/ packages/mcp / packages/cli |
| **CI/CD** | **GitHub Actions** | 自动测试、构建、npm 发布；数据验证工作流 |
| **云端托管（可选）** | **Cloudflare Workers** | 将 MCP Server 部署为远程 SSE 端点，零运维成本 |
| **域名（可选）** | **mcp.yourdomain.com** | 远程 MCP 端点的自定义域名 |
| **监控（可选）** | **Cloudflare Analytics** | 追踪 MCP 调用量，无需额外付费 |

## **4.5 影响力增长工具**

| 类别 | 工具 / 技术 | 用途说明 |
| :---- | :---- | :---- |
| **GitHub SEO** | **README 关键词优化 \+ Topics 标签** | 设置 Topics：mcp, ai-agents, developer-tools, saas-starter |
| **开源推广** | **awesome-mcp-servers / awesome-selfhosted 等列表** | 提交 PR 到高流量的 awesome 列表获取反向链接 |
| **社区曝光** | **Product Hunt / Hacker News Show HN** | 发布时的核心推广渠道 |
| **MCP 目录** | **Smithery.ai / mcp.so / Glama.ai** | 在主要 MCP 目录平台提交收录 |
| **内容营销** | **个人博客 \+ Twitter/X \+ dev.to** | Build in Public 内容，记录构建过程 |

# **五、关键里程碑与成功指标**

| 时间节点 | 里程碑目标 | 成功衡量指标 |
| :---- | :---- | :---- |
| **第 4 周末** | GitHub 仓库上线，首批 200+ 服务条目收录，README 完整，提交 5 个 awesome 列表 | GitHub Stars ≥ 200，Issues/PR \> 5 |
| **第 8 周末** | MCP Server 发布 v1.0，可在 Claude Code / Cursor 中实际调用 | npm 周下载 \> 100，Smithery 收录成功 |
| **第 10 周末** | CLI 工具发布，Product Hunt Launch 执行完毕 | PH 当日 Top 10，npm 累计下载 \> 500 |
| **第 16 周末** | GitHub Stars ≥ 1000，有社区贡献者提交 PR | Stars ≥ 1000，贡献者 ≥ 10 人 |
| **第 24 周末** | 成为 AI 开发者圈的知名推荐资源，有媒体或 Newsletter 引用 | 月均 MCP 调用 \> 1000 次，知名 Newsletter 引用 ≥ 1 次 |

# **六、风险与应对策略**

## **主要风险点**

### **风险一：数据维护成本**

**问题：**服务定价和文档 URL 会随时变化，纯人工维护无法持续。

**应对：**通过 GitHub Actions 定时运行链接有效性检测；开放社区贡献并设计简单的 PR 模板；标记 last\_verified 字段，让用户知道数据新鲜度。

### **风险二：冷启动（无用户 → 无贡献 → 无用户）**

**问题：**初期没有用户的推荐引擎缺乏信任度。

**应对：**不依赖用户提交来填充初始数据——自己先研究并手工填充 200+ 条高质量条目，确保数据质量领先于数量。先做内容，再做工具。

### **风险三：平台方自建类似功能**

**问题：**Cursor 或 Anthropic 自己做类似的推荐功能。

**应对：**保持中立性和数据质量是个人维护者的优势，平台方不会以中立方式做竞品推荐。同时快速建立社区认知，抢占【三方服务推荐】的心智定位。

### **风险四：技术复杂度超出个人资源**

**问题：**MCP Server \+ CLI \+ 数据库三线并行压力大。

**应对：**严格按阶段顺序执行，Phase 1 只做数据，不碰代码。先有数据，再有服务。MVP 的 MCP Server 代码量不超过 500 行，CLI 不超过 200 行。

# **七、立即开始 —— 本周行动清单**

| ✅ 第一周行动清单 |
| :---- |
| □  Day 1：在 GitHub 创建仓库，设置 Topics 和 README 框架 □  Day 2：设计 YAML Schema，创建第一个示例数据文件（/data/email.yaml） □  Day 3-5：填充高频 8 个场景的数据（email / payment / auth / database / file / ai-llm / analytics / logging） □  Day 6：提交到 awesome-mcp-servers 和 awesome-developer-first 列表 □  Day 7：发布 Hacker News Show HN 帖子，收集早期反馈 完成以上步骤后，进入 Phase 2（MCP Server 开发） |

*本文档由 Claude 辅助生成 · 基于 2025 年 2 月市场调研结论*