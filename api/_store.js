// تخزين ردود الحضور.
// يعمل مع Upstash Redis (أو Vercel KV المتوافق مع Upstash) عبر REST.
// متغيّرات البيئة المطلوبة على Vercel:
//   UPSTASH_REDIS_REST_URL   / أو KV_REST_API_URL
//   UPSTASH_REDIS_REST_TOKEN / أو KV_REST_API_TOKEN
// بدونها يعمل التطبيق محليًا فقط (انظر middleware في vite.config.js).

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || ''
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || ''
const KEY = 'rsvp:graduation'

export const storageReady = Boolean(URL_ && TOKEN)

async function call(path, body) {
  const res = await fetch(`${URL_.replace(/\/$/, '')}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`storage ${res.status}`)
  return res.json()
}

export async function pushRsvp(entry) {
  if (!storageReady) throw new Error('STORAGE_NOT_CONFIGURED')
  const out = await call(`/lpush/${KEY}`, entry)
  return out?.result
}

export async function listRsvps() {
  if (!storageReady) throw new Error('STORAGE_NOT_CONFIGURED')
  const out = await call(`/lrange/${KEY}/0/-1`)
  return (out?.result || []).map((raw) => {
    try { return JSON.parse(raw) } catch { return null }
  }).filter(Boolean)
}

export function sanitize(body = {}) {
  const name = String(body.name ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
  const attending = body.attending === true || body.attending === 'true'
  const companions = Math.max(0, Math.min(10, Number.parseInt(body.companions, 10) || 0))
  const errors = []
  if (name.length < 3) errors.push('name_invalid')
  return {
    entry: {
      id: globalThis.crypto?.randomUUID?.() || `r_${Date.now().toString(36)}`,
      name,
      attending,
      companions: attending ? companions : 0,
      people: attending ? companions + 1 : 0,
      createdAt: new Date().toISOString(),
    },
    errors,
  }
}
