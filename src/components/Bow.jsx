// فيونكة ساتان ذهبية بالكود (SVG)
export default function Bow() {
  return (
    <svg className="bow" viewBox="0 0 140 110" aria-hidden="true">
      <defs>
        <linearGradient id="sat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2dfa6" /><stop offset=".45" stopColor="#c9a24e" /><stop offset="1" stopColor="#9c7a2e" />
        </linearGradient>
        <linearGradient id="sat2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efd78f" /><stop offset=".5" stopColor="#b8913f" /><stop offset="1" stopColor="#876722" />
        </linearGradient>
      </defs>
      <path d="M70 48 C58 70 50 96 42 106 L56 100 L62 108 C66 88 68 64 70 48Z" fill="url(#sat2)" />
      <path d="M70 48 C82 70 90 96 98 106 L84 100 L78 108 C74 88 72 64 70 48Z" fill="url(#sat)" />
      <path d="M70 46 C48 14 14 6 8 30 C4 52 36 62 70 46Z" fill="url(#sat)" stroke="#8a6a25" strokeWidth=".8" />
      <path d="M70 46 C92 14 126 6 132 30 C136 52 104 62 70 46Z" fill="url(#sat2)" stroke="#8a6a25" strokeWidth=".8" />
      <path d="M66 44 C48 26 28 22 20 32" fill="none" stroke="#f8ecc4" strokeOpacity=".6" strokeWidth="1.6" />
      <path d="M74 44 C92 26 112 22 120 32" fill="none" stroke="#f8ecc4" strokeOpacity=".5" strokeWidth="1.6" />
      <ellipse cx="70" cy="46" rx="11" ry="12" fill="url(#sat)" stroke="#8a6a25" strokeWidth=".8" />
    </svg>
  )
}
