import { useEffect, useRef, useState } from 'react'
import { grad } from '../config/grad.js'

// مشغّل موسيقى خفيف:
// - يبدأ بعد لمسة المستخدم (فتح اللفافة) لتجاوز قيود التشغيل التلقائي في المتصفحات
// - صوت خفيف مع fade-in، وتكرار لانهائي
// - يتذكّر اختيار الزائر (تشغيل/إيقاف) في localStorage
// - لو الملف غير موجود يختفي الزر بصمت
// - يدعم البدء من منتصف الملف وتحديد نهاية المقطع (startAt / endAt بالثواني)
const KEY = 'invite-music'

export default function MusicPlayer({ start }) {
  const audioRef = useRef(null)
  const [available, setAvailable] = useState(true)
  const [playing, setPlaying] = useState(false)
  const volume = grad.music?.volume ?? 0.55
  const startAt = Math.max(0, Number(grad.music?.startAt) || 0)
  const endAt = Math.max(0, Number(grad.music?.endAt) || 0)

  // البدء من نقطة محددة (مثلًا الكورس المشهور) والالتفاف عند نهاية المقطع
  const seekStart = () => {
    const audio = audioRef.current
    if (!audio || !startAt) return
    try { if (audio.currentTime < startAt) audio.currentTime = startAt } catch { /* ignore */ }
  }

  const onTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || !endAt || audio.currentTime < endAt) return
    try { audio.currentTime = startAt } catch { /* ignore */ }
  }

  const fadeTo = (target, ms = 900) => {
    const audio = audioRef.current
    if (!audio) return
    const from = audio.volume
    const t0 = performance.now()
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms)
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * k))
      if (k < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const play = async () => {
    const audio = audioRef.current
    if (!audio) return false
    try {
      audio.volume = 0
      if (startAt) seekStart()
      await audio.play()
      fadeTo(volume)
      setPlaying(true)
      try { localStorage.setItem(KEY, 'on') } catch { /* ignore */ }
      return true
    } catch {
      setPlaying(false)
      return false
    }
  }

  const stop = () => {
    const audio = audioRef.current
    if (!audio) return
    fadeTo(0, 450)
    window.setTimeout(() => audio.pause(), 460)
    setPlaying(false)
    try { localStorage.setItem(KEY, 'off') } catch { /* ignore */ }
  }

  const toggle = () => (playing ? stop() : play())

  // يبدأ عند فتح اللفافة، إلا لو الزائر أوقفها سابقًا
  useEffect(() => {
    if (!start || !available) return
    let preference = 'on'
    try { preference = localStorage.getItem(KEY) || 'on' } catch { /* ignore */ }
    if (preference === 'off') return
    play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, available])

  // إيقاف عند مغادرة الصفحة (توفير بطارية)
  useEffect(() => {
    const onHide = () => { if (document.hidden && audioRef.current) audioRef.current.pause() }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [])

  if (!available || !grad.music?.src) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={grad.music.src}
        loop
        preload="auto"
        onLoadedMetadata={seekStart}
        onTimeUpdate={onTimeUpdate}
        onError={() => setAvailable(false)}
      />
      <button
        type="button"
        className={`mus-btn${playing ? ' on' : ''}`}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
        title={playing ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
      >
        <span className="mus-icon" aria-hidden="true">{playing ? '❚❚' : '♪'}</span>
        {playing && <span className="mus-wave" aria-hidden="true"><i /><i /><i /></span>}
      </button>
    </>
  )
}
