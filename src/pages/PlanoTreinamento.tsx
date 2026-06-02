import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { dbTrainings } from '@/lib/db'
import { TrainingAction, TrainingStatus, TrainingModality } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, BookOpen, Clock, DollarSign, Users, MessageSquare, Link as LinkIcon } from 'lucide-react'
import { TrainningResponses } from '@/components/TrainningResponses'

const STATUS_OPTS = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

const MODALITY_OPTS = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'online', label: 'Online' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'on_the_job', label: 'On the Job' },
]

const MODALITY_COLORS: Record<TrainingModality, string> = {
  presencial: 'blue',
  online: 'green',
  hibrido: 'purple',
  on_the_job: 'yellow',
}

const MODALITY_LABELS: Record<TrainingModality, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
  on_the_job: 'On the Job',
}

const EMPTY_FORM = {
  title: '',
  description: '',
  target_competency: '',
  target_positions: [] as string[],
  modality: 'online' as TrainingModality,
  provider: '',
  duration_hours: 0,
  cost_per_person: 0,
  participants_count: 0,
  status: 'planejado' as TrainingStatus,
  scheduled_date: '',
  has_public_form: false,
}

export default function PlanoTreinamento() {
  const [trainings, setTrainings] = useState<TrainingAction[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<TrainingAction | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterStatus, setFilterStatus] = useState('all')
  const [positionInput, setPositionInput] = useState('')
  const [activeTab, setActiveTab] = useState<'plano' | 'respostas'>('plano')

  useEffect(() => {
    dbTrainings.list().then(data => { setTrainings(data); setLoading(false) })
  }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModal(true)
  }

  function openEdit(t: TrainingAction) {
    setEditing(t)
    setForm({
      title: t.title, description: t.description,
      target_competency: t.target_competency,
      target_positions: [...t.target_positions],
      modality: t.modality, provider: t.provider,
      duration_hours: t.duration_hours,
      cost_per_person: t.cost_per_person,
      participants_count: t.participants_count,
      status: t.status, scheduled_date: t.scheduled_date,
      has_public_form: t.has_public_form ?? false,
    })
    setModal(true)
  }

  async function save() {
    if (!form.title.trim()) return
    if (editing) {
      const updated = await dbTrainings.update(editing.id, form)
      setTrainings(prev => prev.map(t => t.id === editing.id ? updated : t))
    } else {
      const created = await dbTrainings.create(form)
      setTrainings(prev => [...prev, created])
    }
    setModal(false)
  }

  async function remove(id: string) {
    await dbTrainings.remove(id)
    setTrainings(prev => prev.filter(t => t.id !== id))
  }

  function addPosition() {
    if (!positionInput.trim()) return
    setForm(f => ({ ...f, target_positions: [...f.target_positions, positionInput.trim()] }))
    setPositionInput('')
  }

  function removePosition(i: number) {
    setForm(f => ({ ...f, target_positions: f.target_positions.filter((_, idx) => idx !== i) }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  const filtered = filterStatus === 'all'
    ? trainings
    : trainings.filter(t => t.status === filterStatus)

  // Separar treinamentos com e sem custo
  const trainingsWithCost = filtered.filter(t => t.cost_per_person > 0)
  const trainingsWithoutCost = filtered.filter(t => t.cost_per_person === 0)

  const totalHours = trainings.reduce((a, t) => a + t.duration_hours, 0)
  const totalCost = trainings.reduce((a, t) => a + t.cost_per_person * t.participants_count, 0)
  const totalParticipants = trainings.reduce((a, t) => a + t.participants_count, 0)
  const trainingsCostCount = trainings.filter(t => t.cost_per_person > 0).length
  const trainingsFreeCost = trainings.filter(t => t.cost_per_person === 0).length

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('plano')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === 'plano'
              ? 'border-b-2 border-yellow-600 text-yellow-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="inline-block mr-2" size={16} />
          Plano de Treinamento
        </button>
        <button
          onClick={() => setActiveTab('respostas')}
          className={`px-4 py-3 font-medium text-sm transition-colors ${
            activeTab === 'respostas'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="inline-block mr-2" size={16} />
          Respostas do Treinamento
        </button>
      </div>

      {activeTab === 'plano' && (
        <>
      {/* LINK DO TREINAMENTO PÚBLICO */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-400 mb-6">
        <CardContent className="py-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 text-white rounded-lg p-3">
                <LinkIcon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-orange-900">🎓 Compartilhar Treinamento Público</h3>
                <p className="text-sm text-orange-800">Envie este link para seus colaboradores</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 flex items-center gap-3">
              <input
                type="text"
                readOnly
                value="https://aliria-rotas.github.io/rh-app/treinamento-publico?id=chatbot_empatico_001"
                className="flex-1 text-sm text-gray-700 bg-white border-0 outline-none"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText('https://aliria-rotas.github.io/rh-app/treinamento-publico?id=chatbot_empatico_001')
                  alert('Link copiado!')
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
              >
                📋 Copiar Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[['all', 'Todos'], ['planejado', 'Planejados'], ['em_andamento', 'Em andamento'], ['concluido', 'Concluídos']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === v ? 'bg-yellow-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {l}
            </button>
          ))}
        </div>
        <Button onClick={openNew}><Plus size={16} /> Nova Ação de Treinamento</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card><CardContent className="py-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-yellow-500" />
            <p className="text-2xl font-bold">{trainings.length}</p>
          </div>
          <p className="text-sm text-slate-500">Total</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-red-500" />
            <p className="text-2xl font-bold">{trainingsCostCount}</p>
          </div>
          <p className="text-sm text-slate-500">Com custo</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-green-500" />
            <p className="text-2xl font-bold">{trainingsFreeCost}</p>
          </div>
          <p className="text-sm text-slate-500">Sem custo</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-blue-500" />
            <p className="text-2xl font-bold">{totalHours}h</p>
          </div>
          <p className="text-sm text-slate-500">Carga horária</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-purple-500" />
            <p className="text-2xl font-bold">{totalParticipants}</p>
          </div>
          <p className="text-sm text-slate-500">Participantes</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-orange-500" />
            <p className="text-lg font-bold">{formatCurrency(totalCost)}</p>
          </div>
          <p className="text-sm text-slate-500">Investimento</p>
        </CardContent></Card>
      </div>

      {/* TREINAMENTO PÚBLICO EM DESTAQUE */}
      {filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma ação de treinamento cadastrada</p>
          <p className="text-slate-400 text-sm mt-1">Planeje os treinamentos com base nas necessidades identificadas.</p>
          <Button className="mt-4" onClick={openNew}><Plus size={16} /> Adicionar treinamento</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-8">
          {/* SEÇÃO: TREINAMENTOS COM CUSTO */}
          {trainingsWithCost.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-red-300">
                <DollarSign size={24} className="text-red-500" />
                <h2 className="text-xl font-bold text-slate-800">Treinamentos com Custo</h2>
                <span className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {trainingsWithCost.length} treinamento{trainingsWithCost.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-4">
                {trainingsWithCost.map(t => (
            <Card key={t.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{t.title}</h3>
                      <StatusBadge status={t.status} />
                      <Badge variant={MODALITY_COLORS[t.modality] as any}>
                        {MODALITY_LABELS[t.modality]}
                      </Badge>
                    </div>
                    {t.description && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{t.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-2">
                      {t.target_competency && <span>Competência: <strong>{t.target_competency}</strong></span>}
                      {t.provider && <span>Fornecedor: {t.provider}</span>}
                      {t.duration_hours > 0 && <span>{t.duration_hours}h de duração</span>}
                      {t.participants_count > 0 && <span>{t.participants_count} participantes</span>}
                      {t.cost_per_person > 0 && (
                        <span className="text-green-700 font-medium">
                          {formatCurrency(t.cost_per_person)}/pessoa
                          {t.participants_count > 0 && ` · Total: ${formatCurrency(t.cost_per_person * t.participants_count)}`}
                        </span>
                      )}
                      {t.scheduled_date && <span>Data: {formatDate(t.scheduled_date)}</span>}
                    </div>
                    {t.target_positions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.target_positions.map((pos, i) => (
                          <Badge key={i} variant="outline">{pos}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {t.has_public_form && (
                      <Button variant="ghost" size="sm" title="Abrir formulário público"
                        onClick={() => window.open(`/treinamento-publico?id=${t.id}`, '_blank')}>
                        <LinkIcon size={14} className="text-blue-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => remove(t.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO: TREINAMENTOS SEM CUSTO */}
          {trainingsWithoutCost.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-green-300">
                <BookOpen size={24} className="text-green-600" />
                <h2 className="text-xl font-bold text-slate-800">Treinamentos Internos (Sem Custo)</h2>
                <span className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {trainingsWithoutCost.length} treinamento{trainingsWithoutCost.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-4">
                {trainingsWithoutCost.map(t => (
            <Card key={t.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{t.title}</h3>
                      <StatusBadge status={t.status} />
                      <Badge variant={MODALITY_COLORS[t.modality] as any}>
                        {MODALITY_LABELS[t.modality]}
                      </Badge>
                    </div>
                    {t.description && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{t.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-2">
                      {t.target_competency && <span>Competência: <strong>{t.target_competency}</strong></span>}
                      {t.provider && <span>Fornecedor: {t.provider}</span>}
                      {t.duration_hours > 0 && <span>{t.duration_hours}h de duração</span>}
                      {t.participants_count > 0 && <span>{t.participants_count} participantes</span>}
                      {t.scheduled_date && <span>Data: {formatDate(t.scheduled_date)}</span>}
                    </div>
                    {t.target_positions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.target_positions.map((pos, i) => (
                          <Badge key={i} variant="outline">{pos}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {t.has_public_form && (
                      <Button variant="ghost" size="sm" title="Abrir formulário público"
                        onClick={() => window.open(`/treinamento-publico?id=${t.id}`, '_blank')}>
                        <LinkIcon size={14} className="text-blue-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => remove(t.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </>
      )}

      {activeTab === 'respostas' && <TrainningResponses />}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Editar Treinamento' : 'Nova Ação de Treinamento'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Título *"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Ex: Comunicação não-violenta"
          />
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            placeholder="Objetivo e conteúdo do treinamento..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Modalidade"
              value={form.modality}
              onChange={v => setForm(f => ({ ...f, modality: v as TrainingModality }))}
              options={MODALITY_OPTS}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={v => setForm(f => ({ ...f, status: v as TrainingStatus }))}
              options={STATUS_OPTS}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Competência alvo"
              value={form.target_competency}
              onChange={e => setForm(f => ({ ...f, target_competency: e.target.value }))}
              placeholder="Ex: Liderança situacional"
            />
            <Input
              label="Fornecedor / Instrutor"
              value={form.provider}
              onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
              placeholder="Ex: Escola de Negócios XYZ"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Carga horária (h)"
              type="number"
              value={form.duration_hours || ''}
              onChange={e => setForm(f => ({ ...f, duration_hours: +e.target.value }))}
            />
            <Input
              label="Custo por pessoa (R$)"
              type="number"
              value={form.cost_per_person || ''}
              onChange={e => setForm(f => ({ ...f, cost_per_person: +e.target.value }))}
            />
            <Input
              label="Nº de participantes"
              type="number"
              value={form.participants_count || ''}
              onChange={e => setForm(f => ({ ...f, participants_count: +e.target.value }))}
            />
          </div>
          <Input
            label="Data prevista"
            type="date"
            value={form.scheduled_date}
            onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
          />

          {/* Formulário Público */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.has_public_form ?? false}
                onChange={e => setForm(f => ({ ...f, has_public_form: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div>
                <p className="font-medium text-slate-800">Habilitar formulário público</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Colaboradores podem acessar o formulário de respostas sem fazer login
                </p>
              </div>
            </label>
            {form.has_public_form && (
              <div className="mt-3 p-3 bg-white rounded border border-blue-200 text-sm text-slate-700">
                <p className="font-medium mb-1">Link público:</p>
                <code className="bg-slate-100 px-2 py-1 rounded text-xs break-all">
                  {window.location.origin}/treinamento-publico?id={editing?.id || 'novo'}
                </code>
              </div>
            )}
          </div>

          {/* Cargos alvo */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Cargos / públicos-alvo</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.target_positions.map((pos, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                  {pos}
                  <button onClick={() => removePosition(i)} className="hover:text-red-500">
                    <span className="text-xs">×</span>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={positionInput}
                onChange={e => setPositionInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPosition()}
                placeholder="Ex: Gerente de Vendas (Enter para confirmar)"
              />
              <Button variant="outline" size="sm" onClick={addPosition}><Plus size={14} /></Button>
            </div>
          </div>

          {form.cost_per_person > 0 && form.participants_count > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
              💰 Investimento total estimado: <strong>{formatCurrency(form.cost_per_person * form.participants_count)}</strong>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar treinamento</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
