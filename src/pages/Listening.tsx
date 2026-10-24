import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, EyeOff, Gauge, Languages, Pause, Play, Volume2 } from 'lucide-react'
import { themeById } from '../data/themes'
import type { Theme } from '../data/types'
import { PageHeader, ProgressBar, SpeakButton, Tip, Waveform } from '../components/ui'
import { QuizRunner, ResultScreen } from '../components/QuizRunner'
import { speak, stopSpeaking, ttsSupported } from '../lib/speech'
import { similarity } from '../lib/text'
import { addXp, completeStep } from '../lib/store'
import { NotFound } from './NotFound'

type Phase = 'ecoute' | 'questions' | 'dictee' | 'fin'

export function Listening() {
  const { themeId } = useParams()
  const theme = themeById(themeId ?? '')
  const nav = useNavigate()
  const [phase, setPhase] = useState<Phase>('ecoute')
  const [quizScore, setQuizScore] = useState(0)
  const [dictScore, setDictScore] = useState(0)
  useEffect(() => () => void stopSpeaking(), [])

  if (!theme) return <NotFound />
  const total = theme.questions.length + 3

  return (
    <div className="page narrow">
      <PageHeader close={`/parcours/${theme.id}`} eyebrow="Compréhension orale" title={theme.dialogue.title} />
      <div className="phases">
        {(['ecoute', 'questions', 'dictee'] as Phase[]).map((ph, i) => (
          <span key={ph} className={`phase ${phase === ph ? 'active' : ''} ${['ecoute', 'questions', 'dictee', 'fin'].indexOf(phase) > i ? 'done' : ''}`}>
            {i + 1}. {ph === 'ecoute' ? 'Écoute' : ph === 'questions' ? 'Questions' : 'Dictée'}
          </span>
        ))}
      </div>

      {!ttsSupported && <Tip>Ton navigateur ne prend pas en charge la synthèse vocale. Essaie Chrome, Edge ou Safari.</Tip>}

      {phase === 'ecoute' && (
        <>
          <DialoguePlayer theme={theme} />
          <button className="btn btn-primary block" onClick={() => setPhase('questions')}>
            J’ai compris, aux questions !
          </button>
        </>
      )}

      {phase === 'questions' && (
        <>
          <DialoguePlayer theme={theme} compact />
          <QuizRunner
            questions={theme.questions.map((q) => ({ prompt: q.q, options: q.options, answer: q.answer, hint: 'Question' }))}
            onAnswer={(_, ok) => ok && addXp('ecoute', 10)}
            onFinish={(c) => {
              setQuizScore(c)
              setPhase('dictee')
            }}
          />
        </>
      )}

      {phase === 'dictee' && (
        <Dictation
          theme={theme}
          onFinish={(s) => {
            setDictScore(s)
            completeStep(theme.id, 'ecoute', Math.round(((quizScore + s) / total) * 100))
            setPhase('fin')
          }}
        />
      )}

      {phase === 'fin' && (
        <ResultScreen
          correct={quizScore + dictScore}
          total={total}
          onRetry={() => setPhase('ecoute')}
          onDone={() => nav(`/parcours/${theme.id}`)}
          doneLabel="Retour au thème"
        />
      )}
    </div>
  )
}

function DialoguePlayer({ theme, compact }: { theme: Theme; compact?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(-1)
  const [slow, setSlow] = useState(false)
  const [showText, setShowText] = useState(false)
  const [showFr, setShowFr] = useState(false)
  const cancel = useRef(false)
  const speakers = useMemo(() => [...new Set(theme.dialogue.lines.map((l) => l.speaker))], [theme])
  const rate = slow ? 0.7 : 0.95

  const play = async () => {
    if (playing) {
      cancel.current = true
      stopSpeaking()
      setPlaying(false)
      setCurrent(-1)
      return
    }
    cancel.current = false
    setPlaying(true)
    for (let i = 0; i < theme.dialogue.lines.length; i++) {
      if (cancel.current) break
      const line = theme.dialogue.lines[i]
      setCurrent(i)
      await speak(line.pt, { rate, voiceIndex: speakers.indexOf(line.speaker) })
      await new Promise((r) => setTimeout(r, 350))
    }
    setPlaying(false)
    setCurrent(-1)
  }

  useEffect(() => () => {
    cancel.current = true
  }, [])

  return (
    <div className={`card player ${compact ? 'compact' : ''}`}>
      <div className="player-main">
        <button className="play-btn" onClick={play} aria-label={playing ? 'Pause' : 'Écouter le dialogue'}>
          {playing ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <div className="grow">
          <Waveform active={playing} bars={compact ? 14 : 24} />
          <ProgressBar value={playing ? (current + 1) / theme.dialogue.lines.length : 0} />
        </div>
      </div>
      <div className="row gap-sm wrap">
        <button className={`chip ${slow ? 'on' : ''}`} onClick={() => setSlow(!slow)}>
          <Gauge size={16} /> {slow ? 'Lent' : 'Normal'}
        </button>
        <button className={`chip ${showText ? 'on' : ''}`} onClick={() => setShowText(!showText)}>
          {showText ? <EyeOff size={16} /> : <Eye size={16} />} Transcription
        </button>
        {showText && (
          <button className={`chip ${showFr ? 'on' : ''}`} onClick={() => setShowFr(!showFr)}>
            <Languages size={16} /> Traduction
          </button>
        )}
      </div>
      {showText && (
        <ul className="dialogue">
          {theme.dialogue.lines.map((l, i) => (
            <li key={i} className={`${current === i ? 'current' : ''} side-${speakers.indexOf(l.speaker) % 2}`}>
              <span className="speaker">{l.speaker}</span>
              <button className="bubble" onClick={() => speak(l.pt, { rate, voiceIndex: speakers.indexOf(l.speaker) })}>
                <span>{l.pt}</span>
                {showFr && <span className="muted small">{l.fr}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!compact && !showText && <p className="muted small center">Essaie d’abord d’écouter sans lire la transcription.</p>}
    </div>
  )
}

function Dictation({ theme, onFinish }: { theme: Theme; onFinish: (score: number) => void }) {
  const lines = useMemo(() => [...theme.dialogue.lines].sort((a, b) => a.pt.length - b.pt.length).slice(0, 3), [theme])
  const [i, setI] = useState(0)
  const [value, setValue] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const line = lines[i]

  useEffect(() => {
    speak(line.pt, { rate: 0.85 })
  }, [line])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (result !== null) {
      const next = score + (result >= 0.8 ? 1 : 0)
      if (i + 1 >= lines.length) return onFinish(next)
      setScore(next)
      setI(i + 1)
      setValue('')
      setResult(null)
      return
    }
    const sim = similarity(value, line.pt)
    setResult(sim)
    addXp('ecoute', Math.round(sim * 10))
  }

  return (
    <form className="write" onSubmit={submit}>
      <ProgressBar value={i / lines.length} />
      <div className="card quiz-card">
        <p className="eyebrow">Dictée {i + 1} / {lines.length}</p>
        <div className="row center gap">
          <button type="button" className="audio-prompt" onClick={() => speak(line.pt, { rate: 0.85 })}>
            <Volume2 size={32} />
            <span>Écouter</span>
          </button>
          <SpeakButton text={line.pt} rate={0.6} label="Lent" />
        </div>
      </div>
      <input
        className={`text-input ${result === null ? '' : result >= 0.8 ? 'ok' : 'ko'}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Écris ce que tu entends…"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        readOnly={result !== null}
        lang="pt-BR"
      />
      {result !== null && (
        <div className={`feedback ${result >= 0.8 ? 'ok' : 'ko'}`}>
          <div>
            <strong>
              {result >= 0.95 ? 'Perfeito !' : result >= 0.8 ? 'Très proche !' : 'Pas encore…'} ({Math.round(result * 100)} %)
            </strong>
            <p>{line.pt}</p>
            <p className="muted small">{line.fr}</p>
          </div>
        </div>
      )}
      <button className="btn btn-primary block" type="submit" disabled={result === null && !value.trim()}>
        {result === null ? 'Vérifier' : i + 1 >= lines.length ? 'Terminer' : 'Suivant'}
      </button>
    </form>
  )
}
