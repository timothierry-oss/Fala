import type { ReactionPhrase } from '../lib/reactions'

export function Reaction({ r, success }: { r: ReactionPhrase; success: boolean }) {
  return (
    <div className={`reaction ${success ? 'ok' : 'ko'}`} role="status">
      <span className="reaction-flag" aria-hidden>
        🇧🇷
      </span>
      <div>
        <strong>{r.pt}</strong>
        <span>{r.fr}</span>
      </div>
    </div>
  )
}
