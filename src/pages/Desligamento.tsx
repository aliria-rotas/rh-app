import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { dbOffboarding } from '@/lib/db'
import { generateId } from '@/lib/storage'
import { OffboardingProcess, ChecklistItem, OffboardingReason } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, UserX, Check, X, ClipboardList } from 'lucide-react'

const REASON_OPTS = [
  { value: 'voluntario', label: 'Desligamento voluntário' },
  { value: 'involuntario', label: 'Desligamento involuntário' },
  { value: 'aposentadoria', label: 'Aposentadoria' },
  { value: 'fim_contrato', label: 'Fim de contrato' },
]

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { task: 'Carta de demissão / comunicado formal', responsible: 'RH', completed: false, due_date: '' },
  { task: 'Homologação / rescisão de contrato', responsible: 'RH', completed: false, due_date: '' },
  { task: 'Devolução de equipamentos', responsible: 'TI', completed: false, due_date: '' },
  { task: 'Revogação de acessos e senhas', responsible: 'TI', completed: false, due_date: '' },
  { task: 'Transferência de atividades', responsible: 'Gestor', completed: false, due_date: '' },
  { task: 'Entrevista de desligamento', responsible: 'RH', completed: false, due_date: '' },
  { task: 'Acerto de contas e benefícios', responsible: 'DP', completed: false, due_date: '' },
  { task: 'Comunicação à equipe', responsible: 'Gestor', completed: false, due_date: '' },
]

export default function Desligamento() {
  const [processes, setProcesses] = useState<OffboardingProcess[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState<OffboardingProcess | null>(null)
  const [editing, setEditing] = useState<OffboardingProcess | null>(null)
  const [form, setForm] = useState({
    employee_name: '', employee_position: '', department: '',
    reason: 'voluntario' as OffboardingReason, termination_date: '', notice_date: '', notes: ''
  })

  useEffect(() => {
    dbOffboarding.list().then(data => { setProcesses(data); setLoading(false) })
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ employee_name: '', employee_position: '', department: '', reason: 'voluntario', termination_date: '', notice_date: '', notes: '' })
    setModal(true)
  }

  async function save() {
    if (!form.employee_name.trim()) return
    if (editing) {
      const updated = await dbOffboarding.update(editing.id, form)
      setProcesses(prev => prev.map(p => p.id === editing.id ? updated : p))
    } else {
      const checklist = DEFAULT_CHECKLIST.map(item => ({ ...item, id: generateId() }))
      const created = await dbOffboarding.create({
        ...form, exit_interview_done: false,
        checklist_progress: 0, checklist_items: checklist,
      })
      setProcesses(prev => [...prev, created])
    }
    setModal(false)
  }

  async function toggleItem(processId: string, itemId: string) {
    const process = processes.find(p => p.id === processId)
    if (!process) return
    const items = process.checklist_items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    const progress = Math.round((items.filter(i => i.completed).length / items.length) * 100)
    const updated = await dbOffboarding.update(processId, { checklist_items: items, checklist_progress: progress })
    setProcesses(prev => prev.map(p => p.id === processId ? updated : p))
    if (detailModal?.id === processId) setDetailModal(updated)
  }

  async function remove(id: string) {
    await dbOffboarding.remove(id)
    setProcesses(prev => prev.filter(p => p.id !== id))
  }

  const REASON_COLORS: Record<OffboardingReason, string> = {
    voluntario: 'bg-blue-100 text-blue-700',
    involuntario: 'bg-red-100 text-red-700',
    aposentadoria: 'bg-green-100 text-green-700',
    fim_contrato: 'bg-orange-100 text-orange-700',
  }

  const REASON_LABELS: Record<OffboardingReason, string> = {
    voluntario: 'Voluntário', involuntario: 'Involuntário',
    aposentadoria: 'Aposentadoria', fim_contrato: 'Fim de contrato',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-end">
        <Button onClick={openNew}><Plus size={16} /> Novo Desligamento</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: processes.length },
          { label: 'Voluntários', value: processes.filter(p => p.reason === 'voluntario').length },
          { label: 'Involuntários', value: processes.filter(p => p.reason === 'involuntario').length },
          { label: 'Entrevistas feitas', value: processes.filter(p => p.exit_interview_done).length },
        ].map(s => (
          <Card key={s.label}><CardContent className="py-4">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {processes.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <UserX size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum processo de desligamento</p>
          <Button className="mt-4" onClick={openNew}><Plus size={16} /> Iniciar processo</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {processes.map(p => (
            <Card key={p.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{p.employee_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REASON_COLORS[p.reason]}`}>
                        {REASON_LABELS[p.reason]}
                      </span>
                      {p.exit_interview_done && <Badge variant="green">Entrevista feita</Badge>}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{p.employee_position}{p.department && ` · ${p.department}`}</p>
                    <div className="flex gap-4 text-xs text-slate-500 mb-3">
                      {p.termination_date && <span>Desligamento: {formatDate(p.termination_date)}</span>}
                      {p.notice_date && <span>Aviso: {formatDate(p.notice_date)}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <ProgressBar value={p.checklist_progress} color={p.checklist_progress === 100 ? 'green' : 'blue'} showLabel size="sm" className="flex-1 max-w-xs" />
                      <span className="text-xs text-slate-500">{p.checklist_items.filter(i => i.completed).length}/{p.checklist_items.length} tarefas</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setDetailModal(p)}>
                      <ClipboardList size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setForm({ employee_name: p.employee_name, employee_position: p.employee_position, department: p.department, reason: p.reason, termination_date: p.termination_date, notice_date: p.notice_date, notes: p.notes }); setModal(true) }}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => remove(p.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Desligamento' : 'Novo Processo de Desligamento'} size="md">
        <div className="space-y-4">
          <Input label="Nome do colaborador *" value={form.employee_name} onChange={e => setForm(f => ({ ...f, employee_name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cargo" value={form.employee_position} onChange={e => setForm(f => ({ ...f, employee_position: e.target.value }))} />
            <Input label="Departamento" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
          </div>
          <Select label="Motivo do desligamento" value={form.reason} onChange={v => setForm(f => ({ ...f, reason: v as OffboardingReason }))} options={REASON_OPTS} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data do aviso" type="date" value={form.notice_date} onChange={e => setForm(f => ({ ...f, notice_date: e.target.value }))} />
            <Input label="Data do desligamento" type="date" value={form.termination_date} onChange={e => setForm(f => ({ ...f, termination_date: e.target.value }))} />
          </div>
          <Textarea label="Observações" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Checklist Modal */}
      {detailModal && (
        <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title={`Checklist — ${detailModal.employee_name}`} size="md">
          <div className="space-y-3">
            <div className="mb-4">
              <ProgressBar value={detailModal.checklist_progress} color={detailModal.checklist_progress === 100 ? 'green' : 'blue'} showLabel />
            </div>
            {detailModal.checklist_items.map(item => (
              <div
                key={item.id}
                onClick={() => toggleItem(detailModal.id, item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  item.completed ? 'bg-green-500 border-green-500' : 'border-slate-300'
                }`}>
                  {item.completed && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {item.task}
                  </p>
                  <p className="text-xs text-slate-400">{item.responsible}</p>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
