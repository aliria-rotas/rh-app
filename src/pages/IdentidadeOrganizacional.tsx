import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { dbIdentity } from '@/lib/db'
import { OrganizationalIdentity } from '@/types'
import { Pencil, Plus, X, Check, Lightbulb, Target, Heart, Compass } from 'lucide-react'

const EMPTY: OrganizationalIdentity = {
  id: 'singleton',
  mission: '',
  vision: '',
  values: [],
  strategic_objectives: '',
  culture_description: '',
  created_at: '',
  updated_at: '',
}

export default function IdentidadeOrganizacional() {
  const [data, setData] = useState<OrganizationalIdentity>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<OrganizationalIdentity>(EMPTY)
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    dbIdentity.get().then(d => {
      if (d) { setData(d); setDraft(d) }
      setLoading(false)
    })
  }, [])

  function startEdit(field: string) {
    setDraft({ ...data })
    setEditing(field)
  }

  async function save() {
    const updated = await dbIdentity.upsert(draft)
    setData(updated)
    setDraft(updated)
    setEditing(null)
  }

  function cancel() {
    setDraft(data)
    setEditing(null)
  }

  function addValue() {
    if (!newValue.trim()) return
    setDraft(d => ({ ...d, values: [...d.values, newValue.trim()] }))
    setNewValue('')
  }

  function removeValue(i: number) {
    setDraft(d => ({ ...d, values: d.values.filter((_, idx) => idx !== i) }))
  }

  const isEmpty = !data.mission && !data.vision && !data.values.length && !data.strategic_objectives

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {isEmpty && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          Comece preenchendo a identidade organizacional — ela é a base para todos os demais módulos.
        </div>
      )}

      {/* Missão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Target size={16} className="text-blue-600" />
              </div>
              <CardTitle>Missão</CardTitle>
            </div>
            {editing !== 'mission' && (
              <Button variant="ghost" size="sm" onClick={() => startEdit('mission')}>
                <Pencil size={14} /> Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing === 'mission' ? (
            <div className="space-y-3">
              <Textarea
                value={draft.mission}
                onChange={e => setDraft(d => ({ ...d, mission: e.target.value }))}
                rows={3}
                placeholder="Ex: Transformar a gestão de pessoas em vantagem competitiva..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={save}><Check size={14} /> Salvar</Button>
                <Button size="sm" variant="secondary" onClick={cancel}><X size={14} /> Cancelar</Button>
              </div>
            </div>
          ) : (
            <p className={data.mission ? 'text-slate-700 text-sm leading-relaxed' : 'text-slate-400 text-sm italic'}>
              {data.mission || 'Missão não definida. Clique em Editar para preencher.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Visão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Compass size={16} className="text-purple-600" />
              </div>
              <CardTitle>Visão</CardTitle>
            </div>
            {editing !== 'vision' && (
              <Button variant="ghost" size="sm" onClick={() => startEdit('vision')}>
                <Pencil size={14} /> Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing === 'vision' ? (
            <div className="space-y-3">
              <Textarea
                value={draft.vision}
                onChange={e => setDraft(d => ({ ...d, vision: e.target.value }))}
                rows={3}
                placeholder="Ex: Ser referência nacional em gestão personalizada de pessoas até 2030..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={save}><Check size={14} /> Salvar</Button>
                <Button size="sm" variant="secondary" onClick={cancel}><X size={14} /> Cancelar</Button>
              </div>
            </div>
          ) : (
            <p className={data.vision ? 'text-slate-700 text-sm leading-relaxed' : 'text-slate-400 text-sm italic'}>
              {data.vision || 'Visão não definida. Clique em Editar para preencher.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Valores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <Heart size={16} className="text-red-500" />
              </div>
              <CardTitle>Valores</CardTitle>
            </div>
            {editing !== 'values' && (
              <Button variant="ghost" size="sm" onClick={() => startEdit('values')}>
                <Pencil size={14} /> Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing === 'values' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 min-h-8">
                {draft.values.map((v, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
                    {v}
                    <button onClick={() => removeValue(i)} className="hover:text-red-900">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addValue()}
                  placeholder="Adicionar valor (Enter para confirmar)"
                />
                <Button size="sm" variant="outline" onClick={addValue}><Plus size={14} /></Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={save}><Check size={14} /> Salvar</Button>
                <Button size="sm" variant="secondary" onClick={cancel}><X size={14} /> Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.values.length > 0
                ? data.values.map((v, i) => (
                    <Badge key={i} variant="red">{v}</Badge>
                  ))
                : <p className="text-slate-400 text-sm italic">Nenhum valor definido.</p>
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Objetivos Estratégicos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Lightbulb size={16} className="text-yellow-600" />
              </div>
              <CardTitle>Objetivos Estratégicos</CardTitle>
            </div>
            {editing !== 'objectives' && (
              <Button variant="ghost" size="sm" onClick={() => startEdit('objectives')}>
                <Pencil size={14} /> Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing === 'objectives' ? (
            <div className="space-y-3">
              <Textarea
                value={draft.strategic_objectives}
                onChange={e => setDraft(d => ({ ...d, strategic_objectives: e.target.value }))}
                rows={4}
                placeholder="Descreva os objetivos estratégicos da organização..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={save}><Check size={14} /> Salvar</Button>
                <Button size="sm" variant="secondary" onClick={cancel}><X size={14} /> Cancelar</Button>
              </div>
            </div>
          ) : (
            <p className={data.strategic_objectives ? 'text-slate-700 text-sm leading-relaxed whitespace-pre-line' : 'text-slate-400 text-sm italic'}>
              {data.strategic_objectives || 'Objetivos estratégicos não definidos.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cultura */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Descrição da Cultura</CardTitle>
            {editing !== 'culture' && (
              <Button variant="ghost" size="sm" onClick={() => startEdit('culture')}>
                <Pencil size={14} /> Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing === 'culture' ? (
            <div className="space-y-3">
              <Textarea
                value={draft.culture_description}
                onChange={e => setDraft(d => ({ ...d, culture_description: e.target.value }))}
                rows={4}
                placeholder="Descreva a cultura organizacional, ambiente de trabalho, comportamentos esperados..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={save}><Check size={14} /> Salvar</Button>
                <Button size="sm" variant="secondary" onClick={cancel}><X size={14} /> Cancelar</Button>
              </div>
            </div>
          ) : (
            <p className={data.culture_description ? 'text-slate-700 text-sm leading-relaxed whitespace-pre-line' : 'text-slate-400 text-sm italic'}>
              {data.culture_description || 'Cultura organizacional não descrita.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
