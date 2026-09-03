import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Thermometer } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { DogActivity, ActivitySession, TrickStep } from '../lib/types'
import ActivitySessionForm from '../components/activities/ActivitySessionForm'
import PawTrail from '../components/PawTrail'
import StepPawIcon, { nextStepStatus } from '../components/StepPawIcon'

export default function ActiviteDetail() {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<DogActivity | null>(null)
  const [sessions, setSessions] = useState<ActivitySession[]>([])
  const [steps, setSteps] = useState<TrickStep[]>([])
  const [loading, setLoading] = useState(true)
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [materielInput, setMaterielInput] = useState('')
  const [temperatureInput, setTemperatureInput] = useState('')
  const [newStep, setNewStep] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)

  async function loadData() {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    const [activityRes, sessionsRes] = await Promise.all([
      supabase.from(TABLES.activities).select('*').eq('id', id).single(),
      supabase.from(TABLES.activitySessions).select('*').eq('activity_id', id).order('date', { ascending: false }),
    ])
    if (activityRes.error) setLoadError(activityRes.error.message)
    if (activityRes.data) {
      const a = activityRes.data as DogActivity
      setActivity(a)
      setMaterielInput(a.materiel_requis.join(', '))
      setTemperatureInput(a.temperature_max_recommandee?.toString() ?? '')
      if (a.objectif_progressif_active && a.trick_id) {
        const { data: stepsData } = await supabase
          .from(TABLES.trickSteps)
          .select('*')
          .eq('trick_id', a.trick_id)
          .order('ordre')
        if (stepsData) setSteps(stepsData as TrickStep[])
      } else {
        setSteps([])
      }
    }
    if (sessionsRes.data) setSessions(sessionsRes.data as ActivitySession[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function saveDetails() {
    if (!activity) return
    const materiel = materielInput.split(',').map((m) => m.trim()).filter(Boolean)
    await supabase
      .from(TABLES.activities)
      .update({
        materiel_requis: materiel,
        temperature_max_recommandee: temperatureInput ? Number(temperatureInput) : null,
      })
      .eq('id', activity.id)
    loadData()
  }

  async function toggleObjectifProgressif() {
    if (!activity) return
    if (!activity.objectif_progressif_active) {
      // Active l'objectif : crée le tour lié s'il n'existe pas encore
      let trickId = activity.trick_id
      if (!trickId) {
        const { data: newTrick } = await supabase
          .from(TABLES.tricks)
          .insert({ nom: activity.nom, categorie: 'activite' })
          .select('id')
          .single()
        trickId = newTrick?.id ?? null
      }
      await supabase
        .from(TABLES.activities)
        .update({ objectif_progressif_active: true, trick_id: trickId })
        .eq('id', activity.id)
    } else {
      await supabase
        .from(TABLES.activities)
        .update({ objectif_progressif_active: false })
        .eq('id', activity.id)
    }
    loadData()
  }

  async function toggleStep(step: TrickStep) {
    const next = nextStepStatus(step)
    await supabase
      .from(TABLES.trickSteps)
      .update({
        ...next,
        date_completion: next.completed ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq('id', step.id)
    loadData()
  }

  async function addStep() {
    if (!activity?.trick_id || !newStep.trim()) return
    const ordre = steps.length ? Math.max(...steps.map((s) => s.ordre)) + 1 : 1
    await supabase.from(TABLES.trickSteps).insert({
      trick_id: activity.trick_id,
      ordre,
      description: newStep.trim(),
    })
    setNewStep('')
    loadData()
  }

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>
  if (!activity) {
    return (
      <div className="space-y-3">
        <Link to="/activites" className="inline-flex items-center gap-1 text-sm text-ink/50">
          <ArrowLeft size={14} /> Activités
        </Link>
        <p className="text-sm text-ink/50">Activité introuvable.</p>
        {loadError && (
          <p className="text-sm text-rust bg-amber-light/40 border border-amber rounded-xl px-3 py-2">
            Erreur : {loadError}
          </p>
        )}
      </div>
    )
  }

  const validated = steps.filter((s) => s.completed).length

  return (
    <div className="space-y-6">
      <Link to="/activites" className="inline-flex items-center gap-1 text-sm text-ink/50">
        <ArrowLeft size={14} /> Activités
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-ink">{activity.nom}</h2>
        <button
          onClick={() => setShowSessionForm((v) => !v)}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
        >
          <Plus size={16} /> Séance
        </button>
      </div>

      {showSessionForm && (
        <ActivitySessionForm
          activity={activity}
          onCancel={() => setShowSessionForm(false)}
          onLogged={() => {
            setShowSessionForm(false)
            loadData()
          }}
        />
      )}

      <div className="card space-y-3">
        <label className="block text-sm text-ink">
          Matériel requis (séparé par des virgules)
          <input
            type="text"
            value={materielInput}
            onChange={(e) => setMaterielInput(e.target.value)}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white text-sm"
          />
        </label>
        <label className="block text-sm text-ink flex items-center gap-1">
          <Thermometer size={14} /> Seuil de température max (°C)
          <input
            type="number"
            value={temperatureInput}
            onChange={(e) => setTemperatureInput(e.target.value)}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white text-sm"
          />
        </label>
        <button onClick={saveDetails} className="btn-secondary px-3 py-2 text-sm">
          Enregistrer
        </button>
      </div>

      <div className="card">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={activity.objectif_progressif_active}
            onChange={toggleObjectifProgressif}
            className="accent-moss"
          />
          Objectif progressif activé (paliers, comme pour les tours)
        </label>
      </div>

      {activity.objectif_progressif_active && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-medium text-ink">Paliers</h3>
            {steps.length > 0 && (
              <span className="text-xs text-ink/40 font-mono">{validated}/{steps.length}</span>
            )}
          </div>
          {steps.length > 0 && (
            <div className="mb-3">
              <PawTrail total={steps.length} filled={validated} size={16} />
            </div>
          )}
          {steps.length === 0 && (
            <p className="text-sm text-ink/50 mb-2">Pas encore de paliers — ajoute un objectif progressif.</p>
          )}
          <ul className="space-y-2">
            {steps.map((s) => (
              <li key={s.id} className="card !py-3 flex items-start gap-3">
                <StepPawIcon step={s} onClick={() => toggleStep(s)} />
                <div>
                  <p className={`text-sm ${s.completed ? 'text-ink/40 line-through' : 'text-ink'}`}>
                    {s.description}
                  </p>
                  {s.en_cours && !s.completed && (
                    <p className="text-xs text-amber font-medium mt-0.5">en cours</p>
                  )}
                  {s.date_completion && (
                    <p className="text-xs text-ink/30 font-mono mt-0.5">validé le {s.date_completion}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Nouveau palier (ex. 5km)..."
              className="flex-1 border border-line rounded-full px-4 py-2 text-sm bg-white"
            />
            <button onClick={addStep} className="btn-primary text-sm px-4 py-2">
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display text-lg font-medium text-ink mb-2">Historique des séances</h3>
        {sessions.length === 0 && <p className="text-sm text-ink/50">Aucune séance enregistrée.</p>}
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="card !py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-mono text-xs text-ink/50">
                  {new Date(s.date).toLocaleDateString('fr-FR')}
                </span>
                <span className="text-ink/60">
                  {s.duree ?? '—'} {s.distance ? `· ${s.distance}km` : ''}
                </span>
              </div>
              {(s.meteo_temperature !== null || s.meteo_condition) && (
                <p className="text-xs text-ink/50 mt-1">
                  {s.meteo_temperature !== null ? `${s.meteo_temperature}°C` : ''} {s.meteo_condition}
                </p>
              )}
              {(s.etat_avant?.length > 0 || s.etat_apres?.length > 0) && (
                <p className="text-xs text-ink/50 mt-1">
                  Avant : {s.etat_avant?.join(', ') || '—'} · Après : {s.etat_apres?.join(', ') || '—'}
                </p>
              )}
              {s.notes && <p className="text-xs text-ink/70 mt-1">{s.notes}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
