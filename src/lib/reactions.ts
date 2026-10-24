import { speak } from './speech'
import { getProgress } from './store'

export interface ReactionPhrase {
  pt: string
  fr: string
}

const SUCCESS: ReactionPhrase[] = [
  { pt: 'Mandou bem!', fr: 'Bien joué !' },
  { pt: 'Arrasou!', fr: 'Tu as tout déchiré !' },
  { pt: 'Isso aí!', fr: "C'est ça !" },
  { pt: 'Muito bem!', fr: 'Très bien !' },
  { pt: 'Perfeito!', fr: 'Parfait !' },
  { pt: 'Show de bola!', fr: 'Génial !' },
  { pt: 'Você é fera!', fr: 'Tu es un as !' },
  { pt: 'Boa!', fr: 'Bien !' },
  { pt: 'Excelente!', fr: 'Excellent !' },
  { pt: 'Tá voando!', fr: 'Tu voles !' },
  { pt: 'Sensacional!', fr: 'Sensationnel !' },
  { pt: 'Acertou em cheio!', fr: 'Dans le mille !' },
  { pt: 'Demais!', fr: 'Trop fort !' },
  { pt: 'É isso mesmo!', fr: "C'est exactement ça !" },
  { pt: 'Caprichou!', fr: 'Du travail soigné !' },
  { pt: 'Que craque!', fr: 'Quel crack !' },
  { pt: 'Parabéns!', fr: 'Félicitations !' },
  { pt: 'Tá ficando fera!', fr: 'Tu deviens un pro !' },
  { pt: 'Brilhou!', fr: 'Tu as brillé !' },
  { pt: 'Na mosca!', fr: 'En plein dans le mille !' },
]

const FAIL: ReactionPhrase[] = [
  { pt: 'Que pena!', fr: "C'est dommage !" },
  { pt: 'Quase lá!', fr: "Tu y es presque !" },
  { pt: 'Foi por pouco!', fr: "C'était presque ça !" },
  { pt: 'Não foi dessa vez.', fr: 'Pas cette fois-ci.' },
  { pt: 'Poxa, quase!', fr: 'Mince, presque !' },
  { pt: 'Calma, você chega lá!', fr: 'Calme, tu vas y arriver !' },
  { pt: 'Faz parte!', fr: 'Ça fait partie du jeu !' },
  { pt: 'Bora tentar de novo!', fr: 'On réessaie !' },
  { pt: 'Errar é humano!', fr: "L'erreur est humaine !" },
  { pt: 'Na próxima vai!', fr: 'La prochaine sera la bonne !' },
  { pt: 'Não desanima!', fr: 'Ne te décourage pas !' },
  { pt: 'Por um triz!', fr: "À un cheveu près !" },
  { pt: 'Xi, escapou!', fr: "Oups, ça t'a échappé !" },
  { pt: 'Tá quase!', fr: "C'est presque bon !" },
]

let lastIndex = -1

function pick(list: ReactionPhrase[]): ReactionPhrase {
  let i = Math.floor(Math.random() * list.length)
  if (i === lastIndex) i = (i + 1) % list.length
  lastIndex = i
  return list[i]
}

/** Choisit une réaction et la lit avec une intonation variable. */
export function react(success: boolean): ReactionPhrase {
  const r = pick(success ? SUCCESS : FAIL)
  if (getProgress().settings.speakReactions) {
    const pitch = success ? 1.05 + Math.random() * 0.3 : 0.8 + Math.random() * 0.15
    const rate = success ? 1 + Math.random() * 0.15 : 0.85 + Math.random() * 0.1
    speak(r.pt, { pitch, rate })
  }
  return r
}
