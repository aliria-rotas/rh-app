import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { seedCampanhasEndomarketing } from '@/lib/seed-campanhas'
import { migrateCampaignTypes } from '@/lib/migrate-campaign-types'

export function useSeedCampanhas() {
  useEffect(() => {
    async function populateCampaigns() {
      try {
        // Clear all campaigns first
        const { data: allCampaigns } = await supabase
          .from('rh_endomarketing_campaigns')
          .select('id')

        if (allCampaigns && allCampaigns.length > 0) {
          const ids = allCampaigns.map(c => c.id)
          await supabase
            .from('rh_endomarketing_campaigns')
            .delete()
            .in('id', ids)
        }

        // Insert fresh campaigns
        await seedCampanhasEndomarketing()

        // Migrate types
        await migrateCampaignTypes()
      } catch (error) {
        console.error('Erro ao popular campanhas:', error)
      }
    }

    populateCampaigns()
  }, [])
}
