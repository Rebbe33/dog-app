import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Plus, Bell, Scale } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { HealthEvent, HealthReminder, WeightEntry } from '../lib/types'
import { HEALTH_EVENT_TYPES } from '../lib/types'

export default function Sante() {
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [reminders, setReminders] = useState<HealthReminder[]>([])
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [showEventForm, setShowEventForm] = useState(false)
  const [eventType, setEventType] = useState('vaccin')
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [eventNotes, setEventNotes] = useState('')
  const [savingEvent, setSavingEvent] = useState(false)

  const [showWeightForm, setShowWeightForm] = useState(false)
  const [weightValue, setWeightValue] = useState('')
  const [savingWeight, setSavingWeight] = useState(false)

  const [showReminderForm, setShowReminderForm] = useState(false)
  const [reminderType, setReminderType] = useState('vermifuge')
  const [reminderFreq, setReminderFreq] = useState('90')
  const [savingReminder, setSavingReminder] = useState(false)

  async function loadData() {
    setLoading(true)
    const [eventsRes, remindersRes, weightsRes] = await Promise.all([
      supabase.from(TABLES.healthEvents).select('*').order('date', { ascending: false }).limit(30),
      supabase.from(TABLES.healthReminders).select('*').eq('actif', true).order('date_prochain_rappel'),
      supabase.from(TABLES.weightLog).select('*').order('date', { ascending: true }).limit(60),
    ])
    if (eventsRes.data) setEvents(eventsRes.data as HealthEvent[])
    if (remindersRes.data) setReminders(remindersRes.data as HealthReminder[])
    if (weightsRes.data) setWeights(weightsRes.data as WeightEntry[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function submitEvent(e: React.FormEvent) {
    e.preventDefault()
    setSavingEvent(true)

    await supabase.from(TABLES.healthEvents).insert({
      type: eventType,
      date: eventDate,
      notes: eventNotes || null,
    })

    // Recalcule automatiquement le rappel correspondant, s'il existe
    const matchingReminder = reminders.find((r) => r.type === eventType && r.frequence_jours)
    if (matchingReminder && matchingReminder.frequence_jours) {
      const nextDate = new Date(eventDate)
      nextDate.setDate(nextDate.getDate() + matchingReminder.frequence_jours)
      await supabase
        .from(TABLES.healthReminders)
        .update({ date_prochain_rappel: nextDate.toISOString().slice(0, 10) })
        .eq('id', matchingReminder.id)
    }

    setSavingEvent(false)
    setEventNotes('')
    setShowEventForm(false)
    loadData()
  }

  async function submitWeight(e: React.FormEvent) {
    e.preventDefault()
    if (!weightValue) return
    setSavingWeight(true)
    await supabase.from(TABLES.weightLog).insert({
      date: new Date().toISOString().slice(0, 10),
      poids_kg: Number(weightValue),
    })
    setSavingWeight(false)
    setWeightValue('')
    setShowWeightForm(false)
    loadData()
  }

  async function submitReminder(e: React.FormEvent) {
    e.preventDefault()
    setSavingReminder(true)
    const freq = Number(reminderFreq)
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + freq)
    await supabase.from(TABLES.healthReminders).insert({
      type: reminderType,
      frequence_jours: freq,
      date_prochain_rappel: nextDate.toISOString().slice(0, 10),
      actif: true,
    })
    setSavingReminder(false)
    setShowReminderForm(false)
    loadData()
  }

  async function deactivateReminder(id: string) {
    await supabase.from(TABLES.healthReminders).update({ actif: false }).eq('id', id)
    loadData()
  }

  const chartData = weights.map((w) => ({
    date: new Date(w.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    poids: w.poids_kg,
  }))

  const labelFor = (type: string) => HEALTH_EVENT_TYPES.find((t) => t.value === type)?.label ?? type

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-ink">Santé & entretien</h2>

      {/* Poids */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-ink/50 flex items-center gap-1"><Scale size={14} /> Poids</p>
          <button onClick={() => setShowWeightForm((v) => !v)} className="text-sm text-moss-dark font-medium">
            + Ajouter
          </button>
        </div>

        {showWeightForm && (
          <form onSubmit={submitWeight} className="flex gap-2 mb-3">
            <input
              type="number"
              step="0.1"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              placeholder="kg"
              className="flex-1 border border-line rounded-xl px-3 py-2 bg-white text-sm"
            />
            <button type="submit" disabled={savingWeight} className="btn-primary px-4 py-2 text-sm">
              {savingWeight ? '...' : 'Enregistrer'}
            </button>
          </form>
        )}

        {chartData.length > 0 ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DAD3C5" />
                <XAxis dataKey="date" fontSize={11} stroke="#2B2A28" />
                <YAxis fontSize={11} width={30} stroke="#2B2A28" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #DAD3C5', fontFamily: 'Inter' }} />
                <Line type="monotone" dataKey="poids" stroke="#4A6B4E" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-ink/50">Aucune pesée enregistrée.</p>
        )}
      </div>

      {/* Rappels */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg font-medium text-ink flex items-center gap-1">
            <Bell size={16} /> Rappels
          </h3>
          <button onClick={() => setShowReminderForm((v) => !v)} className="text-sm text-moss-dark font-medium">
            + Rappel
          </button>
        </div>

        {showReminderForm && (
          <form onSubmit={submitReminder} className="card space-y-3 mb-3">
            <label className="block text-sm text-ink">
              Type
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value)}
                className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
              >
                {HEALTH_EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-ink">
              Fréquence (jours)
              <input
                type="number"
                value={reminderFreq}
                onChange={(e) => setReminderFreq(e.target.value)}
                className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
              />
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={savingReminder} className="btn-primary flex-1 py-2 text-sm">
                {savingReminder ? '...' : 'Créer'}
              </button>
              <button type="button" onClick={() => setShowReminderForm(false)} className="btn-secondary px-4 py-2 text-sm">
                Annuler
              </button>
            </div>
          </form>
        )}

        {reminders.length === 0 && <p className="text-sm text-ink/50">Aucun rappel actif.</p>}
        <ul className="space-y-2">
          {reminders.map((r) => (
            <li key={r.id} className="card !py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-ink font-medium">{labelFor(r.type)}</p>
                <p className="text-xs text-ink/50 font-mono">
                  {r.date_prochain_rappel ? `prochain : ${r.date_prochain_rappel}` : 'pas de date'}
                  {r.frequence_jours ? ` · tous les ${r.frequence_jours}j` : ''}
                </p>
              </div>
              <button onClick={() => deactivateReminder(r.id)} className="text-xs text-ink/40 underline">
                désactiver
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Événements */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg font-medium text-ink">Timeline</h3>
          <button
            onClick={() => setShowEventForm((v) => !v)}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-1"
          >
            <Plus size={16} /> Événement
          </button>
        </div>

        {showEventForm && (
          <form onSubmit={submitEvent} className="card space-y-3 mb-3">
            <label className="block text-sm text-ink">
              Type
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
              >
                {HEALTH_EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-ink">
              Date
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
              />
            </label>
            <label className="block text-sm text-ink">
              Notes
              <textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full border border-line rounded-xl px-3 py-2 bg-white"
              />
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={savingEvent} className="btn-primary flex-1 py-2 text-sm">
                {savingEvent ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowEventForm(false)} className="btn-secondary px-4 py-2 text-sm">
                Annuler
              </button>
            </div>
          </form>
        )}

        {events.length === 0 && <p className="text-sm text-ink/50">Aucun événement enregistré.</p>}
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="card !py-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-ink">{labelFor(e.type)}</span>
                <span className="font-mono text-xs text-ink/50">{e.date}</span>
              </div>
              {e.notes && <p className="text-xs text-ink/60 mt-1">{e.notes}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
            }
