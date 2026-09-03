/**
 * The TickTick bridge's host service: drives one lazily bootstrapped MCP
 * streamable-HTTP client against the TickTick endpoint and serves the eight
 * panel/model operations under the `ticktick` Typert Remote namespace.
 *
 * Measured wire facts (live endpoint, 0.1.0 era) encoded here:
 * - list order is descending `sortOrder`; reorder = move_task with the new
 *   sortOrder (project tasks) or update_task (inbox tasks);
 * - `update_task` crashes server-side for tasks inside regular projects
 *   ("Expecting value: line 1 column 1") — project due dates take the
 *   direct-update attempt first and fall back to the move-to-inbox →
 *   update → move-back detour on that signature;
 * - clearing a due date writes the epoch sentinel;
 * - a project whose response fails server-side validation (historical
 *   `repeatFrom: ''` data) is skipped and reported as a warning, never
 *   silently dropped.
 *
 * @module dsh-ticktick/service
 */

import type { Context } from '@deepseek-ai/cordis'
import { RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { ToolPins } from './config.ts'
import {
  isInboxProject,
  normalizeProjects,
  normalizeTasks,
  resolveTools,
  type TicktickProject,
  type TicktickTask,
  type ToolResolver,
} from './domain.ts'
import { McpStreamableClient, type McpCallResult, type McpClientFace } from './mcp.ts'
import type { TicktickAddResult, TicktickOkResult, TicktickProbeResult, TicktickStatus, TicktickTaskWire, TicktickTasksResult } from './wire.ts'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    /** No Bearer token is resolvable from the token file or settings. */
    'ticktick/no-token': Record<string, never>
    /** The operation named a task on the protected-id list. */
    'ticktick/protected': { readonly taskId: string }
    /** A required argument is missing or malformed. */
    'ticktick/bad-request': { readonly field: string }
    /** The MCP endpoint rejected or failed the tool call. */
    'ticktick/tool-error': { readonly tool: string }
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** TickTick task bridge service (this package). */
    ticktick: TicktickService
  }
}

/** Runtime policy the service reads; the token getter re-reads at call time. */
export interface TicktickServiceConfig {
  /** Resolve the current Bearer token (file or settings); `null` = unconfigured. */
  getToken(): string | null
  /** TickTick MCP endpoint. */
  readonly mcpUrl: string
  /** Per-tools/call deadline in milliseconds. */
  readonly toolCallTimeoutMs: number
  /** Task ids every mutating operation refuses. */
  readonly protectedTaskIds: readonly string[]
  /** Raw tool-name pins. */
  readonly pins: ToolPins
}

/** Default client factory: the real streamable-HTTP client. */
export type ClientFactory = (url: string, token: string, timeoutMs: number) => McpClientFace

/** The epoch sentinel TickTick documents for clearing a due date. */
const EPOCH_SENTINEL = '1970-01-01T00:00:00.000+0000'

/** update_task server-side crash signature (Bug A): project tasks only. */
const UPDATE_CRASH_SIGNATURE = /expecting value|line 1 column 1|char 0|json/i

/** Whether an error message names an auth failure. */
const AUTH_SIGNATURE = /401|unauthor|invalid token|token/i

/** Project one normalized task into the wire shape (`null` for absent fields). */
function toWireTask(task: TicktickTask): TicktickTaskWire {
  return {
    id: task.id,
    title: task.title,
    done: task.done,
    projectId: task.projectId ?? null,
    dueDate: task.dueDate ?? null,
    sortOrder: task.sortOrder ?? null,
  }
}

/**
 * Host service for the TickTick bridge: status plus the seven task
 * operations, exported over the `ticktick` Remote namespace (hand-written
 * `./typert` manifest, no decorators).
 */
export class TicktickService extends TypertRemoteService {
  /** The MCP client, lazily bootstrapped per token. */
  private client: McpClientFace | undefined
  /** Resolved tool names for the bootstrapped client. */
  private resolver: ToolResolver | undefined
  /** Token the current client was built for. */
  private tokenAtBoot: string | undefined
  /** Most recent bridge error message; `null` when the last call settled. */
  private lastError: string | null = null
  /** Whether the current token has produced a boot error (avoid hot loops). */
  private bootFailed = false

  /**
   * @param ctx - owning Cordis context.
   * @param config - runtime policy (token getter, endpoint, timeout, guards, pins).
   * @param createClient - test seam: client factory (defaults to the real MCP client).
   */
  constructor(
    ctx: Context,
    private readonly config: TicktickServiceConfig,
    private readonly createClient: ClientFactory = (url, token, timeoutMs) => new McpStreamableClient(url, token, timeoutMs),
  ) {
    super(ctx, 'ticktick')
  }

  /** Connection and configuration facts (no handshake forced). */
  status(): TicktickStatus {
    const resolver = this.resolver
    return {
      configured: this.config.getToken() !== null,
      connected: this.client !== undefined,
      mcpUrl: this.config.mcpUrl,
      lastError: this.lastError,
      toolNames: {
        projects: resolver?.projects ?? '',
        tasks: resolver?.tasks ?? '',
        create: resolver?.create ?? '',
        complete: resolver?.complete ?? '',
        remove: resolver?.remove ?? '',
        update: resolver?.update ?? '',
        move: resolver?.move ?? '',
      },
    }
  }

  /** Drop the bootstrapped client so the next call re-reads the token. */
  reset(): void {
    this.client = undefined
    this.resolver = undefined
    this.tokenAtBoot = undefined
    this.bootFailed = false
  }

  /**
   * One-shot connectivity check over a throwaway client (the cached bridge
   * client is untouched): initialize + tool listing against the current
   * token. Feeds the settings card's "test connection" button.
   */
  async probe(): Promise<TicktickProbeResult> {
    const token = this.config.getToken()
    if (token === null) return { ok: false, toolCount: 0, error: 'no token configured' }
    const client = this.createClient(this.config.mcpUrl, token, this.config.toolCallTimeoutMs)
    try {
      await client.initialize()
      const tools = await client.listTools()
      return { ok: true, toolCount: tools.length, error: null }
    } catch (error) {
      return { ok: false, toolCount: 0, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /** List the user's projects (the virtual inbox included). */
  async projects(): Promise<{ projects: readonly TicktickProject[] }> {
    const { client, resolver } = await this.ensure()
    const projects = normalizeProjects(await this.call(client, resolver.projects, {}))
    return { projects }
  }

  /**
   * Aggregate undone tasks: one project when named, else every project.
   * Projects whose response fails server-side validation are skipped and
   * reported as warnings; each project's chunk stays sorted by descending
   * sortOrder (the measured list order).
   */
  async tasks(projectId?: string): Promise<TicktickTasksResult> {
    const { client, resolver } = await this.ensure()
    const projects = normalizeProjects(await this.call(client, resolver.projects, {}))
      .filter(project => projectId === undefined || projectId === '' || project.id === projectId)
    const tasks: TicktickTaskWire[] = []
    const warnings: string[] = []
    for (const project of projects) {
      try {
        const result = await this.call(client, resolver.tasks, { project_id: project.id })
        const chunk = normalizeTasks(result)
          .map(task => toWireTask(task.projectId === undefined ? { ...task, projectId: project.id } : task))
          .sort((a, b) => (b.sortOrder ?? 0) - (a.sortOrder ?? 0))
        tasks.push(...chunk)
      } catch (error) {
        warnings.push(`${project.name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    return { tasks, warnings }
  }

  /**
   * Completed tasks within a window (P2): `list_completed_tasks_by_date`
   * with a startDate `days` back (default 30) and an optional project.
   */
  async completed(projectId?: string, days = 30): Promise<TicktickTasksResult> {
    const { client, resolver } = await this.ensure()
    if (resolver.completed === '') {
      throw new RemoteError('ticktick/tool-error', 'the MCP endpoint does not advertise a completed-tasks tool', { tool: 'completed' })
    }
    const search: Record<string, unknown> = { startDate: new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10) }
    if (projectId !== undefined && projectId !== '') search.projectIds = [projectId]
    const result = await this.call(client, resolver.completed, { search })
    return { tasks: normalizeTasks(result).map(toWireTask), warnings: [] }
  }

  /** Full-text search over TickTick tasks (P2): `search` / `search_task`. */
  async search(query: string): Promise<TicktickTasksResult> {
    const clean = query.trim()
    if (clean === '') throw new RemoteError('ticktick/bad-request', 'query required', { field: 'query' })
    const { client, resolver } = await this.ensure()
    if (resolver.search === '') {
      throw new RemoteError('ticktick/tool-error', 'the MCP endpoint does not advertise a search tool', { tool: 'search' })
    }
    const result = await this.call(client, resolver.search, { query: clean })
    return { tasks: normalizeTasks(result).map(toWireTask), warnings: [] }
  }

  /** Batch-create tasks (P2): `batch_add_tasks` over the OpenTask rows. */
  async batchAdd(tasks: readonly { title: string, projectId?: string, dueDate?: string }[]): Promise<{ created: number }> {
    const rows = tasks
      .map(task => ({ ...task, title: task.title.trim() }))
      .filter(task => task.title !== '')
    if (rows.length === 0) throw new RemoteError('ticktick/bad-request', 'at least one non-empty title required', { field: 'tasks' })
    const { client, resolver } = await this.ensure()
    if (resolver.batchAdd === '') {
      throw new RemoteError('ticktick/tool-error', 'the MCP endpoint does not advertise a batch-add tool', { tool: 'batchAdd' })
    }
    await this.call(client, resolver.batchAdd, {
      tasks: rows.map(row => ({
        title: row.title,
        ...(row.projectId !== undefined && row.projectId !== '' ? { projectId: row.projectId } : {}),
        ...(row.dueDate !== undefined && row.dueDate !== '' ? { dueDate: row.dueDate } : {}),
      })),
    })
    return { created: rows.length }
  }

  /** Create one task; a named project places it there, otherwise the Inbox. */
  async add(title: string, projectId?: string, dueDate?: string): Promise<TicktickAddResult> {
    const clean = title.trim()
    if (clean === '') throw new RemoteError('ticktick/bad-request', 'title required', { field: 'title' })
    const { client, resolver } = await this.ensure()
    const task: Record<string, unknown> = { title: clean }
    if (projectId !== undefined && projectId !== '') task.projectId = projectId
    if (dueDate !== undefined && dueDate !== '') task.dueDate = dueDate
    const result = await this.call(client, resolver.create, { task })
    const created = normalizeTasks(result)[0]
    // Read-after-write verification (P2): re-read the task when the
    // endpoint advertises a by-id lookup and surface a mismatch warning.
    let verifyWarning: string | null = null
    if (created !== undefined && resolver.getTask !== '') {
      try {
        const readback = await this.call(client, resolver.getTask, { task_id: created.id })
        const rows = normalizeTasks(readback)
        if (rows.length === 0) verifyWarning = 'readback returned no task'
        else if (rows[0]!.title !== clean) verifyWarning = `readback title mismatch: ${rows[0]!.title}`
      } catch {
        verifyWarning = 'readback failed (verification skipped)'
      }
    }
    return { task: created === undefined ? null : toWireTask(created), verifyWarning }
  }

  /** Mark one task complete (TickTick needs both the project and the task id). */
  async complete(id: string, projectId: string): Promise<TicktickOkResult> {
    this.requireIds(id, projectId)
    const { client, resolver } = await this.ensure()
    await this.call(client, resolver.complete, { project_id: projectId, task_id: id })
    return { ok: true }
  }

  /** Delete one task (TickTick needs both the project and the task id). */
  async remove(id: string, projectId: string): Promise<TicktickOkResult> {
    this.requireIds(id, projectId)
    const { client, resolver } = await this.ensure()
    await this.call(client, resolver.remove, { project_id: projectId, task_id: id })
    return { ok: true }
  }

  /**
   * Set (or clear) one task's due date. Inbox tasks update directly.
   * Project tasks try the direct update first and fall back to the measured
   * move-to-inbox → update → move-back detour when the server answers with
   * its update_task crash signature.
   */
  async setDue(id: string, projectId: string | undefined, dueDate?: string): Promise<TicktickOkResult> {
    if (id === '') throw new RemoteError('ticktick/bad-request', 'id required', { field: 'id' })
    this.assertNotProtected(id)
    const effective = dueDate !== undefined && dueDate !== '' ? dueDate : EPOCH_SENTINEL
    const { client, resolver } = await this.ensure()
    const inProject = projectId !== undefined && projectId !== '' && !isInboxProject(projectId)
    if (!inProject) {
      await this.call(client, resolver.update, { task_id: id, task: { dueDate: effective } })
      return { ok: true }
    }
    try {
      await this.call(client, resolver.update, { task_id: id, task: { dueDate: effective } })
    } catch (error) {
      if (!UPDATE_CRASH_SIGNATURE.test(error instanceof Error ? error.message : String(error))) throw error
      await this.call(client, resolver.move, { moves: [{ fromProjectId: projectId, toProjectId: 'inbox', taskId: id }] })
      try {
        await this.call(client, resolver.update, { task_id: id, task: { dueDate: effective } })
      } finally {
        await this.call(client, resolver.move, { moves: [{ fromProjectId: 'inbox', toProjectId: projectId, taskId: id }] })
      }
    }
    return { ok: true }
  }

  /**
   * Move one task to a new position: inbox tasks take update_task with the
   * new sortOrder; project tasks take a same-project move carrying the new
   * sortOrder (the list order is descending sortOrder).
   */
  async reorder(id: string, projectId: string | undefined, sortOrder: number): Promise<TicktickOkResult> {
    if (id === '') throw new RemoteError('ticktick/bad-request', 'id required', { field: 'id' })
    if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder)) {
      throw new RemoteError('ticktick/bad-request', 'sortOrder must be an integer', { field: 'sortOrder' })
    }
    this.assertNotProtected(id)
    const { client, resolver } = await this.ensure()
    if (projectId !== undefined && projectId !== '' && !isInboxProject(projectId)) {
      await this.call(client, resolver.move, {
        moves: [{ fromProjectId: projectId, toProjectId: projectId, taskId: id, sortOrder }],
      })
    } else {
      await this.call(client, resolver.update, { task_id: id, task: { sortOrder } })
    }
    return { ok: true }
  }

  /** Reject a mutating operation naming an id on the protected list. */
  private assertNotProtected(id: string): void {
    if (this.config.protectedTaskIds.includes(id)) {
      throw new RemoteError('ticktick/protected', `task ${id} is protected`, { taskId: id })
    }
  }

  /** Validate the id pair required by complete/delete. */
  private requireIds(id: string, projectId: string): void {
    if (id === '') throw new RemoteError('ticktick/bad-request', 'id required', { field: 'id' })
    if (projectId === '') throw new RemoteError('ticktick/bad-request', 'projectId required', { field: 'projectId' })
    this.assertNotProtected(id)
  }

  /**
   * Lazily bootstrap the MCP client and tool resolver for the active token.
   * A token change or a 401-triggered reset rebuilds the client.
   */
  private async ensure(): Promise<{ client: McpClientFace, resolver: ToolResolver }> {
    const token = this.config.getToken()
    if (token === null) throw new RemoteError('ticktick/no-token', 'no token: set it in the TickTick settings card or write the API 口令 to the token file', {})
    if (this.client === undefined || this.tokenAtBoot !== token || this.bootFailed) {
      this.client = undefined
      this.resolver = undefined
      this.tokenAtBoot = undefined
      this.bootFailed = false
      const client = this.createClient(this.config.mcpUrl, token, this.config.toolCallTimeoutMs)
      try {
        await client.initialize()
        const tools = await client.listTools()
        this.resolver = resolveTools(tools, this.config.pins)
        this.client = client
        this.tokenAtBoot = token
        this.lastError = null
      } catch (error) {
        this.bootFailed = true
        this.lastError = error instanceof Error ? error.message : String(error)
        throw new RemoteError('ticktick/tool-error', this.lastError, { tool: 'initialize' }, { cause: error })
      }
    }
    return { client: this.client, resolver: this.resolver! }
  }

  /**
   * One tools/call with error mapping: tool-level failures carry their raw
   * tool name; a 401 signature resets the client once so the next call
   * re-reads the token file.
   */
  private async call(client: McpClientFace, tool: string, args: Record<string, unknown>): Promise<McpCallResult> {
    try {
      this.lastError = null
      return await client.callTool(tool, args)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.lastError = message
      if (AUTH_SIGNATURE.test(message)) this.reset()
      throw new RemoteError('ticktick/tool-error', message, { tool }, { cause: error })
    }
  }
}
