import { useState } from 'react'
import { supabase, TABLES } from '../../lib/supabase'

type Props = {
  onCreated: () => void
  onCancel: () => void
}

export default function ActivityForm({ onCreated, onCancel }: Props) {
  const [nom, setNom] = useState('')
  const [materielInput, setMaterielInput] = useState('')
  const [temperatureMax, setTemperatureMax] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim()) return
    setSaving(true)
    setError(null)

    const materiel = materielInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)

    const { error: insertError } = await supabase.from(TABLES.activities).insert({
      nom: nom.trim(),
      materiel_requis: materiel,
      temperature_max_recommandee: temperatureMax ? Number(temperatureMax) : null,
    })

    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onCreated()
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-display text-lg font-medium text-ink">Nouvelle activité</h3>

      <label className="block text-sm text-ink">
        Nom
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="ex. paddle, VTT..."
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

      <label className="block text-sm text-ink">
        Matériel requis (séparé par des virgules)
        <input
          type="text"
          value={materielInput}
          onChange={(e) => setMaterielInput(e.target.value)}
          placeholder="ex. laisse longue, gilet de sécurité"
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

      <label className="block text-sm text-ink">
        Seuil de température max recommandé (°C, optionnel)
        <input
          type="number"
          value={temperatureMax}
          onChange={(e) => setTemperatureMax(e.target.value)}
          placeholder="ex. 15"
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

      {error && <p className="text-sm text-rust">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 text-sm">
          {saving ? 'Création...' : 'Créer'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2 text-sm">
          Annuler
        </button>
      </div>
    </form>
  )
}
