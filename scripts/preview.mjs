import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve, extname, sep } from 'node:path'
const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const mime = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' }
export function createPreviewServer() {
  return http.createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      if (path === '/') path = '/preview/index.html'
      if (path.startsWith('/dsh-entrance/assets/')) path = '/lib/assets/' + path.slice('/dsh-entrance/assets/'.length)
      const target = resolve(root, '.' + path)
      if (!target.startsWith(root + sep) || !/^\/(lib|preview)\//.test(path)) { res.writeHead(403); res.end(); return }
      const data = await readFile(target)
      res.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(data)
    } catch { res.writeHead(404); res.end('Not found') }
  })
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4320)
  createPreviewServer().listen(port, '127.0.0.1', () => console.log(`DSH entrance preview: http://127.0.0.1:${port}`))
}
