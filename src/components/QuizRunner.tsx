import { useEffect, useRef, useState } from 'react'
import { Check, Undo2, Volume2, X } from 'lucide-react'
import { getProgress, restoreProgress, type ProgressState } from '../lib/store'
import { speak } from '../lib/speech'
import { ProgressBar } from './ui'
import { Reaction } from './Reaction'
import { react, type ReactionPhrase } from '../lib/reactions'

export interface QuizQuestion {
  prompt: string
  /** Texte portugais lu à voix haute (question d'écoute). */
  audio?: string
  hint?: string
  options: string[]
  answer: number
  cardId?: string
}

export function QuizRunner({
  questions,
  onAnswer,
  onFinish,
}: {
  questions: QuizQuestion[]
  onAnswer?: (q: QuizQuestion, correct: boolean) => void
  onFinish: (correct: number, total: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [reaction, setReaction] = useState<ReactionPhrase | null>(null)
  // Pour « Retour » : état de la progression et du score avant chaque réponse.
  const history = useRef<{ index: number; score: number; progress: ProgressState }[]>([])
  const q = questions[index]

  useEffect(() => {
    if (q?.audio) speak(q.audio)
  }, [q])

  const undo = () => {
    // Question déjà répondue : on annule cette réponse ; sinon on revient à la précédente (non répondue).
    const target = history.current.pop()
    if (!target) return
    restoreProgress(target.progress)
    setIndex(target.index)
    setScore(target.score)
    setPicked(null)
    setReaction(null)
  }
  const undoRef = useRef(undo)
  undoRef.current = undo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Backspace' || (e.target as HTMLElement | null)?.closest('input, textarea, select')) return
      e.preventDefault()
      undoRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!q) return null

  const choose = (i: number) => {
    if (picked !== null) return
    history.current.push({ index, score, progress: getProgress() })
    setPicked(i)
    const ok = i === q.answer
    if (ok) setScore((s) => s + 1)
    setReaction(react(ok))
    onAnswer?.(q, ok)
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      onFinish(score, questions.length)
    } else {
      setIndex(index + 1)
      setPicked(null)
    }
  }

  return (
    <div className="quiz">
      <div className="quiz-progress">
        <button className="undo-btn" onClick={undo} disabled={history.current.length === 0} aria-label="Revenir en arrière" title="Revenir en arrière (⌫)">
          <Undo2 size={18} />
        </button>
        <ProgressBar value={index / questions.length} />
        <span>
          {index + 1} / {questions.length}
        </span>
      </div>
      <div className="card quiz-card">
        {q.hint && <p className="eyebrow">{q.hint}</p>}
        {q.audio ? (
          <button className="audio-prompt" onClick={() => speak(q.audio!)}>
            <Volume2 size={36} />
            <span>Réécouter</span>
          </button>
        ) : (
          <h2 className="phrase">{q.prompt}</h2>
        )}
        {q.audio && <p className="muted">{q.prompt}</p>}
      </div>
      <div className="options">
        {q.options.map((opt, i) => {
          const state = picked === null ? '' : i === q.answer ? 'correct' : i === picked ? 'wrong' : 'dim'
          return (
            <button key={i} className={`option ${state}`} onClick={() => choose(i)} disabled={picked !== null}>
              <span>{opt}</span>
              {state === 'correct' && <Check size={18} />}
              {state === 'wrong' && <X size={18} />}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className={`feedback ${picked === q.answer ? 'ok' : 'ko'}`}>
          <div className="grow">
            {reaction && <Reaction r={reaction} success={picked === q.answer} />}
            {picked !== q.answer && (
              <p className="answer-line">
                Réponse : <strong>{q.options[q.answer]}</strong>
              </p>
            )}
          </div>
          <button className="btn btn-primary" onClick={next} autoFocus>
            {index + 1 >= questions.length ? 'Terminer' : 'Continuer'}
          </button>
        </div>
      )}
    </div>
  )
}

export function ResultScreen({
  correct,
  total,
  onRetry,
  onDone,
  doneLabel = 'Terminer',
}: {
  correct: number
  total: number
  onRetry?: () => void
  onDone: () => void
  doneLabel?: string
}) {
  const pct = total ? Math.round((correct / total) * 100) : 0
  const msg = pct >= 90 ? 'Parabéns ! Excellent travail.' : pct >= 60 ? 'Muito bem ! Continue comme ça.' : 'Pas mal ! Un peu de révision et ce sera parfait.'
  return (
    <div className="card result">
      <div className="result-emoji">{pct >= 90 ? '🏆' : pct >= 60 ? '🎉' : '💪'}</div>
      <h2>
        {correct} / {total}
      </h2>
      <p className="muted">{msg}</p>
      <div className="row gap">
        {onRetry && (
          <button className="btn btn-ghost" onClick={onRetry}>
            Recommencer
          </button>
        )}
        <button className="btn btn-primary" onClick={onDone}>
          {doneLabel}
        </button>
      </div>
    </div>
  )
}
