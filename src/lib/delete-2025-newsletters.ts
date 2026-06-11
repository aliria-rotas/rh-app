import { supabase } from './supabase'

export async function delete2025Newsletters() {
  try {
    const { error } = await supabase
      .from('rh_endomarketing_campaigns')
      .delete()
      .like('title', '%2025%')

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Erro ao deletar newsletters de 2025:', error)
  }
}
