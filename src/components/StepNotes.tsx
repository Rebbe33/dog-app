import { useEffect, useRef, useState } from 'react'
import { Save, Check, ChevronDown, ChevronRight } from 'lucide-react'

type Props = {
  initialNotes: string
  onSave: (notes: string) => Promise<void>
}

export default function StepNotes({ initialNotes, onSave }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Ajuste automatiquement la hauteur à ce qui est écrit, pas de petite
  // case qui déborde en scroll interne. Seulement utile une fois dépliée.
  useEffect(() => {
    if (!expanded) return
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [notes, expanded])

  async function handleSave() {
    setSaving(true)
    await onSave(notes)
    setSaving(false)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-ink/50 w-full text-left"
      >
        {expanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
        <span className="shrink-0">Notes</span>
        {!expanded && notes && (
          <span className="text-ink/40 truncate min-w-0">— {notes}</span>
        )}
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-1.5">
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notes..."
            className="w-full border border-line rounded-xl px-3 py-2 bg-white text-sm resize-none overflow-hidden"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 ml-auto"
          >
            {justSaved ? <Check size={13} /> : <Save size={13} />}
            {saving ? 'Enregistrement...' : justSaved ? 'Enregistré' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}
