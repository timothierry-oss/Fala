import type { ThemeSetting } from './store'

const dark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null
let current: ThemeSetting = 'light'

function paint() {
  const isDark = current === 'dark' || (current === 'auto' && !!dark?.matches)
  const root = document.documentElement
  root.dataset.theme = isDark ? 'dark' : 'light'
  // Barre d'état / barre d'adresse assorties au fond de l'app.
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0d1220' : '#f4f6ef')
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', isDark ? 'dark' : 'light')
}

/** Applique le thème choisi ; en « automatique », suit le mode clair / sombre de l'appareil. */
export function applyTheme(setting: ThemeSetting) {
  current = setting
  paint()
}

dark?.addEventListener('change', () => current === 'auto' && paint())
