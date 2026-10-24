import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, Home, Map, Target } from 'lucide-react'
import { useEffect } from 'react'
import { UpdateBanner } from './UpdateBanner'

const NAV = [
  { to: '/', label: 'Accueil', icon: Home, end: true, also: [] as string[] },
  { to: '/parcours', label: 'Parcours', icon: Map, also: ['/grammaire'] },
  { to: '/pratique', label: 'Entraînement', icon: Target, also: ['/fiches', '/discussions', '/mes-mots', '/ecoute', '/oral', '/argot'] },
  { to: '/progres', label: 'Progrès', icon: BarChart3, also: [] },
]

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Les sous-sections (grammaire, fiches…) gardent leur onglet parent actif.
  const cls = (base: string, also: string[]) => ({ isActive }: { isActive: boolean }) =>
    `${base} ${isActive || also.some((a) => pathname.startsWith(a)) ? 'active' : ''}`

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
            <NavLink key={to} to={to} end={end} className={cls('side-link', also)}>
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
          <NavLink key={to} to={to} end={end} className={cls('tab', also)}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
