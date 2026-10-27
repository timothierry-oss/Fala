import { useRef, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import type { Translation } from '../data/challenges'
import { react, type ReactionPhrase } from '../lib/reactions'
import { speak } from '../lib/speech'
import { compareSentence, type AnswerCheck, type SentenceCheck } from '../lib/text'
import { Reaction } from './Reaction'
import { SpeakButton } from './ui'
import { AccentKeys } from './SmartStudy'

const SLOW_TRANSLATION = 25000

const VERDICT_LABEL: Record<AnswerCheck, string> = {
  exact: 'Parfait !',
  accents: 'Correct, attention aux accents.',
  close: 'Presque ! Vérifie les mots en rouge (si c’était une faute de frappe : « J’avais bon »).',
  wrong: 'Pas tout à fait.',
}

/** Une seule phrase de traduction d'un défi, pour la routine. */
export function RoutineTranslation({ item, onDone }: { item: Translation; onDone: (correct: boolean, slow: boolean) => void }) {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<(SentenceCheck & { ok: boolean }) | null>(null)
  const [reaction, setReaction] = useState<ReactionPhrase | null>(null)
  const [hint, setHint] = useState(false)
  const started = useRef(Date.now())

  const slow = () => Date.now() - started.current > SLOW_TRANSLATION

  const check = (e: React.FormEvent) => {
    e.preventDefault()
    if (result) return onDone(result.ok, slow())
    if (!value.trim()) return
    const r = compareSentence(value, item.pt)
    const ok = r.verdict === 'exact' || r.verdict === 'accents'
    setResult({ ...r, ok })
    setReaction(react(ok))
    speak(r.best, { auto: true })
  }

  const words = result ? result.best.split(' ') : []
  return (
    <form className="study" onSubmit={check}>
      <div className="card quiz-card">
        <p className="eyebrow">Traduis en portugais (Brésil)</p>
        <h2 className="flip-fr">{item.fr}</h2>
        {hint && !result && <p className="muted small">Indice : « {item.pt[0].split(' ').slice(0, 2).join(' ')} … »</p>}
      </div>
      <input
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
          </div>
          <div className="row gap-sm">
            {!result.ok && (
              <button type="button" className="btn btn-ghost" onClick={() => onDone(true, slow())}>
                J’avais bon
              </button>
            )}
            <button className="btn btn-primary" type="submit" autoFocus>
              Continuer
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
    </form>
  )
}
