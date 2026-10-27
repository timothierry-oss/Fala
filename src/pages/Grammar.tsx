import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, Check, ChevronRight, Dumbbell, Lock, Target, Trophy } from 'lucide-react'
import { allExercises, notionById, notions, tenseOf, tenses, type Block, type Exercise, type Notion, type Tense } from '../data/grammar'
import { LevelBadge, PageHeader, ProgressBar, SpeakButton, Tip } from '../components/ui'
import { ExerciseView, Rich } from '../components/ExerciseView'
import { ResultScreen } from '../components/QuizRunner'
import { StudySession } from '../lib/memory'
import { sample } from '../lib/text'
import { getProgress, recordExercise, restoreProgress, updateGrammar, useProgress, weakExercises, type ProgressState } from '../lib/store'
import { UndoButton, useBackspace, useUndoStack } from '../components/undo'
import { Counters, type Verdicts } from '../components/Counters'
import type { SessionSnapshot } from '../lib/memory'
import { NotFound } from './NotFound'
import { PathTabs } from './Path'
import { ChallengeSection } from './Challenges'

type Phase = 'learn' | 'train' | 'master'

const PHASES: { id: Phase; label: string; icon: typeof BookOpen; desc: string }[] = [
  { id: 'learn', label: 'Apprentissage', icon: BookOpen, desc: 'La règle, des exemples et 3 questions guidées' },
  { id: 'train', label: 'Entraînement', icon: Dumbbell, desc: 'Chaque exercice réussi en QCM puis à l’écrit' },
  { id: 'master', label: 'Maîtrise', icon: Trophy, desc: 'Test écrit sans aide : 80 % pour valider' },
]

function phaseDone(p: ProgressState, id: string, phase: Phase) {
  const g = p.grammar[id] ?? {}
  return phase === 'learn' ? !!g.learned : phase === 'train' ? !!g.trained : !!g.mastered
}

const notionProgress = (p: ProgressState, id: string) => PHASES.filter((ph) => phaseDone(p, id, ph.id)).length / 3

const weakByNotion = (p: ProgressState) => {
  const m = new Map<string, number>()
  for (const id of weakExercises(p)) {
    const nid = allExercises.find((e) => e.id === id)?.notion
    if (nid) m.set(nid, (m.get(nid) ?? 0) + 1)
  }
  return m
}

function NotionCard({ nn, p, weak }: { nn: Notion; p: ProgressState; weak: number }) {
  const prog = notionProgress(p, nn.id)
  return (
    <Link to={`/grammaire/${nn.id}`} className="card step">
      <span className={`step-icon ${prog === 1 ? 'done-icon' : ''}`}>{prog === 1 ? <Check size={20} /> : <LevelBadge level={nn.level} />}</span>
      <div className="grow">
        <h3>{nn.title}</h3>
        <p className="muted small">{nn.ptTitle}</p>
        <div className="row gap-sm">
          <div className="phase-dots">
            {PHASES.map((ph) => (
              <span key={ph.id} className={phaseDone(p, nn.id, ph.id) ? 'on' : ''} title={ph.label} />
            ))}
          </div>
          {weak > 0 && <span className="tag tag-warn">{weak} à revoir</span>}
        </div>
      </div>
      <ChevronRight size={20} className="muted" />
    </Link>
  )
}

function TenseCard({ t, p, weakMap }: { t: Tense; p: ProgressState; weakMap: Map<string, number> }) {
  const list = t.notions.map((id) => notionById(id)!)
  // Un temps avec une seule notion mène directement à celle-ci.
  if (list.length === 1) return <NotionCard nn={list[0]} p={p} weak={weakMap.get(list[0].id) ?? 0} />
  const mastered = list.filter((nn) => notionProgress(p, nn.id) === 1).length
  const prog = list.reduce((a, nn) => a + notionProgress(p, nn.id), 0) / list.length
  const weak = list.reduce((a, nn) => a + (weakMap.get(nn.id) ?? 0), 0)
  return (
    <Link to={`/grammaire/temps/${t.id}`} className="card step">
      <span className={`step-icon emoji ${prog === 1 ? 'done-icon' : ''}`}>{prog === 1 ? <Check size={20} /> : t.emoji}</span>
      <div className="grow">
        <h3>{t.title}</h3>
        <p className="muted small">
          {list.length} notions · {mastered} maîtrisée{mastered > 1 ? 's' : ''}
        </p>
        <div className="row gap-sm">
          <ProgressBar value={prog} />
          {weak > 0 && <span className="tag tag-warn nowrap">{weak} à revoir</span>}
        </div>
      </div>
      <ChevronRight size={20} className="muted" />
    </Link>
  )
}

export function GrammarPath() {
  const p = useProgress()
  const weak = weakExercises(p)
  const weakMap = weakByNotion(p)

  return (
    <div className="page">
      <PageHeader eyebrow="Parcours d’apprentissage" title="Grammaire & conjugaison" />
      <PathTabs active="grammaire" />

      <Link to="/grammaire/revision" className={`continue-card compact ${weak.length ? '' : 'disabled'}`}>
        <div className="continue-top">
          <div>
            <p className="eyebrow light">Alimenté par tes erreurs</p>
            <h2>🎯 Mes points faibles</h2>
            <p className="light-text">
              {weak.length
                ? `${weak.length} exercice${weak.length > 1 ? 's' : ''} à retravailler · ${[...weakMap.keys()].map((id) => notionById(id)?.title).slice(0, 2).join(', ')}${weakMap.size > 2 ? '…' : ''}`
                : 'Aucune erreur à retravailler pour l’instant.'}
            </p>
          </div>
          <span className="round-btn">
            <ChevronRight size={22} />
          </span>
        </div>
      </Link>

      <section className="path-level">
        <h2 className="section-title">Conjugaison</h2>
        <p className="muted small">Les temps, regroupés</p>
        <div className="vocab-list">
          {tenses.map((t) => (
            <TenseCard key={t.id} t={t} p={p} weakMap={weakMap} />
          ))}
        </div>
      </section>

      <section className="path-level">
        <h2 className="section-title">Grammaire</h2>
        <p className="muted small">Les structures de la phrase</p>
        <div className="vocab-list">
          {notions
            .filter((nn) => nn.cat === 'grammaire')
            .map((nn) => (
              <NotionCard key={nn.id} nn={nn} p={p} weak={weakMap.get(nn.id) ?? 0} />
            ))}
        </div>
      </section>

      <ChallengeSection p={p} />
    </div>
  )
}

export function TensePage() {
  const { tenseId } = useParams()
  const p = useProgress()
  const t = tenses.find((x) => x.id === tenseId)
  if (!t) return <NotFound />
  const weakMap = weakByNotion(p)
  const list = t.notions.map((id) => notionById(id)!)
  return (
    <div className="page narrow">
      <PageHeader back="/grammaire" eyebrow={`Conjugaison · ${t.ptTitle}`} title={`${t.emoji} ${t.title}`} />
      <p className="muted lead">{t.summary}</p>
      <ProgressBar value={list.reduce((a, nn) => a + notionProgress(p, nn.id), 0) / list.length} />
      <div className="vocab-list single">
        {list.map((nn) => (
          <NotionCard key={nn.id} nn={nn} p={p} weak={weakMap.get(nn.id) ?? 0} />
        ))}
      </div>
    </div>
  )
}

function LessonBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="lesson">
      {blocks.map((b, i) => {
        if (b.t === 'p')
          return (
            <p key={i}>
              <Rich text={b.text} />
            </p>
          )
        if (b.t === 'tip')
          return (
            <Tip key={i}>
              <Rich text={b.text} />
            </Tip>
          )
        if (b.t === 'ex')
          return (
            <div key={i} className="example lesson-ex">
              <p className="row gap-sm">
                {b.pt} <SpeakButton text={b.pt} small />
              </p>
              <p className="muted">{b.fr}</p>
            </div>
          )
        return (
          <div key={i} className="table-wrap">
            <table className="conj">
              <thead>
                <tr>
                  {b.head.map((h, j) => (
                    <th key={j}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, j) => (
                  <tr key={j}>
                    {r.map((c, k) => (
                      <td key={k}>
                        <Rich text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

export function NotionPage() {
  const { notionId } = useParams()
  const p = useProgress()
  const nav = useNavigate()
  const notion = notionById(notionId ?? '')
  const [active, setActive] = useState<Phase | null>(null)
  if (!notion) return <NotFound />

  const unlocked = (ph: Phase) => ph === 'learn' || (ph === 'train' ? phaseDone(p, notion.id, 'learn') : phaseDone(p, notion.id, 'train'))
  const close = () => setActive(null)

  if (active === 'learn') return <LearnPhase notion={notion} onClose={close} />
  if (active === 'train') return <TrainPhase notion={notion} onClose={close} />
  if (active === 'master') return <MasterPhase notion={notion} onClose={close} />

  const weak = weakExercises(p).filter((id) => id.startsWith(`${notion.id}-`)).length
  const tense = tenseOf(notion.id)
  const backTo = tense && tense.notions.length > 1 ? `/grammaire/temps/${tense.id}` : '/grammaire'
  return (
    <div className="page narrow">
      <PageHeader back={backTo} eyebrow={`${notion.ptTitle} · ${notion.level}`} title={notion.title} />
      <p className="muted lead">{notion.summary}</p>
      <ProgressBar value={notionProgress(p, notion.id)} />
      <ol className="steps single">
        {PHASES.map((ph, i) => {
          const done = phaseDone(p, notion.id, ph.id)
          const open = unlocked(ph.id)
          return (
            <li key={ph.id}>
              <button className={`card step ${done ? 'done' : ''} ${open ? '' : 'locked'}`} disabled={!open} onClick={() => setActive(ph.id)}>
                <span className="step-icon">{done ? <Check size={20} /> : open ? <ph.icon size={20} /> : <Lock size={18} />}</span>
                <div className="grow">
                  <p className="eyebrow">Phase {i + 1}</p>
                  <h3>{ph.label}</h3>
                  <p className="muted small">
                    {ph.id === 'master' && p.grammar[notion.id]?.best ? `Meilleur score ${p.grammar[notion.id]?.best} % · ` : ''}
                    {open ? ph.desc : 'Termine la phase précédente pour débloquer'}
                  </p>
                </div>
                <ChevronRight size={20} className="muted" />
              </button>
            </li>
          )
        })}
      </ol>
      {weak > 0 && (
        <button className="card step" onClick={() => nav(`/grammaire/revision?notion=${notion.id}`)}>
          <span className="step-icon warn">
            <Target size={20} />
          </span>
          <div className="grow">
            <h3>Retravailler mes erreurs</h3>
            <p className="muted small">{weak} exercice(s) raté(s) sur cette notion</p>
          </div>
          <ChevronRight size={20} className="muted" />
        </button>
      )}
      <h2 className="section-title">Mémo</h2>
      <div className="card">
        <LessonBlocks blocks={notion.lesson} />
      </div>
    </div>
  )
}

export function LearnPhase({ notion, onClose }: { notion: Notion; onClose: () => void }) {
  const [step, setStep] = useState<'lesson' | number>('lesson')
  const [score, setScore] = useState(0)
  const guided = useMemo(() => sample(notion.exercises, 3), [notion])
  const undoStack = useUndoStack<{ step: number; score: number; progress: ProgressState; verdicts: Verdicts }>()
  const [verdicts, setVerdicts] = useState<Verdicts>({})
  const [pending, setPending] = useState(false)
  const [retry, setRetry] = useState(0)
  const undo = () => {
    if (pending) {
      setPending(false)
      setRetry((r) => r + 1)
      return
    }
    const s = undoStack.pop()
    if (!s) return
    restoreProgress(s.progress)
    setVerdicts(s.verdicts)
    setStep(s.step)
    setScore(s.score)
    setRetry((r) => r + 1)
  }
  useBackspace(() => typeof step === 'number' && undo())

  if (step === 'lesson') {
    return (
      <div className="page narrow">
        <PageHeader eyebrow="Phase 1 · Apprentissage" title={notion.title} />
        <div className="card">
          <LessonBlocks blocks={notion.lesson} />
        </div>
        <button className="btn btn-primary block" onClick={() => setStep(0)}>
          J’ai lu, je vérifie avec 3 questions
        </button>
        <button className="btn btn-ghost block" onClick={onClose}>
          Retour
        </button>
      </div>
    )
  }
  if (step >= guided.length) {
    return (
      <div className="page narrow">
        <ResultScreen correct={score} total={guided.length} onDone={onClose} doneLabel="Passer à l’entraînement" />
      </div>
    )
  }
  return (
    <div className="page narrow">
      <PageHeader eyebrow={`Question guidée ${step + 1} / ${guided.length}`} title={notion.title} right={<UndoButton onClick={undo} disabled={!pending && undoStack.size === 0} />} />
      <Counters verdicts={verdicts} okLabel="Réussi" />
      <ExerciseView
        key={`${guided[step].id}-${retry}`}
        e={guided[step]}
        onAnswered={() => setPending(true)}
        mode="choice"
        extra={
          <details className="memo">
            <summary>Revoir la règle</summary>
            <LessonBlocks blocks={notion.lesson.filter((b) => b.t === 'table' || b.t === 'p')} />
          </details>
        }
        onDone={(ok) => {
          undoStack.push({ step, score, progress: getProgress(), verdicts })
          setPending(false)
          setVerdicts((v) => ({ ...v, [guided[step].id]: ok ? 'good' : 'again' }))
          recordExercise(guided[step].id, ok)
          const s = score + (ok ? 1 : 0)
          setScore(s)
          if (step + 1 >= guided.length) updateGrammar(notion.id, { learned: true })
          setStep(step + 1)
        }}
      />
    </div>
  )
}

/** Session intelligente sur une liste d'exercices : QCM tant que l'exercice est nouveau, puis écrit. */
function ExerciseSession({
  exercises,
  isDone,
  title,
  eyebrow,
  onFinished,
  onClose,
}: {
  exercises: Exercise[]
  isDone: (id: string, good: number) => boolean
  title: string
  eyebrow: string
  onFinished: () => void
  onClose: () => void
}) {
  const session = useMemo(() => new StudySession(exercises.map((e) => e.id), { roundSize: 15, maxActive: 5, isDone }), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [current, setCurrent] = useState(() => session.next())
  const [turn, setTurn] = useState(0)
  const [pause, setPause] = useState<{ c: number; t: number } | null>(null)
  const undoStack = useUndoStack<{ current: string | null; turn: number; progress: ProgressState; session: SessionSnapshot; verdicts: Verdicts }>()
  const [verdicts, setVerdicts] = useState<Verdicts>({})
  const [pending, setPending] = useState(false)
  const [retry, setRetry] = useState(0)
  const undo = () => {
    if (pending) {
      setPending(false)
      setRetry((r) => r + 1)
      return
    }
    const s = undoStack.pop()
    if (!s) return
    restoreProgress(s.progress)
    setVerdicts(s.verdicts)
    session.restore(s.session)
    setCurrent(s.current)
    setTurn(s.turn)
    setPause(null)
    setRetry((r) => r + 1)
  }
  useBackspace(undo)
  const ex = exercises.find((e) => e.id === current)
  const total = exercises.length
  const remaining = exercises.filter((e) => !isDone(e.id, 0)).length

  if (pause) {
    return (
      <div className="page narrow">
        <div className="card result">
          <div className="result-emoji">⏸️</div>
          <h2>
            Série terminée : {pause.c} / {pause.t}
          </h2>
          <p className="muted">Encore {remaining} exercice(s) à consolider sur {total}.</p>
          <div className="row gap center wrap">
            <button className="btn btn-ghost" onClick={undo}>
              Retour
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Arrêter
            </button>
            <button className="btn btn-primary" onClick={() => setPause(null)} autoFocus>
              Continuer
            </button>
          </div>
        </div>
      </div>
    )
  }
  if (!ex) {
    return (
      <div className="page narrow">
        <div className="card result">
          <div className="result-emoji">🏆</div>
          <h2>Bravo !</h2>
          <p className="muted">Tous les exercices sont réussis.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              onFinished()
              onClose()
            }}
          >
            Terminer
          </button>
        </div>
      </div>
    )
  }
  const stage = getProgress().exercises[ex.id]?.stage ?? 0
  const isRetry = session.isRetry(ex.id)
  return (
    <div className="page narrow">
      <PageHeader eyebrow={eyebrow} title={title} right={<span className="muted small">{total - remaining} / {total} réussis</span>} />
      <div className="study-top">
        <UndoButton onClick={undo} disabled={!pending && undoStack.size === 0} />
        <ProgressBar value={(total - remaining) / total} />
      </div>
      <Counters verdicts={verdicts} okLabel="Réussi" />
      {isRetry && <p className="retry-note">Nouvel essai · cette réponse ne compte pas</p>}
      <ExerciseView
        key={`${ex.id}-${turn}-${retry}`}
        e={ex}
        mode={stage === 0 ? 'choice' : 'type'}
        onAnswered={() => setPending(true)}
        onDone={(ok) => {
          undoStack.push({ current, turn, progress: getProgress(), session: session.snapshot(), verdicts })
          setPending(false)
          if (isRetry) {
            // Nouvel essai après une erreur : ne compte ni dans la progression ni dans les compteurs.
            session.recordRetry(ex.id, ok)
            setCurrent(session.next())
            setTurn(turn + 1)
            return
          }
          setVerdicts((v) => ({ ...v, [ex.id]: ok ? 'good' : 'again' }))
          recordExercise(ex.id, ok)
          session.record(ex.id, ok ? 'good' : 'again')
          if (session.roundOver) {
            setPause({ c: session.roundCorrect, t: session.roundStep })
            session.newRound()
          }
          setCurrent(session.next())
          setTurn(turn + 1)
        }}
      />
      <button className="btn btn-ghost block" onClick={onClose}>
        Arrêter pour l’instant
      </button>
    </div>
  )
}

function TrainPhase({ notion, onClose }: { notion: Notion; onClose: () => void }) {
  const alreadyTrained = !!getProgress().grammar[notion.id]?.trained
  return (
    <ExerciseSession
      exercises={notion.exercises}
      // Terminé quand l'exercice a été réussi en QCM puis à l'écrit (ou une fois si la phase est déjà validée).
      isDone={(id, good) => (alreadyTrained ? good >= 1 : (getProgress().exercises[id]?.stage ?? 0) >= 2)}
      title={notion.title}
      eyebrow="Phase 2 · Entraînement"
      onFinished={() => updateGrammar(notion.id, { trained: true })}
      onClose={onClose}
    />
  )
}

function MasterPhase({ notion, onClose }: { notion: Notion; onClose: () => void }) {
  const test = useMemo(() => sample(notion.exercises, 8), [notion])
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [run, setRun] = useState(0)
  const undoStack = useUndoStack<{ i: number; score: number; progress: ProgressState; verdicts: Verdicts }>()
  const [verdicts, setVerdicts] = useState<Verdicts>({})
  const [pending, setPending] = useState(false)
  const [retry, setRetry] = useState(0)
  const undo = () => {
    if (pending) {
      setPending(false)
      setRetry((r) => r + 1)
      return
    }
    const s = undoStack.pop()
    if (!s) return
    restoreProgress(s.progress)
    setVerdicts(s.verdicts)
    setI(s.i)
    setScore(s.score)
    setRetry((r) => r + 1)
  }
  useBackspace(() => i < test.length && undo())

  if (i >= test.length) {
    const pct = Math.round((score / test.length) * 100)
    const ok = pct >= 80
    return (
      <div className="page narrow">
        <div className="card result">
          <div className="result-emoji">{ok ? '🏆' : '💪'}</div>
          <h2>{pct} %</h2>
          <p className="muted">{ok ? 'Notion maîtrisée ! Parabéns!' : 'Il faut 80 % pour valider. Tes erreurs sont ajoutées à tes points faibles.'}</p>
          <div className="row gap center">
            {!ok && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setI(0)
                  setScore(0)
                  setRun(run + 1)
                  setVerdicts({})
                }}
              >
                Recommencer
              </button>
            )}
            <button className="btn btn-primary" onClick={onClose}>
              Terminer
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="page narrow">
      <PageHeader eyebrow={`Phase 3 · Maîtrise · ${i + 1} / ${test.length}`} title={notion.title} />
      <div className="study-top">
        <UndoButton onClick={undo} disabled={!pending && undoStack.size === 0} />
        <ProgressBar value={i / test.length} />
      </div>
      <Counters verdicts={verdicts} okLabel="Réussi" />
      <ExerciseView
        key={`${run}-${test[i].id}-${retry}`}
        e={test[i]}
        mode="type"
        showTranslation={false}
        onAnswered={() => setPending(true)}
        onDone={(ok) => {
          undoStack.push({ i, score, progress: getProgress(), verdicts })
          setPending(false)
          setVerdicts((v) => ({ ...v, [test[i].id]: ok ? 'good' : 'again' }))
          recordExercise(test[i].id, ok)
          const s = score + (ok ? 1 : 0)
          setScore(s)
          if (i + 1 >= test.length) {
            const pct = Math.round((s / test.length) * 100)
            updateGrammar(notion.id, pct >= 80 ? { mastered: true, best: pct } : { best: pct })
          }
          setI(i + 1)
        }}
      />
    </div>
  )
}

export function GrammarReview() {
  const nav = useNavigate()
  const notionFilter = new URLSearchParams(location.search).get('notion')
  const p = getProgress()
  const exercises = useMemo(() => {
    const ids = weakExercises(p).filter((id) => !notionFilter || id.startsWith(`${notionFilter}-`))
    return allExercises.filter((e) => ids.includes(e.id))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!exercises.length) {
    return (
      <div className="page narrow">
        <PageHeader back="/grammaire" eyebrow="Mes points faibles" title="Révision ciblée" />
        <div className="card result">
          <div className="result-emoji">✨</div>
          <h2>Nada para revisar!</h2>
          <p className="muted">Tes erreurs en grammaire apparaîtront ici. Chaque exercice raté doit être réussi 2 fois d’affilée pour sortir de la liste.</p>
        </div>
      </div>
    )
  }
  return (
    <ExerciseSession
      exercises={exercises}
      isDone={(id) => !getProgress().exercises[id]?.weak}
      title="Révision ciblée"
      eyebrow="Mes points faibles"
      onFinished={() => {}}
      onClose={() => nav('/grammaire')}
    />
  )
}
