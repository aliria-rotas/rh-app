/**
 * Endpoint da API para receber respostas do Google Forms via Zapier
 *
 * POST /api/climate/responses
 *
 * Headers:
 *   Authorization: Bearer [SEE .env.example]
 *   Content-Type: application/json
 *
 * Body:
 * {
 *   "survey_id": "survey_123",
 *   "sector": "licitacoes",
 *   "answers": {
 *     "P1_Lideranca_Feedback": "4",
 *     "P2_Lideranca_Motivacao": "5",
 *     ...
 *   }
 * }
 */

import { supabase } from './supabase'
import { validateApiToken } from './api-keys'
import { ClimateResponse } from '@/types'

interface WebhookPayload {
  survey_id: string
  answers: Record<string, string | number>
}

export async function handleClimateResponse(
  token: string,
  payload: WebhookPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  // Validar token
  if (!validateApiToken(token)) {
    return { success: false, error: 'Invalid or missing API token' }
  }

  try {
    // Converter respostas para números
    const answers: Record<string, number> = {}
    Object.entries(payload.answers).forEach(([key, value]) => {
      const num = typeof value === 'string' ? parseInt(value) : value
      if (!isNaN(num) && num >= 1 && num <= 5) {
        answers[key] = num
      }
    })

    // Validar que todas as perguntas foram respondidas (17 esperadas)
    if (Object.keys(answers).length < 16) {
      return { success: false, error: 'Incomplete responses' }
    }

    // Criar resposta
    const response: ClimateResponse = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      survey_id: payload.survey_id,
      sector: payload.sector,
      answers,
      submitted_at: new Date().toISOString(),
    }

    // Salvar no Supabase
    const { error } = await supabase
      .from('climate_responses')
      .insert([response])

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: 'Failed to save response' }
    }

    return { success: true, id: response.id }
  } catch (error) {
    console.error('API error:', error)
    return { success: false, error: 'Internal server error' }
  }
}

/**
 * Express middleware para o endpoint
 *
 * Uso:
 * app.post('/api/climate/responses', climateResponseMiddleware)
 */
export async function climateResponseMiddleware(req: any, res: any) {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization || req.headers['x-api-key']
    const token = authHeader?.replace('Bearer ', '') || authHeader

    // Processar resposta
    const result = await handleClimateResponse(token, req.body)

    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' })
  }
}
