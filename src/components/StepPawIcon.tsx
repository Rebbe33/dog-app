import { PawPrint } from 'lucide-react'
import type { TrickStep } from '../lib/types'

type Props = {
  step: TrickStep
  onClick: () => void
  size?: number
}

/**
 * Cycle à chaque tap : à faire -> en cours -> validé -> à faire.
 * "En cours" permet de garder en mémoire qu'une étape est en cours de
 * travail sans être encore réussie de façon fiable, plutôt que de
 * choisir uniquement entre "pas fait" et "validé".
 */
export default function StepPawIcon({ step, onClick, size = 20 }: Props) {
  const color = step.completed ? 'text-moss' : step.en_cours ? 'text-amber' : 'text-line'
  const filled = step.completed || step.en_cours

  return (
    <button onClick={onClick} className="mt-0.5 shrink-0">
      <PawPrint size={size} className={color} fill={filled ? 'currentColor' : 'none'} />
    </button>
  )
}

/** Calcule le prochain statut à appliquer (à faire -> en cours -> validé -> à faire). */
export function nextStepStatus(step: Pick<TrickStep, 'completed' | 'en_cours'>) {
  if (!step.en_cours && !step.completed) {
    return { en_cours: true, completed: false }
  }
  if (step.en_cours && !step.completed) {
    return { en_cours: false, completed: true }
  }
  return { en_cours: false, completed: false }
}
