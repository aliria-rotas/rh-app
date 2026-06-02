import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { Download, Mail, MessageSquare, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

// Respostas corretas para cada pergunta
const CORRECT_ANSWERS: {[key: number]: string} = {
  2: 'A) O medicamento não está disponível, mais temos outros que você pode usar.',
  3: 'A) Vou estar consultando seu histórico e já retorno com a informação.',
  4: 'A) Vou estar verificando o status e retorno para você.',
  7: 'B) Clareza e objetividade',
  9: 'B) Favor enviar o documento para análise.',
  11: 'B) Demonstrar compreensão e buscar uma solução',
  13: 'B) Em toda conversa',
}

interface Response {
  id: string
  training_id?: string
  training_title?: string
  collaborator_name: string
  collaborator_email: string
  question_2_response?: string
  question_3_response?: string
  question_4_response?: string
  question_5_response?: string
  question_6_response?: string
  question_7_response?: string
  question_8_response?: string
  question_9_response?: string
  question_10_response?: string
  question_11_response?: string
  question_13_response?: string
  question_14_response?: string
  created_at: string
  completed_at?: string
}

interface TrainningResponsesProps {
  trainingId?: string
  trainingTitle?: string
}

export function TrainningResponses({ trainingId, trainingTitle }: TrainningResponsesProps = {}) {
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadResponses()
  }, [trainingId])

  async function loadResponses() {
    try {
      setLoading(true)

      // Ler direto da tabela (sem RPC que pode ter erro)
      const { data, error: fetchError } = await supabase
        .from('rh_training_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setResponses(data || [])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar respostas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function exportToCSV() {
    if (responses.length === 0) return

    const headers = ['Nome', 'Email', 'Data', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q13', 'Q14']
    const rows = responses.map(r => [
      r.collaborator_name,
      r.collaborator_email,
      new Date(r.created_at || r.completed_at || '').toLocaleDateString('pt-BR'),
      `"${r.question_2_response || ''}"`,
      `"${r.question_3_response || ''}"`,
      `"${r.question_4_response || ''}"`,
      `"${r.question_5_response || ''}"`,
      `"${r.question_6_response || ''}"`,
      `"${r.question_7_response || ''}"`,
      `"${r.question_8_response || ''}"`,
      `"${r.question_9_response || ''}"`,
      `"${r.question_10_response || ''}"`,
      `"${r.question_11_response || ''}"`,
      `"${r.question_13_response || ''}"`,
      `"${r.question_14_response || ''}"`,
    ])

    let csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    csv = '﻿' + csv // BOM for proper UTF-8 in Excel

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `respostas-treinamento-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Erro ao carregar respostas</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <Button onClick={loadResponses} className="mt-3 bg-red-600 hover:bg-red-700">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📋 Respostas do Treinamento</h2>
          <p className="text-gray-600 text-sm mt-1">{trainingTitle || 'Atendimento Empático em Chatbot'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadResponses}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            🔄 Atualizar
          </Button>
          <Button
            onClick={exportToCSV}
            disabled={responses.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download size={16} /> Exportar CSV
          </Button>
        </div>
      </div>

      {responses.length === 0 ? (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="py-12 text-center">
            <MessageSquare className="text-gray-300 mx-auto mb-3" size={40} />
            <h3 className="font-bold text-gray-900 mb-1">Nenhuma resposta ainda</h3>
            <p className="text-gray-600 text-sm mb-6">
              Compartilhe o link do treinamento com seus colaboradores para começar a receber respostas.
            </p>
            <Button
              onClick={() => {
                const link = `https://aliria-rotas.github.io/rh-app/treinamento-publico?id=chatbot_empatico_001`
                navigator.clipboard.writeText(link)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Copiar Link do Treinamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {Object.entries(
            responses.reduce((acc: Record<string, Response[]>, resp) => {
              const trainId = resp.training_id || 'chatbot_empatico_001'
              if (!acc[trainId]) acc[trainId] = []
              acc[trainId].push(resp)
              return acc
            }, {})
          ).map(([trainId, trainResponses]) => (
            <div key={trainId} className="space-y-4">
              <div className="border-b-2 border-orange-300 pb-3">
                <h3 className="text-xl font-bold text-gray-900">📚 Treinamento: {trainResponses[0]?.training_title || trainId}</h3>
              </div>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{trainResponses.length}</p>
                      <p className="text-sm text-blue-700">Respostas recebidas</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-600">{trainResponses.length}</p>
                      <p className="text-sm text-green-700">Completos (100%)</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-orange-600">100%</p>
                      <p className="text-sm text-orange-700">Taxa de conclusão</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {trainResponses.map(response => (
              <Card
                key={response.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-gray-200"
                onClick={() => setExpandedId(expandedId === response.id ? null : response.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{response.collaborator_name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail size={14} /> {response.collaborator_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(response.created_at || response.completed_at || '').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium">
                        {expandedId === response.id ? '▼' : '▶'} VER RESPOSTAS
                      </p>
                    </div>
                  </div>

                  {expandedId === response.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                      {/* Perguntas Múltipla Escolha */}
                      <div className="mb-6 pb-6 border-b border-gray-300">
                        <h4 className="font-bold text-base text-gray-900 mb-4">📋 Múltipla Escolha</h4>
                        <div className="space-y-4">
                          {[
                            { q: 2, title: 'Q2: MAIS vs MAS', resp: response.question_2_response },
                            { q: 3, title: 'Q3: Gerundismo', resp: response.question_3_response },
                            { q: 4, title: 'Q4: Estar vs Ir', resp: response.question_4_response },
                            { q: 7, title: 'Q7: Chat Características', resp: response.question_7_response },
                            { q: 9, title: 'Q9: Comunicação Profissional', resp: response.question_9_response },
                            { q: 11, title: 'Q11: Lidar com Reclamações', resp: response.question_11_response },
                            { q: 13, title: 'Q13: Transferir para Humano', resp: response.question_13_response },
                          ].map(({ q, title, resp }) => {
                            const isCorrect = resp === CORRECT_ANSWERS[q]
                            return resp ? (
                              <div key={q} className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                                <div className="flex items-start gap-3">
                                  {isCorrect ? (
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                  ) : (
                                    <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-xs font-bold mb-3">{title}</p>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <p className="font-semibold text-gray-900">Resposta selecionada:</p>
                                        <p className={`text-gray-700 ${isCorrect ? 'text-green-700 font-semibold' : ''}`}>{resp}</p>
                                      </div>
                                      {!isCorrect && (
                                        <div className="border-t pt-2">
                                          <p className="font-semibold text-gray-900">Resposta correta:</p>
                                          <p className="text-green-700 font-semibold">{CORRECT_ANSWERS[q]}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>

                      {/* Perguntas Abertas */}
                      <div className="mb-6">
                        <h4 className="font-bold text-base text-gray-900 mb-4">📝 Respostas Abertas</h4>
                        <div className="space-y-3">
                          {response.question_5_response && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <p className="text-xs font-bold text-green-900 mb-1">Q5: Investigação + Empatia</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.question_5_response}</p>
                            </div>
                          )}
                          {response.question_6_response && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <p className="text-xs font-bold text-green-900 mb-1">Q6: Chamar Cliente</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.question_6_response}</p>
                            </div>
                          )}
                          {response.question_8_response && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <p className="text-xs font-bold text-green-900 mb-1">Q8: Reescrever Cordialmente</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.question_8_response}</p>
                            </div>
                          )}
                          {response.question_10_response && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <p className="text-xs font-bold text-green-900 mb-1">Q10: Pergunta Clarificadora</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.question_10_response}</p>
                            </div>
                          )}
                          {response.question_14_response && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <p className="text-xs font-bold text-green-900 mb-1">Q14: Erro de Comunicação</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.question_14_response}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            const subject = `Feedback: Treinamento Atendimento Empático`
                            const body = `Oi ${response.collaborator_name},\n\nObrigado por completar o treinamento! Aqui está meu feedback sobre suas respostas:\n\n...`
                            window.location.href = `mailto:${response.collaborator_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          ✉️ Enviar Feedback por Email
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
