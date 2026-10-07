import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
const archive = resolve(process.argv[2] || resolve(root, 'dist', `${manifest.name}-${manifest.version}.tgz`))
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
function tar(args) {
  const result = spawnSync('tar', args, { maxBuffer: 64 * 1024 * 1024 })
  if (result.error) throw result.error
  assert.equal(result.status, 0, result.stderr.toString())
  return result.stdout
}
const entries = tar(['-tzf', archive]).toString().trim().split('\n')
assert.equal(new Set(entries).size, entries.length, 'Duplicate archive entries')
for (const entry of entries) {
  const parts = entry.split('/')
  assert.equal(parts[0], 'package', `Unexpected archive root: ${entry}`)
  assert.ok(!parts.some(part => ['..', '.git', '.github', 'node_modules', '.pnpm-store', 'audit', 'dist'].includes(part)), `Unexpected path: ${entry}`)
}
const files = new Set(entries.filter(entry => !entry.endsWith('/')).map(entry => entry.slice('package/'.length)))
const readPacked = path => {
  assert.ok(files.has(path), `Missing package file: ${path}`)
  return tar(['-xOf', archive, `package/${path}`])
}
const packedManifest = JSON.parse(readPacked('package.json').toString())
for (const key of ['name', 'version', 'type', 'license', 'licenseNote', 'main', 'exports', 'files', 'dsh', 'engines']) {
  assert.deepEqual(packedManifest[key], manifest[key], `Package field changed: ${key}`)
}
for (const entry of [manifest.main, ...Object.values(manifest.exports), manifest.dsh.bundle.patch]) {
  assert.ok(files.has(entry.replace(/^\.\//, '')), `Missing declared entry: ${entry}`)
}
async function walk(path) {
  const paths = []
  for (const entry of await readdir(resolve(root, path), { withFileTypes: true })) {
    const child = `${path}/${entry.name}`
    if (entry.isDirectory()) paths.push(...await walk(child))
    else {
      assert.ok(entry.isFile(), `Unsupported source entry: ${child}`)
      paths.push(child)
    }
  }
  return paths
}
const expected = ['cordis.patch.yml', 'README.md', 'CHANGELOG.md', 'LICENSE', 'LICENSE-ASSETS', 'NOTICE.md', ...await walk('lib'), ...await walk('docs')]
for (const path of expected) {
  assert.equal(sha256(readPacked(path)), sha256(await readFile(resolve(root, path))), `Stale or changed packaged file: ${path}`)
}
const artwork = [...readPacked('LICENSE-ASSETS').toString().matchAll(/^([a-f0-9]{64})  (\S+)$/gm)]
assert.equal(artwork.length, 5, 'Expected four PNGs and the example GIF in the artwork record')
for (const [, hash, path] of artwork) assert.equal(sha256(readPacked(path)), hash, `Artwork hash mismatch: ${path}`)
const sum = `${sha256(await readFile(archive))}  ${basename(archive)}\n`
await writeFile(resolve(dirname(archive), 'SHA256SUMS'), sum)
console.log(`Verified ${basename(archive)}: ${expected.length} source files, package entries and 5 artwork hashes; SHA256SUMS written`)
