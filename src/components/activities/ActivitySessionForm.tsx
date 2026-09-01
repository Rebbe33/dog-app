import { useState } from 'react'
import { supabase, TABLES } from '../../lib/supabase'
import type { DogActivity } from '../../lib/types'

type Props = {
  activity: DogActivity
  onLogged: () => void
  onCancel: () => void
}

const ETAT_TAGS = ['en forme', 'fatiguée', 'excitée', 'enthousiaste', 'boiterie']

export default function ActivitySessionForm({ activity, onLogged, onCancel }: Props) {
  const [dureeMinutes, setDureeMinutes] = useState<number>(30)
  const [distance, setDistance] = useState<string>('')
  const [temperature, setTemperature] = useState<string>('')
  const [condition, setCondition] = useState('')
  const [etatAvant, setEtatAvant] = useState<string[]>([])
  const [etatApres, setEtatApres] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tempValue = temperature ? Number(temperature) : null
  const showWeatherAlert =
    tempValue !== null &&
    activity.temperature_max_recommandee !== null &&
    tempValue > activity.temperature_max_recommandee

  function toggle(list: string[], setList: (v: string[]) => void, tag: string) {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from(TABLES.activitySessions).insert({
      activity_id: activity.id,
      date: new Date().toISOString(),
      duree: `${dureeMinutes} minutes`,
      distance: distance ? Number(distance) : null,
      meteo_temperature: tempValue,
      meteo_condition: condition || null,
      etat_avant: etatAvant,
      etat_apres: etatApres,
      notes: notes || null,
    })

    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onLogged()
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-display text-lg font-medium text-ink">Nouvelle séance</h3>

      <div className="flex gap-3">
        <label className="block text-sm flex-1 text-ink">
          Durée (minutes)
          <input
            type="number"
            value={dureeMinutes}
            onChange={(e) => setDureeMinutes(Number(e.target.value))}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>
        <label className="block text-sm flex-1 text-ink">
          Distance (km)
          <input
            type="number"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <label className="block text-sm flex-1 text-ink">
          Température (°C)
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>
        <label className="block text-sm flex-1 text-ink">
          Météo
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="ensoleillé..."
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>
      </div>

      {showWeatherAlert && (
        <p className="text-sm text-rust bg-amber-light/40 border border-amber rounded-xl px-3 py-2">
          ⚠️ Température au-dessus du seuil recommandé ({activity.temperature_max_recommandee}°C) pour {activity.nom}.
        </p>
      )}

      <div>
        <span className="block text-sm text-ink mb-1">État avant</span>
        <div className="flex flex-wrap gap-2">
          {ETAT_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggle(etatAvant, setEtatAvant, tag)}
              className={`tag ${etatAvant.includes(tag) ? 'tag-active' : 'text-ink/60'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm text-ink mb-1">État après</span>
        <div className="flex flex-wrap gap-2">
          {ETAT_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggle(etatApres, setEtatApres, tag)}
              className={`tag ${etatApres.includes(tag) ? 'tag-active' : 'text-ink/60'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm text-ink">
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

      {error && <p className="text-sm text-rust">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 text-sm">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2 text-sm">
          Annuler
        </button>
      </div>
    </form>
  )
}
