import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { supabase, TABLES } from '../lib/supabase'
import type { AnxietyTrigger, AnxietyLogEntry } from '../lib/types'
import LogEpisodeForm from '../components/anxiety/LogEpisodeForm'
import TriggerForm from '../components/anxiety/TriggerForm'

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
    return <p className="text-sm text-gray-500">Chargement...</p>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Anxiété</h2>
        <button
          onClick={() => setShowLogForm((v) => !v)}
          className="text-sm bg-gray-900 text-white rounded px-3 py-1.5"
        >
          + Épisode
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

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-500">Jours sans crise</p>
        <p className="text-3xl font-semibold">
          {joursSansCrise === null ? '—' : joursSansCrise}
        </p>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-2">Intensité des derniers épisodes</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis domain={[0, 5]} fontSize={11} width={20} />
                <Tooltip />
                <Line type="monotone" dataKey="intensite" stroke="#1f2937" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Déclencheurs</h3>
          <button
            onClick={() => setShowTriggerForm((v) => !v)}
            className="text-sm text-gray-600 underline"
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
          <p className="text-sm text-gray-500">Aucun déclencheur enregistré pour l'instant.</p>
        )}

        <ul className="space-y-2">
          {triggers.map((t) => (
            <li key={t.id}>
              <Link
                to={`/anxiete/${t.id}`}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-sm">{t.nom}</p>
                  <p className="text-xs text-gray-500">{t.categorie}</p>
                </div>
                {t.protocole_active && (
                  <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">
                    protocole actif
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
