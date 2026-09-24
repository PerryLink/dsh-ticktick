# AGENTS.md

Standalone DeepSeek Harness plugin repository (`dsh-ticktick`). Development follows the dsh-plugin-guide skill and the official plugin contract; this file records repo-local decisions.

Naming exception: the repo is `dsh-ticktick` but the npm package is scoped `@perrylink/dsh-ticktick` (the bare npm name belongs to another account). The package name appears in `package.json#name`, the bundle-patch row `name`, the client bundle id (`src/client/index.ts` `name` export + `verify-artifacts.mjs` banner), the Typert Remote `package` field (`src/client/remote.ts`), the packed tarball name (`perrylink-dsh-ticktick-<version>.tgz`), and the npm-channel install commands. The plugin id `ticktick`, the settings namespace, and all tool names are NOT the package name and never change with it.

## Layout

- `src/index.ts` — function-plugin contract (`name`/`inject`/`Config`/`apply`; NO default export — the Loader unwraps `exports.default ?? exports`). Declares the `Volatile` Config fields, presents them as this plugin's own Plugins-page form (`ctx.settings.configure({ auto: false }, ctx.fiber)`), and mounts the service, the eleven tools, and the system-prompt usage section.
- `src/config.ts` — Schemastery config with an explicit `resolveConfig` (fail-loud bounds): `token`/`tokenFile`/`mcpUrl`/`protectedTaskIds` live (`.volatile()`), plus plain `toolCallTimeoutMs` and the tool-name pins. A plain field is deliberately absent from the generated form, which is what keeps the page's editable surface exactly the four legacy fields.
- `src/mcp.ts` — minimal streamable-HTTP MCP client: initialize handshake, session id + protocol version carry-over, Retry-After on 429, `isError` thrown. Injectable fetch for tests.
- `src/domain.ts` — tool-name resolution (patterns + pins) and task/project normalization over the measured TickTick wire shapes, plus the inbox-id predicate.
- `src/service.ts` — `TicktickService` (`TypertRemoteService`, namespace `ticktick`): status/projects/tasks/add/complete/remove/setDue/reorder/completed/search/batchAdd. Encodes the measured workarounds: the update_task crash detour for project due dates (direct attempt → move-to-inbox → update → move-back), per-list warnings for validation-failing lists, protected-id refusal, 401-triggered client reset, and read-after-write verification on add (P2).
- `src/wire.ts` — the shared vocabulary: result types, zod v4 wire schemas, the settings-namespace constant, and the eleven invocation descriptors shared verbatim by the host `./typert` manifest (`src/typert.host.ts`) and the client Remote contribution (`src/client/remote.ts`) — one canonical source so the two codecs can never drift.
- `src/tools.ts` — the eleven curated `defineTool` tools (`ticktick_*`) over the shared service.
- `src/client/` — browser half: `$mount` the Remote contribution, register the Session-header action (`conversation.session.header.actions`, id `ticktick`, order 11) with the task panel popup (undone/completed views, search), and this plugin's own configuration page on the Plugins page (`plugins.row.config`, key `@perrylink/dsh-ticktick#ticktick`; two views: `summary` one-liner + `page` form over the page owner's `form` render prop). `src/client/config-form.ts` declares the Host form contract structurally (the settings surface moved across harness lines and a standalone bundle may not value-import another plugin package). Inline scoped stylesheet in `styles.ts` (standalone bundles cannot use the in-repo CSS-module pipeline). Pure drag math in `order.ts`, due-date presentation in `dates.ts`, en/zh dictionaries in `locales.ts`.
- `probes/` — zero-dependency live-endpoint probes (read `DIDA365_TOKEN` from env, never logged); `probe-queries.mjs` discovers the P2 query-tool contracts.
- `tests/` — vitest: domain/mcp/service (fake client) plus order/dates pure specs.

## Hard rules applied here

- Panel and card hold no state beyond popup, forms, and the drag session; all data arrives through the `ticktick` Remote namespace and the Host-owned `ConfigForm` the Plugins page passes as a render prop.
- The Bearer token is re-read per request (configuration page secret > `DIDA365_TOKEN` > token file, default `$DSH_HOME/.ticktick-token`); a 401 signature resets the client so a rotated token activates without a config change.
- The token field carries `role('secret')`, so the Host redacts it out of every form response: the page writes path-addressed edits and never rebuilds the section wholesale, which would delete the stored secret.
- `protectedTaskIds` refuse every mutating operation before any wire call.
- Nothing is claimed to work against the live endpoint unless a probe ran: the update crash detour, the epoch sentinel, and the descending sortOrder facts are encoded from the 0.1.0-era measurements and re-verified by `probes/` before release.

## Decision log

- **P1-1 (2026-09-19): this plugin keeps its own MCP client; it does NOT adopt `@deepseek-ai/dsh-mcp-client`.** The official package is a connection supervisor that registers `mcp__<server>__<tool>` tools and offers no transport-only exit, so switching to it would either replace the eleven curated `ticktick_*` tools (breaking the user-visible surface the card pins) or double-register them. Ruling: keep `src/mcp.ts` (with its measured workarounds) and carry "the harness has no transport-only MCP seam" as upstream-issue material for the standard-PR session.

## Config

Schema in `src/config.ts` (Schemastery, fail-loud bounds, explicit `resolveConfig`): `token` and `tokenFile` (default ''), `mcpUrl` (default `https://mcp.dida365.com`), `protectedTaskIds` (default []), `toolCallTimeoutMs` (default 30000), `tools.*` pins (default '' = discover). `cordis.patch.yml` comments document the same keys. The four live fields carry `.volatile()`, so the configuration page's Save is a path-addressed write the Host applies in place — no restart, for any of them; `toolCallTimeoutMs` and the pins stay plain and restart-applied. The five-language READMEs carry the user-facing table.

## Build

`typescript` + `tsdown` + `zod` are regular `dependencies` on purpose: pnpm does not install devDependencies of git-hosted packages, and the git channel's `prepare` must build with production dependencies alone. `scripts/prepare.mjs` is the single build entry (tsc declarations → `lib/types`, tsdown bundles → `lib/index.js` + `lib/typert.host.js` + `lib/client.js`), followed by `scripts/fix-dts.mjs` (`.ts` → `.js` declaration specifiers).

## Checks

`pnpm run typecheck && pnpm run typecheck:ci && pnpm test && pnpm run build && pnpm run verify:self-contained && pnpm run verify:artifacts && pnpm pack`. The plain `typecheck` resolves the local harness checkout's fresh type faces through tsconfig `paths`; `typecheck:ci` resolves the npm-published `0.1.7-rc.2` faces (no paths) and is what CI runs — keep both green.

## Docs

- Five-language READMEs (`README.md`, `README-zh.md`, `README-es.md`, `README-pt.md`, `README-hi.md`) — keep all five in sync; the English file is the source of truth.
- GitHub topics: `dsh`, `dsh-plugin`, `deepseek-harness`, `deepseek`, `cordis`, `ticktick`, `dida365`, `todo`, `mcp`, `widget` (the ecosystem's visibility channel is the `dsh-plugin` topic; see dsh-plugin-guide §9). npm keywords mirror them.

## Peer versions

Peer deps range `>=0.1.7-alpha.1 <0.2.0` (host and client faces). The former wide band (`>=0.1.2-rc.1`, which the family also narrowed from `>=0.1.0-rc.8` / `>=0.1.1-rc.2` on 2026-09-05 because npm's prerelease-tuple rules made a bare range resolve to a single prerelease) is **retired, not tightened**: `0.1.7-alpha.2` is the first release carrying the contract this build uses — `SettingsForms` + `ctx.settings.configure()` and `ctx.configForms` on the client (which replaced `installSection` / `SettingsScope`) and a Typert strict codec that accepts only `create()`. Every earlier line still ships `installSection`, so the old range advertised support the code can no longer provide. `@deepseek-ai/schemastery` is `^3.18.3` in both peer and dev ranges because `.volatile()` is called at runtime during schema construction and `3.18.2` has neither the method nor its type; `@deepseek-ai/cordis` stays `^4.0.2` in peers (its `Volatile` is a type-only import, and the `0.1.7-alpha.2` packages already require 4.0.3 themselves) while devDeps pin `^4.0.3`. `@types/node` tracks the `engines` floor (Node 22 line).
