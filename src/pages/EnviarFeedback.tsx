import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { FeedbackType } from '@/types'
import { MessageSquare } from 'lucide-react'

const TYPE_OPTIONS = [
  { value: 'reclamacao', label: '🚨 Reclamação' },
  { value: 'sugestao', label: '💡 Sugestão' },
  { value: 'elogio', label: '👏 Elogio' },
]

export default function EnviarFeedback() {
  const [type, setType] = useState<FeedbackType>('sugestao')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      alert('⚠️ Preencha título e mensagem!')
      return
    }

    setLoading(true)
    try {
      // Insere no Supabase
      const { data, error } = await supabase
        .from('feedbacks')
        .insert([
          {
            type,
            title,
            message,
            sender_name: senderName || null,
            sender_email: senderEmail || null,
            status: 'novo',
          },
        ])
        .select()

      if (error) throw error

      // Envia email (via função Supabase)
      try {
        await supabase.functions.invoke('send-feedback-email', {
          body: {
            feedbackId: data[0].id,
            type,
            title,
            message,
            senderName: senderName || 'Anônimo',
            senderEmail: senderEmail || 'Não informado',
          },
        })
      } catch (emailErr) {
        console.warn('Email não foi enviado, mas feedback foi salvo:', emailErr)
      }

      setSuccess(true)
      setTitle('')
      setMessage('')
      setSenderName('')
      setSenderEmail('')
      setType('sugestao')

      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Erro:', err)
      alert('❌ Erro ao enviar feedback. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={24} className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Enviar Feedback</h1>
              <p className="text-sm text-slate-500">Sua opinião é importante para nós</p>
            </div>
          </div>

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">✓ Obrigado! Seu feedback foi enviado com sucesso.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Select
                label="Tipo de Feedback *"
                value={type}
                onChange={(v) => setType(v as FeedbackType)}
                options={TYPE_OPTIONS}
              />
            </div>

            <Input
              label="Título *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumo do feedback"
              disabled={loading}
            />

            <Textarea
              label="Mensagem *"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detalhe seu feedback..."
              rows={5}
              disabled={loading}
            />

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Dados Opcionais</p>
              <p className="text-xs">Os campos abaixo são opcionais. Deixe em branco para ser totalmente anônimo.</p>
            </div>

            <Input
              label="Seu Nome (opcional)"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Deixe em branco para ser anônimo"
              disabled={loading}
            />

            <Input
              label="Email (opcional)"
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="Para receber resposta"
              disabled={loading}
            />

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Enviando...' : '📤 Enviar Feedback'}
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            🔒 Seus dados são confidenciais e usados apenas para responder seu feedback.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
