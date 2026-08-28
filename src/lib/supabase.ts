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
  weightLog: 'dog_weight_log',
  quickLogs: 'dog_quick_logs',
  streaks: 'dog_streaks',
  badges: 'dog_badges',
} as const
