export const stripAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Minuscules, sans ponctuation ni espaces superflus (accents conservés). */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?¿¡;:«»"“”…()—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const words = (s: string) => normalize(s).split(' ').filter(Boolean)

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[b.length]
}

/** Similarité 0–1 entre deux chaînes (insensible aux accents et à la ponctuation). */
export function similarity(a: string, b: string): number {
  const x = stripAccents(normalize(a))
  const y = stripAccents(normalize(b))
  const max = Math.max(x.length, y.length)
  return max === 0 ? 1 : 1 - levenshtein(x, y) / max
}

export type AnswerCheck = 'exact' | 'accents' | 'close' | 'wrong'

/** Vérifie une réponse écrite : tolère les accents manquants et une petite faute de frappe. */
export function checkTyped(input: string, expected: string): AnswerCheck {
  const candidates = expected.split('/').map((s) => s.trim())
  let best: AnswerCheck = 'wrong'
  for (const c of candidates) {
    if (normalize(input) === normalize(c)) return 'exact'
    if (stripAccents(normalize(input)) === stripAccents(normalize(c))) best = 'accents'
    else if (best === 'wrong' && similarity(input, c) >= 0.85) best = 'close'
  }
  return best
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

// ---------- Comparaison de phrases complètes (traductions) ----------

/** Formes orales ramenées à la forme écrite avant comparaison. */
const COLLOQUIAL: Record<string, string> = { pra: 'para', pro: 'para o', pras: 'para as', pros: 'para os', tô: 'estou', tá: 'está', tão: 'estão', vc: 'você', cê: 'você', né: 'não é' }

/** Les chiffres tapés valent les nombres écrits en toutes lettres. */
const NUMBERS: Record<string, string> = { '0': 'zero', '1': 'um', '2': 'dois', '3': 'três', '4': 'quatro', '5': 'cinco', '6': 'seis', '7': 'sete', '8': 'oito', '9': 'nove', '10': 'dez', '11': 'onze', '12': 'doze', '15': 'quinze', '20': 'vinte', '30': 'trinta', '100': 'cem' }

const sentenceWords = (s: string) =>
  words(s)
    .map((w) => COLLOQUIAL[w] ?? NUMBERS[w] ?? w)
    .join(' ')
    .split(' ')
    .filter(Boolean)

export interface SentenceCheck {
  verdict: AnswerCheck
  /** Traduction acceptée la plus proche de la réponse. */
  best: string
  /** Mots de `best` absents de la réponse (indices dans best.split(' ')). */
  missing: Set<number>
}

/** Le pronom sujet est souvent omis en portugais : « Eu acordo » = « Acordo ». */
const SUBJECTS = new Set(['eu', 'você', 'ele', 'ela', 'nós', 'eles', 'elas', 'vocês'])
const bag = (ws: string[]) => [...ws].sort().join(' ')
const dropSubject = (ws: string[]) => (ws[0] === 'a' && ws[1] === 'gente' ? ws.slice(2) : SUBJECTS.has(ws[0]) ? ws.slice(1) : ws)

export function compareSentence(input: string, variants: string[]): SentenceCheck {
  const typed = sentenceWords(input)
  const typedPlain = typed.map(stripAccents)
  const typedBare = dropSubject(typed).join(' ')
  let best = variants[0]
  let bestSim = -1
  let verdict: AnswerCheck = 'wrong'
  for (const v of variants) {
    const ref = sentenceWords(v)
    if (ref.join(' ') === typed.join(' ') || dropSubject(ref).join(' ') === typedBare) return { verdict: 'exact', best: v, missing: new Set() }
    // Mêmes mots dans un autre ordre (« Fui ao cinema ontem » / « Ontem fui ao cinema ») : accepté.
    if (bag(dropSubject(ref)) === bag(dropSubject(typed))) return { verdict: 'exact', best: v, missing: new Set() }
    const sim = Math.max(similarity(typed.join(' '), ref.join(' ')), similarity(typedBare, dropSubject(ref).join(' ')))
    if (sim > bestSim) {
      bestSim = sim
      best = v
    }
    if (ref.map(stripAccents).join(' ') === typedPlain.join(' ') || stripAccents(dropSubject(ref).join(' ')) === stripAccents(typedBare)) verdict = 'accents'
  }
  if (verdict !== 'accents' && bestSim >= 0.88) verdict = 'close'
  const pool = new Set(typedPlain)
  const missing = new Set<number>()
  best.split(' ').forEach((w, i) => {
    const clean = stripAccents(words(w)[0] ?? '')
    if (i === 0 && SUBJECTS.has(words(w)[0] ?? '')) return
    if (clean && !pool.has(stripAccents(COLLOQUIAL[clean] ?? NUMBERS[clean] ?? clean))) missing.add(i)
  })
  return { verdict, best, missing }
}
