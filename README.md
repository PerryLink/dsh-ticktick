# dsh-ticktick

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)

**English** | [中文](README.zh.md) | [Español](README.es.md) | [Português](README.pt.md) | [हिन्दी](README.hi.md)

TickTick / Dida365 (滴答清单) task bridge for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): a Session-header task panel (list filter, quick add, complete, delete, due dates, drag reorder), eleven curated agent tools, a plugin settings card, and a typed Remote service — all over the official TickTick MCP endpoint.

## Features

- **Session-header panel** — the `ticktick` action in the Session header opens a popup: filter by list (All + every list), toggle undone/completed views, full-text search, add tasks with an optional due date, complete, delete (with confirm), set/clear due dates with overdue/today/tomorrow chips, and drag-reorder (undone, single-list views). A status dot shows the connection state; when no token is configured the panel offers one-step in-panel token setup.
- **Eleven agent tools** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; Code Mode gets `await tools.ticktick_*(args)` for free.
- **Settings card** — Settings → Plugins → TickTick: API token (secret), token file, MCP endpoint with CN/International presets, protected task ids, a Test-connection button, and a Clear-credentials button.
- **Live token re-read** — the Bearer token is re-read per request (card secret > token file, default `$DSH_HOME/.ticktick-token`); a 401 resets the client so a rotated token activates without restart.
- **Measured workarounds** — the TickTick MCP server rejects `update_task` for tasks inside regular projects ("Expecting value: line 1 column 1"); the bridge retries via a move-to-inbox → update → move-back detour. Lists that fail server-side validation (historical `repeatFrom: ''` data) are skipped and reported as warnings, never silently dropped.
- **Protected ids** — mutating operations refuse tasks on the protected-id list before any wire call.
- **Multi-device sync** — every write lands on the TickTick cloud account, so the phone/desktop/web apps see it; every read fetches current state.

## Install

```sh
# npm (published artifact includes lib/, no build permission needed)
dsh plugin --profile web add @perrylink/dsh-ticktick

# git source (pin a commit; pnpm asks you to allow the prepare build once)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"

# local development
dsh plugin --profile web add link:/path/to/dsh-ticktick
```

Restart `dsh web` (bundle plugins activate on restart). The `ticktick` action appears in the Session header; the card appears under Settings → Plugins.

## Configuration

1. Get an API 口令 (a `dp_`-prefixed token) from the Dida365/TickTick web app: Profile → Settings → Account & Security → API 口令.
2. Pick one of three token sources (priority order): the Settings → Plugins → TickTick card's secret field, the `DIDA365_TOKEN` environment variable, or a token file (default `$DSH_HOME/.ticktick-token`, one line). Writing the file activates the bridge without any config change.
3. Use the card's **Test connection** button to verify the token, and **Clear credentials** to wipe it.

| Config key | Default | Meaning |
|---|---|---|
| `tokenFile` | `''` | Path to a text file holding the token; empty resolves to `$DSH_HOME/.ticktick-token` |
| `mcpUrl` | `https://mcp.dida365.com` | TickTick MCP endpoint (the international endpoint is unverified — see below) |
| `toolCallTimeoutMs` | `30000` | Per tools/call deadline in milliseconds |
| `protectedTaskIds` | `[]` | Task ids every mutating operation refuses |
| `tools.*` | `''` each | Raw MCP tool-name pins (projects/tasks/create/complete/remove/update/move); `''` = discover by pattern |

## Agent tools

| Tool | Purpose |
|---|---|
| `ticktick_status` | connection state: token configured, client connected, endpoint, last error |
| `ticktick_lists` | every list (project), the virtual Inbox included |
| `ticktick_tasks` | undone tasks: one list or all aggregated, with per-list warnings |
| `ticktick_add` | create a task (list, optional ISO due date) |
| `ticktick_complete` | complete a task (task id + list id) |
| `ticktick_delete` | delete a task (task id + list id) |
| `ticktick_due` | set/clear a due date (omit the date to clear) |
| `ticktick_reorder` | assign a new integer sortOrder (lists order by descending sortOrder) |
| `ticktick_completed` | tasks completed within a window (default 30 days), optionally one list |
| `ticktick_search` | full-text search over tasks (the official search tool) |
| `ticktick_batch_add` | create several tasks in one call |

## Architecture

```
browser panel ── ctx.remote.ticktick.* ──▶ TicktickService (Typert Remote)
settings card ── ctx.settingsScope ──────▶ settings namespace "ticktick"
agent tools ─── ctx.tools (ticktick_*) ──▶ the same service
                    │
                    ▼
        minimal streamable-HTTP MCP client
        (session id, protocol version, Retry-After)
                    │
                    ▼
        https://mcp.dida365.com  (official TickTick MCP)
```

## Known limitations

- The international TickTick endpoint is **unverified**: `mcpUrl` defaults to the CN endpoint, and the international MCP URL has not been probed.
- The completed view, search, and batch add ride the MCP tools `list_completed_tasks_by_date`, `search`, and `batch_add_tasks`; their wire contracts come from the published catalogue (`dida365-sdk` stubs) and **re-verification against the live endpoint is pending** — run `probes/probe-queries.mjs` with a real token before claiming them verified.
- The measured `update_task` crash and the list-validation failure are server-side behaviors; `probes/` re-verifies them against the live endpoint before a release (run with `DIDA365_TOKEN` exported).
- The `/api` surface the panel uses is the standard harness Typert gateway; the token is stored locally (settings document or token file) and sent only to TickTick's own servers. Do not expose a `dsh web` instance to the public internet.

## Verify the bridge against the live endpoint

```sh
# PowerShell
$env:DIDA365_TOKEN='dp_...'
node probes/probe-bootstrap.mjs      # handshake + tool catalogue
node probes/probe-crud.mjs           # create/complete/delete round trip
node probes/probe-due.mjs            # due dates (+ detour with a PROJECT_ID)
node probes/probe-reorder.mjs        # sortOrder semantics
node probes/probe-queries.mjs        # P2 query-tool contract discovery
```

## Uninstall

```sh
dsh plugin --profile web remove @perrylink/dsh-ticktick
```

Restart `dsh web`. All runtime registrations (tools, panel, settings card, prompt section) are removed with the plugin. The only static residue is the token in the user settings document — clear it first with the card's **Clear credentials** button (or remove the token file / `DIDA365_TOKEN` variable) to detach completely. To keep the package installed but inactive, disable the row instead:

```yaml
- id: ticktick
  disabled: true
```

### Install from the DSH Desktop Market

All PerryLink plugins are browsable in the built-in DSH Desktop Market: **Market → Sources → add source → paste** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ select it**. Installation still goes through the Market's npm-identity verification and your confirmation.

## License

[Apache-2.0](LICENSE)
