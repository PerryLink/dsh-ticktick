# dsh-ticktick

```sh
dsh plugin --profile <name> add @perrylink/dsh-ticktick
```


> Release stamp: `0.1.13` (2026-10-04).

**English** | [中文](README-zh.md) | [Español](README-es.md) | [Português](README-pt.md) | [हिन्दी](README-hi.md)

> **Package name.** This project publishes to npm as **`@perrylink/dsh-ticktick`**. The bare npm name `dsh-ticktick` belongs to a different, unrelated project — installing it does not install this plugin.

TickTick / Dida365 (滴答清单) task bridge for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): a Session-header task panel (list filter, quick add, complete, delete, due dates, drag reorder), eleven curated agent tools, a configuration page on the Plugins page, and a typed Remote service — all over the official TickTick MCP endpoint.


[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-ticktick.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-listed-en.svg)](https://dsh.market/)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-ticktick)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-ticktick/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-ticktick/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-ticktick?label=version)](https://github.com/PerryLink/dsh-ticktick/releases)
[![npm version](https://img.shields.io/npm/v/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![npm downloads](https://img.shields.io/npm/dm/%40perrylink%2Fdsh-ticktick)](https://www.npmjs.com/package/@perrylink/dsh-ticktick)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-ticktick?metric=downloads)](https://dshfind.com/plugins/PerryLink/dsh-ticktick?ref=badge)

## Install

```sh
dsh plugin --profile web add github:PerryLink/dsh-ticktick
```

```sh
# npm (published artifact includes lib/, no build permission needed)
dsh plugin --profile web add @perrylink/dsh-ticktick

# git source (pin a commit; pnpm asks you to allow the prepare build once)
dsh plugin --profile web add "github:PerryLink/dsh-ticktick#<sha>"

# local development
dsh plugin --profile web add link:/path/to/dsh-ticktick
```

Restart `dsh web` (bundle plugins activate on restart). The `ticktick` action appears in the Session header; its configuration page opens from the **Configure** control on the TickTick row of the Plugins page.

## What is dsh-ticktick?

TickTick / Dida365 (滴答清单) task bridge for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): a Session-header task panel (list filter, quick add, complete, delete, due dates, drag reorder), eleven curated agent tools, a configuration page on the Plugins page, and a typed Remote service — all over the official TickTick MCP endpoint.

![Terminal demo of dsh-ticktick: dsh-ticktick — install, then verify against the live endpoint](https://raw.githubusercontent.com/PerryLink/dsh-ticktick/main/docs/assets/dsh-ticktick-hero.png)

![Animated terminal demo of dsh-ticktick](https://raw.githubusercontent.com/PerryLink/dsh-ticktick/main/docs/assets/dsh-ticktick-demo.gif)

*The same run, animated.*

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness **dsh-v0.2.1-alpha.1** (GitHub tag). npm dependency line: `@deepseek-ai/dsh` **0.2.1-alpha.1** (peers `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0 || >=0.1.6-0 <0.2.0 || >=0.1.7-0 <0.2.0 || >=0.2.0-0 <0.3.0 || >=0.2.1-0 <0.3.0`). Verified against the dsh-v0.2.1-alpha.1 checkout (full gate chain + profile install smoke). |
| Node | `^22.19.0 \|\| >=24.0.0` |

## Features

- **Session-header panel** — the `ticktick` action in the Session header opens a popup: filter by list (All + every list), toggle undone/completed views, full-text search, add tasks with an optional due date, complete, delete (with confirm), set/clear due dates with overdue/today/tomorrow chips, and drag-reorder (undone, single-list views). A status dot shows the connection state; when no token is configured the panel offers one-step in-panel token setup.
- **Eleven agent tools** — `ticktick_status`, `ticktick_lists`, `ticktick_tasks`, `ticktick_add`, `ticktick_complete`, `ticktick_delete`, `ticktick_due`, `ticktick_reorder`, `ticktick_completed`, `ticktick_search`, `ticktick_batch_add`; Code Mode gets `await tools.ticktick_*(args)` for free.
- **Configuration page** — Plugins page → the TickTick row → **Configure**: API token (secret), token file, MCP endpoint with CN/International presets, protected task ids (all four applied live, no restart), a Test-connection button, and a Clear-credentials button.
- **Live token re-read** — the Bearer token is re-read per request (card secret > token file, default `$DSH_HOME/.ticktick-token`); a 401 resets the client so a rotated token activates without restart.
- **Measured workarounds** — the TickTick MCP server rejects `update_task` for tasks inside regular projects ("Expecting value: line 1 column 1"); the bridge retries via a move-to-inbox → update → move-back detour. Lists that fail server-side validation (historical `repeatFrom: ''` data) are skipped and reported as warnings, never silently dropped.
- **Protected ids** — mutating operations refuse tasks on the protected-id list before any wire call.
- **Multi-device sync** — every write lands on the TickTick cloud account, so the phone/desktop/web apps see it; every read fetches current state.

## Configuration

1. Get an API 口令 (a `dp_`-prefixed token) from the Dida365/TickTick web app: Profile → Settings → Account & Security → API 口令.
2. Pick one of three token sources (priority order): the TickTick configuration page's secret field (Plugins page → the TickTick row → Configure), the `DIDA365_TOKEN` environment variable, or a token file (default `$DSH_HOME/.ticktick-token`, one line). Writing the file activates the bridge without any config change.
3. Use the card's **Test connection** button to verify the token, and **Clear credentials** to wipe it.

| Key | Default | Meaning |
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
configuration page ── ctx.configForms ──▶ profile entry "ticktick" (Volatile Config)
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

Restart `dsh web`. All runtime registrations (tools, panel, configuration page, prompt section) are removed with the plugin. The only static residue is the token in the user settings document — clear it first with the **Clear credentials** button on the TickTick configuration page (or remove the token file / `DIDA365_TOKEN` variable) to detach completely. To keep the package installed but inactive, disable the row instead:

```yaml
- id: ticktick
  disabled: true
```

### Install from the DSH Desktop Market

All PerryLink plugins are browsable in the built-in DSH Desktop Market: **Market → Sources → add source → paste** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ select it**. Installation still goes through the Market's npm-identity verification and your confirmation.

## PerryLink DSH Plugin Family

This project is part of the DeepSeek Harness plugin family from [PerryLink](https://github.com/PerryLink). The roster stays collapsed below so every README keeps a short first screen; expand it to see every row and its status.

<details>
<summary>Expand all plugins</summary>

| Plugin | Status |
|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** |  |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** |  |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** |  |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** |  |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** |  |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** |  |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** |  |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** |  |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | 🧊 FROZEN — see the repo README |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | 🧊 FROZEN — see the repo README |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | 🧊 FROZEN — see the repo README |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | 🧊 FROZEN — see the repo README |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | 🧊 FROZEN — see the repo README |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | 🚫 RETIRED — see the repo README |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | 🚫 RETIRED — see the repo README |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | 🚫 RETIRED — see the repo README |

</details>

## License

[Apache-2.0](LICENSE)
