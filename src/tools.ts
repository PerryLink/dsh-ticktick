/**
 * The curated model-facing tools of the TickTick bridge. All eight reuse the
 * host service's business methods, so the model and the widget share one
 * policy (protected ids, workarounds, error codes). Each `output.schema`
 * returns a structured JSON value — the Code Mode `await tools.ticktick_*`
 * surface derives from it — while `output.render` carries the human text.
 *
 * @module dsh-ticktick/tools
 */

import { defineTool } from '@deepseek-ai/dsh-tools'
import type { TicktickService } from './service.ts'
import type { TicktickTaskWire } from './wire.ts'

/** Task wire projection shared by the add/tasks tools. */
function taskWire(task: TicktickTaskWire): string {
  const due = task.dueDate === null ? 'no due date' : task.dueDate
  return `${task.title} [${task.projectId ?? '?'}] due ${due}`
}

/** Value schema of one task wire row. */
const TASK_ROW_SCHEMA = {
  type: 'object' as const,
  properties: {
    id: { type: 'string' as const, required: true as const },
    title: { type: 'string' as const, required: true as const },
    done: { type: 'boolean' as const, required: true as const },
    projectId: { oneOf: [{ type: 'string' as const }, { type: 'null' as const }] as const, required: true as const },
    dueDate: { oneOf: [{ type: 'string' as const }, { type: 'null' as const }] as const, required: true as const },
    sortOrder: { oneOf: [{ type: 'number' as const }, { type: 'null' as const }] as const, required: true as const },
  },
  additionalProperties: false as const,
}

/** Value schema of an `{ ok: boolean }` mutation result. */
const OK_RESULT_SCHEMA = {
  type: 'object' as const,
  properties: {
    ok: { type: 'boolean' as const, required: true as const },
  },
  additionalProperties: false as const,
}

/**
 * Build the eight tools bound to one service instance.
 * @param service - the mounted TickTick service.
 * @returns the registered tool definitions.
 */
export function buildTicktickTools(service: TicktickService): ReturnType<typeof defineTool>[] {
  return [
    defineTool({
      name: 'ticktick_status',
      description: 'Read the TickTick (Dida365) bridge connection state: token configured, client connected, endpoint, and last error.',
      parameters: {},
      output: {
        schema: {
          type: 'object',
          properties: {
            configured: { type: 'boolean', required: true },
            connected: { type: 'boolean', required: true },
            mcpUrl: { type: 'string', required: true },
            lastError: { oneOf: [{ type: 'string' as const }, { type: 'null' as const }] as const, required: true },
          },
          additionalProperties: false,
        },
        render: (_args, value) => {
          const status = value as { configured: boolean, connected: boolean, mcpUrl: string, lastError: string | null }
          const line = status.configured
            ? (status.connected ? `connected to ${status.mcpUrl}` : 'configured but not connected')
            : 'not configured (no token)'
          return [{ type: 'text', text: status.lastError === null ? `TickTick bridge: ${line}` : `TickTick bridge: ${line}; last error: ${status.lastError}` }]
        },
      },
      async execute() {
        const status = service.status()
        return {
          configured: status.configured,
          connected: status.connected,
          mcpUrl: status.mcpUrl,
          lastError: status.lastError,
        }
      },
    }),
    defineTool({
      name: 'ticktick_lists',
      description: 'List every TickTick list (project), including the virtual Inbox.',
      parameters: {},
      output: {
        schema: {
          type: 'object',
          properties: {
            projects: {
              type: 'array',
              required: true,
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', required: true },
                  name: { type: 'string', required: true },
                },
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
        render: (_args, value) => {
          const { projects } = value as { projects: readonly { id: string, name: string }[] }
          return [{ type: 'text', text: projects.length === 0 ? 'no lists' : projects.map(p => `${p.name} (${p.id})`).join('\n') }]
        },
      },
      async execute() {
        const result = await service.projects()
        return { projects: [...result.projects] }
      },
    }),
    defineTool({
      name: 'ticktick_tasks',
      description: 'List undone TickTick tasks: one named list, or every list aggregated with per-list warnings for lists the server could not read.',
      parameters: {
        projectId: { type: 'string', description: 'Optional list id (omit for every list)' },
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            tasks: { type: 'array', required: true, items: TASK_ROW_SCHEMA },
            warnings: { type: 'array', required: true, items: { type: 'string' } },
          },
          additionalProperties: false,
        },
        render: (_args, value) => {
          const { tasks, warnings } = value as { tasks: readonly TicktickTaskWire[], warnings: readonly string[] }
          const lines = tasks.length === 0 ? ['no undone tasks'] : tasks.map(taskWire)
          if (warnings.length > 0) lines.push(...warnings.map(w => `warning: ${w}`))
          return [{ type: 'text', text: lines.join('\n') }]
        },
      },
      async execute(args) {
        const result = await service.tasks(args.projectId)
        return { tasks: [...result.tasks], warnings: [...result.warnings] }
      },
    }),
    defineTool({
      name: 'ticktick_add',
      description: 'Create one TickTick task: a named list places it there, otherwise the Inbox.',
      parameters: {
        title: { type: 'string', required: true, description: 'Task title' },
        projectId: { type: 'string', description: 'Optional list id (default Inbox)' },
        dueDate: { type: 'string', description: 'Optional ISO due date (e.g. 2026-09-05 or a full ISO date-time)' },
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            task: { oneOf: [TASK_ROW_SCHEMA, { type: 'null' as const }] as const, required: true },
          },
          additionalProperties: false,
        },
        render: (_args, value) => {
          const { task } = value as { task: TicktickTaskWire | null }
          return [{ type: 'text', text: task === null ? 'task created (server returned no echo)' : `created: ${taskWire(task)}` }]
        },
      },
      async execute(args) {
        return service.add(args.title, args.projectId, args.dueDate)
      },
    }),
    defineTool({
      name: 'ticktick_complete',
      description: 'Mark one TickTick task complete (both the task id and its list id are required).',
      parameters: {
        id: { type: 'string', required: true, description: 'Task id' },
        projectId: { type: 'string', required: true, description: 'Owning list id' },
      },
      output: {
        schema: OK_RESULT_SCHEMA,
        render: (_args, value) => {
          const { ok } = value as { ok: boolean }
          return [{ type: 'text', text: ok ? 'task completed' : 'completion rejected' }]
        },
      },
      async execute(args) {
        return service.complete(args.id, args.projectId)
      },
    }),
    defineTool({
      name: 'ticktick_delete',
      description: 'Delete one TickTick task (both the task id and its list id are required).',
      parameters: {
        id: { type: 'string', required: true, description: 'Task id' },
        projectId: { type: 'string', required: true, description: 'Owning list id' },
      },
      output: {
        schema: OK_RESULT_SCHEMA,
        render: (_args, value) => {
          const { ok } = value as { ok: boolean }
          return [{ type: 'text', text: ok ? 'task deleted' : 'delete rejected' }]
        },
      },
      async execute(args) {
        return service.remove(args.id, args.projectId)
      },
    }),
    defineTool({
      name: 'ticktick_due',
      description: 'Set or clear one TickTick task due date. Omit dueDate to clear. Project tasks fall back to a move-to-inbox detour when the server rejects the direct update.',
      parameters: {
        id: { type: 'string', required: true, description: 'Task id' },
        projectId: { type: 'string', description: 'Owning list id (required for project tasks)' },
        dueDate: { type: 'string', description: 'ISO due date; omit to clear' },
      },
      output: {
        schema: OK_RESULT_SCHEMA,
        render: (_args, value) => {
          const { ok } = value as { ok: boolean }
          return [{ type: 'text', text: ok ? 'due date applied' : 'due date rejected' }]
        },
      },
      async execute(args) {
        return service.setDue(args.id, args.projectId, args.dueDate)
      },
    }),
    defineTool({
      name: 'ticktick_reorder',
      description: 'Move one TickTick task to a new sortOrder (lists order by descending sortOrder; compute the target from the neighboring task).',
      parameters: {
        id: { type: 'string', required: true, description: 'Task id' },
        projectId: { type: 'string', description: 'Owning list id (inbox tasks omit it)' },
        sortOrder: { type: 'integer', required: true, description: 'Integer sortOrder to assign' },
      },
      output: {
        schema: OK_RESULT_SCHEMA,
        render: (_args, value) => {
          const { ok } = value as { ok: boolean }
          return [{ type: 'text', text: ok ? 'task reordered' : 'reorder rejected' }]
        },
      },
      async execute(args) {
        return service.reorder(args.id, args.projectId, args.sortOrder)
      },
    }),
  ]
}
