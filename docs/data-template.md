# 数据填充模板与示例

本页提供两份可直接复用的模板文件：

- 通用模板：`docs/templates/service-record-template.yaml`
- 参考示例：`docs/templates/service-record-example.yaml`

## 快速使用流程

1. 复制模板到目标场景文件，例如 `data/email.yaml`。
2. 每条服务记录必须包含 14 个字段，且 `category` 必须与文件名一致。
3. 运行校验：

```bash
pnpm validate-data
```

4. 提交前人工核验：

- `official_docs` 必须可访问
- `pricing_tier` / `free_tier` 必须与官网一致
- `mcp_available` / `mcp_url` 必须核实
- `last_verified` 使用 `YYYY-MM`

## 主场景覆盖建议（v0.2）

建议每个场景至少覆盖 5 个主流服务：

- `email`: Resend, SendGrid, Postmark, Mailgun, Amazon SES
- `payment`: Stripe, Lemon Squeezy, Paddle, Braintree, Adyen
- `auth`: Clerk, Auth.js, Supabase Auth, WorkOS, Lucia
- `database`: Supabase, Neon, PlanetScale, Turso, Railway Postgres
- `ai-llm`: Anthropic Claude API, OpenAI API, Google Gemini API, Groq API, Mistral API
- `file-storage`: Cloudflare R2, AWS S3, Backblaze B2, UploadThing, Bunny Storage
- `search`: Algolia, Typesense, Meilisearch, Elasticsearch, OpenSearch
- `analytics`: PostHog, Mixpanel, Plausible Analytics, Amplitude, Heap
- `logging`: Axiom, Better Stack Logtail, Datadog, Sentry, Logflare
- `queue`: Inngest, Upstash QStash, BullMQ, Trigger.dev, Temporal
- `cdn`: Cloudflare CDN, Fastly, Bunny CDN, AWS CloudFront, Vercel Edge Network
- `notification`: Novu, Knock, Courier, OneSignal, Firebase Cloud Messaging
