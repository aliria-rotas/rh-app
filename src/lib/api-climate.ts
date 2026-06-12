import { supabase } from './supabase'
import { ClimateResponse } from '@/types'

/**
 * Recebe respostas do Google Forms automaticamente
 * Esperado: { survey_id, sector, answers: { questionId: value } }
 */
export async function submitClimateResponseFromForm(data: {
  survey_id: string
  sector: 'licitacoes' | 'farmacia' | 'financeiro'
  answers: Record<string, number | string>
}) {
  try {
    const response: ClimateResponse = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      survey_id: data.survey_id,
      sector: data.sector,
      answers: Object.fromEntries(
        Object.entries(data.answers).map(([k, v]) => [k, typeof v === 'string' ? parseInt(v) : v])
      ),
      submitted_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('climate_responses')
      .insert([response])

    if (error) throw error
    return { success: true, id: response.id }
  } catch (error) {
    console.error('Erro ao salvar resposta:', error)
    throw error
  }
}

/**
 * Converte respostas do Google Forms (coluna por pergunta)
 * para o formato esperado pelo app
 */
export function parseGoogleFormsResponse(formData: {
  timestamp: string
  sector: string
  [key: string]: string
}): {
  sector: 'licitacoes' | 'farmacia' | 'financeiro'
  answers: Record<string, number>
} {
  const sector = formData.sector.toLowerCase().includes('licit')
    ? 'licitacoes'
    : formData.sector.toLowerCase().includes('farm')
      ? 'farmacia'
      : 'financeiro'

  const answers: Record<string, number> = {}
  Object.entries(formData).forEach(([key, value]) => {
    // Pega só o número da escala (1-5)
    const match = value?.match(/^(\d)/)
    if (match) {
      answers[key] = parseInt(match[1])
    }
  })

  return { sector, answers }
}
