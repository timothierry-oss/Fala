import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Check, ChevronRight, Headphones, Mic, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { themeById, themes } from '../data/themes'
import type { StepId } from '../data/types'
import { LevelBadge, PageHeader, ProgressBar, SpeakButton } from '../components/ui'
import { QuizRunner, ResultScreen } from '../components/QuizRunner'
import { buildVocabQuiz } from '../lib/quiz'
import { NavLink } from 'react-router-dom'
import { allVocab } from '../data/themes'
import { completeStep, recordReview, stepDone, themeProgress, useProgress } from '../lib/store'
import { NotFound } from './NotFound'

export const STEPS: { id: StepId; label: string; desc: string; icon: typeof BookOpen; href: (id: string) => string }[] = [
  { id: 'vocabulaire', label: 'Vocabulaire', desc: 'Découvre les mots avec les fiches', icon: BookOpen, href: (id) => `/fiches/${id}?mode=apprendre` },
  { id: 'ecoute', label: 'Compréhension orale', desc: 'Écoute un dialogue et réponds', icon: Headphones, href: (id) => `/ecoute/${id}` },
  { id: 'oral', label: 'Prononciation', desc: 'Répète les phrases clés à voix haute', icon: Mic, href: (id) => `/oral/${id}` },
  { id: 'quiz', label: 'Quiz final', desc: 'Valide le thème', icon: Trophy, href: (id) => `/parcours/${id}/quiz` },
]

export function PathTabs({ active }: { active: 'themes' | 'grammaire' }) {
  return (
    <div className="segmented" role="tablist">
      <NavLink to="/parcours" role="tab" aria-selected={active === 'themes'} className={active === 'themes' ? 'active' : ''}>
        Thèmes
      </NavLink>
      <NavLink to="/grammaire" role="tab" aria-selected={active === 'grammaire'} className={active === 'grammaire' ? 'active' : ''}>
        Grammaire & conjugaison
      </NavLink>
    </div>
  )
}

export function Path() {
  const p = useProgress()
  const levels = ['A1', 'A2'] as const
  return (
    <div className="page">
      <PageHeader eyebrow="Parcours d’apprentissage" title="Ta trilha" />
      <PathTabs active="themes" />
      <p className="muted lead">Avance thème par thème : vocabulaire, écoute, prononciation, puis quiz final.</p>
      {levels.map((lvl) => (
        <section key={lvl} className="path-level">
          <h2 className="section-title">
            <LevelBadge level={lvl} /> {lvl === 'A1' ? 'Découverte' : 'Survie au quotidien'}
          </h2>
          <ol className="path">
            {themes
              .filter((t) => t.level === lvl)
              .map((t) => {
                const prog = themeProgress(p, t.id)
                return (
                  <li key={t.id} className={`path-node ${prog === 1 ? 'done' : prog > 0 ? 'started' : ''}`}>
                    <span className="path-dot">{prog === 1 ? <Check size={18} /> : t.emoji}</span>
                    <Link to={`/parcours/${t.id}`} className="card path-card">
                      <div className="grow">
                        <p className="eyebrow">{t.ptTitle}</p>
                        <h3>{t.title}</h3>
                        <p className="muted small">{t.description}</p>
                        <div className="row gap-sm">
                          <ProgressBar value={prog} />
                          <span className="small muted nowrap">{Math.round(prog * 4)}/4</span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="muted" />
                    </Link>
                  </li>
                )
              })}
          </ol>
        </section>
      ))}
      <div className="card soon">
        <LevelBadge level="B1" /> <span className="muted">Les thèmes B1 arrivent bientôt.</span>
      </div>
    </div>
  )
}

export function ThemeDetail() {
  const { themeId } = useParams()
  const p = useProgress()
  const theme = themeById(themeId ?? '')
  if (!theme) return <NotFound />
  return (
    <div className="page">
      <PageHeader back="/parcours" eyebrow={`${theme.ptTitle} · ${theme.level}`} title={`${theme.emoji} ${theme.title}`} />
      <p className="muted lead">{theme.description}</p>
      <ProgressBar value={themeProgress(p, theme.id)} />

      <ol className="steps">
        {STEPS.map((s, i) => {
          const done = stepDone(p, theme.id, s.id)
          const score = p.steps[`${theme.id}:${s.id}`]?.score
          return (
            <li key={s.id}>
              <Link to={s.href(theme.id)} className={`card step ${done ? 'done' : ''}`}>
                <span className="step-icon">{done ? <Check size={20} /> : <s.icon size={20} />}</span>
                <div className="grow">
                  <p className="eyebrow">Étape {i + 1}</p>
                  <h3>{s.label}</h3>
                  <p className="muted small">{done ? `Terminé · meilleur score ${score} %` : s.desc}</p>
                </div>
                <ChevronRight size={20} className="muted" />
              </Link>
            </li>
          )
        })}
      </ol>

      <h2 className="section-title">Vocabulaire du thème</h2>
      <div className="vocab-list">
        {theme.vocab.map((v) => (
          <div key={v.id} className="card vocab-row">
            <div className="grow">
              <strong>{v.pt}</strong>
              <span className="muted"> — {v.fr}</span>
              {v.note && <p className="small muted">{v.note}</p>}
            </div>
            <SpeakButton text={v.pt} small />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ThemeQuiz() {
  const { themeId } = useParams()
  const nav = useNavigate()
  const theme = themeById(themeId ?? '')
  const [run, setRun] = useState(0)
  const [result, setResult] = useState<{ c: number; t: number } | null>(null)
  const questions = useMemo(() => (theme ? buildVocabQuiz(theme.vocab, allVocab, 10) : []), [theme, run])
  if (!theme) return <NotFound />

  return (
    <div className="page narrow">
      <PageHeader close={`/parcours/${theme.id}`} eyebrow="Quiz final" title={theme.title} />
      {result ? (
        <ResultScreen
          correct={result.c}
          total={result.t}
          onRetry={() => {
            setResult(null)
            setRun(run + 1)
          }}
          onDone={() => nav(`/parcours/${theme.id}`)}
          doneLabel="Retour au thème"
        />
      ) : (
        <QuizRunner
          key={run}
          questions={questions}
          onAnswer={(q, ok) => q.cardId && recordReview(q.cardId, ok ? 'good' : 'again', 'vocabulaire', 3)}
          onFinish={(c, t) => {
            completeStep(theme.id, 'quiz', Math.round((c / t) * 100))
            setResult({ c, t })
          }}
        />
      )}
    </div>
  )
}
