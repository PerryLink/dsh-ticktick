/**
 * Domain-layer specs: tool-name resolution and task/project normalization
 * over the measured TickTick MCP wire shapes.
 */

import { describe, expect, it } from 'vitest'
import { isInboxProject, normalizeProjects, normalizeTasks, resolveTools } from '../src/domain.ts'
import type { McpTool } from '../src/mcp.ts'
import type { ToolPins } from '../src/config.ts'

const NO_PINS: ToolPins = Object.freeze({
  projects: '', tasks: '', create: '', complete: '', remove: '', update: '', move: '',
  completed: '', search: '', getTask: '', batchAdd: '',
})

const TOOLS: readonly McpTool[] = [
  { name: 'list_projects' },
  { name: 'get_project_with_undone_tasks' },
  { name: 'create_task' },
  { name: 'complete_task' },
  { name: 'delete_task' },
  { name: 'update_task' },
  { name: 'move_task' },
  { name: 'search' },
  { name: 'search_task' },
  { name: 'list_completed_tasks_by_date' },
  { name: 'get_task_by_id' },
  { name: 'batch_add_tasks' },
  { name: 'get_task_in_project' },
]

describe('resolveTools', () => {
  it('resolves the eleven operations by pattern', () => {
    expect(resolveTools(TOOLS, NO_PINS)).toEqual({
      projects: 'list_projects',
      tasks: 'get_project_with_undone_tasks',
      create: 'create_task',
      complete: 'complete_task',
      remove: 'delete_task',
      update: 'update_task',
      move: 'move_task',
      completed: 'list_completed_tasks_by_date',
      search: 'search',
      getTask: 'get_task_by_id',
      batchAdd: 'batch_add_tasks',
    })
  })

  it('honors advertised pins over patterns', () => {
    const pins: ToolPins = { ...NO_PINS, create: 'create_task', remove: 'delete_task' }
    expect(resolveTools(TOOLS, pins).create).toBe('create_task')
  })

  it('keeps an unadvertised pin as the last resort when nothing matches', () => {
    const pins: ToolPins = { ...NO_PINS, tasks: 'my_custom_tasks' }
    const noTaskTools = TOOLS.filter(tool => tool.name !== 'get_project_with_undone_tasks')
    expect(resolveTools(noTaskTools, pins).tasks).toBe('my_custom_tasks')
  })

  it('returns an empty name when nothing matches', () => {
    expect(resolveTools([], NO_PINS).projects).toBe('')
  })
})

describe('normalizeProjects', () => {
  it('parses JSON text blocks into id/name pairs', () => {
    const projects = normalizeProjects({
      content: [{ type: 'text', text: JSON.stringify([{ id: 'a', name: 'Work' }, { id: 'inbox', name: 'Inbox' }]) }],
    })
    expect(projects).toEqual([{ id: 'a', name: 'Work' }, { id: 'inbox', name: 'Inbox' }])
  })

  it('skips non-JSON blocks and dedupes ids', () => {
    const projects = normalizeProjects({
      content: [
        { type: 'text', text: 'not json' },
        { type: 'text', text: JSON.stringify({ id: 'a', name: 'Work' }) },
        { type: 'text', text: JSON.stringify({ id: 'a', name: 'Work' }) },
      ],
    })
    expect(projects).toHaveLength(1)
  })
})

describe('normalizeTasks', () => {
  it('reads tasks from structuredContent', () => {
    const tasks = normalizeTasks({
      structuredContent: {
        tasks: [{ id: 't1', title: 'buy milk', status: 0, projectId: 'p1', dueDate: '2026-09-05', sortOrder: -10 }],
      },
    })
    expect(tasks).toEqual([{ id: 't1', title: 'buy milk', done: false, projectId: 'p1', dueDate: '2026-09-05', sortOrder: -10 }])
  })

  it('reads tasks from text JSON blocks and dedupes', () => {
    const tasks = normalizeTasks({
      content: [
        { type: 'text', text: JSON.stringify([{ id: 't1', title: 'a' }, { id: 't1', title: 'a' }]) },
        { type: 'text', text: 'plain prose' },
      ],
    })
    expect(tasks).toEqual([{ id: 't1', title: 'a', done: false }])
  })

  it('marks done tasks from status 2 and drops id-less rows', () => {
    const tasks = normalizeTasks({
      structuredContent: [{ id: 'done', title: 'x', status: 2 }, { title: 'no id' }],
    })
    expect(tasks).toEqual([{ id: 'done', title: 'x', done: true }])
  })
})

describe('isInboxProject', () => {
  it('recognizes inbox ids and plain hex ids', () => {
    expect(isInboxProject('inbox')).toBe(true)
    expect(isInboxProject('inbox1020518753')).toBe(true)
    expect(isInboxProject('62132e4a06b26d39499c83fd')).toBe(false)
  })
})
