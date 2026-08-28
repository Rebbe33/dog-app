import { useState } from 'react'
import { supabase, TABLES } from '../../lib/supabase'

type Props = {
  onCreated: () => void
  onCancel: () => void
}

const CATEGORIES = [
  { value: 'separation', label: 'Séparation' },
  { value: 'bruit', label: 'Bruit' },
  { value: 'social', label: 'Social' },
  { value: 'environnement', label: 'Environnement' },
]

export default function TriggerForm({ onCreated, onCancel }: Props) {
  const [nom, setNom] = useState('')
  const [categorie, setCategorie] = useState('separation')
  const [intensiteDefaut, setIntensiteDefaut] = useState(3)
  const [protocoleActive, setProtocoleActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim()) return
    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from(TABLES.anxietyTriggers).insert({
      nom: nom.trim(),
      categorie,
      intensite_defaut: intensiteDefaut,
      protocole_active: protocoleActive,
    })

    setSaving(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    onCreated()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium">Nouveau déclencheur</h3>

      <label className="block text-sm">
        Nom
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="ex. orage, feu d'artifice..."
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
        />
      </label>

      <label className="block text-sm">
        Catégorie
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        Intensité par défaut (1-5)
        <input
          type="number"
          min={1}
          max={5}
          value={intensiteDefaut}
          onChange={(e) => setIntensiteDefaut(Number(e.target.value))}
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={protocoleActive}
          onChange={(e) => setProtocoleActive(e.target.checked)}
        />
        Activer un protocole de désensibilisation par paliers
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gray-900 text-white rounded py-2 text-sm disabled:opacity-50"
        >
          {saving ? 'Création...' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
