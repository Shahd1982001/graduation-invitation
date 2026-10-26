import { listRsvps, storageReady } from './_store.js'

// GET /api/rsvps?key=ADMIN_KEY            → JSON
// GET /api/rsvps?key=ADMIN_KEY&format=csv → ملف CSV (يفتح في Excel)
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const key = process.env.ADMIN_KEY
  const given = req.query?.key || ''
  if (!key || given !== key) return res.status(401).json({ ok: false, error: 'unauthorized' })
  if (!storageReady) return res.status(503).json({ ok: false, error: 'storage_not_configured' })

  let rows = []
  try { rows = await listRsvps() } catch (err) {
    console.error('[rsvps] failed', err)
    return res.status(500).json({ ok: false, error: 'read_failed' })
  }
  rows.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))

  const yes = rows.filter((r) => r.attending)
  const summary = {
    responses: rows.length,
    attending: yes.length,
    absent: rows.length - yes.length,
    heads: yes.reduce((n, r) => n + (r.people || 1), 0),
  }

  if (req.query?.format === 'csv') {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
    const lines = [
      ['الاسم', 'الحضور', 'المرافقون', 'إجمالي الأشخاص', 'وقت التسجيل'].map(esc).join(','),
      ...rows.map((r) => [r.name, r.attending ? 'حاضر' : 'معتذر', r.companions, r.people || 0, r.createdAt].map(esc).join(',')),
    ]
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="rsvp.csv"')
    return res.status(200).send('\uFEFF' + lines.join('\n'))
  }

  return res.status(200).json({ ok: true, summary, rows })
}
