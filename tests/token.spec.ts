/**
 * Token resolution specs: the settings card's secret wins, then the
 * DIDA365_TOKEN environment variable, then the configured token file.
 */

import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { resolveConfig } from '../src/config.ts'
import { resolveToken } from '../src/index.ts'
import type { TicktickSettings } from '../src/wire.ts'

const SETTINGS: TicktickSettings = { token: '', tokenFile: '', mcpUrl: 'https://mcp.dida365.com', protectedTaskIds: [] }
const resolved = resolveConfig(undefined)

describe('resolveToken', () => {
  it('prefers the settings card secret', () => {
    vi.stubEnv('DIDA365_TOKEN', 'dp_env')
    expect(resolveToken({ ...SETTINGS, token: 'dp_card' }, resolved)).toBe('dp_card')
  })

  it('falls back to the DIDA365_TOKEN environment variable', () => {
    vi.stubEnv('DIDA365_TOKEN', 'dp_env')
    expect(resolveToken(SETTINGS, resolved)).toBe('dp_env')
  })

  it('falls back to the token file', () => {
    vi.stubEnv('DIDA365_TOKEN', '')
    const dir = mkdtempSync(join(tmpdir(), 'dsh-ticktick-token-'))
    const file = join(dir, 'token')
    writeFileSync(file, '  dp_file  \n')
    expect(resolveToken({ ...SETTINGS, tokenFile: file }, resolved)).toBe('dp_file')
  })

  it('is null when nothing is configured', () => {
    vi.stubEnv('DIDA365_TOKEN', '')
    expect(resolveToken(SETTINGS, resolved)).toBeNull()
  })
})
