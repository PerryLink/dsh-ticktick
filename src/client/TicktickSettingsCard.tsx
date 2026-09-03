/**
 * The TickTick plugin settings card (`settings.plugin.item`, key
 * `ticktick`). The card owns its own staging form — the shipped card-form
 * helper is in-repo and cross-plugin value imports are rejected by the
 * bundle-purity gate, so this card renders its fields directly over the
 * bound `SettingsScope` and writes each field through `scope.set`.
 *
 * @module dsh-ticktick/client/TicktickSettingsCard
 */

import { createElement as h, useEffect, useState } from 'react'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import { en, type TicktickLocaleKey } from './locales.ts'
import type { TicktickProbeResult, TicktickSettings } from '../wire.ts'

/** Translator face (bound to this plugin's locale namespace by the renderer). */
export type TicktickSettingsTranslator = (key: TicktickLocaleKey) => string

/** Props the settings card slot injects. */
export interface TicktickSettingsCardInjected {
  scope: SettingsScope<TicktickSettings>
  probe: () => Promise<TicktickProbeResult>
  t?: TicktickSettingsTranslator
}

/** Staged form values (strings only; the scope writes the typed values). */
interface FormState {
  token: string
  tokenFile: string
  mcpUrl: string
  protectedTaskIds: string
}

/**
 * The plugin configuration card: token (secret), token file, endpoint, and
 * protected ids, staged locally and written field-by-field on Save.
 * @param props - bound scope and optional translator.
 */
export function TicktickSettingsCard(props: TicktickSettingsCardInjected): React.ReactElement {
  const { scope, probe } = props
  const t: TicktickSettingsTranslator = props.t ?? (key => en[key])
  const [form, setForm] = useState<FormState>({ token: '', tokenFile: '', mcpUrl: '', protectedTaskIds: '' })
  const [saved, setSaved] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [probeResult, setProbeResult] = useState<TicktickProbeResult | null>(null)
  const [probing, setProbing] = useState(false)

  useEffect(() => scope.subscribe(() => {
    const value = scope.getSnapshot().value
    setForm(current => ({
      token: current.token,
      tokenFile: value?.tokenFile ?? '',
      mcpUrl: value?.mcpUrl ?? '',
      protectedTaskIds: (value?.protectedTaskIds ?? []).join(', '),
    }))
  }), [scope])

  useEffect(() => {
    const value = scope.getSnapshot().value
    if (value === undefined) return
    setForm({
      token: value.token ?? '',
      tokenFile: value.tokenFile ?? '',
      mcpUrl: value.mcpUrl ?? '',
      protectedTaskIds: (value.protectedTaskIds ?? []).join(', '),
    })
  }, [scope])

  const save = async (): Promise<void> => {
    setError(null)
    setSaved(false)
    setCleared(false)
    try {
      await scope.set('token', form.token.trim())
      await scope.set('tokenFile', form.tokenFile.trim())
      await scope.set('mcpUrl', form.mcpUrl.trim())
      await scope.set('protectedTaskIds', form.protectedTaskIds.split(',').map(id => id.trim()).filter(id => id !== ''))
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
      await scope.set('token', '')
      await scope.set('tokenFile', '')
      setForm({ ...form, token: '', tokenFile: '' })
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
        value: form[key],
        onChange: event => { setForm({ ...form, [key]: event.target.value }) },
      }),
      h('div', { style: { fontSize: '11px', color: '#888', marginTop: '2px' } }, hint))

  return h('div', { style: { padding: '10px 0' } },
    h('div', { style: { fontSize: '14px', fontWeight: 600, marginBottom: '8px' } }, t('settingsName')),
    field('token', t('settingsToken'), t('settingsTokenHint'), 'password'),
    field('tokenFile', t('settingsTokenFile'), t('settingsTokenFileHint')),
    field('mcpUrl', t('settingsMcpUrl'), t('settingsMcpUrlHint')),
    field('protectedTaskIds', t('settingsProtected'), t('settingsProtectedHint')),
    error !== null && h('div', { style: { color: '#c62828', fontSize: '12px', margin: '6px 0' } }, error),
    saved && h('div', { style: { color: '#2e7d32', fontSize: '12px', margin: '6px 0' } }, t('settingsSaved')),
    cleared && h('div', { style: { color: '#2e7d32', fontSize: '12px', margin: '6px 0' } }, t('settingsCleared')),
    probeResult !== null && h('div', {
      style: { color: probeResult.ok ? '#2e7d32' : '#c62828', fontSize: '12px', margin: '6px 0' },
    }, probeResult.ok ? t('settingsTestOk').replace('N', String(probeResult.toolCount)) : t('settingsTestFail') + (probeResult.error ?? '')),
    h('div', { style: { display: 'flex', gap: '8px' } },
      h('button', {
        type: 'button',
        style: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', background: '#f5f5f5' },
        onClick: () => { void save() },
      }, t('settingsSave')),
      h('button', {
        type: 'button',
        disabled: probing,
        style: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', background: '#f5f5f5' },
        onClick: () => { void test() },
      }, t('settingsTest')),
      h('button', {
        type: 'button',
        style: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer', background: '#fff3f3', color: '#c62828' },
        onClick: () => { void clear() },
      }, t('settingsClear'))),
  )
}
