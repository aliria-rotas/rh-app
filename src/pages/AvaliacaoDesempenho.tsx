import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { dbPerformanceCycles, dbPerformanceEvaluations, dbCompetencies } from '@/lib/db'
import { PerformanceCycle, PerformanceEvaluation, EvaluationStatus } from '@/types'
import { Competency } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, BarChart3, ChevronRight, Star } from 'lucide-react'

const STATUS_OPTS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
]

export default function AvaliacaoDesempenho() {
  const [cycles, setCycles] = useState<PerformanceCycle[]>([])
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([])
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEvals, setLoadingEvals] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<PerformanceCycle | null>(null)
  const [cycleModal, setCycleModal] = useState(false)
  const [evalModal, setEvalModal] = useState(false)
  const [editingCycle, setEditingCycle] = useState<PerformanceCycle | null>(null)
  const [editingEval, setEditingEval] = useState<PerformanceEvaluation | null>(null)
  const [cycleForm, setCycleForm] = useState({ name: '', period: '', start_date: '', end_date: '', status: 'pendente' as EvaluationStatus })
  const [evalForm, setEvalForm] = useState({
    employee_name: '', position: '', department: '', evaluator: '',
    scores: {} as Record<string, number>, feedback: '', development_plan: '', status: 'pendente' as EvaluationStatus
  })

  useEffect(() => {
    Promise.all([
      dbPerformanceCycles.list(),
      dbCompetencies.list(),
    ]).then(([cyclesData, compsData]) => {
      setCycles(cyclesData)
      setCompetencies(compsData)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedCycle) { setEvaluations([]); return }
    setLoadingEvals(true)
    dbPerformanceEvaluations.listByCycle(selectedCycle.id).then(data => {
      setEvaluations(data)
      setLoadingEvals(false)
    })
  }, [selectedCycle])

  async function saveCycle() {
    if (!cycleForm.name.trim()) return
    if (editingCycle) {
      const updated = await dbPerformanceCycles.update(editingCycle.id, cycleForm)
      setCycles(prev => prev.map(c => c.id === editingCycle.id ? updated : c))
    } else {
      const created = await dbPerformanceCycles.create({ ...cycleForm, evaluations_count: 0 })
      setCycles(prev => [...prev, created])
    }
    setCycleModal(false)
  }

  async function saveEval() {
    if (!evalForm.employee_name.trim() || !selectedCycle) return
    const scores = evalForm.scores
    const vals = Object.values(scores).filter(v => v > 0)
    const final_score = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    if (editingEval) {
      const updated = await dbPerformanceEvaluations.update(editingEval.id, { ...evalForm, final_score })
      setEvaluations(prev => prev.map(e => e.id === editingEval.id ? updated : e))
    } else {
      const created = await dbPerformanceEvaluations.create({ ...evalForm, cycle_id: selectedCycle.id, final_score })
      setEvaluations(prev => [...prev, created])
      const cycleUpdated = await dbPerformanceCycles.update(selectedCycle.id, { evaluations_count: selectedCycle.evaluations_count + 1 })
      setCycles(prev => prev.map(c => c.id === selectedCycle.id ? cycleUpdated : c))
    }
    setEvalModal(false)
  }

  async function removeCycle(id: string) {
    await dbPerformanceCycles.remove(id)
    setCycles(prev => prev.filter(c => c.id !== id))
  }

  async function removeEval(id: string) {
    await dbPerformanceEvaluations.remove(id)
    setEvaluations(prev => prev.filter(e => e.id !== id))
  }

  const cycleEvals = evaluations

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  function scoreColor(score: number) {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-blue-600'
    if (score >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  function scoreLabel(score: number) {
    if (score >= 4.5) return 'Excepcional'
    if (score >= 3.5) return 'Acima do esperado'
    if (score >= 2.5) return 'Dentro do esperado'
    if (score >= 1.5) return 'Abaixo do esperado'
    return 'Insatisfatório'
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {!selectedCycle ? (
        <>
          <div className="flex justify-end">
            <Button onClick={() => { setEditingCycle(null); setCycleForm({ name: '', period: '', start_date: '', end_date: '', status: 'pendente' }); setCycleModal(true) }}>
              <Plus size={16} /> Novo Ciclo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="py-4"><p className="text-2xl font-bold">{cycles.length}</p><p className="text-sm text-slate-500 mt-1">Ciclos criados</p></CardContent></Card>
            <Card><CardContent className="py-4"><p className="text-2xl font-bold text-blue-600">{cycles.filter(c => c.status === 'em_andamento').length}</p><p className="text-sm text-slate-500 mt-1">Em andamento</p></CardContent></Card>
            <Card><CardContent className="py-4"><p className="text-2xl font-bold text-green-600">{evaluations.length}</p><p className="text-sm text-slate-500 mt-1">Avaliações realizadas</p></CardContent></Card>
          </div>

          {cycles.length === 0 ? (
            <Card><CardContent className="py-16 text-center">
              <BarChart3 size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhum ciclo de avaliação criado</p>
              <Button className="mt-4" onClick={() => setCycleModal(true)}><Plus size={16} /> Criar ciclo</Button>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              {cycles.map(c => (
                <Card key={c.id} onClick={() => setSelectedCycle(c)} className="cursor-pointer hover:border-blue-300">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{c.name}</h3>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          {c.period && <span>{c.period}</span>}
                          <span>{c.evaluations_count} avaliações</span>
                          {c.start_date && <span>{formatDate(c.start_date)} – {formatDate(c.end_date)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditingCycle(c); setCycleForm({ name: c.name, period: c.period, start_date: c.start_date, end_date: c.end_date, status: c.status }); setCycleModal(true) }}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={e => { e.stopPropagation(); removeCycle(c.id) }}>
                          <Trash2 size={14} />
                        </Button>
                        <ChevronRight size={16} className="text-slate-400 ml-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setSelectedCycle(null)} className="text-sm text-blue-600 hover:underline">← Ciclos</button>
            <span className="text-slate-400">/</span>
            <h2 className="font-semibold text-slate-800">{selectedCycle.name}</h2>
            <StatusBadge status={selectedCycle.status} />
          </div>

          <div className="flex justify-end">
            <Button onClick={() => {
              setEditingEval(null)
              setEvalForm({ employee_name: '', position: '', department: '', evaluator: '', scores: {}, feedback: '', development_plan: '', status: 'pendente' })
              setEvalModal(true)
            }}>
              <Plus size={16} /> Nova Avaliação
            </Button>
          </div>

          {loadingEvals ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : cycleEvals.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <p className="text-slate-500">Nenhuma avaliação neste ciclo ainda.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-4">
              {cycleEvals.map(ev => (
                <Card key={ev.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{ev.employee_name}</h3>
                          <StatusBadge status={ev.status} />
                          {ev.final_score > 0 && (
                            <span className={`text-sm font-bold ${scoreColor(ev.final_score)}`}>
                              {ev.final_score.toFixed(1)} — {scoreLabel(ev.final_score)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{ev.position}{ev.department && ` · ${ev.department}`}</p>
                        {Object.keys(ev.scores).length > 0 && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {Object.entries(ev.scores).map(([comp, score]) => (
                              <div key={comp} className="flex items-center gap-2 text-xs">
                                <span className="text-slate-600 flex-1 truncate">{comp}</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(n => (
                                    <Star key={n} size={10} className={n <= score ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {ev.feedback && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{ev.feedback}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingEval(ev); setEvalForm({ employee_name: ev.employee_name, position: ev.position, department: ev.department, evaluator: ev.evaluator, scores: { ...ev.scores }, feedback: ev.feedback, development_plan: ev.development_plan, status: ev.status }); setEvalModal(true) }}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => removeEval(ev.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Cycle Modal */}
      <Modal open={cycleModal} onClose={() => setCycleModal(false)} title={editingCycle ? 'Editar Ciclo' : 'Novo Ciclo de Avaliação'} size="md">
        <div className="space-y-4">
          <Input label="Nome do ciclo *" value={cycleForm.name} onChange={e => setCycleForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Avaliação Semestral 2025.1" />
          <Input label="Período" value={cycleForm.period} onChange={e => setCycleForm(f => ({ ...f, period: e.target.value }))} placeholder="Ex: Janeiro–Junho 2025" />
          <Select label="Status" value={cycleForm.status} onChange={v => setCycleForm(f => ({ ...f, status: v as EvaluationStatus }))} options={STATUS_OPTS} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de início" type="date" value={cycleForm.start_date} onChange={e => setCycleForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="Data de encerramento" type="date" value={cycleForm.end_date} onChange={e => setCycleForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCycleModal(false)}>Cancelar</Button>
            <Button onClick={saveCycle}>Salvar ciclo</Button>
          </div>
        </div>
      </Modal>

      {/* Eval Modal */}
      <Modal open={evalModal} onClose={() => setEvalModal(false)} title={editingEval ? 'Editar Avaliação' : 'Nova Avaliação'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome do colaborador *" value={evalForm.employee_name} onChange={e => setEvalForm(f => ({ ...f, employee_name: e.target.value }))} />
            <Input label="Avaliador" value={evalForm.evaluator} onChange={e => setEvalForm(f => ({ ...f, evaluator: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cargo" value={evalForm.position} onChange={e => setEvalForm(f => ({ ...f, position: e.target.value }))} />
            <Input label="Departamento" value={evalForm.department} onChange={e => setEvalForm(f => ({ ...f, department: e.target.value }))} />
          </div>
          <Select label="Status" value={evalForm.status} onChange={v => setEvalForm(f => ({ ...f, status: v as EvaluationStatus }))} options={STATUS_OPTS} />

          {competencies.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-3">Avaliação por competência</label>
              <div className="space-y-3">
                {competencies.map(comp => (
                  <div key={comp.id} className="flex items-center gap-3">
                    <span className="text-sm text-slate-700 flex-1">{comp.name}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n}
                          onClick={() => setEvalForm(f => ({ ...f, scores: { ...f.scores, [comp.name]: n } }))}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            (evalForm.scores[comp.name] ?? 0) >= n
                              ? 'bg-yellow-400 text-white'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Textarea label="Feedback" value={evalForm.feedback} onChange={e => setEvalForm(f => ({ ...f, feedback: e.target.value }))} rows={3} placeholder="Pontos fortes, oportunidades de melhoria..." />
          <Textarea label="Plano de desenvolvimento" value={evalForm.development_plan} onChange={e => setEvalForm(f => ({ ...f, development_plan: e.target.value }))} rows={3} placeholder="Ações de desenvolvimento para o próximo período..." />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEvalModal(false)}>Cancelar</Button>
            <Button onClick={saveEval}>Salvar avaliação</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
