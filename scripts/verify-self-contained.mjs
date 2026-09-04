// verify-self-contained.mjs — verify that the packed artifact installs into
// a clean temporary DSH_HOME profile and the dsh web profile resolves the
// bundle row. Requires a local `dsh` CLI on PATH and network access for the
// profile's base bundles; skips (exit 0) when `dsh` is unavailable.
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const repo = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const dsh = spawnSync(process.platform === 'win32' ? 'dsh.cmd' : 'dsh', ['--version'], { shell: true })
if (dsh.status !== 0) {
  console.log('verify-self-contained: dsh CLI unavailable — skipped')
  process.exit(0)
}

const version = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8')).version

const home = mkdtempSync(join(tmpdir(), 'dsh-ticktick-verify-'))
console.log(`verify-self-contained: temp DSH_HOME ${home}`)
try {
  const tarball = join(repo, `perrylink-dsh-ticktick-${version}.tgz`)
  if (!existsSync(tarball)) {
    const pack = spawnSync('pnpm', ['pack'], { cwd: repo, stdio: 'inherit', shell: process.platform === 'win32' })
    if (pack.status !== 0) process.exit(pack.status ?? 1)
  }
  const add = spawnSync('dsh', ['plugin', '--profile', 'web', 'add', tarball], {
    env: { ...process.env, DSH_HOME: home },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (add.status !== 0) process.exit(add.status ?? 1)
  const dump = spawnSync('dsh', ['--profile', 'web', '--dump-config'], {
    env: { ...process.env, DSH_HOME: home },
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })
  if (dump.status !== 0) process.exit(dump.status ?? 1)
  if (!dump.stdout.includes('ticktick')) {
    console.error('verify-self-contained: bundle row "ticktick" not present in the dumped config')
    process.exit(1)
  }
  console.log('verify-self-contained: ticktick row resolved in the web profile config')
} finally {
  rmSync(home, { recursive: true, force: true })
}
