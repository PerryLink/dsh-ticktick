/**
 * `dsh-ticktick` — the TickTick (Dida365) task bridge for DeepSeek Harness.
 *
 * Host half: mounts the `ticktick` Remote service (status plus the seven
 * task operations over the official TickTick MCP endpoint), registers the
 * eight curated `ticktick_*` tools on the shared service, installs the
 * `ticktick` settings namespace (token / token file / endpoint / protected
 * ids) that the browser settings card edits, and announces the tool set in
 * one system-prompt section.
 *
 * The token is re-read per request: the settings card's secret field wins,
 * then the token file (`$DSH_HOME/.ticktick-token` by default). Writing the
 * file activates the bridge without a config change.
 *
 * Function plugin — no default export (the Loader unwraps
 * `exports.default ?? exports`).
 *
 * @module dsh-ticktick
 */

import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'
// Type-only: activates the `ctx.settings` Context merge.
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import { DEFAULT_MCP_URL, resolveConfig, type Config, type ResolvedConfig } from './config.ts'
import { TicktickService, type TicktickServiceConfig } from './service.ts'
import { buildTicktickTools } from './tools.ts'
import { TICKTICK_SETTINGS_NS, type TicktickSettings } from './wire.ts'

export const name = 'ticktick'

/** Hard services: the tool registry and the prompt assembly. `settings` is an optional child. */
export const inject = ['tools', 'systemPrompt']

export { Config, resolveConfig, DEFAULT_MCP_URL, DEFAULT_TOOL_CALL_TIMEOUT_MS } from './config.ts'
export { TicktickService } from './service.ts'
export type { TicktickServiceConfig } from './service.ts'
export { buildTicktickTools } from './tools.ts'
export { McpStreamableClient, parseMcpMessage } from './mcp.ts'
export type { McpCallResult, McpClientFace, McpTool } from './mcp.ts'
export { isInboxProject, normalizeProjects, normalizeTasks, resolveTools } from './domain.ts'
export type { TicktickProject, TicktickTask, ToolResolver } from './domain.ts'
export type * from './wire.ts'

/** Settings namespace the browser card edits (paired by this exact key). */
export const SETTINGS_NS = TICKTICK_SETTINGS_NS

/** Schemastery schema for the settings namespace (the card renders this). */
export const TicktickSettingsSchema: z<TicktickSettings> = z.object({
  token: z.string().role('secret').default(''),
  tokenFile: z.string().default(''),
  mcpUrl: z.string().default(DEFAULT_MCP_URL),
  protectedTaskIds: z.array(z.string()).default([]),
})

/** Default token file: `<DSH_HOME>/.ticktick-token` (or `~/.dsh/.ticktick-token`). */
function defaultTokenFile(): string {
  return join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), '.ticktick-token')
}

/**
 * Resolve the current Bearer token: the settings card's secret wins, then
 * the configured token file.
 * @param settings - current settings layer.
 * @param resolved - loader config.
 * @returns the token, or `null` when unconfigured.
 */
export function resolveToken(settings: TicktickSettings, resolved: ResolvedConfig): string | null {
  if (settings.token !== '') return settings.token
  const file = settings.tokenFile !== ''
    ? settings.tokenFile
    : (resolved.tokenFile !== '' ? resolved.tokenFile : defaultTokenFile())
  if (!existsSync(file)) return null
  const token = readFileSync(file, 'utf8').trim()
  return token === '' ? null : token
}

/**
 * Mount the bridge: the settings namespace, the Remote service, the eight
 * tools, and the usage announcement.
 *
 * @param ctx - context carrying tools + systemPrompt.
 * @param config - raw loader config; defaults applied through {@link resolveConfig}.
 */
export async function apply(ctx: Context, config: Config | undefined): Promise<void> {
  const resolved = resolveConfig(config)
  let settingsSource: () => TicktickSettings = () => ({
    token: '',
    tokenFile: resolved.tokenFile,
    mcpUrl: resolved.mcpUrl,
    protectedTaskIds: [...resolved.protectedTaskIds],
  })
  let service: TicktickService | undefined

  ctx.inject(['settings'], (scope) => {
    scope.settings.installSection(ctx, SETTINGS_NS, TicktickSettingsSchema, {
      token: '',
      tokenFile: resolved.tokenFile,
      mcpUrl: resolved.mcpUrl,
      protectedTaskIds: [...resolved.protectedTaskIds],
    }, {
      validate: (value) => {
        if (value.mcpUrl.trim() === '') throw new Error('dsh-ticktick: mcpUrl must not be empty')
      },
      setSource: (source) => { settingsSource = source },
      onChange: () => { service?.reset() },
    })
  })

  const serviceConfig: TicktickServiceConfig = {
    getToken: () => resolveToken(settingsSource(), resolved),
    mcpUrl: resolved.mcpUrl,
    toolCallTimeoutMs: resolved.toolCallTimeoutMs,
    protectedTaskIds: resolved.protectedTaskIds,
    pins: resolved.tools,
  }

  // The service has no injects beyond its own registration; capture the
  // mounted instance for the tools and the settings change hook.
  await ctx.plugin(TicktickService, serviceConfig)
  service = ctx.get('ticktick') as TicktickService

  for (const tool of buildTicktickTools(service)) {
    ctx.effect(() => ctx.tools.register(tool), `dsh-ticktick: ${tool.name} tool`)
  }

  ctx.effect(() => ctx.systemPrompt.section({
    name: 'ticktick:usage',
    order: 350,
    text: 'TickTick (Dida365) tasks are available through the ticktick_* tools: ticktick_status, ticktick_lists, ticktick_tasks, ticktick_add, ticktick_complete, ticktick_delete, ticktick_due, ticktick_reorder, ticktick_completed, ticktick_search, ticktick_batch_add. The Session header also shows a TickTick panel for browsing lists (undone/completed views, full-text search), adding, completing, deleting, setting due dates, and drag reordering.',
  }), 'dsh-ticktick: system prompt section')
}
