import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { dbTrainings } from '@/lib/db'
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TrainingAction } from '@/types'

type SlideType = 'question' | 'feedback' | 'explanation' | 'openended' | 'submit'

interface Slide {
  type: SlideType
  questionNum?: number
  questionTitle?: string
  options?: string[]
  situation?: string
  hint?: string
  isCorrect?: boolean
  selectedAnswer?: string
  correctAnswer?: string
  relatedSlideIds?: number[]
}

export default function TrainmentPublic() {
  const [searchParams] = useSearchParams()
  const trainingId = searchParams.get('id')

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [training, setTraining] = useState<TrainingAction | null>(null)
  const [trainingLoading, setTrainingLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

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

  const correctAnswers: {[key: number]: string} = {
    2: 'B) Não temos este medicamento, mas posso oferecer outra opção com o mesmo princípio ativo.',
    3: 'B) Seu pedido está sendo preparado neste momento e você receberá em até 2 dias.',
    4: 'B) Vou verificar o status agora mesmo e retorno com você em 2 minutos.',
    7: 'B) Clareza e objetividade',
    9: 'B) Favor enviar o documento para análise.',
    11: 'B) Demonstrar compreensão e buscar uma solução',
    13: 'A) Quando o chatbot não consegue resolver a demanda após tentativas adequadas',
  }

  const questionSlideMap: {[key: number]: number[]} = {
    2: [3, 4, 7],
    3: [7],
    4: [7],
    7: [5],
    9: [7, 3],
    11: [9, 2, 6],
    13: [11]
  }

  const mcQuestionsOrder = [2, 3, 4, 7, 9, 11, 13]
  const openEndedQuestions = [1, 5, 6, 8, 10, 12, 14]

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

  const questionsData = {
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
  }

  // Calcular slides progressivos
  let slideIndex = 0
  const allSlides: Slide[] = []

  // Slide 0: Dados pessoais
  allSlides.push({
    type: 'question',
    questionTitle: 'Seus Dados',
    questionNum: 0
  })
  slideIndex = 1

  // Para cada pergunta MC: pergunta, feedback, explicação
  for (const qNum of mcQuestionsOrder) {
    allSlides.push({
      type: 'question',
      questionNum: qNum,
      questionTitle: questionsData[qNum as keyof typeof questionsData].title,
      desc: questionsData[qNum as keyof typeof questionsData].desc,
      situation: questionsData[qNum as keyof typeof questionsData].situation,
      options: questionsData[qNum as keyof typeof questionsData].options,
      hint: questionsData[qNum as keyof typeof questionsData].hint
    })

    allSlides.push({
      type: 'feedback',
      questionNum: qNum
    })

    allSlides.push({
      type: 'explanation',
      questionNum: qNum,
      relatedSlideIds: questionSlideMap[qNum]
    })
  }

  // Perguntas abertas (7 no total)
  const openEndedQuestionData = [
    { num: 1, title: '1️⃣ Reconhecimento de Emoções do Paciente', desc: 'Um paciente envia: "Pedi meu medicamento há 3 dias e ainda não chegou! Preciso urgente para tomar hoje! Estou desesperado!"', question: 'Como você responderia reconhecendo a urgência e o desespero dele de forma empática?' },
    { num: 5, title: '5️⃣ Situação Complexa: Investigação + Empatia', desc: 'Um paciente irritado diz: "Pedi meu medicamento no início da semana e hoje é sexta! Ainda não chegou! Precisei ontem!"', question: 'Como você investigaria o problema enquanto acalma o paciente?' },
    { num: 6, title: '6️⃣ Maneiras Empáticas de Chamar o Paciente', desc: 'Como você se dirigiria ao paciente de forma acolhedora e profissional?', question: 'Descreva como você trataria o paciente em diferentes contextos.' },
    { num: 8, title: '8️⃣ Reescreva de forma mais cordial', desc: '"Você preencheu os dados errados."', question: 'Como você tornaria essa mensagem mais empática?' },
    { num: 10, title: '🔟 Pergunta Clarificadora', desc: 'Cite uma pergunta para entender melhor a necessidade do cliente', question: 'Demonstre escuta ativa sugerindo uma pergunta clarificadora útil.' },
    { num: 12, title: '1️⃣2️⃣ Redefinir Senha', desc: 'Explique como redefinir uma senha com um passo a passo simples', question: 'Crie uma orientação clara e organizada com passos numerados.' },
    { num: 14, title: '1️⃣4️⃣ Erro de Comunicação', desc: 'Descreva um erro que pode gerar insatisfação', question: 'Exemplifique um erro comum e como evitá-lo.' }
  ]

  for (const q of openEndedQuestionData) {
    allSlides.push({
      type: 'openended',
      questionNum: q.num,
      questionTitle: q.title,
      desc: q.desc,
      hint: q.question
    })
  }

  // Slide final: submit
  allSlides.push({
    type: 'submit'
  })

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectAnswer = (qNum: number, option: string) => {
    setFormData({ ...formData, [`question_${qNum}_response`]: option })
  }

  const handleNext = () => {
    if (currentStep < allSlides.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const finalTrainingId = training?.id || 'chatbot_empatico_001'
    const finalTrainingTitle = training?.title || 'Atendimento Empático em Chatbot'

    try {
      const { error } = await supabase.rpc('insert_training_response', {
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
        console.error('Erro ao enviar:', error)
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('Erro:', err.message)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando treinamento...</p>
        </div>
      </div>
    )
  }

  const slide = allSlides[currentStep]
  const trainingTitle = training?.title || 'Atendimento Empático em Chatbot'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-1 text-gray-900">📱 {trainingTitle}</h1>
          <p className="text-center text-sm text-orange-600 font-semibold mb-4">🎓 Treinamento de Atendimento Empático - Duração: ~15 minutos</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / allSlides.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">Slide {currentStep + 1} de {allSlides.length}</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-8 pb-8">
            {/* SLIDE: DADOS PESSOAIS */}
            {slide.type === 'question' && slide.questionNum === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">👤 Seus Dados</h2>
                <div className="space-y-4">
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
              </div>
            )}

            {/* SLIDE: PERGUNTA MC */}
            {slide.type === 'question' && slide.questionNum && slide.questionNum > 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.questionTitle}</h2>
                  {slide.desc && <p className="text-gray-600 text-sm">{slide.desc}</p>}
                </div>
                {slide.situation && (
                  <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded italic border-l-4 border-orange-400">
                    {slide.situation}
                  </p>
                )}
                <div className="space-y-3">
                  {slide.options?.map((option) => {
                    const isSelected = formData[`question_${slide.questionNum}_response` as keyof typeof formData] === option
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(slide.questionNum!, option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
                {slide.hint && <p className="text-xs text-gray-500 text-center">{slide.hint}</p>}
              </div>
            )}

            {/* SLIDE: FEEDBACK */}
            {slide.type === 'feedback' && slide.questionNum && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Verificando sua resposta...</h2>
                {(() => {
                  const userAnswer = formData[`question_${slide.questionNum}_response` as keyof typeof formData]
                  const correct = userAnswer === correctAnswers[slide.questionNum!]

                  if (!userAnswer) {
                    return (
                      <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                        <p className="text-yellow-800 font-bold">⚠️ Nenhuma resposta selecionada</p>
                        <p className="text-sm text-yellow-700 mt-2">Volte para o slide anterior e selecione uma opção.</p>
                      </div>
                    )
                  }

                  return (
                    <div className={`p-6 rounded-lg border-2 ${correct ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                      <p className={`font-bold text-lg ${correct ? 'text-green-800' : 'text-red-800'}`}>
                        {correct ? '✅ Resposta Correta!' : '❌ Resposta Incorreta'}
                      </p>
                      {!correct && (
                        <div className="mt-4 pt-4 border-t-2 border-red-300">
                          <p className="text-sm text-red-800 mb-2"><strong>Resposta correta:</strong></p>
                          <p className="text-red-700">{correctAnswers[slide.questionNum!]}</p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* SLIDE: EXPLICAÇÃO */}
            {slide.type === 'explanation' && slide.questionNum && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 Material Explicativo</h2>
                <div className="space-y-4">
                  {slide.relatedSlideIds?.map((slideId) => {
                    const explainSlide = slides[slideId - 1]
                    return (
                      <div key={slideId} className={`bg-gradient-to-br ${explainSlide.color} rounded-lg p-6 text-white`}>
                        <h3 className="text-lg font-bold mb-3">{explainSlide.title}</h3>
                        <div className="bg-white/10 backdrop-blur p-4 rounded-lg text-white">
                          {explainSlide.content}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SLIDE: PERGUNTA ABERTA */}
            {slide.type === 'openended' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.questionTitle}</h2>
                  <p className="text-sm text-gray-600">{slide.desc}</p>
                </div>
                <p className="text-sm font-semibold text-gray-700">{slide.hint}</p>
                <Textarea
                  name={`question_${slide.questionNum}_response`}
                  value={formData[`question_${slide.questionNum}_response` as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder="Sua resposta..."
                  rows={5}
                  className="w-full"
                />
              </div>
            )}

            {/* SLIDE: ENVIO */}
            {slide.type === 'submit' && (
              <div className="space-y-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900">✅ Pronto para enviar?</h2>
                <p className="text-gray-600">Você respondeu todas as perguntas!</p>
                <p className="text-sm text-gray-500">Klissia analisará suas respostas e fornecerá feedback personalizado.</p>
              </div>
            )}

            {/* NAVEGAÇÃO */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                onClick={handlePrev}
                disabled={currentStep === 0}
                variant="outline"
              >
                <ChevronLeft size={18} className="mr-2" />
                Anterior
              </Button>

              {slide.type === 'submit' ? (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? '⏳ Enviando...' : '✅ Enviar Respostas'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={currentStep === allSlides.length - 1}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Próximo
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
