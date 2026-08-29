import { useState } from 'react'
import { supabase, TABLES } from '../../lib/supabase'
import type { TrickCategorie } from '../../lib/types'

type Props = {
  categorie: TrickCategorie
  onCreated: () => void
  onCancel: () => void
}

export default function TrickForm({ categorie, onCreated, onCancel }: Props) {
  const [nom, setNom] = useState('')
  const [prioritaire, setPrioritaire] = useState(false)
  const [educationBase, setEducationBase] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim()) return
    setSaving(true)
    setError(null)

    const tags = educationBase ? ['education_base'] : []

    const { error: insertError } = await supabase.from(TABLES.tricks).insert({
      nom: nom.trim(),
      categorie,
      prioritaire,
      tags,
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
      <h3 className="font-display text-lg font-medium text-ink">Nouveau tour</h3>

      <label className="block text-sm text-ink">
        Nom
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="ex. Reste, Roule..."
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={prioritaire} onChange={(e) => setPrioritaire(e.target.checked)} className="accent-amber" />
        Prioritaire (badge dédié)
      </label>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={educationBase} onChange={(e) => setEducationBase(e.target.checked)} className="accent-moss" />
        Recoupe aussi l'éducation de base
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
