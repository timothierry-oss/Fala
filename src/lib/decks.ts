import { allVocab, themes } from '../data/themes'
import { slang } from '../data/slang'
import { collectionItems, collections, groups } from '../data/collections'
import type { Skill, StudyItem } from '../data/types'
import { MASTERED, needsConsolidation } from './memory'
import { dayKey } from './dates'
import { dueToday, type CustomSource, type ProgressState } from './store'

export type DeckKind = 'theme' | 'argot' | 'perso' | 'discussion' | 'revisions' | 'collection'

export interface Deck {
  id: string
  kind: DeckKind
  title: string
  emoji: string
  items: StudyItem[]
  skill: Skill
  themeId?: string
}

export const slangItems: StudyItem[] = slang.map((s) => ({ id: s.id, pt: s.pt, fr: s.fr, ex: s.ex, exFr: s.exFr, note: s.note, cat: 'argot' }))

export function allItems(p: ProgressState): StudyItem[] {
  return [...allVocab, ...slangItems, ...collectionItems, ...p.custom]
}

export function itemById(p: ProgressState, id: string): StudyItem | undefined {
  return allItems(p).find((i) => i.id === id)
}

const SOURCE_META: Record<CustomSource, { title: string; emoji: string; skill: Skill }> = {
  perso: { title: 'Mes mots', emoji: '✍️', skill: 'vocabulaire' },
  discussion: { title: 'Discussions', emoji: '💬', skill: 'lecture' },
}

export function customDecks(p: ProgressState, source: CustomSource): Deck[] {
  const words = p.custom.filter((w) => w.source === source)
  const numbers = [...new Set(words.map((w) => w.deck))].sort((a, b) => a - b)
  const meta = SOURCE_META[source]
  return numbers.map((n) => ({
    id: `${source}-${n}`,
    kind: source,
    title: `${meta.title} ${n}`,
    emoji: meta.emoji,
    items: words.filter((w) => w.deck === n),
    skill: meta.skill,
  }))
}

export function getDeck(id: string, p: ProgressState): Deck | undefined {
  if (id === 'argot') return { id, kind: 'argot', title: 'Argot brésilien', emoji: '😎', items: slangItems, skill: 'argot' }
  if (id === 'revisions') {
    const items = allItems(p)
    const due = new Set(dueToday(p, items.map((i) => i.id)))
    return { id, kind: 'revisions', title: 'Révisions du jour', emoji: '🔁', items: items.filter((i) => due.has(i.id)), skill: 'vocabulaire' }
  }
  const group = groups.find((g) => g.id === id)
  if (group) {
    const items = collections.filter((c) => c.group === id).flatMap((c) => c.items)
    return { id, kind: 'collection', title: group.title, emoji: group.emoji, items, skill: 'vocabulaire' }
  }
  const col = collections.find((c) => c.id === id)
  if (col) return { id, kind: 'collection', title: col.title, emoji: col.emoji, items: col.items, skill: 'vocabulaire' }
  const custom = id.match(/^(perso|discussion)-(\d+)$/)
  if (custom) return customDecks(p, custom[1] as CustomSource).find((d) => d.id === id)
  const t = themes.find((th) => th.id === id)
  return t && { id, kind: 'theme', title: t.title, emoji: t.emoji, items: t.vocab, skill: 'vocabulaire', themeId: t.id }
}

export interface DeckStats {
  nouveau: number
  apprentissage: number
  revision: number
  maitrise: number
  consolider: number
  /** Dont retirés des révisions (« je le connais parfaitement »). */
  retires: number
  total: number
}

export function deckStats(p: ProgressState, items: StudyItem[]): DeckStats {
  const s: DeckStats = { nouveau: 0, apprentissage: 0, revision: 0, maitrise: 0, consolider: 0, retires: 0, total: items.length }
  for (const it of items) {
    const m = p.memory[it.id]
    const stage = m?.stage ?? 0
    if (stage === 0) s.nouveau++
    else if (stage <= 2) s.apprentissage++
    else if (stage < MASTERED) s.revision++
    else s.maitrise++
    if (needsConsolidation(m)) s.consolider++
    if (m?.retired) s.retires++
  }
  return s
}

/** Ordre de travail : à consolider, en cours (du moins avancé au plus avancé), maîtrisés à revoir, puis nouveaux. */
export function studyOrder(p: ProgressState, items: StudyItem[], includeMastered: 'due' | 'all'): string[] {
  const today = dayKey()
  const stage = (id: string) => p.memory[id]?.stage ?? 0
  items = items.filter((i) => !p.memory[i.id]?.retired)
  const consolidate = items.filter((i) => needsConsolidation(p.memory[i.id]))
  const inProgress = items.filter((i) => stage(i.id) > 0 && stage(i.id) < MASTERED && !needsConsolidation(p.memory[i.id])).sort((a, b) => stage(a.id) - stage(b.id))
  const fresh = items.filter((i) => stage(i.id) === 0)
  const mastered = items.filter((i) => stage(i.id) === MASTERED && (includeMastered === 'all' || (p.memory[i.id]?.due ?? today) <= today))
  return [...consolidate, ...inProgress, ...mastered, ...fresh].map((i) => i.id)
}
