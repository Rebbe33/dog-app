import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { Trick, TrickStep } from '../lib/types'
import TrickForm from '../components/tricks/TrickForm'
import PawTrail from '../components/PawTrail'

export default function Autocontrole() {
  const [tricks, setTricks] = useState<Trick[]>([])
  const [stepCounts, setStepCounts] = useState<Record<string, { total: number; done: number }>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function loadData() {
    setLoading(true)
    const { data: tricksData } = await supabase
      .from(TABLES.tricks)
      .select('*')
      .eq('categorie', 'autocontrole')
      .order('prioritaire', { ascending: false })
      .order('nom')

    if (tricksData) {
      setTricks(tricksData as Trick[])
      const ids = tricksData.map((t) => t.id)
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
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(
    () => tricks.filter((t) => t.nom.toLowerCase().includes(search.toLowerCase())),
    [tricks, search],
  )

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Autocontrôle</h2>
        <span className="text-xs text-ink/40 font-mono">{tricks.length} exercices</span>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un exercice..."
          className="w-full border border-line rounded-full pl-9 pr-3 py-2 bg-white text-sm"
        />
      </div>

      <button onClick={() => setShowForm((v) => !v)} className="text-sm text-moss-dark font-medium">
        + Nouvel exercice
      </button>

      {showForm && (
        <TrickForm
          categorie="autocontrole"
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
              <Link to={`/autocontrole/${t.id}`} className="card !py-3 flex items-center justify-between">
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
        <p className="text-sm text-ink/50">Aucun exercice ne correspond à ta recherche.</p>
      )}
    </div>
  )
}
