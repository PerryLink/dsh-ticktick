// Probe 5: query-tool contract discovery for the P2 backlog — completed
// tasks by date and undone tasks by time query. Prints each tool's raw
// result shape (no mutation). Feeds the future completed-view and search
// features once their wire contracts are confirmed.
import { initialize, tool } from './lib.mjs'

await initialize()
for (const [name, args] of [
  ['list_undone_tasks_by_time_query', { query_command: 'today' }],
  ['list_completed_tasks_by_date', { date: new Date().toISOString().slice(0, 10) }],
]) {
  try {
    const result = await tool(name, args)
    console.log(`${name}: ${JSON.stringify(result).slice(0, 500)}`)
  } catch (error) {
    console.log(`${name} FAILED: ${error instanceof Error ? error.message : String(error)}`)
  }
}
