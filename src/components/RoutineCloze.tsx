import { useMemo, useRef, useState } from 'react'
import { parseCloze, type Blank, type Challenge } from '../data/challenges'
import { checkTyped, type AnswerCheck } from '../lib/text'
import { react, type ReactionPhrase } from '../lib/reactions'
import { Reaction } from './Reaction'
import { AccentKeys } from './SmartStudy'

const SLOW_CLOZE = 20000

/** Un seul trou actif d'un défi « texte à trous », pour la routine (les autres trous sont déjà résolus). */
export function RoutineCloze({ challenge, blankIndex, onDone }: { challenge: Challenge; blankIndex: number; onDone: (correct: boolean, slow: boolean) => void }) {
  const parts = useMemo(() => parseCloze(challenge.cloze), [challenge])
  const blanks = useMemo(() => parts.filter((x): x is Blank => typeof x !== 'string'), [parts])
  const target = blanks[blankIndex]
  const [value, setValue] = useState('')
  const [result, setResult] = useState<AnswerCheck | null>(null)
  const [reaction, setReaction] = useState<ReactionPhrase | null>(null)
  const started = useRef(Date.now())

  const slow = () => Date.now() - started.current > SLOW_CLOZE

  const check = () => {
    const r = checkTyped(value, target.answer)
    setResult(r)
    setReaction(react(r !== 'wrong'))
  }

  let bi = -1
  return (
    <div className="study">
      <div className="card cloze">
        <p className="eyebrow">{challenge.clozeTitle}</p>
        <p className="cloze-text">
          {parts.map((x, k) => {
            if (typeof x === 'string') return <span key={k}>{x}</span>
            const i = ++bi
            if (i !== blankIndex) return <span key={k}>{x.answer.split('/')[0]}</span>
            return (
              <span key={k} className="cloze-slot">
                <input
                  className={`cloze-input ${result ? (result === 'wrong' ? 'ko' : 'ok') : ''}`}
                  style={{ width: `${Math.max(5, x.answer.split('/')[0].length + 2)}ch` }}
                  value={value}
                  readOnly={!!result}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    e.preventDefault()
                    if (result) onDone(result !== 'wrong', slow())
                    else check()
                  }}
                  autoFocus
                  autoCapitalize="off"
                  autoComplete="off"
                  spellCheck={false}
                  lang="pt-BR"
                  aria-label={`Trou : ${x.hint}`}
                />
                {result && result !== 'exact' && <span className={`cloze-fix ${result === 'wrong' ? 'ko' : 'ok'}`}>{x.answer.split('/').join(' / ')}</span>}
                <span className="cloze-hint">({x.hint})</span>
              </span>
            )
          })}
        </p>
      </div>
      {!result ? (
        <>
          <AccentKeys onKey={(k) => setValue(value + k)} />
          <button className="btn btn-primary block" onClick={check} disabled={!value.trim()}>
            Vérifier
          </button>
        </>
      ) : (
        <div className={`feedback ${result !== 'wrong' ? 'ok' : 'ko'}`}>
          <div className="grow">
            {reaction && <Reaction r={reaction} success={result !== 'wrong'} />}
            <p className="answer-line">Réponse : {target.answer.split('/').join(' / ')}</p>
          </div>
          <button className="btn btn-primary" onClick={() => onDone(result !== 'wrong', slow())} autoFocus>
            Continuer
          </button>
        </div>
      )}
    </div>
  )
}
