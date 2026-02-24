# StackSieve (MCP + CLI)

[English](README.md) | [简体中文](README.zh-CN.md)

> Give AI agents a superpower: instantly find the best third-party service for any job.

**StackSieve MCP** is a structured, continuously verified recommendation engine for AI coding tools like Claude Code, Cursor, and Windsurf. Describe your product in natural language and get service picks with rationale, pricing notes, and quick install commands.

Branding and compatibility:
- Product brand: **StackSieve**
- MCP server id / CLI command: `service-advisor` (kept for compatibility)
- npm scope: `@stacksievehq/*`

---

## Start in 30 Seconds (CLI-first)

The fastest way to validate StackSieve is CLI:

```bash
npx -y @stacksievehq/cli@latest "I need email + payment + auth for a SaaS" --format json
npx -y @stacksievehq/cli@latest categories --format json
npx -y @stacksievehq/cli@latest detail Resend --format json
```

CLI commands:
- `service-advisor "<description>" [--format table|json]`
- `service-advisor --category <category> [--format table|json]`
- `service-advisor detail <name> [--format table|json]`
- `service-advisor categories [--format table|json]`

### Copy-Paste CLI Recipes

```bash
# SaaS core stack
npx -y @stacksievehq/cli@latest "email + payment + auth" --format json

# Image/file storage
npx -y @stacksievehq/cli@latest "I need image storage for user uploads" --format json

# AI app stack
npx -y @stacksievehq/cli@latest "LLM API + vector search + queue" --format json

# One category only
npx -y @stacksievehq/cli@latest --category file-storage --format table
```

### Prompt Examples (Input -> Expected Categories)

| Input | Expected Categories |
|------|---------------------|
| `I need email + payment + auth` | `email`, `payment`, `auth` |
| `I need image storage for uploads` | `file-storage` |
| `I need object storage and image acceleration` | `file-storage`, `cdn` |
| `I need low-cost logging and analytics` | `logging`, `analytics` |
| `I need queue + cron background jobs` | `queue` |

---

## MCP Quick Start (npm-first)

As of **February 24, 2026**, published versions are:

- `@stacksievehq/mcp-server@0.1.3`
- `@stacksievehq/cli@0.1.2`

If your network uses a mirror registry and you still get old transitive packages, force npmjs registry:

```bash
npx --registry=https://registry.npmjs.org -y @stacksievehq/cli@latest "email + payment + auth" --format json
```

```bash
# Register to Claude Code (project scope)
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# Verify
claude mcp list
```

### JSON config (npm mode)

`.mcp.json` / `.cursor/mcp.json` / `~/.codeium/windsurf/mcp_config.json`:

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

### TOML config (for TOML-only wrappers)

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

### Local fallback (repo development mode)

```bash
pnpm --filter @stacksievehq/mcp-server build
claude mcp add service-advisor --scope project -- node /ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js
```

Detailed setup by client (EN/CN):
- [Quickstart (English)](docs/quickstart.md)
- [快速实践（中文）](docs/quickstart.zh-CN.md)

---

## What It Does

```text
You: "I'm building a SaaS with email notifications, payments, and user auth"

StackSieve:
  email   -> Resend
  payment -> Stripe
  auth    -> Clerk
```

---

## Covered Categories (12)

| Category | Top Pick | Alternatives |
|----------|----------|--------------|
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

## MCP Tools

| Tool | Description |
|------|-------------|
| `recommend_services` | Input natural language needs, output ranked picks by category |
| `get_service_detail` | Input a service name, output full 14-field record |
| `list_categories` | Return all supported categories |

---

## CLI Usage (Detailed)

```bash
# npm usage (recommended)
npx -y @stacksievehq/cli@latest "I need payments and email for a SaaS"
npx -y @stacksievehq/cli@latest detail Resend
npx -y @stacksievehq/cli@latest categories --format json
```

```bash
# local repo mode (development fallback)
pnpm -r build
node packages/cli/dist/index.js "I need payments and email for a SaaS"
```

---

## Contributing Data

1. Read [docs/schema.md](docs/schema.md)
2. Edit YAML in [data/](data/)
3. Run `pnpm validate-data`
4. Open a PR with source verification for docs/pricing/MCP support

See [docs/contributing.md](docs/contributing.md) for details.

---

## License

- Data (`/data/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) via [LICENSE-DATA](LICENSE-DATA)
- Code (`/packages/`): MIT via [LICENSE](LICENSE)
