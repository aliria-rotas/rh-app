import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'
const API_TOKEN = process.env.VITE_CLIMATE_API_TOKEN || 'klissia_clima_survey_2026_secure_token_abc123xyz'

// DEBUG: Log every request to understand the payload format
if (process.env.NODE_ENV !== 'production') {
  console.log('[CLIMATE WEBHOOK DEBUG MODE ENABLED]')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function validateApiToken(token: string): boolean {
  const expectedToken = API_TOKEN
  if (!expectedToken) {
    console.error('API token not configured')
    return false
  }
  return token === expectedToken
}

const QUESTION_MAP: Record<string, string> = {
  'Meu gestor fornece feedback claro sobre meu desempenho': 'P1',
  'Sinto-me motivado(a) pelas ações do meu gestor': 'P2',
  'A comunicação interna é clara e transparente': 'P3',
  'Tenho informações suficientes sobre decisões que me afetam': 'P4',
  'Estou satisfeito(a) com as condições físicas do meu ambiente de trabalho': 'P5',
  'Tenho equilíbrio saudável entre vida pessoal e profissional': 'P6',
  'Tenho oportunidades claras de desenvolvimento profissional': 'P7',
  'A empresa investe em meu treinamento e desenvolvimento': 'P8',
  'Relaciono-me bem com meus colegas de equipe': 'P9',
  'Tenho autonomia para tomar decisões em meu trabalho': 'P10',
  'Os benefícios oferecidos são adequados': 'P11',
  'Estou satisfeito(a) com a remuneração oferecida': 'P12',
  'Tenho orgulho em trabalhar nesta empresa': 'P13',
  'Sinto-me incluído(a) e respeitado(a) na empresa': 'P14',
  'Existe respeito à diversidade no ambiente de trabalho': 'P15',
}

const RESPONSE_MAP: Record<string, number> = {
  'Discordo totalmente': 1,
  'Discordo': 2,
  'Neutro': 3,
  'Concordo': 4,
  'Concordo totalmente': 5,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // DEBUG: Log the complete payload
    console.log('[CLIMATE WEBHOOK] Received payload:', JSON.stringify(req.body, null, 2))
    console.log('[CLIMATE WEBHOOK] Request headers:', JSON.stringify(req.headers, null, 2))

    // Extrair token do header
    const authHeader = req.headers.authorization || req.headers['x-api-key']
    const token = authHeader?.toString().replace('Bearer ', '') || ''

    // Validar token
    if (!validateApiToken(token)) {
      return res.status(401).json({ success: false, error: 'Invalid or missing API token' })
    }

    console.log('[CLIMATE WEBHOOK] Raw body:', JSON.stringify(req.body, null, 2))

    let survey_id = req.body.survey_id
    if (!survey_id) {
      console.log('[CLIMATE WEBHOOK] Missing survey_id. Available keys:', Object.keys(req.body))
      return res.status(400).json({
        success: false,
        error: 'Missing survey_id',
        received_keys: Object.keys(req.body)
      })
    }

    // Tentar extrair answers de diferentes formatos
    let numericAnswers: Record<string, number> = {}

    // Formato 1: answers como objeto { P1: 2, P2: 3, ... }
    if (req.body.answers && typeof req.body.answers === 'object') {
      Object.entries(req.body.answers).forEach(([key, value]) => {
        const num = typeof value === 'string' ? parseInt(value as string) : (value as number)
        if (!isNaN(num) && num >= 1 && num <= 5) {
          numericAnswers[key] = num
        }
      })
    }

    // Formato 2: answers como campos diretos { P1: 2, P2: 3, ... } ou { "Meu gestor...": "Discordo", ... }
    if (Object.keys(numericAnswers).length === 0) {
      Object.entries(req.body).forEach(([key, value]) => {
        // Se a chave é P1, P2, etc
        if (/^P\d+$/.test(key)) {
          const num = typeof value === 'string' ? parseInt(value as string) : (value as number)
          if (!isNaN(num) && num >= 1 && num <= 5) {
            numericAnswers[key] = num
          }
        }
        // Se a chave é o texto da pergunta, mapear para P1-P15
        else if (QUESTION_MAP[key]) {
          const questionKey = QUESTION_MAP[key]
          const responseValue = RESPONSE_MAP[value as string]
          if (responseValue) {
            numericAnswers[questionKey] = responseValue
          }
        }
      })
    }

    // Validar que tem pelo menos 15 respostas
    if (Object.keys(numericAnswers).length < 15) {
      return res.status(400).json({
        success: false,
        error: `Incomplete responses - got ${Object.keys(numericAnswers).length}, expected 15`,
        received: Object.keys(numericAnswers)
      })
    }

    // Criar resposta
    const response = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      survey_id,
      answers: numericAnswers,
      submitted_at: new Date().toISOString(),
    }

    // Salvar resposta
    const { error: insertError } = await supabase.from('climate_responses').insert([response])

    if (insertError) {
      console.error('Database insert error:', insertError)
      return res.status(500).json({ success: false, error: 'Failed to save response' })
    }

    // Atualizar contador de respostas na pesquisa
    const { error: updateError } = await supabase.rpc('increment_climate_responses', {
      p_survey_id: survey_id
    })

    if (updateError) {
      console.error('Failed to increment counter:', updateError)
      // Não falha a requisição, apenas loga o erro
    }

    return res.status(200).json({ success: true, id: response.id })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
