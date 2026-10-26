import { useEffect, useRef, useState } from 'react'
import Filmstrip from './Filmstrip.jsx'
import SilkBow from './SilkBow.jsx'

// مراحل الافتتاح: closed (على الطاولة) → untying (تفكّ الفيونكة) → unrolling (تتفتح اللفافة) → open
export default function ScrollInvite({ reduce }) {
  const [phase, setPhase] = useState('closed')
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const untie = () => {
    if (phase !== 'closed') return
    setPhase('untying')
    timers.current.push(window.setTimeout(() => setPhase('unrolling'), reduce ? 150 : 980))
    timers.current.push(window.setTimeout(() => setPhase('open'), reduce ? 500 : 2200))
  }

  return (
    <main className={`invite ${phase}`}>
      <div className="tabletop" aria-hidden="true" />
      <div className="props" aria-hidden="true">
        <img className="p-candle" src="/assets/candelabra.png" alt="" />
        <img className="p-pearls" src="/assets/pearls.png" alt="" />
        <img className="p-bloom" src="/assets/flower.png" alt="" />
      </div>

      <div className="rollStage">
        <div className="roll-shadow" aria-hidden="true" />
        <div className="roll" aria-hidden="true">
          <span className="end end-l" />
          <span className="end end-r" />
          <span className="grain" />
          <span className="ribbon" />
          <SilkBow />
        </div>
        {phase === 'closed' && (
          <button className="hit" onClick={untie} aria-label="اضغطي على الفيونكة لفتح الدعوة" />
        )}
      </div>

      <div className="sheet" aria-hidden="true" />

      {phase === 'open' && <Filmstrip reduce={reduce} />}

      {phase !== 'open' && <p className="hint" aria-live="polite">اضغطي على الفيونكة لفتح الدعوة</p>}
    </main>
  )
}
