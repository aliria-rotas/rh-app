import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { dbClimateSurveys } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ClimateSurvey } from '@/types'
import { Wind, Download, FileText, BarChart3 } from 'lucide-react'

interface ResponseData {
  id: string
  answers: Record<string, number>
}

interface QuestionStats {
  id: string
  text: string
  category: string
  distribution: number[]
  average: number
}

interface CategoryStats {
  name: string
  average: number
  totalResponses: number
}

const SCALE_LABELS = ['Discordo Totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo Totalmente']
const SCALE_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600']

const QUESTION_LABELS: Record<string, string> = {
  P1: 'Meu gestor fornece feedback claro sobre meu desempenho',
  P2: 'Sinto-me motivado(a) pelas ações do meu gestor',
  P3: 'A comunicação interna é clara e transparente',
  P4: 'Tenho informações suficientes sobre decisões que me afetam',
  P5: 'Estou satisfeito(a) com as condições físicas do meu ambiente de trabalho',
  P6: 'Tenho equilíbrio saudável entre vida pessoal e profissional',
  P7: 'Tenho oportunidades claras de desenvolvimento profissional',
  P8: 'A empresa investe em meu treinamento e desenvolvimento',
  P9: 'Relaciono-me bem com meus colegas de equipe',
  P10: 'Tenho autonomia para tomar decisões em meu trabalho',
  P11: 'Os benefícios oferecidos são adequados',
  P12: 'Estou satisfeito(a) com a remuneração oferecida',
  P13: 'Tenho orgulho em trabalhar nesta empresa',
  P14: 'Sinto-me incluído(a) e respeitado(a) na empresa',
  P15: 'Existe respeito à diversidade no ambiente de trabalho',
}

export default function ClimateReport() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const [survey, setSurvey] = useState<ClimateSurvey | null>(null)
  const [responses, setResponses] = useState<ResponseData[]>([])
  const [loading, setLoading] = useState(true)
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])

  useEffect(() => {
    if (!surveyId) return

    Promise.all([
      dbClimateSurveys.get(surveyId),
      supabase
        .from('climate_responses')
        .select('id, answers')
        .eq('survey_id', surveyId)
    ]).then(([surveyData, { data: responsesData }]) => {
      setSurvey(surveyData)
      setResponses((responsesData || []) as ResponseData[])

      // Calcular estatísticas
      if (surveyData && responsesData && responsesData.length > 0) {
        const stats = calculateStats(surveyData, responsesData as ResponseData[])
        setQuestionStats(stats.questions)
        setCategoryStats(stats.categories)
      }

      setLoading(false)
    })
  }, [surveyId])

  function calculateStats(survey: ClimateSurvey, responses: ResponseData[]) {
    const questions: QuestionStats[] = []
    const categoryAverages: Record<string, { sum: number; count: number }> = {}

    survey.questions.forEach((q) => {
      const distribution = [0, 0, 0, 0, 0]
      let sum = 0

      responses.forEach((r) => {
        const answer = r.answers[q.id]
        if (answer && typeof answer === 'number') {
          distribution[answer - 1]++
          sum += answer
        }
      })

      const average = responses.length > 0 ? sum / responses.length : 0

      questions.push({
        id: q.id,
        text: q.text,
        category: q.category,
        distribution,
        average
      })

      // Acumular por categoria
      if (!categoryAverages[q.category]) {
        categoryAverages[q.category] = { sum: 0, count: 0 }
      }
      categoryAverages[q.category].sum += average
      categoryAverages[q.category].count += 1
    })

    const categories = Object.entries(categoryAverages).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      average: data.count > 0 ? data.sum / data.count : 0,
      totalResponses: responses.length
    }))

    return { questions, categories }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Wind className="animate-spin text-purple-600" size={40} />
      </div>
    )
  }

  if (!survey || responses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Nenhuma resposta coletada ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{survey.title} - Relatório</h1>
        <p className="text-purple-100 mb-4">{survey.description}</p>
        <div className="flex gap-4 text-sm">
          <span>📊 {responses.length} resposta{responses.length !== 1 ? 's' : ''}</span>
          <span>📅 {new Date(survey.start_date).toLocaleDateString('pt-BR')} a {new Date(survey.end_date).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader className="bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">📋 Resumo Executivo</h2>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Total de Respostas</p>
              <p className="text-3xl font-bold text-purple-600">{responses.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Média Geral</p>
              <p className="text-3xl font-bold text-blue-600">
                {(questionStats.reduce((a, b) => a + b.average, 0) / questionStats.length).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Categorias Analisadas</p>
              <p className="text-3xl font-bold text-green-600">{categoryStats.length}</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-slate-700">
              <strong>Interpretação da escala:</strong> 1-2 = Discordância, 3 = Neutro, 4-5 = Concordância
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Médias por Categoria */}
      <Card>
        <CardHeader className="bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">📊 Resultados por Categoria</h2>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <span className="text-lg font-bold text-purple-600">{cat.average.toFixed(2)}/5.0</span>
                </div>
                <div className="w-full h-6 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      cat.average <= 2 ? 'bg-red-500' :
                      cat.average <= 3 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(cat.average / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resultados Detalhados por Pergunta */}
      <Card>
        <CardHeader className="bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">📈 Análise Detalhada por Pergunta</h2>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          {questionStats.map((q, idx) => {
            const total = q.distribution.reduce((a, b) => a + b, 0)
            return (
              <div key={q.id} className="border-b pb-6 last:border-b-0">
                <div className="mb-4">
                  <p className="font-semibold text-slate-800 mb-1">
                    {idx + 1}. {q.text}
                  </p>
                  <p className="text-xs text-slate-500">
                    Categoria: <span className="capitalize">{q.category}</span> · Média: {q.average.toFixed(2)}/5.0
                  </p>
                </div>

                {/* Gráfico de Distribuição */}
                <div className="space-y-2 mb-4">
                  {q.distribution.map((count, idx) => {
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-700">{idx + 1} - {SCALE_LABELS[idx]}</span>
                          <span className="font-semibold">{percentage}% ({count})</span>
                        </div>
                        <div className="w-full h-5 bg-slate-200 rounded overflow-hidden">
                          <div
                            className={`h-full ${SCALE_COLORS[idx]} transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button className="gap-2">
          <Download size={16} />
          Gerar Word
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText size={16} />
          Gerar PDF
        </Button>
      </div>
    </div>
  )
}
