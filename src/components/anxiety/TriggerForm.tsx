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
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h3 className="font-display text-lg font-medium text-ink">Nouveau déclencheur</h3>

      <label className="block text-sm text-ink">
        Nom
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="ex. orage, feu d'artifice..."
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

      <label className="block text-sm text-ink">
        Catégorie
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-ink">
        Intensité par défaut (1-5)
        <input
          type="number"
          min={1}
          max={5}
          value={intensiteDefaut}
          onChange={(e) => setIntensiteDefaut(Number(e.target.value))}
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={protocoleActive}
          onChange={(e) => setProtocoleActive(e.target.checked)}
          className="accent-moss"
        />
        Activer un protocole de désensibilisation par paliers
      </label>

      {error && <p className="text-sm text-rust">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex-1 py-2 text-sm"
        >
          {saving ? 'Création...' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary px-4 py-2 text-sm"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
