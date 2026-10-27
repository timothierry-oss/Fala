import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, CheckCheck, Undo2, Volume2, X } from 'lucide-react'
import type { Skill, StudyItem } from '../data/types'
import { MASTERED, PHASE_LABEL, phaseOf, StudySession, type Quality, type SessionSnapshot } from '../lib/memory'
import { questionFor, acceptedForms, type Highlight, type StudyQuestion } from '../lib/questions'
import { checkTyped, type AnswerCheck } from '../lib/text'
import { react, type ReactionPhrase } from '../lib/reactions'
import { speak } from '../lib/speech'
import { deckStats, studyOrder } from '../lib/decks'
import { dayKey } from '../lib/dates'
import { getProgress, recordReview, restoreProgress, retireItem, setItemStage, useProgress, type ProgressState } from '../lib/store'
import { PhaseBar } from './PhaseBar'
import { Counters } from './Counters'
import { Reaction } from './Reaction'
import { ProgressBar, SpeakButton } from './ui'

export type StudyMode = 'apprendre' | 'cartes'


/** État complet juste avant une réponse, pour le bouton « Retour ». */
interface Step {
  id: string
  turn: number
  progress: ProgressState
  session: SessionSnapshot
  verdicts: Record<string, 'good' | 'again'>
}
export const SLOW_MCQ = 12000
export const SLOW_TYPE = 25000

function makeSession(items: StudyItem[], consolidation: boolean) {
  const order = studyOrder(getProgress(), items, consolidation ? 'all' : 'due')
  return new StudySession(order, {
    roundSize: getProgress().settings.roundSize,
    maxActive: 6,
    isDone: (id, good) => {
      const m = getProgress().memory[id]
      if (m?.retired) return true
      if (!m || m.stage < MASTERED) return false
      return consolidation ? good >= 1 : m.due > dayKey() || good >= 1
    },
  })
}

export function SmartStudy({
  items,
  pool,
  skill,
  mode,
  onRoundEnd,
}: {
  items: StudyItem[]
  pool: StudyItem[]
  skill: Skill
  mode: StudyMode
  onRoundEnd?: (correct: number, total: number) => void
}) {
  const p = useProgress()
  const [consolidation, setConsolidation] = useState(false)
  const session = useMemo(() => makeSession(items, consolidation), [items, consolidation])
  const [currentId, setCurrentId] = useState<string | null>(() => session.next())
  const [turn, setTurn] = useState(0)
  const [view, setView] = useState<'study' | 'round'>('study')
  const [lastRound, setLastRound] = useState({ correct: 0, total: 0 })
  // Mode cartes : dernière réponse donnée pour chaque carte pendant la session.
  const [verdicts, setVerdicts] = useState<Record<string, 'good' | 'again'>>({})

  const steps = useRef<Step[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  // Réponse affichée mais pas encore validée (« Continuer ») : « Retour » permet de re-répondre.
  const [pending, setPending] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    setCurrentId(session.next())
    setView('study')
    setVerdicts({})
    steps.current = []
  }, [session])

  const item = items.find((i) => i.id === currentId)
  // La question est figée pour ce passage (le stage change dès qu'on répond).
  const question = useMemo(
    () => (item ? questionFor(item, getProgress().memory[item.id]?.stage ?? 0, pool.length >= 4 ? pool : items, turn) : null),
    [item, turn], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const stats = deckStats(p, items)

  /** À appeler avant d'enregistrer une réponse. */
  const checkpoint = (id: string) => {
    steps.current.push({ id, turn, progress: getProgress(), session: session.snapshot(), verdicts })
    if (steps.current.length > 50) steps.current.shift()
  }

  const canUndo = pending || steps.current.length > 0

  /** « Je le connais parfaitement » : sort le mot des révisions et passe au suivant. */
  const retire = (id: string, label: string) => {
    checkpoint(id)
    retireItem(id)
    session.drop(id)
    setPending(false)
    setCurrentId(session.next())
    setTurn((t) => t + 1)
    setToast(label)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4000)
  }

  const undo = () => {
    setToast(null)
    if (pending) {
      setPending(false)
      setRetry((r) => r + 1)
      return
    }
    const s = steps.current.pop()
    if (!s) return
    restoreProgress(s.progress)
    session.restore(s.session)
    setVerdicts(s.verdicts)
    setCurrentId(s.id)
    setTurn(s.turn)
    setView('study')
    setRetry((r) => r + 1)
  }

  // Raccourci : Retour arrière (⌫) quand on n'écrit pas dans un champ.
  const undoRef = useRef(undo)
  undoRef.current = undo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key !== 'Backspace' || t?.closest('input, textarea, select, [contenteditable]')) return
      e.preventDefault()
      undoRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /** Nouvel essai après une erreur : aucune trace dans la progression ni les compteurs. */
  const retryAnswer = (id: string, q: Quality) => {
    setPending(false)
    session.recordRetry(id, q !== 'again')
    setCurrentId(session.next())
    setTurn((t) => t + 1)
  }

  const advance = (id: string, q: Quality | 'intro') => {
    setPending(false)
    session.record(id, q)
    if (session.roundOver) {
      const r = { correct: session.roundCorrect, total: session.roundStep }
      setLastRound(r)
      onRoundEnd?.(r.correct, r.total)
      session.newRound()
      setView('round')
    }
    setCurrentId(session.next())
    setTurn((t) => t + 1)
  }

  const toastEl = toast && (
    <div className="toast" role="status">
      <span>
        <CheckCheck size={16} /> « {toast} » retiré des révisions
      </span>
      <button onClick={undo}>Annuler</button>
    </div>
  )

  if (view === 'round') {
    return (
      <div className="card result">
        <div className="result-emoji">⏸️</div>
        <h2>
          Série terminée : {lastRound.correct} / {lastRound.total}
        </h2>
        <p className="muted">Ta progression est enregistrée. Tu peux t’arrêter là et reprendre plus tard.</p>
        <PhaseBar stats={stats} />
        <div className="row gap wrap center">
          <button className="btn btn-ghost" onClick={undo}>
            <Undo2 size={16} /> Retour
          </button>
          <button className="btn btn-ghost" onClick={() => history.back()}>
            Arrêter
          </button>
          <button className="btn btn-primary" onClick={() => setView('study')} autoFocus>
            Continuer
          </button>
        </div>
      </div>
    )
  }

  if (!item || !question) {
    const all = stats.maitrise === stats.total
    return (
      <div className="card result">
        <div className="result-emoji">{all ? '🏆' : '✨'}</div>
        <h2>{all ? 'Fiche maîtrisée !' : 'Tudo em dia!'}</h2>
        <p className="muted">
          {all
            ? 'Tous les mots sont maîtrisés. Ils reviendront de temps en temps dans les révisions du jour pour rester en mémoire.'
            : 'Rien à réviser pour le moment.'}
        </p>
        <PhaseBar stats={stats} />
        {stats.maitrise > stats.retires && (
          <button className="btn btn-primary" onClick={() => setConsolidation(true)}>
            Réviser quand même
          </button>
        )}
        {toastEl}
      </div>
    )
  }

  const phase = phaseOf(p.memory[item.id])
  const isRetry = session.isRetry(item.id)
  return (
    <div className="study">
      <div className="study-top">
        <button className="undo-btn" onClick={undo} disabled={!canUndo} aria-label="Revenir en arrière" title="Revenir en arrière (⌫)">
          <Undo2 size={18} />
        </button>
        <ProgressBar value={session.roundStep / (session.opts.roundSize ?? 20)} />
        {isRetry ? (
          <span className="phase-pill retry-pill" title="Cette réponse ne compte pas dans la progression">
            Nouvel essai · ne compte pas
          </span>
        ) : (
          <span className={`phase-pill ph-${phase}`}>{PHASE_LABEL[phase]}</span>
        )}
      </div>
      {mode === 'cartes' && (
        <Counters verdicts={verdicts} />
      )}
      {mode === 'cartes' ? (
        <FlipCard key={`${item.id}-${turn}-${retry}`} item={item} stage={p.memory[item.id]?.stage ?? 0} turn={turn} onGrade={(q) => {
          checkpoint(item.id)
          if (isRetry) return retryAnswer(item.id, q)
          recordReview(item.id, q, skill)
          setVerdicts((v) => ({ ...v, [item.id]: q === 'again' ? 'again' : 'good' }))
          advance(item.id, q)
        }} />
      ) : (
        <QuestionView
          key={`${item.id}-${turn}-${retry}`}
          q={question}
          onAnswered={() => setPending(true)}
          onIntro={(known) => {
            checkpoint(item.id)
            setItemStage(item.id, known ? 3 : 1)
            advance(item.id, 'intro')
          }}
          onDone={(q) => {
            checkpoint(item.id)
            if (isRetry) return retryAnswer(item.id, q)
            recordReview(item.id, q, skill)
            advance(item.id, q)
          }}
        />
      )}
      <button className="btn-link retire" onClick={() => retire(item.id, item.pt)}>
        <CheckCheck size={16} /> Je le connais parfaitement, ne plus le réviser
      </button>
      <PhaseBar stats={stats} />
      {toastEl}
    </div>
  )
}

function HighlightedSentence({ h }: { h: Highlight }) {
  return (
    <p className="context">
      {h.before}
      <mark>{h.word}</mark>
      {h.after}
    </p>
  )
}

export function QuestionView({
  q,
  onIntro,
  onDone,
  onAnswered,
}: {
  q: StudyQuestion
  onIntro: (known: boolean) => void
  onDone: (q: Quality) => void
  onAnswered: () => void
}) {
  const started = useRef(Date.now())
  const [picked, setPicked] = useState<number | null>(null)
  const [value, setValue] = useState('')
  const [check, setCheck] = useState<AnswerCheck | null>(null)
  const [quality, setQuality] = useState<Quality | null>(null)
  const [reaction, setReaction] = useState<ReactionPhrase | null>(null)
  const { item } = q

  useEffect(() => {
    // Question d'écoute : lecture indispensable ; sinon lecture automatique (réglable).
    if (q.kind === 'mcq' && q.audio) speak(item.pt)
    else if (q.kind === 'intro' || (q.kind === 'mcq' && q.dir === 'pt-fr')) speak(item.pt, { auto: true })
  }, [q, item])

  const answered = (qual: Quality) => {
    onAnswered()
    setQuality(qual)
    setReaction(react(qual !== 'again'))
  }

  if (q.kind === 'intro') {
    return (
      <div className="card quiz-card intro">
        <p className="eyebrow">Nouveau mot</p>
        <h2 className="phrase">{item.pt}</h2>
        <p className="flip-fr">{item.fr}</p>
        <SpeakButton text={item.pt} label="Écouter" />
        {item.ex && (
          <div className="example">
            {q.context ? <HighlightedSentence h={q.context} /> : <p>{item.ex}</p>}
            <p className="muted">{item.exFr}</p>
            <SpeakButton text={item.ex} small />
          </div>
        )}
        {item.note && <p className="note">{item.note}</p>}
        {item.cat && !item.ex && <p className="muted small">Catégorie : {item.cat}</p>}
        <div className="row gap wrap center">
          <button className="btn btn-ghost" onClick={() => onIntro(true)}>
            Je connais déjà
          </button>
          <button className="btn btn-primary" onClick={() => onIntro(false)} autoFocus>
            J’ai compris
          </button>
        </div>
      </div>
    )
  }

  const feedback = quality && reaction && (
    <div className={`feedback ${quality === 'again' ? 'ko' : 'ok'}`}>
      <div className="grow">
        <Reaction r={reaction} success={quality !== 'again'} />
        {q.kind === 'type' && (
          <p className="row gap-sm answer-line">
            {check === 'accents' && 'Attention aux accents : '}
            {check === 'close' && 'Petite faute : '}
            {quality === 'again' && 'Réponse : '}
            <strong>{item.pt}</strong> <SpeakButton text={item.pt} small />
          </p>
        )}
        {q.kind === 'mcq' && quality === 'again' && (
          <p className="answer-line">
            Réponse : <strong>{q.options[q.answer]}</strong>
          </p>
        )}
        {item.ex && quality !== null && q.kind === 'type' && !q.cloze && <p className="muted small">{item.ex}</p>}
      </div>
      <div className="row gap-sm">
        {q.kind === 'type' && quality === 'again' && (
          <button className="btn btn-ghost" onClick={() => onDone('hard')}>
            J’avais bon
          </button>
        )}
        <button className="btn btn-primary" onClick={() => onDone(quality)} autoFocus>
          Continuer
        </button>
      </div>
    </div>
  )

  if (q.kind === 'mcq') {
    const choose = (i: number) => {
      if (picked !== null) return
      setPicked(i)
      const ok = i === q.answer
      answered(ok ? (Date.now() - started.current > SLOW_MCQ ? 'hard' : 'good') : 'again')
      if (q.dir === 'fr-pt') speak(item.pt, { auto: true })
    }
    return (
      <div className="quiz">
        <div className="card quiz-card">
          <p className="eyebrow">{q.audio ? 'Écoute et choisis la traduction' : q.dir === 'pt-fr' ? 'Que signifie ?' : 'Comment dit-on en portugais ?'}</p>
          {q.audio ? (
            <button className="audio-prompt" onClick={() => speak(item.pt)}>
              <Volume2 size={36} />
              <span>Réécouter</span>
            </button>
          ) : (
            <h2 className={q.dir === 'pt-fr' ? 'phrase' : 'flip-fr'}>{q.dir === 'pt-fr' ? item.pt : item.fr}</h2>
          )}
          {q.context && <HighlightedSentence h={q.context} />}
          {q.contextFr && <p className="context muted">« {q.contextFr} »</p>}
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
        {feedback}
      </div>
    )
  }

  // Écriture
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quality) return onDone(quality)
    if (!value.trim()) return
    const forms = [...new Set([...acceptedForms(q.expected), ...acceptedForms(item.pt)])]
    const c = checkTyped(value, forms.join('/'))
    setCheck(c)
    const slow = Date.now() - started.current > SLOW_TYPE
    answered(c === 'wrong' ? 'again' : c === 'exact' && !slow ? 'good' : 'hard')
    speak(item.pt, { auto: true })
  }
  return (
    <form className="write" onSubmit={submit}>
      <div className="card quiz-card">
        <p className="eyebrow">{q.cloze ? 'Complète la phrase en portugais' : 'Écris en portugais'}</p>
        <h2 className="flip-fr">{q.hint}</h2>
        {q.cloze && (
          <>
            <p className="context">
              {q.cloze.before}
              <span className="blank">{quality ? q.expected : '_____'}</span>
              {q.cloze.after}
            </p>
            {q.cloze.fr && <p className="muted small">« {q.cloze.fr} »</p>}
          </>
        )}
        {!q.cloze && item.cat && <p className="muted small">{item.cat}</p>}
      </div>
      <input
        className={`text-input ${quality ? (quality === 'again' ? 'ko' : 'ok') : ''}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ta réponse…"
        autoFocus
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
        readOnly={!!quality}
        lang="pt-BR"
      />
      {!quality && <AccentKeys onKey={(k) => setValue(value + k)} />}
      {feedback}
      {!quality && (
        <div className="row gap">
          <button
            type="button"
            className="btn btn-ghost grow"
            onClick={() => {
              setCheck('wrong')
              answered('again')
              speak(item.pt, { auto: true })
            }}
          >
            Je ne sais pas
          </button>
          <button className="btn btn-primary grow" type="submit">
            Vérifier
          </button>
        </div>
      )}
    </form>
  )
}

export function AccentKeys({ onKey }: { onKey: (k: string) => void }) {
  return (
    <div className="accent-keys">
      {['á', 'â', 'ã', 'à', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'].map((k) => (
        <button type="button" key={k} className="key" onClick={() => onKey(k)}>
          {k}
        </button>
      ))}
    </div>
  )
}

function FlipCard({ item, stage, turn, onGrade }: { item: StudyItem; stage: number; turn: number; onGrade: (q: Quality) => void }) {
  const [flipped, setFlipped] = useState(false)
  const withContext = stage <= 2
  // Apprentissage : portugais → français avec contexte ; ensuite le sens alterne.
  const reverse = !withContext && turn % 2 === 1
  const front = reverse ? item.fr : item.pt
  const back = reverse ? item.pt : item.fr

  // Raccourcis clavier : ← à revoir, → je sais, espace pour retourner.
  const graded = useRef(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || t?.closest('input, textarea, select, [contenteditable]')) return
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !graded.current) {
        e.preventDefault()
        graded.current = true
        onGrade(e.key === 'ArrowRight' ? 'good' : 'again')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onGrade])

  return (
    <div className="flash">
      {/* div et non button : la carte contient des boutons audio (un bouton dans un bouton casse le son sur mobile). */}
      <div
        role="button"
        tabIndex={-1}
        className={`flipcard ${flipped ? 'flipped' : ''}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('.speak-btn')) return
          setFlipped(!flipped)
        }}
        aria-label="Retourner la carte"
      >
        <div className="flip-inner">
          <div className="flip-face front">
            <span className={reverse ? 'flip-fr' : 'phrase'}>{front}</span>
            {!reverse && <SpeakButton text={item.pt} />}
            {withContext && item.ex && <p className="context">{item.ex}</p>}
            <span className="flip-hint">
              Touche pour retourner<span className="kbd-hint"> · <kbd>Espace</kbd></span>
            </span>
          </div>
          <div className="flip-face back">
            <span className={reverse ? 'phrase' : 'flip-fr'}>{back}</span>
            {reverse && <SpeakButton text={item.pt} />}
            {item.ex && (
              <div className="example">
                <p>{item.ex}</p>
                <p className="muted">{item.exFr}</p>
              </div>
            )}
            {item.note && <p className="note">{item.note}</p>}
          </div>
        </div>
      </div>
      <div className="flash-actions">
        <button className="btn btn-ko" onClick={() => onGrade('again')}>
          <X size={18} /> À revoir<kbd className="kbd-hint">←</kbd>
        </button>
        <button className="btn btn-ok" onClick={() => onGrade('good')}>
          <Check size={18} /> Je sais<kbd className="kbd-hint">→</kbd>
        </button>
      </div>
    </div>
  )
}
