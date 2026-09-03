/**
 * Due-date presentation helpers: today / tomorrow / overdue / "M月D日"
 * (locale-neutral date formatting) plus the ISO date-only string sent to
 * the bridge for date-picker values.
 *
 * @module dsh-ticktick/client/dates
 */

/** Presentation of one due date: the label plus its urgency kind. */
export interface DueLabel {
  readonly text: string
  readonly kind: 'overdue' | 'today' | 'tomorrow' | 'later' | 'none'
}

/** Zero-pad a number to two digits. */
function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Local date key (YYYY-MM-DD) for a Date. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Local date key for today. */
export function todayKey(): string {
  return dateKey(new Date())
}

/** Local date key for tomorrow. */
export function tomorrowKey(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return dateKey(tomorrow)
}

/** Parse the date-only prefix of an ISO due date as a local date key. */
function keyOfIso(dueDate: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dueDate)
  if (match === null) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

/**
 * Format one ISO due date against today.
 * @param dueDate - ISO date or date-time; `null`/empty = no due date.
 * @param now - optional clock injection for tests (epoch ms).
 * @returns the presentation.
 */
export function formatDue(dueDate: string | null, now: number = Date.now()): DueLabel {
  if (dueDate === null || dueDate === '') return { text: '', kind: 'none' }
  const key = keyOfIso(dueDate)
  if (key === null) return { text: dueDate.slice(0, 10), kind: 'later' }
  const today = dateKey(new Date(now))
  if (key === today) return { text: 'today', kind: 'today' }
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (key === dateKey(tomorrow)) return { text: 'tomorrow', kind: 'tomorrow' }
  if (key < today) return { text: key, kind: 'overdue' }
  return { text: key, kind: 'later' }
}
