/**
 * Progression stockée localement (localStorage). Une seule source de vérité,
 * exposée aux composants via `useProgress()`.
 */
import { useSyncExternalStore } from 'react'
import type { Skill, StepId, StudyItem } from '../data/types'
import { themes } from '../data/themes'
import { slang } from '../data/slang'
import { addDays, dayKey } from './dates'
import { grade, MASTERED, setStage, type Memory, type Quality } from './memory'
import { applyTheme } from './theme'

export interface XpEvent {
  date: string
  skill: Skill
  xp: number
}

export type CustomSource = 'perso' | 'discussion'

export interface CustomWord extends StudyItem {
  source: CustomSource
  /** Numéro de la fiche (20 mots max par fiche). */
  deck: number
  added: number
}

export interface GrammarState {
  learned?: boolean
  trained?: boolean
  mastered?: boolean
  best?: number
}

export interface ExerciseStat {
  stage: number
  fails: number
  /** Bonnes réponses d'affilée depuis la dernière erreur. */
  streak: number
  /** Point faible à retravailler. */
  weak: boolean
  last: number
}

/** Meilleurs scores (en %) des défis « Aller plus loin ». */
export interface ChallengeState {
  cloze?: number
  translation?: number
}

export type ThemeSetting = 'light' | 'dark' | 'auto'

export interface Settings {
  /** Lire à voix haute les réactions (« Mandou bem! »). */
  speakReactions: boolean
  /** Lire automatiquement les mots et phrases quand ils s'affichent. */
  autoPlay: boolean
  /** Volume de la voix, 0 à 1 (0 = muet). */
  volume: number
  /** Vitesse de lecture (1 = normale). */
  rate: number
  /** Nom de la voix choisie (sinon la meilleure voix brésilienne disponible). */
  voiceName?: string
  theme: ThemeSetting
  /** Nombre de questions par série dans les fiches. */
  roundSize: number
}

export const DEFAULT_SETTINGS: Settings = { speakReactions: true, autoPlay: true, volume: 1, rate: 1, theme: 'light', roundSize: 20 }

export interface ProgressState {
  name: string
  dailyGoal: number
  xpLog: XpEvent[]
  memory: Record<string, Memory>
  steps: Record<string, { score: number; date: string }>
  /** Meilleur score de prononciation par phrase. */
  speaking: Record<string, number>
  lastTheme?: string
  /** dayKey() de la dernière routine terminée (affichage uniquement, aucune limite quotidienne). */
  lastRoutineDay?: string
  /** Nombre total de routines terminées, toutes journées confondues. */
  routinesCompleted: number
  custom: CustomWord[]
  grammar: Record<string, GrammarState>
  exercises: Record<string, ExerciseStat>
  challenges: Record<string, ChallengeState>
  settings: Settings
}

const KEY = 'fala-progress-v2'
const OLD_KEY = 'fala-progress-v1'
export const DECK_SIZE = 20

const empty = (): ProgressState => ({
  name: '',
  dailyGoal: 50,
  xpLog: [],
  memory: {},
  steps: {},
  speaking: {},
  custom: [],
  grammar: {},
  exercises: {},
  challenges: {},
  settings: { ...DEFAULT_SETTINGS },
  routinesCompleted: 0,
})

/** Reprend la progression de la première version (boîtes de Leitner). */
function migrate(old: Record<string, unknown>): ProgressState {
  const s = { ...empty(), ...(old as Partial<ProgressState>) }
  const cards = (old.cards ?? {}) as Record<string, { box: number; due: string; seen: number; correct: number }>
  for (const [id, c] of Object.entries(cards)) {
    const stage = Math.min(MASTERED, c.box)
    s.memory[id] = { stage, stability: stage === MASTERED ? 7 : 0, due: c.due, last: Date.now(), seen: c.seen, correct: c.correct, lapses: 0, everMastered: stage === MASTERED }
  }
  delete (s as unknown as Record<string, unknown>).cards
  return s
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...empty(), ...parsed, settings: { ...empty().settings, ...parsed.settings } }
    }
    const old = localStorage.getItem(OLD_KEY)
    if (old) return migrate(JSON.parse(old))
  } catch {
    /* stockage indisponible : on repart de zéro */
  }
  return empty()
}

let state = load()
applyTheme(state.settings.theme)
const listeners = new Set<() => void>()

function set(next: ProgressState) {
  if (next.settings.theme !== state.settings.theme) applyTheme(next.settings.theme)
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useProgress = () => useSyncExternalStore(subscribe, () => state)
export const getProgress = () => state

// ---------- Actions ----------

export function addXp(skill: Skill, xp: number) {
  if (xp <= 0) return
  set({ ...state, xpLog: [...state.xpLog, { date: dayKey(), skill, xp: Math.round(xp) }] })
}

/** Enregistre une réponse sur un mot (mode intelligent ou QCM). */
export function recordReview(id: string, q: Quality, skill: Skill = 'vocabulaire', maxStage = MASTERED) {
  set({ ...state, memory: { ...state.memory, [id]: grade(state.memory[id], q, maxStage) } })
  if (q !== 'again') addXp(skill, q === 'good' ? 3 : 2)
}

export function setItemStage(id: string, stage: number) {
  set({ ...state, memory: { ...state.memory, [id]: setStage(state.memory[id], stage) } })
}

/** « Je le connais parfaitement » : le mot sort définitivement des révisions. */
export function retireItem(id: string) {
  const prev = state.memory[id]
  const base = prev ?? { stage: 0, stability: 0, due: dayKey(), last: 0, seen: 0, correct: 0, lapses: 0 }
  set({ ...state, memory: { ...state.memory, [id]: { ...base, stage: MASTERED, retired: true, everMastered: true, last: Date.now() } } })
}

/** Remet un mot retiré dans le circuit de révision (en phase de révision). */
export function unretireItem(id: string) {
  const prev = state.memory[id]
  if (!prev) return
  set({ ...state, memory: { ...state.memory, [id]: { ...prev, retired: false, stage: 4, due: dayKey() } } })
}

export function completeStep(themeId: string, step: StepId, score: number) {
  const key = `${themeId}:${step}`
  const prev = state.steps[key]
  const best = Math.max(score, prev?.score ?? 0)
  set({ ...state, lastTheme: themeId, steps: { ...state.steps, [key]: { score: best, date: dayKey() } } })
  if (!prev) addXp(step === 'oral' ? 'oral' : step === 'ecoute' ? 'ecoute' : 'vocabulaire', 20)
}

/** Réussir le quiz final valide tout le thème (les étapes pas encore faites sont marquées terminées). */
export function completeTheme(themeId: string, score: number) {
  ;(['vocabulaire', 'ecoute', 'oral', 'quiz'] as StepId[]).forEach((step) => completeStep(themeId, step, score))
}

/** Une série de routine est terminée : pas de verrou quotidien, on peut en enchaîner plusieurs. */
export function markRoutineDone() {
  set({ ...state, lastRoutineDay: dayKey(), routinesCompleted: state.routinesCompleted + 1 })
}

export function recordSpeaking(phraseId: string, score: number) {
  const best = Math.max(score, state.speaking[phraseId] ?? 0)
  set({ ...state, speaking: { ...state.speaking, [phraseId]: best } })
  addXp('oral', Math.round(score / 10))
}

export function setLastTheme(themeId: string) {
  if (state.lastTheme !== themeId) set({ ...state, lastTheme: themeId })
}

export function updateSettings(patch: Partial<Pick<ProgressState, 'name' | 'dailyGoal'>> & { settings?: Partial<Settings> }) {
  const { settings, ...rest } = patch
  set({ ...state, ...rest, settings: { ...state.settings, ...settings } })
  if (settings?.theme) applyTheme(settings.theme)
}

// --- Mots personnels et mots des discussions ---

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const customId = (source: CustomSource, pt: string) => `${source}-${slug(pt)}`

/** Ajoute un mot dans la dernière fiche non pleine de cette source (ou en crée une nouvelle). */
export function addCustomWord(source: CustomSource, word: Omit<StudyItem, 'id'>): CustomWord | null {
  const id = customId(source, word.pt)
  if (state.custom.some((w) => w.id === id)) return null
  const own = state.custom.filter((w) => w.source === source)
  const lastDeck = Math.max(1, ...own.map((w) => w.deck))
  const count = own.filter((w) => w.deck === lastDeck).length
  const deck = count >= DECK_SIZE ? lastDeck + 1 : lastDeck
  const entry: CustomWord = { ...word, id, source, deck, added: Date.now() }
  set({ ...state, custom: [...state.custom, entry] })
  addXp(source === 'discussion' ? 'lecture' : 'vocabulaire', 2)
  return entry
}

export function removeCustomWord(id: string) {
  const memory = { ...state.memory }
  delete memory[id]
  set({ ...state, custom: state.custom.filter((w) => w.id !== id), memory })
}

// --- Grammaire ---

export function updateGrammar(notionId: string, patch: GrammarState) {
  const prev = state.grammar[notionId] ?? {}
  const next = { ...prev, ...patch, best: Math.max(prev.best ?? 0, patch.best ?? 0) }
  set({ ...state, grammar: { ...state.grammar, [notionId]: next } })
}

export function updateChallenge(id: string, kind: keyof ChallengeState, score: number) {
  const prev = state.challenges[id] ?? {}
  set({ ...state, challenges: { ...state.challenges, [id]: { ...prev, [kind]: Math.max(prev[kind] ?? 0, score) } } })
}

/** Réponse à un exercice de grammaire : alimente les points faibles. */
export function recordExercise(exId: string, correct: boolean) {
  const prev = state.exercises[exId] ?? { stage: 0, fails: 0, streak: 0, weak: false, last: 0 }
  const next: ExerciseStat = correct
    ? { ...prev, stage: prev.stage + 1, streak: prev.streak + 1, weak: prev.weak && prev.streak + 1 < 2, last: Date.now() }
    : { ...prev, stage: Math.max(0, prev.stage - 1), fails: prev.fails + 1, streak: 0, weak: true, last: Date.now() }
  set({ ...state, exercises: { ...state.exercises, [exId]: next } })
  if (correct) addXp('grammaire', 4)
}

/** Remet la progression dans un état sauvegardé juste avant une réponse (bouton « Retour »). */
export function restoreProgress(snapshot: ProgressState) {
  set(snapshot)
}

/** Sauvegarde complète de la progression (fichier JSON). */
export function exportProgress(): string {
  return JSON.stringify({ app: 'fala', version: 2, exportedAt: new Date().toISOString(), progress: state }, null, 2)
}

/** Restaure une sauvegarde. Renvoie un message d'erreur si le fichier n'est pas valide. */
export function importProgress(json: string): string | null {
  try {
    const data = JSON.parse(json)
    const p = data?.app === 'fala' ? data.progress : null
    if (!p || typeof p !== 'object' || !Array.isArray(p.xpLog) || typeof p.memory !== 'object') return 'Ce fichier n’est pas une sauvegarde Fala!.'
    set({ ...empty(), ...p, settings: { ...empty().settings, ...p.settings } })
    return null
  } catch {
    return 'Fichier illisible.'
  }
}

export function resetProgress() {
  set(empty())
}

/** Génère 45 jours d'historique fictif pour visualiser les courbes. */
export function loadDemo() {
  const s = empty()
  s.name = state.name
  s.custom = state.custom
  const skills: Skill[] = ['vocabulaire', 'ecoute', 'oral', 'argot', 'grammaire', 'lecture']
  for (let i = 45; i >= 0; i--) {
    if (Math.random() < 0.18 && i > 1) continue
    const date = dayKey(addDays(new Date(), -i))
    const sessions = 1 + Math.floor(Math.random() * 3)
    for (let k = 0; k < sessions; k++) {
      s.xpLog.push({ date, skill: skills[Math.floor(Math.random() * skills.length)], xp: 8 + Math.floor(Math.random() * 18) })
    }
  }
  themes.slice(0, 4).forEach((t, ti) => {
    t.vocab.forEach((v) => {
      const stage = 1 + Math.floor(Math.random() * 5)
      s.memory[v.id] = { stage, stability: stage === MASTERED ? 7 : 0, due: dayKey(addDays(new Date(), ti - 1)), last: Date.now(), seen: 4, correct: 3, lapses: 0, everMastered: stage === MASTERED }
    })
    ;(['vocabulaire', 'ecoute', 'oral', 'quiz'] as StepId[]).forEach((step, si) => {
      if (ti < 3 || si < 2) s.steps[`${t.id}:${step}`] = { score: 70 + Math.floor(Math.random() * 30), date: dayKey() }
    })
    t.phrases.forEach((p) => (s.speaking[p.id] = 55 + Math.floor(Math.random() * 40)))
  })
  slang.slice(0, 10).forEach((g) => {
    s.memory[g.id] = { stage: 4, stability: 0, due: dayKey(), last: Date.now(), seen: 3, correct: 3, lapses: 0 }
  })
  s.grammar = { 'presente-regulares': { learned: true, trained: true, mastered: true, best: 90 }, 'ser-estar': { learned: true, trained: true, best: 0 }, artigos: { learned: true } }
  s.lastTheme = themes[3].id
  set(s)
}

// ---------- Sélecteurs ----------

export const totalXp = (s: ProgressState) => s.xpLog.reduce((a, e) => a + e.xp, 0)

export const xpByDay = (s: ProgressState) => {
  const m = new Map<string, number>()
  s.xpLog.forEach((e) => m.set(e.date, (m.get(e.date) ?? 0) + e.xp))
  return m
}

export const xpBySkill = (s: ProgressState) => {
  const m: Record<Skill, number> = { vocabulaire: 0, ecoute: 0, oral: 0, argot: 0, grammaire: 0, lecture: 0 }
  s.xpLog.forEach((e) => (m[e.skill] = (m[e.skill] ?? 0) + e.xp))
  return m
}

export function streak(s: ProgressState): number {
  const days = new Set(s.xpLog.map((e) => e.date))
  let d = new Date()
  if (!days.has(dayKey(d))) d = addDays(d, -1)
  let n = 0
  while (days.has(dayKey(d))) {
    n++
    d = addDays(d, -1)
  }
  return n
}

export const stageOf = (s: ProgressState, id: string) => s.memory[id]?.stage ?? 0
export const isMastered = (s: ProgressState, id: string) => stageOf(s, id) >= MASTERED

/** Mots à revoir aujourd'hui : maîtrisés arrivés à échéance + mots en cours non revus depuis hier. */
export function dueToday(s: ProgressState, ids: string[]) {
  const today = dayKey()
  return ids.filter((id) => {
    const m = s.memory[id]
    if (!m || m.stage === 0 || m.retired) return false
    if (m.stage === MASTERED) return m.due <= today
    return dayKey(new Date(m.last)) < today
  })
}

export const stepDone = (s: ProgressState, themeId: string, step: StepId) => !!s.steps[`${themeId}:${step}`]

export const themeProgress = (s: ProgressState, themeId: string) =>
  (['vocabulaire', 'ecoute', 'oral', 'quiz'] as StepId[]).filter((st) => stepDone(s, themeId, st)).length / 4

export function speakingConfidence(s: ProgressState): number {
  const scores = Object.values(s.speaking)
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
}

export const weakExercises = (s: ProgressState) =>
  Object.entries(s.exercises)
    .filter(([, e]) => e.weak)
    .map(([id]) => id)
