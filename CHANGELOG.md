# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.12] - 2026-09-25

### Changed

- Host pins move to `0.1.7-rc.2`; re-verified against that host line. Every `@deepseek-ai/dsh-*` dev/test dependency now pins `0.1.7-rc.2`, the `dshWorkshop.compatibility.dshVersions` timeline appends `0.1.7-rc.2`, and the compatibility baseline in every README records the `dsh-v0.1.7-rc.2` host. The declared host ranges (`engines.dsh` and the `peerDependencies` union) are deliberately **unchanged** — they already admit `0.1.7-rc.2`, and a range is what the manifest accepts, not what has been tested.

## [0.1.11] - 2026-09-24
### Changed

- Host pins move to `0.1.7-rc.1`; re-verified against that host line. Every `@deepseek-ai/dsh-*` dev/test dependency now pins `0.1.7-rc.1`, the `pnpm-lock.yaml` graph is regenerated, `dshWorkshop.compatibility.dshVersions` appends `0.1.7-rc.1`, the monthly Compat workflow and the CI probe install the `0.1.7-rc.1` host, and the compatibility baseline in every README records `dsh-v0.1.7-rc.1`. The declared host ranges (`engines.dsh` and the `peerDependencies` union) are deliberately **unchanged** — they already admit `0.1.7-rc.1`, and a range is what the manifest accepts, not what has been tested.

## [0.1.10] - 2026-09-23

### Changed

- **Re-verified against the `0.1.7-alpha.2` host; the `@deepseek-ai/dsh-*` host pins move to `0.1.7-alpha.2`.** The `alpha.2` wave removes nothing this plugin consumes: the published type surface of every host package it resolves is either byte-identical to `0.1.7-alpha.1` (`@deepseek-ai/cordis` `4.0.3`≡`4.0.4`, `@deepseek-ai/schemastery` `3.18.3`≡`3.18.4`) or strictly additive (`ToolDefinition.projectContent?`, `ClientModuleLoader.importError()`, six added `dsh-client-locale` keys). The wave's only removals are internals no plugin in this family references — `dsh-subprocess-local` privates and its non-entry `bindManagedProcess`, `dsh-client-web` `assertEntriesActive`, `dsh-app-boot`'s `unhandledRejection` event, `dsh-client-ui-plugin-manager` `apply()`, a refined `dsh-client-ui-primitives` `CodeBlock` signature, and the `diff.files.one`/`diff.files.other` locale key pair. Both rulers therefore stay green on the moved pin: `typecheck` against the checkout, `typecheck:ci` against the published `0.1.7-alpha.2` faces.
- The declared host range is deliberately **unchanged**. It already admits `0.1.7-alpha.2` (`0.1.7-alpha.2` satisfies the `>=0.1.7-0 <0.2.0` clause), and the family convention keeps peer ranges wider than the verified line rather than narrowing them to it; a range is what the manifest accepts, not what has been tested.
- Repo documentation (`AGENTS.md`), the workspace graph pin (`pnpm-workspace.yaml`) and the published-line workflow pins move with the manifest, so no file still claims the previous line.


## [0.1.9] - 2026-09-22

### Changed

- Adapt to DeepSeek Harness `dsh-v0.1.7-alpha.1`, whose settings contract replaced `installSection` wholesale. The plugin now declares its live fields as `Volatile<T>` Config references (`token`, `tokenFile`, `mcpUrl`, `protectedTaskIds` carry `.volatile()`), announces the page with `ctx.settings.configure({ auto: false }, ctx.fiber)`, and reads every live value through `.get()` at the moment of use — so a saved edit is committed into the running reference and applies without a restart. The token is still re-read per request, now from the Config reference instead of a settings-namespace source callback. **The four editable fields are the same four as before**: `toolCallTimeoutMs` and the tool-name pins stay plain, and Schemastery omits a plain field from the generated form, so promoting either one would have invented a new editable surface.
- Migrate the browser half's configuration card from the removed `plugins.item` slot to `plugins.row.config` (key `@perrylink/dsh-ticktick#ticktick`), which is where a bundle row's own configuration belongs: the page opens from the **Configure** control on the TickTick row of the Plugins page. The card takes the page owner's `form` render prop instead of the removed `ctx.settingsScope` service, drops `settingsScope` from its `inject` list (its absence would have left the whole browser half unmounted), and writes path-addressed edits through `form.mutate`.
- Handle the token as a redacted secret end to end. The field keeps `role('secret')`, so the Host omits its value from every form response; the page therefore (a) never renders or caches a stored token — the input reads "already stored — type to replace" and a blank box means "keep", (b) writes field-addressed operations rather than rebuilding the section, because a wholesale replace built from a redacted document would silently delete the stored token, and (c) reports configured-ness from the redaction ledger's `set` flag. The probe result and every error message remain sanitized. No credential value is written to the form, the logs, or the wire.
- Converge the Typert wire codec on its single remaining face. `wireStrict` no longer carries the `schema` field (removed from `TypertCodec`'s strict form, dead code when present, and never consulted by the Loader) and emits only `create: () => schema`, which is the one factory the Typert Loader accepts; a strict codec without it is refused at mount.
- Harden the configuration page's validation: `mcpUrl` now carries `.pattern(/\S/)` and `toolCallTimeoutMs` keeps `.min()`/`.max()`, so an invalid form edit is rejected by the Host before persistence and the loaded value is left untouched — the fail-loud semantic of the removed `installSection` `validate` hook, moved onto the schema. `resolveConfig` still re-judges every default and bound at load.
- Pin the `@deepseek-ai/dsh-*` dev/test dependencies to the published `0.1.7-alpha.1` line (= the verified host), replacing `0.1.5-rc.2`, and record `0.1.7-alpha.1` in `dshWorkshop.compatibility.dshVersions`; the monthly Compat workflow and the README compatibility tables follow. `@deepseek-ai/schemastery` moves to `^3.18.3` in both the peer and dev ranges because `.volatile()` is called at runtime while building the schema and `3.18.2` has neither the method nor its type. The peer range narrows to `>=0.1.7-alpha.1 <0.2.0`: that release is the first carrying the contract this build uses, and every earlier line still ships `installSection`, so the old range advertised support the code can no longer provide. `@deepseek-ai/cordis` keeps its wide `^4.0.2` peer floor (its `Volatile` is a type-only import) while devDeps pin `^4.0.3`, and `@deepseek-ai/cosmokit ^1.8.4` is now an explicit devDependency.

### Docs

- Refresh the five-language README compatibility baseline to `dsh-v0.1.7-alpha.1` and describe where the configuration page lives (Plugins page → the TickTick row → **Configure**) and that its four fields now apply live.

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
- Plugin settings card (keyed settings slot, key `ticktick`; migrated to the `plugins.item` list slot in 0.1.8): secret token, token file, MCP endpoint, protected task ids; live token re-read with 401-triggered client reset.
- Protected task ids refuse every mutating operation before any wire call.
- Zero-dependency live-endpoint probes (`probes/`) for handshake, CRUD, due-date detour, reorder semantics, and query-tool contract discovery.
- Setup UX: DIDA365_TOKEN env fallback, one-step in-panel token setup with a connection status badge, settings-card Test-connection / Clear-credentials buttons, and CN/International endpoint presets.
- Unit specs: domain normalization, MCP client, service workarounds, drag math, due-date presentation, token resolution.
