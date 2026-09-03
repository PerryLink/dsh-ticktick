/**
 * The TickTick bridge's wire vocabulary: the result types served over the
 * `ticktick` Remote namespace, their zod v4 validation schema (the strict
 * codec both Typert faces carry), and the invocation descriptors shared
 * verbatim by the host `./typert` manifest (`src/typert.host.ts`) and the
 * client Remote contribution (`src/client/remote.ts`). One canonical source
 * for both faces keeps the host and client codecs from ever drifting apart.
 *
 * @module dsh-ticktick/wire
 */

import { z } from 'zod'
import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'

/** Connection and configuration facts the panel and `ticktick_status` read. */
export interface TicktickStatus {
  /** A Bearer token is currently resolvable (file or settings). */
  configured: boolean
  /** The MCP client finished its initialize handshake. */
  connected: boolean
  /** Active MCP endpoint. */
  mcpUrl: string
  /** Most recent bridge error, sanitized for display; `null` when none. */
  lastError: string | null
  /** Resolved raw tool names (`''` = unresolved). */
  toolNames: {
    projects: string
    tasks: string
    create: string
    complete: string
    remove: string
    update: string
    move: string
  }
}

/** Strict wire schema for {@link TicktickStatus}. */
export const TICKTICK_STATUS_SCHEMA = z.object({
  configured: z.boolean(),
  connected: z.boolean(),
  mcpUrl: z.string(),
  lastError: z.string().nullable(),
  toolNames: z.object({
    projects: z.string(),
    tasks: z.string(),
    create: z.string(),
    complete: z.string(),
    remove: z.string(),
    update: z.string(),
    move: z.string(),
  }),
})

/** One project (list) as the widget renders it. */
export interface TicktickProjectWire {
  id: string
  name: string
}

/** One task as the widget renders it. */
export interface TicktickTaskWire {
  id: string
  title: string
  done: boolean
  /** Owning project id, or `null` when the server did not carry one. */
  projectId: string | null
  /** ISO due date, or `null` when the task has none. */
  dueDate: string | null
  /** TickTick sort order, or `null` when absent. */
  sortOrder: number | null
}

/** Aggregated undone tasks plus per-list warnings. */
export interface TicktickTasksResult {
  tasks: readonly TicktickTaskWire[]
  warnings: readonly string[]
}

/** Strict wire schema for {@link TicktickTasksResult}. */
export const TICKTICK_TASKS_RESULT_SCHEMA = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    done: z.boolean(),
    projectId: z.string().nullable(),
    dueDate: z.string().nullable(),
    sortOrder: z.number().int().nullable(),
  })),
  warnings: z.array(z.string()),
})

/** One created task reference, plus the P2 read-after-write verification. */
export interface TicktickAddResult {
  task: TicktickTaskWire | null
  /** Read-back warning; `null` when the creation verified clean or no lookup tool exists. */
  verifyWarning: string | null
}

/** Strict wire schema for {@link TicktickAddResult}. */
export const TICKTICK_ADD_RESULT_SCHEMA = z.object({
  task: z.object({
    id: z.string(),
    title: z.string(),
    done: z.boolean(),
    projectId: z.string().nullable(),
    dueDate: z.string().nullable(),
    sortOrder: z.number().int().nullable(),
  }).nullable(),
  verifyWarning: z.string().nullable(),
})

/** One row of the P2 batch-add payload. */
export const BATCH_ADD_TASK_SCHEMA = z.object({
  title: z.string(),
  projectId: z.string().optional(),
  dueDate: z.string().optional(),
})

/** Strict wire schema for the `ticktick/batchAdd` result. */
export const BATCH_ADD_RESULT_SCHEMA = z.object({
  created: z.number().int(),
})

/** One accepted mutation. */
export interface TicktickOkResult {
  ok: boolean
}

/** Strict wire schema for {@link TicktickOkResult}. */
export const TICKTICK_OK_RESULT_SCHEMA = z.object({
  ok: z.boolean(),
})

/** Settings namespace the browser card edits (paired by this exact key, both faces). */
export const TICKTICK_SETTINGS_NS = 'ticktick'

/**
 * Settings the card owns: token (secret) and token file are live; the
 * endpoint and protected ids apply on restart. Declared here (shared
 * vocabulary) so the client card types against it without importing the
 * Host module.
 */
export interface TicktickSettings {
  token: string
  tokenFile: string
  mcpUrl: string
  protectedTaskIds: string[]
}

/** Parameter codec helper: one JSON-sourced string parameter. */
function stringParam(name: string, typeSymbol: string, acceptsUndefined = false): InvocationDescriptor['parameters'][number] {
  return Object.freeze({
    name,
    wire: name,
    source: 'json' as const,
    ...(acceptsUndefined ? { acceptsUndefined: true } : {}),
    codec: Object.freeze({
      mode: 'strict' as const,
      typeSymbol,
      schema: z.string(),
    }),
  })
}

/** Parameter codec helper: one JSON-sourced number parameter. */
function numberParam(name: string, typeSymbol: string, acceptsUndefined = false): InvocationDescriptor['parameters'][number] {
  return Object.freeze({
    name,
    wire: name,
    source: 'json' as const,
    ...(acceptsUndefined ? { acceptsUndefined: true } : {}),
    codec: Object.freeze({
      mode: 'strict' as const,
      typeSymbol,
      schema: z.number().int(),
    }),
  })
}

/** Result codec helper. */
function resultCodec(typeSymbol: string, schema: z.ZodType<unknown>): InvocationDescriptor['result'] {
  return Object.freeze({
    mode: 'strict' as const,
    typeSymbol,
    schema,
  })
}

/** The `ticktick/status` invocation descriptor. */
export const TICKTICK_STATUS_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/status',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'status',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([]),
  result: resultCodec('dsh-ticktick/types#TicktickStatus', TICKTICK_STATUS_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/projects` invocation descriptor. */
export const TICKTICK_PROJECTS_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/projects',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'projects',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([]),
  result: resultCodec('dsh-ticktick/types#TicktickProjectsResult', z.object({
    projects: z.array(z.object({ id: z.string(), name: z.string() })),
  })),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/tasks` invocation descriptor (optional list filter). */
export const TICKTICK_TASKS_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/tasks',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'tasks',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([
    stringParam('projectId', 'dsh-ticktick/types#TasksProjectId', true),
  ]),
  result: resultCodec('dsh-ticktick/types#TicktickTasksResult', TICKTICK_TASKS_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/add` invocation descriptor. */
export const TICKTICK_ADD_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/add',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'add',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([
    stringParam('title', 'dsh-ticktick/types#AddTitle'),
    stringParam('projectId', 'dsh-ticktick/types#AddProjectId', true),
    stringParam('dueDate', 'dsh-ticktick/types#AddDueDate', true),
  ]),
  result: resultCodec('dsh-ticktick/types#TicktickAddResult', TICKTICK_ADD_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/complete` invocation descriptor. */
export const TICKTICK_COMPLETE_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/complete',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'complete',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([
    stringParam('id', 'dsh-ticktick/types#CompleteId'),
    stringParam('projectId', 'dsh-ticktick/types#CompleteProjectId'),
  ]),
  result: resultCodec('dsh-ticktick/types#TicktickOkResult', TICKTICK_OK_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/remove` invocation descriptor. */
export const TICKTICK_REMOVE_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/remove',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'remove',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([
    stringParam('id', 'dsh-ticktick/types#RemoveId'),
    stringParam('projectId', 'dsh-ticktick/types#RemoveProjectId'),
  ]),
  result: resultCodec('dsh-ticktick/types#TicktickOkResult', TICKTICK_OK_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/setDue` invocation descriptor (absent date = clear). */
export const TICKTICK_SET_DUE_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/setDue',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'setDue',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([
    stringParam('id', 'dsh-ticktick/types#SetDueId'),
    stringParam('projectId', 'dsh-ticktick/types#SetDueProjectId', true),
    stringParam('dueDate', 'dsh-ticktick/types#SetDueDate', true),
  ]),
  result: resultCodec('dsh-ticktick/types#TicktickOkResult', TICKTICK_OK_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/reorder` invocation descriptor. */
export const TICKTICK_REORDER_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/reorder',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'reorder',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([
    stringParam('id', 'dsh-ticktick/types#ReorderId'),
    stringParam('projectId', 'dsh-ticktick/types#ReorderProjectId', true),
    numberParam('sortOrder', 'dsh-ticktick/types#ReorderSortOrder'),
  ]),
  result: resultCodec('dsh-ticktick/types#TicktickOkResult', TICKTICK_OK_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/completed` invocation descriptor (P2 completed view). */
export const TICKTICK_COMPLETED_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/completed',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'completed',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([
    stringParam('projectId', 'dsh-ticktick/types#CompletedProjectId', true),
    numberParam('days', 'dsh-ticktick/types#CompletedDays', true),
  ]),
  result: resultCodec('dsh-ticktick/types#TicktickTasksResult', TICKTICK_TASKS_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/search` invocation descriptor (P2 full-text search). */
export const TICKTICK_SEARCH_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/search',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'search',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([
    stringParam('query', 'dsh-ticktick/types#SearchQuery'),
  ]),
  result: resultCodec('dsh-ticktick/types#TicktickTasksResult', TICKTICK_TASKS_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/** The `ticktick/batchAdd` invocation descriptor (P2 batch create). */
export const TICKTICK_BATCH_ADD_DESCRIPTOR = Object.freeze({
  id: 'dsh-ticktick#ticktick/batchAdd',
  service: 'ticktick',
  namespace: 'ticktick',
  method: 'batchAdd',
  invocation: Object.freeze({ kind: 'direct' }),
  parameters: Object.freeze([Object.freeze({
    name: 'tasks',
    wire: 'tasks',
    source: 'json' as const,
    codec: Object.freeze({
      mode: 'strict' as const,
      typeSymbol: 'dsh-ticktick/types#BatchAddTasks',
      schema: z.array(BATCH_ADD_TASK_SCHEMA),
    }),
  } satisfies InvocationDescriptor['parameters'][number])]),
  result: resultCodec('dsh-ticktick/types#BatchAddResult', BATCH_ADD_RESULT_SCHEMA),
  sourceLocation: Object.freeze({ file: 'src/wire.ts', line: 1, column: 1 }),
} as const) satisfies InvocationDescriptor

/**
 * The canonical invocation list both Typert faces register — the host
 * manifest and the client contribution share these exact descriptor objects,
 * so the two wire codecs can never drift apart.
 */
export const TICKTICK_INVOCATIONS = Object.freeze([
  TICKTICK_STATUS_DESCRIPTOR,
  TICKTICK_PROJECTS_DESCRIPTOR,
  TICKTICK_TASKS_DESCRIPTOR,
  TICKTICK_ADD_DESCRIPTOR,
  TICKTICK_COMPLETE_DESCRIPTOR,
  TICKTICK_REMOVE_DESCRIPTOR,
  TICKTICK_SET_DUE_DESCRIPTOR,
  TICKTICK_REORDER_DESCRIPTOR,
  TICKTICK_COMPLETED_DESCRIPTOR,
  TICKTICK_SEARCH_DESCRIPTOR,
  TICKTICK_BATCH_ADD_DESCRIPTOR,
])
