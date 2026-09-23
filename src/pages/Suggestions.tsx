import { useEffect, useState } from 'react'
import { RefreshCw, Save, Check, X } from 'lucide-react'
import { supabase, TABLES } from '../lib/supabase'
import type {
  Trick, TrickStep, TrickStatut, AnxietyTrigger, AnxietyProtocolStep,
} from '../lib/types'
import { MATERIEL_OPTIONS } from '../lib/constants'
import StatutSelector from '../components/StatutSelector'

const LIEU_CHOIX = [
  { value: 'interieur', label: 'Intérieur' },
  { value: 'exterieur', label: 'Extérieur' },
] as const

type TrickAvecEtapes = Trick & { steps: TrickStep[] }

type SeanceItem = {
  id: string
  kind: 'revision' | 'autocontrole' | 'anxiete' | 'apprentissage'
  table: 'trickSteps' | 'anxietyProtocols'
  label: string
  categorieLabel: string
  description: string
  notes: string
  savingNotes: boolean
  acquis: boolean | null
  trickId?: string
  statutActuel?: TrickStatut
  statutChoisi?: TrickStatut
}

const KIND_LABEL: Record<SeanceItem['kind'], string> = {
  revision: 'Révision',
  autocontrole: 'Autocontrôle',
  anxiete: 'Anxiété',
  apprentissage: 'Apprentissage',
}

function compatible(step: { lieu: string; materiel: string[] }, lieu: string, materielDispo: string[]) {
  const lieuOk = step.lieu === 'indifferent' || step.lieu === lieu
  const materielOk = step.materiel.every((m) => materielDispo.includes(m))
  return lieuOk && materielOk
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickStep(
  steps: TrickStep[],
  lieu: string,
  materielDispo: string[],
  opts: { onlyIncomplete?: boolean; ignoreCompat?: boolean } = {},
): TrickStep | null {
  let pool = steps.filter((s) => (opts.onlyIncomplete ? !s.completed : true))
  if (!opts.ignoreCompat) pool = pool.filter((s) => compatible(s, lieu, materielDispo))
  if (pool.length === 0) return null
  // Pour l'apprentissage, on veut toujours la prochaine étape (ordre le plus bas), pas une au hasard.
  return opts.onlyIncomplete
    ? [...pool].sort((a, b) => a.ordre - b.ordre)[0]
    : pool[Math.floor(Math.random() * pool.length)]
}

export default function Suggestions() {
  const [phase, setPhase] = useState<'setup' | 'active'>('setup')
  const [lieu, setLieu] = useState<'interieur' | 'exterieur'>('interieur')
  const [materielDispo, setMaterielDispo] = useState<string[]>([])
  const [tricks, setTricks] = useState<TrickAvecEtapes[]>([])
  const [triggers, setTriggers] = useState<AnxietyTrigger[]>([])
  const [paliers, setPaliers] = useState<AnxietyProtocolStep[]>([])
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<SeanceItem[]>([])
  const [terminee, setTerminee] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [tricksRes, stepsRes, triggersRes, paliersRes] = await Promise.all([
        supabase.from(TABLES.tricks).select('*').in('categorie', ['tour', 'autocontrole']),
        supabase.from(TABLES.trickSteps).select('*'),
        supabase.from(TABLES.anxietyTriggers).select('*').eq('protocole_active', true),
        supabase.from(TABLES.anxietyProtocols).select('*'),
      ])
      if (tricksRes.data && stepsRes.data) {
        const byTrick: Record<string, TrickStep[]> = {}
        ;(stepsRes.data as TrickStep[]).forEach((s) => {
          if (!byTrick[s.trick_id]) byTrick[s.trick_id] = []
          byTrick[s.trick_id].push(s)
        })
        setTricks((tricksRes.data as Trick[]).map((t) => ({ ...t, steps: byTrick[t.id] ?? [] })))
      }
      if (triggersRes.data) setTriggers(triggersRes.data as AnxietyTrigger[])
      if (paliersRes.data) setPaliers(paliersRes.data as AnxietyProtocolStep[])
      setLoading(false)
    }
    load()
  }, [])

  function toggleMateriel(m: string) {
    setMaterielDispo((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  function genererSeance() {
    const tours = shuffle(tricks.filter((t) => t.categorie === 'tour'))
    const autocontrole = shuffle(tricks.filter((t) => t.categorie === 'autocontrole'))
    const nouveauxItems: SeanceItem[] = []

    // --- 3 révisions (tours "appris"), 3 tours distincts ---
    const toursAppris = tours.filter((t) => t.statut === 'appris')
    for (const t of toursAppris) {
      if (nouveauxItems.filter((i) => i.kind === 'revision').length >= 3) break
      const step = pickStep(t.steps, lieu, materielDispo)
      if (step) {
        nouveauxItems.push({
          id: step.id, kind: 'revision', table: 'trickSteps', label: t.nom, categorieLabel: 'Tour',
          description: step.description, notes: step.notes ?? '', savingNotes: false, acquis: null,
        })
      }
    }

    // --- 1 autocontrôle : en_cours puis appris puis non_appris ---
    function pickAutocontrole(list: TrickAvecEtapes[], onlyIncomplete: boolean) {
      for (const t of list) {
        const step = pickStep(t.steps, lieu, materielDispo, { onlyIncomplete })
        if (step) return { t, step }
      }
      return null
    }
    const autocontroleChoisi =
      pickAutocontrole(autocontrole.filter((t) => t.statut === 'en_cours'), true) ??
      pickAutocontrole(autocontrole.filter((t) => t.statut === 'appris'), false) ??
      pickAutocontrole(autocontrole.filter((t) => t.statut === 'non_appris'), true)
    if (autocontroleChoisi) {
      nouveauxItems.push({
        id: autocontroleChoisi.step.id, kind: 'autocontrole', table: 'trickSteps',
        label: autocontroleChoisi.t.nom, categorieLabel: 'Autocontrôle',
        description: autocontroleChoisi.step.description, notes: autocontroleChoisi.step.notes ?? '',
        savingNotes: false, acquis: null,
      })
    }

    // --- 1 anxiété : prochain palier non réussi d'un déclencheur actif ---
    const declencheursMelanges = shuffle(triggers)
    for (const trig of declencheursMelanges) {
      const palierSuivant = paliers
        .filter((p) => p.trigger_id === trig.id && !p.reussite)
        .sort((a, b) => a.ordre - b.ordre)
        .find((p) => compatible(p, lieu, materielDispo))
      if (palierSuivant) {
        nouveauxItems.push({
          id: palierSuivant.id, kind: 'anxiete', table: 'anxietyProtocols',
          label: trig.nom, categorieLabel: 'Anxiété',
          description: palierSuivant.palier, notes: palierSuivant.notes ?? '',
          savingNotes: false, acquis: null,
        })
        break
      }
    }

    // --- 1 apprentissage : en_cours, sinon non_appris avec prérequis ok, sinon un tour prérequis d'un autre ---
    const noms_appris = new Set(tours.filter((t) => t.statut === 'appris').map((t) => t.nom))
    const enCoursPool = tours.filter((t) => t.statut === 'en_cours')
    const nonApprisPretPool = tours.filter(
      (t) => t.statut === 'non_appris' && t.prerequis.every((p) => noms_appris.has(p)),
    )
    const tousLesPrerequis = new Set(tours.flatMap((t) => t.prerequis))
    const debloquantPool = tours.filter((t) => t.statut === 'non_appris' && tousLesPrerequis.has(t.nom))

    let apprentissage = pickAutocontrole(enCoursPool, true)
      ?? pickAutocontrole(nonApprisPretPool, true)
      ?? pickAutocontrole(debloquantPool, true)
    if (!apprentissage) {
      // Dernier recours : ignore le lieu/matériel pour proposer quand même quelque chose
      for (const t of debloquantPool.length > 0 ? debloquantPool : tours.filter((t) => t.statut === 'non_appris')) {
        const step = pickStep(t.steps, lieu, materielDispo, { onlyIncomplete: true, ignoreCompat: true })
        if (step) { apprentissage = { t, step }; break }
      }
    }
    if (apprentissage) {
      nouveauxItems.push({
        id: apprentissage.step.id, kind: 'apprentissage', table: 'trickSteps',
        label: apprentissage.t.nom, categorieLabel: 'Tour',
        description: apprentissage.step.description, notes: apprentissage.step.notes ?? '',
        savingNotes: false, acquis: null,
        trickId: apprentissage.t.id, statutActuel: apprentissage.t.statut, statutChoisi: apprentissage.t.statut,
      })
    }

    setItems(nouveauxItems)
    setTerminee(false)
    setPhase('active')
  }

  function updateItem(id: string, patch: Partial<SeanceItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  async function saveNotes(item: SeanceItem) {
    updateItem(item.id, { savingNotes: true })
    const table = item.table === 'trickSteps' ? TABLES.trickSteps : TABLES.anxietyProtocols
    await supabase.from(table).update({ notes: item.notes }).eq('id', item.id)
    updateItem(item.id, { savingNotes: false })
  }

  async function terminerSeance() {
    for (const item of items) {
      const table = item.table === 'trickSteps' ? TABLES.trickSteps : TABLES.anxietyProtocols
      if (item.acquis !== null) {
        if (item.table === 'trickSteps') {
          await supabase.from(table).update({
            completed: item.acquis, en_cours: false,
            date_completion: item.acquis ? new Date().toISOString().slice(0, 10) : null,
          }).eq('id', item.id)
        } else {
          await supabase.from(table).update({
            reussite: item.acquis,
            date_validation: item.acquis ? new Date().toISOString().slice(0, 10) : null,
          }).eq('id', item.id)
        }
      }
      if (item.kind === 'apprentissage' && item.trickId && item.statutChoisi && item.statutChoisi !== item.statutActuel) {
        await supabase.from(TABLES.tricks).update({ statut: item.statutChoisi }).eq('id', item.trickId)
      }
    }
    setTerminee(true)
  }

  if (loading) return <p className="text-sm text-ink/50">Chargement...</p>

  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-xl font-semibold text-ink">Nouvelle séance</h2>

        <div>
          <p className="text-sm text-ink/60 mb-2">Lieu</p>
          <div className="flex gap-2">
            {LIEU_CHOIX.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLieu(opt.value)}
                className={`flex-1 text-sm py-2 rounded-full border ${
                  lieu === opt.value ? 'bg-moss text-white border-moss' : 'bg-white text-ink/60 border-line'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-ink/60 mb-2">Matériel disponible</p>
          <div className="flex flex-wrap gap-2">
            {MATERIEL_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => toggleMateriel(m)}
                className={`tag ${materielDispo.includes(m) ? 'tag-active' : 'text-ink/60'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button onClick={genererSeance} className="btn-primary w-full py-3 text-sm">
          Générer ma séance
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Ta séance</h2>
        <button onClick={() => setPhase('setup')} className="text-sm text-ink/50 flex items-center gap-1">
          <RefreshCw size={14} /> Recommencer
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-ink/50">
          Rien de compatible avec ce lieu/matériel pour l'instant — essaie avec plus de matériel coché.
        </p>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <span className="tag text-ink/50">{KIND_LABEL[item.kind]}</span>
            </div>
            <p className="text-sm text-ink">{item.description}</p>

            <label className="block text-xs text-ink/50">
              Notes
              <div className="flex gap-2 mt-1">
                <textarea
                  value={item.notes}
                  onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                  rows={2}
                  className="flex-1 border border-line rounded-xl px-3 py-2 bg-white text-sm"
                />
                <button
                  onClick={() => saveNotes(item)}
                  disabled={item.savingNotes}
                  className="btn-secondary px-3 text-sm flex items-center gap-1"
                >
                  <Save size={14} /> {item.savingNotes ? '...' : ''}
                </button>
              </div>
            </label>

            {!terminee && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => updateItem(item.id, { acquis: true })}
                  className={`flex-1 text-sm py-1.5 rounded-full border flex items-center justify-center gap-1 ${
                    item.acquis === true ? 'bg-moss text-white border-moss' : 'bg-white text-ink/60 border-line'
                  }`}
                >
                  <Check size={14} /> Acquis
                </button>
                <button
                  onClick={() => updateItem(item.id, { acquis: false })}
                  className={`flex-1 text-sm py-1.5 rounded-full border flex items-center justify-center gap-1 ${
                    item.acquis === false ? 'bg-rust text-white border-rust' : 'bg-white text-ink/60 border-line'
                  }`}
                >
                  <X size={14} /> Non acquis
                </button>
              </div>
            )}

            {item.kind === 'apprentissage' && !terminee && (
              <div className="pt-1">
                <p className="text-xs text-ink/50 mb-1">Statut du tour</p>
                <StatutSelector
                  statut={item.statutChoisi ?? 'non_appris'}
                  onChange={(s) => updateItem(item.id, { statutChoisi: s })}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length > 0 && !terminee && (
        <button onClick={terminerSeance} className="btn-primary w-full py-3 text-sm">
          Terminer la séance
        </button>
      )}

      {terminee && (
        <p className="text-sm text-moss-dark bg-moss-light border border-moss rounded-xl px-3 py-2 text-center">
          Séance enregistrée, bravo ! 🐾
        </p>
      )}
    </div>
  )
}
