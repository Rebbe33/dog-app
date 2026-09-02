import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Trees, ArrowLeft } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { DogActivity, Trick, TrickStep } from '../lib/types'

const MATERIEL_STORAGE_KEY = 'vanya-materiel-disponible'

export default function Suggestions() {
  const [contexte, setContexte] = useState<'maison' | 'exterieur'>('maison')
  const [activities, setActivities] = useState<DogActivity[]>([])
  const [tricks, setTricks] = useState<(Trick & { steps: TrickStep[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [materielDispo, setMaterielDispo] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(MATERIEL_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(MATERIEL_STORAGE_KEY, JSON.stringify(materielDispo))
  }, [materielDispo])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [activitiesRes, tricksRes, stepsRes] = await Promise.all([
        supabase.from(TABLES.activities).select('*'),
        supabase.from(TABLES.tricks).select('*').in('categorie', ['tour', 'autocontrole', 'education_base']),
        supabase.from(TABLES.trickSteps).select('*'),
      ])
      if (activitiesRes.data) setActivities(activitiesRes.data as DogActivity[])
      if (tricksRes.data && stepsRes.data) {
        const stepsByTrick: Record<string, TrickStep[]> = {}
        ;(stepsRes.data as TrickStep[]).forEach((s) => {
          if (!stepsByTrick[s.trick_id]) stepsByTrick[s.trick_id] = []
          stepsByTrick[s.trick_id].push(s)
        })
        setTricks(
          (tricksRes.data as Trick[]).map((t) => ({ ...t, steps: stepsByTrick[t.id] ?? [] })),
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  const allMateriel = useMemo(() => {
    const set = new Set<string>()
    activities.forEach((a) => a.materiel_requis?.forEach((m) => set.add(m)))
    return Array.from(set).sort()
  }, [activities])

  function toggleMateriel(m: string) {
    setMaterielDispo((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  const activitesRealisables = useMemo(
    () =>
      activities.filter(
        (a) => !a.materiel_requis || a.materiel_requis.every((m) => materielDispo.includes(m)),
      ),
    [activities, materielDispo],
  )

  // Suggestions "maison" : compétences non terminées, ou sans étapes du tout à démarrer,
  // priorité aux tours marqués prioritaires
  const suggestionsMaison = useMemo(() => {
    const nonTerminees = tricks.filter((t) => {
      if (t.steps.length === 0) return true
      return t.steps.some((s) => !s.completed)
    })
    return nonTerminees.sort((a, b) => Number(b.prioritaire) - Number(a.prioritaire)).slice(0, 5)
  }, [tricks])

  const categorieLabel: Record<string, string> = {
    tour: 'Tour',
    autocontrole: 'Autocontrôle',
    education_base: 'Éducation de base',
  }
  const categorieRoute: Record<string, string> = {
    tour: '/tours',
    autocontrole: '/autocontrole',
    education_base: '/education',
  }

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-ink/50">
        <ArrowLeft size={14} /> Accueil
      </Link>

      <h2 className="font-display text-xl font-semibold text-ink">Que faire maintenant ?</h2>

      <div className="flex gap-2">
        <button
          onClick={() => setContexte('maison')}
          className={`flex-1 card !py-3 flex flex-col items-center gap-1 ${contexte === 'maison' ? 'ring-2 ring-moss' : ''}`}
        >
          <Home size={20} className={contexte === 'maison' ? 'text-moss-dark' : 'text-ink/50'} />
          <span className={`text-sm ${contexte === 'maison' ? 'text-moss-dark font-medium' : 'text-ink/60'}`}>
            À la maison / peu de matériel
          </span>
        </button>
        <button
          onClick={() => setContexte('exterieur')}
          className={`flex-1 card !py-3 flex flex-col items-center gap-1 ${contexte === 'exterieur' ? 'ring-2 ring-moss' : ''}`}
        >
          <Trees size={20} className={contexte === 'exterieur' ? 'text-moss-dark' : 'text-ink/50'} />
          <span className={`text-sm ${contexte === 'exterieur' ? 'text-moss-dark font-medium' : 'text-ink/60'}`}>
            En extérieur / activité
          </span>
        </button>
      </div>

      {contexte === 'maison' && (
        <div>
          <p className="text-sm text-ink/60 mb-3">
            Ces exercices se font sans matériel particulier (juste des friandises) — parfaits là où tu es.
          </p>
          {suggestionsMaison.length === 0 && (
            <p className="text-sm text-ink/50">Tout est déjà maîtrisé, bravo !</p>
          )}
          <ul className="space-y-2">
            {suggestionsMaison.map((t) => (
              <li key={t.id}>
                <Link to={`${categorieRoute[t.categorie]}/${t.id}`} className="card !py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{t.nom}</p>
                    <p className="text-xs text-ink/40">{categorieLabel[t.categorie]}</p>
                  </div>
                  <span className="text-xs text-ink/40 font-mono">
                    {t.steps.length === 0 ? 'à démarrer' : `${t.steps.filter((s) => s.completed).length}/${t.steps.length}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {contexte === 'exterieur' && (
        <div>
          <p className="text-sm text-ink/60 mb-2">Coche ce que tu as sur toi :</p>
          {allMateriel.length === 0 && (
            <p className="text-sm text-ink/50 mb-3">
              Aucun matériel renseigné pour l'instant sur tes activités — ajoutes-en depuis la fiche de chaque activité.
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {allMateriel.map((m) => (
              <button
                key={m}
                onClick={() => toggleMateriel(m)}
                className={`tag ${materielDispo.includes(m) ? 'tag-active' : 'text-ink/60'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <p className="text-sm text-ink/60 mb-2">Réalisable maintenant :</p>
          {activitesRealisables.length === 0 && (
            <p className="text-sm text-ink/50">Aucune activité ne correspond au matériel sélectionné.</p>
          )}
          <ul className="space-y-2">
            {activitesRealisables.map((a) => (
              <li key={a.id}>
                <Link to={`/activites/${a.id}`} className="card !py-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{a.nom}</p>
                  {a.materiel_requis?.length > 0 ? (
                    <span className="text-xs text-ink/40">{a.materiel_requis.join(', ')}</span>
                  ) : (
                    <span className="text-xs text-ink/40">sans matériel</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
