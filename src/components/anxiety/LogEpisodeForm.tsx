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
    <form onSubmit={handleSubmit} className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium">Nouvel épisode</h3>

      <label className="block text-sm">
        Déclencheur
        <select
          value={triggerId}
          onChange={(e) => handleTriggerChange(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
        >
          {triggers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className="block text-sm flex-1">
          Intensité (1-5)
          <input
            type="number"
            min={1}
            max={5}
            value={intensite}
            onChange={(e) => setIntensite(Number(e.target.value))}
            className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
          />
        </label>
        <label className="block text-sm flex-1">
          Durée (minutes)
          <input
            type="number"
            min={0}
            value={dureeMinutes}
            onChange={(e) => setDureeMinutes(Number(e.target.value))}
            className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
          />
        </label>
      </div>

      <div>
        <span className="block text-sm mb-1">Réactions observées</span>
        <div className="flex flex-wrap gap-2">
          {REACTION_TAGS.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => toggleReaction(tag)}
              className={`text-xs px-2 py-1 rounded-full border ${
                reactions.includes(tag)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        Contexte
        <input
          type="text"
          value={contexte}
          onChange={(e) => setContexte(e.target.value)}
          placeholder="ex. seule à la maison, en promenade..."
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
        />
      </label>

      <label className="block text-sm">
        Technique utilisée
        <input
          type="text"
          value={techniqueUtilisee}
          onChange={(e) => setTechniqueUtilisee(e.target.value)}
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
        />
      </label>

      <label className="block text-sm">
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full border border-gray-300 rounded px-2 py-1.5"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || !triggerId}
          className="flex-1 bg-gray-900 text-white rounded py-2 text-sm disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
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
