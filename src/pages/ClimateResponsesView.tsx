import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface Response {
  id: string
  answers: Record<string, number>
  submitted_at: string
}

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

const SCALE_LABELS = ['😢 Discordo Totalmente', '😕 Discordo', '😐 Neutro', '🙂 Concordo', '😄 Concordo Totalmente']

export default function ClimateResponsesView() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!surveyId) return

    supabase
      .from('climate_responses')
      .select('id, answers, submitted_at')
      .eq('survey_id', surveyId)
      .order('submitted_at', { ascending: false })
      .then(({ data }) => {
        setResponses((data || []) as Response[])
        setLoading(false)
      })
  }, [surveyId])

  if (loading) return <div className="p-6">Carregando...</div>

  if (responses.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Respostas da Pesquisa</h1>
        <Card>
          <CardContent className="p-6 text-center text-slate-500">
            Nenhuma resposta coletada ainda
          </CardContent>
        </Card>
      </div>
    )
  }

  // Agregar respostas por pergunta
  const aggregated: Record<string, number[]> = {}
  responses.forEach(response => {
    Object.entries(response.answers).forEach(([q, answer]) => {
      if (!aggregated[q]) aggregated[q] = [0, 0, 0, 0, 0]
      aggregated[q][answer - 1]++
    })
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resultados da Pesquisa</h1>
        <p className="text-slate-500 mt-2">Total de respostas: {responses.length}</p>
      </div>

      <div className="space-y-6">
        {Object.entries(aggregated)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([question, counts]) => {
            const total = counts.reduce((a, b) => a + b, 0)
            return (
              <Card key={question}>
                <CardHeader>
                  <h3 className="font-semibold text-slate-800">{QUESTION_LABELS[question]}</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {counts.map((count, idx) => {
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-700">{SCALE_LABELS[idx]}</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {percentage}% ({count})
                          </span>
                        </div>
                        <div className="w-full h-6 bg-slate-200 rounded overflow-hidden">
                          <div
                            className={`h-full flex items-center justify-end pr-2 text-xs font-semibold text-white transition-all ${
                              idx <= 1 ? 'bg-red-500' : idx === 2 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 10 && `${percentage}%`}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
