import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { dbPositions } from '@/lib/db'
import { Position, CareerLevel } from '@/types'
import { formatCurrency, STATUS_LABELS } from '@/lib/utils'
import { Plus, Pencil, Trash2, Users, X, Search } from 'lucide-react'

const LEVEL_OPTS = [
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'lideranca', label: 'Liderança' },
  { value: 'direcao', label: 'Direção' },
]

const LEVEL_COLORS: Record<CareerLevel, string> = {
  junior: 'bg-green-100 text-green-700',
  pleno: 'bg-blue-100 text-blue-700',
  senior: 'bg-purple-100 text-purple-700',
  especialista: 'bg-orange-100 text-orange-700',
  lideranca: 'bg-red-100 text-red-700',
  direcao: 'bg-slate-800 text-white',
}

const EMPTY_FORM = {
  title: '', department: '', career_level: 'pleno' as CareerLevel,
  description: '', responsibilities: [] as string[], requirements: [] as string[],
  competencies: [] as string[], salary_range_min: 0, salary_range_max: 0,
}

export default function Cargos() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Position | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [newItem, setNewItem] = useState<Record<string, string>>({ resp: '', req: '', comp: '' })

  useEffect(() => {
    dbPositions.list().then(data => { setPositions(data); setLoading(false) })
  }, [])

  function openNew() {
    setEditing(null); setForm(EMPTY_FORM); setModal(true)
  }

  function openEdit(p: Position) {
    setEditing(p)
    setForm({
      title: p.title, department: p.department, career_level: p.career_level,
      description: p.description, responsibilities: [...p.responsibilities],
      requirements: [...p.requirements], competencies: [...p.competencies],
      salary_range_min: p.salary_range_min, salary_range_max: p.salary_range_max,
    })
    setModal(true)
  }

  async function save() {
    if (!form.title.trim()) return
    if (editing) {
      const updated = await dbPositions.update(editing.id, form)
      setPositions(prev => prev.map(p => p.id === editing.id ? updated : p))
    } else {
      const created = await dbPositions.create(form)
      setPositions(prev => [...prev, created])
    }
    setModal(false)
  }

  async function remove(id: string) {
    await dbPositions.remove(id)
    setPositions(prev => prev.filter(p => p.id !== id))
  }

  function addListItem(field: 'responsibilities' | 'requirements' | 'competencies', key: string) {
    const val = newItem[key]?.trim()
    if (!val) return
    setForm(f => ({ ...f, [field]: [...(f[field] as string[]), val] }))
    setNewItem(n => ({ ...n, [key]: '' }))
  }

  function removeListItem(field: 'responsibilities' | 'requirements' | 'competencies', i: number) {
    setForm(f => ({ ...f, [field]: (f[field] as string[]).filter((_, idx) => idx !== i) }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  const filtered = positions.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.department.toLowerCase().includes(search.toLowerCase())
  )

  const departments = [...new Set(positions.map(p => p.department))].filter(Boolean)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cargo ou departamento..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={openNew}><Plus size={16} /> Novo Cargo</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold">{positions.length}</p>
          <p className="text-sm text-slate-500 mt-1">Cargos cadastrados</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold">{departments.length}</p>
          <p className="text-sm text-slate-500 mt-1">Departamentos</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold">{positions.filter(p => p.career_level === 'lideranca' || p.career_level === 'direcao').length}</p>
          <p className="text-sm text-slate-500 mt-1">Cargos liderança</p>
        </CardContent></Card>
        <Card><CardContent className="py-4">
          <p className="text-2xl font-bold">{positions.filter(p => p.competencies.length > 0).length}</p>
          <p className="text-sm text-slate-500 mt-1">Com competências</p>
        </CardContent></Card>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Users size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{search ? 'Nenhum cargo encontrado' : 'Nenhum cargo cadastrado'}</p>
          {!search && <Button className="mt-4" onClick={openNew}><Plus size={16} /> Cadastrar cargo</Button>}
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(p => (
            <Card key={p.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{p.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[p.career_level]}`}>
                        {STATUS_LABELS[p.career_level]}
                      </span>
                      {p.department && <Badge variant="outline">{p.department}</Badge>}
                    </div>
                    {p.description && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{p.description}</p>}
                    <div className="flex gap-4 text-xs text-slate-500">
                      {p.responsibilities.length > 0 && <span>{p.responsibilities.length} responsabilidades</span>}
                      {p.competencies.length > 0 && <span>{p.competencies.length} competências</span>}
                      {p.salary_range_min > 0 && (
                        <span className="text-green-700 font-medium">
                          {formatCurrency(p.salary_range_min)} – {formatCurrency(p.salary_range_max)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => remove(p.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Cargo' : 'Novo Cargo'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Título do cargo *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Analista de RH" />
            <Input label="Departamento" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Ex: Recursos Humanos" />
          </div>
          <Select label="Nível" value={form.career_level} onChange={v => setForm(f => ({ ...f, career_level: v as CareerLevel }))} options={LEVEL_OPTS} />
          <Textarea label="Descrição do cargo" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Descreva o propósito do cargo..." />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Salário mínimo (R$)" type="number" value={form.salary_range_min || ''} onChange={e => setForm(f => ({ ...f, salary_range_min: +e.target.value }))} />
            <Input label="Salário máximo (R$)" type="number" value={form.salary_range_max || ''} onChange={e => setForm(f => ({ ...f, salary_range_max: +e.target.value }))} />
          </div>

          {/* Responsabilidades */}
          {(['responsibilities', 'requirements', 'competencies'] as const).map((field, fi) => {
            const labels = ['Responsabilidades', 'Requisitos', 'Competências']
            const keys = ['resp', 'req', 'comp']
            const placeholders = ['Ex: Coordenar processos seletivos...', 'Ex: Ensino superior em Psicologia...', 'Ex: Comunicação interpessoal']
            return (
              <div key={field}>
                <label className="text-sm font-medium text-slate-700 block mb-2">{labels[fi]}</label>
                <div className="space-y-1.5 mb-2">
                  {(form[field] as string[]).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm">
                      <span className="flex-1 text-slate-700">{item}</span>
                      <button onClick={() => removeListItem(field, i)} className="text-slate-400 hover:text-red-500"><X size={13} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newItem[keys[fi]] ?? ''}
                    onChange={e => setNewItem(n => ({ ...n, [keys[fi]]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && addListItem(field, keys[fi])}
                    placeholder={placeholders[fi]}
                  />
                  <Button variant="outline" size="sm" onClick={() => addListItem(field, keys[fi])}><Plus size={14} /></Button>
                </div>
              </div>
            )
          })}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar cargo</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
