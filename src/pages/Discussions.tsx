import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, ChevronRight, Languages, Layers, Plus, X } from 'lucide-react'
import { discussionById, discussions, type Discussion, type GlossEntry } from '../data/discussions'
import { LevelBadge, PageHeader, SpeakButton, Tip } from '../components/ui'
import { CAT_LABEL, lookupPt } from '../lib/dictionary'
import { stripAccents } from '../lib/text'
import { speak } from '../lib/speech'
import { addCustomWord, customId, removeCustomWord, useProgress } from '../lib/store'
import { NotFound } from './NotFound'

export function DiscussionList() {
  const p = useProgress()
  return (
    <div className="page">
      <PageHeader back="/pratique" eyebrow="Lecture interactive" title="Discussions du quotidien" />
      <p className="muted lead">
        Lis des conversations de la vie de tous les jours. Touche un mot ou une expression que tu ne comprends pas : tu obtiens une explication et un exemple, et le mot est ajouté à tes fiches.
      </p>
      <div className="vocab-list">
        {discussions.map((d) => {
          const added = d.glossary.filter((g) => p.custom.some((w) => w.id === customId('discussion', g.term))).length
          return (
            <Link key={d.id} to={`/discussions/${d.id}`} className="card step">
              <span className="step-icon emoji">{d.emoji}</span>
              <div className="grow">
                <h3>{d.title}</h3>
                <p className="muted small">
                  {d.ptTitle} · {d.lines.length} répliques{added ? ` · ${added} mot(s) ajouté(s)` : ''}
                </p>
              </div>
              <LevelBadge level={d.level} />
              <ChevronRight size={20} className="muted" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

type Token = { text: string; gloss?: GlossEntry; word?: boolean }

const norm = (s: string) => stripAccents(s.toLowerCase())

/** Découpe une réplique : expressions du glossaire (les plus longues d'abord), puis mots isolés. */
function tokenize(line: string, glossary: GlossEntry[]): Token[] {
  const sorted = [...glossary].sort((a, b) => b.term.length - a.term.length)
  const plain = norm(line)
  const marks: { start: number; end: number; g: GlossEntry }[] = []
  for (const g of sorted) {
    const t = norm(g.term).replace(/[?!.]$/, '')
    let from = 0
    while (true) {
      const i = plain.indexOf(t, from)
      if (i < 0) break
      const end = i + t.length
      const boundary = (c?: string) => !c || !/[a-z0-9]/.test(c)
      if (boundary(plain[i - 1]) && boundary(plain[end]) && !marks.some((m) => i < m.end && end > m.start)) {
        marks.push({ start: i, end, g })
      }
      from = end
    }
  }
  marks.sort((a, b) => a.start - b.start)
  const tokens: Token[] = []
  let pos = 0
  const pushWords = (chunk: string) => {
    for (const part of chunk.split(/([\p{L}-]+)/u)) {
      if (part) tokens.push({ text: part, word: /\p{L}/u.test(part) })
    }
  }
  for (const m of marks) {
    pushWords(line.slice(pos, m.start))
    tokens.push({ text: line.slice(m.start, m.end), gloss: m.g })
    pos = m.end
  }
  pushWords(line.slice(pos))
  return tokens
}

interface Selected {
  term: string
  fr: string
  expl?: string
  ex?: string
  exFr?: string
  cat?: string
  known: boolean
}

export function DiscussionReader() {
  const { discussionId } = useParams()
  const d = discussionById(discussionId ?? '')
  if (!d) return <NotFound />
  return <Reader d={d} />
}

function Reader({ d }: { d: Discussion }) {
  const p = useProgress()
  const [showFr, setShowFr] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState<Selected | null>(null)
  const speakers = useMemo(() => [...new Set(d.lines.map((l) => l.speaker))], [d])
  const lines = useMemo(() => d.lines.map((l) => tokenize(l.pt, d.glossary)), [d])
  const isAdded = (term: string) => p.custom.some((w) => w.id === customId('discussion', term))
  const addedCount = p.custom.filter((w) => w.source === 'discussion' && d.glossary.some((g) => customId('discussion', g.term) === w.id)).length

  const open = (tok: Token) => {
    let sel: Selected
    if (tok.gloss) {
      sel = { term: tok.gloss.term, fr: tok.gloss.fr, expl: tok.gloss.expl, ex: tok.gloss.ex || undefined, exFr: tok.gloss.exFr || undefined, known: true }
    } else {
      const entry = lookupPt(tok.text)
      sel = entry
        ? { term: tok.text, fr: entry.fr, ex: entry.ex, exFr: entry.exFr, cat: CAT_LABEL[entry.cat], expl: `Forme du dictionnaire : ${entry.pt}`, known: true }
        : { term: tok.text, fr: '', known: false }
    }
    setSelected(sel)
    speak(sel.term)
  }

  const cleanTerm = (t: string) => t.replace(/[?!.]$/, '')
  const add = (sel: Selected) => addCustomWord('discussion', { pt: cleanTerm(sel.term), fr: sel.fr, ex: sel.ex, exFr: sel.exFr, note: sel.expl, cat: sel.cat })

  return (
    <div className="page narrow">
      <PageHeader back="/discussions" eyebrow={`${d.ptTitle} · ${d.level}`} title={`${d.emoji} ${d.title}`} />
      <p className="muted">{d.context}</p>
      <Tip>Touche les mots <span className="gloss-sample">soulignés</span> (expressions expliquées) ou n’importe quel autre mot pour voir sa traduction, puis ajoute-le à tes fiches si tu veux le réviser.</Tip>
      <div className="row between wrap gap-sm">
        <SpeakButton text={d.lines.map((l) => l.pt).join(' ')} label="Tout écouter" rate={0.95} />
        {addedCount > 0 && (
          <Link to="/fiches" className="chip on">
            <Layers size={14} /> {addedCount} ajouté(s) à tes fiches
          </Link>
        )}
      </div>

      <ul className="dialogue reader">
        {d.lines.map((l, i) => (
          <li key={i} className={`side-${speakers.indexOf(l.speaker) % 2}`}>
            <span className="speaker">{l.speaker}</span>
            <div className="bubble">
              <p className="reader-line">
                {lines[i].map((tok, k) =>
                  tok.gloss || tok.word ? (
                    <button key={k} className={`tok ${tok.gloss ? 'gloss' : ''} ${tok.gloss && isAdded(tok.gloss.term) ? 'added' : ''}`} onClick={() => open(tok)}>
                      {tok.text}
                    </button>
                  ) : (
                    <span key={k}>{tok.text}</span>
                  ),
                )}
              </p>
              {showFr.has(i) && <p className="muted small">{l.fr}</p>}
              <div className="row gap-sm">
                <SpeakButton text={l.pt} small />
                <button
                  className="icon-btn small"
                  aria-label="Traduction"
                  onClick={() => {
                    const s = new Set(showFr)
                    if (s.has(i)) s.delete(i)
                    else s.add(i)
                    setShowFr(s)
                  }}
                >
                  <Languages size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="sheet" role="dialog" aria-label={selected.term}>
          <div className="sheet-head">
            <h3 className="phrase">{selected.term}</h3>
            <SpeakButton text={selected.term} small />
            <button className="icon-btn" aria-label="Fermer" onClick={() => setSelected(null)}>
              <X size={20} />
            </button>
          </div>
          {selected.known ? (
            <>
              <p className="slang-fr">
                {selected.fr} {selected.cat && <span className="tag tag-soft">{selected.cat}</span>}
              </p>
              {selected.expl && <p className="small">{selected.expl}</p>}
              {selected.ex && (
                <div className="example">
                  <p className="row gap-sm">
                    {selected.ex} <SpeakButton text={selected.ex} small />
                  </p>
                  <p className="muted">{selected.exFr}</p>
                </div>
              )}
              {isAdded(cleanTerm(selected.term)) ? (
                <div className="row between">
                  <span className="accent-text">
                    <Check size={14} /> Dans tes fiches « Discussions »
                  </span>
                  <button className="btn btn-ghost" onClick={() => removeCustomWord(customId('discussion', cleanTerm(selected.term)))}>
                    Retirer
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary block" onClick={() => add(selected)}>
                  <Plus size={18} /> Ajouter à mes fiches
                </button>
              )}
            </>
          ) : (
            <p className="muted">
              Pas d’explication pour ce mot : c’est sûrement une forme conjuguée ou un mot rare. Ajoute-le depuis <Link to="/mes-mots" className="link">Mes mots</Link> avec sa traduction.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
