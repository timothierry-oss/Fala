export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type Skill = 'vocabulaire' | 'ecoute' | 'oral' | 'argot' | 'grammaire' | 'lecture'

export interface VocabItem {
  id: string
  pt: string
  fr: string
  ex?: string
  exFr?: string
  note?: string
}

/** Élément révisable dans les fiches (vocabulaire, argot, mots perso, discussions). */
export interface StudyItem extends VocabItem {
  cat?: string
}

export interface DialogueLine {
  speaker: string
  pt: string
  fr: string
}

export interface Question {
  q: string
  options: string[]
  answer: number
}

export interface Phrase {
  id: string
  pt: string
  fr: string
  tip?: string
}

export interface Theme {
  id: string
  title: string
  ptTitle: string
  level: Level
  emoji: string
  description: string
  vocab: VocabItem[]
  dialogue: { title: string; lines: DialogueLine[] }
  questions: Question[]
  phrases: Phrase[]
}

export type SlangCategory =
  | 'Salutations'
  | 'Réactions'
  | 'Personnes'
  | 'Sorties'
  | 'Au quotidien'
  | 'SMS & internet'

export interface SlangItem {
  id: string
  pt: string
  fr: string
  ex: string
  exFr: string
  category: SlangCategory
  register: 'familier' | 'très familier'
  region: string
  note?: string
}

export type StepId = 'vocabulaire' | 'ecoute' | 'oral' | 'quiz'
