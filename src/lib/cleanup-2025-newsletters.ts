import { supabase } from './supabase'

export async function cleanupOld2025Newsletters() {
  try {
    const { error } = await supabase
      .from('rh_endomarketing_campaigns')
      .delete()
      .like('title', '%2025%')
      .eq('type', 'comunicado')

    if (error) {
      console.error('Erro ao deletar newsletters de 2025:', error)
      throw error
    }
  } catch (error) {
    console.error('Erro na limpeza de newsletters:', error)
  }
}
