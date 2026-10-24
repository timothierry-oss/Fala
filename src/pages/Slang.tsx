import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Layers, Search } from 'lucide-react'
import { slang, slangCategories } from '../data/slang'
import type { SlangCategory } from '../data/types'
import { PageHeader, SpeakButton } from '../components/ui'
import { stripAccents } from '../lib/text'
import { isMastered, setItemStage, stageOf, useProgress } from '../lib/store'

export function Slang() {
  const p = useProgress()
  const [cat, setCat] = useState<SlangCategory | 'Tout'>('Tout')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const needle = stripAccents(q.toLowerCase())
    return slang.filter(
      (s) =>
        (cat === 'Tout' || s.category === cat) &&
        (!needle || stripAccents(`${s.pt} ${s.fr} ${s.ex}`.toLowerCase()).includes(needle)),
    )
  }, [cat, q])

  const learned = slang.filter((s) => isMastered(p, s.id)).length

  return (
    <div className="page">
      <PageHeader back="/pratique" eyebrow="Gírias brasileiras" title="L’argot qui sert vraiment" />
      <p className="muted lead">
        Les mots que tu entendras dans la rue, sur WhatsApp ou à la plage, mais rarement dans les manuels.
      </p>
      <div className="row gap-sm wrap">
        <Link to="/fiches/argot" className="btn btn-primary">
          <Layers size={18} /> Réviser en fiches
        </Link>
        <span className="muted small">
          {learned} / {slang.length} maîtrisés
        </span>
      </div>

      <label className="search">
        <Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (ex. : merci, bora…)" />
      </label>
      <div className="chips-scroll">
        {(['Tout', ...slangCategories] as const).map((c) => (
          <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="slang-grid">
        {list.map((s) => {
          const known = stageOf(p, s.id) >= 4
          return (
            <article key={s.id} className="card slang-card">
              <div className="row between">
                <h3>{s.pt}</h3>
                <SpeakButton text={s.pt.replace(/\s*\/.*$/, '')} small />
              </div>
              <p className="slang-fr">{s.fr}</p>
              <div className="example">
                <p>
                  {s.ex} <SpeakButton text={s.ex} small />
                </p>
                <p className="muted">{s.exFr}</p>
              </div>
              {s.note && <p className="note">{s.note}</p>}
              <div className="row between wrap gap-sm">
                <div className="row gap-sm wrap">
                  <span className={`tag ${s.register === 'très familier' ? 'tag-warn' : ''}`}>{s.register}</span>
                  <span className="tag tag-soft">📍 {s.region}</span>
                </div>
                <button
                  className={`chip ${known ? 'on' : ''}`}
                  onClick={() => setItemStage(s.id, 4)}
                  disabled={known}
                >
                  <Check size={14} /> {isMastered(p, s.id) ? 'Maîtrisé' : known ? 'En révision' : 'Je connais'}
                </button>
              </div>
            </article>
          )
        })}
        {list.length === 0 && <p className="muted">Aucun résultat.</p>}
      </div>
    </div>
  )
}
