import { useEffect, useMemo, useState } from 'react'
import { grad } from '../config/grad.js'
import { dateParts, MONTHS } from '../utils/dateParts.js'

const WEEK = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'] // الأسبوع يبدأ بالسبت
const pad = (n) => String(n).padStart(2, '0')

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const s = Math.floor(Math.max(0, target - now) / 1000)
  return { over: target - now <= 0, d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 }
}

export default function CalendarCountdown() {
  const target = useMemo(() => new Date(grad.dateTime).getTime(), [])
  const t = useMemo(() => dateParts(grad.dateTime, grad.timeZone), [])
  const [y, mo] = useMemo(() => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: grad.timeZone, year: 'numeric', month: 'numeric' }).formatToParts(new Date(target))
    return [+p.find((x) => x.type === 'year').value, +p.find((x) => x.type === 'month').value]
  }, [target])
  const cd = useCountdown(target)
  const lead = (new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() + 1) % 7
  const total = new Date(Date.UTC(y, mo, 0)).getUTCDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]

  return (
    <div className="cal">
      <h2 data-a className="month">{MONTHS[mo - 1]} {y}</h2>
      <div data-a className="grid" role="grid" aria-label={`تقويم ${MONTHS[mo - 1]}`}>
        {WEEK.map((w) => <span key={w} className="wd">{w}</span>)}
        {cells.map((d, i) => <span key={i} className={`day${d === t.day ? ' on' : ''}`} aria-current={d === t.day ? 'date' : undefined}>{d}</span>)}
      </div>
      <p data-a className="time">الساعة <b>{t.time}</b> {t.ampm}</p>
      {cd.over ? <p data-a className="over" role="status">حان موعد الحفل — أهلًا بكم</p> : (
        <div data-a className="count" role="timer" aria-label="العدّاد التنازلي">
          {[['يوم', cd.d], ['ساعة', cd.h], ['دقيقة', cd.m], ['ثانية', cd.s]].map(([l, n]) => <div key={l}><strong>{pad(n)}</strong><small>{l}</small></div>)}
        </div>
      )}
    </div>
  )
}
