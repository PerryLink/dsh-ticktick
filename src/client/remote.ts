/**
 * The client-side Remote face of the `ticktick` namespace: the hand-written
 * `TypertRemoteContribution` mounted through `ctx.remote.$mount`, plus the
 * declaration merging that types `ctx.remote.ticktick`. The descriptor list
 * is shared with the host `./typert` manifest (`../wire.ts`), so the two
 * faces can never drift.
 *
 * @module dsh-ticktick/client/remote
 */

import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { TICKTICK_INVOCATIONS } from '../wire.ts'
import type {
  TicktickAddResult,
  TicktickOkResult,
  TicktickStatus,
  TicktickTasksResult,
} from '../wire.ts'

/** Result of `ticktick/projects`. */
export interface TicktickProjectsResult {
  projects: readonly { id: string, name: string }[]
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteNamespace$ticktick {
    status: () => Promise<RemoteResult<TicktickStatus>>
    projects: () => Promise<RemoteResult<TicktickProjectsResult>>
    tasks: (projectId?: string) => Promise<RemoteResult<TicktickTasksResult>>
    add: (title: string, projectId?: string, dueDate?: string) => Promise<RemoteResult<TicktickAddResult>>
    complete: (id: string, projectId: string) => Promise<RemoteResult<TicktickOkResult>>
    remove: (id: string, projectId: string) => Promise<RemoteResult<TicktickOkResult>>
    setDue: (id: string, projectId: string | undefined, dueDate?: string) => Promise<RemoteResult<TicktickOkResult>>
    reorder: (id: string, projectId: string | undefined, sortOrder: number) => Promise<RemoteResult<TicktickOkResult>>
  }
  interface TypertRemoteMap {
    'ticktick/status': () => Promise<RemoteResult<TicktickStatus>>
    'ticktick/projects': () => Promise<RemoteResult<TicktickProjectsResult>>
    'ticktick/tasks': (projectId?: string) => Promise<RemoteResult<TicktickTasksResult>>
    'ticktick/add': (title: string, projectId?: string, dueDate?: string) => Promise<RemoteResult<TicktickAddResult>>
    'ticktick/complete': (id: string, projectId: string) => Promise<RemoteResult<TicktickOkResult>>
    'ticktick/remove': (id: string, projectId: string) => Promise<RemoteResult<TicktickOkResult>>
    'ticktick/setDue': (id: string, projectId: string | undefined, dueDate?: string) => Promise<RemoteResult<TicktickOkResult>>
    'ticktick/reorder': (id: string, projectId: string | undefined, sortOrder: number) => Promise<RemoteResult<TicktickOkResult>>
  }
  interface TypertRemoteNamespaceMap {
    ticktick: TypertRemoteNamespace$ticktick
  }
}

/** The client Remote contribution for the `ticktick` namespace. */
export const TICKTICK_REMOTE = Object.freeze({
  package: 'dsh-ticktick',
  descriptors: TICKTICK_INVOCATIONS,
}) satisfies TypertRemoteContribution
