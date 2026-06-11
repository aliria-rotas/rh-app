import { supabase } from './supabase'

export async function purgeOldData() {
  try {
    // Delete campaigns where start_date contains 2025
    const { error: error1 } = await supabase
      .from('rh_endomarketing_campaigns')
      .delete()
      .ilike('start_date', '2025%')

    // Delete campaigns where title contains 2025
    const { error: error2 } = await supabase
      .from('rh_endomarketing_campaigns')
      .delete()
      .ilike('title', '%2025%')

    // Delete Jan-May 2026 campaigns (non-newsletter)
    const { error: error3 } = await supabase
      .from('rh_endomarketing_campaigns')
      .delete()
      .ilike('start_date', '2026-0[1-5]%')
      .neq('type', 'comunicado')

    if (error1 || error2 || error3) {
      console.error('Cleanup errors:', { error1, error2, error3 })
    }
  } catch (error) {
    console.error('Erro ao purgar dados antigos:', error)
  }
}
