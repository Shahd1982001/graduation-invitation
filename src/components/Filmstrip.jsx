import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { grad } from '../config/grad.js'
import { dateParts } from '../utils/dateParts.js'
import OvalFrame from './OvalFrame.jsx'
import CalendarCountdown from './CalendarCountdown.jsx'
import RSVPDialog from './RSVPDialog.jsx'

const COUNT = 3
const D = { slide: 900, creep: 1600, drag: 0 }

// بداية «تركيز» على صفحة الاسم، ثم انتقال هادئ تحرّكه الجيران
export default function Filmstrip({ reduce }) {
  const root = useRef(null)
  const dragRef = useRef(null)
  const wheelLock = useRef(0)
  const [step, setStep] = useState(380)
  const [index, setIndex] = useState(0)
  const [auto, setAuto] = useState(false)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [paused, setPaused] = useState(false)
  const [boot, setBoot] = useState(!reduce)
  const [touched, setTouched] = useState(false)
  const [modal, setModal] = useState(false)

  const t = useMemo(() => dateParts(grad.dateTime, grad.timeZone), [])

  useLayoutEffect(() => {
    const measure = () => root.current && setStep(root.current.clientWidth * 0.82)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!boot) return
    const id = setTimeout(() => setBoot(false), reduce ? 0 : 1350)
    return () => clearTimeout(id)
  }, [boot, reduce])

  // التمرير التلقائي الهادئ (ينزلق بالشوية لين آخر صفحة ثم يتوقف)
  useEffect(() => {
    if (reduce || paused || dragging || modal || boot || index >= COUNT - 1) return
    const id = setTimeout(() => {
      setAuto(true)
      setIndex((i) => Math.min(i + 1, COUNT - 1))
    }, grad.autoAdvanceMs)
    return () => clearTimeout(id)
  }, [index, paused, dragging, modal, boot, reduce])

  const go = (target) => {
    setTouched(true); setPaused(true); setAuto(false); setDrag(0)
    setIndex(Math.max(0, Math.min(COUNT - 1, target)))
  }

  const togglePause = () => { setTouched(true); setPaused((v) => !v); setAuto(false); setDrag(0) }

  const onKeyDown = (e) => {
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(index - 1) }
    else if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(index + 1) }
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(COUNT - 1)
  }

  const onWheel = (e) => {
    const now = Date.now()
    if (now < wheelLock.current) return
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(d) < 8) return
    wheelLock.current = now + 650
    go(index + (d > 0 ? 1 : -1))
  }

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragRef.current = { x: e.clientX, id: e.pointerId }
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    setDrag(Math.max(-step * 1.4, Math.min(step * 1.4, dx)))
  }
  const endDrag = () => {
    if (!dragRef.current) return
    dragRef.current = null
    if (Math.abs(drag) > step * 0.22) go(index - Math.sign(drag))
    setDrag(0)
    setDragging(false)
  }

  const page = (i) => {
    if (i === 0) {
      return (
        <>
          <OvalFrame className="big">
            <div className="back" />
            <img className="girl" src="/assets/girl.png" alt={`الخريجة ${grad.name}`} />
          </OvalFrame>
          <p className="script" data-a>Graduation {grad.year}</p>
          <h1 className="gname" data-a>{grad.name}</h1>
          <p className="deg" data-a>{grad.degree}<br />{grad.university}</p>
          <p className="date-line" data-a>{t.day} {t.month} {t.year}</p>
        </>
      )
    }
    if (i === 1) {
      return (
        <>
          <p className="verse" data-a>﴿ {grad.verse.text} ﴾<small>{grad.verse.ref}</small></p>
          <div className="message-copy" data-a>
            <p>الحمدلله حتى يبلغ الحمد منتهاه</p>
            <p>أكملت مسيرتي الدراسية، وها أنا اليوم أحتفل بثمرة تعبي.</p>
            <p>بفضل الله ثم بدعم من أحب، وصلت إلى لحظة التخرّج.</p>
          </div>
          <div className="message-divider" aria-hidden="true" />
          <p className="joy" data-a>{grad.joy}</p>
        </>
      )
    }
    return (
      <>
        <OvalFrame className="small">
          <div className="back" />
          <img className="girl" src="/assets/girl.png" alt={`الخريجة ${grad.name}`} />
        </OvalFrame>
        <CalendarCountdown />
        <p className="eyebrow" data-a>مكان الحفل</p>
        <h2 className="venue" data-a>{grad.placeName}</h2>
        <p className="city" data-a>{grad.city}</p>
        <div className="slide-actions" data-a>
          <a className="btn-gold" href={grad.mapsUrl} target="_blank" rel="noopener noreferrer">عرض الموقع</a>
          <button className="btn-gold" onClick={() => setModal(true)}>تأكيد الحضور</button>
        </div>
      </>
    )
  }

  return (
    <>
      <div
        className={`strip${reduce ? ' nomotion' : ''}${boot ? ' boot' : ''}`}
        ref={root}
        role="group"
        tabIndex={0}
        aria-label="دعوة التخرّج — اسحبي أو استخدمي الأسهم"
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        {Array.from({ length: COUNT }, (_, i) => {
          const x = (i - index) * step + drag
          const dist = Math.abs(x) / step
          const zoomed = Math.max(0, 1 - dist)
          const tilt = Math.max(-6, Math.min(6, (drag / step) * -5))
          return (
            <section
              key={i}
              className={`page page-${['intro', 'message', 'details'][i]}${i === index ? ' focus' : ''}`}
              style={{
                transform: `translate3d(${x}px,0,0) scale(${0.88 + zoomed * 0.12}) rotateY(${tilt}deg)`,
                transitionDuration: `${dragging ? D.drag : auto ? D.creep : D.slide}ms`,
                opacity: i === index ? 1 : 0.72,
                zIndex: 10 - Math.round(dist * 2),
                pointerEvents: i === index ? 'auto' : 'none',
              }}
              aria-hidden={i !== index}
            >
              {page(i)}
            </section>
          )
        })}
      </div>

      <button
        className="pp"
        onClick={togglePause}
        aria-label={paused ? 'تشغيل الانتقال التلقائي' : 'إيقاف الانتقال التلقائي مؤقتًا'}
      >{paused ? '▶' : '❚❚'}</button>

      <nav className="dots" aria-label="الصفحات">
        {Array.from({ length: COUNT }, (_, i) => (
          <button key={i} className={i === index ? 'on' : ''} onClick={() => go(i)}
            aria-label={`الصفحة ${i + 1}`} aria-current={i === index} />
        ))}
      </nav>

      {!touched && !reduce && <p className="swipe-hint" aria-hidden="true">اسحبي يمين ويسار</p>}

      {modal && <RSVPDialog onClose={() => setModal(false)} />}
    </>
  )
}
