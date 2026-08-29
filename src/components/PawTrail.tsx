import { PawPrint } from 'lucide-react'

type Props = {
  /** Nombre total de traces à afficher */
  total: number
  /** Nombre de traces "remplies" (jours de streak, étapes validées...) */
  filled: number
  size?: number
}

/**
 * Signature visuelle de l'app : une piste de pattes qui se remplit,
 * utilisée à la place des barres de progression / checkbox génériques
 * pour les streaks et les progressions de paliers.
 */
export default function PawTrail({ total, filled, size = 18 }: Props) {
  const steps = Array.from({ length: total }, (_, i) => i < filled)
  return (
    <div className="flex flex-wrap gap-1">
      {steps.map((done, i) => (
        <PawPrint
          key={i}
          size={size}
          className={`pawstep ${done ? 'pawstep-done text-moss' : 'pawstep-todo text-line'}`}
          fill={done ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}
