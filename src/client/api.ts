/**
 * The TickTick panel API face the widget receives: typed wrappers over the
 * `remote.ticktick` namespace that unwrap `RemoteResult` and throw the
 * RemoteError for a failed invocation.
 *
 * @module dsh-ticktick/client/api
 */

import type { Context } from '@deepseek-ai/cordis'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { TicktickAddResult, TicktickStatus, TicktickTasksResult } from '../wire.ts'
import type { TicktickBatchAddRow, TicktickProjectsResult } from './remote.ts'

/** Widget-facing data contract (injected into the header action). */
export interface TicktickApi {
  status(): Promise<TicktickStatus>
  projects(): Promise<TicktickProjectsResult>
  tasks(projectId?: string): Promise<TicktickTasksResult>
  add(title: string, projectId?: string, dueDate?: string): Promise<TicktickAddResult>
  complete(id: string, projectId: string): Promise<void>
  remove(id: string, projectId: string): Promise<void>
  setDue(id: string, projectId: string | undefined, dueDate?: string): Promise<void>
  reorder(id: string, projectId: string | undefined, sortOrder: number): Promise<void>
  completed(projectId?: string, days?: number): Promise<TicktickTasksResult>
  search(query: string): Promise<TicktickTasksResult>
  batchAdd(tasks: readonly TicktickBatchAddRow[]): Promise<{ created: number }>
}

/**
 * Build the widget API over a scope carrying `remote.ticktick`.
 * @param scope - client scope with the mounted Remote namespace.
 * @returns the typed API.
 */
export function createTicktickApi(scope: Context): TicktickApi {
  const unwrap = <T>(result: RemoteResult<T>, method: string): T => {
    if (!result.ok) {
      throw new Error(`ticktick.${method} failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  return {
    status: async () => unwrap(await scope.remote.ticktick.status(), 'status'),
    projects: async () => unwrap(await scope.remote.ticktick.projects(), 'projects'),
    tasks: async (projectId) => unwrap(await scope.remote.ticktick.tasks(projectId), 'tasks'),
    add: async (title, projectId, dueDate) => unwrap(await scope.remote.ticktick.add(title, projectId, dueDate), 'add'),
    complete: async (id, projectId) => { unwrap(await scope.remote.ticktick.complete(id, projectId), 'complete') },
    remove: async (id, projectId) => { unwrap(await scope.remote.ticktick.remove(id, projectId), 'remove') },
    setDue: async (id, projectId, dueDate) => { unwrap(await scope.remote.ticktick.setDue(id, projectId, dueDate), 'setDue') },
    reorder: async (id, projectId, sortOrder) => { unwrap(await scope.remote.ticktick.reorder(id, projectId, sortOrder), 'reorder') },
    completed: async (projectId, days) => unwrap(await scope.remote.ticktick.completed(projectId, days), 'completed'),
    search: async (query) => unwrap(await scope.remote.ticktick.search(query), 'search'),
    batchAdd: async (tasks) => unwrap(await scope.remote.ticktick.batchAdd([...tasks]), 'batchAdd'),
  }
}
