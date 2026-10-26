import { Component } from 'react'

// حاجز أخطاء: بدل شاشة فارغة، تظهر رسالة وزرار تحديث
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
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="fallback">
        <h1>تعذّر تحميل الدعوة</h1>
        <p>حدث خطأ غير متوقع أثناء العرض.</p>
        <button className="btn-gold" onClick={() => window.location.reload()}>إعادة المحاولة</button>
      </div>
    )
  }
}
