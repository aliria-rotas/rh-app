/**
 * Hook para popular as campanhas de endomarketing na primeira inicialização
 */

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { seedCampanhasEndomarketing } from '@/lib/seed-campanhas'
import { migrateCampaignTypes } from '@/lib/migrate-campaign-types'

export function useSeedCampanhas() {
  useEffect(() => {
    async function populateCampaigns() {
      try {
        // Corrige "Haloween" → "Halloween"
        await supabase
          .from('rh_endomarketing_campaigns')
          .update({ title: 'Halloween — Conscientização Lúdica (Saúde Mental)' })
          .eq('title', 'Haloween — Conscientização Lúdica (Saúde Mental)')

        // Migra tipos de campanhas
        await migrateCampaignTypes()

        // Verifica se as newsletters de 2025 já existem
        const { data: newsletters } = await supabase
          .from('rh_endomarketing_campaigns')
          .select('id')
          .like('title', '%Newsletter%')
          .like('title', '%2025%')

        // Se não existem as newsletters de 2025, insere todas as campanhas
        if (!newsletters || newsletters.length === 0) {
          await seedCampanhasEndomarketing()
        }
      } catch (error) {
        console.error('Erro ao popular campanhas:', error)
      }
    }

    populateCampaigns()
  }, [])
}
