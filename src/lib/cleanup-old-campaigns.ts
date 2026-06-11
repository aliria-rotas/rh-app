import { supabase } from './supabase'

export async function cleanupOldCampaigns() {
  try {
    // Delete all 2025 campaigns
    await supabase
      .from('rh_endomarketing_campaigns')
      .delete()
      .like('start_date', '2025%')

    // Delete January to May 2026 campaigns (except newsletters which are comunicado type)
    const januaryToMayMonths = ['01', '02', '03', '04', '05']
    for (const month of januaryToMayMonths) {
      await supabase
        .from('rh_endomarketing_campaigns')
        .delete()
        .like('start_date', `2026-${month}%`)
        .neq('type', 'comunicado')
    }
  } catch (error) {
    console.error('Erro ao limpar campanhas antigas:', error)
  }
}
