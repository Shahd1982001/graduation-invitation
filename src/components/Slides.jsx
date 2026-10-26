import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { grad } from '../config/grad.js'
import OvalFrame from './OvalFrame.jsx'
import CalendarCountdown from './CalendarCountdown.jsx'
import RSVPDialog from './RSVPDialog.jsx'

const COUNT = 3

export default function Slides({ open, reduce }) {
  const box = useRef(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    if (!open) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && setIndex(Number(entry.target.dataset.i)))
    }, { root: box.current, threshold: 0.6 })
    box.current.querySelectorAll('.slide').forEach((slide) => io.observe(slide))
    return () => io.disconnect()
  }, [open])

  useEffect(() => {
    if (!open || reduce) return
    const slide = box.current.children[index]
    const animation = gsap.fromTo(slide.querySelectorAll('[data-a]'), { y: 18, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 0.75, stagger: 0.1, ease: 'power2.out', overwrite: true,
    })
    return () => animation.kill()
  }, [index, open, reduce])

  useEffect(() => {
    if (!open || paused || modal || reduce || index >= COUNT - 1) return
    const timer = setTimeout(() => {
      box.current.scrollTo({ top: box.current.children[index + 1].offsetTop, behavior: 'smooth' })
    }, grad.autoAdvanceMs)
    return () => clearTimeout(timer)
  }, [open, paused, modal, reduce, index])

  const stop = () => setPaused(true)
  const goto = (target) => {
    setPaused(true)
    box.current.scrollTo({ top: box.current.children[target].offsetTop, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <>
      <div className={`slides${reduce ? ' nomotion' : ''}`} ref={box} tabIndex={0} aria-label="دعوة التخرج"
        onPointerDown={stop} onWheel={stop} onTouchStart={stop} onKeyDown={stop}>
        <section className="slide slide-intro" data-i="0">
          <OvalFrame className="big">
            <div className="back" />
            <img className="girl" src="/assets/girl.png" alt={`الخريجة ${grad.name}`} />
          </OvalFrame>
          <p data-a className="script">Graduation {grad.year}</p>
          <h1 data-a className="gname">{grad.name}</h1>
          <p data-a className="deg">{grad.degree}<br />{grad.university}</p>
          <p data-a className="date-line">17 ديسمبر 2026</p>
        </section>

        <section className="slide slide-message" data-i="1">
          <p data-a className="verse">﴿ {grad.verse.text} ﴾<small>{grad.verse.ref}</small></p>
          <div data-a className="message-copy">
            <p>الحمدلله حتى يبلغ الحمد منتهاه</p>
            <p>أكملت مسيرتي الدراسية، وها أنا اليوم أحتفل بثمرة تعبي.</p>
            <p>بفضل الله ثم بدعم من أحب، وصلت إلى لحظة التخرّج.</p>
          </div>
          <div className="message-divider" aria-hidden="true" />
          <p data-a className="joy">{grad.joy}</p>
        </section>

        <section className="slide slide-details" data-i="2">
          <OvalFrame className="small">
            <div className="back" />
            <img className="girl" src="/assets/girl.png" alt={`الخريجة ${grad.name}`} />
          </OvalFrame>
          <CalendarCountdown />
          <p data-a className="eyebrow">مكان الحفل</p>
          <h2 data-a className="venue">{grad.placeName}</h2>
          <p data-a className="city">{grad.city}</p>
          <div data-a className="slide-actions">
            <a className="btn-gold" href={grad.mapsUrl} target="_blank" rel="noopener noreferrer">عرض الموقع</a>
            <button className="btn-gold" onClick={() => setModal(true)}>تأكيد الحضور</button>
          </div>
        </section>
      </div>
      <button className="pp" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'تشغيل التقدّم التلقائي' : 'إيقاف التقدّم التلقائي مؤقتًا'}>
        {paused ? '▶' : '❚❚'}
      </button>
      <nav className="dots" aria-label="الصفحات">
        {Array.from({ length: COUNT }, (_, item) => (
          <button key={item} className={item === index ? 'on' : ''} onClick={() => goto(item)} aria-label={`الصفحة ${item + 1}`} aria-current={item === index} />
        ))}
      </nav>
      {modal && <RSVPDialog onClose={() => setModal(false)} />}
    </>
  )
}
