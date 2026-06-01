#!/usr/bin/env python3
"""
Script para gerar TrainamentPublic.tsx com todos os 12 slides e 14 perguntas.
Estrutura: Pergunta + Feedback + Slides Relacionados
"""

TEMPLATE = '''import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { dbTrainings } from '@/lib/db'
import { CheckCircle } from 'lucide-react'
import type { TrainingAction } from '@/types'

export default function TrainmentPublic() {
  const [searchParams] = useSearchParams()
  const trainingId = searchParams.get('id')

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [training, setTraining] = useState<TrainingAction | null>(null)
  const [trainingLoading, setTrainingLoading] = useState(true)
  const [formData, setFormData] = useState({
    collaborator_name: '',
    collaborator_email: '',
    question_1_response: '',
    question_2_response: '',
    question_3_response: '',
    question_4_response: '',
    question_5_response: '',
    question_6_response: '',
    question_7_response: '',
    question_8_response: '',
    question_9_response: '',
    question_10_response: '',
    question_11_response: '',
    question_12_response: '',
    question_13_response: '',
    question_14_response: '',
  })

  const [questionFeedback, setQuestionFeedback] = useState<{[key: number]: {isCorrect: boolean; answered: boolean}}>({})
  const [answeredCount, setAnsweredCount] = useState(0)
  const [showSlides, setShowSlides] = useState(false)

  // Mapeamento de pergunta para slides explicativos
  const questionSlideMap: {[key: number]: number[]} = {
    2: [3, 4, 7],      // MAIS vs MAS → Palavras-Chave, Pontuação, Escrita Profissional
    3: [7],            // Gerúndio → Escrita Profissional
    4: [7],            // Vou estar verificando → Escrita Profissional
    7: [5],            // Característica chat → Comunicação no Chat
    9: [7, 3],         // Melhor comunicação → Escrita Profissional, Palavras-Chave
    11: [9, 2, 6],     // Reclamação/atitude → Situações Difíceis, Tom de Voz, Cordialidade
    13: [11]           // Transferir humano → Chatbot Best Practices
  }

  // Array ordenado com as perguntas MC na sequência desejada
  const mcQuestionsOrder = [2, 3, 4, 7, 9, 11, 13]

  // Perguntas abertas (sem validação)
  const openEndedQuestions = [1, 5, 6, 8, 10, 12, 14]

  // Respostas corretas das perguntas de múltipla escolha
  const correctAnswers: {[key: number]: string} = {
    2: 'B) Não temos este medicamento, mas posso oferecer outra opção com o mesmo princípio ativo.',
    3: 'B) Seu pedido está sendo preparado neste momento e você receberá em até 2 dias.',
    4: 'B) Vou verificar o status agora mesmo e retorno com você em 2 minutos.',
    7: 'B) Clareza e objetividade',
    9: 'B) Favor enviar o documento para análise.',
    11: 'B) Demonstrar compreensão e buscar uma solução',
    13: 'A) Quando o chatbot não consegue resolver a demanda após tentativas adequadas',
  }

  const slides = [
    {
      id: 1,
      title: '🎯 Os 3 Pilares do Atendimento Empático',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div><strong>🔍 Clareza</strong><br/>Mensagens diretas, sem ambiguidade</div>
            <div><strong>❤️ Empatia</strong><br/>Reconhecimento de sentimentos</div>
            <div><strong>⚡ Eficiência</strong><br/>Respostas rápidas e precisas</div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: '💬 Tom de Voz Ideal',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>🏢 Profissional</strong> - Competente, seguro</div>
          <div><strong>😊 Amigável</strong> - Acessível, personalizado</div>
          <div><strong>🙏 Respeitoso</strong> - Formal quando necessário</div>
          <div><strong>💝 Empático</strong> - Compreensivo das dificuldades</div>
        </div>
      ),
    },
    {
      id: 3,
      title: '✨ Palavras-Chave',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="text-center">
          <p className="text-sm">Por favor • Obrigado • Desculpa • Entendo • Claro • Sem problema • Com prazer • Fico feliz em ajudar</p>
          <p className="text-xs mt-4">Usar essas palavras demonstra respeito e cria conexão com o paciente</p>
        </div>
      ),
    },
    {
      id: 4,
      title: '📝 Pontuação nas Frases',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>📌 Ponto (.)</strong> - Afirmações objetivas</div>
          <div><strong>🔥 Exclamação (!)</strong> - Entusiasmo, apoio</div>
          <div><strong>❓ Interrogação (?)</strong> - Perguntas abertas</div>
          <div><strong>✖️ Reticências (...)</strong> - Pausa, reflexão</div>
        </div>
      ),
    },
    {
      id: 5,
      title: '💬 Comunicação no Chat',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>📞 Diferenças do Telefone</strong><br/>Chat é escrito e assíncrono</div>
          <div><strong>🎯 Clareza</strong><br/>Mensagens diretas e estruturadas</div>
          <div><strong>✍️ Linguagem Escrita</strong><br/>Importância de ortografia e gramática</div>
          <div><strong>👥 Adaptação</strong><br/>Ajustar tom conforme o cliente</div>
        </div>
      ),
    },
    {
      id: 6,
      title: '💝 Cordialidade no Chat',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>❤️ Empatia</strong> - Demonstrar compreensão genuína</div>
          <div><strong>👋 Saudações</strong> - "Olá", "Bom dia", "Como posso ajudá-lo?"</div>
          <div><strong>✨ Linguagem Positiva</strong> - Focar no que você pode fazer</div>
          <div><strong>⚠️ Evitar Rudeza</strong> - Sem tom agressivo ou impaciente</div>
        </div>
      ),
    },
    {
      id: 7,
      title: '📖 Escrita Profissional',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>✅ Gramática</strong> - Revisar antes de enviar</div>
          <div><strong>📌 Pontuação</strong> - Usar corretamente</div>
          <div><strong>🚫 Abreviações</strong> - "Você" não "Vc"</div>
          <div><strong>📋 Padronização</strong> - Consistência em estilo</div>
        </div>
      ),
    },
    {
      id: 8,
      title: '👂 Escuta Ativa',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>🎯 Interpretação Correta</strong> - Entender o real problema</div>
          <div><strong>❓ Perguntas Clarificadoras</strong> - Demonstrar interesse</div>
          <div><strong>✔️ Confirmação</strong> - "Entendi corretamente?"</div>
          <div><strong>💬 Respostas Completas</strong> - Não deixar dúvidas</div>
        </div>
      ),
    },
    {
      id: 9,
      title: '⚡ Situações Difíceis',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>😠 Clientes Insatisfeitos</strong> - Reconhecer a frustração</div>
          <div><strong>📣 Reclamações</strong> - Demonstrar compreensão</div>
          <div><strong>🔥 Mensagens Agressivas</strong> - Manter profissionalismo</div>
          <div><strong>✨ Profissionalismo</strong> - Nunca responder com raiva</div>
        </div>
      ),
    },
    {
      id: 10,
      title: '📋 Clareza nas Orientações',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>1️⃣ Passo a Passo</strong> - Organização clara</div>
          <div><strong>📌 Numeração</strong> - Listas numeradas</div>
          <div><strong>🚫 Remover Desnecessários</strong> - Ir ao essencial</div>
          <div><strong>✔️ Confirmação</strong> - "Ficou claro?"</div>
        </div>
      ),
    },
    {
      id: 11,
      title: '🤖 Chatbot Best Practices',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>💬 Respostas Prontas</strong> - Padronizadas e eficientes</div>
          <div><strong>👤 Personalização</strong> - Adaptar para o cliente</div>
          <div><strong>🔄 Escalação</strong> - Quando transferir para humano</div>
          <div><strong>⚙️ Limites</strong> - Conhecer o que não dá para resolver</div>
        </div>
      ),
    },
    {
      id: 12,
      title: '❌ Erros Comuns',
      color: 'from-orange-500 to-orange-600',
      content: (
        <div className="space-y-3">
          <div><strong>🌫️ Vago</strong> - Respostas sem clareza</div>
          <div><strong>📍 Sem Contexto</strong> - Não entender o problema</div>
          <div><strong>🔬 Muito Técnico</strong> - Excesso de jargão</div>
          <div><strong>⚠️ Incompleto</strong> - Deixar dúvidas</div>
        </div>
      ),
    },
  ]

  useEffect(() => {
    async function loadTraining() {
      if (trainingId) {
        const trainings = await dbTrainings.list()
        const found = trainings.find(t => t.id === trainingId)
        setTraining(found || null)
      }
      setTrainingLoading(false)
    }
    loadTraining()
  }, [trainingId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Verificar se é uma pergunta de múltipla escolha e fornecer feedback imediato
    const questionMatch = name.match(/question_(\\d+)_response/)
    if (questionMatch) {
      const questionNum = parseInt(questionMatch[1])
      // Verificar se é uma pergunta de múltipla escolha
      const isMCQuestion = Object.keys(correctAnswers).includes(questionNum.toString())
      if (isMCQuestion) {
        const isCorrect = value === correctAnswers[questionNum]
        setQuestionFeedback(prev => {
          const newFeedback = {
            ...prev,
            [questionNum]: { isCorrect, answered: true }
          }
          // Contar respostas answered
          const totalAnswered = Object.values(newFeedback).filter(f => f.answered).length
          setAnsweredCount(totalAnswered)
          return newFeedback
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalTrainingId = training?.id || 'chatbot_empatico_001'
    const finalTrainingTitle = training?.title || 'Atendimento Empático em Chatbot'

    try {
      const { data, error } = await supabase.rpc('insert_training_response', {
        p_training_id: finalTrainingId,
        p_training_title: finalTrainingTitle,
        p_collaborator_name: formData.collaborator_name,
        p_collaborator_email: formData.collaborator_email,
        p_question_1_response: formData.question_1_response,
        p_question_2_response: formData.question_2_response,
        p_question_3_response: formData.question_3_response,
        p_question_4_response: formData.question_4_response,
        p_question_5_response: formData.question_5_response,
        p_question_6_response: formData.question_6_response,
        p_question_7_response: formData.question_7_response,
        p_question_8_response: formData.question_8_response,
        p_question_9_response: formData.question_9_response,
        p_question_10_response: formData.question_10_response,
        p_question_11_response: formData.question_11_response,
        p_question_12_response: formData.question_12_response,
        p_question_13_response: formData.question_13_response,
        p_question_14_response: formData.question_14_response,
      })

      if (error) {
        console.error('Erro ao enviar respostas:', error)
        setLoading(false)
        return
      }

      console.log('✅ Sucesso! Respostas enviadas!', data)
      setSubmitted(true)
    } catch (err: any) {
      console.error('❌ Erro:', err.message)
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
        <div className="text-center">
          <CheckCircle className="text-green-600 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-green-900 mb-2">Obrigado!</h2>
          <p className="text-green-700 mb-6">Suas respostas foram enviadas com sucesso.</p>
          <p className="text-gray-600">Klissia receberá suas respostas para análise.</p>
        </div>
      </div>
    )
  }

  if (trainingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando treinamento...</p>
        </div>
      </div>
    )
  }

  const trainingTitle = training?.title || 'Atendimento Empático em Chatbot'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          📱 {trainingTitle}
        </h1>
        <p className="text-center text-gray-600 mb-8">Responda as perguntas e consulte os materiais conforme necessário</p>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* DADOS PESSOAIS */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg space-y-4 border border-orange-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">👤 Seus Dados</h2>
                <Input
                  type="text"
                  name="collaborator_name"
                  placeholder="Nome completo"
                  value={formData.collaborator_name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
                <Input
                  type="email"
                  name="collaborator_email"
                  placeholder="Email"
                  value={formData.collaborator_email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              {/* PROGRESSO */}
              <div className="p-4 bg-blue-50 rounded-lg border-t-4 border-blue-400">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Progresso</span>
                  <span className="text-sm text-gray-600">{answeredCount} de 7 perguntas respondidas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(answeredCount / 7) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* PERGUNTAS MC COM SLIDES */}
              {mcQuestionsOrder.map((qNum) => {
                const feedback = questionFeedback[qNum]
                const isAnswered = feedback?.answered
                const isCorrect = feedback?.isCorrect
                const relatedSlideIds = questionSlideMap[qNum] || []

                const questionContent = {
                  2: {
                    title: '2️⃣ Erros de Português: MAIS vs MAS',
                    desc: 'Qual é a forma CORRETA de responder ao paciente?',
                    situation: 'Situação: Paciente ligou pedindo um medicamento que está temporariamente fora de estoque.',
                    options: [
                      'A) O medicamento está fora de estoque mas temos alternativas que funcionam igualmente bem!',
                      'B) Não temos este medicamento, mas posso oferecer outra opção com o mesmo princípio ativo.',
                      'C) O medicamento não está disponível, mais temos outros que você pode usar.'
                    ],
                    hint: '💡 MAS = contraste/oposição | MAIS = adição/quantidade'
                  },
                  3: {
                    title: '3️⃣ Uso Correto do Gerúndio',
                    desc: 'Qual frase está CORRETA?',
                    situation: 'Paciente pergunta: "Quando meu medicamento chega?" Como você responderia?',
                    options: [
                      'A) Você vai recebendo o medicamento em até 2 dias.',
                      'B) Seu pedido está sendo preparado neste momento e você receberá em até 2 dias.',
                      'C) Você vai pegando o medicamento amanhã na farmácia.'
                    ],
                    hint: '💡 Gerúndio (-ando,-endo,-indo) = ação em progresso'
                  },
                  4: {
                    title: '4️⃣ Erro Comum: "Vou estar verificando"',
                    desc: 'Qual forma de falar está CORRETA?',
                    situation: 'Paciente: "Preciso saber se o medicamento já saiu para entrega". Como responder?',
                    options: [
                      'A) Vou estar verificando o status do seu pedido em breve, combinado?',
                      'B) Vou verificar o status agora mesmo e retorno com você em 2 minutos.',
                      'C) Estou verificando o sistema neste exato momento para você.'
                    ],
                    hint: '💡 ❌ "Vou estar verificando" confunde! ✅ Use: "Vou verificar" ou "Estou verificando"'
                  },
                  7: {
                    title: '7️⃣ Qual característica é mais importante em um atendimento via chat?',
                    desc: '',
                    situation: '',
                    options: [
                      'A) Respostas longas e detalhadas',
                      'B) Clareza e objetividade',
                      'C) Uso de termos técnicos',
                      'D) Linguagem informal em todos os casos'
                    ],
                    hint: ''
                  },
                  9: {
                    title: '9️⃣ Qual frase apresenta melhor comunicação profissional?',
                    desc: '',
                    situation: '',
                    options: [
                      'A) Vc precisa enviar o doc.',
                      'B) Favor enviar o documento para análise.',
                      'C) Manda aí.',
                      'D) Tá faltando coisa.'
                    ],
                    hint: ''
                  },
                  11: {
                    title: '1️⃣1️⃣ Diante de uma reclamação, a melhor atitude é:',
                    desc: '',
                    situation: '',
                    options: [
                      'A) Ignorar o tom do cliente e responder mecanicamente',
                      'B) Demonstrar compreensão e buscar uma solução',
                      'C) Argumentar para provar que a empresa está certa',
                      'D) Encerrar o atendimento rapidamente'
                    ],
                    hint: ''
                  },
                  13: {
                    title: '1️⃣3️⃣ Quando o atendimento deve ser transferido para um humano?',
                    desc: '',
                    situation: '',
                    options: [
                      'A) Quando o chatbot não consegue resolver a demanda após tentativas adequadas',
                      'B) Em toda conversa',
                      'C) Nunca',
                      'D) Apenas quando o cliente solicitar desconto'
                    ],
                    hint: ''
                  }
                }[qNum] || { title: '', desc: '', situation: '', options: [], hint: '' }

                return (
                  <div key={qNum} className="space-y-6">
                    {/* PERGUNTA */}
                    <div className={`p-6 rounded-lg border-2 transition-all ${
                      isAnswered
                        ? isCorrect
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                        : 'bg-white border-gray-300'
                    }`}>
                      <label className="block font-bold mb-3 text-gray-900">
                        {questionContent.title}<br/>
                        {questionContent.desc && <span className="text-sm font-normal">{questionContent.desc}</span>}
                      </label>
                      {questionContent.situation && (
                        <p className="text-sm text-gray-600 mb-3 bg-orange-50 p-2 rounded italic">{questionContent.situation}</p>
                      )}
                      <div className="space-y-3">
                        {questionContent.options.map((option) => (
                          <label key={option} className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name={`question_${qNum}_response`}
                              value={option}
                              checked={formData[`question_${qNum}_response` as keyof typeof formData] === option}
                              onChange={handleChange}
                              disabled={isAnswered}
                              className="mt-1"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                      {questionContent.hint && (
                        <p className="text-xs text-gray-500 mt-3">{questionContent.hint}</p>
                      )}
                      {isAnswered && (
                        <div className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                          <p className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            {isCorrect ? '✅ Resposta correta!' : '❌ Resposta incorreta'}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-red-800 mt-2">
                              <strong>Resposta correta:</strong> {correctAnswers[qNum]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SLIDES EXPLICATIVOS */}
                    {relatedSlideIds.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-gray-700">📚 Material relacionado:</p>
                        {relatedSlideIds.map((slideId) => {
                          const slide = slides[slideId - 1]
                          return (
                            <div key={slideId} className={`bg-gradient-to-br ${slide.color} rounded-lg p-6 text-white`}>
                              <h4 className="text-lg font-bold mb-3">{slide.title}</h4>
                              <div className="bg-white/10 backdrop-blur p-4 rounded-lg text-white">
                                {slide.content}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* PERGUNTAS ABERTAS */}
              <div className="space-y-6 pt-8 border-t-4 border-blue-400">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">✍️ Respostas Abertas</h2>
                  <p className="text-gray-600 mb-6">As respostas abaixo serão analisadas por Klissia para feedback personalizado.</p>
                </div>

                {/* Q1 */}
                <div>
                  <label className="block font-bold mb-2 text-gray-900">
                    1️⃣ Reconhecimento de Emoções do Paciente<br/>
                    <span className="text-sm font-normal">Um paciente envia: "Pedi meu medicamento há 3 dias e ainda não chegou! Preciso urgente para tomar hoje! Estou desesperado!"</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">Como você responderia reconhecendo a urgência e o desespero dele de forma empática?</p>
                  <Textarea
                    name="question_1_response"
                    value={formData.question_1_response}
                    onChange={handleChange}
                    required
                    placeholder="Sua resposta..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                {/* Q5 */}
                <div>
                  <label className="block font-bold mb-2 text-gray-900">
                    5️⃣ Situação Complexa: Investigação + Empatia<br/>
                    <span className="text-sm font-normal">Um paciente irritado diz: "Pedi meu medicamento no início da semana e hoje é sexta! Ainda não chegou! Precisei ontem!"</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">Como você investigaria o problema enquanto acalma o paciente?</p>
                  <Textarea
                    name="question_5_response"
                    value={formData.question_5_response}
                    onChange={handleChange}
                    required
                    placeholder="Sua resposta..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                {/* Q6 */}
                <div>
                  <label className="block font-bold mb-2 text-gray-900">
                    6️⃣ Maneiras Empáticas de Chamar o Paciente<br/>
                    <span className="text-sm font-normal">Como você se dirigiria ao paciente de forma acolhedora e profissional?</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">Descreva como você trataria o paciente em diferentes contextos usando nomes e formas de tratamento que demonstrem respeito.</p>
                  <Textarea
                    name="question_6_response"
                    value={formData.question_6_response}
                    onChange={handleChange}
                    required
                    placeholder="Sua resposta..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                {/* Q8 */}
                <div>
                  <label className="block font-bold mb-2 text-gray-900">
                    8️⃣ Reescreva de forma mais cordial<br/>
                    <span className="text-sm font-normal italic">"Você preencheu os dados errados."</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">Como você tornaria essa mensagem mais empática?</p>
                  <Textarea
                    name="question_8_response"
                    value={formData.question_8_response}
                    onChange={handleChange}
                    required
                    placeholder="Sua resposta..."
                    rows={3}
                    className="w-full"
                  />
                </div>

                {/* Q10 */}
                <div>
                  <label className="block font-bold mb-2 text-gray-900">
                    🔟 Pergunta Clarificadora<br/>
                    <span className="text-sm font-normal">Cite uma pergunta para entender melhor a necessidade do cliente</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">Demonstre escuta ativa sugerindo uma pergunta clarificadora útil.</p>
                  <Textarea
                    name="question_10_response"
                    value={formData.question_10_response}
                    onChange={handleChange}
                    required
                    placeholder="Sua resposta..."
                    rows={3}
                    className="w-full"
                  />
                </div>

                {/* Q12 */}
                <div>
                  <label className="block font-bold mb-2 text-gray-900">
                    1️⃣2️⃣ Redefinir Senha<br/>
                    <span className="text-sm font-normal">Explique como redefinir uma senha com um passo a passo simples</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">Crie uma orientação clara e organizada com passos numerados.</p>
                  <Textarea
                    name="question_12_response"
                    value={formData.question_12_response}
                    onChange={handleChange}
                    required
                    placeholder="Sua resposta..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                {/* Q14 */}
                <div>
                  <label className="block font-bold mb-2 text-gray-900">
                    1️⃣4️⃣ Erro de Comunicação<br/>
                    <span className="text-sm font-normal">Descreva um erro que pode gerar insatisfação</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">Exemplifique um erro comum e como evitá-lo.</p>
                  <Textarea
                    name="question_14_response"
                    value={formData.question_14_response}
                    onChange={handleChange}
                    required
                    placeholder="Sua resposta..."
                    rows={4}
                    className="w-full"
                  />
                </div>
              </div>

              {/* BOTÃO ENVIAR */}
              <div className="pt-8 border-t-2 border-gray-300">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 font-bold text-lg rounded-lg shadow-lg transition-all"
                >
                  {loading ? '⏳ Enviando suas respostas...' : '✅ Enviar Respostas'}
                </Button>
                <p className="text-sm text-gray-600 text-center mt-4">
                  Suas respostas serão salvas e Klissia as analisará em breve.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'''

# Escrever arquivo
import os
output_path = os.path.join(os.path.dirname(__file__), 'src', 'pages', 'TrainamentPublic.tsx')
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(TEMPLATE)

import sys
sys.stdout.reconfigure(encoding='utf-8')
print("✅ Arquivo TrainamentPublic.tsx gerado com sucesso!")
print(f"Linhas: {len(TEMPLATE.splitlines())}")
print("Incluído:")
print("- 12 slides completos")
print("- 7 perguntas MC com mapeamento para slides")
print("- 7 perguntas abertas")
print("- Feedback imediato")
print("- Estrutura pergunta + feedback + slides")
