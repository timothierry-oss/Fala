import { useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, Lightbulb, RotateCcw } from 'lucide-react'
import { challengeById, challenges, parseCloze, type Blank, type Challenge } from '../data/challenges'
import { LevelBadge, PageHeader, ProgressBar, SpeakButton } from '../components/ui'
import { Reaction } from '../components/Reaction'
import { ResultScreen } from '../components/QuizRunner'
import { AccentKeys } from '../components/SmartStudy'
import { Counters, type Verdicts } from '../components/Counters'
import { UndoButton, useBackspace, useUndoStack } from '../components/undo'
import { react, type ReactionPhrase } from '../lib/reactions'
import { speak } from '../lib/speech'
import { checkTyped, compareSentence, type AnswerCheck, type SentenceCheck } from '../lib/text'
import { addXp, updateChallenge, type ProgressState } from '../lib/store'
import { NotFound } from './NotFound'

const pct = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0)

/** Section « Aller plus loin » affichée dans le parcours de grammaire. */
export function ChallengeSection({ p }: { p: ProgressState }) {
  return (
    <section className="path-level">
      <h2 className="section-title">🚀 Aller plus loin</h2>
      <p className="muted small">Textes à trous et traductions de phrases complètes, pour mettre tout ensemble.</p>
      <div className="vocab-list">
        {challenges.map((c) => {
          const s = p.challenges[c.id] ?? {}
          const done = (s.cloze ?? 0) >= 80 && (s.translation ?? 0) >= 80
          return (
            <Link key={c.id} to={`/grammaire/plus-loin/${c.id}`} className="card step">
              <span className={`step-icon emoji ${done ? 'done-icon' : ''}`}>{c.emoji}</span>
              <div className="grow">
                <h3>{c.title}</h3>
                <p className="muted small">{c.focus}</p>
                <div className="row gap-sm wrap">
                  <LevelBadge level={c.level} />
                  <span className="tag tag-soft">Texte {s.cloze !== undefined ? `${s.cloze} %` : '—'}</span>
                  <span className="tag tag-soft">Traduction {s.translation !== undefined ? `${s.translation} %` : '—'}</span>
                </div>
              </div>
              <ChevronRight size={20} className="muted" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function ChallengePage() {
  const { challengeId } = useParams()
  const [params, setParams] = useSearchParams()
  const c = challengeById(challengeId ?? '')
  if (!c) return <NotFound />
  const tab = params.get('tab') === 'traduction' ? 'traduction' : 'texte'
  return (
    <div className="page narrow">
      <PageHeader back="/grammaire" eyebrow={`Aller plus loin · ${c.level}`} title={`${c.emoji} ${c.title}`} />
      <p className="muted">{c.focus}</p>
      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={tab === 'texte'} className={tab === 'texte' ? 'active' : ''} onClick={() => setParams({ tab: 'texte' }, { replace: true })}>
          Texte à trous
        </button>
        <button role="tab" aria-selected={tab === 'traduction'} className={tab === 'traduction' ? 'active' : ''} onClick={() => setParams({ tab: 'traduction' }, { replace: true })}>
          Traduction
        </button>
      </div>
      {tab === 'texte' ? <ClozeText key={c.id} c={c} /> : <Translations key={c.id} c={c} />}
    </div>
  )
}

// ---------- Texte à trous ----------

function ClozeText({ c }: { c: Challenge }) {
  const parts = useMemo(() => parseCloze(c.cloze), [c])
  const blanks = parts.filter((x): x is Blank => typeof x !== 'string')
  const [values, setValues] = useState<string[]>(() => blanks.map(() => ''))
  const [results, setResults] = useState<AnswerCheck[] | null>(null)
  const [reaction, setReaction] = useState<ReactionPhrase | null>(null)
  const [showFr, setShowFr] = useState(false)
  const focused = useRef(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const correct = results?.filter((r) => r !== 'wrong').length ?? 0
  const filled = parts.map((x) => (typeof x === 'string' ? x : x.answer.split('/')[0])).join('')

  const check = () => {
    const res = blanks.map((b, i) => checkTyped(values[i], b.answer))
    const ok = res.filter((r) => r !== 'wrong').length
    setResults(res)
    setReaction(react(ok / blanks.length >= 0.7))
    updateChallenge(c.id, 'cloze', pct(ok, blanks.length))
    addXp('grammaire', ok * 3)
  }

  const reset = () => {
    setValues(blanks.map(() => ''))
    setResults(null)
    setReaction(null)
    inputs.current[0]?.focus()
  }

  let bi = -1
  return (
    <div className="study">
      <div className="card cloze">
        <p className="eyebrow">{c.clozeTitle}</p>
        <p className="cloze-text">
          {parts.map((x, k) => {
            if (typeof x === 'string') return <span key={k}>{x}</span>
            const i = ++bi
            const r = results?.[i]
            return (
              <span key={k} className="cloze-slot">
                <input
                  ref={(el) => {
                    inputs.current[i] = el
                  }}
                  className={`cloze-input ${r ? (r === 'wrong' ? 'ko' : 'ok') : ''}`}
                  style={{ width: `${Math.max(5, x.answer.split('/')[0].length + 2)}ch` }}
                  value={values[i]}
                  readOnly={!!results}
                  onFocus={() => (focused.current = i)}
                  onChange={(e) => setValues(values.map((v, j) => (j === i ? e.target.value : v)))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (i + 1 < blanks.length) inputs.current[i + 1]?.focus()
                      else if (!results) check()
                    }
                  }}
                  autoCapitalize="off"
                  autoComplete="off"
                  spellCheck={false}
                  lang="pt-BR"
                  aria-label={`Trou ${i + 1} : ${x.hint}`}
                />
                {r && r !== 'exact' && <span className={`cloze-fix ${r === 'wrong' ? 'ko' : 'ok'}`}>{x.answer.split('/').join(' / ')}</span>}
                <span className="cloze-hint">({x.hint})</span>
              </span>
            )
          })}
        </p>
        {showFr && <p className="muted small cloze-fr">{c.clozeFr}</p>}
        <div className="row gap-sm wrap">
          <button className="chip" onClick={() => setShowFr(!showFr)}>
            {showFr ? 'Masquer' : 'Voir'} la traduction
          </button>
          {results && <SpeakButton text={filled} label="Écouter le texte" rate={0.95} />}
        </div>
      </div>

      {!results ? (
        <>
          <AccentKeys
            onKey={(k) => {
              const i = focused.current
              setValues(values.map((v, j) => (j === i ? v + k : v)))
              inputs.current[i]?.focus()
            }}
          />
          <button className="btn btn-primary block" onClick={check} disabled={values.every((v) => !v.trim())}>
            Vérifier le texte
          </button>
        </>
      ) : (
        <div className={`feedback ${correct / blanks.length >= 0.7 ? 'ok' : 'ko'}`}>
          <div className="grow">
            {reaction && <Reaction r={reaction} success={correct / blanks.length >= 0.7} />}
            <p className="answer-line">
              <strong>
                {correct} / {blanks.length}
              </strong>{' '}
              trous corrects ({pct(correct, blanks.length)} %)
              {results.some((r) => r === 'accents' || r === 'close') && ' · attention aux accents et aux petites fautes'}
            </p>
          </div>
          <button className="btn btn-primary" onClick={reset}>
            <RotateCcw size={16} /> Recommencer
          </button>
        </div>
      )}
    </div>
  )
}

// ---------- Traductions ----------

const VERDICT_LABEL: Record<AnswerCheck, string> = {
  exact: 'Parfait !',
  accents: 'Correct, attention aux accents.',
  close: 'Presque ! Vérifie les mots en rouge (si c’était une faute de frappe : « J’avais bon »).',
  wrong: 'Pas tout à fait.',
}

function Translations({ c }: { c: Challenge }) {
  const [i, setI] = useState(0)
  const [value, setValue] = useState('')
  const [result, setResult] = useState<(SentenceCheck & { ok: boolean }) | null>(null)
  const [reaction, setReaction] = useState<ReactionPhrase | null>(null)
  const [hint, setHint] = useState(false)
  const [verdicts, setVerdicts] = useState<Verdicts>({})
  const [done, setDone] = useState(false)
  const undoStack = useUndoStack<{ i: number; verdicts: Verdicts }>()
  const input = useRef<HTMLInputElement>(null)
  const item = c.translations[i]
  const total = c.translations.length
  const score = Object.values(verdicts).filter((v) => v === 'good').length

  const resetQuestion = () => {
    setValue('')
    setResult(null)
    setReaction(null)
    setHint(false)
  }

  const undo = () => {
    if (result) return resetQuestion()
    const s = undoStack.pop()
    if (!s) return
    setI(s.i)
    setVerdicts(s.verdicts)
    setDone(false)
    resetQuestion()
  }
  useBackspace(undo)

  const check = (e: React.FormEvent) => {
    e.preventDefault()
    if (result) return next()
    if (!value.trim()) return
    const r = compareSentence(value, item.pt)
    // « Presque » n'est pas validé : une petite différence peut être une erreur de conjugaison.
    const ok = r.verdict === 'exact' || r.verdict === 'accents'
    setResult({ ...r, ok })
    setReaction(react(ok))
    speak(r.best)
  }

  const next = (forceOk?: boolean) => {
    const ok = forceOk ?? result?.ok ?? false
    undoStack.push({ i, verdicts })
    const v: Verdicts = { ...verdicts, [String(i)]: ok ? 'good' : 'again' }
    setVerdicts(v)
    if (ok) addXp('grammaire', 6)
    if (i + 1 >= total) {
      updateChallenge(c.id, 'translation', pct(Object.values(v).filter((x) => x === 'good').length, total))
      setDone(true)
      return
    }
    setI(i + 1)
    resetQuestion()
    setTimeout(() => input.current?.focus(), 0)
  }

  if (done) {
    return (
      <ResultScreen
        correct={score}
        total={total}
        onRetry={() => {
          setI(0)
          setVerdicts({})
          setDone(false)
          resetQuestion()
        }}
        onDone={() => history.back()}
      />
    )
  }

  const words = result ? result.best.split(' ') : []
  return (
    <form className="study" onSubmit={check}>
      <div className="study-top">
        <UndoButton onClick={undo} disabled={!result && undoStack.size === 0} />
        <ProgressBar value={i / total} />
        <span className="muted small nowrap">
          {i + 1} / {total}
        </span>
      </div>
      <Counters verdicts={verdicts} okLabel="Réussi" />
      <div className="card quiz-card">
        <p className="eyebrow">Traduis en portugais (Brésil)</p>
        <h2 className="flip-fr">{item.fr}</h2>
        {hint && !result && <p className="muted small">Indice : « {item.pt[0].split(' ').slice(0, 2).join(' ')} … »</p>}
      </div>
      <input
        ref={input}
        className={`text-input ${result ? (result.ok ? 'ok' : 'ko') : ''}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ta traduction…"
        autoFocus
        autoCapitalize="sentences"
        autoComplete="off"
        spellCheck={false}
        readOnly={!!result}
        lang="pt-BR"
      />
      {!result && <AccentKeys onKey={(k) => setValue(value + k)} />}

      {result && reaction && (
        <div className={`feedback ${result.ok ? 'ok' : 'ko'}`}>
          <div className="grow">
            <Reaction r={reaction} success={result.ok} />
            <p className="answer-line">{VERDICT_LABEL[result.verdict]}</p>
            <p className="model">
              {words.map((w, k) => (
                <span key={k} className={result.missing.has(k) ? 'w-ko' : ''}>
                  {w}{' '}
                </span>
              ))}
              <SpeakButton text={result.best} small />
            </p>
            {item.pt.length > 1 && (
              <details className="memo">
                <summary>Autres traductions acceptées</summary>
                <ul className="alt-list">
                  {item.pt
                    .filter((x) => x !== result.best)
                    .map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                </ul>
              </details>
            )}
          </div>
          <div className="row gap-sm">
            {!result.ok && (
              <button type="button" className="btn btn-ghost" onClick={() => next(true)}>
                J’avais bon
              </button>
            )}
            <button className="btn btn-primary" type="submit" autoFocus>
              {i + 1 >= total ? 'Terminer' : 'Continuer'}
            </button>
          </div>
        </div>
      )}

      {!result && (
        <div className="row gap">
          <button type="button" className="btn btn-ghost grow" onClick={() => setHint(true)} disabled={hint}>
            <Lightbulb size={16} /> Indice
          </button>
          <button className="btn btn-primary grow" type="submit">
            Vérifier
          </button>
        </div>
      )}
      <p className="muted small center">Les mots en rouge dans la correction sont ceux qui manquent ou diffèrent dans ta réponse.</p>
    </form>
  )
}
