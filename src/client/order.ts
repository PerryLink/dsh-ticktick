/**
 * Drag-reorder math. Measured TickTick semantics: lists order by DESCENDING
 * sortOrder. "Place before target" = target.sortOrder + 1; "place at end" =
 * current last.sortOrder − 1.
 *
 * @module dsh-ticktick/client/order
 */

/** A task row with the fields the math reads. */
export interface SortableRow {
  readonly id: string
  readonly sortOrder: number | null
}

/**
 * The sortOrder that places `dragged` immediately before `target`.
 * @param target - the row the dragged task is dropped onto.
 * @returns the new sortOrder, or `null` when the target carries none.
 */
export function sortOrderBefore(target: SortableRow): number | null {
  if (target.sortOrder === null) return null
  return target.sortOrder + 1
}

/**
 * The sortOrder that places a task at the list end (below the current last).
 * @param rows - the visible list, ordered top to bottom.
 * @returns the new sortOrder, or `null` when the list is empty or lacks orders.
 */
export function sortOrderAtEnd(rows: readonly SortableRow[]): number | null {
  let last: SortableRow | undefined
  for (const row of rows) {
    if (row.sortOrder !== null) last = row
  }
  if (last === undefined || last.sortOrder === null) return null
  return last.sortOrder - 1
}
