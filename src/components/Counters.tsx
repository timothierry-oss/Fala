import { Check, X } from 'lucide-react'

export type Verdicts = Record<string, 'good' | 'again'>

/** Compteur « à revoir / réussi » : seule la dernière réponse à chaque élément compte. */
export function Counters({ verdicts, okLabel = 'Je sais', koLabel = 'À revoir' }: { verdicts: Verdicts; okLabel?: string; koLabel?: string }) {
  const values = Object.values(verdicts)
  const ok = values.filter((v) => v === 'good').length
  return (
    <div className="card-counters" aria-live="polite">
      <span className="counter ko">
        <X size={16} /> {koLabel} <strong>{values.length - ok}</strong>
      </span>
      <span className="counter ok">
        {okLabel} <strong>{ok}</strong> <Check size={16} />
      </span>
    </div>
  )
}
