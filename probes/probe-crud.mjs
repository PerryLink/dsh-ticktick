// Probe 2: CRUD round trip in the Inbox — create, read back, complete,
// delete. Verifies the wire argument shapes the service drives.
import { initialize, tool } from './lib.mjs'

await initialize()
const created = await tool('create_task', { task: { title: `dsh-probe-${Date.now()}` } })
const record = JSON.parse(created.content[0].text)
console.log(`created ${record.id} in ${record.projectId}`)
try {
  const completed = await tool('complete_task', { project_id: record.projectId ?? 'inbox', task_id: record.id })
  console.log('complete_task ok:', !completed.isError)
} finally {
  await tool('delete_task', { project_id: record.projectId ?? 'inbox', task_id: record.id })
  console.log('deleted')
}
