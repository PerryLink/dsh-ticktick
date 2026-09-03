// verify-artifacts.mjs — gate the build output of the packed npm artifact:
// the host entry, the typert manifest, the client bundle, and the
// declaration tree must all exist, and no emitted JS may still import a
// `.ts` specifier (the ESM-crash trap).
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const repo = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const lib = join(repo, 'lib')
const required = [
  'lib/index.js',
  'lib/typert.host.js',
  'lib/client.js',
  'lib/types/index.d.ts',
  'lib/types/typert.host.d.ts',
  'lib/types/client/index.d.ts',
]
const missing = required.filter(file => !existsSync(join(repo, file)))
if (missing.length > 0) {
  console.error(`verify-artifacts: missing build outputs: ${missing.join(', ')}`)
  process.exit(1)
}

const offenders = []
const scan = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) scan(full)
    else if (entry.name.endsWith('.js')) {
      const text = readFileSync(full, 'utf8')
      if (/(?:from\s+|import\()['"]\.\.?\/[^'"]+\.tsx?['"]/.test(text)) offenders.push(full)
    }
  }
}
scan(lib)
if (offenders.length > 0) {
  console.error(`verify-artifacts: emitted .ts specifiers in: ${offenders.join(', ')}`)
  process.exit(1)
}

const client = readFileSync(join(repo, 'lib/client.js'), 'utf8')
// The formatter may reflow the banner; compare on whitespace-normalized text.
if (!client.replace(/\s+/g, ' ').includes('window.__ModuleLoader__.load({ id: "dsh-ticktick", factory: (require) => {')) {
  console.error('verify-artifacts: client bundle missing the ModuleLoader banner with the plugin id')
  process.exit(1)
}
console.log(`verify-artifacts: ${required.length} outputs present, no .ts residue, banner intact (${statSync(lib).isDirectory() ? 'lib tree' : 'lib'})`)
