import { useEffect, useState, type ReactNode } from 'react'
import { ExternalLink, Moon, Monitor, ShieldCheck, Sun, Volume1, Volume2, VolumeX } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { VoiceCheck } from '../components/VoiceCheck'
import { Backup } from '../components/Backup'
import { listVoices, speak, ttsSupported, recognitionSupported } from '../lib/speech'
import { loadDemo, resetProgress, updateSettings, useProgress, type Settings as S, type ThemeSetting } from '../lib/store'
import { dictionary } from '../lib/dictionary'
import { allItems } from '../lib/decks'
import { notions } from '../data/grammar'
import { challenges } from '../data/challenges'
import { discussions } from '../data/discussions'

const set = (patch: Partial<S>) => updateSettings({ settings: patch })

function Row({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="set-row">
      <div className="grow">
        <span className="set-label">{label}</span>
        {hint && <p className="muted small">{hint}</p>}
      </div>
      <div className="set-control">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="segmented small">
      {options.map((o) => (
        <button key={String(o.value)} type="button" className={value === o.value ? 'active' : ''} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function Settings() {
  const p = useProgress()
  const s = p.settings
  const [voices, setVoices] = useState(() => listVoices())
  const [offline, setOffline] = useState<boolean | null>(null)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const installed = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true)
  const storageKb = Math.round((localStorage.getItem('fala-progress-v2')?.length ?? 0) / 1024)

  useEffect(() => {
    if (ttsSupported) {
      const update = () => setVoices(listVoices())
      speechSynthesis.addEventListener?.('voiceschanged', update)
      const t = setTimeout(update, 800)
      return () => {
        speechSynthesis.removeEventListener?.('voiceschanged', update)
        clearTimeout(t)
      }
    }
  }, [])

  useEffect(() => {
    navigator.serviceWorker?.getRegistration().then((r) => setOffline(!!r?.active)).catch(() => setOffline(false))
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null))
  }, [])

  const VolumeIcon = s.volume === 0 ? VolumeX : s.volume < 0.5 ? Volume1 : Volume2

  return (
    <div className="page narrow settings-page">
      <PageHeader eyebrow="Configuration" title="Réglages" />

      <section className="card set-section">
        <h3>🔊 Son</h3>
        <Row label="Volume de la voix" hint={s.volume === 0 ? 'Muet : aucune lecture audio.' : undefined}>
          <div className="row gap-sm volume">
            <VolumeIcon size={18} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={s.volume}
              aria-label="Volume"
              onChange={(e) => set({ volume: Number(e.target.value) })}
              onPointerUp={() => speak('Olá!')}
            />
            <span className="small nowrap">{Math.round(s.volume * 100)} %</span>
          </div>
        </Row>
        <Row label="Vitesse de lecture">
          <Segmented
            value={s.rate}
            onChange={(rate) => {
              set({ rate })
              speak('Tudo bem?')
            }}
            options={[
              { value: 0.8, label: 'Lente' },
              { value: 1, label: 'Normale' },
              { value: 1.15, label: 'Rapide' },
            ]}
          />
        </Row>
        <Row label="Voix" hint={voices.length ? `${voices.length} voix portugaise(s) sur cet appareil` : 'Aucune voix portugaise installée'}>
          <select
            value={s.voiceName ?? ''}
            onChange={(e) => {
              set({ voiceName: e.target.value || undefined })
              setTimeout(() => speak('Olá, eu sou a sua voz.'), 50)
            }}
          >
            <option value="">Automatique (la meilleure)</option>
            {voices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </Row>
        <Row label="Lecture automatique" hint="Lit les mots et les phrases dès qu’ils s’affichent. Les questions d’écoute sont toujours lues.">
          <Toggle checked={s.autoPlay} onChange={(v) => set({ autoPlay: v })} label="Lecture automatique" />
        </Row>
        <Row label="Réactions à voix haute 🇧🇷" hint="« Mandou bem! », « Que pena! »… après chaque réponse.">
          <Toggle checked={s.speakReactions} onChange={(v) => set({ speakReactions: v })} label="Réactions à voix haute" />
        </Row>
        <VoiceCheck />
      </section>

      <section className="card set-section">
        <h3>🎨 Apparence</h3>
        <Row label="Thème" hint={s.theme === 'auto' ? 'Suit le mode clair / sombre de ton appareil.' : undefined}>
          <Segmented<ThemeSetting>
            value={s.theme}
            onChange={(theme) => set({ theme })}
            options={[
              { value: 'light', label: <><Sun size={14} /> Clair</> },
              { value: 'dark', label: <><Moon size={14} /> Sombre</> },
              { value: 'auto', label: <><Monitor size={14} /> Auto</> },
            ]}
          />
        </Row>
      </section>

      <section className="card set-section">
        <h3>🎯 Apprentissage</h3>
        <Row label="Objectif quotidien">
          <select value={p.dailyGoal} onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}>
            {[20, 50, 100, 150].map((g) => (
              <option key={g} value={g}>
                {g} XP / jour
              </option>
            ))}
          </select>
        </Row>
        <Row label="Questions par série" hint="Nombre de questions avant la pause « Continuer / Arrêter » dans les fiches.">
          <Segmented value={s.roundSize} onChange={(roundSize) => set({ roundSize })} options={[10, 20, 30].map((n) => ({ value: n, label: String(n) }))} />
        </Row>
      </section>

      <section className="card set-section">
        <h3>💾 Mes données</h3>
        <Backup />
        <div className="set-danger">
          <button className="btn btn-ghost" onClick={() => confirm('Remplacer ta progression par des données de démonstration ? (pense à exporter avant)') && loadDemo()}>
            Charger des données de démo
          </button>
          <button className="btn btn-danger" onClick={() => confirm('Effacer toute ta progression ? Cette action est définitive.') && resetProgress()}>
            Réinitialiser ma progression
          </button>
        </div>
      </section>

      <section className="card set-section">
        <h3>ℹ️ Informations</h3>
        <dl className="info-list">
          <dt>Version</dt>
          <dd>
            {__APP_VERSION__} · mise à jour du {formatDate(__BUILD_DATE__)}
            {__COMMIT__ !== 'local' && <span className="muted"> ({__COMMIT__})</span>}
          </dd>
          <dt>Utilisation</dt>
          <dd>
            {installed ? 'App installée sur l’écran d’accueil ✓' : 'Dans le navigateur'}
            {!installed && <p className="muted small">Sur iPhone : Safari › Partager › « Sur l’écran d’accueil » pour l’installer en plein écran.</p>}
          </dd>
          <dt>Hors ligne</dt>
          <dd>{offline === null ? '…' : offline ? 'Disponible sans connexion ✓' : 'Pas encore (rouvre l’app une fois connecté)'}</dd>
          <dt>Ma progression</dt>
          <dd>
            Stockée uniquement sur cet appareil · {storageKb || '< 1'} Ko
            {persisted === false && navigator.storage?.persist && (
              <p>
                <button className="btn-link" onClick={() => navigator.storage.persist().then(setPersisted)}>
                  <ShieldCheck size={14} /> Protéger mes données contre l’effacement automatique
                </button>
              </p>
            )}
            {persisted && <p className="muted small">Protégée contre l’effacement automatique ✓</p>}
          </dd>
          <dt>Audio</dt>
          <dd>
            Voix : {ttsSupported ? 'disponible' : 'non disponible dans ce navigateur'} · Reconnaissance vocale : {recognitionSupported ? 'disponible' : 'non disponible (essaie Safari ou Chrome)'}
          </dd>
          <dt>Contenu</dt>
          <dd>
            {allItems(p).length} mots et expressions en fiches · {dictionary.length} entrées de dictionnaire · {notions.length} notions de grammaire · {challenges.length} défis · {discussions.length} discussions
          </dd>
          <dt>Confidentialité</dt>
          <dd className="small">
            Aucun compte, aucune publicité, aucune donnée envoyée à un serveur. Seule la reconnaissance vocale (prononciation) passe par le service de ton appareil (Apple ou Google).
          </dd>
          <dt>Code source</dt>
          <dd>
            <a className="link" href="https://github.com/timothierry-oss/Fala" target="_blank" rel="noreferrer">
              github.com/timothierry-oss/Fala <ExternalLink size={12} />
            </a>
          </dd>
        </dl>
      </section>
    </div>
  )
}
