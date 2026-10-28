import type { Question } from '../data/types'
import { QuizRunner } from './QuizRunner'

/** Une seule question de compréhension d'un thème, pour la routine. */
export function RoutineThemeQuiz({ question, onDone }: { question: Question; onDone: (correct: boolean) => void }) {
  return (
    <QuizRunner
      questions={[{ prompt: question.q, options: question.options, answer: question.answer, hint: 'Question' }]}
      onFinish={(correct) => onDone(correct > 0)}
    />
  )
}
