import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { dbCompetencies } from '@/lib/db'
import { Competency, CompetencyType } from '@/types'
import { Plus, Pencil, Trash2, Award, Plus as PlusIcon, X } from 'lucide-react'

const EMPTY: Omit<Competency, 'id' | 'created_at'> = {
  name: '',
  description: '',
  type: 'comportamental',
  indicators: [],
}

const TYPE_OPTS = [
  { value: 'comportamental', label: 'Comportamental' },
  { value: 'tecnica', label: 'Técnica' },
  { value: 'lideranca', label: 'Liderança' },
]

const TYPE_COLORS: Record<CompetencyType, string> = {
  comportamental: 'blue',
  tecnica: 'green',
  lideranca: 'purple',
}

export default function Competencias() {
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Competency | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [newIndicator, setNewIndicator] = useState('')
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    dbCompetencies.list().then(data => { setCompetencies(data); setLoading(false) })
  }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setModal(true)
  }

  function openEdit(c: Competency) {
    setEditing(c)
    setForm({ name: c.name, description: c.description, type: c.type, indicators: [...c.indicators] })
    setModal(true)
  }

  async function save() {
    if (!form.name.trim()) return
    if (editing) {
      const updated = await dbCompetencies.update(editing.id, form)
      setCompetencies(prev => prev.map(c => c.id === editing.id ? updated : c))
    } else {
      const created = await dbCompetencies.create(form)
      setCompetencies(prev => [...prev, created])
    }
    setModal(false)
  }

  async function remove(id: string) {
    await dbCompetencies.remove(id)
    setCompetencies(prev => prev.filter(c => c.id !== id))
  }

  function addIndicator() {
    if (!newIndicator.trim()) return
    setForm(f => ({ ...f, indicators: [...f.indicators, newIndicator.trim()] }))
    setNewIndicator('')
  }

  function removeIndicator(i: number) {
    setForm(f => ({ ...f, indicators: f.indicators.filter((_, idx) => idx !== i) }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  const filtered = filter === 'all' ? competencies : competencies.filter(c => c.type === filter)
  const grouped = {
    comportamental: competencies.filter(c => c.type === 'comportamental'),
    tecnica: competencies.filter(c => c.type === 'tecnica'),
    lideranca: competencies.filter(c => c.type === 'lideranca'),
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[['all', 'Todas'], ['comportamental', 'Comportamental'], ['tecnica', 'Técnica'], ['lideranca', 'Liderança']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === v ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <Button onClick={openNew}><Plus size={16} /> Nova Competência</Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { type: 'comportamental', label: 'Comportamentais', color: 'blue' },
          { type: 'tecnica', label: 'Técnicas', color: 'green' },
          { type: 'lideranca', label: 'Liderança', color: 'purple' },
        ].map(t => (
          <Card key={t.type}>
            <CardContent className="py-4">
              <p className="text-2xl font-bold text-slate-800">{grouped[t.type as CompetencyType].length}</p>
              <p className="text-sm text-slate-500 mt-1">{t.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Award size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma competência cadastrada</p>
            <p className="text-slate-400 text-sm mt-1">Comece mapeando as competências da organização.</p>
            <Button className="mt-4" onClick={openNew}><Plus size={16} /> Adicionar competência</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(c => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{c.name}</h3>
                      <Badge variant={TYPE_COLORS[c.type] as any}>{
                        { comportamental: 'Comportamental', tecnica: 'Técnica', lideranca: 'Liderança' }[c.type]
                      }</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{c.description}</p>
                    {c.indicators.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1.5">Indicadores comportamentais:</p>
                        <ul className="space-y-1">
                          {c.indicators.map((ind, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">•</span> {ind}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(c.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Competência' : 'Nova Competência'} size="lg">
        <div className="space-y-4">
          <Input
            label="Nome da competência *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Comunicação assertiva"
          />
          <Select
            label="Tipo"
            value={form.type}
            onChange={v => setForm(f => ({ ...f, type: v as CompetencyType }))}
            options={TYPE_OPTS}
          />
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Descreva o que essa competência significa na prática..."
          />

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Indicadores comportamentais</label>
            <div className="space-y-2 mb-2">
              {form.indicators.map((ind, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm">
                  <span className="flex-1 text-slate-700">{ind}</span>
                  <button onClick={() => removeIndicator(i)} className="text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newIndicator}
                onChange={e => setNewIndicator(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addIndicator()}
                placeholder="Adicionar indicador (Enter para confirmar)"
              />
              <Button variant="outline" size="sm" onClick={addIndicator}><PlusIcon size={14} /></Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar competência</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
