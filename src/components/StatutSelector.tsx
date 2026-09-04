import type { TrickStatut } from '../lib/types'

type Props = {
  statut: TrickStatut
  onChange: (s: TrickStatut) => void
}

const OPTIONS: { value: TrickStatut; label: string }[] = [
  { value: 'non_appris', label: 'Non appris' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'appris', label: 'Appris' },
]

export default function StatutSelector({ statut, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 text-sm py-2 rounded-full border transition-colors ${
            statut === opt.value
              ? 'bg-moss text-white border-moss'
              : 'bg-white text-ink/60 border-line'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
