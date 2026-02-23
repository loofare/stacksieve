# 贡献指南（Contributing Guide）

感谢你愿意为 ServiceAdvisor 数据库贡献数据！我们的核心资产是 `/data/` 目录下的 YAML 文件。

## 贡献类型

| 类型 | 说明 |
|------|------|
| 🆕 新增服务 | 向某个场景添加尚未收录的服务 |
| ✏️ 更新数据 | 更新定价、文档 URL 或 MCP 支持状态 |
| 🗑️ 标记下线 | 标记已停止运营的服务 |
| 💬 修正错误 | 修正不准确的字段内容 |

## 贡献步骤

### 1. Fork 并克隆仓库

```bash
git clone https://github.com/yourusername/stacksieve.git
cd stacksieve
pnpm install
```

### 2. 找到对应的 YAML 文件

所有数据文件在 `/data/` 目录，按场景命名：

```
data/email.yaml      # 邮件服务
data/payment.yaml    # 支付服务
data/auth.yaml       # 认证服务
...
```

### 3. 按 Schema 格式添加记录

参考 [`docs/schema.md`](schema.md) 了解所有字段含义。每条记录必须包含全部 12 个字段：

```yaml
services:
  - name: "YourService"
    category: "email"          # 必须是合法的场景枚举值
    tags: ["free-tier"]
    pricing_tier: "freemium"
    free_tier: "1000 emails/month"
    ai_friendliness: 4
    dx_score: 4
    official_docs: "https://yourservice.com/docs"
    mcp_available: false
    mcp_url: null
    quick_install: "npm install yourservice"
    best_for: ["indie hackers", "small teams"]
    not_for: ["high volume production"]
    last_verified: "2025-02"    # 填写你验证的当月
```

### 4. 人工核实必填项（重要）

提交前，请务必亲自确认以下字段：

- [ ] `official_docs` URL 可访问，且指向文档页（非营销页）
- [ ] `pricing_tier` 和 `free_tier` 与当前官网定价页一致
- [ ] `mcp_available` 已在 [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) 实际查找确认
- [ ] `last_verified` 填写了你核实的年月（YYYY-MM）

### 5. 验证 Schema 合规性

```bash
pnpm validate-data
```

确保 CI 通过后再提交。

### 6. 提交 PR

- PR 标题格式：`[data] Add ServiceName to category`
- PR 描述中说明你验证定价/文档的来源

## 数据质量原则

> **宁缺勿滥。** 我们追求每个场景有一个明确的、无可争议的首选推荐（Top Pick）。不追求收录所有服务，追求数据准确。

- 不接受未经人工核实的 AI 生成数据
- 不接受纯粹的广告性质 PR（商业赞助请通过其他渠道联系）
- 不接受已停止维护超过 1 年的服务

## 许可声明

提交数据意味着你同意将其以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 协议发布。
