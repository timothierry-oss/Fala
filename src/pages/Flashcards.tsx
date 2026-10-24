import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, Plus, Trash2 } from 'lucide-react'
import { allVocab, themes } from '../data/themes'
import { collectionItems, collections, groups } from '../data/collections'
import { PageHeader, SpeakButton } from '../components/ui'
import { PhaseBar } from '../components/PhaseBar'
import { SmartStudy, type StudyMode } from '../components/SmartStudy'
import { allItems, customDecks, deckStats, getDeck, slangItems, type Deck } from '../lib/decks'
import { PHASE_LABEL, phaseOf } from '../lib/memory'
import { completeStep, dueToday, getProgress, removeCustomWord, unretireItem, useProgress, type ProgressState } from '../lib/store'
import { NotFound } from './NotFound'

function DeckCard({ deck, p, to, subtitle }: { deck: Deck; p: ProgressState; to?: string; subtitle?: string }) {
  const stats = deckStats(p, deck.items)
  return (
    <Link to={to ?? `/fiches/${deck.id}`} className="card deck-card">
      <div className="row between">
        <span className="deck-emoji">{deck.emoji}</span>
        {stats.consolider > 0 && <span className="tag tag-warn">À consolider</span>}
        {stats.total > 0 && stats.maitrise === stats.total && <span className="tag">✓ Maîtrisée</span>}
      </div>
      <h3>{deck.title}</h3>
      <p className="muted small">
        {subtitle ?? `${deck.items.length} cartes`} · {stats.maitrise} maîtrisées
      </p>
      <PhaseBar stats={stats} legend={false} />
    </Link>
  )
}

export function Decks() {
  const p = useProgress()
  const due = dueToday(p, allItems(p).map((v) => v.id)).length
  const themeDecks = themes.map((t) => getDeck(t.id, p)!)
  const perso = customDecks(p, 'perso')
  const disc = customDecks(p, 'discussion')

  return (
    <div className="page">
      <PageHeader back="/pratique" eyebrow="Fiches de vocabulaire" title="Flashcards" />
      <Link to="/fiches/revisions" className={`continue-card compact ${due ? '' : 'disabled'}`}>
        <div className="continue-top">
          <div>
            <p className="eyebrow light">Mode intelligent</p>
            <h2>🔁 Révisions du jour</h2>
            <p className="light-text">{due ? `${due} mot${due > 1 ? 's' : ''} à revoir aujourd’hui` : 'Rien à réviser pour l’instant. Bravo !'}</p>
          </div>
          <span className="round-btn">
            <ChevronRight size={22} />
          </span>
        </div>
      </Link>

      <div className="block-head">
        <h2 className="section-title">Mes fiches</h2>
        <Link to="/mes-mots" className="btn btn-ghost">
          <Plus size={18} /> Ajouter des mots
        </Link>
      </div>
      {perso.length + disc.length === 0 ? (
        <p className="muted">
          Ajoute des mots dans <Link to="/mes-mots" className="link">Mes mots</Link> ou en touchant les mots d’une <Link to="/discussions" className="link">discussion</Link> : les fiches se créent toutes seules (20 mots max par fiche).
        </p>
      ) : (
        <div className="deck-grid">
          {[...perso, ...disc].map((d) => (
            <DeckCard key={d.id} deck={d} p={p} />
          ))}
        </div>
      )}

      <h2 className="section-title">Collections</h2>
      <div className="deck-grid">
        {groups.map((g) => (
          <DeckCard key={g.id} deck={getDeck(g.id, p)!} p={p} to={`/fiches/groupe/${g.id}`} subtitle={`${collections.filter((c) => c.group === g.id).length} fiches`} />
        ))}
        {collections
          .filter((c) => !c.group)
          .map((c) => (
            <DeckCard key={c.id} deck={getDeck(c.id, p)!} p={p} />
          ))}
      </div>

      <h2 className="section-title">Thèmes</h2>
      <div className="deck-grid">
        {themeDecks.map((d) => (
          <DeckCard key={d.id} deck={d} p={p} />
        ))}
        <DeckCard deck={getDeck('argot', p)!} p={p} />
      </div>
    </div>
  )
}

/** Une carte qui regroupe plusieurs fiches (ex. les 100 verbes en 4 × 25). */
export function GroupPage() {
  const { groupId } = useParams()
  const p = useProgress()
  const group = groups.find((g) => g.id === groupId)
  if (!group) return <NotFound />
  const all = getDeck(group.id, p)!
  const parts = collections.filter((c) => c.group === group.id)
  return (
    <div className="page narrow">
      <PageHeader back="/fiches" eyebrow={`${parts.length} fiches · ${all.items.length} mots`} title={`${group.emoji} ${group.title}`} />
      <PhaseBar stats={deckStats(p, all.items)} />
      <div className="deck-grid">
        {parts.map((c) => (
          <DeckCard key={c.id} deck={getDeck(c.id, p)!} p={p} />
        ))}
      </div>
      <Link to={`/fiches/${group.id}`} className="btn btn-ghost block">
        Réviser les {all.items.length} mots d’un coup
      </Link>
    </div>
  )
}

const MODES: { id: StudyMode | 'liste'; label: string }[] = [
  { id: 'apprendre', label: 'Apprendre' },
  { id: 'cartes', label: 'Cartes' },
  { id: 'liste', label: 'Liste' },
]

export function DeckPage() {
  const { deckId } = useParams()
  const p = useProgress()
  const [params, setParams] = useSearchParams()
  const mode = (params.get('mode') as StudyMode | 'liste') || 'apprendre'
  // Le contenu de la fiche est figé à l'ouverture pour ne pas changer pendant la session.
  const deck = useMemo(() => getDeck(deckId ?? '', getProgress()), [deckId])
  const pool = useMemo(() => {
    if (!deck) return []
    if (deck.kind === 'argot') return slangItems
    if (deck.kind === 'theme') return allVocab
    // Collections : les distracteurs viennent de la même famille (verbes avec verbes…).
    if (deck.kind === 'collection') return collectionItems.filter((i) => i.cat === deck.items[0]?.cat)
    return allItems(getProgress())
  }, [deck])

  if (!deck) return <NotFound />
  const group = collections.find((c) => c.id === deck.id)?.group ?? groups.find((g) => g.id === deck.id)?.id
  const back = deck.themeId ? `/parcours/${deck.themeId}` : group ? `/fiches/groupe/${group}` : '/fiches'
  const stats = deckStats(p, deck.items)
  const isCustom = deck.kind === 'perso' || deck.kind === 'discussion'

  return (
    <div className="page narrow">
      <PageHeader back={back} eyebrow={`${deck.items.length} cartes`} title={`${deck.emoji} ${deck.title}`} />
      <div className="segmented" role="tablist">
        {MODES.map((m) => (
          <button key={m.id} role="tab" aria-selected={mode === m.id} className={mode === m.id ? 'active' : ''} onClick={() => setParams({ mode: m.id }, { replace: true })}>
            {m.label}
          </button>
        ))}
      </div>
      {deck.items.length === 0 ? (
        <div className="card result">
          <div className="result-emoji">✨</div>
          <h2>Tudo em dia!</h2>
          <p className="muted">Aucune carte à réviser aujourd’hui.</p>
        </div>
      ) : mode === 'liste' ? (
        <div className="vocab-list single">
          <PhaseBar stats={stats} />
          {deck.items.map((v) => {
            const ph = phaseOf(p.memory[v.id])
            return (
              <div key={v.id} className="card vocab-row">
                <div className="grow">
                  <strong>{v.pt}</strong>
                  <span className="muted"> — {v.fr}</span>
                  {v.ex && <p className="small muted">{v.ex}</p>}
                </div>
                {p.memory[v.id]?.retired ? (
                  <button className="phase-pill ph-maitrise retired" onClick={() => unretireItem(v.id)} title="Remettre ce mot dans les révisions">
                    Connu · réintégrer
                  </button>
                ) : (
                  <span className={`phase-pill ph-${ph}`}>{PHASE_LABEL[ph]}</span>
                )}
                <SpeakButton text={v.pt} small />
                {isCustom && (
                  <button className="icon-btn" aria-label={`Retirer ${v.pt}`} onClick={() => confirm(`Retirer « ${v.pt} » de tes fiches ?`) && removeCustomWord(v.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <SmartStudy
          key={mode}
          items={deck.items}
          pool={pool}
          skill={deck.skill}
          mode={mode}
          onRoundEnd={(c, t) => deck.themeId && completeStep(deck.themeId, 'vocabulaire', Math.round((c / t) * 100))}
        />
      )}
    </div>
  )
}
