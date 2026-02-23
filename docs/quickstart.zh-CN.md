# StackSieve 快速实践（npm 发布版优先）

[English](quickstart.md) | [简体中文](quickstart.zh-CN.md)

如果你遇到 `Server "service-advisor" not found`，优先看第 10 节。

命名约定：
- 产品名：`StackSieve`
- MCP 服务标识：`service-advisor`（兼容保留，不建议改名）
- npm 包：`@stacksievehq/mcp-server`、`@stacksievehq/cli`

## 1. 前置条件

```bash
node -v   # >= 20
npm -v    # >= 10
pnpm -v   # >= 8（仅本仓开发模式需要）
```

截至 **2026-02-23**，已发布版本：

- `@stacksievehq/mcp-server@0.1.2`
- `@stacksievehq/cli@0.1.1`

## 2. 推荐接入路径（npm 发布版）

```bash
# Claude Code 项目级注册（推荐）
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# 查看
claude mcp list
```

快速闭环验证：

```bash
npx -y @stacksievehq/cli@latest categories --format json
```

## 3. 模式说明

| 模式 | 适用场景 | command/args |
|------|----------|--------------|
| npm 发布模式（推荐） | 团队成员、外部用户、开箱即用 | `npx` + `-y @stacksievehq/mcp-server` |
| 本仓开发模式（备选） | 调试仓库内未发布改动 | `node` + `/ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js` |

下文默认使用 npm 发布模式。

## 4. Claude Code 接入

### 4.1 CLI 注册

```bash
# 项目级（写入当前仓库 .mcp.json）
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# 用户级（写入 ~/.claude.json）
claude mcp add service-advisor --scope user -- npx -y @stacksievehq/mcp-server

claude mcp list
```

### 4.2 JSON 配置

项目级 `.mcp.json`：

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

用户级 `~/.claude.json` 可使用同样结构。

### 4.3 TOML 配置

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

### 4.4 TOML-only 场景示例

适用于只接受 TOML 的桥接器/封装层：

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

关键点：
1. `command` 必须是 `npx`
2. `args` 必须包含 `-y` 与 `@stacksievehq/mcp-server`

## 5. Cursor 接入

项目级 `.cursor/mcp.json`：

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

用户级 `~/.cursor/mcp.json` 可使用同样结构。

## 6. Windsurf 接入

编辑 `~/.codeium/windsurf/mcp_config.json`：

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

## 7. Claude Desktop 接入

添加 MCP server：

- `name`: `service-advisor`
- `command`: `npx`
- `args`: `-y @stacksievehq/mcp-server`

## 8. 本仓开发模式（仅备选）

仅在你需要验证未发布代码时使用：

```bash
# 在仓库根目录
pnpm --filter @stacksievehq/mcp-server build

# 项目级注册
claude mcp add service-advisor --scope project -- node /ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js
```

## 9. 端到端验证

1. 确认注册：

```bash
claude mcp list
```

2. 在客户端提问：

```text
我在做一个 SaaS，需要邮件通知、支付订阅和用户认证，推荐三方服务。
```

期望至少返回 `email`、`payment`、`auth` 三类推荐。

3. 用 CLI 对照验证：

```bash
npx -y @stacksievehq/cli@latest "我需要邮件和支付" --format json
npx -y @stacksievehq/cli@latest detail Resend --format json
npx -y @stacksievehq/cli@latest categories --format json
```

4. 建议提示词（覆盖多场景）：

```text
我在做全球化 SaaS，需要邮件、支付和认证，每类给我 Top 3。
```

```text
我需要低成本日志和分析方案，优先免费层和开发者体验。
```

```text
我在做 AI 产品，需要向量检索、队列和对象存储。
```

## 10. 常见问题

### Q1. 仍然报 `Server "service-advisor" not found`

1. 运行 `claude mcp list`，确认存在 `service-advisor`。
2. 若不存在，重新执行第 2 节注册命令。
3. 若存在但不可用，核对 `command/args` 是否与第 4 节一致。

### Q2. `npx -y @stacksievehq/mcp-server` 执行失败

1. 先执行 `npm view @stacksievehq/mcp-server version --registry=https://registry.npmjs.org`。
2. 若公司网络限制 `npx`，切换到第 8 节本仓开发模式。
3. 确认 Node 版本满足 `>=20`。

### Q3. 只能用 TOML，不能导入 JSON

使用第 4.3 或 4.4 节配置，保持 `command=npx` 与 `args=["-y", "@stacksievehq/mcp-server"]`。

## 11. MCP 工具

| 工具 | 用途 |
|------|------|
| `recommend_services` | 输入需求描述，按分类返回推荐结果 |
| `get_service_detail` | 查询单个服务的完整信息 |
| `list_categories` | 列出全部支持分类 |
