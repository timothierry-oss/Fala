import type { DeckStats } from '../lib/decks'

const PARTS = [
  { key: 'maitrise', label: 'Maîtrise' },
  { key: 'revision', label: 'Révision' },
  { key: 'apprentissage', label: 'Apprentissage' },
  { key: 'nouveau', label: 'Nouveaux' },
] as const

/** Répartition des mots d'une fiche par phase. */
export function PhaseBar({ stats, legend = true }: { stats: DeckStats; legend?: boolean }) {
  const total = Math.max(1, stats.total)
  return (
    <div className="phasebar">
      <div className="phasebar-track" role="img" aria-label={PARTS.map((p) => `${stats[p.key]} ${p.label.toLowerCase()}`).join(', ')}>
        {PARTS.map((p) =>
          stats[p.key] ? <span key={p.key} className={`ph-${p.key}`} style={{ width: `${(stats[p.key] / total) * 100}%` }} title={`${p.label} : ${stats[p.key]}`} /> : null,
        )}
      </div>
      {legend && (
        <div className="phasebar-legend">
          {PARTS.map((p) => (
            <span key={p.key}>
              <i className={`ph-${p.key}`} /> {p.label} <strong>{stats[p.key]}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
