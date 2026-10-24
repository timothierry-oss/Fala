import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { dayKey } from '../lib/dates'
import { exportProgress, importProgress } from '../lib/store'

/** Exporter / importer la progression (transfert Safari ↔ web-app ↔ Mac, ou simple sauvegarde). */
export function Backup() {
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fala-progression-${dayKey()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMsg({ ok: true, text: 'Sauvegarde téléchargée. Sur iPhone, choisis « Enregistrer dans Fichiers ».' })
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!confirm('Remplacer ta progression actuelle par celle de cette sauvegarde ?')) return
    const err = importProgress(await f.text())
    setMsg(err ? { ok: false, text: err } : { ok: true, text: 'Progression restaurée !' })
  }

  return (
    <div className="backup">
      <span>Sauvegarde de la progression</span>
      <div className="row gap-sm wrap">
        <button className="btn btn-ghost" onClick={download}>
          <Download size={16} /> Exporter
        </button>
        <button className="btn btn-ghost" onClick={() => file.current?.click()}>
          <Upload size={16} /> Importer
        </button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={onFile} />
      </div>
      {msg && <p className={`small ${msg.ok ? 'accent-text' : 'voice-warn'}`}>{msg.text}</p>}
      <p className="muted small">
        Ta progression est stockée sur cet appareil uniquement. Pour la transférer (Safari → app de l’écran d’accueil, iPhone → Mac), exporte-la ici puis importe le fichier sur l’autre appareil.
      </p>
    </div>
  )
}
