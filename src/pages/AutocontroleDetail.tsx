import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, AlertTriangle } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { Trick, TrickStep } from '../lib/types'
import PawTrail from '../components/PawTrail'
import StepPawIcon, { nextStepStatus } from '../components/StepPawIcon'
import StatutSelector from '../components/StatutSelector'

export default function AutocontroleDetail() {
  const { id } = useParams<{ id: string }>()
  const [trick, setTrick] = useState<Trick | null>(null)
  const [steps, setSteps] = useState<TrickStep[]>([])
  const [allTricks, setAllTricks] = useState<Trick[]>([])
  const [allSteps, setAllSteps] = useState<TrickStep[]>([])
  const [loading, setLoading] = useState(true)
  const [newStep, setNewStep] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [prerequisInput, setPrerequisInput] = useState('')

  async function loadData() {
    if (!id) return
    setLoading(true)
    const [trickRes, stepsRes, allTricksRes, allStepsRes] = await Promise.all([
      supabase.from(TABLES.tricks).select('*').eq('id', id).single(),
      supabase.from(TABLES.trickSteps).select('*').eq('trick_id', id).order('ordre'),
      supabase.from(TABLES.tricks).select('*'),
      supabase.from(TABLES.trickSteps).select('*'),
    ])
    if (trickRes.data) {
      setTrick(trickRes.data as Trick)
      setTagsInput((trickRes.data as Trick).tags.join(', '))
      setPrerequisInput((trickRes.data as Trick).prerequis.join(', '))
    }
    if (stepsRes.data) setSteps(stepsRes.data as TrickStep[])
    if (allTricksRes.data) setAllTricks(allTricksRes.data as Trick[])
    if (allStepsRes.data) setAllSteps(allStepsRes.data as TrickStep[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
    if (!id || !newStep.trim()) return
    const ordre = steps.length ? Math.max(...steps.map((s) => s.ordre)) + 1 : 1
    await supabase.from(TABLES.trickSteps).insert({
      trick_id: id,
      ordre,
      description: newStep.trim(),
    })
    setNewStep('')
    loadData()
  }

  async function changeStatut(statut: Trick['statut']) {
    if (!trick) return
    await supabase.from(TABLES.tricks).update({ statut }).eq('id', trick.id)
    loadData()
  }

  async function togglePrioritaire() {
    if (!trick) return
    await supabase.from(TABLES.tricks).update({ prioritaire: !trick.prioritaire }).eq('id', trick.id)
    loadData()
  }

  async function saveTags() {
    if (!trick) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    await supabase.from(TABLES.tricks).update({ tags }).eq('id', trick.id)
    loadData()
  }

  async function savePrerequis() {
    if (!trick) return
    const prerequis = prerequisInput
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    await supabase.from(TABLES.tricks).update({ prerequis }).eq('id', trick.id)
    loadData()
  }

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>
  if (!trick) return <p className="text-sm text-ink/50">Exercice introuvable.</p>

  const validated = steps.filter((s) => s.completed).length

  const prerequisNonMaitrises = trick.prerequis.filter((nomPrerequis) => {
    const t = allTricks.find((at) => at.nom === nomPrerequis)
    if (!t) return false
    const tSteps = allSteps.filter((s) => s.trick_id === t.id)
    // Maîtrisé = a des étapes et elles sont toutes validées
    return !(tSteps.length > 0 && tSteps.every((s) => s.completed))
  })

  return (
    <div className="space-y-6">
      <Link to="/autocontrole" className="inline-flex items-center gap-1 text-sm text-ink/50">
        <ArrowLeft size={14} /> Autocontrôle
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-ink">{trick.nom}</h2>
        <button onClick={togglePrioritaire} className="shrink-0">
          <Star size={22} className={trick.prioritaire ? 'text-amber fill-amber' : 'text-line'} />
        </button>
      </div>

      {prerequisNonMaitrises.length > 0 && (
        <p className="text-sm text-rust bg-amber-light/40 border border-amber rounded-xl px-3 py-2 flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          Prérequis pas encore maîtrisés : {prerequisNonMaitrises.join(', ')}
        </p>
      )}

      <StatutSelector statut={trick.statut} onChange={changeStatut} />

      <div className="card">
        <label className="block text-sm text-ink">
          Tags (séparés par une virgule)
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ex. education_base"
              className="flex-1 border border-line rounded-xl px-3 py-2 bg-white text-sm"
            />
            <button onClick={saveTags} className="btn-secondary px-3 py-2 text-sm">
              Enregistrer
            </button>
          </div>
        </label>
      </div>

      <div className="card">
        <label className="block text-sm text-ink">
          Prérequis (noms des tours, séparés par une virgule)
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={prerequisInput}
              onChange={(e) => setPrerequisInput(e.target.value)}
              placeholder="ex. Apporte, Lâche"
              className="flex-1 border border-line rounded-xl px-3 py-2 bg-white text-sm"
            />
            <button onClick={savePrerequis} className="btn-secondary px-3 py-2 text-sm">
              Enregistrer
            </button>
          </div>
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg font-medium text-ink">Étapes</h3>
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
          <p className="text-sm text-ink/50 mb-2">
            Pas encore d'étapes — ajoute une progression personnalisée.
          </p>
        )}

        <p className="text-xs text-ink/40 mb-2">
          Tape sur la patte pour changer l'état : à faire → en cours → validé.
        </p>

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
            placeholder="Nouvelle étape..."
            className="flex-1 border border-line rounded-full px-4 py-2 text-sm bg-white"
          />
          <button onClick={addStep} className="btn-primary text-sm px-4 py-2">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
