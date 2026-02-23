# 快速接入指南（5 分钟）

ServiceAdvisor MCP 让你的 AI 编程工具立即获得三方服务推荐能力。

## Claude Code 接入

编辑 `~/.claude/mcp.json`：

```json
{
  "mcpServers": {
    "service-advisor": {
      "command": "npx",
      "args": ["-y", "@stacksieve/service-advisor-mcp"]
    }
  }
}
```

重启 Claude Code，然后直接询问：

> "我在做一个 SaaS，需要邮件通知、支付订阅和用户认证，推荐三方服务"

## Cursor 接入

编辑项目根目录的 `.cursor/mcp.json`（或全局配置），内容同上。

## CLI 接入（无需 MCP）

```bash
# 直接查询推荐
npx service-advisor "我需要邮件和支付功能"

# 按场景查询
npx service-advisor --category email

# 查看服务详情
npx service-advisor detail Resend

# JSON 格式输出
npx service-advisor "auth 方案" --format json
```

## 可用的三个 MCP 工具

| 工具 | 用途 |
|------|------|
| `recommend_services` | 输入需求描述，返回 Top Pick 推荐列表 |
| `get_service_detail` | 输入服务名，返回完整 12 字段信息 |
| `list_categories` | 列出所有已收录场景分类 |
