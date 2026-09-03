/**
 * Service specs: the seven operations over a scripted fake MCP client,
 * including the measured workarounds (update_task crash detour, per-list
 * warnings, protected ids, 401 reset).
 */

import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import type { ToolPins } from '../src/config.ts'
import { TicktickService, type TicktickServiceConfig } from '../src/service.ts'
import type { McpCallResult, McpClientFace, McpTool } from '../src/mcp.ts'

const PINS: ToolPins = Object.freeze({
  projects: 'list_projects', tasks: 'get_project_with_undone_tasks', create: 'create_task',
  complete: 'complete_task', remove: 'delete_task', update: 'update_task', move: 'move_task',
  completed: 'list_completed_tasks_by_date', search: 'search', getTask: 'get_task_by_id', batchAdd: 'batch_add_tasks',
})

const TOOLS: readonly McpTool[] = Object.values(PINS).map(name => ({ name }))

/** One recorded call. */
interface Call { name: string, args: Record<string, unknown> }

/** Scripted fake client. */
class FakeClient implements McpClientFace {
  readonly calls: Call[] = []
  failures = new Map<string, Error>()
  createdId = 't-new'
  createdProjectId = 'inbox1020518753'
  tasksByProject = new Map<string, McpCallResult>()

  async initialize(): Promise<void> {}
  async listTools(): Promise<readonly McpTool[]> { return TOOLS }

  async callTool(name: string, args: Record<string, unknown>): Promise<McpCallResult> {
    this.calls.push({ name, args })
    const failure = this.failures.get(name)
    if (failure !== undefined) throw failure
    switch (name) {
      case 'list_projects':
        return {
          content: [{ type: 'text', text: JSON.stringify([
            { id: 'inbox', name: 'Inbox' },
            { id: 'hex1', name: 'Work' },
          ]) }],
        }
      case 'get_project_with_undone_tasks': {
        const key = String(args.project_id)
        return this.tasksByProject.get(key) ?? { content: [{ type: 'text', text: JSON.stringify([]) }] }
      }
      case 'list_completed_tasks_by_date':
        return { content: [{ type: 'text', text: JSON.stringify([
          { id: 't-done', title: 'done task', status: 2, projectId: 'hex1', completedTime: '2026-09-01T10:00:00+08:00' },
        ]) }] }
      case 'search':
        return { content: [{ type: 'text', text: JSON.stringify([
          { taskId: 't-search', title: 'found task', status: 0, projectId: 'hex1' },
        ]) }] }
      case 'get_task_by_id':
        return { content: [{ type: 'text', text: JSON.stringify({
          id: String(args.task_id), title: 'buy milk', status: 0, projectId: 'inbox1020518753',
        }) }] }
      case 'create_task': {
        const task = args.task as Record<string, unknown>
        return {
          content: [{ type: 'text', text: JSON.stringify({
            id: this.createdId,
            title: task.title,
            status: 0,
            projectId: task.projectId ?? this.createdProjectId,
            sortOrder: -100,
          }) }],
        }
      }
      default:
        return { content: [{ type: 'text', text: JSON.stringify({}) }] }
    }
  }
}

function makeService(fake: FakeClient, overrides: Partial<TicktickServiceConfig> = {}): { ctx: Context, service: TicktickService } {
  const ctx = new Context()
  let token: string | null = 'dp_test'
  const config: TicktickServiceConfig = {
    getToken: () => token,
    mcpUrl: 'https://mcp.dida365.com',
    toolCallTimeoutMs: 5_000,
    protectedTaskIds: Object.freeze(['t-guarded']),
    pins: PINS,
    ...overrides,
  }
  const service = new TicktickService(ctx, config, () => fake)
  return { ctx, service }
}

describe('TicktickService', () => {
  it('reports unconfigured state without a token', () => {
    const fake = new FakeClient()
    const { service } = makeService(fake, { getToken: () => null })
    expect(service.status()).toMatchObject({ configured: false, connected: false })
  })

  it('lists projects through the projects tool', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    await expect(service.projects()).resolves.toEqual({
      projects: [{ id: 'inbox', name: 'Inbox' }, { id: 'hex1', name: 'Work' }],
    })
  })

  it('aggregates tasks, filling missing project ids and sorting each chunk', async () => {
    const fake = new FakeClient()
    fake.tasksByProject.set('hex1', {
      content: [{ type: 'text', text: JSON.stringify([
        { id: 't1', title: 'low', sortOrder: -20 },
        { id: 't2', title: 'high', sortOrder: -2 },
      ]) }],
    })
    const { service } = makeService(fake)
    const result = await service.tasks()
    expect(result.warnings).toEqual([])
    expect(result.tasks.map(task => [task.id, task.projectId, task.sortOrder])).toEqual([
      ['t2', 'hex1', -2],
      ['t1', 'hex1', -20],
    ])
  })

  it('skips a failing list and reports it as a warning', async () => {
    const fake = new FakeClient()
    fake.failures.set('get_project_with_undone_tasks', new Error('server validation failed'))
    const { service } = makeService(fake)
    const result = await service.tasks()
    expect(result.tasks).toEqual([])
    expect(result.warnings).toEqual(['Inbox: server validation failed', 'Work: server validation failed'])
  })

  it('adds a task with an optional project', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    const result = await service.add('  buy milk  ')
    expect(result.task).toMatchObject({ id: 't-new', title: 'buy milk', projectId: 'inbox1020518753' })
    expect(fake.calls.find(call => call.name === 'create_task')).toEqual({ name: 'create_task', args: { task: { title: 'buy milk' } } })
  })

  it('rejects an empty title', async () => {
    const { service } = makeService(new FakeClient())
    await expect(service.add('   ')).rejects.toMatchObject({ code: 'ticktick/bad-request', details: { field: 'title' } })
  })

  it('completes and deletes with both ids', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    await service.complete('t1', 'hex1')
    await service.remove('t1', 'hex1')
    expect(fake.calls.map(call => call.name)).toEqual(['complete_task', 'delete_task'])
  })

  it('refuses protected ids on every mutating operation', async () => {
    const { service } = makeService(new FakeClient())
    await expect(service.complete('t-guarded', 'hex1')).rejects.toMatchObject({ code: 'ticktick/protected' })
    await expect(service.remove('t-guarded', 'hex1')).rejects.toMatchObject({ code: 'ticktick/protected' })
    await expect(service.setDue('t-guarded', 'hex1', '2026-09-05')).rejects.toMatchObject({ code: 'ticktick/protected' })
  })

  it('updates inbox due dates directly and clears with the sentinel', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    await service.setDue('t1', 'inbox', '2026-09-05')
    await service.setDue('t1', 'inbox')
    const updates = fake.calls.filter(call => call.name === 'update_task')
    expect(updates).toEqual([
      { name: 'update_task', args: { task_id: 't1', task: { dueDate: '2026-09-05' } } },
      { name: 'update_task', args: { task_id: 't1', task: { dueDate: '1970-01-01T00:00:00.000+0000' } } },
    ])
  })

  it('updates project due dates directly when the server accepts', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    await service.setDue('t1', 'hex1', '2026-09-05')
    expect(fake.calls.map(call => call.name)).toEqual(['update_task'])
  })

  it('detours project due dates through the inbox on the crash signature', async () => {
    const fake = new FakeClient()
    let firstUpdate = true
    // The first direct update fails with the measured crash signature; the
    // detour's inbox update succeeds.
    const { service } = makeService(fake)
    const originalCallTool = fake.callTool.bind(fake)
    fake.callTool = async (name, args) => {
      if (name === 'update_task' && firstUpdate) {
        firstUpdate = false
        throw new Error('Error executing tool update_task: Expecting value: line 1 column 1 (char 0)')
      }
      return originalCallTool(name, args)
    }
    await service.setDue('t1', 'hex1', '2026-09-05')
    // The failing direct update never reaches the fake (it throws before
    // recording), so the recorded sequence is detour-only.
    const names = fake.calls.map(call => call.name)
    expect(names).toEqual(['move_task', 'update_task', 'move_task'])
    expect(fake.calls[0]?.args).toEqual({ moves: [{ fromProjectId: 'hex1', toProjectId: 'inbox', taskId: 't1' }] })
    expect(fake.calls[2]?.args).toEqual({ moves: [{ fromProjectId: 'inbox', toProjectId: 'hex1', taskId: 't1' }] })
  })

  it('does not detour on a non-crash update failure', async () => {
    const fake = new FakeClient()
    fake.failures.set('update_task', new Error('some other failure'))
    const { service } = makeService(fake)
    await expect(service.setDue('t1', 'hex1', '2026-09-05')).rejects.toMatchObject({ code: 'ticktick/tool-error' })
    expect(fake.calls.map(call => call.name)).toEqual(['update_task'])
  })

  it('lists completed tasks within the window', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    const result = await service.completed('hex1', 30)
    expect(result.tasks).toEqual([{
      id: 't-done', title: 'done task', done: true, projectId: 'hex1', dueDate: null, sortOrder: null,
    }])
    const args = fake.calls.find(call => call.name === 'list_completed_tasks_by_date')?.args as { search: Record<string, unknown> }
    expect(args.search.projectIds).toEqual(['hex1'])
    expect(args.search.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('searches tasks by keyword', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    const result = await service.search('  found  ')
    expect(result.tasks).toEqual([{ id: 't-search', title: 'found task', done: false, projectId: 'hex1', dueDate: null, sortOrder: null }])
    expect(fake.calls.at(-1)?.args).toEqual({ query: 'found' })
  })

  it('batch-creates tasks and trims empty rows', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    const result = await service.batchAdd([
      { title: '  a  ' },
      { title: '   ' },
      { title: 'b', projectId: 'hex1', dueDate: '2026-09-05' },
    ])
    expect(result).toEqual({ created: 2 })
    const args = fake.calls.find(call => call.name === 'batch_add_tasks')?.args as { tasks: unknown[] }
    expect(args.tasks).toEqual([{ title: 'a' }, { title: 'b', projectId: 'hex1', dueDate: '2026-09-05' }])
  })

  it('verifies creations by readback when a lookup tool exists', async () => {
    const fake = new FakeClient()
    fake.tasksByProject.set('inbox1020518753', { content: [] })
    const { service } = makeService(fake)
    const result = await service.add('buy milk')
    expect(result.verifyWarning).toBeNull()
    expect(fake.calls.some(call => call.name === 'get_task_by_id')).toBe(true)
  })

  it('surfaces a readback mismatch warning', async () => {
    const fake = new FakeClient()
    const original = fake.callTool.bind(fake)
    fake.callTool = async (name, args) => {
      if (name === 'get_task_by_id') {
        return { content: [{ type: 'text', text: JSON.stringify({ id: String(args.task_id), title: 'other title', status: 0 }) }] }
      }
      return original(name, args)
    }
    const { service } = makeService(fake)
    const result = await service.add('buy milk')
    expect(result.verifyWarning).toMatch(/mismatch: other title/)
  })

  it('probes the current token with a throwaway client', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    await expect(service.probe()).resolves.toEqual({ ok: true, toolCount: 11, error: null })
  })

  it('reports a probe failure without a token', async () => {
    const { service } = makeService(new FakeClient(), { getToken: () => null })
    await expect(service.probe()).resolves.toEqual({ ok: false, toolCount: 0, error: 'no token configured' })
  })

  it('reorders inbox tasks via update and project tasks via same-project move', async () => {
    const fake = new FakeClient()
    const { service } = makeService(fake)
    await service.reorder('t1', 'inbox', -5)
    await service.reorder('t2', 'hex1', -7)
    expect(fake.calls).toEqual([
      { name: 'update_task', args: { task_id: 't1', task: { sortOrder: -5 } } },
      { name: 'move_task', args: { moves: [{ fromProjectId: 'hex1', toProjectId: 'hex1', taskId: 't2', sortOrder: -7 }] } },
    ])
  })

  it('resets the client after an auth failure so the token is re-read', async () => {
    const fake = new FakeClient()
    const factory = vi.fn(() => fake)
    const ctx = new Context()
    const config: TicktickServiceConfig = {
      getToken: () => 'dp_test',
      mcpUrl: 'https://mcp.dida365.com',
      toolCallTimeoutMs: 5_000,
      protectedTaskIds: Object.freeze([]),
      pins: PINS,
    }
    const service = new TicktickService(ctx, config, factory)
    await service.projects()
    expect(factory).toHaveBeenCalledTimes(1)
    fake.failures.set('list_projects', new Error('HTTP 401 unauthorized'))
    await expect(service.projects()).rejects.toMatchObject({ code: 'ticktick/tool-error' })
    fake.failures.delete('list_projects')
    await service.projects()
    expect(factory).toHaveBeenCalledTimes(2)
  })
})
