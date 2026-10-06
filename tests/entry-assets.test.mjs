import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { apply, inject, name } from '../lib/index.mjs'
import { ASSETS_PATH } from '../lib/src/routes.mjs'

function fixture() {
  const registered = new Map()
  const dispose = apply({ webServer: { register(route) {
    assert.equal(route.kind, 'prefix')
    assert.equal(route.path, ASSETS_PATH)
    assert.equal(registered.size, 0)
    registered.set(route.path, route)
    return () => registered.delete(route.path)
  } } })
  const request = async (url, method = 'GET') => {
    const response = { status: null, headers: {}, body: undefined, ended: false }
    await registered.get(ASSETS_PATH).handler({ method, url }, {
      writeHead(status, headers = {}) { response.status = status; response.headers = headers },
      end(body) { response.body = body; response.ended = true },
    })
    assert.equal(response.ended, true)
    return response
  }
  return { request, dispose, registered }
}

const artwork = ['yoimiya-welcome.png', 'yoimiya-expression.png', 'koi-emblem-v1.png', 'festival-ribbon-v1.png']
const assetURL = filename => `${ASSETS_PATH}/entrance/20261006/${filename}`

test('Node half declares the DSH webServer dependency and unregisters its route', () => {
  assert.equal(name, 'dsh-entrance')
  assert.deepEqual(inject, ['webServer'])
  const f = fixture()
  assert.equal(f.registered.size, 1)
  f.dispose()
  assert.equal(f.registered.size, 0)
})

test('all four packaged scene images are served as PNG bytes with MIME and exact length', async () => {
  const f = fixture()
  try {
    for (const filename of artwork) {
      const response = await f.request(assetURL(filename) + '?version=1')
      const source = await readFile(new URL(`../lib/assets/entrance/20261006/${filename}`, import.meta.url))
      assert.equal(response.status, 200, filename)
      assert.equal(response.headers['Content-Type'], 'image/png')
      assert.equal(response.headers['X-Content-Type-Options'], 'nosniff')
      assert.equal(response.headers['Content-Length'], source.length)
      assert.deepEqual(response.body, source)
      assert.deepEqual([...response.body.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
    }
  } finally { f.dispose() }
})

test('HEAD returns GET metadata with no response body', async () => {
  const f = fixture()
  try {
    const get = await f.request(assetURL(artwork[0]))
    const head = await f.request(assetURL(artwork[0]), 'HEAD')
    assert.equal(head.status, 200)
    assert.deepEqual(head.headers, get.headers)
    assert.equal(head.body, undefined)
  } finally { f.dispose() }
})

test('unsupported methods, malformed escapes, traversal, and missing assets fail closed', async () => {
  const f = fixture()
  try {
    const unsupported = await f.request(assetURL(artwork[0]), 'POST')
    assert.equal(unsupported.status, 405)
    assert.equal(unsupported.headers.Allow, 'GET, HEAD')
    for (const [path, status] of [
      [`${ASSETS_PATH}/%ZZ.png`, 400],
      [`${ASSETS_PATH}/%2e%2e%2fpackage.json`, 403],
      [`${ASSETS_PATH}/entrance/%5c..%5cpackage.json`, 403],
      [`${ASSETS_PATH}/entrance/%00.png`, 403],
      [`${ASSETS_PATH}//entrance/file.png`, 403],
      [`${ASSETS_PATH}/../package.json`, 403],
      [`${ASSETS_PATH}-other/file.png`, 403],
      [ASSETS_PATH, 403],
      [assetURL('missing.png'), 404],
    ]) {
      const response = await f.request(path)
      assert.equal(response.status, status, path)
      assert.equal(response.body, undefined, path)
    }
  } finally { f.dispose() }
})

test('package exposes the bundle patch, Node entry, and browser entry at existing paths', async () => {
  const root = new URL('../', import.meta.url)
  const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
  assert.equal(pkg.name, name)
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.equal(pkg.dsh.bundle.patch, pkg.exports['./cordis.patch.yml'])
  for (const relative of [pkg.main, pkg.exports['.'], pkg.exports['./client'], pkg.dsh.bundle.patch]) {
    await access(new URL(relative, root))
  }
  const patch = await readFile(new URL(pkg.dsh.bundle.patch, root), 'utf8')
  assert.match(patch, /id:\s*dsh-entrance\b/)
  assert.match(patch, /name:\s*dsh-entrance\b/)
  assert.ok(pkg.files.includes('lib'), 'published package must include runtime source and artwork')
})
