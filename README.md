# StackSieve MCP

> Give AI agents a superpower: instantly find the best third-party service for any job.

**StackSieve MCP** is a structured, always-updated recommendation engine designed for AI coding tools like Claude Code, Cursor, and Windsurf. Describe your product in natural language — the AI returns the top service picks with reasons, pricing info, and quick-start commands.

Branding note:
- Product name: **StackSieve**
- MCP server id / CLI command: `service-advisor` (kept for compatibility)

---

## Quick Start (Multi-Client)

As of **February 23, 2026**, packages are available on npm:

- `@stacksievehq/mcp-server@0.1.2`
- `@stacksievehq/cli@0.1.1`

Use **npm mode first** for fastest setup.

```bash
# 1) Register for Claude Code (project scope)
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# Verify
claude mcp list
```

### JSON config (npm published mode)

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

### TOML equivalent (for TOML-based wrappers/bridges)

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

### Local fallback (repository development mode)

```bash
pnpm --filter @stacksievehq/mcp-server build
claude mcp add service-advisor --scope project -- node /ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js
```

For full client-by-client setup (Claude Code / Cursor / Windsurf / Claude Desktop, project/user scope, JSON + TOML, npm-first + local fallback, troubleshooting), see [`docs/quickstart.md`](docs/quickstart.md).

---

## What It Does

```
You: "I'm building a SaaS with email notifications, payments, and user auth"

StackSieve:
  email   → Resend       (free tier: 100/day, 1-line SDK, official MCP server)
  payment → Stripe       (industry standard, subscription support)
  auth    → Clerk        (best Next.js DX, free plan covers MVP)
```

---

## Covered Categories (12 Scenarios)

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
| `recommend_services` | Input: natural language description → Output: top picks per category |
| `get_service_detail` | Input: service name → Output: full 14-field record |
| `list_categories` | Input: none → Output: all available categories |

---

## CLI Usage

```bash
# npm usage (recommended)
npx -y @stacksievehq/cli@latest "I need payments and email for a SaaS"

# Get service details
npx -y @stacksievehq/cli@latest detail Resend

# JSON output
npx -y @stacksievehq/cli@latest "auth solution" --format json
```

```bash
# local repository mode (development fallback)
pnpm -r build
node packages/cli/dist/index.js "I need payments and email for a SaaS"
```

---

## Contributing Data

We welcome PRs to add or update service entries!

1. Read [`docs/schema.md`](docs/schema.md) for the 14-field format
2. Edit the relevant YAML file in [`/data/`](data/)
3. Run `pnpm validate-data` to check schema compliance
4. Open a PR — human verification required for pricing and docs URLs

See [`docs/contributing.md`](docs/contributing.md) for the full guide.

---

## License

- **Data** (`/data/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — see [`LICENSE-DATA`](LICENSE-DATA)
- **Code** (`/packages/`): MIT — see [`LICENSE`](LICENSE)

---

*Built for the AI Agent era · Data verified monthly · Contributions welcome*
