# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.7] - 2026-09-12

### Changed

- Rename the four translated READMEs to `README-<lang>.md`. npm selects the package-page readme as the first markdown file matching its `{README,README.*}` glob (`@npmcli/package-json`, publish path), and that glob order puts `README.<lang>.md` ahead of `README.md` — so npm was serving the Simplified-Chinese file for this package too (measured on 15/15 sampled packages of the family). The new names sit outside the glob, so the English source is served again. No content changed apart from the language-switcher link each translation holds to its siblings, and the repo readme gate still passes. Takes effect with the next release; an already-published version cannot gain a corrected readme retroactively.
- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.2` line and record `0.1.5-rc.2` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow now runs against `0.1.5-rc.2`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

## [0.1.6] - 2026-09-10

### Changed

- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.5-rc.1` line and record `0.1.5-rc.1` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow now runs against `0.1.5-rc.1`. The peer range `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` is unchanged, so no supported host line is dropped.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-rc.1` (verified 2026-09-10).

## [0.1.5] - 2026-09-09

### Changed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0 || >=0.1.5-alpha.1 <0.2.0` and pin the dev/test dependencies to the published `0.1.5-alpha.1` line: adaptation to DeepSeek Harness `dsh-v0.1.5-alpha.1` (session format V3, `ctx.agent` removal, `Inbox` type-only interface); runtime behavior is unchanged for every supported host line.
- Record `0.1.5-alpha.1` in `dshWorkshop.compatibility.dshVersions`.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.5-alpha.1` (verified 2026-09-09).

## [0.1.4] - 2026-09-07

### Docs

- Fix the DSH plugin badge URL: shields.io rejects the four-segment static badge form with "404 badge not found"; the label now uses the documented double-dash form (`dsh--plugin`), rendering identically; no behavior change.


## [0.1.3] - 2026-09-07

### Fixed

- Align the `@deepseek-ai/dsh-*` peer ranges to `>=0.1.2-rc.1 <0.2.0`: the older `>=0.1.0-rc.8 <0.2.0` band resolved to only the `0.1.0-rc.8` prerelease under registry-driven resolution and broke fresh tarball installs; no behavior change.

### Docs

- Repair the mojibake in the es/pt/hi READMEs, complete their sections, and add the five-language readme-sync gate (`check:readmes`); refresh the support-version wording (GitHub tag `dsh-v0.1.3-alpha.1` leads, npm `0.1.2-rc.1` pin) and the Desktop Market install note; no behavior change.


## [0.1.2] - 2026-09-04

### Changed

- Republish under the scoped npm name `@perrylink/dsh-ticktick`: the bare `dsh-ticktick` name is owned by another account (publish E403), so the package, the bundle-patch row, the client bundle id, and the five-language install commands now carry the scoped name; the plugin id (`ticktick`), settings namespace, tools, and repository stay unchanged.
- Align the devDependency pins to the published dsh `0.1.2-rc.1` line and add the `dshWorkshop` omdsh-workshop-package/v1 intake manifest (carried over from the unreleased 0.1.1).

## [0.1.0] - 2026-09-03

### Added

- TickTick (Dida365) task bridge over the official MCP endpoint: minimal streamable-HTTP MCP client (initialize handshake, session-id and protocol-version carry-over, Retry-After on 429, `isError` surfaced).
- `TicktickService` under the `ticktick` Typert Remote namespace: status, projects, tasks (aggregated with per-list warnings), add (with read-after-write verification), complete, remove, setDue (with the measured move-to-inbox detour for the server-side `update_task` crash), reorder (descending sortOrder semantics), completed (30-day window), search, batchAdd.
- Eleven curated agent tools (`ticktick_status/lists/tasks/add/complete/delete/due/reorder/completed/search/batch_add`) plus a system-prompt usage section; Code Mode calls come free via `output.schema`.
- Session-header task panel (`conversation.session.header.actions`): list filter, undone/completed views, full-text search, quick add, complete, delete with confirm, inline due dates with overdue/today/tomorrow chips, drag reorder (undone, single-list views).
- Plugin settings card (`settings.plugin.item`, key `ticktick`): secret token, token file, MCP endpoint, protected task ids; live token re-read with 401-triggered client reset.
- Protected task ids refuse every mutating operation before any wire call.
- Zero-dependency live-endpoint probes (`probes/`) for handshake, CRUD, due-date detour, reorder semantics, and query-tool contract discovery.
- Setup UX: DIDA365_TOKEN env fallback, one-step in-panel token setup with a connection status badge, settings-card Test-connection / Clear-credentials buttons, and CN/International endpoint presets.
- Unit specs: domain normalization, MCP client, service workarounds, drag math, due-date presentation, token resolution.
