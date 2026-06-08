import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { CheckCircle, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import type { TrainingAction } from '@/types'

type SlideType = 'intro' | 'question' | 'feedback' | 'explanation' | 'openended' | 'summary'

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
  desc?: string
  content?: string
}

const CORRECT_ANSWERS: {[key: number]: string} = {
  2: 'B) Não temos este medicamento, mas posso oferecer outra opção com o mesmo princípio ativo.',
  3: 'B) Vou contatar o seu médico agora e já envio a autorização.',
  4: 'C) Vou revisar seu pedido e confirmo a disponibilidade em breve.',
  13: 'B) Sempre, como próximo passo natural da conversa',
}

const QUESTIONS_DATA = {
  2: {
    title: '2️⃣ MAIS vs MAS - Escolha Correta',
    desc: 'Qual frase usa CORRETAMENTE a conjunção?',
    situation: 'O cliente está insatisfeito pois o medicamento solicitado não está disponível.',
    options: [
      'A) O medicamento não está disponível, mais temos outros que você pode usar.',
      'B) Não temos este medicamento, mas posso oferecer outra opção com o mesmo princípio ativo.',
      'C) Infelizmente mais produtos deste tipo estão indisponíveis no momento.'
    ],
  },
  3: {
    title: '3️⃣ Identifique o Gerundismo',
    desc: 'Qual frase usa CORRETAMENTE o verbo sem cair em gerundismo?',
    situation: 'Um paciente precisa de autorização médica para iniciar tratamento.',
    options: [
      'A) Vou estar entrando em contato com o médico para conseguir a autorização.',
      'B) Vou contatar o seu médico agora e já envio a autorização.',
      'C) Vou estar providenciando a autorização logo mais.'
    ],
  },
  4: {
    title: '4️⃣ Escolha a Resposta Correta',
    desc: 'Qual frase expressa melhor a ação futura de forma clara?',
    situation: 'O cliente pergunta sobre a disponibilidade de um produto.',
    options: [
      'A) Vou estar analisando o estoque para você em breve.',
      'B) Vou estar verificando e retorno assim que possível.',
      'C) Vou revisar seu pedido e confirmo a disponibilidade em breve.'
    ],
  },
  13: {
    title: '1️⃣3️⃣ Melhor Momento para Transferência Humana',
    desc: '',
    situation: 'Você acabou de ajudar o cliente a entender seu problema.',
    options: [
      'A) Apenas se ele pedir especificamente para falar com alguém',
      'B) Sempre, como próximo passo natural da conversa',
      'C) Somente nos casos mais complexos',
      'D) Nunca, o chatbot resolve tudo'
    ],
  }
}

const SLIDES_EDUCATIONAL = [
  {
    id: 0,
    title: '📝 MAIS vs MAS',
    content: `Diferença crucial em português:

"MAIS" = adjetivo/advérbio de quantidade/comparação
• "Tenho MAIS informações"
• "Isso é MAIS importante"
• "Preciso de MAIS tempo"

"MAS" = conjunção adversativa (mas, porém)
• "Entendo sua frustração, MAS podemos resolver"
• "Quer ir agora, MAS recomendo esperar"
• "É difícil, MAS conseguimos"

NO CHATBOT:
✅ "Não temos este produto, MAS temos opções similares"
❌ "Não temos este produto, MAIS temos opções similares"

RESUMO: MAS = conexão/contraste. MAIS = quantidade/comparação`
  },
  {
    id: 1,
    title: '⚠️ GERUNDISMO (Evitar!)',
    content: `Gerundismo é o uso desnecessário do gerúndio (-ando, -endo, -indo) para expressar uma ação futura pontual ou concluída.

❌ EVITE (Gerundismo):
• "Vou estar verificando seu cadastro"
• "Vou estar entrando em contato em breve"
• "Estou terminando o processo agora"
→ Parece vago, impreciso, pouco profissional

✅ USE (Correto):
• "Vou verificar seu cadastro"
• "Verificarei seu cadastro"
• "Vou entrar em contato em breve"
• "Estou terminando o processo agora" (se realmente está em progresso)
→ Claro, direto, profissional

RESUMO: Gerúndio é OK para ações CONTÍNUAS/EM PROGRESSO.
Não use para ações futuras pontuais!`
  },
  {
    id: 2,
    title: '💬 Diferença: "Estar" vs "Ir"',
    content: `Verbo "ESTAR" (Estado / Condição):
• Indica uma situação ou estado atual/futuro
• Exemplo: "Estou trabalhando agora"
• Futuro: "Estarei livre para a reunião"

Verbo "IR" (Deslocamento / Ação):
• Indica movimento ou ação futura iminente (futuro imediato)
• Exemplo: "Vou ao escritório agora"
• Futuro: "Semana que vem eu irei a Brasília"

NO CHATBOT:
✅ "Vou verificar seu pedido" (ação clara e direta)
❌ "Vou estar verificando seu pedido" (vago, desnecessário)
✅ "Verificarei em breve" (futuro simples)
❌ "Estarei verificando em breve" (gerundismo oculto)

RESUMO: Use "VOU" para ações futuras claras, não "VOU ESTAR"`
  },
  {
    id: 3,
    title: '🤖 Transferência para Humano',
    content: `CONCEITO IMPORTANTE:
O chatbot NUNCA deve ser a solução final.
SEMPRE deve haver transferência para um humano em algum momento.

QUANDO TRANSFERIR:
✅ EM TODA CONVERSA - não só quando falha
✅ Ao final de uma interação para confirmação
✅ Quando surgem dúvidas complexas
✅ Quando o cliente pede escalação
✅ Para follow-up pessoal

EXEMPLOS:
"Achei essas 3 opções pra você. Deixa eu conectar com um especialista pra detalhar melhor?"
"Vou anotar tudo isso aqui e já passo pro time de atendimento pra você ter suporte direto"
"Legal, consegui resolver. Mas aproveita que tá aqui comigo, vou conectar com alguém pra repassar tudo?"

RESUMO: Chatbot = primeiro passo. Humano = sempre necessário.`
  }
]

export default function TrainamentReteste() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const [formData, setFormData] = useState({
    collaborator_name: 'Georgea',
    collaborator_email: '',
    question_2_response: '',
    question_3_response: '',
    question_4_response: '',
    question_13_response: '',
    question_5_response: '',
    question_8_response: '',
    question_10_response: '',
  })

  const allSlides = useMemo(() => {
    const slides: Slide[] = []

    // Slide 0: Intro
    slides.push({
      type: 'intro',
    })

    // Explicações
    slides.push({
      type: 'explanation',
      questionNum: 0,
      content: SLIDES_EDUCATIONAL[0].content,
    })
    slides.push({
      type: 'explanation',
      questionNum: 1,
      content: SLIDES_EDUCATIONAL[1].content,
    })
    slides.push({
      type: 'explanation',
      questionNum: 2,
      content: SLIDES_EDUCATIONAL[2].content,
    })
    slides.push({
      type: 'explanation',
      questionNum: 3,
      content: SLIDES_EDUCATIONAL[3].content,
    })

    // Questões Q2, Q3, Q4, Q13
    for (const qNum of [2, 3, 4, 13]) {
      const qData = QUESTIONS_DATA[qNum as keyof typeof QUESTIONS_DATA]
      slides.push({
        type: 'question',
        questionNum: qNum,
        questionTitle: qData.title,
        desc: qData.desc,
        options: qData.options,
      })
      slides.push({
        type: 'feedback',
        questionNum: qNum,
      })
    }

    // Perguntas abertas
    slides.push({
      type: 'openended',
      questionNum: 5,
      questionTitle: '5️⃣ Cliente Insatisfeito com Documentação',
      desc: 'O cliente ligou dizendo: "Tentei três vezes enviar os documentos e a plataforma mantém rejeitando! Vocês estão complicando demais isso!"',
      hint: 'Como você investigaria o problema tecnicamente ENQUANTO demonstra empatia com a frustração dele?'
    })
    slides.push({
      type: 'openended',
      questionNum: 8,
      questionTitle: '8️⃣ Reescrever com Cordialidade',
      desc: '"Seu pedido está incompleto. Faltam informações."',
      hint: 'Reescreva de forma que o cliente se sinta acolhido e entenda exatamente o que fazer.'
    })
    slides.push({
      type: 'openended',
      questionNum: 10,
      questionTitle: '🔟 Pergunta Clarificadora + Transição Suave',
      desc: 'O cliente relata: "Preciso saber se meu medicamento pode ser usado junto com outro que tomo."',
      hint: 'Faça 1 pergunta para entender melhor o contexto E depois faça a transição natural para conectar com um especialista.'
    })

    // Resumo
    slides.push({
      type: 'summary',
    })

    return slides
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectAnswer = (qNum: number, option: string) => {
    const currentResponse = formData[`question_${qNum}_response` as keyof typeof formData]
    if (!currentResponse) {
      setFormData(prev => ({ ...prev, [`question_${qNum}_response`]: option }))
    }
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

    try {
      const { error } = await supabase
        .from('rh_training_responses')
        .insert([{
          training_id: 'chatbot_empatico_reteste_georgea',
          training_title: 'Reteste - Atendimento Empático em Chatbot',
          collaborator_name: 'Georgea',
          collaborator_email: formData.collaborator_email,
          question_2_response: formData.question_2_response,
          question_3_response: formData.question_3_response,
          question_4_response: formData.question_4_response,
          question_13_response: formData.question_13_response,
          question_5_response: formData.question_5_response,
          question_8_response: formData.question_8_response,
          question_10_response: formData.question_10_response,
        }])

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
          <h2 className="text-3xl font-bold text-green-900 mb-2">Parabéns, Georgea!</h2>
          <p className="text-green-700 mb-6">Você completou o reteste com sucesso!</p>
          <p className="text-gray-600">Suas respostas foram enviadas para análise.</p>
        </div>
      </div>
    )
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

  const slide = allSlides[currentStep]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-1 text-gray-900">Reteste - Atendimento Empático</h1>
          <p className="text-center text-sm text-orange-600 font-semibold mb-4">Reforço em Gerundismo, Transferência e Empatia</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / allSlides.length) * 100}%` }}
            />
          </div>
          <p className="text-right text-xs text-gray-500 mt-2">Slide {currentStep + 1} de {allSlides.length}</p>
        </div>

        <Card>
          <CardContent className="pt-8">
            {/* SLIDE: INTRO */}
            {slide.type === 'intro' && (
              <div className="space-y-6 text-center">
                <div className="bg-gray-50 p-8 rounded-lg border-2 border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Olá, Georgea!</h2>
                  <p className="text-gray-700 mb-4">
                    Você teve um desempenho de <strong>57%</strong> no primeiro treinamento.
                  </p>
                  <p className="text-gray-700 mb-6">
                    Este reteste é um reforço focado em <strong>3 pontos específicos</strong> para você alcançar a excelência:
                  </p>
                  <div className="space-y-2 text-left inline-block">
                    <p>✅ <strong>Gerundismo</strong> - Como evitar essa construção vaga</p>
                    <p>✅ <strong>"Estar" vs "Ir"</strong> - Usar o verbo certo no contexto</p>
                    <p>✅ <strong>Transferência para Humano</strong> - Quando e como fazer</p>
                  </div>
                  <p className="text-gray-600 mt-6 text-sm">
                    Tempo estimado: 10-15 minutos
                  </p>
                </div>
              </div>
            )}

            {/* SLIDE: EXPLANATION */}
            {slide.type === 'explanation' && slide.content && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border-l-4 border-orange-500">
                  <div className="whitespace-pre-wrap text-sm text-gray-800 font-family-mono leading-relaxed">
                    {slide.content}
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE: PERGUNTA MC */}
            {slide.type === 'question' && slide.options && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.questionTitle}</h2>
                  {slide.desc && <p className="text-gray-600 text-sm">{slide.desc}</p>}
                </div>
                <div className="space-y-3">
                  {slide.options.map((option) => {
                    const isSelected = formData[`question_${slide.questionNum}_response` as keyof typeof formData] === option
                    const isAnswered = !!formData[`question_${slide.questionNum}_response` as keyof typeof formData]
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(slide.questionNum!, option)}
                        disabled={isAnswered && !isSelected}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : isAnswered
                            ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
                {formData[`question_${slide.questionNum}_response` as keyof typeof formData] && (
                  <div className="p-3 bg-orange-50 border border-orange-300 rounded-lg">
                    <p className="text-sm text-orange-800">✓ Sua resposta foi registrada!</p>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE: FEEDBACK */}
            {slide.type === 'feedback' && slide.questionNum && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Resultado:</h2>
                {(() => {
                  const userAnswer = formData[`question_${slide.questionNum}_response` as keyof typeof formData]
                  const correct = userAnswer === CORRECT_ANSWERS[slide.questionNum!]

                  if (!userAnswer) {
                    return (
                      <div className="p-6 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                        <p className="text-yellow-800 font-bold">⚠️ Nenhuma resposta selecionada</p>
                      </div>
                    )
                  }

                  return (
                    <div className={`p-6 rounded-lg border-2 ${correct ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                      <p className={`font-bold text-lg ${correct ? 'text-green-800' : 'text-red-800'}`}>
                        {correct ? '✅ Resposta Correta! Parabéns!' : '❌ Resposta Incorreta'}
                      </p>
                      {!correct && (
                        <div className="mt-4 pt-4 border-t-2 border-red-300">
                          <p className="text-sm text-red-800 mb-2"><strong>Resposta correta:</strong></p>
                          <p className="text-red-700 font-semibold">{CORRECT_ANSWERS[slide.questionNum!]}</p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* SLIDE: PERGUNTA ABERTA */}
            {slide.type === 'openended' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{slide.questionTitle}</h2>
                  <p className="text-sm text-gray-600">{slide.desc}</p>
                </div>
                <p className="text-sm font-semibold text-orange-700 bg-orange-50 p-3 rounded-lg">{slide.hint}</p>
                <Textarea
                  name={`question_${slide.questionNum}_response`}
                  value={formData[`question_${slide.questionNum}_response` as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder="Sua resposta..."
                  rows={6}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">💡 Dica: Seja detalhado e profissional na sua resposta!</p>
              </div>
            )}

            {/* SLIDE: SUMMARY */}
            {slide.type === 'summary' && (
              <div className="space-y-6 text-center">
                <div className="bg-white p-8 rounded-lg border-2 border-orange-300">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Você está pronto!</h2>
                  <p className="text-gray-700 mb-6">
                    Você revisou os 3 pontos principais e respondeu às questões. Agora é só enviar para análise!
                  </p>
                  <p className="text-gray-600 text-sm">
                    Klissia receberá suas respostas e fará um feedback personalizado com seus avanços.
                  </p>
                </div>
              </div>
            )}

            {/* NAVEGAÇÃO */}
            <div className="flex justify-between items-center mt-8 pt-8 border-t">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  disabled={loading}
                >
                  <ChevronLeft size={18} className="mr-2" />
                  Anterior
                </Button>
              )}
              {slide.type === 'summary' && (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white ml-auto"
                >
                  Enviar Reteste
                </Button>
              )}
              {slide.type !== 'summary' && (
                <Button
                  onClick={handleNext}
                  disabled={currentStep === allSlides.length - 1}
                  className="bg-orange-600 hover:bg-orange-700 text-white ml-auto"
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
