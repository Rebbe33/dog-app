import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis (voir .env.example)')
}

// Même projet Supabase que gite-app : les tables sont préfixées dog_
// pour éviter tout conflit de nommage avec les tables existantes.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const TABLES = {
  profile: 'dog_profile',
  tricks: 'dog_tricks',
  trickSteps: 'dog_trick_steps',
  anxietyTriggers: 'dog_anxiety_triggers',
  anxietyLog: 'dog_anxiety_log',
  anxietyProtocols: 'dog_anxiety_protocols',
  anxietyTechniques: 'dog_anxiety_techniques',
  educationLog: 'dog_education_log',
  activities: 'dog_activities',
  activitySessions: 'dog_activity_sessions',
  healthEvents: 'dog_health_events',
  healthReminders: 'dog_health_reminders',
  healthChecklist: 'dog_health_checklist',
  weightLog: 'dog_weight_log',
  quickLogs: 'dog_quick_logs',
  streaks: 'dog_streaks',
  badges: 'dog_badges',
} as const

/**
 * Récupère TOUTES les lignes d'une table en paginant par tranches de 1000.
 * Nécessaire car Supabase impose une limite de lignes par requête côté
 * serveur (souvent 1000) que le `.limit()` du client ne peut pas dépasser :
 * demander plus ne change rien, les lignes au-delà sont juste tronquées,
 * silencieusement et dans un ordre non garanti.
 */
export async function fetchAllRows<T>(table: string, pageSize = 1000): Promise<T[]> {
  let all: T[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabase.from(table).select('*').range(from, from + pageSize - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    all = all.concat(data as T[])
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}
