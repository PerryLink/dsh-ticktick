/**
 * Scoped stylesheet for the TickTick panel. Standalone bundles cannot use
 * the in-repo CSS-module pipeline, so one inline <style> element carries the
 * panel's scoped classes (tkt-* prefix).
 *
 * @module dsh-ticktick/client/styles
 */

const TICKTICK_CSS = `
.tkt-anchor { position: relative; }
.tkt-button { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
.tkt-panel {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 1000;
  width: 320px; max-height: 70vh; overflow: auto;
  background: var(--ds-color-bg-elevated, #fff); color: var(--ds-color-text, #222);
  border: 1px solid var(--ds-color-border, #d0d0d0); border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,.15); padding: 10px; font-size: 13px;
}
.tkt-row { display: flex; align-items: center; gap: 8px; padding: 6px 2px; border-bottom: 1px solid var(--ds-color-border-subtle, #eee); }
.tkt-row.dragging { opacity: .45; }
.tkt-title { flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tkt-title.done { text-decoration: line-through; opacity: .6; }
.tkt-chip { font-size: 11px; padding: 1px 6px; border-radius: 8px; white-space: nowrap; }
.tkt-chip.today { background: #e3f2fd; color: #1565c0; }
.tkt-chip.tomorrow { background: #e8f5e9; color: #2e7d32; }
.tkt-chip.overdue { background: #ffebee; color: #c62828; }
.tkt-chip.later { background: #f5f5f5; color: #616161; }
.tkt-list { background: var(--ds-color-bg-elevated, #fff); }
.tkt-input { width: 100%; box-sizing: border-box; padding: 6px 8px; border: 1px solid var(--ds-color-border, #d0d0d0); border-radius: 6px; }
.tkt-select { padding: 4px 6px; border: 1px solid var(--ds-color-border, #d0d0d0); border-radius: 6px; }
.tkt-warning { margin: 6px 0; padding: 6px 8px; background: #fff8e1; color: #8d6e63; border-radius: 6px; font-size: 12px; }
.tkt-error { margin: 6px 0; padding: 6px 8px; background: #ffebee; color: #c62828; border-radius: 6px; font-size: 12px; }
.tkt-iconbtn { border: none; background: transparent; cursor: pointer; padding: 2px 4px; font-size: 13px; color: var(--ds-color-text-subtle, #666); }
.tkt-iconbtn:hover { color: var(--ds-color-text, #222); }
.tkt-date { border: 1px solid var(--ds-color-border, #d0d0d0); border-radius: 6px; font-size: 12px; padding: 2px 4px; }
`

/**
 * Install the scoped stylesheet once per plugin fiber.
 * @returns the effect disposer that removes the style element.
 */
export function installPanelStyles(): () => void {
  const style = document.createElement('style')
  style.setAttribute('data-dsh-ticktick', '')
  style.textContent = TICKTICK_CSS
  document.head.appendChild(style)
  return () => { style.remove() }
}
