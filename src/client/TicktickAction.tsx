/**
 * The TickTick Session-header action: a button that opens the task panel
 * popup. The panel browses lists, filters by list, toggles between undone
 * and completed views, runs full-text search, adds tasks, completes,
 * deletes, sets/clears due dates, and drag-reorders (undone, single-list
 * views only — cross-list ordering has no TickTick semantics). All data
 * flows through the injected {@link TicktickApi}; the panel holds no other
 * RPC.
 *
 * @module dsh-ticktick/client/TicktickAction
 */

import { createElement as h, Fragment, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, ReactElement } from 'react'
import type { TicktickApi } from './api.ts'
import type { TicktickTaskWire } from '../wire.ts'
import { formatDue } from './dates.ts'
import { sortOrderAtEnd, sortOrderBefore } from './order.ts'
import { en, type TicktickLocaleKey } from './locales.ts'

/** Translator face (bound to this plugin's locale namespace by the renderer). */
export type TicktickTranslator = (key: TicktickLocaleKey) => string

/** Props the header-actions slot injects. */
export interface TicktickActionInjected {
  api: TicktickApi
  /** Write the API token into the settings namespace (one-step panel setup). */
  setToken: (token: string) => Promise<void>
  t?: TicktickTranslator
}

/** One project for the filter dropdown. */
interface ProjectOption {
  id: string
  name: string
}

/** All lists sentinel. */
const ALL = '__all__'

/** Panel view modes. */
type ViewMode = 'undone' | 'completed'

/**
 * The header action component: button + popup panel.
 * @param props - injected api and optional translator.
 */
export function TicktickAction(props: TicktickActionInjected): ReactElement {
  const { api, setToken } = props
  const t: TicktickTranslator = props.t ?? (key => en[key])
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<readonly ProjectOption[]>([])
  const [tasks, setTasks] = useState<readonly TicktickTaskWire[]>([])
  const [warnings, setWarnings] = useState<readonly string[]>([])
  const [selected, setSelected] = useState<string>(ALL)
  const [viewMode, setViewMode] = useState<ViewMode>('undone')
  const [searchQuery, setSearchQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addTitle, setAddTitle] = useState('')
  const [addDue, setAddDue] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [status, setStatus] = useState<{ configured: boolean, connected: boolean } | null>(null)
  const [tokenInput, setTokenInput] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  const searching = searchQuery.trim() !== ''
  const singleList = selected !== ALL
  const editable = !searching && viewMode === 'undone'

  const projectName = (id: string | null): string => {
    if (id === null) return '?'
    return projects.find(project => project.id === id)?.name ?? id
  }

  const refreshStatus = async (): Promise<void> => {
    try {
      const current = await api.status()
      setStatus({ configured: current.configured, connected: current.connected })
    } catch {
      setStatus({ configured: false, connected: false })
    }
  }

  const saveToken = async (): Promise<void> => {
    const token = tokenInput.trim()
    if (token === '') return
    setBusy(true)
    setError(null)
    try {
      await setToken(token)
      setTokenInput('')
      await refreshStatus()
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const load = async (): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      const projectId = selected === ALL ? undefined : selected
      let taskResult
      if (searching) {
        taskResult = await api.search(searchQuery.trim())
      } else if (viewMode === 'completed') {
        taskResult = await api.completed(projectId, 30)
      } else {
        taskResult = await api.tasks(projectId)
      }
      const projectResult = await api.projects()
      setProjects(projectResult.projects)
      setTasks(taskResult.tasks)
      setWarnings(taskResult.warnings)
    } catch (cause) {
      // The inline token setup explains the unconfigured state; keep other
      // failures visible.
      if (!/no-token|no token/i.test(cause instanceof Error ? cause.message : String(cause))) {
        setError(cause instanceof Error ? cause.message : String(cause))
      }
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!open) return
    void load()
    void refreshStatus()
    const onPointerDown = (event: MouseEvent): void => {
      if (panelRef.current !== null && event.target instanceof Node && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- user actions reload explicitly.
  }, [open])

  const selectProject = async (value: string): Promise<void> => {
    setSelected(value)
    await load()
  }

  const switchView = async (mode: ViewMode): Promise<void> => {
    setViewMode(mode)
    setSearchQuery('')
    await load()
  }

  const runSearch = async (query: string): Promise<void> => {
    setSearchQuery(query)
    if (query.trim() === '') {
      await load()
      return
    }
    setBusy(true)
    setError(null)
    try {
      const result = await api.search(query.trim())
      setTasks(result.tasks)
      setWarnings(result.warnings)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const submitAdd = async (): Promise<void> => {
    const title = addTitle.trim()
    if (title === '') return
    setBusy(true)
    setError(null)
    try {
      await api.add(title, selected === ALL ? undefined : selected, addDue === '' ? undefined : addDue)
      setAddTitle('')
      setAddDue('')
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const runTask = async (action: () => Promise<void>): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      await action()
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const completeTask = (task: TicktickTaskWire): Promise<void> => runTask(async () => {
    await api.complete(task.id, task.projectId ?? '')
  })

  const removeTask = (task: TicktickTaskWire): Promise<void> => runTask(async () => {
    if (!window.confirm(t('confirmDelete'))) return
    await api.remove(task.id, task.projectId ?? '')
  })

  const applyDue = (task: TicktickTaskWire, value: string): Promise<void> => runTask(async () => {
    await api.setDue(task.id, task.projectId ?? undefined, value === '' ? undefined : value)
  })

  const clearDue = (task: TicktickTaskWire): Promise<void> => runTask(async () => {
    await api.setDue(task.id, task.projectId ?? undefined)
  })

  const dropOnTask = (target: TicktickTaskWire): Promise<void> => {
    if (draggingId === null || draggingId === target.id) return Promise.resolve()
    const order = sortOrderBefore(target)
    if (order === null) return Promise.resolve()
    return runTask(async () => {
      await api.reorder(draggingId, target.projectId ?? undefined, order)
    }).then(() => { setDraggingId(null) })
  }

  const dropAtEnd = (): Promise<void> => {
    if (draggingId === null) return Promise.resolve()
    const order = sortOrderAtEnd(tasks)
    if (order === null) return Promise.resolve()
    const dragged = tasks.find(task => task.id === draggingId)
    return runTask(async () => {
      await api.reorder(draggingId, dragged?.projectId ?? undefined, order)
    }).then(() => { setDraggingId(null) })
  }

  const viewToggle = (mode: ViewMode, label: string): ReactElement =>
    h('button', {
      className: 'tkt-iconbtn',
      type: 'button',
      disabled: busy,
      style: viewMode === mode ? { fontWeight: 600, textDecoration: 'underline' } : undefined,
      onClick: () => { void switchView(mode) },
    }, label)

  return h('div', { className: 'tkt-anchor' },
    h('button', { className: 'tkt-button', type: 'button', title: t('open'), onClick: () => { setOpen(!open) } },
      h('span', null, '☑'),
      h('span', null, t('title'))),
    open && h('div', { className: 'tkt-panel', ref: panelRef },
      h('div', { className: 'tkt-row', style: { gap: '6px' } },
        h('select', { className: 'tkt-select', value: selected, disabled: busy, onChange: (event: ChangeEvent<HTMLSelectElement>) => { void selectProject(event.target.value) } },
          h('option', { value: ALL }, t('allLists')),
          projects.map(project => h('option', { key: project.id, value: project.id }, project.name))),
        viewToggle('undone', t('viewUndone')),
        viewToggle('completed', t('viewCompleted')),
        h('button', { className: 'tkt-iconbtn', type: 'button', title: t('refresh'), disabled: busy, onClick: () => { void load() } }, '↻'),
        status !== null && h('span', {
          className: `tkt-chip ${status.configured ? (status.connected ? 'today' : 'overdue') : 'later'}`,
          title: status.configured ? (status.connected ? t('statusConnected') : t('statusNotConnected')) : t('statusUnconfigured'),
        }, '●')),
      h('div', { className: 'tkt-row', style: { gap: '6px' } },
        h('input', {
          className: 'tkt-input',
          placeholder: t('searchPlaceholder'),
          value: searchQuery,
          onChange: (event: ChangeEvent<HTMLInputElement>) => { void runSearch(event.target.value) },
        })),
      status?.configured === false && h('div', { className: 'tkt-warning', style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        h('div', null, t('panelTokenHint')),
        h('div', { style: { display: 'flex', gap: '6px' } },
          h('input', {
            className: 'tkt-input',
            type: 'password',
            placeholder: t('panelTokenPlaceholder'),
            value: tokenInput,
            onChange: (event: ChangeEvent<HTMLInputElement>) => { setTokenInput(event.target.value) },
            onKeyDown: event => { if (event.key === 'Enter') void saveToken() },
          }),
          h('button', { className: 'tkt-iconbtn', type: 'button', disabled: busy || tokenInput.trim() === '', onClick: () => { void saveToken() } }, t('panelTokenSave')))),
      editable && h('div', { className: 'tkt-row', style: { gap: '6px' } },
        h('input', {
          className: 'tkt-input',
          placeholder: t('addPlaceholder'),
          value: addTitle,
          onChange: (event: ChangeEvent<HTMLInputElement>) => { setAddTitle(event.target.value) },
          onKeyDown: event => { if (event.key === 'Enter') void submitAdd() },
        }),
        h('input', {
          className: 'tkt-date',
          type: 'date',
          value: addDue,
          onChange: (event: ChangeEvent<HTMLInputElement>) => { setAddDue(event.target.value) },
        }),
        h('button', { className: 'tkt-iconbtn', type: 'button', disabled: busy || addTitle.trim() === '', onClick: () => { void submitAdd() } }, t('add'))),
      error !== null && h('div', { className: 'tkt-error' }, t('loadError') + error),
      warnings.map(warning => h('div', { key: warning, className: 'tkt-warning' }, `${t('warning')}: ${warning}`)),
      tasks.length === 0 && !busy && h('div', { className: 'tkt-warning' }, searching ? t('searchEmpty') : t('empty')),
      h('div', { className: 'tkt-list' },
        tasks.map(task => {
          const due = formatDue(task.dueDate)
          const chipClass = due.kind === 'none' ? 'later' : due.kind
          return h('div', {
            key: task.id,
            className: `tkt-row${draggingId === task.id ? ' dragging' : ''}`,
            draggable: editable && singleList && !busy,
            onDragStart: () => { setDraggingId(task.id) },
            onDragOver: (event: DragEvent<HTMLDivElement>) => { event.preventDefault() },
            onDrop: (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); void dropOnTask(task) },
          },
            h('input', {
              type: 'checkbox',
              checked: task.done,
              disabled: busy || !editable,
              onChange: () => { void completeTask(task) },
              title: t('complete'),
            }),
            h('span', { className: `tkt-title${task.done ? ' done' : ''}`, title: task.title }, task.title),
            due.kind !== 'none' && h('span', { className: `tkt-chip ${chipClass}` }, due.text),
            !singleList && h('span', { className: 'tkt-chip later' }, projectName(task.projectId)),
            h(Fragment, { key: 'controls' },
              editable && h('input', {
                className: 'tkt-date',
                type: 'date',
                value: task.dueDate === null ? '' : task.dueDate.slice(0, 10),
                disabled: busy,
                onChange: (event: ChangeEvent<HTMLInputElement>) => { void applyDue(task, event.target.value) },
                title: t('setDue'),
              }),
              editable && task.dueDate !== null && h('button', {
                className: 'tkt-iconbtn',
                type: 'button',
                title: t('clearDue'),
                disabled: busy,
                onClick: () => { void clearDue(task) },
              }, '✕'),
              h('button', {
                className: 'tkt-iconbtn',
                type: 'button',
                title: t('delete'),
                disabled: busy,
                onClick: () => { void removeTask(task) },
              }, '🗑')),
          )
        })),
      editable && singleList && tasks.length > 0 && h('div', {
        className: 'tkt-row',
        style: { minHeight: '14px', borderBottom: 'none' },
        onDragOver: (event: DragEvent<HTMLDivElement>) => { event.preventDefault() },
        onDrop: (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); void dropAtEnd() },
      })),
  )
}
