import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { DogActivity, Trick, TrickStep, AnxietyTrigger, AnxietyProtocolStep } from '../lib/types'

const MATERIEL_STORAGE_KEY = 'vanya-materiel-disponible'

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
  const [tricks, setTricks] = useState<TrickAvecEtapes[]>([])
  const [activities, setActivities] = useState<DogActivity[]>([])
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
      const [tricksRes, stepsRes, activitiesRes, triggersRes, paliersRes] = await Promise.all([
        supabase.from(TABLES.tricks).select('*').in('categorie', ['tour', 'autocontrole']),
        supabase.from(TABLES.trickSteps).select('*'),
        supabase.from(TABLES.activities).select('*'),
        supabase.from(TABLES.anxietyTriggers).select('*').eq('protocole_active', true),
        supabase.from(TABLES.anxietyProtocols).select('*'),
      ])
      if (tricksRes.data && stepsRes.data) {
        const stepsByTrick: Record<string, TrickStep[]> = {}
        ;(stepsRes.data as TrickStep[]).forEach((s) => {
          if (!stepsByTrick[s.trick_id]) stepsByTrick[s.trick_id] = []
          stepsByTrick[s.trick_id].push(s)
        })
        setTricks((tricksRes.data as Trick[]).map((t) => ({ ...t, steps: stepsByTrick[t.id] ?? [] })))
      }
      if (activitiesRes.data) setActivities(activitiesRes.data as DogActivity[])
      if (triggersRes.data) setTriggers(triggersRes.data as AnxietyTrigger[])
      if (paliersRes.data) setPaliers(paliersRes.data as AnxietyProtocolStep[])
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

  const tricksAvecProchaineEtape = useMemo(
    () =>
      tricks.map((t) => {
        const prochaine = [...t.steps].sort((a, b) => a.ordre - b.ordre).find((s) => !s.completed)
        return { ...t, prochaine }
      }),
    [tricks],
  )

  // Logique volontairement simple : uniquement basée sur le statut global
  // que tu choisis toi-même sur chaque fiche. Pas de filtre lieu/matériel
  // caché ici — trop de bugs invisibles avec ça pour l'instant.
  const seance = useMemo(() => {
    const tours = tricksAvecProchaineEtape.filter((t) => t.categorie === 'tour')
    const autocontrole = tricksAvecProchaineEtape.filter((t) => t.categorie === 'autocontrole')

    const toursAppris = shuffle(tours.filter((t) => t.statut === 'appris')).slice(0, 4)
    const tourEnCours = shuffle(tours.filter((t) => t.statut === 'en_cours')).slice(0, 1)

    const autocontroleEnCours = autocontrole.filter((t) => t.statut === 'en_cours')
    const autocontroleAppris = autocontrole.filter((t) => t.statut === 'appris')
    const autocontroleChoisi = shuffle(
      autocontroleEnCours.length > 0 ? autocontroleEnCours : autocontroleAppris,
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
  }, [tricksAvecProchaineEtape, triggers, paliers, refreshCount])

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-ink">Ta séance</h2>
      <p className="text-sm text-ink/60">
        Basée uniquement sur le statut (Non appris / En cours / Appris) de chaque fiche.
      </p>

      <button
        onClick={() => setRefreshCount((c) => c + 1)}
        className="text-sm text-moss-dark font-medium flex items-center gap-1"
      >
        <RefreshCw size={14} /> Régénérer
      </button>

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
            <p className="text-sm text-ink/50">
              Aucun exercice "En cours" ou "Appris" pour l'instant — passe-en un depuis sa fiche.
            </p>
          ) : (
            seance.autocontroleChoisi.map((t) => (
              <Link key={t.id} to={`/autocontrole/${t.id}`} className="card !py-3 block">
                <p className="text-sm font-medium text-ink">{t.nom}</p>
                <p className="text-xs text-ink/50 mt-1">
                  {t.prochaine ? t.prochaine.description : "Toutes les étapes validées"}
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
            <p className="text-sm text-ink/50">
              Aucun tour marqué "Appris" pour l'instant — passe-en un depuis sa fiche.
            </p>
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
            <p className="text-sm text-ink/50">
              Aucun tour marqué "En cours" pour l'instant — passe-en un depuis sa fiche.
            </p>
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

      {allMateriel.length > 0 && (
        <div>
          <p className="text-sm text-ink/60 mb-2">Matériel que tu as sur toi (pour les activités) :</p>
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

          <p className="text-sm text-ink/60 mb-2">Activités réalisables avec ce matériel :</p>
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
