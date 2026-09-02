import { useState } from 'react'
import { Check, PawPrint, ShieldCheck, HeartPulse, Users, MountainSnow, Stethoscope, MoreHorizontal } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'

const CATEGORIES = [
  { value: 'tour', label: 'Tour', icon: PawPrint },
  { value: 'autocontrole', label: 'Autocontrôle', icon: ShieldCheck },
  { value: 'anxiete', label: 'Anxiété', icon: HeartPulse },
  { value: 'education', label: 'Éducation', icon: Users },
  { value: 'activite', label: 'Activité', icon: MountainSnow },
  { value: 'sante', label: 'Santé', icon: Stethoscope },
  { value: 'autre', label: 'Autre', icon: MoreHorizontal },
]

export default function ModeRapide() {
  const [selected, setSelected] = useState<string | null>(null)
  const [texte, setTexte] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmation, setConfirmation] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setSaving(true)
    await supabase.from(TABLES.quickLogs).insert({
      date: new Date().toISOString(),
      type_rapide: selected,
      texte_libre: texte || null,
    })
    setSaving(false)
    setTexte('')
    setSelected(null)
    setConfirmation(true)
    setTimeout(() => setConfirmation(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-ink">Mode rapide</h2>
      <p className="text-sm text-ink/60">
        Note en 2-3 taps, où que tu sois — tu pourras reclasser plus tard si besoin.
      </p>

      {confirmation && (
        <p className="text-sm text-moss-dark bg-moss-light border border-moss rounded-xl px-3 py-2 flex items-center gap-2">
          <Check size={16} /> Enregistré !
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          const active = selected === c.value
          return (
            <button
              key={c.value}
              onClick={() => setSelected(c.value)}
              className={`card !py-4 flex flex-col items-center gap-1.5 text-xs ${
                active ? 'ring-2 ring-moss' : ''
              }`}
            >
              <Icon size={22} className={active ? 'text-moss-dark' : 'text-ink/50'} />
              <span className={active ? 'text-moss-dark font-medium' : 'text-ink/60'}>{c.label}</span>
            </button>
          )
        })}
      </div>

      {selected && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={2}
            autoFocus
            placeholder="Note rapide (optionnel)..."
            className="w-full border border-line rounded-xl px-3 py-2 bg-white text-sm"
          />
          <button type="submit" disabled={saving} className="btn-primary w-full py-2 text-sm">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      )}
    </div>
  )
}
