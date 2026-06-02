import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { dbClimateSurveys } from '@/lib/db'
import { generateId } from '@/lib/storage'
import { ClimateSurvey, ClimateQuestion, SurveyStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Wind, Play, Square, Eye, X } from 'lucide-react'

const STATUS_OPTS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'encerrado', label: 'Encerrado' },
]

const CATEGORY_OPTS = [
  { value: 'lideranca', label: 'Liderança' },
  { value: 'comunicacao', label: 'Comunicação' },
  { value: 'ambiente', label: 'Ambiente de Trabalho' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
  { value: 'reconhecimento', label: 'Reconhecimento' },
  { value: 'beneficios', label: 'Benefícios' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'diversidade', label: 'Diversidade & Inclusão' },
]

export default function PesquisaClima() {
  const [surveys, setSurveys] = useState<ClimateSurvey[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState<ClimateSurvey | null>(null)
  const [editing, setEditing] = useState<ClimateSurvey | null>(null)
  const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '' })
  const [questions, setQuestions] = useState<ClimateQuestion[]>([])
  const [newQ, setNewQ] = useState({ text: '', category: 'lideranca', type: 'escala' as ClimateQuestion['type'] })

  useEffect(() => {
    dbClimateSurveys.list().then(data => { setSurveys(data); setLoading(false) })
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ title: '', description: '', start_date: '', end_date: '' })
    setQuestions([])
    setModal(true)
  }

  async function save() {
    if (!form.title.trim()) return
    if (editing) {
      const updated = await dbClimateSurveys.update(editing.id, { ...form, questions })
      setSurveys(prev => prev.map(s => s.id === editing.id ? updated : s))
    } else {
      const created = await dbClimateSurveys.create({
        ...form, status: 'rascunho' as SurveyStatus,
        questions, responses_count: 0,
      })
      setSurveys(prev => [...prev, created])
    }
    setModal(false)
  }

  async function changeStatus(id: string, status: SurveyStatus) {
    const updated = await dbClimateSurveys.update(id, { status })
    setSurveys(prev => prev.map(s => s.id === id ? updated : s))
  }

  async function remove(id: string) {
    await dbClimateSurveys.remove(id)
    setSurveys(prev => prev.filter(s => s.id !== id))
  }

  function addQuestion() {
    if (!newQ.text.trim()) return
    setQuestions(qs => [...qs, { ...newQ, id: generateId() }])
    setNewQ(q => ({ ...q, text: '' }))
  }

  function openEdit(s: ClimateSurvey) {
    setEditing(s)
    setForm({ title: s.title, description: s.description, start_date: s.start_date, end_date: s.end_date })
    setQuestions([...s.questions])
    setModal(true)
  }

  const active = surveys.filter(s => s.status === 'ativo').length
  const total = surveys.length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-end">
        <Button onClick={openNew}><Plus size={16} /> Nova Pesquisa</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm text-slate-500 mt-1">Total de pesquisas</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold text-green-600">{active}</p>
          <p className="text-sm text-slate-500 mt-1">Pesquisas ativas</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold">{surveys.reduce((a, s) => a + s.responses_count, 0)}</p>
          <p className="text-sm text-slate-500 mt-1">Respostas coletadas</p>
        </CardContent></Card>
      </div>

      {surveys.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Wind size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma pesquisa cadastrada</p>
          <p className="text-slate-400 text-sm mt-1">Crie pesquisas para medir o clima organizacional.</p>
          <Button className="mt-4" onClick={openNew}><Plus size={16} /> Criar pesquisa</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {surveys.map(s => (
            <Card key={s.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{s.title}</h3>
                      <StatusBadge status={s.status} />
                    </div>
                    {s.description && <p className="text-sm text-slate-600 mb-2">{s.description}</p>}
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>{s.questions.length} perguntas</span>
                      <span>{s.responses_count} respostas</span>
                      {s.start_date && <span>Início: {formatDate(s.start_date)}</span>}
                      {s.end_date && <span>Fim: {formatDate(s.end_date)}</span>}
                    </div>
                    {s.status === 'ativo' && s.responses_count > 0 && (
                      <div className="mt-3">
                        <ProgressBar value={s.responses_count} max={100} color="green" showLabel size="sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setViewModal(s)}><Eye size={14} /></Button>
                    {s.status === 'rascunho' && (
                      <Button variant="ghost" size="sm" className="text-green-600" onClick={() => changeStatus(s.id, 'ativo')}>
                        <Play size={14} />
                      </Button>
                    )}
                    {s.status === 'ativo' && (
                      <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => changeStatus(s.id, 'encerrado')}>
                        <Square size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => remove(s.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Pesquisa' : 'Nova Pesquisa de Clima'} size="xl">
        <div className="space-y-4">
          <Input label="Título *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Pesquisa de Clima 2025" />
          <Textarea label="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de início" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="Data de encerramento" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">Perguntas ({questions.length})</label>
            </div>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 bg-slate-50 rounded-lg p-3 text-sm">
                  <span className="text-slate-400 text-xs mt-0.5 font-mono w-5">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-slate-700">{q.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{q.category} · {q.type}</p>
                  </div>
                  <button onClick={() => setQuestions(qs => qs.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <Input value={newQ.text} onChange={e => setNewQ(q => ({ ...q, text: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addQuestion()} placeholder="Texto da pergunta..." />
              <div className="grid grid-cols-2 gap-2">
                <Select value={newQ.category} onChange={v => setNewQ(q => ({ ...q, category: v }))} options={CATEGORY_OPTS} />
                <Select value={newQ.type} onChange={v => setNewQ(q => ({ ...q, type: v as ClimateQuestion['type'] }))} options={[
                  { value: 'escala', label: 'Escala (1-5)' },
                  { value: 'multipla_escolha', label: 'Múltipla escolha' },
                  { value: 'texto_livre', label: 'Texto livre' },
                ]} />
              </div>
              <Button variant="outline" size="sm" onClick={addQuestion}><Plus size={14} /> Adicionar pergunta</Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar pesquisa</Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      {viewModal && (
        <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={viewModal.title} size="lg">
          <div className="space-y-4">
            <div className="flex gap-2">
              <StatusBadge status={viewModal.status} />
              <span className="text-sm text-slate-500">{viewModal.questions.length} perguntas · {viewModal.responses_count} respostas</span>
            </div>
            {viewModal.description && <p className="text-sm text-slate-600">{viewModal.description}</p>}
            <div className="space-y-3">
              {viewModal.questions.map((q, i) => (
                <div key={q.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold text-sm w-5">{i + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{q.text}</p>
                      <p className="text-xs text-slate-400 mt-1">{q.category} · {q.type === 'escala' ? 'Escala 1-5' : q.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
