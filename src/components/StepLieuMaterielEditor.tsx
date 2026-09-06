import { LIEU_OPTIONS, MATERIEL_OPTIONS } from '../lib/constants'

type Props = {
  lieu: string
  materiel: string[]
  onChangeLieu: (lieu: string) => void
  onToggleMateriel: (tag: string) => void
}

export default function StepLieuMaterielEditor({ lieu, materiel, onChangeLieu, onToggleMateriel }: Props) {
  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex gap-1">
        {LIEU_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChangeLieu(opt.value)}
            className={`text-[11px] px-2 py-0.5 rounded-full border ${
              lieu === opt.value ? 'bg-moss text-white border-moss' : 'bg-white text-ink/50 border-line'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {MATERIEL_OPTIONS.map((tag) => (
          <button
            key={tag}
            onClick={() => onToggleMateriel(tag)}
            className={`text-[11px] px-2 py-0.5 rounded-full border ${
              materiel.includes(tag) ? 'bg-amber text-white border-amber' : 'bg-white text-ink/50 border-line'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
