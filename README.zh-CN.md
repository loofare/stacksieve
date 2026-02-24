# StackSieve（MCP + CLI）

[English](README.md) | [简体中文](README.zh-CN.md)

> 给 AI Agent 一项超能力：快速找到最合适的第三方服务。

**StackSieve MCP** 是面向 Claude Code、Cursor、Windsurf 等 AI 编码工具的结构化服务推荐引擎。你用自然语言描述产品需求，系统返回推荐服务、选择理由、定价信息与快速安装命令。

命名与兼容说明：
- 产品品牌：**StackSieve**
- MCP 服务标识 / CLI 命令：`service-advisor`（为兼容保留）
- npm scope：`@stacksievehq/*`

---

## 30 秒上手（CLI 优先）

最快验证 StackSieve 的方式是先跑 CLI：

```bash
npx -y @stacksievehq/cli@latest "我需要邮件+支付+认证能力做一个 SaaS" --format json
npx -y @stacksievehq/cli@latest categories --format json
npx -y @stacksievehq/cli@latest detail Resend --format json
```

CLI 命令面：
- `service-advisor "<description>" [--format table|json]`
- `service-advisor --category <category> [--format table|json]`
- `service-advisor detail <name> [--format table|json]`
- `service-advisor categories [--format table|json]`

---

## MCP 快速开始（npm 优先）

截至 **2026-02-23**，已发布版本：

- `@stacksievehq/mcp-server@0.1.2`
- `@stacksievehq/cli@0.1.1`

```bash
# 注册到 Claude Code（项目级）
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# 验证
claude mcp list
```

### JSON 配置（npm 模式）

`.mcp.json` / `.cursor/mcp.json` / `~/.codeium/windsurf/mcp_config.json`：

```json
{
  "mcpServers": {
    "service-advisor": {
      "command": "npx",
      "args": ["-y", "@stacksievehq/mcp-server"]
    }
  }
}
```

### TOML 配置（适用于 TOML-only 封装）

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

### 本地仓库兜底（开发模式）

```bash
pnpm --filter @stacksievehq/mcp-server build
claude mcp add service-advisor --scope project -- node /ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js
```

按客户端的完整接入文档（中英文）：
- [Quickstart (English)](docs/quickstart.md)
- [快速实践（中文）](docs/quickstart.zh-CN.md)

---

## 能力概览

```text
你："我在做一个 SaaS，需要邮件通知、支付和用户认证"

StackSieve：
  email   -> Resend
  payment -> Stripe
  auth    -> Clerk
```

---

## 覆盖场景（12 类）

| 场景 | Top Pick | 备选 |
|------|----------|------|
| `email` | Resend | SendGrid, Postmark |
| `payment` | Stripe | LemonSqueezy, Paddle |
| `auth` | Clerk | Auth.js, Supabase Auth |
| `database` | Supabase | PlanetScale, Neon |
| `ai-llm` | Anthropic | OpenAI, Groq |
| `file-storage` | Cloudflare R2 | AWS S3, Backblaze B2 |
| `search` | Algolia | Typesense, Meilisearch |
| `analytics` | PostHog | Mixpanel, Plausible |
| `logging` | Axiom | Logtail, Datadog |
| `queue` | Inngest | Upstash QStash, BullMQ |
| `cdn` | Cloudflare | Fastly, BunnyCDN |
| `notification` | Novu | Knock, Courier |

---

## MCP 工具

| 工具 | 说明 |
|------|------|
| `recommend_services` | 输入自然语言需求，按分类返回推荐结果 |
| `get_service_detail` | 输入服务名，返回完整 14 字段记录 |
| `list_categories` | 返回全部支持分类 |

---

## CLI 用法（详细）

```bash
# npm 方式（推荐）
npx -y @stacksievehq/cli@latest "我需要邮件和支付能力"
npx -y @stacksievehq/cli@latest detail Resend
npx -y @stacksievehq/cli@latest categories --format json
```

```bash
# 本地仓库方式（开发兜底）
pnpm -r build
node packages/cli/dist/index.js "我需要邮件和支付能力"
```

---

## 数据贡献

1. 阅读 [docs/schema.md](docs/schema.md)
2. 编辑 [data/](data/) 对应 YAML
3. 运行 `pnpm validate-data`
4. 提交 PR（需核实 docs/pricing/MCP 支持）

详见 [docs/contributing.md](docs/contributing.md)。

---

## 许可证

- 数据（`/data/`）：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)（见 [LICENSE-DATA](LICENSE-DATA)）
- 代码（`/packages/`）：MIT（见 [LICENSE](LICENSE)）
