import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ASSETS_PATH, sanitizeAssetPath, contentTypeFor } from './src/assets.mjs'

export const name = 'dsh-entrance'
export const inject = ['webServer']

// This Node half only serves packaged artwork. It never reads chats or accounts.
export function apply(ctx) {
  const server = ctx.webServer ?? ctx.get?.('webServer')
  if (!server?.register) return () => {}
  const off = server.register({ kind: 'prefix', path: ASSETS_PATH, handler: async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return }
    let pathname
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname) }
    catch { res.writeHead(400); res.end(); return }
    const relative = sanitizeAssetPath(pathname)
    if (!relative) { res.writeHead(403); res.end(); return }
    try {
      const data = await readFile(join(import.meta.dirname, 'assets', relative))
      res.writeHead(200, { 'Content-Type': contentTypeFor(relative), 'Content-Length': data.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' })
      res.end(req.method === 'HEAD' ? undefined : data)
    } catch { res.writeHead(404); res.end() }
  } })
  let disposed = false
  const dispose = () => {
    if (disposed) return
    disposed = true
    if (typeof off === 'function') off()
  }
  // Cordis constructs ordinary apply functions; returning alone is insufficient.
  if (typeof ctx.effect === 'function') ctx.effect(() => dispose, 'dsh-entrance.assets')
  return dispose
}
