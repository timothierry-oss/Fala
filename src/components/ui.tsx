import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Volume2, X } from 'lucide-react'
import { speak, ttsSupported } from '../lib/speech'

export function PageHeader({
  title,
  eyebrow,
  back,
  close,
  right,
}: {
  title: ReactNode
  eyebrow?: ReactNode
  back?: string | true
  close?: string
  right?: ReactNode
}) {
  const nav = useNavigate()
  return (
    <header className="page-header">
      <div className="page-header-bar">
        {back ? (
          <button className="icon-btn" aria-label="Retour" onClick={() => (back === true ? nav(-1) : nav(back))}>
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span />
        )}
        {right ?? <span />}
        {close && (
          <button className="icon-btn" aria-label="Fermer" onClick={() => nav(close)}>
            <X size={22} />
          </button>
        )}
      </div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
    </header>
  )
}

export function ProgressBar({ value, tone = 'green' }: { value: number; tone?: 'green' | 'light' | 'navy' }) {
  return (
    <div className={`progress progress-${tone}`} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  )
}

export function Ring({ value, size = 96, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 12) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={9} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-value"
          strokeWidth={9}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-label">
        <strong>{value}%</strong>
        {label && <span>{label}</span>}
      </div>
    </div>
  )
}

export function SpeakButton({ text, rate = 1, label, small }: { text: string; rate?: number; label?: string; small?: boolean }) {
  const [playing, setPlaying] = useState(false)
  if (!ttsSupported) return null
  return (
    <button
      type="button"
      className={`speak-btn ${small ? 'small' : ''} ${playing ? 'playing' : ''}`}
      aria-label={label ?? `Écouter « ${text} »`}
      onClick={async (e) => {
        e.stopPropagation()
        setPlaying(true)
        await speak(text, { rate })
        setPlaying(false)
      }}
    >
      <Volume2 size={small ? 16 : 20} />
      {label && <span>{label}</span>}
    </button>
  )
}

const BAR_HEIGHTS = [8, 14, 22, 12, 28, 18, 34, 20, 40, 26, 16, 36, 22, 30, 12, 24, 38, 18, 26, 14, 30, 10, 20, 8]
const BAR_COLORS = ['g', 'g', 'n', 'g', 'y', 'g', 'n', 'g', 'g', 'y']

export function Waveform({ active = false, bars = 24 }: { active?: boolean; bars?: number }) {
  return (
    <div className={`waveform ${active ? 'active' : ''}`} aria-hidden>
      {BAR_HEIGHTS.slice(0, bars).map((h, i) => (
        <span
          key={i}
          className={`bar bar-${BAR_COLORS[i % BAR_COLORS.length]}`}
          style={{ height: h, animationDelay: `${(i % 7) * 0.09}s` }}
        />
      ))}
    </div>
  )
}

export function LevelBadge({ level }: { level: string }) {
  return <span className={`level-badge level-${level}`}>{level}</span>
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="tip">
      <span aria-hidden>💡</span>
      <p>{children}</p>
    </div>
  )
}
