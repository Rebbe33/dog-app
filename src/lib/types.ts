export type AnxietyTrigger = {
  id: string
  nom: string
  categorie: 'separation' | 'bruit' | 'social' | 'environnement' | null
  severite_de_base: number | null
  intensite_defaut: number | null
  duree_defaut: string | null
  protocole_active: boolean
  created_at: string
}

export type AnxietyLogEntry = {
  id: string
  trigger_id: string | null
  date: string
  intensite: number | null
  duree_crise: string | null
  reactions: string[]
  contexte: string | null
  technique_utilisee: string | null
  notes: string | null
}

export type AnxietyProtocolStep = {
  id: string
  trigger_id: string
  palier: string
  ordre: number
  date_validation: string | null
  niveau_stress_observe: number | null
  reussite: boolean | null
  notes: string | null
}

export type AnxietyTechnique = {
  id: string
  nom: string
  trigger_id: string | null
  efficacite_ressentie: number | null
  notes: string | null
}

export type TrickCategorie = 'tour' | 'autocontrole' | 'education_base' | 'activite'

export type Trick = {
  id: string
  nom: string
  categorie: TrickCategorie
  prioritaire: boolean
  tags: string[]
  created_at: string
}

export type TrickStep = {
  id: string
  trick_id: string
  ordre: number
  description: string
  completed: boolean
  date_completion: string | null
  notes: string | null
}

export type EducationLogEntry = {
  id: string
  date: string
  contexte: 'humains' | 'autres_chiens' | 'promenade' | 'maison' | 'autre' | null
  observation: string
  resultat: string | null
  notes: string | null
}

export const REACTION_TAGS = [
  'hurle',
  'tremble',
  'halète',
  'se cache',
  'destructeur',
  'aboie',
  'salive',
] as const
