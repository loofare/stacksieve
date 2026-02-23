# 数据字段说明（Schema Reference）

StackSieve 数据库中每条服务记录包含 **14 个标准字段**，定义在 [`data/_schema.yaml`](../data/_schema.yaml)。

## 字段详解

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 服务名称，作为唯一标识符 |
| `category` | enum | ✅ | 主场景分类（见下方枚举） |
| `tags` | list | ✅ | 补充标签，如 `free-tier`、`open-source`、`self-hostable` |
| `pricing_tier` | enum | ✅ | 定价档位：`free` / `freemium` / `paid` / `enterprise` |
| `free_tier` | string | ✅ | 免费额度说明，如 `"100 emails/day"`；无则填 `null` |
| `ai_friendliness` | int(1-5) | ✅ | AI 友好度：文档质量 + SDK 完整度 + MCP 支持 |
| `dx_score` | int(1-5) | ✅ | 开发者体验：接入难度（反向）、文档、社区支持 |
| `official_docs` | url | ✅ | 官方文档 URL，须人工确认可访问 |
| `mcp_available` | bool | ✅ | 是否有官方或社区 MCP Server |
| `mcp_url` | url | ✅ | MCP Server 地址；无则填 `null` |
| `quick_install` | string | ✅ | 安装命令，如 `npm install resend` |
| `best_for` | list | ✅ | 推荐使用场景标签 |
| `not_for` | list | ✅ | 明确不适合的场景 |
| `last_verified` | date | ✅ | 最后人工验证日期，格式 `YYYY-MM` |

## 场景分类枚举（category）

| 值 | 含义 |
|----|------|
| `email` | 邮件发送（事务邮件、营销邮件） |
| `payment` | 支付处理（一次性、订阅） |
| `auth` | 用户认证、授权、SSO |
| `database` | 数据库（关系型、NoSQL） |
| `ai-llm` | 大语言模型 API |
| `file-storage` | 对象/文件存储 |
| `search` | 全文检索、向量搜索 |
| `analytics` | 用户行为分析、埋点 |
| `logging` | 日志收集、错误监控 |
| `queue` | 消息队列、后台任务调度 |
| `cdn` | 内容分发网络 |
| `notification` | 推送通知（App Push、短信） |

## 示例记录

```yaml
- name: "Resend"
  category: "email"
  tags: ["transactional", "developer-friendly", "free-tier"]
  pricing_tier: "freemium"
  free_tier: "100 emails/day"
  ai_friendliness: 5
  dx_score: 5
  official_docs: "https://resend.com/docs"
  mcp_available: true
  mcp_url: "https://github.com/resend/mcp-send-email"
  quick_install: "npm install resend"
  best_for: ["indie hackers", "AI apps", "SaaS MVP"]
  not_for: ["high volume > 50k/day without paid plan"]
  last_verified: "2026-02"
```

## 评分标准

### `ai_friendliness`（AI 友好度）

| 分值 | 含义 |
|------|------|
| 5 | 官方 MCP Server + 完整 TypeScript SDK + 文档示例丰富 |
| 4 | 优质 SDK + 文档完整，无官方 MCP |
| 3 | SDK 可用，文档尚可 |
| 2 | 仅有 REST API，文档一般 |
| 1 | 文档稀缺，接入困难 |

### `dx_score`（开发者体验）

| 分值 | 含义 |
|------|------|
| 5 | 接入极简（< 5 行代码），文档极佳，社区活跃 |
| 4 | 接入简单，文档良好 |
| 3 | 接入一般，需要一定配置 |
| 2 | 接入复杂，文档不完整 |
| 1 | 接入困难，文档匮乏 |
