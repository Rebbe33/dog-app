import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Trees, ArrowLeft, RefreshCw, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { DogActivity, Trick, TrickStep, AnxietyTrigger, AnxietyProtocolStep } from '../lib/types'

const MATERIEL_STORAGE_KEY = 'vanya-materiel-disponible'

const OUTDOOR_KEYWORDS = [
  'extérieur', 'exterieur', 'dehors', 'promenade', 'jardin', 'rue', 'parc',
  'trottoir', 'quartier', 'forêt', 'foret', 'plage', 'rivière', 'riviere',
]

// Matériel "personnel" fixe, en plus de celui déjà déclaré sur les activités
const EQUIPEMENT_PERSO = ['Laisse', 'Longe', 'Jouet', 'Corde', 'Cible/bâton', 'Gamelle', 'Couverture', 'Harnais']

const EQUIPEMENT_KEYWORDS: Record<string, string[]> = {
  'Laisse': ['laisse'],
  'Longe': ['longe'],
  'Jouet': ['jouet'],
  'Corde': ['corde'],
  'Cible/bâton': ['cible', 'bâton', 'baton'],
  'Gamelle': ['gamelle'],
  'Couverture': ['couverture'],
  'Harnais': ['harnais'],
}

function isOutdoorStep(description: string) {
  const lower = description.toLowerCase()
  return OUTDOOR_KEYWORDS.some((k) => lower.includes(k))
}

// Renvoie les tags d'équipement détectés dans un texte d'étape (liste vide si aucun mot-clé trouvé)
function equipementRequisDansTexte(description: string) {
  const lower = description.toLowerCase()
  return Object.entries(EQUIPEMENT_KEYWORDS)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([tag]) => tag)
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

type TrickAvecEtapes = Trick & { steps: TrickStep[] }

export default function Suggestions() {
  const [contexte, setContexte] = useState<'maison' | 'exterieur'>('maison')
  const [activities, setActivities] = useState<DogActivity[]>([])
  const [tricks, setTricks] = useState<TrickAvecEtapes[]>([])
  const [triggers, setTriggers] = useState<AnxietyTrigger[]>([])
  const [paliers, setPaliers] = useState<AnxietyProtocolStep[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshCount, setRefreshCount] = useState(0)
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
      const [activitiesRes, tricksRes, stepsRes, triggersRes, paliersRes] = await Promise.all([
        supabase.from(TABLES.activities).select('*'),
        supabase.from(TABLES.tricks).select('*').in('categorie', ['tour', 'autocontrole', 'education_base']),
        supabase.from(TABLES.trickSteps).select('*'),
        supabase.from(TABLES.anxietyTriggers).select('*').eq('protocole_active', true),
        supabase.from(TABLES.anxietyProtocols).select('*'),
      ])
      if (activitiesRes.data) setActivities(activitiesRes.data as DogActivity[])
      if (tricksRes.data && stepsRes.data) {
        const stepsByTrick: Record<string, TrickStep[]> = {}
        ;(stepsRes.data as TrickStep[]).forEach((s) => {
          if (!stepsByTrick[s.trick_id]) stepsByTrick[s.trick_id] = []
          stepsByTrick[s.trick_id].push(s)
        })
        setTricks((tricksRes.data as Trick[]).map((t) => ({ ...t, steps: stepsByTrick[t.id] ?? [] })))
      }
      if (triggersRes.data) setTriggers(triggersRes.data as AnxietyTrigger[])
      if (paliersRes.data) setPaliers(paliersRes.data as AnxietyProtocolStep[])
      setLoading(false)
    }
    load()
  }, [])

  const allMateriel = useMemo(() => {
    const set = new Set<string>(EQUIPEMENT_PERSO)
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

  // Équipement requis par un tour = union des mots-clés détectés dans toutes ses étapes
  function trickCompatible(t: TrickAvecEtapes) {
    const requis = new Set<string>()
    t.steps.forEach((s) => equipementRequisDansTexte(s.description).forEach((tag) => requis.add(tag)))
    return Array.from(requis).every((tag) => materielDispo.includes(tag))
  }

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

  // Pool filtré par lieu ET matériel disponible
  const poolContexte = useMemo(() => {
    return tricksAvecProchaineEtape.filter((t) => {
      const descRef = t.prochaine?.description ?? t.steps[t.steps.length - 1]?.description ?? ''
      const estExterieur = isOutdoorStep(descRef)
      const lieuOk = contexte === 'exterieur' ? true : !estExterieur
      return lieuOk && trickCompatible(t)
    })
  }, [tricksAvecProchaineEtape, contexte, materielDispo])

  const seance = useMemo(() => {
    const toursPool = poolContexte.filter((t) => t.categorie === 'tour')
    const autocontrolePool = poolContexte.filter((t) => t.categorie === 'autocontrole')

    const toursAppris = shuffle(
      toursPool.filter((t) => t.steps.length > 0 && t.steps.every((s) => s.completed)),
    ).slice(0, 4)

    const toursEnCoursCandidats = toursPool.filter(
      (t) => t.steps.some((s) => s.en_cours) || (t.steps.some((s) => s.completed) && t.steps.some((s) => !s.completed)),
    )
    const tourEnCours = shuffle(toursEnCoursCandidats).slice(0, 1)

    const autocontroleEnCours = autocontrolePool.filter(
      (t) => t.steps.some((s) => s.en_cours) || (t.steps.some((s) => s.completed) && t.steps.some((s) => !s.completed)),
    )
    const autocontroleMaitrise = autocontrolePool.filter(
      (t) => t.steps.length > 0 && t.steps.every((s) => s.completed),
    )
    const autocontroleNouveau = autocontrolePool.filter((t) => t.steps.length === 0 || !t.steps.some((s) => s.completed || s.en_cours))
    const autocontroleChoisi = shuffle(
      autocontroleEnCours.length > 0 ? autocontroleEnCours : autocontroleMaitrise.length > 0 ? autocontroleMaitrise : autocontroleNouveau,
    ).slice(0, 1)

    // Point anxiété : un déclencheur au protocole actif avec un palier non encore réussi
    const declencheursAvecPalier = triggers
      .map((trig) => {
        const palierSuivant = paliers
          .filter((p) => p.trigger_id === trig.id)
          .sort((a, b) => a.ordre - b.ordre)
          .find((p) => !p.reussite)
        return { trig, palierSuivant }
      })
      .filter((x) => x.palierSuivant)
    const pointAnxiete = shuffle(declencheursAvecPalier).slice(0, 1)

    return { toursAppris, tourEnCours, autocontroleChoisi, pointAnxiete }
  }, [poolContexte, triggers, paliers, refreshCount])

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
            À la maison
          </span>
        </button>
        <button
          onClick={() => setContexte('exterieur')}
          className={`flex-1 card !py-3 flex flex-col items-center gap-1 ${contexte === 'exterieur' ? 'ring-2 ring-moss' : ''}`}
        >
          <Trees size={20} className={contexte === 'exterieur' ? 'text-moss-dark' : 'text-ink/50'} />
          <span className={`text-sm ${contexte === 'exterieur' ? 'text-moss-dark font-medium' : 'text-ink/60'}`}>
            En extérieur
          </span>
        </button>
      </div>

      <div>
        <p className="text-sm text-ink/60 mb-2">Matériel que tu as sur toi :</p>
        <div className="flex flex-wrap gap-2">
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
        <p className="text-xs text-ink/40 mt-1">
          Les friandises/leurre sont toujours supposés disponibles.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-medium text-ink">Ta séance</h3>
          <button
            onClick={() => setRefreshCount((c) => c + 1)}
            className="text-sm text-moss-dark font-medium flex items-center gap-1"
          >
            <RefreshCw size={14} /> Régénérer
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-ink/50 mb-1.5 flex items-center gap-1">
              <HeartPulse size={13} /> Anxiété
            </p>
            {seance.pointAnxiete.length === 0 ? (
              <p className="text-sm text-ink/50">Rien à travailler ici pour l'instant.</p>
            ) : (
              seance.pointAnxiete.map(({ trig, palierSuivant }) => (
                <Link key={trig.id} to={`/anxiete/${trig.id}`} className="card !py-3 block">
                  <p className="text-sm font-medium text-ink">{trig.nom}</p>
                  <p className="text-xs text-ink/50 mt-1">{palierSuivant?.palier}</p>
                </Link>
              ))
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-ink/50 mb-1.5 flex items-center gap-1">
              <ShieldCheck size={13} /> Autocontrôle
            </p>
            {seance.autocontroleChoisi.length === 0 ? (
              <p className="text-sm text-ink/50">Rien de compatible avec ce contexte/matériel.</p>
            ) : (
              seance.autocontroleChoisi.map((t) => (
                <Link key={t.id} to={`/autocontrole/${t.id}`} className="card !py-3 block">
                  <p className="text-sm font-medium text-ink">{t.nom}</p>
                  <p className="text-xs text-ink/50 mt-1">
                    {t.prochaine ? t.prochaine.description : "Pas encore d'étapes — à démarrer"}
                  </p>
                </Link>
              ))
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-ink/50 mb-1.5 flex items-center gap-1">
              <Sparkles size={13} /> Tours à réviser ({seance.toursAppris.length})
            </p>
            {seance.toursAppris.length === 0 ? (
              <p className="text-sm text-ink/50">Aucun tour maîtrisé compatible pour l'instant.</p>
            ) : (
              <ul className="space-y-2">
                {seance.toursAppris.map((t) => (
                  <li key={t.id}>
                    <Link to={`/tours/${t.id}`} className="card !py-3 block">
                      <p className="text-sm font-medium text-ink">{t.nom}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-ink/50 mb-1.5 flex items-center gap-1">
              <Sparkles size={13} /> Tour en cours d'apprentissage
            </p>
            {seance.tourEnCours.length === 0 ? (
              <p className="text-sm text-ink/50">Rien en cours de compatible — regarde "Nouveau tour" plus bas.</p>
            ) : (
              seance.tourEnCours.map((t) => (
                <Link key={t.id} to={`/tours/${t.id}`} className="card !py-3 block">
                  <p className="text-sm font-medium text-ink">{t.nom}</p>
                  <p className="text-xs text-ink/50 mt-1">{t.prochaine?.description}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {contexte === 'exterieur' && (
        <div>
          <p className="text-sm text-ink/60 mb-2">Activités réalisables avec ce matériel :</p>
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
