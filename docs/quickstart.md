# StackSieve 快速实践（npm 发布版优先）

如果你遇到 `Server "service-advisor" not found`，优先看第 9 节。

命名约定（统一口径）：
- 产品名：`StackSieve`
- MCP 服务标识：`service-advisor`（兼容保留，不建议改名）
- npm 包：`@stacksievehq/mcp-server`、`@stacksievehq/cli`

## 1. 前置条件

```bash
node -v   # >= 20
npm -v    # >= 10
pnpm -v   # >= 8（仅本仓开发模式需要）
```

截至 **2026-02-23**，npm 可用版本：

- `@stacksievehq/mcp-server@0.1.2`
- `@stacksievehq/cli@0.1.1`

## 2. 推荐接入路径（npm 发布版）

```bash
# Claude Code 项目级注册（推荐）
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# 查看
claude mcp list
```

如果你需要最快验证闭环，可直接运行：

```bash
npx -y @stacksievehq/cli@latest categories --format json
```

## 3. 配置模式说明

| 模式 | 适用场景 | command/args |
|------|------|------|
| npm 发布模式（推荐） | 团队成员、外部用户、开箱即用 | `npx` + `-y @stacksievehq/mcp-server` |
| 本仓开发模式（备选） | 你在本仓库调试最新未发布代码 | `node` + `/ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js` |

下文默认使用“npm 发布模式”。

## 4. Claude Code 接入

### 4.1 推荐：CLI 注册

```bash
# 项目级（写入当前仓库 .mcp.json）
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# 用户级（写入 ~/.claude.json）
claude mcp add service-advisor --scope user -- npx -y @stacksievehq/mcp-server

# 查看
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

用户级 `~/.claude.json` 也可使用同样配置。

### 4.3 TOML 等价配置（用于需要 TOML 的封装层/桥接器）

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

### 4.4 Claude Code（TOML-only 场景示例）

某些第三方桥接器或私有封装只接受 TOML，可直接复用：

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

关键点只有两条：
1. `command` 必须是 `npx`
2. `args` 必须包含 `["-y", "@stacksievehq/mcp-server"]`

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

用户级 `~/.cursor/mcp.json` 也可使用同样配置。

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

在 Claude Desktop 的 MCP Servers 设置中添加：

- `name`: `service-advisor`
- `command`: `npx`
- `args`: `-y @stacksievehq/mcp-server`

## 8. 本仓开发模式（仅备选）

仅在你需要验证未发布改动时使用：

```bash
# 在仓库根目录
pnpm --filter @stacksievehq/mcp-server build

# 项目级注册到 Claude Code
claude mcp add service-advisor --scope project -- node /ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js
```

## 9. 验证步骤（所有客户端通用）

1. 确认已注册：

```bash
claude mcp list
```

2. 在客户端提问：

```text
我在做一个 SaaS，需要邮件通知、支付订阅和用户认证，推荐三方服务
```

期望至少返回 `email/payment/auth` 三类推荐。

3. 用 CLI 对照验证：

```bash
npx -y @stacksievehq/cli@latest "我需要邮件和支付" --format json
npx -y @stacksievehq/cli@latest detail Resend --format json
npx -y @stacksievehq/cli@latest categories --format json
```

4. 建议在客户端直接测试这些提示词（覆盖多场景）：

```text
我在做一个全球化 SaaS，需要邮件、支付和用户认证，请给我每类 Top 3 方案
```

```text
我需要低成本日志与分析方案，优先免费层和开发者体验
```

```text
我做 AI 产品，需要向量检索、队列和对象存储
```

## 10. 常见问题

### Q1: 仍然报 `Server "service-advisor" not found`

1. 运行 `claude mcp list`，确认存在 `service-advisor`。
2. 若不存在，重新执行第 2 节注册命令。
3. 若已存在但不可用，检查配置中的 `command/args` 是否与第 4 节一致。

### Q2: `npx -y @stacksievehq/mcp-server` 执行失败

1. 先执行 `npm view @stacksievehq/mcp-server version --registry=https://registry.npmjs.org` 验证网络与 registry。
2. 若公司网络限制 `npx`，可切换到第 8 节本仓开发模式。
3. 确认本机 Node 版本满足 `>=20`。

### Q3: 必须使用 TOML，不能导入 JSON

使用第 4.3 节 TOML 等价配置；核心是保持 `command=npx` 与 `args=["-y","@stacksievehq/mcp-server"]` 一致。

## 11. 可用 MCP 工具（StackSieve）

| 工具 | 用途 |
|------|------|
| `recommend_services` | 输入需求描述，返回 Top Pick 推荐列表 |
| `get_service_detail` | 输入服务名，返回完整 14 字段信息 |
| `list_categories` | 列出所有已收录场景分类 |
