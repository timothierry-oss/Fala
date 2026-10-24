import { Fragment, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import type { Exercise } from '../data/grammar'
import { checkTyped, shuffle, type AnswerCheck } from '../lib/text'
import { react, type ReactionPhrase } from '../lib/reactions'
import { speak } from '../lib/speech'
import { Reaction } from './Reaction'
import { AccentKeys } from './SmartStudy'

/** Affiche du texte avec **gras**. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  )
}

const firstAnswer = (e: Exercise) => e.answer.split('/')[0]
const fullSentence = (e: Exercise) => e.q.replace('___', firstAnswer(e)).replace(/\s*\(.*?\)\s*$/, '').replace(/\s*\(.*?\)/, '')

function Sentence({ e, filled }: { e: Exercise; filled?: string }) {
  const [before, after] = e.q.split('___')
  return (
    <p className="exercise-q">
      {before}
      <span className={`blank ${filled ? 'filled' : ''}`}>{filled ?? '_____'}</span>
      {after}
    </p>
  )
}

/**
 * Un exercice de grammaire : QCM (choice) ou saisie (type).
 * `onDone(correct)` est appelé quand l'utilisateur passe à la suite.
 */
export function ExerciseView({
  e,
  mode,
  showTranslation = true,
  extra,
  onDone,
  onAnswered,
}: {
  e: Exercise
  mode: 'choice' | 'type'
  showTranslation?: boolean
  extra?: ReactNode
  onDone: (correct: boolean) => void
  /** Réponse donnée (avant « Continuer »). */
  onAnswered?: () => void
}) {
  const options = useMemo(() => shuffle([firstAnswer(e), ...e.distractors.slice(0, 3)]), [e])
  const [picked, setPicked] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const [check, setCheck] = useState<AnswerCheck | null>(null)
  const [result, setResult] = useState<boolean | null>(null)
  const [reaction, setReaction] = useState<ReactionPhrase | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const finish = (ok: boolean) => {
    onAnswered?.()
    setResult(ok)
    setReaction(react(ok))
    speak(fullSentence(e), { auto: true })
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (result !== null) return onDone(result)
    if (!value.trim()) return
    const c = checkTyped(value, e.answer)
    setCheck(c)
    finish(c !== 'wrong')
  }

  return (
    <form className="write" onSubmit={submit}>
      <div className="card quiz-card">
        <p className="eyebrow">{mode === 'choice' ? 'Choisis la bonne forme' : 'Écris la bonne forme'}</p>
        <Sentence e={e} filled={result !== null ? firstAnswer(e) : mode === 'choice' && picked ? picked : undefined} />
        {showTranslation && <p className="muted small">« {e.fr} »</p>}
        {extra}
      </div>

      {mode === 'choice' ? (
        <div className="options">
          {options.map((opt) => {
            const state = picked === null ? '' : opt === firstAnswer(e) ? 'correct' : opt === picked ? 'wrong' : 'dim'
            return (
              <button
                type="button"
                key={opt}
                className={`option ${state}`}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(opt)
                  finish(opt === firstAnswer(e))
                }}
              >
                <span>{opt}</span>
                {state === 'correct' && <Check size={18} />}
                {state === 'wrong' && <X size={18} />}
              </button>
            )
          })}
        </div>
      ) : (
        <>
          <input
            ref={input}
            className={`text-input ${result === null ? '' : result ? 'ok' : 'ko'}`}
            value={value}
            onChange={(ev) => setValue(ev.target.value)}
            placeholder="Ta réponse…"
            autoFocus
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            readOnly={result !== null}
            lang="pt-BR"
          />
          {result === null && (
            <AccentKeys
              onKey={(k) => {
                setValue(value + k)
                input.current?.focus()
              }}
            />
          )}
        </>
      )}

      {result !== null && reaction && (
        <div className={`feedback ${result ? 'ok' : 'ko'}`}>
          <div className="grow">
            <Reaction r={reaction} success={result} />
            {check === 'accents' && <p className="answer-line">Attention aux accents : <strong>{firstAnswer(e)}</strong></p>}
            {check === 'close' && <p className="answer-line">Petite faute : <strong>{firstAnswer(e)}</strong></p>}
            {!result && (
              <p className="answer-line">
                Réponse : <strong>{e.answer.split('/').join(' ou ')}</strong>
              </p>
            )}
          </div>
          <button type={mode === 'type' ? 'submit' : 'button'} className="btn btn-primary" onClick={mode === 'choice' ? () => onDone(result) : undefined} autoFocus>
            Continuer
          </button>
        </div>
      )}

      {mode === 'type' && result === null && (
        <div className="row gap">
          <button type="button" className="btn btn-ghost grow" onClick={() => finish(false)}>
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
