# 快速接入指南（多客户端）

如果你遇到 `Server "service-advisor" not found`，优先看第 2 节。

## 1. 前置条件

```bash
node -v   # >= 20
pnpm -v   # >= 8（本仓开发模式需要）
```

## 2. 先修复当前报错（本仓开发模式）

根因：截至 **2026-02-23**，`@stacksievehq/mcp-server` 尚未发布到 npm，`npx -y @stacksievehq/mcp-server` 会 404，导致 MCP server 注册失败。

先执行：

```bash
# 在仓库根目录
pnpm --filter @stacksievehq/mcp-server build

# 注册到 Claude Code（项目级）
claude mcp add service-advisor --scope project -- node packages/mcp-server/dist/index.js

# 检查是否注册成功
claude mcp list
```

## 3. 配置模式说明

| 模式 | 适用场景 | command/args |
|------|------|------|
| 本仓开发模式（推荐） | 你正在本仓库本地开发和测试 | `node` + `packages/mcp-server/dist/index.js` |
| npm 发布模式（未来） | 包已发布 npm 后给外部用户安装 | `npx` + `-y @stacksievehq/mcp-server` |

下文默认使用“本仓开发模式”。

## 4. Claude Code 接入

### 4.1 推荐：CLI 注册

```bash
# 项目级（写入当前仓库 .mcp.json）
claude mcp add service-advisor --scope project -- node packages/mcp-server/dist/index.js

# 用户级（写入 ~/.claude.json；建议使用绝对路径）
claude mcp add service-advisor --scope user -- node /ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js

# 查看
claude mcp list
```

### 4.2 JSON 配置

项目级 `.mcp.json`：

```json
{
  "mcpServers": {
    "service-advisor": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"]
    }
  }
}
```

用户级 `~/.claude.json`（建议绝对路径）：

```json
{
  "mcpServers": {
    "service-advisor": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### 4.3 TOML 等价配置（用于需要 TOML 的封装层/桥接器）

```toml
[mcp_servers.service-advisor]
command = "node"
args = ["/ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js"]
```

## 5. Cursor 接入

项目级 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "service-advisor": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js"]
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
      "command": "node",
      "args": ["/ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## 7. Claude Desktop 接入

在 Claude Desktop 的 MCP Servers 设置中添加：

- `name`: `service-advisor`
- `command`: `node`
- `args`: `/ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js`

## 8. 验证步骤（所有客户端通用）

1. 确认进程可启动：

```bash
node packages/mcp-server/dist/index.js
```

看到进程驻留即正常（`Ctrl+C` 退出）。

2. 在客户端提问：

```text
我在做一个 SaaS，需要邮件通知、支付订阅和用户认证，推荐三方服务
```

期望至少返回 `email/payment/auth` 三类推荐。

3. 可用本地 CLI 做对照验证：

```bash
node packages/cli/dist/index.js "我需要邮件和支付" --format json
node packages/cli/dist/index.js detail Resend --format json
node packages/cli/dist/index.js categories --format json
```

## 9. 常见问题

### Q1: 仍然报 `Server "service-advisor" not found`

1. 运行 `claude mcp list`，确认确实存在 `service-advisor`。
2. 若不存在，重新执行第 2 节 CLI 注册命令。
3. 若存在但不可用，检查 `args` 指向的 `dist/index.js` 是否真实存在。

### Q2: 修改了 TypeScript 代码后 MCP 不生效

重新构建：

```bash
pnpm --filter @stacksievehq/mcp-server build
```

### Q3: 必须使用 TOML，不能导入 JSON

使用第 4.3 节 TOML 等价配置；核心是保持 `command=node` 与 `args=<dist/index.js>` 一致。

## 10. 可用 MCP 工具

| 工具 | 用途 |
|------|------|
| `recommend_services` | 输入需求描述，返回 Top Pick 推荐列表 |
| `get_service_detail` | 输入服务名，返回完整 14 字段信息 |
| `list_categories` | 列出所有已收录场景分类 |
