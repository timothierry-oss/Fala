import type { Level } from '../data/types'

/** XP cumulée nécessaire pour atteindre chaque niveau du CECRL. */
export const LEVELS: { level: Level; xp: number; label: string }[] = [
  { level: 'A1', xp: 0, label: 'Débutant' },
  { level: 'A2', xp: 800, label: 'Élémentaire' },
  { level: 'B1', xp: 2400, label: 'Intermédiaire' },
  { level: 'B2', xp: 5000, label: 'Intermédiaire avancé' },
  { level: 'C1', xp: 9000, label: 'Avancé' },
  { level: 'C2', xp: 14000, label: 'Maîtrise' },
]

export function levelInfo(totalXp: number) {
  let i = 0
  while (i < LEVELS.length - 1 && totalXp >= LEVELS[i + 1].xp) i++
  const current = LEVELS[i]
  const next = LEVELS[i + 1]
  const pct = next ? (totalXp - current.xp) / (next.xp - current.xp) : 1
  return { ...current, next, pct, toNext: next ? next.xp - totalXp : 0 }
}

/** Niveau « fractionnaire » (A1 = 0, A2 = 1, …) pour tracer une courbe continue. */
export function levelValue(totalXp: number): number {
  const info = levelInfo(totalXp)
  return LEVELS.findIndex((l) => l.level === info.level) + info.pct
}
