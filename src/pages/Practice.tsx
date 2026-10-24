import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Headphones, MessageCircle, Mic, MessagesSquare, PenLine, RotateCcw } from 'lucide-react'
import { themes } from '../data/themes'
import { LevelBadge, PageHeader } from '../components/ui'
import { dueToday, stepDone, useProgress, weakExercises } from '../lib/store'
import { allItems } from '../lib/decks'

export function Practice() {
  const p = useProgress()
  const due = dueToday(p, allItems(p).map((v) => v.id)).length
  const weak = weakExercises(p).length
  const items = [
    { to: '/fiches', icon: BookOpen, title: 'Fiches de vocabulaire', desc: due ? `${due} mots à réviser aujourd’hui` : 'Mode intelligent : cartes, QCM et écrit', tone: 'green' },
    { to: '/discussions', icon: MessagesSquare, title: 'Discussions', desc: 'Lis, touche les mots inconnus, révise-les', tone: 'navy' },
    { to: '/mes-mots', icon: PenLine, title: 'Mes mots', desc: 'Écris en français, crée tes fiches', tone: 'yellow' },
    { to: '/grammaire/revision', icon: RotateCcw, title: 'Mes points faibles', desc: weak ? `${weak} exercices de grammaire à retravailler` : 'Grammaire : tes erreurs à retravailler', tone: 'teal' },
    { to: '/pratique/ecoute', icon: Headphones, title: 'Compréhension orale', desc: 'Dialogues, questions et dictées', tone: 'navy' },
    { to: '/pratique/oral', icon: Mic, title: 'Prononciation', desc: 'Parle et reçois un score', tone: 'yellow' },
    { to: '/argot', icon: MessageCircle, title: 'Gírias', desc: 'L’argot utile du quotidien', tone: 'teal' },
  ]
  return (
    <div className="page">
      <PageHeader eyebrow="Pratique libre" title="Entraînement" />
      <div className="practice-grid">
        {items.map(({ to, icon: Icon, title, desc, tone }) => (
          <Link key={to} to={to} className={`card practice-card tone-${tone}`}>
            <span className="practice-icon">
              <Icon size={26} />
            </span>
            <div className="grow">
              <h3>{title}</h3>
              <p className="muted small">{desc}</p>
            </div>
            <ChevronRight size={20} className="muted" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PracticeThemeList({ kind }: { kind: 'ecoute' | 'oral' }) {
  const p = useProgress()
  return (
    <div className="page">
      <PageHeader back="/pratique" eyebrow="Choisis un thème" title={kind === 'ecoute' ? 'Compréhension orale' : 'Prononciation'} />
      <div className="vocab-list">
        {themes.map((t) => (
          <Link key={t.id} to={`/${kind}/${t.id}`} className="card step">
            <span className="step-icon emoji">{t.emoji}</span>
            <div className="grow">
              <h3>{kind === 'ecoute' ? t.dialogue.title : t.title}</h3>
              <p className="muted small">
                {t.title} · {kind === 'ecoute' ? `${t.dialogue.lines.length} répliques` : `${t.phrases.length} phrases`}
                {stepDone(p, t.id, kind) && ` · ✓ ${p.steps[`${t.id}:${kind}`].score} %`}
              </p>
            </div>
            <LevelBadge level={t.level} />
          </Link>
        ))}
      </div>
    </div>
  )
}
