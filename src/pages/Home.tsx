import { Link } from 'react-router-dom'
import { ChevronRight, Flame } from 'lucide-react'
import { themes } from '../data/themes'
import { allVocab } from '../data/themes'
import { HeroArt } from '../components/HeroArt'
import { LevelBadge, ProgressBar, Ring, SpeakButton, Waveform } from '../components/ui'
import { addDays, dayKey, startOfWeek } from '../lib/dates'
import { levelInfo } from '../lib/levels'
import { curriculumProgress } from '../lib/routine'
import {
  isMastered,
  speakingConfidence,
  stepDone,
  streak,
  themeProgress,
  totalXp,
  useProgress,
  xpByDay,
} from '../lib/store'
import type { StepId } from '../data/types'

const STEP_LABEL: Record<StepId, string> = {
  vocabulaire: 'Vocabulaire',
  ecoute: 'Compréhension orale',
  oral: 'Prononciation',
  quiz: 'Quiz final',
}

/** 3 mots du jour, stables pour la journée. */
function wordsOfTheDay() {
  const seed = dayKey()
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0)
  return [0, 1, 2].map((i) => allVocab[(seed * 7 + i * 13) % allVocab.length])
}

export function Home() {
  const p = useProgress()
  const xp = totalXp(p)
  const level = levelInfo(xp)
  const current = themes.find((t) => t.id === p.lastTheme && themeProgress(p, t.id) < 1) ?? themes.find((t) => themeProgress(p, t.id) < 1) ?? themes[0]
  const nextStep = (['vocabulaire', 'ecoute', 'oral', 'quiz'] as StepId[]).find((s) => !stepDone(p, current.id, s)) ?? 'quiz'
  const learned = allVocab.filter((v) => isMastered(p, v.id)).length
  const days = xpByDay(p)
  const monday = startOfWeek()
  const todayXp = days.get(dayKey()) ?? 0
  const s = streak(p)
  const confidence = speakingConfidence(p)
  const daily = wordsOfTheDay()
  const { overallPct } = curriculumProgress(p)

  return (
    <div className="page home">
      <section className="hero">
        <div>
          <p className="eyebrow">
            Portugais brésilien · <LevelBadge level={level.level} /> {level.label}
          </p>
          <h1 className="hero-title">
            Pronto para
            <br />
            aprender?
          </h1>
          <p className="muted">Prêt à apprendre ? Chaque jour, un peu plus à l’aise.</p>
        </div>
        <HeroArt />
      </section>

      <div className="home-grid">
        <Link to="/routine" className="continue-card compact">
          <div className="continue-top">
            <div>
              <p className="eyebrow light">Parcours vers le B1 · {Math.round(overallPct * 100)} %</p>
              <h2>🎯 Faire une routine</h2>
              <p className="light-text">
                {p.routinesCompleted
                  ? `${p.routinesCompleted} routine${p.routinesCompleted > 1 ? 's' : ''} déjà faites · adaptée à tes points faibles`
                  : 'Vocabulaire, grammaire et traduction, dans l’ordre, adaptés à tes points faibles.'}
              </p>
            </div>
            <span className="round-btn">
              <ChevronRight size={22} />
            </span>
          </div>
          <ProgressBar value={overallPct} tone="light" />
        </Link>

        <Link to={`/parcours/${current.id}`} className="continue-card">
          <div className="continue-top">
            <div>
              <p className="eyebrow light">Continuer · {STEP_LABEL[nextStep]}</p>
              <h2>
                {current.emoji} {current.title}
              </h2>
            </div>
            <span className="round-btn">
              <ChevronRight size={22} />
            </span>
          </div>
          <div className="continue-meta">
            <span>Thème {themes.indexOf(current) + 1} · {current.level}</span>
            <span>{Math.round(themeProgress(p, current.id) * 100)} % terminé</span>
          </div>
          <ProgressBar value={themeProgress(p, current.id)} tone="light" />
        </Link>

        <section className="block">
          <div className="block-head">
            <h3>Mots du jour</h3>
            <Link to="/fiches" className="link-muted">
              {learned} / {allVocab.length} maîtrisés <ChevronRight size={16} />
            </Link>
          </div>
          <div className="word-row">
            {daily.map((w) => (
              <div key={w.id} className={`card word-card ${p.memory[w.id] ? '' : 'new'}`}>
                <strong>{w.pt}</strong>
                <span className="muted">{w.fr}</span>
                <SpeakButton text={w.pt} small />
              </div>
            ))}
          </div>
        </section>

        <section className="card streak-card">
          <div className="block-head">
            <h3>
              <Flame size={20} className="flame" /> {s} jour{s > 1 ? 's' : ''} d’affilée
            </h3>
            <span className="accent-text">
              {todayXp >= p.dailyGoal ? 'Objectif atteint !' : `${todayXp} / ${p.dailyGoal} XP aujourd’hui`}
            </span>
          </div>
          <div className="week">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => {
              const key = dayKey(addDays(monday, i))
              const done = (days.get(key) ?? 0) > 0
              const isToday = key === dayKey()
              return (
                <div key={d} className={`day ${done ? 'done' : ''} ${isToday ? 'today' : ''}`}>
                  <span className="dot">{done ? '✓' : ''}</span>
                  <span>{d}</span>
                </div>
              )
            })}
          </div>
        </section>

        <Link to="/pratique/oral" className="card speaking-card">
          <div>
            <h3>Prononciation</h3>
            <p className="muted">Gagne en assurance, une phrase à la fois.</p>
            <div className="row">
              <Waveform bars={18} />
              <span className="chip-btn">
                <ChevronRight size={18} />
              </span>
            </div>
          </div>
          <Ring value={confidence} label="Confiance" />
        </Link>

        <Link to="/progres" className="card level-card">
          <div className="block-head">
            <h3>
              Niveau <LevelBadge level={level.level} />
            </h3>
            <span className="muted">{xp} XP</span>
          </div>
          <ProgressBar value={level.pct} tone="navy" />
          <p className="muted small">
            {level.next ? `Encore ${level.toNext} XP pour atteindre le niveau ${level.next.level}` : 'Niveau maximum atteint !'}
          </p>
        </Link>
      </div>
    </div>
  )
}
