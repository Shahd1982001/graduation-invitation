import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// ——— backend محلي بسيط (نفس منطق api/rsvp.js) يعمل مع `npm run dev` و`npm run preview` ———
// يُخزَّن في .data/rsvps.json (خارج Git). على Vercel تُستخدم دوال api/ تلقائيًا.
function rsvpLocalApi() {
  const file = path.resolve(process.cwd(), '.data/rsvps.json')
  const read = () => {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return [] }
  }
  const write = (rows) => {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, JSON.stringify(rows, null, 2))
  }
  const readBody = (req) => new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')) } catch { resolve({}) }
    })
  })
  const json = (res, status, payload) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(payload))
  }

  const register = (server) => {
    server.middlewares.use('/api/rsvp', async (req, res) => {
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })
      const data = await readBody(req)
      const name = String(data.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
      if (name.length < 3) return json(res, 400, { ok: false, error: 'name_invalid' })
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
      return json(res, 201, { ok: true, id: entry.id })
    })

    server.middlewares.use('/api/rsvps', (req, res) => {
      const rows = read()
      const yes = rows.filter((r) => r.attending)
      return json(res, 200, {
        ok: true,
        summary: {
          responses: rows.length,
          attending: yes.length,
          absent: rows.length - yes.length,
          heads: yes.reduce((n, r) => n + (r.people || 1), 0),
        },
        rows,
      })
    })
  }

  return {
    name: 'rsvp-local-api',
    configureServer: register,
    configurePreviewServer: register,
  }
}

export default defineConfig({
  // fastRefresh معطّل: يمنع أخطاء «حالة قديمة» بعد تعديل الملفات أثناء المعاينة
  plugins: [react({ fastRefresh: false }), rsvpLocalApi()],
  // نسخة واحدة فقط من react (يمنع خطأ Cannot read properties of null (reading 'useState'))
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
    holdUntilCrawlEnd: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    // HTML غير مخزّن مؤقتًا: يمنع استخدام نسخة قديمة من الوحدات بعد أي تعديل
    headers: { 'Cache-Control': 'no-store' },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
    headers: { 'Cache-Control': 'no-store' },
  },
})
