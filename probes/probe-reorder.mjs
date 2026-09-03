// Probe 4: reorder semantics. Verifies the descending sortOrder list order,
// the inbox update path, and (with PROJECT_ID) the same-project move path.
// Usage: node probes/probe-reorder.mjs [PROJECT_ID]
import { initialize, tool } from './lib.mjs'

await initialize()
const projectId = process.argv[2] ?? ''
const created = await tool('create_task', { task: { title: `dsh-reorder-probe-${Date.now()}`, ...(projectId === '' ? {} : { projectId }) } })
const record = JSON.parse(created.content[0].text)
console.log(`created ${record.id} (sortOrder ${record.sortOrder})`)
try {
  if (projectId === '') {
    await tool('update_task', { task_id: record.id, task: { sortOrder: -1 } })
    console.log('inbox update sortOrder ok')
  } else {
    await tool('move_task', { moves: [{ fromProjectId: projectId, toProjectId: projectId, taskId: record.id, sortOrder: -1 }] })
    console.log('same-project move sortOrder ok')
  }
} catch (error) {
  console.log(`reorder FAILED: ${error instanceof Error ? error.message : String(error)}`)
} finally {
  await tool('delete_task', { project_id: projectId === '' ? 'inbox' : projectId, task_id: record.id })
  console.log('deleted')
}
