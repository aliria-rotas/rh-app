import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'
const API_TOKEN = process.env.VITE_CLIMATE_API_TOKEN || 'klissia_clima_survey_2026_secure_token_abc123xyz'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function validateApiToken(token: string): boolean {
  const expectedToken = API_TOKEN
  if (!expectedToken) {
    console.error('API token not configured')
    return false
  }
  return token === expectedToken
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    // Extrair token do header
    const authHeader = req.headers.authorization || req.headers['x-api-key']
    const token = authHeader?.toString().replace('Bearer ', '') || ''

    // Validar token
    if (!validateApiToken(token)) {
      return res.status(401).json({ success: false, error: 'Invalid or missing API token' })
    }

    const { survey_id, answers } = req.body

    if (!survey_id || !answers) {
      return res.status(400).json({ success: false, error: 'Missing required fields' })
    }

    // Converter respostas para números
    const numericAnswers: Record<string, number> = {}
    Object.entries(answers).forEach(([key, value]) => {
      const num = typeof value === 'string' ? parseInt(value as string) : (value as number)
      if (!isNaN(num) && num >= 1 && num <= 5) {
        numericAnswers[key] = num
      }
    })

    // Validar que tem pelo menos 15 respostas
    if (Object.keys(numericAnswers).length < 15) {
      return res.status(400).json({ success: false, error: 'Incomplete responses' })
    }

    // Criar resposta
    const response = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      survey_id,
      answers: numericAnswers,
      submitted_at: new Date().toISOString(),
    }

    // Salvar no Supabase
    const { error } = await supabase.from('climate_responses').insert([response])

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ success: false, error: 'Failed to save response' })
    }

    return res.status(200).json({ success: true, id: response.id })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
