import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Thermometer } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { DogActivity } from '../lib/types'
import ActivityForm from '../components/activities/ActivityForm'

export default function Activites() {
  const [activities, setActivities] = useState<DogActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from(TABLES.activities).select('*').order('nom')
    if (data) setActivities(data as DogActivity[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Activités sportives</h2>
        <span className="text-xs text-ink/40 font-mono">{activities.length}</span>
      </div>

      <button onClick={() => setShowForm((v) => !v)} className="text-sm text-moss-dark font-medium">
        + Nouvelle activité
      </button>

      {showForm && (
        <ActivityForm
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false)
            loadData()
          }}
        />
      )}

      <ul className="space-y-2">
        {activities.map((a) => (
          <li key={a.id}>
            <Link to={`/activites/${a.id}`} className="card !py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-ink">{a.nom}</p>
                {a.materiel_requis?.length > 0 && (
                  <p className="text-xs text-ink/40 mt-0.5">{a.materiel_requis.join(', ')}</p>
                )}
              </div>
              {a.temperature_max_recommandee !== null && (
                <span className="flex items-center gap-1 text-xs text-ink/50 font-mono">
                  <Thermometer size={12} /> {a.temperature_max_recommandee}°C max
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {activities.length === 0 && (
        <p className="text-sm text-ink/50">Aucune activité pour l'instant.</p>
      )}
    </div>
  )
}
