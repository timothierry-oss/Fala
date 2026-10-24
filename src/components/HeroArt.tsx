/** Illustration : le Pain de Sucre au coucher du soleil, dans une arche. */
export function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 160 200" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="0.6" stopColor="#ffb07a" />
          <stop offset="1" stopColor="#f6e7c8" />
        </linearGradient>
        <clipPath id="arch">
          <path d="M0 200 V70 A80 70 0 0 1 160 70 V200 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#arch)">
        <rect width="160" height="200" fill="url(#sky)" />
        <circle cx="112" cy="78" r="18" fill="#fff4c7" opacity="0.9" />
        <path d="M-10 150 C20 120 35 70 58 72 C78 74 80 120 98 132 C110 140 140 138 170 146 V200 H-10 Z" fill="#1d4f91" opacity="0.85" />
        <path d="M86 140 C96 110 104 96 116 98 C128 100 132 128 146 140 Z" fill="#0b2a6b" opacity="0.9" />
        <path d="M-10 160 H170 V200 H-10 Z" fill="#2e8bc0" />
        <path d="M-10 166 Q20 162 40 166 T80 166 T120 166 T170 166" stroke="#bfe6f6" strokeWidth="1.5" fill="none" opacity="0.8" />
        <path d="M-10 182 H170 V200 H-10 Z" fill="#f2d7a6" />
        <g fill="#1f8a3b">
          <path d="M22 182 C24 160 26 150 30 140" stroke="#5a3d1e" strokeWidth="2.5" fill="none" />
          <path d="M30 140 C20 136 12 140 6 146 C16 142 24 142 30 141 Z" />
          <path d="M30 140 C40 134 50 136 56 142 C46 139 38 140 30 141 Z" />
          <path d="M30 140 C26 130 18 126 12 126 C20 130 26 134 30 141 Z" />
          <path d="M30 140 C34 130 42 126 50 126 C42 130 36 134 30 141 Z" />
        </g>
      </g>
    </svg>
  )
}
