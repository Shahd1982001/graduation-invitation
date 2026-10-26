import { useEffect, useRef, useState } from 'react'
import { grad } from '../config/grad.js'
import { submitRsvp } from '../services/rsvpService.js'

const ERRORS = {
  name_invalid: 'يرجى كتابة الاسم (٣ أحرف على الأقل).',
  storage_not_configured: 'خدمة الحفظ غير مُفعّلة بعد، يرجى التواصل مع منظّمي الحفل.',
  network: 'تعذّر الاتصال، تأكدوا من الإنترنت وحاولوا مرة أخرى.',
}

export default function RSVPDialog({ onClose }) {
  const max = grad.rsvp.maxCompanions
  const [f, setF] = useState({ name: '', attend: '', companions: 0 })
  const [err, setErr] = useState({}); const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState('')
  const nameRef = useRef(null)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    nameRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (f.name.trim().length < 3) e.name = 'يرجى كتابة الاسم (٣ أحرف على الأقل).'
    if (!f.attend) e.attend = 'يرجى اختيار الحضور أو الاعتذار.'
    setErr(e); setServerError('')
    if (Object.keys(e).length) { e.name && nameRef.current?.focus(); return }
    setStatus('sending')
    try {
      await submitRsvp({
        name: f.name.trim(),
        attending: f.attend === 'yes',
        companions: f.attend === 'yes' ? f.companions : 0,
      })
      setStatus('done')
    } catch (error) {
      setServerError(ERRORS[error.message] || 'تعذّر الإرسال، حاولوا مرة أخرى.')
      setStatus('idle')
    }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheetm" role="dialog" aria-modal="true" aria-labelledby="rv-t">
        <button className="x" onClick={onClose} aria-label="إغلاق">×</button>
        <h2 id="rv-t">تأكيد الحضور</h2>
        {status === 'done' ? (
          <div role="status" className="done">
            <p>{f.attend === 'yes' ? 'تم تسجيل حضوركم، ننتظركم بكل محبة.' : 'تم تسجيل اعتذاركم، شكرًا لكم.'}</p>
            {f.attend === 'yes' && (
              <p className="done-sub">عدد الحضور المسجّل: <b>{f.companions + 1}</b>{f.companions ? ` (أنتم + ${f.companions} مرافقين)` : ''}</p>
            )}
            <p className="demo">سيصل تأكيدكم إلى منظّمي الحفل مباشرة.</p>
            <button className="btn-gold" onClick={onClose}>إغلاق</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="g-name">الاسم الكريم</label>
              <input id="g-name" ref={nameRef} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!err.name} aria-describedby={err.name ? 'e-n' : undefined} />
              {err.name && <p className="err" id="e-n" role="alert">{err.name}</p>}
            </div>
            <fieldset className="field">
              <legend>هل ستتشرفون بالحضور؟</legend>
              <div className="choices">
                <label className={f.attend === 'yes' ? 'on' : ''}><input type="radio" name="att" checked={f.attend === 'yes'} onChange={() => set('attend', 'yes')} />سأحضر بإذن الله</label>
                <label className={f.attend === 'no' ? 'on' : ''}><input type="radio" name="att" checked={f.attend === 'no'} onChange={() => set('attend', 'no')} />أعتذر عن الحضور</label>
              </div>
              {err.attend && <p className="err" role="alert">{err.attend}</p>}
            </fieldset>
            {f.attend === 'yes' && (
              <div className="field">
                <label htmlFor="g-c">عدد المرافقين (حتى {max})</label>
                <select id="g-c" value={f.companions} onChange={(e) => set('companions', +e.target.value)}>
                  {Array.from({ length: max + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}
                </select>
                <p className="hint-inline">إجمالي الحضور: {f.companions + 1}</p>
              </div>
            )}
            <button className="btn-gold" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'جارٍ الإرسال…' : 'إرسال الرد'}</button>
            {serverError && <p className="err" role="alert">{serverError}</p>}
            <p className="demo">ردّكم يُسجَّل رسميًا ويصل إلى منظّمي الحفل.</p>
          </form>
        )}
      </div>
    </div>
  )
}
