# ServiceAdvisor MCP

> Give AI agents a superpower: instantly find the best third-party service for any job.

**ServiceAdvisor MCP** is a structured, always-updated recommendation engine designed for AI coding tools like Claude Code, Cursor, and Windsurf. Describe your product in natural language — the AI returns the top service picks with reasons, pricing info, and quick-start commands.

---

## Quick Start (Claude Code / Cursor)

Add to your MCP configuration:

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

**Claude Code** — `~/.claude/mcp.json`  
**Cursor** — `.cursor/mcp.json`  
**Claude Desktop** — Settings → MCP Servers

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
| `queue` | Upstash QStash | BullMQ, Inngest |
| `cdn` | Cloudflare | Fastly, BunnyCDN |
| `notification` | Novu | Knock, Courier |

---

## MCP Tools

| Tool | Description |
|------|-------------|
| `recommend_services` | Input: natural language description → Output: top picks per category |
| `get_service_detail` | Input: service name → Output: full 12-field record |
| `list_categories` | Input: none → Output: all available categories |

---

## CLI Usage

```bash
# Ask for recommendations
npx service-advisor "I need payments and email for a SaaS"

# Filter by category
npx service-advisor --category email

# Get service details
npx service-advisor --detail Resend

# JSON output
npx service-advisor "auth solution" --format json
```

---

## Contributing Data

We welcome PRs to add or update service entries!

1. Read [`docs/schema.md`](docs/schema.md) for the 12-field format
2. Edit the relevant YAML file in [`/data/`](data/)
3. Run `pnpm validate-data` to check schema compliance
4. Open a PR — human verification required for pricing and docs URLs

See [`docs/contributing.md`](docs/contributing.md) for the full guide.

---

## License

- **Data** (`/data/`): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — use freely, attribution required
- **Code** (`/packages/`): [MIT License](LICENSE)

---

*Built for the AI Agent era · Data verified monthly · Contributions welcome*
