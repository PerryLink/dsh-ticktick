import { describe, expect, it } from 'vitest'
import { TICKTICK_INVOCATIONS, TICKTICK_REMOVE_DESCRIPTOR } from '../src/wire.ts'

/**
 * The client `RemoteNamespaceService` reserves these names on its prototype and
 * in `REMOTE_NAMESPACE_FIELDS` (dsh-api-gateway client.browser.js). A wire
 * method matching one of them is rejected by `assertMethodAvailable` before
 * any namespace fiber exists, which is what made the GUI entry fail to mount.
 */
const RESERVED = new Set([
  'ctx', 'empty', 'invokeRemote', 'methods', 'name', 'namespace',
  'constructor', 'assertMethodAvailable', 'has', 'installDirect', 'installScoped', 'install', 'remove',
])

describe('ticktick wire vocabulary', () => {
  it('never uses a method name reserved by the namespace service', () => {
    for (const descriptor of TICKTICK_INVOCATIONS) {
      expect(RESERVED.has(descriptor.method), descriptor.id).toBe(false)
    }
  })

  it('keeps endpoints unique', () => {
    const endpoints = TICKTICK_INVOCATIONS.map(descriptor => `${descriptor.namespace}/${descriptor.method}`)
    expect(new Set(endpoints).size).toBe(endpoints.length)
  })

  it('routes removeTask to the service remove implementation with the stable wire id', () => {
    expect(TICKTICK_REMOVE_DESCRIPTOR.id).toBe('dsh-ticktick#ticktick/remove')
    expect(TICKTICK_REMOVE_DESCRIPTOR.method).toBe('removeTask')
    expect(TICKTICK_REMOVE_DESCRIPTOR.implementation).toBe('remove')
  })
})
