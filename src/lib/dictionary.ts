/** Dictionnaire intégré français ⇄ portugais (hors ligne). */
import people from '../data/dict/people'
import body from '../data/dict/body'
import home from '../data/dict/home'
import food from '../data/dict/food'
import city from '../data/dict/city'
import work from '../data/dict/work'
import nature from '../data/dict/nature'
import time from '../data/dict/time'
import shopping from '../data/dict/shopping'
import leisure from '../data/dict/leisure'
import adjectives from '../data/dict/adjectives'
import verbs from '../data/dict/verbs'
import grammar from '../data/dict/grammar'
import expressions from '../data/dict/expressions'
import society from '../data/dict/society'
import { allVocab } from '../data/themes'
import { similarity, stripAccents } from './text'

export interface DictEntry {
  fr: string
  /** Formes françaises cherchables (sans précision entre parenthèses). */
  frKeys: string[]
  pt: string
  cat: string
  ex?: string
  exFr?: string
}

export const CAT_LABEL: Record<string, string> = {
  n: 'nom',
  v: 'verbe',
  adj: 'adjectif',
  adv: 'adverbe',
  expr: 'expression',
  prep: 'préposition',
  pron: 'pronom',
  conj: 'conjonction',
  num: 'nombre',
  art: 'article',
}

const key = (s: string) =>
  stripAccents(s.toLowerCase())
    .replace(/[’']/g, "'")
    .replace(/[?!.…]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/** Retire l'article français en tête (« le chat » → « chat »). */
const FR_ARTICLE = /^(le|la|les|un|une|des|du|de la|l'|se |s'|me |m')\s*/

function parse(raw: string): DictEntry[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'))
    .map((l) => {
      const [fr, pt, cat, ex, exFr] = l.split('|')
      const frKeys = fr.split(';').map((f) => key(f.replace(/\(.*?\)/g, '')))
      return { fr: fr.split(';').join(', '), frKeys, pt: pt.split(';').join(' / '), cat, ex: ex || undefined, exFr: exFr || undefined }
    })
}

const themeEntries: DictEntry[] = allVocab.map((v) => ({
  fr: v.fr,
  frKeys: v.fr.split('/').map((f) => key(f.replace(/\(.*?\)/g, ''))),
  pt: v.pt,
  cat: 'expr',
  ex: v.ex,
  exFr: v.exFr,
}))

export const dictionary: DictEntry[] = [
  ...[people, body, home, food, city, work, nature, time, shopping, leisure, adjectives, verbs, grammar, expressions, society].flatMap(parse),
  ...themeEntries,
]

export interface LookupResult {
  exact: DictEntry[]
  suggestions: DictEntry[]
}

/** Recherche un mot ou une expression en français. */
export function lookupFr(input: string): LookupResult {
  const q = key(input)
  const bare = q.replace(FR_ARTICLE, '')
  if (!bare) return { exact: [], suggestions: [] }
  const exact = dictionary.filter((e) => e.frKeys.some((k) => k === q || k === bare || k.replace(FR_ARTICLE, '') === bare))
  const seen = new Set(exact)
  const scored: { e: DictEntry; s: number }[] = []
  for (const e of dictionary) {
    if (seen.has(e)) continue
    let best = 0
    for (const k of e.frKeys) {
      if (bare.length >= 3 && (k.startsWith(bare) || k.split(' ').includes(bare))) best = Math.max(best, 0.9)
      best = Math.max(best, similarity(k, bare))
    }
    if (best >= 0.75) scored.push({ e, s: best })
  }
  scored.sort((a, b) => b.s - a.s)
  return { exact: dedupe(exact), suggestions: dedupe(scored.slice(0, 6).map((x) => x.e)) }
}

function dedupe(list: DictEntry[]) {
  const seen = new Set<string>()
  // Même traduction portugaise = même entrée (on garde la première, celle du dictionnaire).
  return list.filter((e) => {
    const k = key(e.pt)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const PT_ARTICLE = /^(o|a|os|as|um|uma|uns|umas)\s+/

let ptIndex: Map<string, DictEntry[]> | null = null

/** Recherche inverse portugais → français (pour les mots cliqués dans les textes). */
export function lookupPt(word: string): DictEntry | undefined {
  if (!ptIndex) {
    ptIndex = new Map()
    for (const e of dictionary) {
      for (const alt of e.pt.split('/')) {
        const k = key(alt.replace(/\(.*?\)/g, '')).replace(PT_ARTICLE, '')
        if (!k) continue
        if (!ptIndex.has(k)) ptIndex.set(k, [])
        ptIndex.get(k)!.push(e)
      }
    }
  }
  const k = key(word).replace(PT_ARTICLE, '')
  const candidates = [k, k.replace(/s$/, ''), k.replace(/es$/, ''), k.replace(/a$/, 'o'), k.replace(/as$/, 'o'), k.replace(/oes$/, 'ao'), k.replace(/is$/, 'l')]
  for (const c of candidates) {
    const hit = ptIndex.get(c)
    if (hit) return hit[0]
  }
}
