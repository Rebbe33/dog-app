import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'

type Profile = {
  id: string
  nom: string
  date_naissance: string | null
  race: string | null
  poids_actuel: number | null
  photo_url: string | null
  notes_generales: string | null
}

export default function Reglages() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [nom, setNom] = useState('')
  const [dateNaissance, setDateNaissance] = useState('')
  const [race, setRace] = useState('')
  const [poids, setPoids] = useState('')
  const [notes, setNotes] = useState('')

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from(TABLES.profile).select('*').limit(1).maybeSingle()
    if (data) {
      const p = data as Profile
      setProfile(p)
      setNom(p.nom ?? '')
      setDateNaissance(p.date_naissance ?? '')
      setRace(p.race ?? '')
      setPoids(p.poids_actuel?.toString() ?? '')
      setNotes(p.notes_generales ?? '')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim()) return
    setSaving(true)

    const payload = {
      nom: nom.trim(),
      date_naissance: dateNaissance || null,
      race: race.trim() || null,
      poids_actuel: poids ? Number(poids) : null,
      notes_generales: notes.trim() || null,
    }

    if (profile) {
      await supabase.from(TABLES.profile).update(payload).eq('id', profile.id)
    } else {
      await supabase.from(TABLES.profile).insert(payload)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    loadData()
  }

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-ink">Réglages</h2>

      {saved && (
        <p className="text-sm text-moss-dark bg-moss-light border border-moss rounded-xl px-3 py-2 flex items-center gap-2">
          <Check size={16} /> Profil enregistré !
        </p>
      )}

      <form onSubmit={handleSubmit} className="card space-y-3">
        <h3 className="font-display text-lg font-medium text-ink">Profil du chien</h3>

        <label className="block text-sm text-ink">
          Nom
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>

        <label className="block text-sm text-ink">
          Date de naissance
          <input
            type="date"
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>

        <label className="block text-sm text-ink">
          Race
          <input
            type="text"
            value={race}
            onChange={(e) => setRace(e.target.value)}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>

        <label className="block text-sm text-ink">
          Poids actuel (kg)
          <input
            type="number"
            step="0.1"
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>

        <label className="block text-sm text-ink">
          Notes générales
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
          />
        </label>

        <button type="submit" disabled={saving} className="btn-primary w-full py-2 text-sm">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      <div className="card">
        <h3 className="font-display text-lg font-medium text-ink mb-1">À propos</h3>
        <p className="text-sm text-ink/60">Vanya app — construite avec toi, pour Vanya 🐾</p>
      </div>
    </div>
  )
}
