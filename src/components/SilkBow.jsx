// فيونكة حرير ذهبية (SVG) — مربوطة على اللفافة، وتتفكّ عند الفتح
export default function SilkBow() {
  return (
    <span className="bow" aria-hidden="true">
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="silkA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff6dc" />
            <stop offset=".26" stopColor="#f0d695" />
            <stop offset=".55" stopColor="#d3af60" />
            <stop offset=".78" stopColor="#b08c3d" />
            <stop offset="1" stopColor="#e3c57e" />
          </linearGradient>
          <linearGradient id="silkB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffedb8" />
            <stop offset=".32" stopColor="#e2c177" />
            <stop offset=".66" stopColor="#b39046" />
            <stop offset="1" stopColor="#8b6a27" />
          </linearGradient>
          <linearGradient id="silkTail" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f7e5b0" />
            <stop offset=".45" stopColor="#d1ad5d" />
            <stop offset=".8" stopColor="#a5843a" />
            <stop offset="1" stopColor="#c9a659" />
          </linearGradient>
          <radialGradient id="knotG" cx=".34" cy=".28" r=".85">
            <stop offset="0" stopColor="#fff7dd" />
            <stop offset=".35" stopColor="#e8ca85" />
            <stop offset=".72" stopColor="#bb9648" />
            <stop offset="1" stopColor="#86661f" />
          </radialGradient>

          <g id="loopShape">
            <path d="M100 74 C88 42 58 22 36 30 C15 38 16 68 44 77 C65 84 86 80 100 74 Z" fill="url(#silkA)" />
            <path d="M100 75 C86 56 64 43 48 46 C35 49 36 65 54 73 C72 81 90 80 100 75 Z" fill="url(#silkB)" opacity=".55" />
            <path d="M97 72 C83 51 61 36 44 36" fill="none" stroke="#fffbe9" strokeOpacity=".62" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M98 80 C80 79 58 74 42 66" fill="none" stroke="#7d5f1f" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
          </g>

          <g id="tailShape">
            <path d="M99 80 C96 105 89 127 81 145 L93 140 L96 149 C98 130 100 104 101 84 Z" fill="url(#silkTail)" />
            <path d="M99 84 C97 106 92 124 86 139" fill="none" stroke="#fff3cf" strokeOpacity=".45" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </defs>

        <ellipse cx="100" cy="92" rx="56" ry="17" fill="rgba(62,40,8,.26)" />

        <g className="tail tail-l"><use href="#tailShape" /></g>
        <g className="tail tail-r" transform="translate(200,0) scale(-1,1)"><use href="#tailShape" /></g>

        <g className="loop loop-l"><use href="#loopShape" /></g>
        <g className="loop loop-r" transform="translate(200,0) scale(-1,1)"><use href="#loopShape" /></g>

        <ellipse className="knot" cx="100" cy="76" rx="14" ry="15.5" fill="url(#knotG)" />
        <ellipse cx="95.5" cy="70" rx="5" ry="3.6" fill="#fff8e2" opacity=".55" />
        <path d="M88 84 C94 90 106 90 112 84" fill="none" stroke="#7a5c1d" strokeOpacity=".35" strokeWidth="1.6" />
      </svg>
    </span>
  )
}
