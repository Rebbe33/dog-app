import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, SkipForward } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type { TrickStep, AnxietyProtocolStep } from '../lib/types'
import StepLieuMaterielEditor from '../components/StepLieuMaterielEditor'

type TrickItem = TrickStep & {
  source: 'trick'
  trick: { nom: string; categorie: string } | null
}
type AnxietyItem = AnxietyProtocolStep & {
  source: 'anxiety'
  trigger: { nom: string } | null
}
type QueueItem = TrickItem | AnxietyItem

const CATEGORIE_LABEL: Record<string, string> = {
  tour: 'Tour',
  autocontrole: 'Autocontrôle',
  education_base: 'Éducation de base',
  activite: 'Activité',
}

export default function EditionLieuMateriel() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [totalDepart, setTotalDepart] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [tricksStepsRes, anxietyStepsRes] = await Promise.all([
        supabase
          .from(TABLES.trickSteps)
          .select('*, trick:dog_tricks(nom, categorie)')
          .eq('revu', false)
          .order('trick_id')
          .order('ordre'),
        supabase
          .from(TABLES.anxietyProtocols)
          .select('*, trigger:dog_anxiety_triggers(nom)')
          .eq('revu', false)
          .order('trigger_id')
          .order('ordre'),
      ])

      const tricksItems: TrickItem[] = ((tricksStepsRes.data as any[]) ?? []).map((s) => ({
        ...s,
        source: 'trick',
      }))
      const anxietyItems: AnxietyItem[] = ((anxietyStepsRes.data as any[]) ?? []).map((s) => ({
        ...s,
        source: 'anxiety',
      }))

      const combined = [...tricksItems, ...anxietyItems]
      setQueue(combined)
      setTotalDepart(combined.length)
      setLoading(false)
    }
    load()
  }, [])

  const current = queue[0]

  async function changeLieu(lieu: string) {
    if (!current) return
    setQueue((q) => q.map((item, i) => (i === 0 ? { ...item, lieu: lieu as any } : item)))
    const table = current.source === 'trick' ? TABLES.trickSteps : TABLES.anxietyProtocols
    await supabase.from(table).update({ lieu }).eq('id', current.id)
  }

  async function toggleMateriel(tag: string) {
    if (!current) return
    const materiel = current.materiel.includes(tag)
      ? current.materiel.filter((m) => m !== tag)
      : [...current.materiel, tag]
    setQueue((q) => q.map((item, i) => (i === 0 ? { ...item, materiel } : item)))
    const table = current.source === 'trick' ? TABLES.trickSteps : TABLES.anxietyProtocols
    await supabase.from(table).update({ materiel }).eq('id', current.id)
  }

  async function validerEtSuivant() {
    if (!current) return
    const table = current.source === 'trick' ? TABLES.trickSteps : TABLES.anxietyProtocols
    await supabase.from(table).update({ revu: true }).eq('id', current.id)
    setQueue((q) => q.slice(1))
  }

  function passer() {
    setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]] : q))
  }

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  const traites = totalDepart - queue.length

  return (
    <div className="space-y-6">
      <Link to="/reglages" className="inline-flex items-center gap-1 text-sm text-ink/50">
        <ArrowLeft size={14} /> Réglages
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Classer lieu/matériel</h2>
        <span className="text-xs text-ink/40 font-mono">{traites}/{totalDepart}</span>
      </div>

      {!current ? (
        <p className="text-sm text-ink/50">
          Tout est classé pour l'instant 🎉 — les nouvelles étapes que tu ajoutes apparaîtront ici.
        </p>
      ) : (
        <div className="card space-y-3">
          <p className="text-xs text-ink/40">
            {current.source === 'trick'
              ? `${current.trick?.nom ?? '—'} · ${CATEGORIE_LABEL[current.trick?.categorie ?? ''] ?? ''}`
              : `${current.trigger?.nom ?? '—'} · Anxiété`}
          </p>
          <p className="text-sm text-ink">
            {current.source === 'trick' ? current.description : current.palier}
          </p>

          <StepLieuMaterielEditor
            lieu={current.lieu}
            materiel={current.materiel}
            onChangeLieu={changeLieu}
            onToggleMateriel={toggleMateriel}
          />

          <div className="flex gap-2 pt-1">
            <button onClick={validerEtSuivant} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1">
              <Check size={16} /> Valider et suivant
            </button>
            <button onClick={passer} className="btn-secondary px-3 py-2 text-sm flex items-center gap-1">
              <SkipForward size={16} /> Passer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
