import { Routes, Route, NavLink } from 'react-router-dom'
import { Home, Zap, Sparkles, ShieldCheck, HeartPulse, Users, MountainSnow, Stethoscope, Settings } from 'lucide-react'
import Accueil from './pages/Accueil'
import ModeRapide from './pages/ModeRapide'
import Tours from './pages/Tours'
import TourDetail from './pages/TourDetail'
import Autocontrole from './pages/Autocontrole'
import AutocontroleDetail from './pages/AutocontroleDetail'
import Anxiete from './pages/Anxiete'
import AnxieteDeclencheur from './pages/AnxieteDeclencheur'
import EducationBase from './pages/EducationBase'
import Activites from './pages/Activites'
import Sante from './pages/Sante'
import Reglages from './pages/Reglages'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/rapide', label: 'Rapide', icon: Zap },
  { to: '/tours', label: 'Tours', icon: Sparkles },
  { to: '/autocontrole', label: 'Autocontrôle', icon: ShieldCheck },
  { to: '/anxiete', label: 'Anxiété', icon: HeartPulse },
  { to: '/education', label: 'Éducation', icon: Users },
  { to: '/activites', label: 'Activités', icon: MountainSnow },
  { to: '/sante', label: 'Santé', icon: Stethoscope },
  { to: '/reglages', label: 'Réglages', icon: Settings },
]

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="px-5 py-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Vanya</h1>
      </header>

      <main className="flex-1 px-4 pb-24">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/rapide" element={<ModeRapide />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/autocontrole" element={<Autocontrole />} />
          <Route path="/autocontrole/:id" element={<AutocontroleDetail />} />
          <Route path="/anxiete" element={<Anxiete />} />
          <Route path="/anxiete/:id" element={<AnxieteDeclencheur />} />
          <Route path="/education" element={<EducationBase />} />
          <Route path="/activites" element={<Activites />} />
          <Route path="/sante" element={<Sante />} />
          <Route path="/reglages" element={<Reglages />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-line overflow-x-auto">
        <ul className="flex text-[11px]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to} className="flex-1 min-w-[68px]">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-0.5 py-2.5 ${
                      isActive ? 'text-moss-dark font-medium' : 'text-ink/40'
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={2} />
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
