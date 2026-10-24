import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'

/** Enregistre le service worker (hors ligne) et propose la nouvelle version quand elle est publiée. */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Vérifie les mises à jour toutes les heures quand l'app reste ouverte.
      if (registration) setInterval(() => registration.update(), 60 * 60 * 1000)
    },
  })

  if (!needRefresh) return null
  return (
    <div className="toast update-toast" role="status">
      <span>
        <RefreshCw size={16} /> Nouvelle version de Fala! disponible
      </span>
      <button onClick={() => updateServiceWorker(true)}>Mettre à jour</button>
      <button className="later" onClick={() => setNeedRefresh(false)}>
        Plus tard
      </button>
    </div>
  )
}
