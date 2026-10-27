/**
 * Mode intelligent : modèle de mémoire par mot + planification des questions dans une session.
 *
 * Étapes d'un mot (stage) :
 *   0 nouveau        → carte de découverte (mot + phrase)
 *   1 apprentissage  → QCM portugais → français, avec la phrase en contexte
 *   2 apprentissage  → QCM français → portugais, avec la phrase en contexte
 *   3 révision       → écrire le mot dans sa phrase (texte à trou)
 *   4 révision       → écrire le mot seul (français → portugais)
 *   5 maîtrise       → revient à intervalles croissants (3 j, 1 sem., 3 sem., 2 mois…)
 */
import { addDays, dayKey } from './dates'

export type Quality = 'again' | 'hard' | 'good'

export interface Memory {
  stage: number
  /** Solidité du souvenir, en jours (sert à espacer les révisions des mots maîtrisés). */
  stability: number
  due: string
  last: number
  seen: number
  correct: number
  lapses: number
  /** A déjà été maîtrisé au moins une fois (sert à signaler « à consolider »). */
  everMastered?: boolean
  /** Retiré des révisions par l'utilisateur (« je le connais parfaitement »). */
  retired?: boolean
}

export const MASTERED = 5

export type Phase = 'nouveau' | 'apprentissage' | 'revision' | 'maitrise'

export const PHASE_LABEL: Record<Phase, string> = {
  nouveau: 'Nouveau',
  apprentissage: 'Apprentissage',
  revision: 'Révision',
  maitrise: 'Maîtrise',
}

export function phaseOf(m?: Memory): Phase {
  if (!m || m.stage === 0) return 'nouveau'
  if (m.stage <= 2) return 'apprentissage'
  if (m.stage < MASTERED) return 'revision'
  return 'maitrise'
}

const fresh = (): Memory => ({ stage: 0, stability: 0, due: dayKey(), last: 0, seen: 0, correct: 0, lapses: 0 })

/**
 * Met à jour la mémoire d'un mot après une réponse.
 * `maxStage` limite la progression (ex. un QCM hors mode intelligent ne peut pas valider la maîtrise).
 */
export function grade(prev: Memory | undefined, q: Quality, maxStage = MASTERED, now = Date.now()): Memory {
  const m = prev ?? fresh()
  let { stage, stability, lapses } = m
  if (q === 'good') {
    if (stage < maxStage) stage++
    if (stage === MASTERED) stability = m.stage === MASTERED ? Math.max(3, stability * 2.5) : Math.max(3, stability)
  } else if (q === 'hard') {
    if (stage < 3 && stage < maxStage) stage++
    if (stage === MASTERED) stability = Math.max(2, stability * 1.2)
  } else {
    if (stage === MASTERED) {
      stage = 3
      lapses++
    } else {
      stage = Math.max(1, stage - 1)
    }
    stability *= 0.3
  }
  const due = stage === MASTERED ? dayKey(addDays(new Date(now), Math.round(stability))) : dayKey(new Date(now))
  return {
    ...m,
    stage,
    stability,
    due,
    last: now,
    seen: m.seen + 1,
    correct: m.correct + (q === 'again' ? 0 : 1),
    lapses,
    everMastered: m.everMastered || stage === MASTERED,
  }
}

/** Place directement un mot à une étape (découverte terminée, « je connais déjà »…). */
export function setStage(prev: Memory | undefined, stage: number, now = Date.now()): Memory {
  const m = prev ?? fresh()
  return { ...m, stage: Math.max(m.stage, stage), last: now, due: dayKey(new Date(now)) }
}

export const isDue = (m?: Memory) => !!m && !m.retired && m.stage === MASTERED && m.due <= dayKey()

/** À consolider : un mot déjà maîtrisé qui a été oublié. */
export const needsConsolidation = (m?: Memory) => !!m && !m.retired && !!m.everMastered && m.stage < MASTERED

// ---------- Session ----------

export interface SessionOptions {
  /** Nombre de questions par série avant l'écran « Continuer / Arrêter ». */
  roundSize?: number
  /** Nombre de mots travaillés en parallèle (les nouveaux sont introduits au fur et à mesure). */
  maxActive?: number
  /** Le mot sort de la session quand il est terminé. */
  isDone: (id: string, goodInSession: number) => boolean
}

export interface SessionSnapshot {
  sched: [string, number][]
  gaps: [string, number][]
  good: [string, number][]
  queue: string[]
  lastId: string | null
  retryId: string | null
  step: number
  roundStep: number
  roundCorrect: number
}

export class StudySession {
  private sched = new Map<string, number>()
  private gaps = new Map<string, number>()
  private good = new Map<string, number>()
  private queue: string[]
  private lastId: string | null = null
  /** Mot raté à reposer immédiatement. */
  private retryId: string | null = null
  step = 0
  roundStep = 0
  roundCorrect = 0
  opts: SessionOptions

  constructor(candidates: string[], opts: SessionOptions) {
    this.queue = [...candidates]
    this.opts = opts
  }

  private ordered() {
    return [...this.sched].sort((a, b) => a[1] - b[1])
  }

  private pickAvoidingLast(list: [string, number][]) {
    return (list.find(([id]) => id !== this.lastId) ?? list[0])[0]
  }

  next(): string | null {
    // Après une erreur, on repose tout de suite le mot raté.
    if (this.retryId && this.sched.has(this.retryId)) return this.retryId
    const due = this.ordered().filter(([, at]) => at <= this.step)
    if (due.length && (due.some(([id]) => id !== this.lastId) || this.sched.size === 1)) return this.pickAvoidingLast(due)

    const max = this.opts.maxActive ?? 6
    while (this.sched.size < max && this.queue.length) {
      const id = this.queue.shift()!
      if (!this.opts.isDone(id, 0)) {
        this.sched.set(id, this.step)
        return id
      }
    }
    const all = this.ordered()
    return all.length ? this.pickAvoidingLast(all) : null
  }

  /** `intro` = carte de découverte vue (pas de notation). */
  record(id: string, q: Quality | 'intro') {
    this.step++
    this.lastId = id
    this.retryId = q === 'again' ? id : null
    if (q !== 'intro') {
      this.roundStep++
      if (q !== 'again') {
        this.roundCorrect++
        this.good.set(id, (this.good.get(id) ?? 0) + 1)
      }
    }
    if (q !== 'again' && this.opts.isDone(id, this.good.get(id) ?? 0)) {
      this.sched.delete(id)
      return
    }
    const g = this.gaps.get(id) ?? 3
    // Raté → reposé immédiatement (voir next) ; réussi → revient de plus en plus loin.
    const gap = q === 'intro' ? 2 : q === 'again' ? 1 : q === 'hard' ? Math.max(3, Math.round(g * 1.5)) : Math.max(4, Math.round(g * 2.2))
    this.gaps.set(id, q === 'again' ? 3 : gap)
    this.sched.set(id, this.step + gap)
  }

  /** La question en cours est-elle le nouvel essai immédiat après une erreur ? */
  isRetry(id: string) {
    return this.retryId === id
  }

  /**
   * Nouvel essai après une erreur : ne compte ni dans la série ni dans la progression.
   * Raté → on repose encore ; réussi → le mot reprend sa place dans le cycle normal.
   */
  recordRetry(id: string, ok: boolean) {
    this.lastId = id
    if (!ok) return
    this.retryId = null
    this.gaps.set(id, 3)
    this.sched.set(id, this.step + 3)
  }

  /** Retire un mot de la session (sans compter de réponse). */
  drop(id: string) {
    this.sched.delete(id)
    this.queue = this.queue.filter((q) => q !== id)
    this.lastId = id
    if (this.retryId === id) this.retryId = null
  }

  /** Copie de l'état interne, pour pouvoir annuler une réponse. */
  snapshot(): SessionSnapshot {
    return {
      sched: [...this.sched],
      gaps: [...this.gaps],
      good: [...this.good],
      queue: [...this.queue],
      lastId: this.lastId,
      retryId: this.retryId,
      step: this.step,
      roundStep: this.roundStep,
      roundCorrect: this.roundCorrect,
    }
  }

  restore(s: SessionSnapshot) {
    this.sched = new Map(s.sched)
    this.gaps = new Map(s.gaps)
    this.good = new Map(s.good)
    this.queue = [...s.queue]
    this.lastId = s.lastId
    this.retryId = s.retryId ?? null
    this.step = s.step
    this.roundStep = s.roundStep
    this.roundCorrect = s.roundCorrect
  }

  get roundOver() {
    return this.roundStep >= (this.opts.roundSize ?? 20)
  }

  newRound() {
    this.roundStep = 0
    this.roundCorrect = 0
  }

  /** Ajoute de nouveaux candidats à la file, sans perdre l'état de planification en cours. */
  extend(ids: string[]) {
    this.queue.push(...ids)
  }
}
