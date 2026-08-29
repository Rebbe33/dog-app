import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, PawPrint } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { AnxietyTrigger, AnxietyLogEntry, AnxietyProtocolStep, AnxietyTechnique } from '../lib/types'
import LogEpisodeForm from '../components/anxiety/LogEpisodeForm'
import PawTrail from '../components/PawTrail'

export default function AnxieteDeclencheur() {
  const { id } = useParams<{ id: string }>()
  const [trigger, setTrigger] = useState<AnxietyTrigger | null>(null)
  const [logs, setLogs] = useState<AnxietyLogEntry[]>([])
  const [steps, setSteps] = useState<AnxietyProtocolStep[]>([])
  const [techniques, setTechniques] = useState<AnxietyTechnique[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [newPalier, setNewPalier] = useState('')
  const [newTechnique, setNewTechnique] = useState('')

  async function loadData() {
    if (!id) return
    setLoading(true)
    const [triggerRes, logsRes, stepsRes, techRes] = await Promise.all([
      supabase.from(TABLES.anxietyTriggers).select('*').eq('id', id).single(),
      supabase.from(TABLES.anxietyLog).select('*').eq('trigger_id', id).order('date', { ascending: false }),
      supabase.from(TABLES.anxietyProtocols).select('*').eq('trigger_id', id).order('ordre'),
      supabase.from(TABLES.anxietyTechniques).select('*').or(`trigger_id.eq.${id},trigger_id.is.null`),
    ])
    if (triggerRes.data) setTrigger(triggerRes.data as AnxietyTrigger)
    if (logsRes.data) setLogs(logsRes.data as AnxietyLogEntry[])
    if (stepsRes.data) setSteps(stepsRes.data as AnxietyProtocolStep[])
    if (techRes.data) setTechniques(techRes.data as AnxietyTechnique[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function toggleStepDone(step: AnxietyProtocolStep) {
    const reussite = !step.reussite
    await supabase
      .from(TABLES.anxietyProtocols)
      .update({ reussite, date_validation: reussite ? new Date().toISOString().slice(0, 10) : null })
      .eq('id', step.id)
    loadData()
  }

  async function addPalier() {
    if (!id || !newPalier.trim()) return
    const ordre = steps.length ? Math.max(...steps.map((s) => s.ordre)) + 1 : 1
    await supabase.from(TABLES.anxietyProtocols).insert({
      trigger_id: id,
      palier: newPalier.trim(),
      ordre,
    })
    setNewPalier('')
    loadData()
  }

  async function addTechnique() {
    if (!id || !newTechnique.trim()) return
    await supabase.from(TABLES.anxietyTechniques).insert({
      nom: newTechnique.trim(),
      trigger_id: id,
    })
    setNewTechnique('')
    loadData()
  }

  async function rateTechnique(tech: AnxietyTechnique, note: number) {
    await supabase.from(TABLES.anxietyTechniques).update({ efficacite_ressentie: note }).eq('id', tech.id)
    loadData()
  }

  async function toggleProtocol() {
    if (!trigger) return
    await supabase
      .from(TABLES.anxietyTriggers)
      .update({ protocole_active: !trigger.protocole_active })
      .eq('id', trigger.id)
    loadData()
  }

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>
  if (!trigger) return <p className="text-sm text-ink/50">Déclencheur introuvable.</p>

  const validated = steps.filter((s) => s.reussite).length

  return (
    <div className="space-y-6">
      <Link to="/anxiete" className="inline-flex items-center gap-1 text-sm text-ink/50">
        <ArrowLeft size={14} /> Anxiété
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-ink">{trigger.nom}</h2>
        <button
          onClick={() => setShowLogForm((v) => !v)}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
        >
          <Plus size={16} /> Épisode
        </button>
      </div>

      {showLogForm && (
        <LogEpisodeForm
          triggers={[trigger]}
          defaultTriggerId={trigger.id}
          onCancel={() => setShowLogForm(false)}
          onLogged={() => {
            setShowLogForm(false)
            loadData()
          }}
        />
      )}

      <div className="card">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={trigger.protocole_active} onChange={toggleProtocol} className="accent-moss" />
          Protocole de désensibilisation par paliers activé
        </label>
      </div>

      {trigger.protocole_active && (
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

          <ul className="space-y-2">
            {steps.map((s) => (
              <li key={s.id} className="card !py-3 flex items-start gap-3">
                <button onClick={() => toggleStepDone(s)} className="mt-0.5 shrink-0">
                  <PawPrint
                    size={20}
                    className={s.reussite ? 'text-moss' : 'text-line'}
                    fill={s.reussite ? 'currentColor' : 'none'}
                  />
                </button>
                <div>
                  <p className={`text-sm ${s.reussite ? 'text-ink/40 line-through' : 'text-ink'}`}>{s.palier}</p>
                  {s.date_validation && (
                    <p className="text-xs text-ink/30 font-mono mt-0.5">validé le {s.date_validation}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newPalier}
              onChange={(e) => setNewPalier(e.target.value)}
              placeholder="Nouveau palier..."
              className="flex-1 border border-line rounded-full px-4 py-2 text-sm bg-white"
            />
            <button onClick={addPalier} className="btn-primary text-sm px-4 py-2">
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display text-lg font-medium text-ink mb-2">Boîte à techniques</h3>
        <ul className="space-y-2">
          {techniques.map((t) => (
            <li key={t.id} className="card !py-3 flex items-center justify-between">
              <span className="text-sm text-ink">{t.nom}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => rateTechnique(t, n)}
                    className={`text-xs w-6 h-6 rounded-full border transition-colors ${
                      (t.efficacite_ressentie ?? 0) >= n
                        ? 'bg-amber text-white border-amber'
                        : 'border-line text-ink/30'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newTechnique}
            onChange={(e) => setNewTechnique(e.target.value)}
            placeholder="Nouvelle technique..."
            className="flex-1 border border-line rounded-full px-4 py-2 text-sm bg-white"
          />
          <button onClick={addTechnique} className="btn-primary text-sm px-4 py-2">
            Ajouter
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-medium text-ink mb-2">Historique des épisodes</h3>
        {logs.length === 0 && <p className="text-sm text-ink/50">Aucun épisode enregistré.</p>}
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="card !py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-mono text-xs text-ink/50">
                  {new Date(log.date).toLocaleDateString('fr-FR')}
                </span>
                <span className="text-rust font-medium">intensité {log.intensite ?? '—'}/5</span>
              </div>
              {log.reactions?.length > 0 && (
                <p className="text-xs text-ink/50 mt-1">{log.reactions.join(', ')}</p>
              )}
              {log.notes && <p className="text-xs text-ink/70 mt-1">{log.notes}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
