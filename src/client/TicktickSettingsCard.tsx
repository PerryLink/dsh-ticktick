/**
 * The TickTick configuration page for the Plugins page. The host renders it
 * on this plugin's row through `plugins.row.config` in two views: `summary`
 * (the row's one-liner) and `page` (the form with its own save control).
 *
 * The page owner supplies `form` — the Host-owned values and write actions
 * for the `ticktick` profile entry — and this component owns only its staged
 * input. Writes are path-addressed (`form.mutate`), so a save never restates
 * a field the page cannot see: the Host redacts `role('secret')` fields out of
 * `form.state.value`, and a wholesale replace rebuilt from a redacted document
 * would silently delete the stored token.
 *
 * The card holds no state beyond its staged form and the probe result.
 *
 * @module dsh-ticktick/client/TicktickSettingsCard
 */

import { createElement as h, useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { TicktickForm, TicktickSecretView } from './config-form.ts'
import { en, type TicktickLocaleKey } from './locales.ts'
import type { TicktickProbeResult } from '../wire.ts'

/** Translator face (bound to this plugin's locale namespace by the renderer). */
export type TicktickSettingsTranslator = (key: TicktickLocaleKey) => string

/** Props the configuration slot injects: this plugin's own face. */
export interface TicktickSettingsCardInjected {
  probe: () => Promise<TicktickProbeResult>
  t?: TicktickSettingsTranslator
}

/** Full card props: the injected face, the page owner's form, and the view. */
export type TicktickSettingsCardProps = TicktickSettingsCardInjected & {
  /** `summary` renders the one-liner; `page` renders the form. */
  view: 'summary' | 'page'
  /**
   * Host-owned values and write actions for this page's entry, supplied by the
   * Plugins page as a render prop. Absent while the Host serves no form for
   * the entry, or when a composing deployment renders the card without one.
   */
  form?: TicktickForm | undefined
}

/** Staged form values (strings only; the save writes the typed values). */
interface FormState {
  token: string
  tokenFile: string
  mcpUrl: string
  protectedTaskIds: string
}

/** The `role('secret')` slot this page fills, as the Host reports its state. */
const TOKEN_SECRET = 'token'

/**
 * Whether the stored token is configured. The secret's VALUE never reaches the
 * browser: `form.state.value` omits it and `form.state.secrets` reports only
 * whether the slot holds anything.
 * @param secrets - schema-declared secret slots from the form snapshot.
 * @returns whether the token slot is filled.
 */
function tokenConfigured(secrets: readonly TicktickSecretView[]): boolean {
  return secrets.some(secret => secret.path.length === 1 && secret.path[0] === TOKEN_SECRET && secret.set)
}

/**
 * The plugin configuration page: token (secret), token file, endpoint, and
 * protected ids, staged locally and written as one atomic mutation on Save.
 * @param props - the page owner's form, the probe, and the view.
 */
export function TicktickSettingsCard(props: TicktickSettingsCardProps): React.ReactElement {
  const { probe, view, form } = props
  const t: TicktickSettingsTranslator = props.t ?? (key => en[key])
  const [staged, setStaged] = useState<FormState>({ token: '', tokenFile: '', mcpUrl: '', protectedTaskIds: '' })
  const [saved, setSaved] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [probeResult, setProbeResult] = useState<TicktickProbeResult | null>(null)
  const [probing, setProbing] = useState(false)

  const snapshot = form?.getSnapshot()

  // Re-seed the staged fields from every accepted Host value, leaving the
  // secret input alone: the Host never returns it, so clearing the box the
  // user is typing in would lose the edit.
  useEffect(() => {
    if (form === undefined) return undefined
    const sync = (): void => {
      const next = form.getSnapshot().value
      setStaged(current => ({
        token: current.token,
        tokenFile: typeof next?.tokenFile === 'string' ? next.tokenFile : '',
        mcpUrl: typeof next?.mcpUrl === 'string' ? next.mcpUrl : '',
        protectedTaskIds: Array.isArray(next?.protectedTaskIds) ? next.protectedTaskIds.join(', ') : '',
      }))
    }
    sync()
    return form.subscribe(sync)
  }, [form])

  if (view === 'summary') {
    const configured = tokenConfigured(snapshot?.secrets ?? [])
    return h('span', { style: { fontSize: '12px', color: configured ? '#2e7d32' : '#888' } },
      configured ? t('settingsSummaryConfigured') : t('settingsSummaryUnconfigured'))
  }

  if (form === undefined) {
    return h('div', { style: { padding: '10px 0', fontSize: '12px', color: '#888' } }, t('settingsUnavailable'))
  }

  const save = async (): Promise<void> => {
    setError(null)
    setSaved(false)
    setCleared(false)
    try {
      const token = staged.token.trim()
      const accepted = await form.mutate([
        // An untouched secret box means "keep"; the stored token rides no read.
        ...(token !== '' ? [{ op: 'set' as const, path: [TOKEN_SECRET], value: token }] : []),
        { op: 'set' as const, path: ['tokenFile'], value: staged.tokenFile.trim() },
        { op: 'set' as const, path: ['mcpUrl'], value: staged.mcpUrl.trim() },
        {
          op: 'set' as const,
          path: ['protectedTaskIds'],
          value: staged.protectedTaskIds.split(',').map(id => id.trim()).filter(id => id !== ''),
        },
      ])
      if (!accepted) {
        setError(t('settingsRejected'))
        return
      }
      setStaged(current => ({ ...current, token: '' }))
      setSaved(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  const test = async (): Promise<void> => {
    setProbing(true)
    setProbeResult(null)
    setError(null)
    try {
      const result = await probe()
      setProbeResult(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setProbing(false)
    }
  }

  const clear = async (): Promise<void> => {
    setError(null)
    setSaved(false)
    try {
      const accepted = await form.mutate([
        { op: 'unset', path: [TOKEN_SECRET] },
        { op: 'unset', path: ['tokenFile'] },
      ])
      if (!accepted) {
        setError(t('settingsRejected'))
        return
      }
      setStaged(current => ({ ...current, token: '', tokenFile: '' }))
      setCleared(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  const field = (key: keyof FormState, label: string, hint: string, type = 'text', placeholder = ''): React.ReactElement =>
    h('div', { style: { marginBottom: '8px' } },
      h('label', { style: { display: 'block', fontSize: '12px', marginBottom: '3px' } }, label),
      h('input', {
        type,
        placeholder,
        style: { width: '100%', boxSizing: 'border-box', padding: '5px 7px', borderRadius: '5px', border: '1px solid #ccc' },
        value: staged[key],
        onChange: (event: ChangeEvent<HTMLInputElement>) => { setStaged({ ...staged, [key]: event.target.value }) },
      }),
      h('div', { style: { fontSize: '11px', color: '#888', marginTop: '2px' } }, hint))

  const presetOf = (url: string): 'cn' | 'intl' | 'custom' => {
    if (url === 'https://mcp.dida365.com') return 'cn'
    if (url === 'https://mcp.ticktick.com') return 'intl'
    return 'custom'
  }

  const endpointField = h('div', { style: { marginBottom: '8px' } },
    h('label', { style: { display: 'block', fontSize: '12px', marginBottom: '3px' } }, t('endpointPreset')),
    h('select', {
      style: { width: '100%', boxSizing: 'border-box', padding: '5px 7px', borderRadius: '5px', border: '1px solid #ccc' },
      value: presetOf(staged.mcpUrl),
      onChange: (event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value === 'cn') setStaged({ ...staged, mcpUrl: 'https://mcp.dida365.com' })
        else if (event.target.value === 'intl') setStaged({ ...staged, mcpUrl: 'https://mcp.ticktick.com' })
      },
    },
      h('option', { value: 'cn' }, t('endpointCn')),
      h('option', { value: 'intl' }, t('endpointIntl')),
      h('option', { value: 'custom' }, t('endpointCustom'))),
    h('input', {
      type: 'text',
      style: { width: '100%', boxSizing: 'border-box', padding: '5px 7px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '4px' },
      value: staged.mcpUrl,
      onChange: (event: ChangeEvent<HTMLInputElement>) => { setStaged({ ...staged, mcpUrl: event.target.value }) },
    }),
    h('div', { style: { fontSize: '11px', color: '#888', marginTop: '2px' } }, t('settingsMcpUrlHint')))

  const buttonStyle = { padding: '6px 14px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', background: '#f5f5f5' }

  return h('div', { style: { padding: '10px 0' } },
    h('div', { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' } }, t('settingsName')),
    field('token', tokenConfigured(snapshot?.secrets ?? []) ? t('settingsTokenStored') : t('settingsToken'), t('settingsTokenHint'), 'password'),
    field('tokenFile', t('settingsTokenFile'), t('settingsTokenFileHint')),
    endpointField,
    field('protectedTaskIds', t('settingsProtected'), t('settingsProtectedHint')),
    error !== null && h('div', { style: { color: '#c62828', fontSize: '12px', margin: '6px 0' } }, error),
    saved && h('div', { style: { color: '#2e7d32', fontSize: '12px', margin: '6px 0' } }, t('settingsSaved')),
    cleared && h('div', { style: { color: '#2e7d32', fontSize: '12px', margin: '6px 0' } }, t('settingsCleared')),
    probeResult !== null && h('div', {
      style: { color: probeResult.ok ? '#2e7d32' : '#c62828', fontSize: '12px', margin: '6px 0' },
    }, probeResult.ok ? t('settingsTestOk').replace('N', String(probeResult.toolCount)) : t('settingsTestFail') + (probeResult.error ?? '')),
    h('div', { style: { display: 'flex', gap: '8px' } },
      h('button', { type: 'button', style: buttonStyle, onClick: () => { void save() } }, t('settingsSave')),
      h('button', { type: 'button', disabled: probing, style: buttonStyle, onClick: () => { void test() } }, t('settingsTest')),
      h('button', {
        type: 'button',
        style: { ...buttonStyle, background: '#fff3f3', color: '#c62828' },
        onClick: () => { void clear() },
      }, t('settingsClear'))),
  )
}
