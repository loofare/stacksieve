# StackSieve Quickstart (npm-first)

[English](quickstart.md) | [简体中文](quickstart.zh-CN.md)

If you see `Server "service-advisor" not found`, check Section 10 first.

Naming conventions:
- Product name: `StackSieve`
- MCP service id: `service-advisor` (kept for compatibility)
- npm packages: `@stacksievehq/mcp-server`, `@stacksievehq/cli`

## 1. Prerequisites

```bash
node -v   # >= 20
npm -v    # >= 10
pnpm -v   # >= 8 (only needed for local repo mode)
```

As of **2026-02-24**, published versions are:

- `@stacksievehq/mcp-server@0.1.3`
- `@stacksievehq/cli@0.1.2`

If your environment uses a mirror registry and `npx` resolves stale dependencies, run with npmjs registry explicitly:

```bash
npx --registry=https://registry.npmjs.org -y @stacksievehq/cli@latest categories --format json
```

## 2. Recommended Path (npm published mode)

```bash
# Claude Code project-scope registration (recommended)
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# Verify
claude mcp list
```

Quick sanity check via CLI:

```bash
npx -y @stacksievehq/cli@latest categories --format json
```

## 2.1 First 5-Minute Checklist

Run these in order:

```bash
# 1) Verify package visibility
npm view @stacksievehq/mcp-server version --registry=https://registry.npmjs.org
npm view @stacksievehq/cli version --registry=https://registry.npmjs.org

# 2) Verify CLI works
npx -y @stacksievehq/cli@latest "email + payment + auth" --format json

# 3) Verify MCP registration
claude mcp list
```

If step 2 fails on mirror registries, retry with:

```bash
npx --registry=https://registry.npmjs.org -y @stacksievehq/cli@latest "I need image storage" --format json
```

## 3. Mode Matrix

| Mode | When to use | command/args |
|------|-------------|--------------|
| npm published mode (recommended) | Team onboarding and external users | `npx` + `-y @stacksievehq/mcp-server` |
| local repo mode (fallback) | Validate unpublished changes from this repository | `node` + `/ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js` |

This guide defaults to npm published mode.

## 4. Claude Code

### 4.1 Register via CLI

```bash
# project scope (writes .mcp.json in current repo)
claude mcp add service-advisor --scope project -- npx -y @stacksievehq/mcp-server

# user scope (writes ~/.claude.json)
claude mcp add service-advisor --scope user -- npx -y @stacksievehq/mcp-server

claude mcp list
```

### 4.2 JSON config

Project-level `.mcp.json`:

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

User-level `~/.claude.json` can use the same structure.

### 4.3 TOML config

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

### 4.4 TOML-only wrapper example

For wrappers/bridges that only accept TOML, use exactly:

```toml
[mcp_servers.service-advisor]
command = "npx"
args = ["-y", "@stacksievehq/mcp-server"]
```

Must-haves:
1. `command` must be `npx`
2. `args` must include `-y` and `@stacksievehq/mcp-server`

## 5. Cursor

Project-level `.cursor/mcp.json`:

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

User-level `~/.cursor/mcp.json` can use the same structure.

## 6. Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

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

## 7. Claude Desktop

Add MCP server config:

- `name`: `service-advisor`
- `command`: `npx`
- `args`: `-y @stacksievehq/mcp-server`

## 8. Local Repo Fallback (development only)

Use only when testing unpublished code from this repository:

```bash
# from repository root
pnpm --filter @stacksievehq/mcp-server build

# register project scope
claude mcp add service-advisor --scope project -- node /ABSOLUTE/PATH/stacksieve/packages/mcp-server/dist/index.js
```

## 9. End-to-End Verification

1. Check registration:

```bash
claude mcp list
```

2. Prompt in your MCP client:

```text
I am building a SaaS and need email notifications, subscription payments, and user auth. Recommend third-party services.
```

Expected: at least `email`, `payment`, and `auth` recommendations.

3. Cross-check with CLI:

```bash
npx -y @stacksievehq/cli@latest "I need email and payments" --format json
npx -y @stacksievehq/cli@latest detail Resend --format json
npx -y @stacksievehq/cli@latest categories --format json
```

4. Suggested prompts for broader coverage:

```text
I need a global SaaS stack: email, billing, and auth, with top 3 options for each.
```

```text
I need low-cost logging and analytics with strong free tiers and good DX.
```

```text
I am building an AI app and need vector search, queueing, and object storage.
```

5. Input-to-category sanity checks:

| Input | Expected Categories |
|------|---------------------|
| `I need image storage for uploads` | `file-storage` |
| `I need object storage and image acceleration` | `file-storage`, `cdn` |
| `I need low-cost logging and analytics` | `logging`, `analytics` |
| `I need queue + cron background jobs` | `queue` |

## 10. Troubleshooting

### Q1. `Server "service-advisor" not found`

1. Run `claude mcp list` and verify `service-advisor` exists.
2. If missing, run the Section 2 registration command again.
3. If present but unavailable, verify `command/args` exactly match Section 4.

### Q2. `npx -y @stacksievehq/mcp-server` fails

1. Run `npm view @stacksievehq/mcp-server version --registry=https://registry.npmjs.org`.
2. If your default registry is a mirror, retry with `--registry=https://registry.npmjs.org`.
3. If needed, clean stale npx cache: `rm -rf ~/.npm/_npx`.
4. If `npx` is blocked by corporate network policy, use Section 8 local repo mode.
5. Ensure Node version is `>=20`.

### Q3. I can only use TOML, not JSON

Use Section 4.3/4.4 TOML configuration. Keep `command=npx` and `args=["-y", "@stacksievehq/mcp-server"]`.

## 11. MCP Tools

| Tool | Purpose |
|------|---------|
| `recommend_services` | Input product needs and get top picks by category |
| `get_service_detail` | Lookup full detail for one service |
| `list_categories` | List all supported categories |
