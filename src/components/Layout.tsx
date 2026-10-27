import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Home, Map, Settings, Target } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { UpdateBanner } from './UpdateBanner'

const NAV = [
  { to: '/', label: 'Accueil', icon: Home, end: true, also: [] as string[] },
  { to: '/parcours', label: 'Parcours', icon: Map, also: ['/grammaire'] },
  { to: '/pratique', label: 'Entraînement', icon: Target, also: ['/fiches', '/discussions', '/mes-mots', '/ecoute', '/oral', '/argot'] },
  { to: '/progres', label: 'Progrès', icon: BarChart3, also: [] },
  { to: '/reglages', label: 'Réglages', icon: Settings, also: [] },
]

/** Onglet (zone de navigation) correspondant à un chemin donné, en tenant compte d'une origine explicite. */
function zoneFor(pathname: string, fromState?: string) {
  if (fromState) {
    const tagged = NAV.find((n) => n.to === fromState)
    if (tagged) return tagged
  }
  return NAV.find((n) => (n.end ? pathname === n.to : pathname === n.to || pathname.startsWith(`${n.to}/`) || n.also.some((a) => pathname.startsWith(a))))
}

const LAST_PATHS_KEY = 'fala-last-paths'
const LAST_GLOBAL_KEY = 'fala-last-path'

function readLastPaths(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LAST_PATHS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function Layout() {
  const { pathname, search, state } = useLocation()
  const nav = useNavigate()
  const booted = useRef(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Au lancement de l'app, on reprend directement là où on en était (sauf si on était sur les réglages).
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    if (pathname !== '/') return
    const last = localStorage.getItem(LAST_GLOBAL_KEY)
    if (last && last !== '/') nav(last, { replace: true })
  }, [])

  // Mémorise, pour chaque onglet, le dernier chemin visité dans sa zone (fiches, écoute, quiz…),
  // afin de pouvoir y revenir directement en recliquant sur l'onglet.
  useEffect(() => {
    if (pathname === '/reglages') return
    const zone = zoneFor(pathname, (state as { from?: string } | null)?.from)
    if (!zone) return
    const full = pathname + search
    localStorage.setItem(LAST_GLOBAL_KEY, full)
    const prev = readLastPaths()
    if (prev[zone.to] !== full) localStorage.setItem(LAST_PATHS_KEY, JSON.stringify({ ...prev, [zone.to]: full }))
  }, [pathname, search, state])

  // Les sous-sections (grammaire, fiches…) gardent leur onglet parent actif.
  const cls = (base: string, also: string[]) => ({ isActive }: { isActive: boolean }) =>
    `${base} ${isActive || also.some((a) => pathname.startsWith(a)) ? 'active' : ''}`

  // En cliquant un onglet depuis l'extérieur de sa zone, on reprend le dernier chemin visité dedans.
  const resumeClick = (to: string, also: string[]) => (e: React.MouseEvent) => {
    const inZone = pathname === to || pathname.startsWith(`${to}/`) || also.some((a) => pathname.startsWith(a))
    if (inZone) return
    const resume = readLastPaths()[to]
    if (resume && resume !== to) {
      e.preventDefault()
      nav(resume)
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">F</span>
          <span>
            Fala<span className="brand-dot">!</span>
          </span>
        </div>
        <nav>
          {NAV.map(({ to, label, icon: Icon, end, also }) => (
            <NavLink key={to} to={to} end={end} className={cls('side-link', also)} onClick={resumeClick(to, also)}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-foot">Português do Brasil 🇧🇷</p>
      </aside>
      <main className="content">
        <Outlet />
      </main>
      <UpdateBanner />
      <nav className="tabbar">
        {NAV.map(({ to, label, icon: Icon, end, also }) => (
          <NavLink key={to} to={to} end={end} className={cls('tab', also)} onClick={resumeClick(to, also)}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
