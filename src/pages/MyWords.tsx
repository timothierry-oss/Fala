import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader, SpeakButton } from '../components/ui'
import { PhaseBar } from '../components/PhaseBar'
import { CAT_LABEL, lookupFr, type DictEntry } from '../lib/dictionary'
import { customDecks, deckStats } from '../lib/decks'
import { addCustomWord, customId, DECK_SIZE, removeCustomWord, useProgress } from '../lib/store'

interface Result {
  query: string
  exact: DictEntry[]
  suggestions: DictEntry[]
  /** Entrée ajoutée automatiquement (une seule correspondance exacte). */
  added?: DictEntry
}

const toWord = (e: DictEntry) => ({ pt: e.pt, fr: e.fr, ex: e.ex, exFr: e.exFr, cat: CAT_LABEL[e.cat] ?? e.cat })

export function MyWords() {
  const p = useProgress()
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const decks = customDecks(p, 'perso')
  const has = (pt: string) => p.custom.some((w) => w.id === customId('perso', pt))

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const queries = input
      .split(/[,;\n]/)
      .map((q) => q.trim())
      .filter(Boolean)
    if (!queries.length) return
    const res = queries.map((query): Result => {
      const { exact, suggestions } = lookupFr(query)
      // Une seule traduction trouvée : la fiche est créée automatiquement.
      if (exact.length === 1) {
        addCustomWord('perso', toWord(exact[0]))
        return { query, exact, suggestions, added: exact[0] }
      }
      return { query, exact, suggestions }
    })
    setResults(res)
    setInput('')
  }

  return (
    <div className="page narrow">
      <PageHeader back="/pratique" eyebrow="Mes mots" title="Les mots que je veux apprendre" />
      <p className="muted lead">
        Écris un ou plusieurs mots en français (séparés par des virgules). Ils sont traduits avec le dictionnaire intégré et ajoutés à tes fiches, {DECK_SIZE} mots maximum par fiche.
      </p>
      <form className="search big" onSubmit={search}>
        <Search size={18} />
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="ex. : parapluie, se dépêcher, il fait chaud" autoFocus />
        <button className="btn btn-primary" type="submit">
          Ajouter
        </button>
      </form>

      {results.map((r) => (
        <div key={r.query} className="card lookup">
          <p className="eyebrow">« {r.query} »</p>
          {r.added ? (
            <EntryRow e={r.added} added onAdd={() => {}} />
          ) : r.exact.length > 1 ? (
            <>
              <p className="muted small">Plusieurs sens possibles, choisis le(s) bon(s) :</p>
              {r.exact.map((e) => (
                <EntryRow key={e.fr + e.pt} e={e} added={has(e.pt)} onAdd={() => addCustomWord('perso', toWord(e))} />
              ))}
            </>
          ) : (
            <>
              {r.suggestions.length > 0 ? (
                <>
                  <p className="muted small">Pas de correspondance exacte. Tu voulais dire :</p>
                  {r.suggestions.map((e) => (
                    <EntryRow key={e.fr + e.pt} e={e} added={has(e.pt)} onAdd={() => addCustomWord('perso', toWord(e))} />
                  ))}
                </>
              ) : (
                <p className="muted small">Ce mot n’est pas dans le dictionnaire.</p>
              )}
              <ManualForm fr={r.query} />
            </>
          )}
        </div>
      ))}

      {decks.length > 0 && <h2 className="section-title">Mes fiches</h2>}
      {decks.map((d) => (
        <section key={d.id} className="card">
          <div className="block-head">
            <h3>
              {d.emoji} {d.title}
            </h3>
            <Link to={`/fiches/${d.id}`} className="btn btn-primary">
              Réviser
            </Link>
          </div>
          <p className="muted small">
            {d.items.length} / {DECK_SIZE} mots
          </p>
          <PhaseBar stats={deckStats(p, d.items)} legend={false} />
          <ul className="word-list">
            {d.items.map((w) => (
              <li key={w.id}>
                <span>
                  <strong>{w.pt}</strong> <span className="muted">— {w.fr}</span>
                </span>
                <button className="icon-btn" aria-label={`Retirer ${w.pt}`} onClick={() => removeCustomWord(w.id)}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function EntryRow({ e, added, onAdd }: { e: DictEntry; added: boolean; onAdd: () => void }) {
  return (
    <div className="entry">
      <div className="grow">
        <p>
          <strong className="entry-pt">{e.pt}</strong> <span className="tag tag-soft">{CAT_LABEL[e.cat] ?? e.cat}</span>
        </p>
        <p className="muted small">{e.fr}</p>
        {e.ex && (
          <p className="small">
            {e.ex} <span className="muted">— {e.exFr}</span>
          </p>
        )}
      </div>
      <SpeakButton text={e.pt.split('/')[0]} small />
      <button className={`chip ${added ? 'on' : ''}`} onClick={onAdd} disabled={added}>
        {added ? (
          <>
            <Check size={14} /> Ajouté
          </>
        ) : (
          <>
            <Plus size={14} /> Ajouter
          </>
        )}
      </button>
    </div>
  )
}

function ManualForm({ fr }: { fr: string }) {
  const [pt, setPt] = useState('')
  const [ex, setEx] = useState('')
  const [done, setDone] = useState(false)
  if (done)
    return (
      <p className="accent-text">
        <Check size={14} /> Ajouté à tes fiches
      </p>
    )
  return (
    <form
      className="manual"
      onSubmit={(e) => {
        e.preventDefault()
        if (!pt.trim()) return
        addCustomWord('perso', { pt: pt.trim(), fr, ex: ex.trim() || undefined })
        setDone(true)
      }}
    >
      <p className="small">Ajoute la traduction toi-même :</p>
      <input className="text-input small" value={pt} onChange={(e) => setPt(e.target.value)} placeholder="Mot en portugais" lang="pt-BR" />
      <input className="text-input small" value={ex} onChange={(e) => setEx(e.target.value)} placeholder="Phrase d’exemple en portugais (facultatif)" lang="pt-BR" />
      <button className="btn btn-ghost" type="submit">
        <Plus size={16} /> Créer la fiche
      </button>
    </form>
  )
}
