/**
 * Tool discovery and task normalization over the TickTick MCP tool list:
 * names are resolved by pattern (pinnable per deployment) and results are
 * normalized into a stable `{ id, title, done, projectId, dueDate,
 * sortOrder }` view. Ported from the measured 0.1.0-era bridge; the wire
 * facts (list order = descending sortOrder, inbox ids carry 'inbox') were
 * verified against the live endpoint.
 *
 * @module dsh-ticktick/domain
 */

import type { McpCallResult, McpTool } from './mcp.ts'
import type { ToolPins } from './config.ts'

/** The resolved raw MCP tool names for the bridge operations. */
export interface ToolResolver {
  readonly projects: string
  readonly tasks: string
  readonly create: string
  readonly complete: string
  readonly remove: string
  readonly update: string
  readonly move: string
  /** `list_completed_tasks_by_date` (P2 completed view). */
  readonly completed: string
  /** `search` or `search_task` (P2 full-text search). */
  readonly search: string
  /** `get_task_by_id` (P2 read-after-write verification). */
  readonly getTask: string
  /** `batch_add_tasks` (P2 batch create). */
  readonly batchAdd: string
}

/** Stable task view the widget and tools render. */
export interface TicktickTask {
  readonly id: string
  readonly title: string
  readonly done: boolean
  /** Owning project, required by TickTick's complete_task call. */
  readonly projectId?: string
  /** ISO due date (TickTick date-time), absent when the task has none. */
  readonly dueDate?: string
  /** TickTick sort order (list order is descending). */
  readonly sortOrder?: number
}

/** One project entry from `list_projects` (the virtual inbox included). */
export interface TicktickProject {
  readonly id: string
  readonly name: string
}

const PROJECTS_PATTERN = /(list|get)[^a-z0-9]*(project|projects)|(project|projects)[^a-z0-9]*(list|get)/i
const TASKS_PATTERN = /(undone|open)[^a-z0-9]*(task|tasks)|project[^a-z0-9]*(with|undone)[^a-z0-9]*(task|tasks)/i
const CREATE_PATTERN = /^(create|add|insert|new)[^a-z0-9]*(task|todo)|^(task|todo)[^a-z0-9]*(create|add|insert|new)/i
const COMPLETE_PATTERN = /^(complete|finish|done|close|check)[^a-z0-9]*(task|todo)|^(task|todo)[^a-z0-9]*(complete|finish|done|close|check)/i
const REMOVE_PATTERN = /^(delete|remove)[^a-z0-9]*(task|todo)|^(task|todo)[^a-z0-9]*(delete|remove)/i
const UPDATE_PATTERN = /^update[^a-z0-9]*(task|todo)|^(task|todo)[^a-z0-9]*update/i
const MOVE_PATTERN = /^move[^a-z0-9]*(task|todo)|^(task|todo)[^a-z0-9]*move/i
const COMPLETED_PATTERN = /completed[^a-z0-9]*(task|tasks)|completed_by/i
const SEARCH_PATTERN = /^search(_task)?$/i
const GET_TASK_PATTERN = /get[^a-z0-9]*task[^a-z0-9]*by[^a-z0-9]*id|^fetch$/i
const BATCH_ADD_PATTERN = /batch[^a-z0-9]*add[^a-z0-9]*(task|tasks)/i

/**
 * Pick the raw tool names for the eleven operations, honoring pins.
 * A pin that is not advertised falls back to pattern discovery, then to
 * the first advertised tool, then to the pin itself (an empty resolver
 * surfaces as a failed call, never a silent no-op).
 * @param tools - the advertised tool list.
 * @param pins - config-level name pins.
 * @returns the resolved names.
 */
export function resolveTools(tools: readonly McpTool[], pins: ToolPins): ToolResolver {
  const pick = (pattern: RegExp, pin: string): string => {
    if (pin !== '' && tools.some(tool => tool.name === pin)) return pin
    return tools.find(tool => pattern.test(tool.name))?.name
      ?? (pin !== '' ? pin : tools[0]?.name)
      ?? ''
  }
  // Prefer the exact `search` tool over `search_task` (both match the pattern).
  const searchPin = pins.search
  const exactSearch = tools.find(tool => tool.name === 'search')
  const search = (searchPin !== '' && tools.some(tool => tool.name === searchPin)) ? searchPin
    : (exactSearch?.name ?? pick(SEARCH_PATTERN, searchPin))
  return {
    projects: pick(PROJECTS_PATTERN, pins.projects),
    tasks: pick(TASKS_PATTERN, pins.tasks),
    create: pick(CREATE_PATTERN, pins.create),
    complete: pick(COMPLETE_PATTERN, pins.complete),
    remove: pick(REMOVE_PATTERN, pins.remove),
    update: pick(UPDATE_PATTERN, pins.update),
    move: pick(MOVE_PATTERN, pins.move),
    completed: pick(COMPLETED_PATTERN, pins.completed),
    search,
    getTask: pick(GET_TASK_PATTERN, pins.getTask),
    batchAdd: pick(BATCH_ADD_PATTERN, pins.batchAdd),
  }
}

const VALUE_KEY = /title|content|text|subject|name|desc/i
const ID_KEY = /(^|_)(id|uuid)$|taskId|task_id/i
const PROJECT_KEY = /projectId|project_id/i

/** Parse the project entries out of a `list_projects` result (object or array payloads). */
export function normalizeProjects(result: McpCallResult): readonly TicktickProject[] {
  const projects: TicktickProject[] = []
  const seen = new Set<string>()
  const accept = (record: Record<string, unknown>): void => {
    const id = record.id
    const name = record.name
    if (typeof id === 'string' && typeof name === 'string' && !seen.has(id)) {
      seen.add(id)
      projects.push({ id, name })
    }
  }
  for (const block of result.content ?? []) {
    if (block.type !== 'text' || block.text === undefined) continue
    try {
      const parsed = JSON.parse(block.text) as unknown
      if (Array.isArray(parsed)) {
        for (const entry of parsed) {
          if (entry !== null && typeof entry === 'object') accept(entry as Record<string, unknown>)
        }
      } else if (parsed !== null && typeof parsed === 'object') {
        accept(parsed as Record<string, unknown>)
      }
    } catch {
      // Non-JSON text blocks are not project entries.
    }
  }
  return projects
}

/** Walk a value for arrays whose elements look like task objects. */
function findTaskArrays(value: unknown, depth: number): unknown[][] {
  if (depth > 8 || value === null || typeof value !== 'object') return []
  if (Array.isArray(value)) {
    const elements = value.filter(item => item !== null && typeof item === 'object' && !Array.isArray(item))
    if (elements.length > 0 && elements.every(item => {
      const record = item as Record<string, unknown>
      return Object.keys(record).some(key => VALUE_KEY.test(key))
    })) return [value as unknown[]]
    return value.flatMap(item => findTaskArrays(item, depth + 1))
  }
  return Object.values(value as Record<string, unknown>).flatMap(item => findTaskArrays(item, depth + 1))
}

/** Read the task id, title, done flag, project, due date, and sort order from one task-like record. */
function readTask(record: Record<string, unknown>): TicktickTask | null {
  const keys = Object.keys(record)
  const titleKey = keys.find(key => VALUE_KEY.test(key) && typeof record[key] === 'string')
  const idKey = keys.find(key => ID_KEY.test(key))
  if (titleKey === undefined || idKey === undefined) return null
  const idValue = record[idKey]
  if (typeof idValue !== 'string' && typeof idValue !== 'number') return null
  const projectKey = keys.find(key => PROJECT_KEY.test(key))
  const projectValue = projectKey === undefined ? undefined : record[projectKey]
  const dueKey = keys.find(key => /dueDate|due_date|deadline/i.test(key))
  const dueValue = dueKey === undefined ? undefined : record[dueKey]
  const sortKey = keys.find(key => /sortOrder|sort_order/i.test(key))
  const sortValue = sortKey === undefined ? undefined : record[sortKey]
  const status = record.status
  const done = status === 2 || status === '2' || status === 'completed'
    || record.completed === true || record.done === true || record.finished === true
  return {
    id: String(idValue),
    title: record[titleKey] as string,
    done,
    ...(typeof projectValue === 'string' ? { projectId: projectValue } : {}),
    ...(typeof dueValue === 'string' && dueValue !== '' ? { dueDate: dueValue } : {}),
    ...(typeof sortValue === 'number' ? { sortOrder: sortValue } : {}),
  }
}

/** Normalize a tools/call result into the stable task view. */
export function normalizeTasks(result: McpCallResult): readonly TicktickTask[] {
  const sources: unknown[] = [result.structuredContent]
  for (const block of result.content ?? []) {
    if (block.type === 'text' && block.text !== undefined) {
      try { sources.push(JSON.parse(block.text) as unknown) } catch { sources.push(block.text) }
    }
  }
  const seen = new Set<string>()
  const tasks: TicktickTask[] = []
  for (const source of sources) {
    // A single task echo (create_task answers one object) is accepted
    // directly — guarded by a task field so project/list wrappers and
    // plain objects never masquerade as tasks; arrays of task-like rows
    // come through findTaskArrays.
    if (source !== null && typeof source === 'object' && !Array.isArray(source)) {
      const record = source as Record<string, unknown>
      const taskish = Object.keys(record).some(key => /status|projectId|project_id|dueDate|due_date|sortOrder|sort_order/i.test(key))
      if (taskish) {
        const direct = readTask(record)
        if (direct !== null && !seen.has(direct.id)) {
          seen.add(direct.id)
          tasks.push(direct)
        }
      }
    }
    for (const array of findTaskArrays(source, 0)) {
      for (const item of array) {
        const task = readTask(item as Record<string, unknown>)
        if (task !== null && !seen.has(task.id)) {
          seen.add(task.id)
          tasks.push(task)
        }
      }
    }
  }
  return tasks
}

/**
 * Whether a project id names the virtual inbox. Measured wire fact: inbox
 * ids carry the literal 'inbox' (either exactly or inside an internal id),
 * while regular projects are hex ids.
 * @param projectId - the project id.
 * @returns true for inbox ids.
 */
export function isInboxProject(projectId: string): boolean {
  return projectId === 'inbox' || projectId.includes('inbox')
}
