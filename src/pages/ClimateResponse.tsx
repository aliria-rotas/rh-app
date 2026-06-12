import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { dbClimateSurveys } from '@/lib/db'
import { ClimateSurvey, ClimateResponse } from '@/types'
import { generateId } from '@/lib/storage'
import { Wind, CheckCircle } from 'lucide-react'

const LIKERT_SCALE = [
  { value: 1, label: '1 - Discordo totalmente', color: 'bg-red-100 hover:bg-red-200' },
  { value: 2, label: '2 - Discordo', color: 'bg-orange-100 hover:bg-orange-200' },
  { value: 3, label: '3 - Neutro', color: 'bg-yellow-100 hover:bg-yellow-200' },
  { value: 4, label: '4 - Concordo', color: 'bg-lime-100 hover:bg-lime-200' },
  { value: 5, label: '5 - Concordo totalmente', color: 'bg-green-100 hover:bg-green-200' },
]

export default function ClimateResponse() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const [survey, setSurvey] = useState<ClimateSurvey | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (surveyId) {
      dbClimateSurveys.get(surveyId).then(data => {
        setSurvey(data)
        setLoading(false)
      })
    }
  }, [surveyId])

  function handleAnswer(questionId: string, value: number) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function submit() {
    if (!survey || !surveyId) return
    if (Object.keys(answers).length !== survey.questions.length) {
      alert('Por favor, responda todas as perguntas')
      return
    }

    const response: ClimateResponse = {
      id: generateId(),
      survey_id: surveyId,
      answers,
      submitted_at: new Date().toISOString(),
    }

    // TODO: Salvar resposta no banco de dados
    console.log('Resposta da pesquisa:', response)
    setSubmitted(true)
  }

  if (loading) return <div className="flex justify-center items-center h-64"><Wind className="animate-spin" size={40} /></div>
  if (!survey) return <div className="text-center py-16">Pesquisa não encontrada</div>

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <CheckCircle size={64} className="text-green-600" />
        <h2 className="text-2xl font-bold text-slate-800">Obrigado!</h2>
        <p className="text-slate-600">Sua resposta foi registrada com sucesso</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          <p className="text-purple-100 mt-2">{survey.description}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            {survey.questions.map((question, idx) => (
              <div key={question.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{question.text}</p>
                    <p className="text-xs text-slate-500 mt-1">Categoria: {question.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {LIKERT_SCALE.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(question.id, option.value)}
                      className={`p-3 rounded-lg text-xs font-medium transition-all text-center cursor-pointer border-2 ${
                        answers[question.id] === option.value
                          ? `${option.color} border-slate-400`
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-lg font-bold">{option.value}</div>
                      <div className="text-xs hidden md:block">{option.label.split(' - ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={submit} className="flex-1 md:flex-none">
              Enviar Resposta
            </Button>
            <p className="text-sm text-slate-500 flex items-center">
              {Object.keys(answers).length}/{survey.questions.length} respondidas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
