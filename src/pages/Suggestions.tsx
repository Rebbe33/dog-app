import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Trees, ArrowLeft } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { DogActivity, Trick, TrickStep } from '../lib/types'

const MATERIEL_STORAGE_KEY = 'vanya-materiel-disponible'

const OUTDOOR_KEYWORDS = [
  'extérieur', 'exterieur', 'dehors', 'promenade', 'jardin', 'rue', 'parc',
  'trottoir', 'quartier', 'forêt', 'foret', 'plage', 'rivière', 'riviere',
]

function isOutdoorStep(description: string) {
  const lower = description.toLowerCase()
  return OUTDOOR_KEYWORDS.some((k) => lower.includes(k))
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

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

  // Prochaine étape non validée de chaque compétence (ou null si terminée)
  const tricksAvecProchaineEtape = useMemo(
    () =>
      tricks
        .map((t) => {
          const prochaine = [...t.steps].sort((a, b) => a.ordre - b.ordre).find((s) => !s.completed)
          return { ...t, prochaine }
        })
        .filter((t) => t.steps.length === 0 || t.prochaine),
    [tricks],
  )

  // Un tour est "maîtrisé" si toutes ses étapes sont validées (et qu'il en a).
  const estMaitrise = (nom: string) => {
    const t = tricks.find((tr) => tr.nom === nom)
    if (!t) return false
    return t.steps.length > 0 && t.steps.every((s) => s.completed)
  }

  const suggestionsMaison = useMemo(() => {
    const filtered = tricksAvecProchaineEtape.filter(
      (t) => !t.prochaine || !isOutdoorStep(t.prochaine.description),
    )
    // "En cours" = au moins une étape validée OU en cours de travail.
    // "Nouveau" = rien d'entamé, et prérequis (s'il y en a) déjà maîtrisés.
    const enCours = filtered.filter((t) => t.steps.some((s) => s.completed || s.en_cours))
    const nouveaux = filtered.filter(
      (t) =>
        !t.steps.some((s) => s.completed || s.en_cours) &&
        t.prerequis.every((p) => estMaitrise(p)),
    )

    const enCoursPrioritaires = shuffle(enCours.filter((t) => t.prioritaire))
    const enCoursAutres = shuffle(enCours.filter((t) => !t.prioritaire))
    const aContinuer = [...enCoursPrioritaires, ...enCoursAutres].slice(0, 4)

    const nouveauxPrioritaires = shuffle(nouveaux.filter((t) => t.prioritaire))
    const nouveauxAutres = shuffle(nouveaux.filter((t) => !t.prioritaire))
    const nouveau = [...nouveauxPrioritaires, ...nouveauxAutres].slice(0, 1)

    return { aContinuer, nouveau }
  }, [tricksAvecProchaineEtape, tricks])

  const suggestionsExterieurTours = useMemo(() => {
    const filtered = tricksAvecProchaineEtape.filter(
      (t) => t.prochaine && isOutdoorStep(t.prochaine.description),
    )
    const prioritaires = shuffle(filtered.filter((t) => t.prioritaire))
    const autres = shuffle(filtered.filter((t) => !t.prioritaire))
    return [...prioritaires, ...autres].slice(0, 5)
  }, [tricksAvecProchaineEtape])

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
        <div className="space-y-6">
          <p className="text-sm text-ink/60">
            Ces exercices se font sans matériel particulier (juste des friandises) — parfaits là où tu es.
          </p>

          <div>
            <h3 className="font-display text-lg font-medium text-ink mb-2">À continuer</h3>
            {suggestionsMaison.aContinuer.length === 0 && (
              <p className="text-sm text-ink/50">Rien en cours pour l'instant.</p>
            )}
            <ul className="space-y-2">
              {suggestionsMaison.aContinuer.map((t) => (
                <li key={t.id}>
                  <Link to={`${categorieRoute[t.categorie]}/${t.id}`} className="card !py-3 block">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink">{t.nom}</p>
                      <span className="text-xs text-ink/40">{categorieLabel[t.categorie]}</span>
                    </div>
                    <p className="text-xs text-ink/50 mt-1">{t.prochaine?.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {suggestionsMaison.nouveau.length > 0 && (
            <div>
              <h3 className="font-display text-lg font-medium text-ink mb-2">Nouveau tour à découvrir</h3>
              <ul className="space-y-2">
                {suggestionsMaison.nouveau.map((t) => (
                  <li key={t.id}>
                    <Link to={`${categorieRoute[t.categorie]}/${t.id}`} className="card !py-3 block">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink">{t.nom}</p>
                        <span className="text-xs text-ink/40">{categorieLabel[t.categorie]}</span>
                      </div>
                      <p className="text-xs text-ink/50 mt-1">
                        {t.prochaine ? t.prochaine.description : "Pas encore d'étapes — à démarrer"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {contexte === 'exterieur' && (
        <div className="space-y-6">
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

            <p className="text-sm text-ink/60 mb-2">Activités réalisables maintenant :</p>
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

          <div>
            <p className="text-sm text-ink/60 mb-2">
              Étapes de tours/autocontrôle à travailler dehors, pendant que tu y es :
            </p>
            {suggestionsExterieurTours.length === 0 && (
              <p className="text-sm text-ink/50">Aucune étape en attente ne nécessite l'extérieur pour l'instant.</p>
            )}
            <ul className="space-y-2">
              {suggestionsExterieurTours.map((t) => (
                <li key={t.id}>
                  <Link to={`${categorieRoute[t.categorie]}/${t.id}`} className="card !py-3 block">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink">{t.nom}</p>
                      <span className="text-xs text-ink/40">{categorieLabel[t.categorie]}</span>
                    </div>
                    <p className="text-xs text-ink/50 mt-1">{t.prochaine?.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
