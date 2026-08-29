import { useState } from 'react'
import { supabase, TABLES } from '../../lib/supabase'
import type { AnxietyTrigger } from '../../lib/types'
import { REACTION_TAGS } from '../../lib/types'

type Props = {
  triggers: AnxietyTrigger[]
  defaultTriggerId?: string
  onLogged: () => void
  onCancel: () => void
}

export default function LogEpisodeForm({ triggers, defaultTriggerId, onLogged, onCancel }: Props) {
  const [triggerId, setTriggerId] = useState(defaultTriggerId ?? triggers[0]?.id ?? '')
  const selectedTrigger = triggers.find((t) => t.id === triggerId)

  const [intensite, setIntensite] = useState<number>(selectedTrigger?.intensite_defaut ?? 3)
  const [dureeMinutes, setDureeMinutes] = useState<number>(10)
  const [reactions, setReactions] = useState<string[]>([])
  const [contexte, setContexte] = useState('')
  const [techniqueUtilisee, setTechniqueUtilisee] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleTriggerChange(id: string) {
    setTriggerId(id)
    const t = triggers.find((tr) => tr.id === id)
    if (t?.intensite_defaut) setIntensite(t.intensite_defaut)
  }

  function toggleReaction(tag: string) {
    setReactions((prev) => (prev.includes(tag) ? prev.filter((r) => r !== tag) : [...prev, tag]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from(TABLES.anxietyLog).insert({
      trigger_id: triggerId || null,
      date: new Date().toISOString(),
      intensite,
      duree_crise: `${dureeMinutes} minutes`,
      reactions,
      contexte: contexte || null,
      technique_utilisee: techniqueUtilisee || null,
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
      <h3 className="font-display text-lg font-medium text-ink">Nouvel épisode</h3>

      <label className="block text-sm text-ink">
        Déclencheur
        <select
          value={triggerId}
          onChange={(e) => handleTriggerChange(e.target.value)}
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        >
          {triggers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className="block text-sm flex-1 text-ink">
          Intensité (1-5)
          <input
            type="number"
            min={1}
            max={5}
            value={intensite}
            onChange={(e) => setIntensite(Number(e.target.value))}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>
        <label className="block text-sm flex-1 text-ink">
          Durée (minutes)
          <input
            type="number"
            min={0}
            value={dureeMinutes}
            onChange={(e) => setDureeMinutes(Number(e.target.value))}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>
      </div>

      <div>
        <span className="block text-sm text-ink mb-1">Réactions observées</span>
        <div className="flex flex-wrap gap-2">
          {REACTION_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleReaction(tag)}
              className={`tag ${reactions.includes(tag) ? 'tag-active' : 'text-ink/60'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm text-ink">
        Contexte
        <input
          type="text"
          value={contexte}
          onChange={(e) => setContexte(e.target.value)}
          placeholder="ex. seule à la maison, en promenade..."
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

      <label className="block text-sm text-ink">
        Technique utilisée
        <input
          type="text"
          value={techniqueUtilisee}
          onChange={(e) => setTechniqueUtilisee(e.target.value)}
          className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
        />
      </label>

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
        <button
          type="submit"
          disabled={saving || !triggerId}
          className="btn-primary flex-1 py-2 text-sm"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
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
