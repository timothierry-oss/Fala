import { useEffect, useRef, useState } from 'react'
import { Undo2 } from 'lucide-react'

/** Pile d'états pour le bouton « Retour » (on garde les 50 derniers). */
export function useUndoStack<T>() {
  const stack = useRef<T[]>([])
  const [, rerender] = useState(0)
  return {
    push(s: T) {
      stack.current.push(s)
      if (stack.current.length > 50) stack.current.shift()
      rerender((n) => n + 1)
    },
    pop(): T | undefined {
      const s = stack.current.pop()
      rerender((n) => n + 1)
      return s
    },
    get size() {
      return stack.current.length
    },
  }
}

/** Touche Retour arrière (⌫) → annuler, sauf pendant la saisie dans un champ. */
export function useBackspace(handler: () => void) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Backspace' || (e.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable]')) return
      e.preventDefault()
      ref.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export function UndoButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button className="undo-btn" onClick={onClick} disabled={disabled} aria-label="Revenir en arrière" title="Revenir en arrière (⌫)">
      <Undo2 size={18} />
    </button>
  )
}
