import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Plus } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { AnxietyTrigger, AnxietyLogEntry } from '../lib/types'
import LogEpisodeForm from '../components/anxiety/LogEpisodeForm'
import TriggerForm from '../components/anxiety/TriggerForm'
import PawTrail from '../components/PawTrail'

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function Anxiete() {
  const [triggers, setTriggers] = useState<AnxietyTrigger[]>([])
  const [recentLogs, setRecentLogs] = useState<AnxietyLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [showTriggerForm, setShowTriggerForm] = useState(false)

  async function loadData() {
    setLoading(true)
    const [triggersRes, logsRes] = await Promise.all([
      supabase.from(TABLES.anxietyTriggers).select('*').order('nom'),
      supabase
        .from(TABLES.anxietyLog)
        .select('*')
        .order('date', { ascending: false })
        .limit(30),
    ])
    if (triggersRes.data) setTriggers(triggersRes.data as AnxietyTrigger[])
    if (logsRes.data) setRecentLogs(logsRes.data as AnxietyLogEntry[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const lastEpisodeDate = recentLogs[0]?.date ?? null
  const joursSansCrise = daysSince(lastEpisodeDate)

  const chartData = [...recentLogs]
    .reverse()
    .map((log) => ({
      date: new Date(log.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      intensite: log.intensite ?? 0,
    }))

  if (loading) {
    return <p className="text-sm text-ink/50">Chargement...</p>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Anxiété</h2>
        <button
          onClick={() => setShowLogForm((v) => !v)}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
        >
          <Plus size={16} /> Épisode
        </button>
      </div>

      {showLogForm && (
        <LogEpisodeForm
          triggers={triggers}
          onCancel={() => setShowLogForm(false)}
          onLogged={() => {
            setShowLogForm(false)
            loadData()
          }}
        />
      )}

      <div className="card">
        <p className="text-sm text-ink/50 mb-2">Jours sans crise</p>
        <p className="font-display text-4xl font-semibold text-moss-dark">
          {joursSansCrise === null ? '—' : joursSansCrise}
        </p>
        <div className="mt-3">
          <PawTrail total={7} filled={joursSansCrise === null ? 0 : Math.min(joursSansCrise, 7)} />
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <p className="text-sm text-ink/50 mb-2">Intensité des derniers épisodes</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DAD3C5" />
                <XAxis dataKey="date" fontSize={11} stroke="#2B2A28" />
                <YAxis domain={[0, 5]} fontSize={11} width={20} stroke="#2B2A28" />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #DAD3C5', fontFamily: 'Inter' }} />
                <Line type="monotone" dataKey="intensite" stroke="#B5502B" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-medium text-ink">Déclencheurs</h3>
          <button
            onClick={() => setShowTriggerForm((v) => !v)}
            className="text-sm text-moss-dark font-medium"
          >
            + Ajouter
          </button>
        </div>

        {showTriggerForm && (
          <div className="mb-3">
            <TriggerForm
              onCancel={() => setShowTriggerForm(false)}
              onCreated={() => {
                setShowTriggerForm(false)
                loadData()
              }}
            />
          </div>
        )}

        {triggers.length === 0 && (
          <p className="text-sm text-ink/50">Aucun déclencheur enregistré pour l'instant.</p>
        )}

        <ul className="space-y-2">
          {triggers.map((t) => (
            <li key={t.id}>
              <Link to={`/anxiete/${t.id}`} className="card flex items-center justify-between !py-3">
                <div>
                  <p className="font-medium text-sm text-ink">{t.nom}</p>
                  <p className="text-xs text-ink/40 capitalize">{t.categorie}</p>
                </div>
                {t.protocole_active && (
                  <span className="tag tag-active">protocole actif</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
