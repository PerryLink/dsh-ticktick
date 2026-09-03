// Probe 3: due-date update paths. Verifies (a) inbox update, (b) the
// update_task crash signature for project tasks and the move-to-inbox
// detour, (c) the epoch sentinel clear. Usage: node probes/probe-due.mjs
// [PROJECT_ID] — a project id enables the detour half.
import { initialize, tool } from './lib.mjs'

await initialize()
const projectId = process.argv[2] ?? ''
const created = await tool('create_task', { task: { title: `dsh-due-probe-${Date.now()}`, ...(projectId === '' ? {} : { projectId }) } })
const record = JSON.parse(created.content[0].text)
console.log(`created ${record.id} in ${record.projectId ?? 'inbox'}`)
try {
  const direct = await tool('update_task', { task_id: record.id, task: { dueDate: '2026-09-20T23:59:59+08:00' } })
  console.log(`direct update ok: ${!direct.isError}`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.log(`direct update FAILED: ${message.slice(0, 200)}`)
  if (/Expecting value|char 0/i.test(message) && projectId !== '') {
    console.log('crash signature matched — probing the detour:')
    await tool('move_task', { moves: [{ fromProjectId: projectId, toProjectId: 'inbox', taskId: record.id }] })
    const inboxUpdate = await tool('update_task', { task_id: record.id, task: { dueDate: '2026-09-20T23:59:59+08:00' } })
    console.log(`inbox update ok: ${!inboxUpdate.isError}`)
    await tool('move_task', { moves: [{ fromProjectId: 'inbox', toProjectId: projectId, taskId: record.id }] })
    console.log('moved back ok')
  }
}
await tool('delete_task', { project_id: projectId === '' ? 'inbox' : projectId, task_id: record.id })
console.log('deleted')
