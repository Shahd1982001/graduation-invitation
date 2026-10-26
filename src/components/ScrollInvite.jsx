import { useEffect, useRef, useState } from 'react'
import Filmstrip from './Filmstrip.jsx'

// closed (اللفافة الحقيقية على الطاولة) → untie (زوم على الفيونكة) → unroll (الورقة تتفرد) → open
export default function ScrollInvite({ reduce }) {
  const [phase, setPhase] = useState('closed')
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const untie = () => {
    if (phase !== 'closed') return
    setPhase('untie')
    timers.current.push(window.setTimeout(() => setPhase('unroll'), reduce ? 120 : 900))
    timers.current.push(window.setTimeout(() => setPhase('open'), reduce ? 400 : 2150))
  }

  return (
    <main className={`invite ${phase}`}>
      <div className="scene">
        <img className="shot shot-closed" src="/assets/hero-scroll.jpg" alt="" draggable="false" />
        <span className="glow" aria-hidden="true" />
        <img className="shot shot-open" src="/assets/scroll-open.jpg" alt="" draggable="false" />
        <span className="vellum" aria-hidden="true" />
      </div>

      {phase === 'open' && <Filmstrip reduce={reduce} />}

      {phase !== 'open' && (
        <button className="bow-tap" onClick={untie} aria-label="اضغطي على الفيونكة لفتح الدعوة" />
      )}
      {phase !== 'open' && <p className="hint" aria-live="polite">اضغطي على الفيونكة لفتح الدعوة</p>}
    </main>
  )
}
