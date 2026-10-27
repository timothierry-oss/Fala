import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { allVocab } from '../data/themes'
import { challengeById } from '../data/challenges'
import { PageHeader, ProgressBar } from '../components/ui'
import { Counters, type Verdicts } from '../components/Counters'
import { UndoButton, useBackspace, useUndoStack } from '../components/undo'
import { ExerciseView } from '../components/ExerciseView'
import { QuestionView, SLOW_MCQ, SLOW_TYPE } from '../components/SmartStudy'
import { RoutineCloze } from '../components/RoutineCloze'
import { RoutineTranslation } from '../components/RoutineTranslation'
import { LearnPhase } from './Grammar'
import { StudySession, type Quality, type SessionSnapshot } from '../lib/memory'
import { questionFor } from '../lib/questions'
import { buildRoutine, type RoutineItem } from '../lib/routine'
import { getProgress, markRoutineDone, recordExercise, recordReview, restoreProgress, setItemStage, useProgress, type ProgressState } from '../lib/store'

const KIND_LABEL: Record<RoutineItem['kind'], string> = {
  vocab: 'Vocabulaire',
  grammar: 'Grammaire',
  'learn-notion': 'Nouvelle notion',
  cloze: 'Texte à trous',
  translation: 'Traduction',
}

interface Step {
  id: string | null
  turn: number
  progress: ProgressState
  session: SessionSnapshot
  verdicts: Verdicts
  built: RoutineItem[]
}

export function RoutinePage() {
  const nav = useNavigate()
  useProgress() // re-rend quand la progression change (scores, etc.)

  const [built, setBuilt] = useState<RoutineItem[]>(() => buildRoutine(getProgress()))
  const session = useMemo(() => new StudySession(built.map((i) => i.id), { roundSize: 20, maxActive: built.length, isDone: (_id, good) => good >= 1 }), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [currentId, setCurrentId] = useState<string | null>(() => session.next())
  const [turn, setTurn] = useState(0)
  const [view, setView] = useState<'study' | 'round'>('study')
  const [lastRound, setLastRound] = useState({ correct: 0, total: 0 })
  const [verdicts, setVerdicts] = useState<Verdicts>({})
  const [retry, setRetry] = useState(0)

  const undoStack = useUndoStack<Step>()

  const byId = useMemo(() => new Map(built.map((i) => [i.id, i])), [built])
  const current = currentId ? byId.get(currentId) : undefined
  const isRetry = currentId ? session.isRetry(currentId) : false

  const checkpoint = () => {
    undoStack.push({ id: currentId, turn, progress: getProgress(), session: session.snapshot(), verdicts, built })
  }

  const undo = () => {
    const s = undoStack.pop()
    if (!s) return
    restoreProgress(s.progress)
    session.restore(s.session)
    setVerdicts(s.verdicts)
    setBuilt(s.built)
    setCurrentId(s.id)
    setTurn(s.turn)
    setView('study')
    setRetry((r) => r + 1)
  }
  useBackspace(undo)
  const canUndo = undoStack.size > 0

  const advance = (id: string, mark: Verdicts[string] | null) => {
    if (mark) setVerdicts((v) => ({ ...v, [id]: mark }))
    if (session.roundOver) {
      const r = { correct: session.roundCorrect, total: session.roundStep }
      setLastRound(r)
      markRoutineDone()
      session.newRound()
      setView('round')
    }
    setCurrentId(session.next())
    setTurn((t) => t + 1)
  }

  const finishAnswer = (ok: boolean, quality: Quality) => {
    if (isRetry && currentId) {
      session.recordRetry(currentId, ok)
      advance(currentId, null)
      return
    }
    if (currentId) session.record(currentId, quality)
    advance(currentId!, ok ? 'good' : 'again')
  }

  const extendRoutine = () => {
    const more = buildRoutine(getProgress())
    const fresh = more.filter((i) => !byId.has(i.id))
    if (fresh.length) {
      session.extend(fresh.map((i) => i.id))
      setBuilt((b) => [...b, ...fresh])
    }
    setView('study')
    if (!currentId) setCurrentId(session.next())
  }

  if (view === 'round') {
    return (
      <div className="page narrow">
        <div className="card result">
          <div className="result-emoji">⏸️</div>
          <h2>
            Série terminée : {lastRound.correct} / {lastRound.total}
          </h2>
          <p className="muted">Ta progression dans le parcours est enregistrée.</p>
          <div className="row gap center wrap">
            <button className="btn btn-ghost" onClick={() => nav('/')}>
              Arrêter
            </button>
            <button className="btn btn-primary" onClick={extendRoutine} autoFocus>
              Continuer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="page narrow">
        <div className="card result">
          <div className="result-emoji">🏆</div>
          <h2>Rien à réviser pour l’instant !</h2>
          <p className="muted">Reviens plus tard, ou continue depuis le Parcours ou la Grammaire.</p>
          <button className="btn btn-primary" onClick={() => nav('/')}>
            Retour à l’accueil
          </button>
        </div>
      </div>
    )
  }

  if (current.kind === 'learn-notion') {
    return (
      <LearnPhase
        key={`${current.id}-${retry}`}
        notion={current.notion}
        onClose={() => {
          checkpoint()
          session.record(current.id, 'good')
          advance(current.id, 'good')
        }}
      />
    )
  }

  return (
    <div className="page narrow">
      <PageHeader back={true} eyebrow={`Routine · ${KIND_LABEL[current.kind]}`} title="C’est parti !" right={<UndoButton onClick={undo} disabled={!canUndo} />} />
      <div className="study-top">
        <ProgressBar value={session.roundStep / (session.opts.roundSize ?? 20)} />
      </div>
      <Counters verdicts={verdicts} okLabel="Réussi" />
      {isRetry && <p className="retry-note">Nouvel essai · cette réponse ne compte pas</p>}

      {current.kind === 'vocab' && (
        <VocabQuestion key={`${current.id}-${turn}-${retry}`} item={current} isRetry={isRetry} onBeforeAnswer={checkpoint} onFinish={finishAnswer} />
      )}

      {current.kind === 'grammar' && (
        <GrammarQuestion key={`${current.id}-${turn}-${retry}`} item={current} isRetry={isRetry} onBeforeAnswer={checkpoint} onFinish={finishAnswer} />
      )}

      {current.kind === 'cloze' && (
        <ClozeQuestion key={`${current.id}-${turn}-${retry}`} item={current} isRetry={isRetry} onBeforeAnswer={checkpoint} onFinish={finishAnswer} />
      )}

      {current.kind === 'translation' && (
        <TranslationQuestion key={`${current.id}-${turn}-${retry}`} item={current} isRetry={isRetry} onBeforeAnswer={checkpoint} onFinish={finishAnswer} />
      )}
    </div>
  )
}

function VocabQuestion({
  item,
  isRetry,
  onBeforeAnswer,
  onFinish,
}: {
  item: Extract<RoutineItem, { kind: 'vocab' }>
  isRetry: boolean
  onBeforeAnswer: () => void
  onFinish: (ok: boolean, quality: Quality) => void
}) {
  const stage = getProgress().memory[item.item.id]?.stage ?? 0
  const question = useMemo(() => questionFor(item.item, stage, allVocab, 0), [item]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <QuestionView
      q={question}
      onAnswered={() => {}}
      onIntro={(known) => {
        onBeforeAnswer()
        setItemStage(item.item.id, known ? 3 : 1)
        onFinish(true, 'good')
      }}
      onDone={(q) => {
        onBeforeAnswer()
        if (!isRetry) recordReview(item.item.id, q, 'vocabulaire')
        onFinish(q !== 'again', q)
      }}
    />
  )
}

function ClozeQuestion({
  item,
  isRetry,
  onBeforeAnswer,
  onFinish,
}: {
  item: Extract<RoutineItem, { kind: 'cloze' }>
  isRetry: boolean
  onBeforeAnswer: () => void
  onFinish: (ok: boolean, quality: Quality) => void
}) {
  const challenge = challengeById(item.challengeId)
  if (!challenge) return null
  return (
    <RoutineCloze
      challenge={challenge}
      blankIndex={item.blankIndex}
      onDone={(ok, slow) => {
        onBeforeAnswer()
        if (!isRetry) recordExercise(item.id, ok)
        onFinish(ok, ok && !slow ? 'good' : ok ? 'hard' : 'again')
      }}
    />
  )
}

function TranslationQuestion({
  item,
  isRetry,
  onBeforeAnswer,
  onFinish,
}: {
  item: Extract<RoutineItem, { kind: 'translation' }>
  isRetry: boolean
  onBeforeAnswer: () => void
  onFinish: (ok: boolean, quality: Quality) => void
}) {
  const translation = challengeById(item.challengeId)?.translations[item.index]
  if (!translation) return null
  return (
    <RoutineTranslation
      item={translation}
      onDone={(ok, slow) => {
        onBeforeAnswer()
        if (!isRetry) recordExercise(item.id, ok)
        onFinish(ok, ok && !slow ? 'good' : ok ? 'hard' : 'again')
      }}
    />
  )
}

function GrammarQuestion({
  item,
  isRetry,
  onBeforeAnswer,
  onFinish,
}: {
  item: Extract<RoutineItem, { kind: 'grammar' }>
  isRetry: boolean
  onBeforeAnswer: () => void
  onFinish: (ok: boolean, quality: Quality) => void
}) {
  const stage = getProgress().exercises[item.ex.id]?.stage ?? 0
  const started = useRef(Date.now())
  const mode = stage === 0 ? 'choice' : 'type'
  const threshold = mode === 'choice' ? SLOW_MCQ : SLOW_TYPE
  return (
    <ExerciseView
      e={item.ex}
      mode={mode}
      onDone={(ok) => {
        onBeforeAnswer()
        const slow = Date.now() - started.current > threshold
        if (!isRetry) recordExercise(item.ex.id, ok)
        onFinish(ok, ok && !slow ? 'good' : ok ? 'hard' : 'again')
      }}
    />
  )
}
