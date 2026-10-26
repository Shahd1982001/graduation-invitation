import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Slides from './Slides.jsx'
import Bow from './Bow.jsx'

export default function ScrollInvite({ reduce }) {
  const root = useRef(null)
  const [phase, setPhase] = useState('closed') // closed | opening | open
  const [open, setOpen] = useState(false)

  const untie = () => {
    if (phase !== 'closed') return
    setPhase('opening')
    const d = reduce ? 250 : 1300
    gsap.to(root.current.querySelector('.hint'), { autoAlpha: 0, duration: reduce ? 0.15 : 0.4 })
    window.setTimeout(() => {
      setOpen(true)
      setPhase('open')
    }, d)
  }

  return (
    <main className={`invite ${phase}`} ref={root}>
      <div className="bgp" aria-hidden="true" />
      <div className={`scroll-wrap ${phase}`}>
        <div className="scroll">
          <div className="roller top" />
          <div className="sheet">{phase === 'open' && <Slides open={open} reduce={reduce} />}</div>
          <div className="roller bot" />
          {phase !== 'open' && <button className="tie" onClick={untie} disabled={phase !== 'closed'} aria-label="اضغطي على الفيونكة لفتح الدعوة"><span className="band" /><Bow /></button>}
        </div>
      </div>
      {phase !== 'open' && <p className="hint" aria-live="polite">اضغطي على الفيونكة لفتح الدعوة</p>}
    </main>
  )
}
