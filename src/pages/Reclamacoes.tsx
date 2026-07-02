import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'
import { Feedback, FeedbackType, FeedbackStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const TYPE_LABELS: Record<FeedbackType, { label: string; icon: string; color: string }> = {
  reclamacao: { label: 'Reclamação', icon: '🚨', color: 'red' },
  sugestao: { label: 'Sugestão', icon: '💡', color: 'blue' },
  elogio: { label: 'Elogio', icon: '👏', color: 'green' },
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  novo: 'Novo',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
}

export default function Reclamacoes() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all')
  const [isRhUser, setIsRhUser] = useState(false)

  const [form, setForm] = useState({
    type: 'reclamacao' as FeedbackType,
    title: '',
    message: '',
    sender_name: '',
    sender_email: '',
  })

  const [editingResponse, setEditingResponse] = useState('')
  const [responseLoading, setResponseLoading] = useState(false)

  useEffect(() => {
    loadFeedbacks()
    checkIfRhUser()
  }, [])

  async function checkIfRhUser() {
    const { data: { user } } = await supabase.auth.getUser()
    // Simplificado: verificar se é um usuário RH (você pode adicionar lógica de role aqui)
    setIsRhUser(user?.email?.includes('rh') || user?.email?.includes('admin') || false)
  }

  async function loadFeedbacks() {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeedbacks(data || [])
    } catch (err) {
      console.error('Erro ao carregar feedbacks:', err)
    } finally {
      setLoading(false)
    }
  }

  async function submitFeedback() {
    if (!form.title.trim() || !form.message.trim()) return

    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([
          {
            type: form.type,
            title: form.title,
            message: form.message,
            sender_name: form.sender_name || null,
            sender_email: form.sender_email || null,
            status: 'novo',
          },
        ])
        .select()

      if (error) throw error

      setFeedbacks([data[0], ...feedbacks])
      setForm({ type: 'reclamacao', title: '', message: '', sender_name: '', sender_email: '' })
      setModalOpen(false)
      alert('✓ Obrigado! Sua mensagem foi enviada com sucesso!')
    } catch (err) {
      console.error('Erro ao enviar:', err)
      alert('❌ Erro ao enviar. Tente novamente.')
    }
  }

  async function updateStatus(id: string, newStatus: FeedbackStatus) {
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f))
      if (selectedFeedback?.id === id) setSelectedFeedback({ ...selectedFeedback, status: newStatus })
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
    }
  }

  async function submitResponse() {
    if (!selectedFeedback || !editingResponse.trim()) return

    setResponseLoading(true)
    try {
      const { error } = await supabase
        .from('feedbacks')
        .update({
          response: editingResponse,
          response_date: new Date().toISOString(),
          status: 'resolvido',
        })
        .eq('id', selectedFeedback.id)

      if (error) throw error

      const updated = { ...selectedFeedback, response: editingResponse, response_date: new Date().toISOString(), status: 'resolvido' as FeedbackStatus }
      setFeedbacks(feedbacks.map(f => f.id === selectedFeedback.id ? updated : f))
      setSelectedFeedback(updated)
      setEditingResponse('')
      alert('✓ Resposta enviada com sucesso!')
    } catch (err) {
      console.error('Erro ao enviar resposta:', err)
      alert('❌ Erro ao enviar resposta.')
    } finally {
      setResponseLoading(false)
    }
  }

  const filtered = feedbacks.filter(f => {
    const typeMatch = filterType === 'all' || f.type === filterType
    const statusMatch = filterStatus === 'all' || f.status === filterStatus
    return typeMatch && statusMatch
  })

  const stats = {
    total: feedbacks.length,
    novo: feedbacks.filter(f => f.status === 'novo').length,
    emAndamento: feedbacks.filter(f => f.status === 'em_andamento').length,
    resolvido: feedbacks.filter(f => f.status === 'resolvido').length,
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Canal de Feedback</h1>
        <p className="text-slate-600 mt-1">Feedbacks recebidos via Google Forms</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="py-4"><p className="text-2xl font-bold text-slate-800">{stats.total}</p><p className="text-sm text-slate-500 mt-1">Total</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-2xl font-bold text-red-600">{stats.novo}</p><p className="text-sm text-slate-500 mt-1">Novos</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-2xl font-bold text-yellow-600">{stats.emAndamento}</p><p className="text-sm text-slate-500 mt-1">Em andamento</p></CardContent></Card>
        <Card><CardContent className="py-4"><p className="text-2xl font-bold text-green-600">{stats.resolvido}</p><p className="text-sm text-slate-500 mt-1">Resolvidos</p></CardContent></Card>
      </div>

      {/* Filters - only show for RH users */}
      {isRhUser && (
        <div className="flex gap-4">
          <Select
            label="Tipo"
            value={filterType}
            onChange={(v) => setFilterType(v as FeedbackType | 'all')}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'reclamacao', label: '🚨 Reclamações' },
              { value: 'sugestao', label: '💡 Sugestões' },
              { value: 'elogio', label: '👏 Elogios' },
            ]}
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as FeedbackStatus | 'all')}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'novo', label: 'Novo' },
              { value: 'em_andamento', label: 'Em andamento' },
              { value: 'resolvido', label: 'Resolvido' },
            ]}
          />
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center">
            <MessageSquare size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum feedback encontrado</p>
          </CardContent></Card>
        ) : (
          filtered.map(f => (
            <Card key={f.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setSelectedFeedback(f); setDetailsOpen(true) }}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{TYPE_LABELS[f.type].icon}</span>
                      <h3 className="font-semibold text-slate-800">{f.title}</h3>
                      <StatusBadge status={f.status as any} />
                    </div>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{f.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{formatDate(f.created_at)}</span>
                      {f.response && <span className="text-green-600">✓ Respondido</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {f.status === 'novo' && <AlertCircle size={20} className="text-red-500" />}
                    {f.status === 'em_andamento' && <Clock size={20} className="text-yellow-500" />}
                    {f.status === 'resolvido' && <CheckCircle size={20} className="text-green-500" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>


      {/* Modal - Detalhes + Resposta */}
      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={`${TYPE_LABELS[selectedFeedback?.type || 'sugestao'].icon} ${selectedFeedback?.title}`} size="xl">
        {selectedFeedback && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Tipo</label>
              <Badge className="mt-1">{TYPE_LABELS[selectedFeedback.type].label}</Badge>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              {isRhUser ? (
                <Select
                  value={selectedFeedback.status}
                  onChange={(v) => updateStatus(selectedFeedback.id, v as FeedbackStatus)}
                  options={[
                    { value: 'novo', label: 'Novo' },
                    { value: 'em_andamento', label: 'Em andamento' },
                    { value: 'resolvido', label: 'Resolvido' },
                  ]}
                />
              ) : (
                <Badge className="mt-1">{STATUS_LABELS[selectedFeedback.status]}</Badge>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Mensagem</label>
              <div className="mt-1 p-3 bg-slate-50 rounded text-sm text-slate-700 border border-slate-200">{selectedFeedback.message}</div>
            </div>

            {selectedFeedback.sender_name && (
              <div>
                <label className="text-sm font-medium text-slate-700">De</label>
                <p className="text-sm text-slate-600">{selectedFeedback.sender_name}</p>
              </div>
            )}

            {selectedFeedback.sender_email && (
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-sm text-slate-600">{selectedFeedback.sender_email}</p>
              </div>
            )}

            {!selectedFeedback.sender_name && !selectedFeedback.sender_email && (
              <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-600">
                🔒 Feedback anônimo
              </div>
            )}

            {isRhUser && (
              <>
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Resposta {selectedFeedback.response && '✓'}</label>
                  <Textarea
                    value={editingResponse || selectedFeedback.response || ''}
                    onChange={(e) => setEditingResponse(e.target.value)}
                    placeholder="Escreva uma resposta para este feedback..."
                    rows={4}
                  />
                </div>

                {selectedFeedback.response_date && (
                  <div className="text-xs text-slate-500">
                    Respondido em: {formatDate(selectedFeedback.response_date)}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setDetailsOpen(false)}>Fechar</Button>
                  <Button onClick={submitResponse} disabled={responseLoading}>
                    {responseLoading ? 'Enviando...' : 'Enviar Resposta'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
