import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function saveBenefitsConfig() {
  try {
    const benefitsConfig = {
      health_plan: { cost: 3444.28, provider: 'Alice Operadora' },
      dental_plan: { cost: 376.85, provider: 'Sul América' },
      meal_voucher: { cost: 37, provider: 'Flash' },
      transport_voucher: { cost: 13.30, provider: 'Flash' },
      life_insurance: { cost: 239.70, provider: 'Porto Seguro' }
    }

    // Tenta atualizar ou inserir na tabela rh_config
    const { data, error } = await supabase
      .from('rh_config')
      .upsert({
        key: 'benefits',
        value: benefitsConfig,
        updated_at: new Date()
      }, { onConflict: 'key' })

    if (error) {
      console.error('❌ Erro ao salvar:', error.message)
      console.log('\nTentando criar tabela rh_config...')
      return
    }

    console.log('✅ Valores dos benefícios salvos no banco de dados!')
    console.log('\n📊 Benefícios configurados:')
    Object.entries(benefitsConfig).forEach(([key, value]) => {
      console.log(`   ${key}: R$ ${value.cost} (${value.provider})`)
    })

  } catch (err) {
    console.error('Erro:', err.message)
  }
}

saveBenefitsConfig()
