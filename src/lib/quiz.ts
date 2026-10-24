import type { QuizQuestion } from '../components/QuizRunner'
import type { VocabItem } from '../data/types'
import { sample, shuffle } from './text'

type Mode = 'pt-fr' | 'fr-pt' | 'audio'

function makeQuestion(item: VocabItem, pool: VocabItem[], mode: Mode): QuizQuestion {
  const distractors = sample(
    pool.filter((p) => p.id !== item.id),
    3,
  )
  const options = shuffle([item, ...distractors])
  const answer = options.indexOf(item)
  if (mode === 'fr-pt') {
    return { prompt: item.fr, hint: 'Comment dit-on en portugais ?', options: options.map((o) => o.pt), answer, cardId: item.id }
  }
  if (mode === 'audio') {
    return { prompt: 'Que signifie ce mot ?', audio: item.pt, hint: 'Écoute', options: options.map((o) => o.fr), answer, cardId: item.id }
  }
  return { prompt: item.pt, hint: 'Que signifie ?', options: options.map((o) => o.fr), answer, cardId: item.id }
}

/** Questions à choix multiples variées (lecture, traduction inverse, écoute). */
export function buildVocabQuiz(items: VocabItem[], pool: VocabItem[], count = items.length, modes: Mode[] = ['pt-fr', 'fr-pt', 'audio']): QuizQuestion[] {
  return sample(items, Math.min(count, items.length)).map((item, i) => makeQuestion(item, pool.length >= 4 ? pool : items, modes[i % modes.length]))
}
