import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { dbClimateSurveys } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ClimateSurvey } from '@/types'
import { Wind, Download, FileText, BarChart3, Loader } from 'lucide-react'

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
  const [generatingWord, setGeneratingWord] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [analysis, setAnalysis] = useState<string>('')
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

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

        // Carregar análise
        loadAnalysis(surveyData, responsesData.length, stats.categories, stats.questions)
      }

      setLoading(false)
    })
  }, [surveyId])

  async function loadAnalysis(
    survey: any,
    responseCount: number,
    categories: CategoryStats[],
    questions: QuestionStats[]
  ) {
    setLoadingAnalysis(true)
    try {
      const response = await fetch('/api/climate/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey,
          responses: responseCount,
          categoryStats: categories,
          questionStats: questions,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Erro ao carregar análise:', error)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  async function downloadWord() {
    if (!survey) return
    setGeneratingWord(true)

    try {
      const html = generateHTMLReport()
      const link = document.createElement('a')
      const blob = new Blob([html], { type: 'application/msword' })
      link.href = URL.createObjectURL(blob)
      link.download = `Relatorio-Clima-${survey.id.slice(-8)}.doc`
      link.click()
    } catch (error) {
      alert('Erro ao gerar Word: ' + (error as any).message)
    } finally {
      setGeneratingWord(false)
    }
  }

  function generateHTMLReport(): string {
    if (!survey) return ''

    const generalAverage =
      questionStats.reduce((a, b) => a + b.average, 0) / (questionStats.length || 1)

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #5b21b6; text-align: center; border-bottom: 3px solid #5b21b6; padding-bottom: 10px; }
    h2 { color: #7c3aed; margin-top: 30px; }
    .header { background-color: #f3e8ff; padding: 20px; margin-bottom: 20px; border-radius: 5px; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat-box { text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 5px; min-width: 150px; }
    .stat-number { font-size: 28px; font-weight: bold; color: #5b21b6; }
    .stat-label { font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f3e8ff; font-weight: bold; }
    .bar { height: 20px; background-color: #5b21b6; border-radius: 3px; }
    .question { margin: 20px 0; page-break-inside: avoid; }
    .distribution { display: flex; gap: 10px; margin: 10px 0; flex-wrap: wrap; }
    .dist-item { flex: 1; min-width: 100px; }
    .dist-bar { height: 15px; background-color: #e5e7eb; border-radius: 2px; margin: 3px 0; }
  </style>
</head>
<body>
  <h1>📊 ${survey.title} - Relatório de Pesquisa de Clima</h1>

  <div class="header">
    <p><strong>${survey.description}</strong></p>
    <p>📅 ${new Date(survey.start_date).toLocaleDateString('pt-BR')} a ${new Date(survey.end_date).toLocaleDateString('pt-BR')}</p>
    <p>📊 Total de Respostas: ${responses.length}</p>
  </div>

  <h2>📋 Resumo Executivo</h2>
  <div class="stats">
    <div class="stat-box">
      <div class="stat-number">${responses.length}</div>
      <div class="stat-label">Total de Respostas</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${generalAverage.toFixed(2)}</div>
      <div class="stat-label">Média Geral (/ 5.0)</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${categoryStats.length}</div>
      <div class="stat-label">Categorias</div>
    </div>
  </div>

  <p><strong>Interpretação:</strong> 1-2 = Discordância | 3 = Neutro | 4-5 = Concordância</p>

  <h2>📊 Resultados por Categoria</h2>
  <table>
    <tr>
      <th>Categoria</th>
      <th>Média</th>
      <th>Gráfico</th>
    </tr>
    ${categoryStats
      .map(
        (cat) => `
    <tr>
      <td>${cat.name}</td>
      <td><strong>${cat.average.toFixed(2)}/5.0</strong></td>
      <td>
        <div style="width: 100%; height: 15px; background-color: #e5e7eb; border-radius: 2px;">
          <div style="width: ${(cat.average / 5) * 100}%; height: 100%; background-color: ${
            cat.average <= 2 ? '#ef4444' : cat.average <= 3 ? '#eab308' : '#22c55e'
          }; border-radius: 2px;"></div>
        </div>
      </td>
    </tr>
    `
      )
      .join('')}
  </table>

  <h2>📈 Análise Detalhada por Pergunta</h2>
  ${questionStats
    .map(
      (q, idx) => `
  <div class="question">
    <h3>${idx + 1}. ${q.text}</h3>
    <p><small>Categoria: <strong>${q.category}</strong> | Média: <strong>${q.average.toFixed(2)}/5.0</strong></small></p>
    <table>
      <tr>
        <th>Resposta</th>
        <th>Quantidade</th>
        <th>Percentual</th>
        <th>Visualização</th>
      </tr>
      ${q.distribution
        .map(
          (count, i) => `
      <tr>
        <td>${i + 1} - ${['Discordo Totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo Totalmente'][i]}</td>
        <td>${count}</td>
        <td>${q.distribution.reduce((a, b) => a + b, 0) > 0 ? Math.round((count / q.distribution.reduce((a, b) => a + b)) * 100) : 0}%</td>
        <td>
          <div style="width: 100%; height: 15px; background-color: #e5e7eb; border-radius: 2px;">
            <div style="width: ${(count / Math.max(1, q.distribution.reduce((a, b) => a + b))) * 100}%; height: 100%; background-color: ${
            ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'][i]
          }; border-radius: 2px;"></div>
          </div>
        </td>
      </tr>
      `
        )
        .join('')}
    </table>
  </div>
  `
    )
    .join('')}

  <hr style="margin-top: 40px;">
  <p style="color: #666; font-size: 12px;">Relatório gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
</body>
</html>
    `
    return html
  }

  async function downloadPDF() {
    setGeneratingPdf(true)
    try {
      alert('PDF será implementado em breve. Por enquanto, use "Imprimir > Salvar como PDF" no navegador.')
    } finally {
      setGeneratingPdf(false)
    }
  }

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

      {/* Análise Textual */}
      {analysis && (
        <Card>
          <CardHeader className="bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">🧠 Análise e Insights</h2>
          </CardHeader>
          <CardContent className="pt-6 prose prose-sm max-w-none">
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {analysis}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-3">
        <Button
          onClick={downloadWord}
          disabled={generatingWord}
          className="gap-2"
        >
          {generatingWord ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
          {generatingWord ? 'Gerando...' : 'Gerar Word'}
        </Button>
        <Button
          onClick={downloadPDF}
          disabled={generatingPdf}
          variant="outline"
          className="gap-2"
        >
          {generatingPdf ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
          {generatingPdf ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </div>
    </div>
  )
}
