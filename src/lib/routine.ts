/**
 * Routine adaptative : construit une série mixte (vocabulaire, grammaire, texte à trous,
 * traduction) qui fait progresser l'utilisateur le long d'un parcours séquentiel A1 → B1.
 *
 * Le contenu neuf (mots, notions) avance uniquement le long de la « frontière » du parcours
 * (premier thème/notion pas encore terminé) ; la révision pondère le contenu déjà entamé selon
 * sa faiblesse (SM2 pour le vocabulaire, exercices ratés pour la grammaire/les défis).
 */
import type { Level, StudyItem } from '../data/types'
import { themeById, themes } from '../data/themes'
import { collections } from '../data/collections'
import { notionById, notions, type Exercise, type Notion } from '../data/grammar'
import { challengeById, challenges, parseCloze, type Blank, type Challenge } from '../data/challenges'
import { isDue, needsConsolidation, MASTERED, type Memory } from './memory'
import { studyOrder } from './decks'
import { LEVELS, levelInfo } from './levels'
import { completeStep, cooldownFactor, stepDone, totalXp, type ProgressState } from './store'

export type RoutineItem =
  | { id: string; kind: 'vocab'; item: StudyItem; topicId: string }
  | { id: string; kind: 'grammar'; ex: Exercise; topicId: string }
  | { id: string; kind: 'learn-notion'; notion: Notion }
  | { id: string; kind: 'cloze'; challengeId: string; blankIndex: number; topicId: string }
  | { id: string; kind: 'translation'; challengeId: string; index: number; topicId: string }
  | { id: string; kind: 'theme-quiz'; themeId: string; questionIndex: number; topicId: string }

interface Weighted {
  id: string
  weight: number
}

const levelIndex = (l: Level) => LEVELS.findIndex((x) => x.level === l)

/** Premier thème dont le vocabulaire n'est pas encore terminé : source du contenu neuf. */
export function frontierTheme(p: ProgressState) {
  return themes.find((t) => !stepDone(p, t.id, 'vocabulaire'))
}

/** Première notion pas encore apprise : prochaine étape de grammaire du parcours. */
export function frontierNotion(p: ProgressState) {
  return notions.find((n) => !p.grammar[n.id]?.learned)
}

function perWordWeak(m?: Memory): number {
  if (!m || m.retired) return 0
  if (needsConsolidation(m)) return 1
  if (m.stage < MASTERED) return (MASTERED - m.stage) / MASTERED
  if (isDue(m)) return 0.3
  return 0.05
}

const stageScore = (m?: Memory) => (m ? Math.round((m.stage / MASTERED) * 100) : 0)

/** Tirage pondéré sans remise ; repli uniforme si tous les poids sont nuls. */
function weightedSample<T extends Weighted>(pool: T[], n: number): T[] {
  const left = [...pool]
  const out: T[] = []
  while (left.length && out.length < n) {
    const total = left.reduce((a, x) => a + x.weight, 0)
    let idx: number
    if (total > 0) {
      let r = Math.random() * total
      idx = left.length - 1
      for (let i = 0; i < left.length; i++) {
        r -= left[i].weight
        if (r <= 0) {
          idx = i
          break
        }
      }
    } else {
      idx = Math.floor(Math.random() * left.length)
    }
    out.push(left.splice(idx, 1)[0])
  }
  return out
}

/** Pénalise (sans jamais exclure) un sujet servi dans une session récente, pour faire tourner le contenu. */
const withCooldown = (p: ProgressState, prefix: string) => (w: Weighted): Weighted => ({
  ...w,
  weight: w.weight * (1 - 0.8 * cooldownFactor(p, `${prefix}:${w.id}`)),
})

/** Thèmes déjà entamés (au moins un mot vu), pondérés par leur faiblesse moyenne. */
function themeWeights(p: ProgressState): Weighted[] {
  return themes
    .map((t) => {
      const seen = t.vocab.filter((v) => p.memory[v.id])
      if (!seen.length) return null
      const weight = seen.reduce((a, v) => a + perWordWeak(p.memory[v.id]), 0) / seen.length
      return { id: t.id, weight: Math.max(0.03, weight) }
    })
    .filter((x): x is Weighted => x !== null)
    .map(withCooldown(p, 'theme'))
}

/** Collections déjà entamées (verbes, adverbes, expressions…), pondérées comme les thèmes. */
function collectionWeights(p: ProgressState): Weighted[] {
  return collections
    .map((c) => {
      const seen = c.items.filter((v) => p.memory[v.id])
      if (!seen.length) return null
      const weight = seen.reduce((a, v) => a + perWordWeak(p.memory[v.id]), 0) / seen.length
      return { id: c.id, weight: Math.max(0.03, weight) }
    })
    .filter((x): x is Weighted => x !== null)
    .map(withCooldown(p, 'collection'))
}

/** Notions déjà apprises, pondérées par leur taux d'exercices ratés et leur meilleur score. */
function notionWeights(p: ProgressState): Weighted[] {
  return notions
    .filter((n) => p.grammar[n.id]?.learned)
    .map((n) => {
      const ids = n.exercises.map((e) => e.id)
      const weakCount = ids.filter((id) => p.exercises[id]?.weak).length
      const best = p.grammar[n.id]?.best ?? 0
      const weight = 0.7 * (ids.length ? weakCount / ids.length : 0) + 0.3 * (1 - best / 100)
      return { id: n.id, weight: Math.max(0.02, weight) }
    })
    .map(withCooldown(p, 'notion'))
}

/** Défis au niveau déjà atteint (frontière du parcours ET niveau CEFR réel), pondérés par leur score. */
function challengeWeights(p: ProgressState, maxLevel: Level, userLevel: Level): Weighted[] {
  const cap = Math.min(levelIndex(maxLevel), levelIndex(userLevel))
  return challenges
    .filter((c) => levelIndex(c.level) <= cap)
    .map((c) => {
      const s = p.challenges[c.id]
      const tried = s && (s.cloze !== undefined || s.translation !== undefined)
      const weight = tried ? 1 - ((s!.cloze ?? 50) + (s!.translation ?? 50)) / 200 : 0.25
      return { id: c.id, weight: Math.max(0.05, weight) }
    })
    .map(withCooldown(p, 'challenge'))
}

/** Questions de compréhension d'un thème déjà entamé, pondérées par leur taux d'échec (via `p.exercises`). */
function themeQuizWeights(p: ProgressState): Weighted[] {
  return themes
    .filter((t) => stepDone(p, t.id, 'vocabulaire'))
    .map((t) => {
      const ids = t.questions.map((_, i) => `theme-quiz:${t.id}:${i}`)
      const weakCount = ids.filter((id) => p.exercises[id]?.weak).length
      const weight = ids.length ? Math.max(0.1, weakCount / ids.length || 0.2) : 0
      return { id: t.id, weight }
    })
    .filter((w) => w.weight > 0)
    .map(withCooldown(p, 'theme-quiz'))
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const sampleOne = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

/** Priorité : index déjà raté (sous-item `weak`) > jamais tenté > aléatoire. */
function pickWeightedIndex(p: ProgressState, total: number, idOf: (i: number) => string): number | undefined {
  if (!total) return undefined
  const idxs = range(total)
  const weak = idxs.filter((i) => p.exercises[idOf(i)]?.weak)
  if (weak.length) return sampleOne(weak)
  const untried = idxs.filter((i) => !p.exercises[idOf(i)])
  if (untried.length) return sampleOne(untried)
  return sampleOne(idxs)
}

function clozeBlankCount(c: Challenge): number {
  return parseCloze(c.cloze).filter((x): x is Blank => typeof x !== 'string').length
}

/** Alterne les formats, le cas échéant ; l'item « apprendre une notion » (plein écran) passe en premier. */
function interleave(items: RoutineItem[]): RoutineItem[] {
  const learn = items.filter((i) => i.kind === 'learn-notion')
  const rest = items.filter((i) => i.kind !== 'learn-notion')
  const buckets = new Map<string, RoutineItem[]>()
  for (const it of rest) {
    if (!buckets.has(it.kind)) buckets.set(it.kind, [])
    buckets.get(it.kind)!.push(it)
  }
  const out: RoutineItem[] = [...learn]
  let added = true
  while (added) {
    added = false
    for (const bucket of buckets.values()) {
      const next = bucket.shift()
      if (next) {
        out.push(next)
        added = true
      }
    }
  }
  return out
}

const TARGET = 20

export function buildRoutine(p: ProgressState): RoutineItem[] {
  const items: RoutineItem[] = []
  const usedVocab = new Set<string>()

  const frontierT = frontierTheme(p)
  const frontierN = frontierNotion(p)
  const maxLevel: Level = frontierT?.level ?? frontierN?.level ?? 'A1'
  const userLevel: Level = levelInfo(totalXp(p)).level

  // 1) Vocabulaire neuf : uniquement le thème frontière, dans l'ordre.
  let unseenLeft = 0
  if (frontierT) {
    const unseen = frontierT.vocab.filter((v) => !p.memory[v.id])
    unseenLeft = unseen.length
    for (const v of unseen.slice(0, 3)) {
      items.push({ id: `vocab:${v.id}`, kind: 'vocab', item: v, topicId: frontierT.id })
      usedVocab.add(v.id)
    }
    if (!unseen.length) {
      const avg = Math.round(frontierT.vocab.reduce((a, v) => a + stageScore(p.memory[v.id]), 0) / frontierT.vocab.length)
      completeStep(frontierT.id, 'vocabulaire', avg)
    }
  }

  // 2) Révision de vocabulaire : thèmes et collections déjà entamés, pondérés par faiblesse (pas l'argot).
  for (const tw of weightedSample(themeWeights(p), 3)) {
    const theme = themeById(tw.id)
    if (!theme) continue
    const candidates = theme.vocab.filter((v) => !usedVocab.has(v.id) && (p.memory[v.id]?.stage ?? 0) > 0)
    const order = studyOrder(p, candidates, 'due')
    for (const id of order) {
      if (items.filter((i) => i.kind === 'vocab').length >= 8) break
      const item = candidates.find((v) => v.id === id)
      if (item) {
        items.push({ id: `vocab:${id}`, kind: 'vocab', item, topicId: theme.id })
        usedVocab.add(id)
      }
    }
  }
  for (const cw of weightedSample(collectionWeights(p), 2)) {
    const col = collections.find((c) => c.id === cw.id)
    if (!col) continue
    const candidates = col.items.filter((v) => !usedVocab.has(v.id) && (p.memory[v.id]?.stage ?? 0) > 0)
    const order = studyOrder(p, candidates, 'due')
    for (const id of order) {
      if (items.filter((i) => i.kind === 'vocab').length >= 11) break
      const item = candidates.find((v) => v.id === id)
      if (item) {
        items.push({ id: `vocab:${id}`, kind: 'vocab', item, topicId: col.id })
        usedVocab.add(id)
      }
    }
  }

  // 3) Grammaire : apprendre la notion frontière, seulement si le vocabulaire du jour est à jour.
  if (frontierN && unseenLeft === 0) {
    items.push({ id: `learn:${frontierN.id}`, kind: 'learn-notion', notion: frontierN })
  }

  // 4) Grammaire : drill des notions déjà apprises, pondéré par les points faibles.
  for (const nw of weightedSample(notionWeights(p), 4)) {
    const notion = notionById(nw.id)
    if (!notion) continue
    const weak = notion.exercises.filter((e) => p.exercises[e.id]?.weak)
    const pool = weak.length ? weak : notion.exercises
    const grammarCount = items.filter((i) => i.kind === 'grammar').length
    for (const ex of pool) {
      if (items.filter((i) => i.kind === 'grammar').length - grammarCount >= 3) break
      items.push({ id: `grammar:${ex.id}`, kind: 'grammar', ex, topicId: notion.id })
    }
  }

  // 5) Traduction + texte à trous : défis au niveau déjà atteint (frontière ET niveau XP réel).
  for (const cw of weightedSample(challengeWeights(p, maxLevel, userLevel), 3)) {
    const c = challengeById(cw.id)
    if (!c) continue
    const tIdx = pickWeightedIndex(p, c.translations.length, (i) => `translation:${c.id}:${i}`)
    if (tIdx !== undefined) items.push({ id: `translation:${c.id}:${tIdx}`, kind: 'translation', challengeId: c.id, index: tIdx, topicId: c.id })
    const bIdx = pickWeightedIndex(p, clozeBlankCount(c), (i) => `cloze:${c.id}:${i}`)
    if (bIdx !== undefined) items.push({ id: `cloze:${c.id}:${bIdx}`, kind: 'cloze', challengeId: c.id, blankIndex: bIdx, topicId: c.id })
  }

  // 5b) Quiz de thème : questions de compréhension des thèmes déjà entamés.
  for (const qw of weightedSample(themeQuizWeights(p), 2)) {
    const theme = themeById(qw.id)
    if (!theme || !theme.questions.length) continue
    const qIdx = pickWeightedIndex(p, theme.questions.length, (i) => `theme-quiz:${theme.id}:${i}`)
    if (qIdx !== undefined) items.push({ id: `theme-quiz:${theme.id}:${qIdx}`, kind: 'theme-quiz', themeId: theme.id, questionIndex: qIdx, topicId: theme.id })
  }

  // 6) Repli : peu d'historique (grammaire/défis vides) → on comble avec du vocabulaire du thème frontière.
  if (items.length < TARGET - 5 && frontierT) {
    for (const v of frontierT.vocab) {
      if (items.length >= TARGET - 2 || usedVocab.has(v.id)) continue
      items.push({ id: `vocab:${v.id}`, kind: 'vocab', item: v, topicId: frontierT.id })
      usedVocab.add(v.id)
    }
  }

  return interleave(items)
}

/** Clé de cooldown du sujet derrière un item (voir `withCooldown`) ; `undefined` si l'item n'en a pas (leçon). */
export function topicKeyOf(item: RoutineItem): string | undefined {
  switch (item.kind) {
    case 'vocab':
      if (themeById(item.topicId)) return `theme:${item.topicId}`
      if (collections.some((c) => c.id === item.topicId)) return `collection:${item.topicId}`
      return undefined
    case 'grammar':
      return `notion:${item.topicId}`
    case 'cloze':
    case 'translation':
      return `challenge:${item.topicId}`
    case 'theme-quiz':
      return `theme-quiz:${item.topicId}`
    case 'learn-notion':
      return undefined
  }
}

export function curriculumProgress(p: ProgressState) {
  const vocabPct = themes.length ? themes.filter((t) => stepDone(p, t.id, 'vocabulaire')).length / themes.length : 0
  const grammarPct = notions.length ? notions.filter((n) => p.grammar[n.id]?.mastered).length / notions.length : 0
  return { vocabPct, grammarPct, overallPct: (vocabPct + grammarPct) / 2 }
}
