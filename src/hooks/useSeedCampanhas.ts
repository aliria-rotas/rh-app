/**
 * Hook para popular as campanhas de endomarketing na primeira inicialização
 */

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { seedCampanhasEndomarketing } from '@/lib/seed-campanhas'
import { migrateCampaignTypes } from '@/lib/migrate-campaign-types'
import { cleanupOld2025Newsletters } from '@/lib/cleanup-2025-newsletters'

export function useSeedCampanhas() {
  useEffect(() => {
    async function populateCampaigns() {
      try {
        // Remove newsletters antigas de 2025
        await cleanupOld2025Newsletters()

        // Corrige "Haloween" → "Halloween"
        await supabase
          .from('rh_endomarketing_campaigns')
          .update({ title: 'Halloween — Conscientização Lúdica (Saúde Mental)' })
          .eq('title', 'Haloween — Conscientização Lúdica (Saúde Mental)')

        // Migra tipos de campanhas
        await migrateCampaignTypes()

        // Verifica se as newsletters de 2026 já existem
        const { data: newsletters } = await supabase
          .from('rh_endomarketing_campaigns')
          .select('id')
          .like('title', '%Newsletter%')
          .like('title', '%2026%')

        // Se não existem as newsletters de 2026, insere todas as campanhas
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
