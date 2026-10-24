import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { currentVoice, speak, ttsSupported } from '../lib/speech'

/** Diagnostic de la voix portugaise + bouton de test. */
export function VoiceCheck() {
  const [voice, setVoice] = useState(() => currentVoice())
  const [tested, setTested] = useState(false)

  useEffect(() => {
    if (!ttsSupported) return
    const update = () => setVoice(currentVoice())
    speechSynthesis.addEventListener?.('voiceschanged', update)
    const t = setTimeout(update, 1000)
    return () => {
      speechSynthesis.removeEventListener?.('voiceschanged', update)
      clearTimeout(t)
    }
  }, [])

  if (!ttsSupported) {
    return <p className="voice-warn">Ton navigateur ne prend pas en charge la lecture audio. Utilise Safari, Chrome ou Edge.</p>
  }

  return (
    <div className="voice-check">
      <div className="row between wrap gap-sm">
        <span>
          Voix : <strong>{voice ? `${voice.name} (${voice.lang})` : 'aucune voix portugaise trouvée'}</strong>
        </span>
        <button
          className="btn btn-ghost"
          onClick={() => {
            speak('Olá! Tudo bem? Vamos aprender português juntos.')
            setTested(true)
          }}
        >
          <Volume2 size={16} /> Tester la voix
        </button>
      </div>
      {(!voice || tested) && (
        <div className="voice-help small">
          {!voice && <p>Sans voix portugaise, le navigateur lit avec une autre voix ou reste muet.</p>}
          <p>{tested ? 'Tu n’entends rien ? ' : ''}Vérifie que le téléphone n’est pas en mode silencieux et installe une voix « Portugais (Brésil) » :</p>
          <ul>
            <li><strong>iPhone / iPad</strong> : Réglages › Accessibilité › Contenu énoncé › Voix › Portugais (Brésil) › télécharger « Luciana ».</li>
            <li><strong>Mac</strong> : Réglages Système › Accessibilité › Contenu énoncé › Voix du système › Gérer les voix › Portugais (Brésil).</li>
            <li><strong>Android</strong> : Paramètres › Accessibilité › Synthèse vocale › Google › Installer les données vocales › Portugais (Brésil).</li>
            <li><strong>Windows</strong> : Paramètres › Heure et langue › Voix › Ajouter des voix › Portugais (Brésil).</li>
          </ul>
          <p>Puis recharge la page.</p>
        </div>
      )}
    </div>
  )
}
