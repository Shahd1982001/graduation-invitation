import { Component } from 'react'

// حاجز أخطاء: بدل شاشة فارغة، تظهر رسالة وزرار تحديث
// تحميل كامل مع تجاهل الكاش
function hardReload() {
  const { pathname, search, hash } = window.location
  const sep = search ? '&' : '?'
  window.location.replace(`${pathname}${search}${sep}r=${Date.now()}${hash}`)
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[invite] error', error, info?.componentStack)
    // في التطوير: التعافي من حالة قديمة بعد تحديث الكود (إعادة تحميل واحدة فقط)
    if (import.meta.env.DEV) {
      const key = 'invite-auto-recovered'
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        window.setTimeout(() => window.location.reload(), 60)
      }
    }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="fallback">
        <h1>تعذّر تحميل الدعوة</h1>
        <p>حدث خطأ غير متوقع أثناء العرض.</p>
        {this.state.error?.message && (
          <pre className="fallback-msg" dir="ltr">{String(this.state.error.message).slice(0, 220)}</pre>
        )}
        <button className="btn-gold" onClick={hardReload}>إعادة المحاولة</button>
        <button className="fallback-link" onClick={() => { try { sessionStorage.clear() } catch { /* */ } hardReload() }}>تحديث كامل</button>
      </div>
    )
  }
}
