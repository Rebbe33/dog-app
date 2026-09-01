import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { Trick, TrickStep, EducationLogEntry } from '../lib/types'
import TrickForm from '../components/tricks/TrickForm'
import PawTrail from '../components/PawTrail'

const CONTEXTES = [
  { value: 'humains', label: 'Humains' },
  { value: 'autres_chiens', label: 'Autres chiens' },
  { value: 'promenade', label: 'Promenade' },
  { value: 'maison', label: 'Maison' },
  { value: 'autre', label: 'Autre' },
]

export default function EducationBase() {
  const [tricks, setTricks] = useState<Trick[]>([])
  const [stepCounts, setStepCounts] = useState<Record<string, { total: number; done: number }>>({})
  const [logs, setLogs] = useState<EducationLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showLogForm, setShowLogForm] = useState(false)

  const [contexte, setContexte] = useState('humains')
  const [observation, setObservation] = useState('')
  const [resultat, setResultat] = useState('')
  const [savingLog, setSavingLog] = useState(false)

  async function loadData() {
    setLoading(true)
    const [tricksRes, logsRes] = await Promise.all([
      supabase
        .from(TABLES.tricks)
        .select('*')
        .eq('categorie', 'education_base')
        .order('prioritaire', { ascending: false })
        .order('nom'),
      supabase.from(TABLES.educationLog).select('*').order('date', { ascending: false }).limit(20),
    ])

    if (tricksRes.data) {
      setTricks(tricksRes.data as Trick[])
      const ids = tricksRes.data.map((t) => t.id)
      if (ids.length > 0) {
        const { data: stepsData } = await supabase
          .from(TABLES.trickSteps)
          .select('trick_id, completed')
          .in('trick_id', ids)
        const counts: Record<string, { total: number; done: number }> = {}
        ;(stepsData as Pick<TrickStep, 'trick_id' | 'completed'>[] | null)?.forEach((s) => {
          if (!counts[s.trick_id]) counts[s.trick_id] = { total: 0, done: 0 }
          counts[s.trick_id].total += 1
          if (s.completed) counts[s.trick_id].done += 1
        })
        setStepCounts(counts)
      }
    }
    if (logsRes.data) setLogs(logsRes.data as EducationLogEntry[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(
    () => tricks.filter((t) => t.nom.toLowerCase().includes(search.toLowerCase())),
    [tricks, search],
  )

  async function submitLog(e: React.FormEvent) {
    e.preventDefault()
    if (!observation.trim()) return
    setSavingLog(true)
    await supabase.from(TABLES.educationLog).insert({
      date: new Date().toISOString(),
      contexte,
      observation: observation.trim(),
      resultat: resultat.trim() || null,
    })
    setSavingLog(false)
    setObservation('')
    setResultat('')
    setShowLogForm(false)
    loadData()
  }

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Éducation de base</h2>
        <span className="text-xs text-ink/40 font-mono">{tricks.length} compétences</span>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une compétence..."
          className="w-full border border-line rounded-full pl-9 pr-3 py-2 bg-white text-sm"
        />
      </div>

      <button onClick={() => setShowForm((v) => !v)} className="text-sm text-moss-dark font-medium">
        + Nouvelle compétence
      </button>

      {showForm && (
        <TrickForm
          categorie="education_base"
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            loadData()
          }}
        />
      )}

      <ul className="space-y-2">
        {filtered.map((t) => {
          const counts = stepCounts[t.id]
          return (
            <li key={t.id}>
              <Link to={`/education/${t.id}`} className="card !py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {t.prioritaire && <Star size={14} className="text-amber fill-amber" />}
                    <p className="font-medium text-sm text-ink">{t.nom}</p>
                  </div>
                  {t.tags?.length > 0 && (
                    <p className="text-xs text-ink/40 mt-0.5">{t.tags.join(', ')}</p>
                  )}
                </div>
                {counts && counts.total > 0 ? (
                  <PawTrail total={counts.total} filled={counts.done} size={12} />
                ) : (
                  <span className="text-xs text-ink/30">pas d'étapes</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="text-sm text-ink/50">Aucune compétence ne correspond à ta recherche.</p>
      )}

      <div className="pt-2 border-t border-line">
        <div className="flex items-center justify-between mb-3 mt-4">
          <h3 className="font-display text-lg font-medium text-ink">Journal libre</h3>
          <button onClick={() => setShowLogForm((v) => !v)} className="text-sm text-moss-dark font-medium">
            + Note
          </button>
        </div>

        {showLogForm && (
          <form onSubmit={submitLog} className="card space-y-3 mb-3">
            <label className="block text-sm text-ink">
              Contexte
              <select
                value={contexte}
                onChange={(e) => setContexte(e.target.value)}
                className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
              >
                {CONTEXTES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-ink">
              Observation
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={2}
                placeholder="ex. a bien géré le croisement avec un chien inconnu"
                className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
              />
            </label>
            <label className="block text-sm text-ink">
              Résultat (optionnel)
              <input
                type="text"
                value={resultat}
                onChange={(e) => setResultat(e.target.value)}
                className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
              />
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={savingLog} className="btn-primary flex-1 py-2 text-sm">
                {savingLog ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowLogForm(false)} className="btn-secondary px-4 py-2 text-sm">
                Annuler
              </button>
            </div>
          </form>
        )}

        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="card !py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-mono text-xs text-ink/50">
                  {new Date(log.date).toLocaleDateString('fr-FR')}
                </span>
                <span className="tag text-ink/60 capitalize">{log.contexte?.replace('_', ' ')}</span>
              </div>
              <p className="text-ink mt-1">{log.observation}</p>
              {log.resultat && <p className="text-xs text-ink/60 mt-1">{log.resultat}</p>}
            </li>
          ))}
        </ul>

        {logs.length === 0 && (
          <p className="text-sm text-ink/50">Aucune note pour l'instant.</p>
        )}
      </div>
    </div>
  )
}
