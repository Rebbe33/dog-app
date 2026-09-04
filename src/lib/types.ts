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

export type TrickStatut = 'non_appris' | 'en_cours' | 'appris'

export type Trick = {
  id: string
  nom: string
  categorie: TrickCategorie
  prioritaire: boolean
  tags: string[]
  prerequis: string[]
  statut: TrickStatut
  created_at: string
}

export type TrickStep = {
  id: string
  trick_id: string
  ordre: number
  description: string
  completed: boolean
  en_cours: boolean
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

export type DogActivity = {
  id: string
  nom: string
  materiel_requis: string[]
  niveau_actuel: string | null
  temperature_max_recommandee: number | null
  objectif_progressif_active: boolean
  trick_id: string | null
  created_at: string
}

export type ActivitySession = {
  id: string
  activity_id: string
  date: string
  duree: string | null
  distance: number | null
  meteo_temperature: number | null
  meteo_condition: string | null
  etat_avant: string[]
  etat_apres: string[]
  notes: string | null
}

export const HEALTH_EVENT_TYPES = [
  { value: 'vaccin', label: 'Vaccin' },
  { value: 'vermifuge', label: 'Vermifuge' },
  { value: 'antiparasitaire', label: 'Antiparasitaire' },
  { value: 'visite_veterinaire', label: 'Visite vétérinaire' },
  { value: 'toilettage_bain', label: 'Bain' },
  { value: 'toilettage_griffes', label: 'Griffes' },
  { value: 'toilettage_brossage', label: 'Brossage' },
  { value: 'autre', label: 'Autre' },
] as const

export type HealthEventType = typeof HEALTH_EVENT_TYPES[number]['value']

export type HealthEvent = {
  id: string
  type: HealthEventType
  date: string
  notes: string | null
  piece_jointe_url: string | null
  created_at: string
}

export type HealthReminder = {
  id: string
  type: string
  frequence_jours: number | null
  date_prochain_rappel: string | null
  actif: boolean
  created_at: string
}

export type WeightEntry = {
  id: string
  date: string
  poids_kg: number
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
