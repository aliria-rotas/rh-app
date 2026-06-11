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

        // Verifica se já há 20+ campanhas (sinal de que as novas foram inseridas)
        const { count } = await supabase
          .from('rh_endomarketing_campaigns')
          .select('*', { count: 'exact', head: true })

        // Se houver menos de 20 campanhas, insere as novas
        if ((count ?? 0) < 20) {
          console.log('📢 Populando campanhas de endomarketing...')
          await seedCampanhasEndomarketing()
        }
      } catch (error) {
        console.error('Erro ao popular campanhas:', error)
      }
    }

    populateCampaigns()
  }, [])
}
