import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

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

interface ResponseData {
  id: string
  answers: Record<string, number>
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { surveyId, format } = req.query

    if (!surveyId || typeof surveyId !== 'string') {
      return res.status(400).json({ error: 'Missing surveyId' })
    }

    // Buscar survey
    const { data: surveyData, error: surveyError } = await supabase
      .from('rh_climate_surveys')
      .select('*')
      .eq('id', surveyId)
      .single()

    if (surveyError || !surveyData) {
      return res.status(404).json({ error: 'Survey not found' })
    }

    // Buscar respostas
    const { data: responsesData, error: responsesError } = await supabase
      .from('climate_responses')
      .select('id, answers')
      .eq('survey_id', surveyId)

    if (responsesError || !responsesData || responsesData.length === 0) {
      return res.status(404).json({ error: 'No responses found' })
    }

    const responses = responsesData as ResponseData[]

    // Calcular estatísticas
    const categoryAverages: Record<string, { sum: number; count: number }> = {}
    const questionStats: Record<string, { distribution: number[]; average: number }> = {}

    surveyData.questions.forEach((q: any) => {
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
      questionStats[q.id] = { distribution, average }

      if (!categoryAverages[q.category]) {
        categoryAverages[q.category] = { sum: 0, count: 0 }
      }
      categoryAverages[q.category].sum += average
      categoryAverages[q.category].count += 1
    })

    // Preparar dados para download
    const reportData = {
      survey: surveyData,
      responses: responses.length,
      generalAverage:
        Object.values(questionStats).reduce((a, b) => a + b.average, 0) /
        Object.keys(questionStats).length,
      categories: Object.entries(categoryAverages).map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        average: data.count > 0 ? data.sum / data.count : 0,
      })),
      questions: surveyData.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        ...questionStats[q.id],
      })),
    }

    // Se format for JSON, retornar dados diretos
    if (format === 'json') {
      return res.status(200).json(reportData)
    }

    // Senão, retornar para download como Word/PDF
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
