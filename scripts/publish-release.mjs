import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const { GITHUB_REPOSITORY: repository, GITHUB_SHA: commit, GITHUB_REF: ref, GITHUB_RUN_ID: run, GITHUB_EVENT_PATH: eventPath } = process.env
assert.match(repository || '', /^[\w.-]+\/[\w.-]+$/)
assert.match(commit || '', /^[a-f0-9]{40}$/)
assert.equal(ref, 'refs/heads/main')
const manifest = JSON.parse(await readFile('package.json', 'utf8'))
assert.match(manifest.version, /^\d+\.\d+\.\d+$/)
const tag = `v${manifest.version}`
const event = JSON.parse(await readFile(eventPath, 'utf8'))
assert.equal(event.head_commit.message.split('\n')[0], `release: ${tag}`, 'Release commit subject must match package version')
const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
assert.equal(gh('api', `repos/${repository}/git/ref/heads/main`, '--jq', '.object.sha'), commit, 'Main advanced; do not publish a stale release request')
const file = `${manifest.name}-${manifest.version}.tgz`
const bytes = await readFile(`dist/${file}`)
const hash = createHash('sha256').update(bytes).digest('hex')
assert.equal(await readFile('dist/SHA256SUMS', 'utf8'), `${hash}  ${file}\n`, 'Downloaded package checksum changed')
const notes = await readFile(`docs/releases/${tag}.md`, 'utf8')
const body = `${notes}\n\n提交：[${commit.slice(0, 7)}](https://github.com/${repository}/commit/${commit})\n\nCI：[本次验证](https://github.com/${repository}/actions/runs/${run})\n\n安装包 SHA-256：\`${hash}\`\n`
await writeFile('dist/RELEASE-NOTES.md', body)
function findRelease() {
  const ids = gh('api', '--paginate', `repos/${repository}/releases`, '--jq', `.[] | select(.tag_name == "${tag}") | .id`).split('\n').filter(Boolean)
  assert.ok(ids.length <= 1, 'Multiple releases use the requested tag')
  return ids.length ? JSON.parse(gh('api', `repos/${repository}/releases/${ids[0]}`)) : undefined
}
const existing = findRelease()
if (existing) assert.ok(existing.draft, 'Published releases are never overwritten')
let tagRef
try { tagRef = gh('api', `repos/${repository}/git/ref/tags/${tag}`, '--jq', '.ref') }
catch (error) {
  if (!error.stderr?.toString().includes('HTTP 404')) throw error
}
if (tagRef) assert.equal(gh('api', `repos/${repository}/commits/${tag}`, '--jq', '.sha'), commit, 'Existing tag points to another commit')
else gh('api', '--method', 'POST', `repos/${repository}/git/refs`, '-f', `ref=refs/tags/${tag}`, '-f', `sha=${commit}`)
assert.equal(gh('api', `repos/${repository}/commits/${tag}`, '--jq', '.sha'), commit, 'Tag does not match the verified commit')
if (existing) {
  assert.equal(gh('api', `repos/${repository}/commits/${tag}`, '--jq', '.sha'), commit, 'Existing tag points to another commit')
  gh('release', 'edit', tag, '--notes-file', 'dist/RELEASE-NOTES.md')
} else {
  gh('release', 'create', tag, '--verify-tag', '--title', `DSH Entrance ${tag}`, '--notes-file', 'dist/RELEASE-NOTES.md', '--draft')
}
assert.equal(gh('api', `repos/${repository}/commits/${tag}`, '--jq', '.sha'), commit, 'Release tag does not match the verified commit')
gh('release', 'upload', tag, `dist/${file}`, 'dist/SHA256SUMS', '--clobber')
const uploaded = findRelease()
assert.ok(uploaded?.draft, 'Expected a draft release before publishing')
const asset = uploaded.assets.find(asset => asset.name === file)
assert.equal(asset?.size, bytes.length, 'Uploaded archive size mismatch')
assert.equal(asset?.digest, `sha256:${hash}`, 'Uploaded archive digest mismatch')
gh('release', 'edit', tag, '--draft=false', '--latest')
console.log(`Published https://github.com/${repository}/releases/tag/${tag}`)
