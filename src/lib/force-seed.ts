import { supabase } from './supabase'
import { seedCampanhasEndomarketing } from './seed-campanhas'

export async function forceSeedNow() {
  try {
    // Delete ALL campaigns
    const { data: all } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('id')

    if (all && all.length > 0) {
      const ids = all.map(c => c.id)
      await supabase
        .from('rh_endomarketing_campaigns')
        .delete()
        .in('id', ids)
    }

    // Seed fresh
    await seedCampanhasEndomarketing()
  } catch (e) {
    console.error('Force seed error:', e)
  }
}
