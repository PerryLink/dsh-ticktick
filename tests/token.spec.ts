/**
 * Token resolution specs: the configuration page's secret wins, then the
 * DIDA365_TOKEN environment variable, then the configured token file. The
 * live fields arrive as `Volatile` references, exactly as the Loader hands
 * them to `apply`, so every case also proves the lazy `.get()` read.
 */

import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { Config, resolveConfig, type Config as TicktickConfig } from '../src/config.ts'
import { resolveToken } from '../src/index.ts'

const resolved = resolveConfig(undefined)

/**
 * Resolve a raw config through the real schema, so live fields carry their
 * references exactly as the Loader hands them to `apply`. The cast is the
 * schema-to-interface step every Schemastery consumer owns: the schema is the
 * source of the values, the interface is what a consumer receives.
 */
function liveConfig(raw: Record<string, unknown>): TicktickConfig {
  return Config(raw) as unknown as TicktickConfig
}

const EMPTY = liveConfig({})

describe('resolveToken', () => {
  it('prefers the configuration page secret', () => {
    vi.stubEnv('DIDA365_TOKEN', 'dp_env')
    expect(resolveToken(liveConfig({ token: 'dp_card' }), resolved)).toBe('dp_card')
  })

  it('falls back to the DIDA365_TOKEN environment variable', () => {
    vi.stubEnv('DIDA365_TOKEN', 'dp_env')
    expect(resolveToken(EMPTY, resolved)).toBe('dp_env')
  })

  it('falls back to the token file', () => {
    vi.stubEnv('DIDA365_TOKEN', '')
    const dir = mkdtempSync(join(tmpdir(), 'dsh-ticktick-token-'))
    const file = join(dir, 'token')
    writeFileSync(file, '  dp_file  \n')
    expect(resolveToken(liveConfig({ tokenFile: file }), resolved)).toBe('dp_file')
  })

  it('is null when nothing is configured', () => {
    vi.stubEnv('DIDA365_TOKEN', '')
    expect(resolveToken(EMPTY, resolved)).toBeNull()
  })

  it('keeps the reference live: a re-resolved config carries the edited secret', () => {
    vi.stubEnv('DIDA365_TOKEN', '')
    const first = liveConfig({ token: 'dp_first' })
    expect(resolveToken(first, resolved)).toBe('dp_first')
    // A form edit re-parses the raw config and commits into the same
    // reference; the closure holds the reference, never a snapshot.
    const second = liveConfig({ token: 'dp_second' })
    expect(resolveToken(second, resolved)).toBe('dp_second')
  })

  it('tolerates a programmatically built config with bare values', () => {
    vi.stubEnv('DIDA365_TOKEN', '')
    const bare = { token: 'dp_bare', tokenFile: '', mcpUrl: 'https://mcp.dida365.com', toolCallTimeoutMs: 30_000, protectedTaskIds: [] }
    expect(resolveToken(bare as unknown as TicktickConfig, resolved)).toBe('dp_bare')
  })
})
