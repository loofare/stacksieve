# ServiceAdvisor MCP

> Give AI agents a superpower: instantly find the best third-party service for any job.

**ServiceAdvisor MCP** is a structured, always-updated recommendation engine designed for AI coding tools like Claude Code, Cursor, and Windsurf. Describe your product in natural language — the AI returns the top service picks with reasons, pricing info, and quick-start commands.

---

## Quick Start (Multi-Client)

As of **February 23, 2026**, `@stacksievehq/mcp-server` is **not published to npm** yet.
Use the **local build** command below to avoid `Server "service-advisor" not found`.

```bash
# 1) Build local MCP server
pnpm --filter @stacksievehq/mcp-server build

# 2) Register for Claude Code (project scope)
claude mcp add service-advisor --scope project -- node packages/mcp-server/dist/index.js

# Verify
claude mcp list
```

### JSON config (local repository mode)

`.mcp.json` / `.cursor/mcp.json` / `~/.codeium/windsurf/mcp_config.json`:

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

### TOML equivalent (for TOML-based wrappers/bridges)

```toml
[mcp_servers.service-advisor]
command = "node"
args = ["packages/mcp-server/dist/index.js"]
```

For full client-by-client setup (Claude Code / Cursor / Windsurf / Claude Desktop, project/user scope, JSON + TOML, troubleshooting), see [`docs/quickstart.md`](docs/quickstart.md).

---

## What It Does

```
You: "I'm building a SaaS with email notifications, payments, and user auth"

ServiceAdvisor:
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
# Build once
pnpm -r build

# Ask for recommendations
node packages/cli/dist/index.js "I need payments and email for a SaaS"

# Get service details
node packages/cli/dist/index.js detail Resend

# JSON output
node packages/cli/dist/index.js "auth solution" --format json
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
