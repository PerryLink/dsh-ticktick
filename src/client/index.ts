/**
 * `dsh-ticktick`, browser half: mounts the `ticktick` Remote contribution,
 * then registers the Session-header task panel action
 * (`conversation.session.header.actions`, id `ticktick`) and this plugin's
 * configuration page on the Plugins page (`plugins.row.config`, keyed
 * `<package name>#<row id>`). All data arrives through the
 * `remote.ticktick` namespace and the shared `ctx.configForms` form; the
 * panel holds no state beyond its popup, forms, and drag session.
 *
 * @module dsh-ticktick/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: the api-remotes client declares the 'remote' service on the
// client Context (the shell graph owns the runtime value).
import type {} from '@deepseek-ai/dsh-api-remotes/client'
// Type-only: pulls the 'plugins.row.config' SlotMap declaration into this
// program so the page registration typechecks against the real declaration.
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
// Type-only: the header-actions SlotMap merge (conversation slot family).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: the 'configForms' Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: the locale service Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { createTicktickApi, type TicktickApi } from './api.ts'
import { TicktickAction } from './TicktickAction.tsx'
import { TicktickSettingsCard, type TicktickSettingsCardInjected } from './TicktickSettingsCard.tsx'
import { en, zh, type TicktickLocaleKey } from './locales.ts'
import { installPanelStyles } from './styles.ts'
import { TICKTICK_REMOTE } from './remote.ts'
import type { TicktickForm } from './config-form.ts'
import { TICKTICK_ROW_CONFIG_KEY, TICKTICK_SETTINGS_NS } from '../wire.ts'

export type { TicktickApi } from './api.ts'
export type { TicktickLocaleKey } from './locales.ts'
export type { TicktickForm, TicktickFormSnapshot, TicktickPathOp, TicktickSecretView } from './config-form.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** TickTick panel and configuration-page copy. */
    ticktick: TicktickLocaleKey
  }
}

/** Dictionary namespace owned by this plugin. */
export const NS = TICKTICK_SETTINGS_NS

/** Plugin name: matches the package name, the graph row `name`, and the bundle id. */
export const name = '@perrylink/dsh-ticktick'

/**
 * Services the client reads; `remote.ticktick` appears once this plugin mounts
 * its contribution. `configForms` is the settings domain's shared form
 * provider — the per-namespace `ctx.settingsScope` service and the
 * `SettingsScope` type it bound are gone on this harness line.
 */
export const inject = ['slots', 'locale', 'remote', 'configForms']

/** The settings-form provider, structurally typed. */
interface TicktickConfigForms {
  /** @param entryId - the profile entry id whose values and writes are wanted. */
  get<T>(entryId: string): TicktickForm & {
    set(field: string, value: unknown): Promise<boolean>
    unset(field: string): Promise<boolean>
    getSnapshot(): { value: T | undefined, secrets?: readonly { path: string[], set: boolean }[] }
  }
}

/**
 * Minimal structural contract of the client slots registry this client
 * registers into, for the two slots it occupies. Declared locally because
 * the service's owner package moved across harness lines; the runtime
 * contract is structural.
 */
interface TicktickSlots {
  inject(slot: string, callback: () => unknown): void
  register(options: {
    name: 'conversation.session.header.actions'
    id: 'ticktick'
    order: number
    locale: string
    inject: () => { api: TicktickApi, setToken: (token: string) => Promise<void> }
  }, component: unknown): () => void
  register(options: {
    name: 'plugins.row.config'
    key: string
    locale: string
    inject: () => TicktickSettingsCardInjected
  }, component: unknown): () => void
}

/**
 * Browser plugin body: dictionaries, the scoped stylesheet, the Remote
 * contribution mount, the header action, and the configuration page.
 *
 * @param ctx - client root context.
 */
export async function apply(ctx: ClientContext): Promise<void> {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-ticktick: dictionaries')
  ctx.effect(() => installPanelStyles(), 'dsh-ticktick: stylesheet')

  // $mount registers the 'remote.ticktick' namespace service and owns its
  // removal for this fiber's lifetime.
  await ctx.remote.$mount(TICKTICK_REMOTE)

  ctx.inject(['remote.ticktick'], (scope) => {
    const slots = scope.get('slots') as unknown as TicktickSlots
    // The profile entry id IS the form namespace: one form per Loader entry.
    const form = (scope.get('configForms') as unknown as TicktickConfigForms).get(TICKTICK_SETTINGS_NS)

    slots.inject('conversation.session.header.actions', () => slots.register({
      name: 'conversation.session.header.actions',
      id: 'ticktick',
      order: 11,
      locale: NS,
      inject: (): { api: TicktickApi, setToken: (token: string) => Promise<void> } => ({
        api: createTicktickApi(scope),
        setToken: async (token) => { await form.set('token', token.trim()) },
      }),
    }, TicktickAction))

    // Only a row a `plugins.row.config` entry names gains a Configure
    // control, so this registration is what puts the page on the Plugins page.
    // The page owner supplies the entry's form as a render prop; the
    // registration's inject face carries only what this plugin owns.
    slots.inject('plugins.row.config', () => slots.register({
      name: 'plugins.row.config',
      key: TICKTICK_ROW_CONFIG_KEY,
      locale: NS,
      inject: (): TicktickSettingsCardInjected => ({
        probe: async () => {
          const result = await scope.remote.ticktick.probe()
          if (!result.ok) throw new Error(`ticktick.probe failed: ${result.error.code}: ${result.error.message}`)
          return result.value
        },
      }),
    }, TicktickSettingsCard))
  })
}
