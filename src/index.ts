/**
 * `dsh-ticktick` — the TickTick (Dida365) task bridge for DeepSeek Harness.
 *
 * Host half: mounts the `ticktick` Remote service (status plus the seven
 * task operations over the official TickTick MCP endpoint), registers the
 * eight curated `ticktick_*` tools on the shared service, declares the
 * `Volatile` Config fields (token / token file / endpoint / protected ids /
 * tool-call deadline) that the browser half's configuration page edits on the
 * Plugins page, and announces the tool set in one system-prompt section.
 *
 * The token is re-read per request: the configuration page's secret field
 * wins, then the `DIDA365_TOKEN` environment variable, then the token file
 * (`$DSH_HOME/.ticktick-token` by default). Writing the file activates the
 * bridge without a config change.
 *
 * Function plugin — no default export (the Loader unwraps
 * `exports.default ?? exports`).
 *
 * @module dsh-ticktick
 */

import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Context, Volatile } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'
// Type-only: activates the `ctx.settings` Context merge.
import type {} from '@deepseek-ai/dsh-settings'
import { resolveConfig, type Config, type ResolvedConfig } from './config.ts'
import { TicktickService, type TicktickServiceConfig } from './service.ts'
import { buildTicktickTools } from './tools.ts'
import { TICKTICK_SETTINGS_NS } from './wire.ts'

export const name = 'ticktick'

/** Hard services: the tool registry and the prompt assembly. `settings` is an optional child. */
export const inject = ['tools', 'systemPrompt']

export { Config, resolveConfig, DEFAULT_TOOL_CALL_TIMEOUT_MS } from './config.ts'
export { DEFAULT_MCP_URL } from './config.ts'
export { TicktickService } from './service.ts'
export type { TicktickServiceConfig } from './service.ts'
export { buildTicktickTools } from './tools.ts'
export { McpStreamableClient, parseMcpMessage } from './mcp.ts'
export type { McpCallResult, McpClientFace, McpTool } from './mcp.ts'
export { isInboxProject, normalizeProjects, normalizeTasks, resolveTools } from './domain.ts'
export type { TicktickProject, TicktickTask, ToolResolver } from './domain.ts'
export type * from './wire.ts'

// Service Definition — public contract: the settings-form namespace and the exported service/tool faces.
/** Profile entry id the browser half's configuration page is keyed by. */
export const SETTINGS_NS = TICKTICK_SETTINGS_NS

/** Default token file: `<DSH_HOME>/.ticktick-token` (or `~/.dsh/.ticktick-token`). */
function defaultTokenFile(): string {
  return join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), '.ticktick-token')
}

/** Read one live Config field: the Loader hands a `Volatile<T>`, a programmatic caller the bare value. */
function live<T>(value: Volatile<T> | T | undefined, fallback: T): T {
  if (value === undefined || value === null) return fallback
  const reference = value as { get?: () => T }
  return typeof reference.get === 'function' ? reference.get() : value as T
}

/**
 * Resolve the current Bearer token. Read at the moment of use — the token
 * is re-read per request: the settings card's secret wins, then the
 * `DIDA365_TOKEN` environment variable, then the configured token file (the
 * live field, else the composition value, else `<DSH_HOME>/.ticktick-token`).
 * Writing the file activates the bridge without a config change.
 * @param config - the plugin Config as handed to `apply` (live fields are references).
 * @param resolved - composition values captured at load.
 * @returns the token, or `null` when unconfigured.
 */
export function resolveToken(config: Config | undefined, resolved: ResolvedConfig): string | null {
  const settingsToken = live(config?.token, '')
  if (settingsToken !== '') return settingsToken
  const env = process.env.DIDA365_TOKEN
  if (env !== undefined && env.trim() !== '') return env.trim()
  const liveTokenFile = live(config?.tokenFile, '')
  const file = liveTokenFile !== ''
    ? liveTokenFile
    : (resolved.tokenFile !== '' ? resolved.tokenFile : defaultTokenFile())
  if (!existsSync(file)) return null
  const token = readFileSync(file, 'utf8').trim()
  return token === '' ? null : token
}

/**
 * Mount the bridge: the configurable surface, the Remote service, the eleven
 * tools, and the usage announcement.
 *
 * @param ctx - context carrying tools + systemPrompt.
 * @param config - live loader config; defaults applied through {@link resolveConfig}.
 */
export async function apply(ctx: Context, config: Config | undefined): Promise<void> {
  const resolved = resolveConfig(config)

  // Let this plugin's Config appear as its own page on the Plugins page
  // (the browser half registers into `plugins.row.config`). Required — a
  // Config whose live fields are never presented is invisible to the user.
  ctx.inject(['settings'], (scope) => {
    scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber))
  })

  const serviceConfig: TicktickServiceConfig = {
    // Lazy on purpose: the closure keeps the references, not a snapshot, so a
    // settings-card edit is picked up by the next request without a remount.
    getToken: () => resolveToken(config, resolved),
    mcpUrl: resolved.mcpUrl,
    toolCallTimeoutMs: resolved.toolCallTimeoutMs,
    protectedTaskIds: resolved.protectedTaskIds,
    pins: resolved.tools,
  }

  // The service has no injects beyond its own registration; capture the
  // mounted instance for the tools and the settings change hook.
  // Service Provider — registration: mount the ticktick Remote service and
  // register the eleven tools. One effect holds the mounted service (the
  // resource) and every registration that depends on the async mount: an
  // unload during the mount window flips `alive` so nothing registers on a
  // disposed context, and the effect's disposer reverses the tools and the
  // mounted service (A02 unified form — no bare top-level await before
  // registrations).
  ctx.effect(() => {
    const fiber = ctx.plugin(TicktickService, serviceConfig)
    let alive = true
    const toolDisposers: (() => void)[] = []
    void fiber.then(() => {
      if (!alive) return
      const mounted = ctx.get('ticktick') as TicktickService
      for (const tool of buildTicktickTools(mounted)) {
        toolDisposers.push(ctx.tools.register(tool))
      }
    })
    return () => {
      alive = false
      for (const dispose of toolDisposers.reverse()) dispose()
      void fiber.dispose()
    }
  }, 'dsh-ticktick: service mount and tools')

  // Consumer — announce the tool set through the systemPrompt section.
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'ticktick:usage',
    order: 350,
    text: 'TickTick (Dida365) tasks are available through the ticktick_* tools: ticktick_status, ticktick_lists, ticktick_tasks, ticktick_add, ticktick_complete, ticktick_delete, ticktick_due, ticktick_reorder, ticktick_completed, ticktick_search, ticktick_batch_add. The Session header also shows a TickTick panel for browsing lists (undone/completed views, full-text search), adding, completing, deleting, setting due dates, and drag reordering.',
  }), 'dsh-ticktick: system prompt section')
}
