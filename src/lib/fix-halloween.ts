/**
 * Script para corrigir "Haloween" → "Halloween" no banco
 */

import { supabase } from './supabase'

export async function fixHalloweenSpelling() {
  try {
    const { error } = await supabase
      .from('rh_endomarketing_campaigns')
      .update({ title: 'Halloween — Conscientização Lúdica (Saúde Mental)' })
      .eq('title', 'Haloween — Conscientização Lúdica (Saúde Mental)')

    if (error) throw error
    console.log('✅ Corrigido: Haloween → Halloween')
  } catch (err) {
    console.error('❌ Erro ao corrigir:', err)
  }
}
