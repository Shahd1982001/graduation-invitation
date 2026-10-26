import { pushRsvp, sanitize, storageReady } from './_store.js'

// POST /api/rsvp  { name, attending, companions }
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}') } catch { body = {} }
  }

  const { entry, errors } = sanitize(body || {})
  if (errors.length) return res.status(400).json({ ok: false, error: 'name_invalid' })

  if (!storageReady) {
    console.error('[rsvp] التخزين غير مُعدّ — أضيفي UPSTASH_REDIS_REST_URL/TOKEN على Vercel', entry)
    return res.status(503).json({ ok: false, error: 'storage_not_configured' })
  }

  try {
    await pushRsvp(entry)
    return res.status(201).json({ ok: true, id: entry.id })
  } catch (err) {
    console.error('[rsvp] failed', err)
    return res.status(500).json({ ok: false, error: 'save_failed' })
  }
}
