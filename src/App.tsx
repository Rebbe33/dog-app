import { Routes, Route, NavLink } from 'react-router-dom'
import Accueil from './pages/Accueil'
import ModeRapide from './pages/ModeRapide'
import Tours from './pages/Tours'
import Autocontrole from './pages/Autocontrole'
import Anxiete from './pages/Anxiete'
import AnxieteDeclencheur from './pages/AnxieteDeclencheur'
import EducationBase from './pages/EducationBase'
import Activites from './pages/Activites'
import Sante from './pages/Sante'
import Reglages from './pages/Reglages'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil' },
  { to: '/rapide', label: 'Rapide' },
  { to: '/tours', label: 'Tours' },
  { to: '/autocontrole', label: 'Autocontrôle' },
  { to: '/anxiete', label: 'Anxiété' },
  { to: '/education', label: 'Éducation' },
  { to: '/activites', label: 'Activités' },
  { to: '/sante', label: 'Santé' },
  { to: '/reglages', label: 'Réglages' },
]

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold">Vanya</h1>
      </header>

      <main className="flex-1 px-4 py-4 pb-20">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/rapide" element={<ModeRapide />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/autocontrole" element={<Autocontrole />} />
          <Route path="/anxiete" element={<Anxiete />} />
          <Route path="/anxiete/:id" element={<AnxieteDeclencheur />} />
          <Route path="/education" element={<EducationBase />} />
          <Route path="/activites" element={<Activites />} />
          <Route path="/sante" element={<Sante />} />
          <Route path="/reglages" element={<Reglages />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 overflow-x-auto">
        <ul className="flex text-xs">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="flex-1 min-w-[72px]">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2 ${
                    isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
