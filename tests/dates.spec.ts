/**
 * Due-date presentation specs: today / tomorrow / overdue / date-only keys.
 */

import { describe, expect, it } from 'vitest'
import { dateKey, formatDue, todayKey, tomorrowKey } from '../src/client/dates.ts'

/** A fixed local "now" (2026-09-03 noon local). */
const NOW = new Date(2026, 8, 3, 12, 0, 0).getTime()

describe('dateKey', () => {
  it('renders zero-padded local keys', () => {
    expect(dateKey(new Date(2026, 8, 3))).toBe('2026-09-03')
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('todayKey / tomorrowKey', () => {
  it('are one local day apart', () => {
    expect(todayKey()).not.toBe(tomorrowKey())
  })
})

describe('formatDue', () => {
  it('labels today, tomorrow, overdue, and later dates', () => {
    expect(formatDue('2026-09-03T23:59:59+08:00', NOW)).toMatchObject({ kind: 'today', text: 'today' })
    expect(formatDue('2026-09-04', NOW)).toMatchObject({ kind: 'tomorrow', text: 'tomorrow' })
    expect(formatDue('2026-08-20', NOW)).toMatchObject({ kind: 'overdue' })
    expect(formatDue('2026-12-01', NOW)).toMatchObject({ kind: 'later', text: '2026-12-01' })
  })

  it('handles a missing due date', () => {
    expect(formatDue(null, NOW)).toMatchObject({ kind: 'none', text: '' })
    expect(formatDue('', NOW)).toMatchObject({ kind: 'none' })
  })
})
