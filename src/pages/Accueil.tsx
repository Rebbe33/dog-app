import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, HeartPulse, MountainSnow, Zap, Compass } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { HealthReminder, AnxietyLogEntry, ActivitySession, DogActivity } from '../lib/types'

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function Accueil() {
  const [reminders, setReminders] = useState<HealthReminder[]>([])
  const [lastAnxietyLog, setLastAnxietyLog] = useState<AnxietyLogEntry | null>(null)
  const [lastSession, setLastSession] = useState<(ActivitySession & { activity?: DogActivity }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [remindersRes, anxietyRes, sessionRes] = await Promise.all([
        supabase
          .from(TABLES.healthReminders)
          .select('*')
          .eq('actif', true)
          .not('date_prochain_rappel', 'is', null)
          .order('date_prochain_rappel')
          .limit(5),
        supabase.from(TABLES.anxietyLog).select('*').order('date', { ascending: false }).limit(1).maybeSingle(),
        supabase
          .from(TABLES.activitySessions)
          .select('*, activity:dog_activities(*)')
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])
      if (remindersRes.data) setReminders(remindersRes.data as HealthReminder[])
      if (anxietyRes.data) setLastAnxietyLog(anxietyRes.data as AnxietyLogEntry)
      if (sessionRes.data) setLastSession(sessionRes.data as ActivitySession & { activity?: DogActivity })
      setLoading(false)
    }
    load()
  }, [])

  const joursSansCrise = daysSince(lastAnxietyLog?.date ?? null)

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-ink">Bonjour !</h2>

      <Link to="/suggestions" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
        <Compass size={18} /> Que faire maintenant ?
      </Link>

      <Link
        to="/rapide"
        className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 !bg-white"
      >
        <Zap size={16} /> Mode rapide
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-ink/50 flex items-center gap-1 mb-1">
            <HeartPulse size={13} /> Jours sans crise
          </p>
          <p className="font-display text-2xl font-semibold text-moss-dark">
            {joursSansCrise === null ? '—' : joursSansCrise}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-ink/50 flex items-center gap-1 mb-1">
            <MountainSnow size={13} /> Dernière activité
          </p>
          {lastSession ? (
            <>
              <p className="text-sm font-medium text-ink">{lastSession.activity?.nom ?? '—'}</p>
              <p className="text-xs text-ink/40 font-mono">
                {new Date(lastSession.date).toLocaleDateString('fr-FR')}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink/40">Aucune séance</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-medium text-ink mb-2 flex items-center gap-1">
          <Bell size={16} /> Rappels à venir
        </h3>
        {reminders.length === 0 && <p className="text-sm text-ink/50">Aucun rappel actif.</p>}
        <ul className="space-y-2">
          {reminders.map((r) => {
            const days = daysUntil(r.date_prochain_rappel)
            const overdue = days !== null && days < 0
            return (
              <li key={r.id} className="card !py-3 flex items-center justify-between">
                <span className="text-sm text-ink capitalize">{r.type.replace('_', ' ')}</span>
                <span className={`text-xs font-mono ${overdue ? 'text-rust' : 'text-ink/50'}`}>
                  {r.date_prochain_rappel}
                  {days !== null && ` (${overdue ? `en retard de ${Math.abs(days)}j` : `dans ${days}j`})`}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
