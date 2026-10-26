import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// ——— backend محلي بسيط (نفس منطق api/rsvp.js) يعمل أثناء `npm run dev` ———
// يُخزَّن في .data/rsvps.json (خارج Git). على Vercel تُستخدم دوال api/ تلقائيًا.
function rsvpDevServer() {
  const file = path.resolve(process.cwd(), '.data/rsvps.json')
  const read = () => {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return [] }
  }
  const write = (rows) => {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(rows, null, 2))
  }
  const body = (req) => new Promise((resolve) => {
    let raw = ''
    req.on('data', (c) => { raw += c })
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')) } catch { resolve({}) }
    })
  })

  return {
    name: 'rsvp-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/rsvp', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }))
        }
        const data = await body(req)
        const name = String(data.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
        if (name.length < 3) {
          res.statusCode = 400
          return res.end(JSON.stringify({ ok: false, error: 'name_invalid' }))
        }
        const attending = data.attending === true || data.attending === 'true'
        const companions = Math.max(0, Math.min(10, Number.parseInt(data.companions, 10) || 0))
        const entry = {
          id: `r_${Date.now().toString(36)}`,
          name,
          attending,
          companions: attending ? companions : 0,
          people: attending ? companions + 1 : 0,
          createdAt: new Date().toISOString(),
        }
        const rows = read()
        rows.push(entry)
        write(rows)
        server.config.logger.info(`[rsvp] ${entry.name} — ${attending ? 'حاضر' : 'معتذر'} (+${entry.companions})`)
        res.statusCode = 201
        res.end(JSON.stringify({ ok: true, id: entry.id }))
      })

      server.middlewares.use('/api/rsvps', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        const rows = read()
        const yes = rows.filter((r) => r.attending)
        res.end(JSON.stringify({
          ok: true,
          summary: {
            responses: rows.length,
            attending: yes.length,
            absent: rows.length - yes.length,
            heads: yes.reduce((n, r) => n + (r.people || 1), 0),
          },
          rows,
        }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), rsvpDevServer()],
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
})
