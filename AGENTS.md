# AGENTS.md

Standalone DeepSeek Harness plugin repository (`dsh-ticktick`). Development follows the dsh-plugin-guide skill and the official plugin contract; this file records repo-local decisions.

Naming exception: the repo is `dsh-ticktick` but the npm package is scoped `@perrylink/dsh-ticktick` (the bare npm name belongs to another account). The package name appears in `package.json#name`, the bundle-patch row `name`, the client bundle id (`src/client/index.ts` `name` export + `verify-artifacts.mjs` banner), the Typert Remote `package` field (`src/client/remote.ts`), the packed tarball name (`perrylink-dsh-ticktick-<version>.tgz`), and the npm-channel install commands. The plugin id `ticktick`, the settings namespace, and all tool names are NOT the package name and never change with it.

## Layout

- `src/index.ts` — function-plugin contract (`name`/`inject`/`Config`/`apply`; NO default export — the Loader unwraps `exports.default ?? exports`). Mounts the settings namespace (`ticktick`), the service, the eleven tools, and the system-prompt usage section.
- `src/config.ts` — Schemastery config with an explicit `resolveConfig` (fail-loud bounds): `tokenFile`, `mcpUrl`, `toolCallTimeoutMs`, `protectedTaskIds`, tool-name pins.
- `src/mcp.ts` — minimal streamable-HTTP MCP client: initialize handshake, session id + protocol version carry-over, Retry-After on 429, `isError` thrown. Injectable fetch for tests.
- `src/domain.ts` — tool-name resolution (patterns + pins) and task/project normalization over the measured TickTick wire shapes, plus the inbox-id predicate.
- `src/service.ts` — `TicktickService` (`TypertRemoteService`, namespace `ticktick`): status/projects/tasks/add/complete/remove/setDue/reorder/completed/search/batchAdd. Encodes the measured workarounds: the update_task crash detour for project due dates (direct attempt → move-to-inbox → update → move-back), per-list warnings for validation-failing lists, protected-id refusal, 401-triggered client reset, and read-after-write verification on add (P2).
- `src/wire.ts` — the shared vocabulary: result types, zod v4 wire schemas, the settings-namespace constant, and the eleven invocation descriptors shared verbatim by the host `./typert` manifest (`src/typert.host.ts`) and the client Remote contribution (`src/client/remote.ts`) — one canonical source so the two codecs can never drift.
- `src/tools.ts` — the eleven curated `defineTool` tools (`ticktick_*`) over the shared service.
- `src/client/` — browser half: `$mount` the Remote contribution, register the Session-header action (`conversation.session.header.actions`, id `ticktick`, order 11) with the task panel popup (undone/completed views, search), and the settings card (`settings.plugin.item`, key `ticktick`). Inline scoped stylesheet in `styles.ts` (standalone bundles cannot use the in-repo CSS-module pipeline). Pure drag math in `order.ts`, due-date presentation in `dates.ts`, en/zh dictionaries in `locales.ts`.
- `probes/` — zero-dependency live-endpoint probes (read `DIDA365_TOKEN` from env, never logged); `probe-queries.mjs` discovers the P2 query-tool contracts.
- `tests/` — vitest: domain/mcp/service (fake client) plus order/dates pure specs.

## Hard rules applied here

- Panel and card hold no state beyond popup, forms, and the drag session; all data arrives through the `ticktick` Remote namespace and the bound settings scope.
- The Bearer token is re-read per request (settings card secret > token file, default `$DSH_HOME/.ticktick-token`); a 401 signature resets the client so a rotated token activates without a config change.
- `protectedTaskIds` refuse every mutating operation before any wire call.
- Nothing is claimed to work against the live endpoint unless a probe ran: the update crash detour, the epoch sentinel, and the descending sortOrder facts are encoded from the 0.1.0-era measurements and re-verified by `probes/` before release.

## Config

Schema in `src/config.ts` (Schemastery, fail-loud bounds, explicit `resolveConfig`): `tokenFile` (default ''), `mcpUrl` (default `https://mcp.dida365.com`), `toolCallTimeoutMs` (default 30000), `protectedTaskIds` (default []), `tools.*` pins (default '' = discover). `cordis.patch.yml` comments document the same keys; the settings card owns `token`/`tokenFile` live and `mcpUrl`/`protectedTaskIds` restart-applied; the five-language READMEs carry the user-facing table.

## Build

`typescript` + `tsdown` + `zod` are regular `dependencies` on purpose: pnpm does not install devDependencies of git-hosted packages, and the git channel's `prepare` must build with production dependencies alone. `scripts/prepare.mjs` is the single build entry (tsc declarations → `lib/types`, tsdown bundles → `lib/index.js` + `lib/typert.host.js` + `lib/client.js`), followed by `scripts/fix-dts.mjs` (`.ts` → `.js` declaration specifiers).

## Checks

`pnpm run typecheck && pnpm run typecheck:ci && pnpm test && pnpm run build && pnpm run verify:self-contained && pnpm run verify:artifacts && pnpm pack`. The plain `typecheck` resolves the local harness checkout's fresh type faces through tsconfig `paths`; `typecheck:ci` resolves the npm-published `0.1.2-rc.1` faces (no paths) and is what CI runs — keep both green.

## Docs

- Five-language READMEs (`README.md`, `README.zh.md`, `README.es.md`, `README.pt.md`, `README.hi.md`) — keep all five in sync; the English file is the source of truth.
- GitHub topics: `dsh`, `dsh-plugin`, `deepseek-harness`, `deepseek`, `cordis`, `ticktick`, `dida365`, `todo`, `mcp`, `widget` (the ecosystem's visibility channel is the `dsh-plugin` topic; see dsh-plugin-guide §9). npm keywords mirror them.

## Peer versions

Peer deps range `>=0.1.0-rc.8 <0.2.0` (host faces) and `>=0.1.1-rc.2 <0.2.0` (client faces, optional); the package runs against harness installations ≥ rc.8 (the profile's hoisted module fallback resolves peers to the installation's own copies). `@types/node` tracks the `engines` floor (Node 22 line).
