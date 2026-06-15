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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Respostas da Pesquisa</h1>
        <p className="text-slate-500 mt-2">Total: {responses.length} resposta{responses.length !== 1 ? 's' : ''}</p>
      </div>

      {responses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-slate-500">
            Nenhuma resposta coletada ainda
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {responses.map((response, idx) => (
            <Card key={response.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Resposta #{idx + 1}</h3>
                  <span className="text-sm text-slate-500">
                    {new Date(response.submitted_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(response.answers)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([question, answer]) => (
                      <div key={question} className="border-b pb-3 last:border-0">
                        <p className="text-sm font-medium text-slate-700">
                          {QUESTION_LABELS[question] || question}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                answer <= 2
                                  ? 'bg-red-500'
                                  : answer === 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                              }`}
                              style={{ width: `${(answer / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold min-w-6">
                            {answer}/5
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
