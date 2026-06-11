/**
 * Migração: Mover SIPAT e Doação de Sangue de "evento" para "campanha"
 */

import { supabase } from './supabase'

export async function migrateCampaignTypes() {
  try {
    console.log('🔄 Migrando tipos de campanhas...')

    // SIPAT: evento → campanha
    const { error: error1 } = await supabase
      .from('rh_endomarketing_campaigns')
      .update({ type: 'campanha' })
      .eq('title', 'Abril Verde (SIPAT) — Saúde e Segurança no Trabalho')

    if (error1) throw error1
    console.log('✅ SIPAT migrado para "campanha"')

    // Doação de Sangue: evento → campanha
    const { error: error2 } = await supabase
      .from('rh_endomarketing_campaigns')
      .update({ type: 'campanha' })
      .eq('title', 'Junho Vermelho — Doação de Sangue')

    if (error2) throw error2
    console.log('✅ Doação de Sangue migrada para "campanha"')

    // Halloween: atualizar descrição
    const { error: error3 } = await supabase
      .from('rh_endomarketing_campaigns')
      .update({
        title: 'Halloween — Festa de Confraternização',
        description: 'Diversão e integração da equipe com tema Halloween. Confraternização com fantasia, decoração e atividades temáticas.'
      })
      .ilike('title', 'Halloween%')

    if (error3) throw error3
    console.log('✅ Halloween atualizado')

    console.log('✨ Migração concluída com sucesso!')
  } catch (err) {
    console.error('❌ Erro na migração:', err)
  }
}
