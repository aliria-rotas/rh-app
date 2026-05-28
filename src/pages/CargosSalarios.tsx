import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { dbSalaryGrades } from '@/lib/db'
import { SalaryGrade } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, X } from 'lucide-react'

const LEVEL_OPTS = [
  { value: 'Júnior', label: 'Júnior' },
  { value: 'Pleno', label: 'Pleno' },
  { value: 'Sênior', label: 'Sênior' },
  { value: 'Especialista', label: 'Especialista' },
  { value: 'Coordenador', label: 'Coordenador' },
  { value: 'Gerente', label: 'Gerente' },
  { value: 'Diretor', label: 'Diretor' },
]

const EMPTY_FORM = {
  grade: '',
  level: 'Pleno',
  min_salary: 0,
  mid_salary: 0,
  max_salary: 0,
  positions: [] as string[],
}

export default function CargosSalarios() {
  const [grades, setGrades] = useState<SalaryGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<SalaryGrade | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [positionInput, setPositionInput] = useState('')

  useEffect(() => {
    dbSalaryGrades.list().then(data => { setGrades(data); setLoading(false) })
  }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModal(true)
  }

  function openEdit(g: SalaryGrade) {
    setEditing(g)
    setForm({
      grade: g.grade, level: g.level,
      min_salary: g.min_salary, mid_salary: g.mid_salary, max_salary: g.max_salary,
      positions: [...g.positions],
    })
    setModal(true)
  }

  async function save() {
    if (!form.grade.trim()) return
    // Auto-calcular mid se não preenchido
    const mid = form.mid_salary || Math.round((form.min_salary + form.max_salary) / 2)
    const updated_form = { ...form, mid_salary: mid }
    if (editing) {
      const updated = await dbSalaryGrades.update(editing.id, updated_form)
      setGrades(prev => prev.map(g => g.id === editing.id ? updated : g))
    } else {
      const created = await dbSalaryGrades.create(updated_form)
      setGrades(prev => [...prev, created])
    }
    setModal(false)
  }

  async function remove(id: string) {
    await dbSalaryGrades.remove(id)
    setGrades(prev => prev.filter(g => g.id !== id))
  }

  function addPosition() {
    if (!positionInput.trim()) return
    setForm(f => ({ ...f, positions: [...f.positions, positionInput.trim()] }))
    setPositionInput('')
  }

  function removePosition(i: number) {
    setForm(f => ({ ...f, positions: f.positions.filter((_, idx) => idx !== i) }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  // Amplitude salarial = (max - min) / min * 100
  function amplitude(g: SalaryGrade) {
    if (!g.min_salary) return 0
    return Math.round(((g.max_salary - g.min_salary) / g.min_salary) * 100)
  }

  const sortedGrades = [...grades].sort((a, b) => a.min_salary - b.min_salary)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-end">
        <Button onClick={openNew}><Plus size={16} /> Nova Faixa Salarial</Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold text-slate-800">{grades.length}</p>
          <p className="text-sm text-slate-500 mt-1">Faixas cadastradas</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <p className="text-lg font-bold text-green-600">
            {grades.length > 0 ? formatCurrency(Math.min(...grades.map(g => g.min_salary))) : '—'}
          </p>
          <p className="text-sm text-slate-500 mt-1">Menor salário mínimo</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <p className="text-lg font-bold text-blue-600">
            {grades.length > 0 ? formatCurrency(Math.max(...grades.map(g => g.max_salary))) : '—'}
          </p>
          <p className="text-sm text-slate-500 mt-1">Maior salário máximo</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold text-purple-600">
            {grades.reduce((a, g) => a + g.positions.length, 0)}
          </p>
          <p className="text-sm text-slate-500 mt-1">Cargos enquadrados</p>
        </CardContent></Card>
      </div>

      {/* Tabela salarial */}
      {grades.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <DollarSign size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma faixa salarial cadastrada</p>
          <p className="text-slate-400 text-sm mt-1">Estruture o plano de cargos e salários da organização.</p>
          <Button className="mt-4" onClick={openNew}><Plus size={16} /> Criar faixa</Button>
        </CardContent></Card>
      ) : (
        <>
          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Faixas Salariais</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Faixa</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nível</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mínimo</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Referência</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Máximo</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amplitude</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGrades.map(g => (
                    <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-slate-800">{g.grade}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{g.level}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(g.min_salary)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{formatCurrency(g.mid_salary)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(g.max_salary)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          amplitude(g) > 50 ? 'bg-orange-100 text-orange-700' :
                          amplitude(g) > 30 ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {amplitude(g)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(g)}>
                            <Pencil size={13} />
                          </Button>
                          <Button variant="ghost" size="sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => remove(g.id)}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Cargos por faixa */}
          <div className="grid gap-4">
            {sortedGrades.filter(g => g.positions.length > 0).map(g => (
              <Card key={g.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <p className="font-semibold text-slate-800">{g.grade}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{g.level}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 mb-2">Cargos enquadrados nesta faixa:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {g.positions.map((pos, i) => (
                          <Badge key={i} variant="blue">{pos}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500">Faixa salarial</p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatCurrency(g.min_salary)} – {formatCurrency(g.max_salary)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Visualização gráfica simples */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Faixas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedGrades.map(g => {
                  const max = Math.max(...grades.map(gr => gr.max_salary))
                  const minPct = (g.min_salary / max) * 100
                  const maxPct = (g.max_salary / max) * 100
                  const midPct = (g.mid_salary / max) * 100
                  return (
                    <div key={g.id} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-600 w-24 flex-shrink-0">{g.grade}</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-full relative overflow-hidden">
                        <div
                          className="absolute h-full bg-blue-200 rounded-full"
                          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
                        />
                        <div
                          className="absolute h-full w-0.5 bg-blue-600"
                          style={{ left: `${midPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-28 flex-shrink-0 text-right">
                        {formatCurrency(g.mid_salary)}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400 mt-3">A barra indica a faixa mín-máx; a linha vertical marca a referência (midpoint).</p>
            </CardContent>
          </Card>
        </>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Editar Faixa Salarial' : 'Nova Faixa Salarial'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código da faixa *"
              value={form.grade}
              onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
              placeholder="Ex: G1, A2, Faixa 3..."
            />
            <Select
              label="Nível"
              value={form.level}
              onChange={v => setForm(f => ({ ...f, level: v }))}
              options={LEVEL_OPTS}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Salário mínimo (R$)"
              type="number"
              value={form.min_salary || ''}
              onChange={e => setForm(f => ({ ...f, min_salary: +e.target.value }))}
            />
            <Input
              label="Referência / Midpoint (R$)"
              type="number"
              value={form.mid_salary || ''}
              onChange={e => setForm(f => ({ ...f, mid_salary: +e.target.value }))}
              placeholder="Calculado automaticamente"
            />
            <Input
              label="Salário máximo (R$)"
              type="number"
              value={form.max_salary || ''}
              onChange={e => setForm(f => ({ ...f, max_salary: +e.target.value }))}
            />
          </div>

          {form.min_salary > 0 && form.max_salary > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
              Amplitude: <strong>{Math.round(((form.max_salary - form.min_salary) / form.min_salary) * 100)}%</strong>
              {' · '}Midpoint automático: <strong>{formatCurrency(Math.round((form.min_salary + form.max_salary) / 2))}</strong>
            </div>
          )}

          {/* Cargos */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Cargos nesta faixa</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.positions.map((pos, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {pos}
                  <button onClick={() => removePosition(i)} className="hover:text-blue-900">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={positionInput}
                onChange={e => setPositionInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPosition()}
                placeholder="Ex: Analista de RH Pleno (Enter para confirmar)"
              />
              <Button variant="outline" size="sm" onClick={addPosition}><Plus size={14} /></Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar faixa</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
