/**
 * Couche voix : synthèse (TTS), reconnaissance (STT) et évaluation de la prononciation.
 *
 * Version actuelle : API natives du navigateur (gratuites, approximatives).
 * Pour brancher un service IA plus tard (Azure Pronunciation Assessment, Whisper…),
 * il suffit d'implémenter `PronunciationEvaluator` et de remplacer `evaluator` en bas de fichier.
 */
import { similarity, stripAccents, words } from './text'
import { getProgress } from './store'

// ---------- Synthèse vocale ----------

export const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

/** Voix portugaises disponibles, brésiliennes en priorité (mises à jour dès que le navigateur les charge). */
let voices: SpeechSynthesisVoice[] = []
const PREFERRED = /luciana|felipe|google português do brasil|francisca|thalita|antonio|daniel/i
// Voix « fantaisie » ou robotiques (Apple) : utilisées seulement s'il n'y a rien d'autre.
const ROBOTIC = /eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|bad news|bells|boing|bubbles|jester|organ|superstar|trinoids|whisper|wobble|zarvox/i
const score = (v: SpeechSynthesisVoice) => (PREFERRED.test(v.name) ? 2 : ROBOTIC.test(v.name) ? 0 : 1)

function refreshVoices() {
  const all = speechSynthesis.getVoices()
  const br = all.filter((v) => /pt[-_]BR/i.test(v.lang))
  const pt = all.filter((v) => v.lang.toLowerCase().startsWith('pt'))
  const list = br.length ? br : pt
  // Voix de meilleure qualité en premier.
  voices = [...list].sort((a, b) => score(b) - score(a))
}

if (ttsSupported) {
  refreshVoices()
  speechSynthesis.addEventListener?.('voiceschanged', refreshVoices)
  // iOS / Safari : la synthèse doit être « débloquée » par une première lecture pendant un geste.
  const unlock = () => {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    speechSynthesis.speak(u)
  }
  window.addEventListener('pointerdown', unlock, { once: true, capture: true })
  window.addEventListener('keydown', unlock, { once: true, capture: true })
}

/** Voix portugaises disponibles sur l'appareil (meilleures en premier). */
export function listVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported) return []
  if (!voices.length) refreshVoices()
  return voices
}

/** Voix utilisée : celle choisie dans Réglages si elle existe, sinon la meilleure disponible. */
export function currentVoice(): SpeechSynthesisVoice | null {
  const list = listVoices()
  const chosen = getProgress().settings.voiceName
  return list.find((v) => v.name === chosen) ?? list[0] ?? null
}

export interface SpeakOptions {
  rate?: number
  /** Permet d'alterner les voix dans un dialogue. */
  voiceIndex?: number
  pitch?: number
  /** Lecture déclenchée automatiquement (pas par un clic) : ignorée si la lecture auto est désactivée. */
  auto?: boolean
}

// Référence gardée : sinon Chrome peut libérer l'énoncé et ne jamais appeler `onend`.
let current: SpeechSynthesisUtterance | null = null

/**
 * Lit un texte en portugais. Volontairement synchrone jusqu'à `speechSynthesis.speak`
 * (sans `await` avant) : Safari iOS refuse la lecture si elle ne part pas directement du geste.
 */
export function speak(text: string, { rate = 1, voiceIndex = 0, pitch = 1, auto = false }: SpeakOptions = {}): Promise<void> {
  const settings = getProgress().settings
  if (!ttsSupported || !text.trim() || settings.volume <= 0 || (auto && !settings.autoPlay)) return Promise.resolve()
  rate *= settings.rate
  const synth = window.speechSynthesis
  if (!voices.length) refreshVoices()
  if (synth.speaking || synth.pending) synth.cancel()
  // Chrome peut rester bloqué en pause après un changement d'onglet.
  synth.resume()

  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pt-BR'
    u.rate = Math.min(2, Math.max(0.3, rate))
    u.pitch = pitch
    u.volume = settings.volume
    if (voices.length) {
      // Voix choisie en premier ; dans un dialogue, le 2ᵉ personnage prend la voix suivante.
      const chosen = currentVoice()
      const ordered = chosen ? [chosen, ...voices.filter((v) => v !== chosen)] : voices
      u.voice = ordered[voiceIndex % ordered.length]
      // Une seule voix disponible : on varie la hauteur pour distinguer les personnages.
      if (voices.length === 1 && voiceIndex % 2 === 1) u.pitch = 0.75
    }
    let done = false
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(timer)
      if (current === u) current = null
      resolve()
    }
    // Filet de sécurité si le navigateur n'envoie jamais `onend`.
    const timer = setTimeout(finish, 2000 + (text.length * 110) / rate)
    u.onend = finish
    u.onerror = finish
    current = u
    synth.speak(u)
  })
}

export const stopSpeaking = () => ttsSupported && speechSynthesis.cancel()

// ---------- Reconnaissance vocale ----------

interface RecognitionAlternative {
  transcript: string
}
interface RecognitionEvent {
  results: ArrayLike<ArrayLike<RecognitionAlternative> & { isFinal: boolean }>
}
interface Recognition {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type RecognitionCtor = new () => Recognition

const RecognitionImpl: RecognitionCtor | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, RecognitionCtor | undefined>).SpeechRecognition ??
      (window as unknown as Record<string, RecognitionCtor | undefined>).webkitSpeechRecognition)
    : undefined

export const recognitionSupported = !!RecognitionImpl

export interface ListenSession {
  /** Résout avec les transcriptions possibles (meilleure en premier). */
  result: Promise<string[]>
  stop(): void
}

export function listen(onInterim?: (text: string) => void): ListenSession {
  if (!RecognitionImpl) {
    return { result: Promise.reject(new Error('unsupported')), stop: () => {} }
  }
  const rec = new RecognitionImpl()
  rec.lang = 'pt-BR'
  rec.interimResults = true
  rec.maxAlternatives = 3
  rec.continuous = false

  let finals: string[] = []
  let lastInterim = ''
  const result = new Promise<string[]>((resolve, reject) => {
    rec.onresult = (e) => {
      const res = e.results[e.results.length - 1]
      if (res.isFinal) {
        finals = Array.from(res).map((a) => a.transcript)
      } else {
        lastInterim = res[0]?.transcript ?? ''
        onInterim?.(lastInterim)
      }
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') resolve([])
      else reject(new Error(e.error))
    }
    rec.onend = () => resolve(finals.length ? finals : lastInterim ? [lastInterim] : [])
  })
  rec.start()
  return { result, stop: () => rec.stop() }
}

// ---------- Évaluation de la prononciation ----------

export interface WordMark {
  word: string
  ok: boolean
}

export interface PronunciationResult {
  /** Score 0–100. */
  score: number
  heard: string
  words: WordMark[]
}

export interface PronunciationEvaluator {
  name: string
  evaluate(target: string, input: { transcripts: string[]; audio?: Blob }): Promise<PronunciationResult>
}

function markWords(target: string, heard: string): WordMark[] {
  const original = target.split(/\s+/).filter(Boolean)
  const heardWords = words(heard).map(stripAccents)
  return original.map((w) => {
    const clean = stripAccents(words(w)[0] ?? '')
    const ok = !clean || heardWords.some((h) => h === clean || similarity(h, clean) >= 0.75)
    return { word: w, ok }
  })
}

/** Compare la transcription du navigateur avec la phrase attendue. */
export const nativeEvaluator: PronunciationEvaluator = {
  name: 'Navigateur',
  async evaluate(target, { transcripts }) {
    if (!transcripts.length) return { score: 0, heard: '', words: markWords(target, '') }
    let best: PronunciationResult | null = null
    for (const heard of transcripts) {
      const marks = markWords(target, heard)
      const wordScore = marks.filter((m) => m.ok).length / Math.max(1, marks.length)
      const score = Math.round((0.6 * wordScore + 0.4 * similarity(target, heard)) * 100)
      if (!best || score > best.score) best = { score, heard, words: marks }
    }
    return best!
  },
}

export const evaluator: PronunciationEvaluator = nativeEvaluator
