/**
 * Plugin configuration and its explicit resolve step. `resolveConfig`
 * re-judges every default and bound so programmatic construction that
 * bypasses Schemastery normalization still fails loud instead of running
 * with hidden defaults (the explicit-resolve contract).
 *
 * @module dsh-ticktick/config
 */

import type { Volatile } from '@deepseek-ai/cordis'
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
  completed: string
  search: string
  getTask: string
  batchAdd: string
}

/**
 * Configuration for the TickTick bridge.
 *
 * Every live field is a `Volatile<T>` reference (the field carries
 * `.volatile()` in the Schema below): the Loader commits a form edit into
 * the running reference and emits `loader/volatile-update`, so consumers
 * must read `.get()` at the moment of use and never cache the value.
 * `toolCallTimeoutMs` and `tools` stay plain on purpose — the settings page
 * edits exactly the four fields it has always edited (token, token file,
 * endpoint, protected ids), and a plain field is absent from the generated
 * form, so promoting either one would create a new editable surface.
 */
export interface Config {
  /** Bearer token typed into the configuration page; wins over the environment and the token file. */
  token: Volatile<string>
  /** Path to a text file holding the Bearer token; `''` resolves to `<DSH_HOME>/.ticktick-token`. */
  tokenFile: Volatile<string>
  /** TickTick MCP endpoint. */
  mcpUrl: Volatile<string>
  /** Task ids every mutating operation refuses. */
  protectedTaskIds: Volatile<string[]>
  /** Per-tools/call deadline in milliseconds (composition value; not a page field). */
  toolCallTimeoutMs?: number
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

/**
 * Schemastery schema for loader-validated configuration. The four live
 * fields carry `.volatile()` so the configuration page can edit them
 * without remounting the plugin; `.pattern()`/`.min()`/`.max()` restate the
 * bounds here so a form edit is rejected at the Host before persistence,
 * with the loaded value left untouched. `toolCallTimeoutMs` and `tools` are
 * deliberately plain: Schemastery omits a plain field from the generated
 * form (`volatileForm`), which is what keeps this page's editable surface
 * exactly what it was under the removed `installSection` API.
 *
 * Left un-annotated on purpose: annotating it `z<Config>` cannot typecheck
 * under `exactOptionalPropertyTypes` (Schemastery's `.default()` makes a
 * field's mode generic, so the annotation sees `Volatile<T | undefined>`),
 * and the interface above is what a *consumer* receives — the two are kept
 * in step by {@link resolveConfig} and `tests/token.spec.ts`.
 */
export const Config = z.object({
  token: z.string().default('').role('secret').volatile(),
  tokenFile: z.string().default('').volatile(),
  mcpUrl: z.string().pattern(/\S/).default(DEFAULT_MCP_URL).volatile(),
  toolCallTimeoutMs: z.number().min(1_000).max(MAX_TOOL_CALL_TIMEOUT_MS).default(DEFAULT_TOOL_CALL_TIMEOUT_MS),
  protectedTaskIds: z.array(z.string()).default([]).volatile(),
  tools: z.object({
    projects: z.string().default(''),
    tasks: z.string().default(''),
    create: z.string().default(''),
    complete: z.string().default(''),
    remove: z.string().default(''),
    update: z.string().default(''),
    move: z.string().default(''),
    completed: z.string().default(''),
    search: z.string().default(''),
    getTask: z.string().default(''),
    batchAdd: z.string().default(''),
  }).default({
    projects: '',
    tasks: '',
    create: '',
    complete: '',
    remove: '',
    update: '',
    move: '',
    completed: '',
    search: '',
    getTask: '',
    batchAdd: '',
  }),
})

/**
 * Read one field as a plain value: a live field arrives as a `Volatile<T>`
 * reference, a programmatic caller may pass the bare value.
 * @param value - a `Volatile<T>` reference or an already-plain value.
 * @returns the current plain value, or `undefined` when the field is absent.
 */
function plain<T>(value: Volatile<T> | T | undefined): T | undefined {
  if (value === undefined || value === null) return undefined
  const reference = value as { get?: () => T }
  return typeof reference.get === 'function' ? reference.get() : value as T
}

/**
 * Resolve raw config to the runtime policy, re-validating defaults and bounds.
 * A live field is read through its reference, so this is a snapshot: callers
 * that must observe a hot update read the reference again themselves.
 * @param config - raw loader config; `undefined` for a bare row.
 * @returns the frozen resolved config.
 */
export function resolveConfig(config: Config | undefined): ResolvedConfig {
  const tokenFile = plain(config?.tokenFile) ?? ''
  if (typeof tokenFile !== 'string') throw new TypeError('dsh-ticktick: config.tokenFile must be a string')
  const mcpUrl = plain(config?.mcpUrl) ?? DEFAULT_MCP_URL
  if (typeof mcpUrl !== 'string' || mcpUrl === '') throw new Error('dsh-ticktick: config.mcpUrl must be a non-empty string')
  const toolCallTimeoutMs = config?.toolCallTimeoutMs ?? DEFAULT_TOOL_CALL_TIMEOUT_MS
  if (!Number.isFinite(toolCallTimeoutMs) || toolCallTimeoutMs < 1_000 || toolCallTimeoutMs > MAX_TOOL_CALL_TIMEOUT_MS) {
    throw new Error(`dsh-ticktick: config.toolCallTimeoutMs must be a finite number between 1000 and ${MAX_TOOL_CALL_TIMEOUT_MS}`)
  }
  const protectedTaskIds = (plain(config?.protectedTaskIds) ?? []).filter((id): id is string => typeof id === 'string' && id !== '')
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
      completed: pin('completed'),
      search: pin('search'),
      getTask: pin('getTask'),
      batchAdd: pin('batchAdd'),
    }),
  })
}
