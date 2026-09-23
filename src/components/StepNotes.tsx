import { useState } from 'react'
import { Save } from 'lucide-react'

type Props = {
  initialNotes: string
  onSave: (notes: string) => Promise<void>
}

export default function StepNotes({ initialNotes, onSave }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(notes)
    setSaving(false)
  }

  return (
    <div className="flex gap-2 mt-1.5">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={1}
        placeholder="Notes..."
        className="flex-1 border border-line rounded-lg px-2 py-1 bg-white text-xs"
      />
      <button onClick={handleSave} disabled={saving} className="text-xs text-moss-dark shrink-0">
        <Save size={14} />
      </button>
    </div>
  )
}
