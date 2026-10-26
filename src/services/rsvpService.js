// إرسال تأكيد الحضور إلى الـ backend (/api/rsvp).
// محليًا: يُخزَّن في .data/rsvps.json عبر middleware في vite.config.js
// على Vercel: يُخزَّن في Upstash Redis (انظر api/_store.js)
export async function submitRsvp(data) {
  let res
  try {
    res = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    throw new Error('network')
  }

  let payload = {}
  try { payload = await res.json() } catch { /* رد غير JSON */ }

  if (!res.ok || !payload.ok) {
    const code = payload.error || `http_${res.status}`
    throw new Error(code)
  }
  return payload
}
