// إطار ذهبي بيضاوي: المحتوى يظهر داخل الفتحة (نسب الفتحة مقيسة من صورة الإطار)
export default function OvalFrame({ children, className = '' }) {
  return (
    <div className={`frame ${className}`} data-a>
      <div className="aperture">{children}</div>
      <img className="frame-img" src="/assets/frame.png" alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
    </div>
  )
}
