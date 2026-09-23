import { PawPrint } from 'lucide-react'
import type { TrickStep } from '../lib/types'

type Props = {
  step: TrickStep
  onClick: () => void
  size?: number
}

/**
 * Un tap = bascule acquis / non acquis. Volontairement binaire (pas d'état
 * "en cours" intermédiaire) : cohérent avec le système acquis/non-acquis
 * utilisé en fin de séance d'entraînement.
 */
export default function StepPawIcon({ step, onClick, size = 20 }: Props) {
  return (
    <button onClick={onClick} className="mt-0.5 shrink-0">
      <PawPrint
        size={size}
        className={step.completed ? 'text-moss' : 'text-line'}
        fill={step.completed ? 'currentColor' : 'none'}
      />
    </button>
  )
}

/** Bascule simplement acquis <-> non acquis. */
export function nextStepStatus(step: Pick<TrickStep, 'completed' | 'en_cours'>) {
  return { completed: !step.completed, en_cours: false }
}
