/** Génère la question adaptée à l'étape d'un mot (voir memory.ts). */
import type { StudyItem } from '../data/types'
import { MASTERED } from './memory'
import { sample, shuffle, stripAccents } from './text'

export type StudyQuestion =
  | { kind: 'intro'; item: StudyItem; context?: Highlight }
  | {
      kind: 'mcq'
      item: StudyItem
      dir: 'pt-fr' | 'fr-pt'
      audio?: boolean
      /** Phrase d'exemple affichée avec le mot en évidence. */
      context?: Highlight
      contextFr?: string
      options: string[]
      answer: number
    }
  | { kind: 'type'; item: StudyItem; cloze?: { before: string; after: string; fr?: string }; expected: string; hint: string }

export interface Highlight {
  before: string
  word: string
  after: string
}

const ARTICLE = /^(o|a|os|as|um|uma|uns|umas)\s+/i

/** Formes acceptées : alternatives « / », avec ou sans article, sans parenthèses ni « … ». */
export function acceptedForms(pt: string): string[] {
  const forms = new Set<string>()
  for (const alt of pt.split('/')) {
    const clean = alt.replace(/\(.*?\)/g, '').replace(/…|\.\.\./g, '').replace(/[!?.]+$/, '').trim()
    if (!clean) continue
    forms.add(clean)
    forms.add(clean.replace(ARTICLE, ''))
  }
  return [...forms]
}

/** Retrouve le mot (ou une forme proche) dans la phrase d'exemple. */
export function findInSentence(item: StudyItem): Highlight | undefined {
  if (!item.ex) return
  const sentence = item.ex
  const plain = stripAccents(sentence.toLowerCase())
  const isLetter = (c?: string) => !!c && /[a-z0-9]/.test(c)
  const hit = (idx: number, len: number): Highlight => ({ before: sentence.slice(0, idx), word: sentence.slice(idx, idx + len), after: sentence.slice(idx + len) })
  // Toutes les positions où `needle` commence un mot.
  const starts = (needle: string) => {
    const out: number[] = []
    for (let i = plain.indexOf(needle); i >= 0; i = plain.indexOf(needle, i + 1)) if (!isLetter(plain[i - 1])) out.push(i)
    return out
  }
  const candidates = acceptedForms(item.pt).sort((a, b) => b.length - a.length)
  // 1. Forme exacte, mot entier (« se » ne doit pas matcher dans « você »).
  for (const form of candidates) {
    const f = stripAccents(form.toLowerCase())
    const idx = starts(f).find((i) => !isLetter(f[f.length - 1]) || !isLetter(plain[i + f.length]))
    if (idx !== undefined) return hit(idx, f.length)
  }
  // 2. Terminaison différente (conjugaison, pluriel, féminin) pour les mots assez longs.
  for (const form of candidates) {
    const f = stripAccents(form.toLowerCase())
    if (f.length < 5 || f.includes(' ')) continue
    const idx = starts(f.slice(0, f.length - 2))[0]
    if (idx !== undefined) {
      const m = plain.slice(idx).match(/^[a-z-]+/)
      return hit(idx, m ? m[0].length : f.length - 2)
    }
  }
}

function distractors(item: StudyItem, pool: StudyItem[], key: 'pt' | 'fr') {
  const others = pool.filter((p) => p.id !== item.id && p[key] !== item[key])
  const sameCat = item.cat ? others.filter((o) => o.cat === item.cat) : []
  const picked = sample(sameCat.length >= 3 ? sameCat : others, 3)
  return picked.map((p) => p[key])
}

function mcq(item: StudyItem, pool: StudyItem[], dir: 'pt-fr' | 'fr-pt', withContext: boolean, audio = false): StudyQuestion {
  const key = dir === 'pt-fr' ? 'fr' : 'pt'
  const options = shuffle([item[key], ...distractors(item, pool, key)])
  return {
    kind: 'mcq',
    item,
    dir,
    audio,
    context: withContext && dir === 'pt-fr' ? findInSentence(item) : undefined,
    contextFr: withContext && dir === 'fr-pt' ? item.exFr : undefined,
    options,
    answer: options.indexOf(item[key]),
  }
}

/**
 * `turn` alterne les variantes pour les mots maîtrisés (sens et type d'exercice).
 * Mode cartes : seuls le sens et la présence du contexte sont utilisés.
 */
export function questionFor(item: StudyItem, stage: number, pool: StudyItem[], turn = 0): StudyQuestion {
  if (stage === 0) return { kind: 'intro', item, context: findInSentence(item) }
  if (stage === 1) return mcq(item, pool, 'pt-fr', true)
  if (stage === 2) return mcq(item, pool, 'fr-pt', true)
  if (stage === 3) {
    const hl = findInSentence(item)
    if (hl) return { kind: 'type', item, cloze: { before: hl.before, after: hl.after, fr: item.exFr }, expected: hl.word, hint: item.fr }
    return { kind: 'type', item, expected: item.pt, hint: item.fr }
  }
  if (stage === 4) return { kind: 'type', item, expected: item.pt, hint: item.fr }
  // Maîtrise : on alterne production écrite, reconnaissance et écoute.
  const variant = turn % 3
  if (variant === 0 || stage > MASTERED) return { kind: 'type', item, expected: item.pt, hint: item.fr }
  if (variant === 1) return mcq(item, pool, 'pt-fr', false)
  return mcq(item, pool, 'pt-fr', false, true)
}
