/**
 * `dsh-ticktick`, browser half: mounts the `ticktick` Remote contribution,
 * then registers the Session-header task panel action
 * (`conversation.session.header.actions`, id `ticktick`) and the plugin
 * settings card (`settings.plugin.item`, key `ticktick`). All data arrives
 * through the `remote.ticktick` namespace and the bound `settingsScope`;
 * the panel holds no state beyond its popup, forms, and drag session.
 *
 * @module dsh-ticktick/client
 */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: the api-remotes client declares the 'remote' service on the
// client Context (the shell graph owns the runtime value).
import type {} from '@deepseek-ai/dsh-api-remotes/client'
// Type-only: pulls the 'settings.plugin.item' SlotMap declaration into this
// program so the card registration typechecks against the real declaration.
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
// Type-only: the header-actions SlotMap merge (conversation slot family).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: the settingsScope Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: the locale service Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { createTicktickApi, type TicktickApi } from './api.ts'
import { TicktickAction } from './TicktickAction.tsx'
import { TicktickSettingsCard, type TicktickSettingsCardInjected } from './TicktickSettingsCard.tsx'
import { en, zh, type TicktickLocaleKey } from './locales.ts'
import { installPanelStyles } from './styles.ts'
import { TICKTICK_REMOTE } from './remote.ts'
import { TICKTICK_SETTINGS_NS, type TicktickSettings } from '../wire.ts'

export type { TicktickApi } from './api.ts'
export type { TicktickLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** TickTick panel and settings-card copy. */
    ticktick: TicktickLocaleKey
  }
}

/** Dictionary namespace owned by this plugin. */
export const NS = 'ticktick'

/** Plugin name: matches the package name, the graph row `name`, and the bundle id. */
export const name = 'dsh-ticktick'

/** Services the client reads; `remote.ticktick` appears once this plugin mounts its contribution. */
export const inject = ['slots', 'locale', 'remote', 'settingsScope']

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
    inject: () => { api: TicktickApi }
  }, component: unknown): () => void
  register(options: {
    name: 'settings.plugin.item'
    key: 'ticktick'
    locale: string
    inject: () => TicktickSettingsCardInjected
  }, component: unknown): () => void
}

/**
 * Browser plugin body: dictionaries, the scoped stylesheet, the Remote
 * contribution mount, the header action, and the settings card.
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
    const settingsScope = scope.settingsScope.bind({ namespace: TICKTICK_SETTINGS_NS }) as unknown as SettingsScope<TicktickSettings>

    slots.inject('conversation.session.header.actions', () => slots.register({
      name: 'conversation.session.header.actions',
      id: 'ticktick',
      order: 11,
      locale: NS,
      inject: (): { api: TicktickApi } => ({ api: createTicktickApi(scope) }),
    }, TicktickAction))

    slots.inject('settings.plugin.item', () => slots.register({
      name: 'settings.plugin.item',
      key: 'ticktick',
      locale: NS,
      inject: (): TicktickSettingsCardInjected => ({
        scope: settingsScope,
        probe: async () => {
          const result = await scope.remote.ticktick.probe()
          if (!result.ok) throw new Error(`ticktick.probe failed: ${result.error.code}: ${result.error.message}`)
          return result.value
        },
      }),
    }, TicktickSettingsCard))
  })
}
