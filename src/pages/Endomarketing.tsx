import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { dbEndomarketing } from '@/lib/db'
import { EndomarketingCampaign, CampaignStatus, CampaignType } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Megaphone, X } from 'lucide-react'

const STATUS_OPTS = [
  { value: 'planejada', label: 'Planejada' },
  { value: 'ativa', label: 'Ativa' },
  { value: 'encerrada', label: 'Encerrada' },
]

const TYPE_OPTS = [
  { value: 'comunicado', label: 'Comunicado' },
  { value: 'celebracao', label: 'Celebração' },
  { value: 'reconhecimento', label: 'Reconhecimento' },
  { value: 'campanha', label: 'Campanha' },
  { value: 'evento', label: 'Evento' },
]

const CHANNEL_OPTS = ['E-mail', 'Intranet', 'WhatsApp', 'Mural físico', 'Teams/Slack', 'Reunião', 'Newsletter', 'Vídeo']

const TYPE_ICONS: Record<CampaignType, string> = {
  comunicado: '📢', celebracao: '🎉', reconhecimento: '🏆', campanha: '🚀', evento: '📅'
}

export default function Endomarketing() {
  const [campaigns, setCampaigns] = useState<EndomarketingCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<EndomarketingCampaign | null>(null)
  const [form, setForm] = useState({
    title: '', type: 'comunicado' as CampaignType, status: 'planejada' as CampaignStatus,
    description: '', target_audience: '', channels: [] as string[], start_date: '', end_date: ''
  })
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    dbEndomarketing.list().then(data => { setCampaigns(data); setLoading(false) })
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ title: '', type: 'comunicado', status: 'planejada', description: '', target_audience: '', channels: [], start_date: '', end_date: '' })
    setModal(true)
  }

  async function save() {
    if (!form.title.trim()) return
    if (editing) {
      const updated = await dbEndomarketing.update(editing.id, form)
      setCampaigns(prev => prev.map(c => c.id === editing.id ? updated : c))
    } else {
      const created = await dbEndomarketing.create(form)
      setCampaigns(prev => [...prev, created])
    }
    setModal(false)
  }

  async function remove(id: string) {
    await dbEndomarketing.remove(id)
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  function toggleChannel(ch: string) {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch]
    }))
  }

  const filtered = campaigns.filter(c =>
    (filterType === 'all' || c.type === filterType) &&
    (filterStatus === 'all' || c.status === filterStatus)
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[['all', 'Todas'], ...TYPE_OPTS.map(t => [t.value, t.label])].map(([v, l]) => (
            <button key={v} onClick={() => setFilterType(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === v ? 'bg-pink-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {l}
            </button>
          ))}
        </div>
        <Button onClick={openNew}><Plus size={16} /> Nova Ação</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: campaigns.length },
          { label: 'Ativas', value: campaigns.filter(c => c.status === 'ativa').length, color: 'text-green-600' },
          { label: 'Planejadas', value: campaigns.filter(c => c.status === 'planejada').length, color: 'text-blue-600' },
          { label: 'Encerradas', value: campaigns.filter(c => c.status === 'encerrada').length, color: 'text-slate-500' },
        ].map(s => (
          <Card key={s.label}><CardContent className="py-4">
            <p className={`text-2xl font-bold ${s.color ?? 'text-slate-800'}`}>{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <Megaphone size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma ação de endomarketing</p>
          <Button className="mt-4" onClick={openNew}><Plus size={16} /> Criar ação</Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {[...filtered].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).map(c => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-lg">{TYPE_ICONS[c.type]}</span>
                      <h3 className="font-semibold text-slate-800">{c.title}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.description && <p className="text-sm text-slate-600 mb-2 line-clamp-2">{c.description}</p>}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {c.channels.map(ch => <Badge key={ch} variant="outline">{ch}</Badge>)}
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      {c.target_audience && <span>Público: {c.target_audience}</span>}
                      {c.start_date && <span>{formatDate(c.start_date)}{c.end_date && ` – ${formatDate(c.end_date)}`}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setForm({ title: c.title, type: c.type, status: c.status, description: c.description, target_audience: c.target_audience, channels: [...c.channels], start_date: c.start_date, end_date: c.end_date }); setModal(true) }}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => remove(c.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Ação' : 'Nova Ação de Endomarketing'} size="lg">
        <div className="space-y-4">
          <Input label="Título *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Semana do Colaborador" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo" value={form.type} onChange={v => setForm(f => ({ ...f, type: v as CampaignType }))} options={TYPE_OPTS} />
            <Select label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v as CampaignStatus }))} options={STATUS_OPTS} />
          </div>
          <Textarea label="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          <Input label="Público-alvo" value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))} placeholder="Ex: Todos os colaboradores, Equipe de vendas..." />

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Canais de comunicação</label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTS.map(ch => (
                <button key={ch} onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    form.channels.includes(ch) ? 'bg-pink-600 text-white border-pink-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de início" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            <Input label="Data de encerramento" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar ação</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
