/**
 * Drag-reorder math specs (measured TickTick semantics: descending
 * sortOrder; before = target + 1, end = last − 1).
 */

import { describe, expect, it } from 'vitest'
import { sortOrderAtEnd, sortOrderBefore } from '../src/client/order.ts'

describe('sortOrderBefore', () => {
  it('is target.sortOrder + 1', () => {
    expect(sortOrderBefore({ id: 'x', sortOrder: -10 })).toBe(-9)
  })

  it('is null without a target order', () => {
    expect(sortOrderBefore({ id: 'x', sortOrder: null })).toBeNull()
  })
})

describe('sortOrderAtEnd', () => {
  it('is the last known sortOrder − 1', () => {
    expect(sortOrderAtEnd([
      { id: 'a', sortOrder: -2 },
      { id: 'b', sortOrder: -20 },
      { id: 'c', sortOrder: null },
    ])).toBe(-21)
  })

  it('is null for an empty list or an order-less list', () => {
    expect(sortOrderAtEnd([])).toBeNull()
    expect(sortOrderAtEnd([{ id: 'a', sortOrder: null }])).toBeNull()
  })
})
