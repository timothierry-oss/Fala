import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Mic, Square, Volume2 } from 'lucide-react'
import { themeById } from '../data/themes'
import { PageHeader, ProgressBar, SpeakButton, Tip, Waveform } from '../components/ui'
import { ResultScreen } from '../components/QuizRunner'
import { evaluator, listen, recognitionSupported, speak, stopSpeaking, type ListenSession, type PronunciationResult } from '../lib/speech'
import { completeStep, recordSpeaking } from '../lib/store'
import { NotFound } from './NotFound'

type MicState = 'idle' | 'listening' | 'evaluating'

const ENCOURAGEMENTS = ['Essaie de parler naturellement. Tu vas y arriver !', 'Écoute d’abord le modèle, puis répète.', 'Pas besoin d’être parfait : vise la fluidité.']

export function Speaking() {
  const { themeId } = useParams()
  const theme = themeById(themeId ?? '')
  const nav = useNavigate()
  const [i, setI] = useState(0)
  const [mic, setMic] = useState<MicState>('idle')
  const [interim, setInterim] = useState('')
  const [result, setResult] = useState<PronunciationResult | null>(null)
  const [error, setError] = useState('')
  const [scores, setScores] = useState<number[]>([])
  const session = useRef<ListenSession | null>(null)

  useEffect(
    () => () => {
      session.current?.stop()
      stopSpeaking()
    },
    [],
  )

  if (!theme) return <NotFound />
  const phrases = theme.phrases
  const phrase = phrases[i]

  if (!phrase) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length))
    return (
      <div className="page narrow">
        <PageHeader close={`/parcours/${theme.id}`} eyebrow="Prononciation" title={theme.title} />
        <ResultScreen
          correct={scores.filter((s) => s >= 70).length}
          total={phrases.length}
          onRetry={() => {
            setI(0)
            setScores([])
          }}
          onDone={() => nav(`/parcours/${theme.id}`)}
          doneLabel={`Terminer · score moyen ${avg} %`}
        />
      </div>
    )
  }

  const start = async () => {
    if (mic === 'listening') {
      session.current?.stop()
      return
    }
    stopSpeaking()
    setError('')
    setResult(null)
    setInterim('')
    setMic('listening')
    const s = listen(setInterim)
    session.current = s
    try {
      const transcripts = await s.result
      setMic('evaluating')
      if (!transcripts.length) {
        setError('Je n’ai rien entendu. Rapproche-toi du micro et réessaie.')
        setMic('idle')
        return
      }
      const r = await evaluator.evaluate(phrase.pt, { transcripts })
      setResult(r)
      recordSpeaking(phrase.id, r.score)
    } catch (e) {
      const msg = (e as Error).message
      setError(msg === 'not-allowed' ? 'Accès au micro refusé. Autorise le micro dans les réglages du navigateur.' : `Erreur de reconnaissance (${msg}).`)
    }
    setMic('idle')
  }

  const next = () => {
    const finalScores = result ? [...scores, result.score] : scores
    setScores(finalScores)
    setResult(null)
    setInterim('')
    setError('')
    if (i + 1 >= phrases.length && finalScores.length) {
      completeStep(theme.id, 'oral', Math.round(finalScores.reduce((a, b) => a + b, 0) / finalScores.length))
    }
    setI(i + 1)
  }

  const scoreTone = !result ? '' : result.score >= 85 ? 'great' : result.score >= 60 ? 'good' : 'low'

  return (
    <div className="page narrow speaking">
      <PageHeader
        close={`/parcours/${theme.id}`}
        right={
          <span className="muted">
            Pratique {i + 1} / {phrases.length}
          </span>
        }
        eyebrow="Prononciation"
        title="Dis-le à voix haute"
      />
      <ProgressBar value={i / phrases.length} />

      <div className="card speak-stage">
        <h2 className="phrase big">{phrase.pt}</h2>
        <p className="muted">{phrase.fr}</p>
        <div className="row center gap-sm">
          <SpeakButton text={phrase.pt} label="Modèle" />
          <SpeakButton text={phrase.pt} rate={0.6} label="Lent" />
        </div>

        <button
          className={`mic ${mic}`}
          onClick={start}
          disabled={!recognitionSupported || mic === 'evaluating'}
          aria-label={mic === 'listening' ? 'Arrêter' : 'Parler'}
        >
          {mic === 'listening' ? <Square size={34} /> : <Mic size={40} />}
        </button>
        <Waveform active={mic === 'listening'} />
        <p className="muted">
          {mic === 'listening' ? interim || 'Je t’écoute…' : mic === 'evaluating' ? 'Analyse…' : 'Touche pour parler'}
        </p>

        {result && (
          <div className={`speak-result ${scoreTone}`}>
            <div className="score">{result.score}%</div>
            <p className="marked">
              {result.words.map((w, k) => (
                <span key={k} className={w.ok ? 'w-ok' : 'w-ko'}>
                  {w.word}{' '}
                </span>
              ))}
            </p>
            <p className="muted small">
              Entendu : « {result.heard} »
            </p>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>

      {!recognitionSupported ? (
        <Tip>La reconnaissance vocale n’est pas disponible dans ce navigateur. Utilise Chrome, Edge ou Safari, sur ordinateur ou sur mobile.</Tip>
      ) : (
        <Tip>{phrase.tip ?? ENCOURAGEMENTS[i % ENCOURAGEMENTS.length]}</Tip>
      )}

      <div className="row gap">
        {result && result.score < 85 && (
          <button className="btn btn-ghost grow" onClick={() => speak(phrase.pt, { rate: 0.8 })}>
            <Volume2 size={18} /> Réécouter
          </button>
        )}
        <button className="btn btn-primary grow" onClick={next}>
          {result ? 'Suivant' : 'Passer'}
        </button>
      </div>
    </div>
  )
}
