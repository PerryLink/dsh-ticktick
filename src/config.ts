/**
 * Plugin configuration and its explicit resolve step. `resolveConfig`
 * re-judges every default and bound so programmatic construction that
 * bypasses Schemastery normalization still fails loud instead of running
 * with hidden defaults (the explicit-resolve contract).
 *
 * @module dsh-ticktick/config
 */

import z from '@deepseek-ai/schemastery'

/** Default TickTick MCP endpoint (CN region). */
export const DEFAULT_MCP_URL = 'https://mcp.dida365.com'

/** Default per-tools/call deadline in milliseconds. */
export const DEFAULT_TOOL_CALL_TIMEOUT_MS = 30_000

/** Ceiling for one tool call: the endpoint may block on a slow server round. */
export const MAX_TOOL_CALL_TIMEOUT_MS = 300_000

/** Raw MCP tool-name pins; every `''` entry is discovered by pattern. */
export interface ToolPins {
  projects: string
  tasks: string
  create: string
  complete: string
  remove: string
  update: string
  move: string
}

/** Configuration for the TickTick bridge. */
export interface Config {
  /** Path to a text file holding the Bearer token; `''` resolves to `<DSH_HOME>/.ticktick-token`. */
  tokenFile?: string
  /** TickTick MCP endpoint. */
  mcpUrl?: string
  /** Per-tools/call deadline in milliseconds. */
  toolCallTimeoutMs?: number
  /** Task ids every mutating operation refuses. */
  protectedTaskIds?: string[]
  /** Optional raw tool-name pins, discovered by pattern when omitted. */
  tools?: Partial<ToolPins>
}

/** Fully resolved configuration captured at plugin load. */
export interface ResolvedConfig {
  /** Path to a text file holding the Bearer token (empty = default path). */
  tokenFile: string
  /** TickTick MCP endpoint. */
  mcpUrl: string
  /** Per-tools/call deadline in milliseconds. */
  toolCallTimeoutMs: number
  /** Task ids every mutating operation refuses. */
  protectedTaskIds: readonly string[]
  /** Raw tool-name pins (`''` = discover). */
  tools: ToolPins
}

/** Schemastery schema for loader-validated configuration. */
export const Config: z<Config> = z.object({
  tokenFile: z.string().default(''),
  mcpUrl: z.string().default(DEFAULT_MCP_URL),
  toolCallTimeoutMs: z.number().min(1_000).max(MAX_TOOL_CALL_TIMEOUT_MS).default(DEFAULT_TOOL_CALL_TIMEOUT_MS),
  protectedTaskIds: z.array(z.string()).default([]),
  tools: z.object({
    projects: z.string().default(''),
    tasks: z.string().default(''),
    create: z.string().default(''),
    complete: z.string().default(''),
    remove: z.string().default(''),
    update: z.string().default(''),
    move: z.string().default(''),
  }).default({
    projects: '',
    tasks: '',
    create: '',
    complete: '',
    remove: '',
    update: '',
    move: '',
  }),
})

/**
 * Resolve raw config to the runtime policy, re-validating defaults and bounds.
 * @param config - raw loader config; `undefined` for a bare row.
 * @returns the frozen resolved config.
 */
export function resolveConfig(config: Config | undefined): ResolvedConfig {
  const tokenFile = config?.tokenFile ?? ''
  if (typeof tokenFile !== 'string') throw new TypeError('dsh-ticktick: config.tokenFile must be a string')
  const mcpUrl = config?.mcpUrl ?? DEFAULT_MCP_URL
  if (typeof mcpUrl !== 'string' || mcpUrl === '') throw new Error('dsh-ticktick: config.mcpUrl must be a non-empty string')
  const toolCallTimeoutMs = config?.toolCallTimeoutMs ?? DEFAULT_TOOL_CALL_TIMEOUT_MS
  if (!Number.isFinite(toolCallTimeoutMs) || toolCallTimeoutMs < 1_000 || toolCallTimeoutMs > MAX_TOOL_CALL_TIMEOUT_MS) {
    throw new Error(`dsh-ticktick: config.toolCallTimeoutMs must be a finite number between 1000 and ${MAX_TOOL_CALL_TIMEOUT_MS}`)
  }
  const protectedTaskIds = (config?.protectedTaskIds ?? []).filter((id): id is string => typeof id === 'string' && id !== '')
  const rawTools = config?.tools
  const pin = (key: keyof ToolPins): string => {
    const value = rawTools?.[key]
    return typeof value === 'string' ? value : ''
  }
  return Object.freeze({
    tokenFile,
    mcpUrl,
    toolCallTimeoutMs,
    protectedTaskIds: Object.freeze(protectedTaskIds),
    tools: Object.freeze({
      projects: pin('projects'),
      tasks: pin('tasks'),
      create: pin('create'),
      complete: pin('complete'),
      remove: pin('remove'),
      update: pin('update'),
      move: pin('move'),
    }),
  })
}
