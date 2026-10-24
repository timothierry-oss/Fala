import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { themes, allVocab } from '../data/themes'
import type { Skill } from '../data/types'
import { LevelBadge, PageHeader, ProgressBar } from '../components/ui'
import { VoiceCheck } from '../components/VoiceCheck'
import { addDays, dayKey, shortDate } from '../lib/dates'
import { LEVELS, levelInfo, levelValue } from '../lib/levels'
import {
  isMastered,
  loadDemo,
  resetProgress,
  speakingConfidence,
  streak,
  themeProgress,
  totalXp,
  updateSettings,
  useProgress,
  xpByDay,
  xpBySkill,
} from '../lib/store'

const SKILLS: { id: Skill; label: string; emoji: string }[] = [
  { id: 'vocabulaire', label: 'Vocabulaire', emoji: '📚' },
  { id: 'ecoute', label: 'Compréhension orale', emoji: '🎧' },
  { id: 'oral', label: 'Prononciation', emoji: '🎙️' },
  { id: 'argot', label: 'Argot', emoji: '😎' },
  { id: 'grammaire', label: 'Grammaire', emoji: '📐' },
  { id: 'lecture', label: 'Lecture (discussions)', emoji: '💬' },
]

const RANGES = [
  { days: 30, label: '30 j' },
  { days: 90, label: '3 mois' },
  { days: 365, label: '1 an' },
]

export function Progress() {
  const p = useProgress()
  const [range, setRange] = useState(30)
  const xp = totalXp(p)
  const level = levelInfo(xp)
  const byDay = xpByDay(p)
  const bySkill = xpBySkill(p)
  const maxSkill = Math.max(1, ...Object.values(bySkill))
  const learned = allVocab.filter((v) => isMastered(p, v.id)).length

  const curve = useMemo(() => {
    const start = addDays(new Date(), -range + 1)
    let cumul = p.xpLog.filter((e) => e.date < dayKey(start)).reduce((a, e) => a + e.xp, 0)
    return Array.from({ length: range }, (_, i) => {
      const key = dayKey(addDays(start, i))
      cumul += byDay.get(key) ?? 0
      return { date: key, xp: cumul, level: Number(levelValue(cumul).toFixed(3)) }
    })
  }, [p.xpLog, range, byDay])

  const maxLevel = Math.max(2, Math.ceil(curve[curve.length - 1]?.level ?? 0) + 1)
  const daily = Array.from({ length: 14 }, (_, i) => {
    const key = dayKey(addDays(new Date(), i - 13))
    return { date: key, xp: byDay.get(key) ?? 0 }
  })

  return (
    <div className="page">
      <PageHeader eyebrow="Ton évolution" title="Progrès" />

      <section className="card level-hero">
        <div className="row between wrap gap">
          <div>
            <p className="eyebrow">Niveau actuel (CECRL)</p>
            <h2 className="level-big">
              <LevelBadge level={level.level} /> {level.label}
            </h2>
          </div>
          <div className="stat-big">
            <strong>{xp.toLocaleString('fr-FR')}</strong>
            <span>XP au total</span>
          </div>
        </div>
        <div className="level-track">
          {LEVELS.map((l) => (
            <span key={l.level} className={`lt ${l.level === level.level ? 'current' : xp >= l.xp ? 'passed' : ''}`}>
              {l.level}
            </span>
          ))}
        </div>
        <ProgressBar value={level.pct} tone="navy" />
        <p className="muted small">
          {level.next ? `${Math.round(level.pct * 100)} % vers ${level.next.level} · encore ${level.toNext} XP` : 'Niveau maximum atteint'}
        </p>
      </section>

      <div className="stats">
        <div className="card stat">
          <strong>{streak(p)} 🔥</strong>
          <span>jours d’affilée</span>
        </div>
        <div className="card stat">
          <strong>{learned}</strong>
          <span>mots maîtrisés / {allVocab.length}</span>
        </div>
        <div className="card stat">
          <strong>{speakingConfidence(p)} %</strong>
          <span>score de prononciation</span>
        </div>
        <div className="card stat">
          <strong>{themes.filter((t) => themeProgress(p, t.id) === 1).length}</strong>
          <span>thèmes terminés / {themes.length}</span>
        </div>
      </div>

      <section className="card chart-card">
        <div className="block-head wrap">
          <h3>Courbe de niveau</h3>
          <div className="segmented small">
            {RANGES.map((r) => (
              <button key={r.days} className={range === r.days ? 'active' : ''} onClick={() => setRange(r.days)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {xp === 0 ? (
          <EmptyChart />
        ) : (
          <div className="chart">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={curve} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="lvl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--green)" stopOpacity={0.35} />
                    <stop offset="1" stopColor="var(--green)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={28} />
                <YAxis
                  domain={[0, maxLevel]}
                  ticks={LEVELS.slice(0, maxLevel + 1).map((_, i) => i)}
                  tickFormatter={(v: number) => LEVELS[v]?.level ?? ''}
                  tick={{ fill: 'var(--muted)', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                {LEVELS.slice(1, maxLevel + 1).map((_, i) => (
                  <ReferenceLine key={i} y={i + 1} stroke="var(--grid-strong)" strokeDasharray="4 4" />
                ))}
                <Tooltip
                  cursor={{ stroke: 'var(--muted)', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload as { date: string; xp: number }
                    const info = levelInfo(d.xp)
                    return (
                      <div className="tooltip">
                        <strong>{shortDate(d.date)}</strong>
                        <span>
                          {info.level} · {Math.round(info.pct * 100)} %
                        </span>
                        <span className="muted">{d.xp} XP cumulés</span>
                      </div>
                    )
                  }}
                />
                <Area type="monotone" dataKey="level" stroke="var(--green)" strokeWidth={2} fill="url(#lvl)" activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="two-col">
        <section className="card chart-card">
          <div className="block-head">
            <h3>XP par jour</h3>
            <span className="muted small">Objectif : {p.dailyGoal} XP</span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={daily} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d: string) => shortDate(d).split(' ')[0]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <ReferenceLine y={p.dailyGoal} stroke="var(--yellow-strong)" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ fill: 'var(--hover)' }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="tooltip">
                        <strong>{shortDate((payload[0].payload as { date: string }).date)}</strong>
                        <span>{payload[0].value} XP</span>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="xp" fill="var(--navy)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card chart-card">
          <h3>Compétences</h3>
          <ul className="skills">
            {SKILLS.map((s) => (
              <li key={s.id}>
                <div className="row between">
                  <span>
                    {s.emoji} {s.label}
                  </span>
                  <span className="muted small">{bySkill[s.id]} XP</span>
                </div>
                <ProgressBar value={bySkill[s.id] / maxSkill} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <h3>Thèmes</h3>
        <ul className="skills">
          {themes.map((t) => (
            <li key={t.id}>
              <div className="row between">
                <span>
                  {t.emoji} {t.title}
                </span>
                <LevelBadge level={t.level} />
              </div>
              <ProgressBar value={themeProgress(p, t.id)} />
            </li>
          ))}
        </ul>
      </section>

      <section className="card settings">
        <h3>Réglages</h3>
        <VoiceCheck />
        <label>
          <span>Lire les réactions à voix haute 🇧🇷</span>
          <input type="checkbox" checked={p.settings.speakReactions} onChange={(e) => updateSettings({ settings: { speakReactions: e.target.checked } })} />
        </label>
        <label>
          <span>Objectif quotidien</span>
          <select value={p.dailyGoal} onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}>
            {[20, 50, 100, 150].map((g) => (
              <option key={g} value={g}>
                {g} XP / jour
              </option>
            ))}
          </select>
        </label>
        <div className="row gap-sm wrap">
          <button className="btn btn-ghost" onClick={() => confirm('Remplacer ta progression par des données de démonstration ?') && loadDemo()}>
            Charger des données de démo
          </button>
          <button className="btn btn-danger" onClick={() => confirm('Effacer toute ta progression ?') && resetProgress()}>
            Réinitialiser
          </button>
        </div>
        <p className="muted small">Ta progression est enregistrée uniquement sur cet appareil.</p>
      </section>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="empty-chart">
      <p>📈 Ta courbe apparaîtra dès ta première leçon.</p>
      <p className="muted small">Astuce : charge les données de démo en bas de page pour voir à quoi elle ressemble.</p>
    </div>
  )
}
