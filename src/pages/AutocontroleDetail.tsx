import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PawPrint, Star } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { Trick, TrickStep } from '../lib/types'
import PawTrail from '../components/PawTrail'

export default function AutocontroleDetail() {
  const { id } = useParams<{ id: string }>()
  const [trick, setTrick] = useState<Trick | null>(null)
  const [steps, setSteps] = useState<TrickStep[]>([])
  const [loading, setLoading] = useState(true)
  const [newStep, setNewStep] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  async function loadData() {
    if (!id) return
    setLoading(true)
    const [trickRes, stepsRes] = await Promise.all([
      supabase.from(TABLES.tricks).select('*').eq('id', id).single(),
      supabase.from(TABLES.trickSteps).select('*').eq('trick_id', id).order('ordre'),
    ])
    if (trickRes.data) {
      setTrick(trickRes.data as Trick)
      setTagsInput((trickRes.data as Trick).tags.join(', '))
    }
    if (stepsRes.data) setSteps(stepsRes.data as TrickStep[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function toggleStep(step: TrickStep) {
    const completed = !step.completed
    await supabase
      .from(TABLES.trickSteps)
      .update({ completed, date_completion: completed ? new Date().toISOString().slice(0, 10) : null })
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

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>
  if (!trick) return <p className="text-sm text-ink/50">Exercice introuvable.</p>

  const validated = steps.filter((s) => s.completed).length

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
            Pas encore d'étapes — ajoute une progression personnalisée pour cet exercice.
          </p>
        )}

        <ul className="space-y-2">
          {steps.map((s) => (
            <li key={s.id} className="card !py-3 flex items-start gap-3">
              <button onClick={() => toggleStep(s)} className="mt-0.5 shrink-0">
                <PawPrint
                  size={20}
                  className={s.completed ? 'text-moss' : 'text-line'}
                  fill={s.completed ? 'currentColor' : 'none'}
                />
              </button>
              <div>
                <p className={`text-sm ${s.completed ? 'text-ink/40 line-through' : 'text-ink'}`}>
                  {s.description}
                </p>
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
