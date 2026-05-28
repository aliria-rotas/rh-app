import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function saveBenefitsConfig() {
  try {
    console.log('📊 Salvando valores dos benefícios no banco de dados...\n')

    const benefits = [
      { key: 'health_plan', cost: 3444.28, provider: 'Alice Operadora' },
      { key: 'dental_plan', cost: 376.85, provider: 'Sul América' },
      { key: 'meal_voucher', cost: 37.00, provider: 'Flash' },
      { key: 'transport_voucher', cost: 13.30, provider: 'Flash' },
      { key: 'life_insurance', cost: 239.70, provider: 'Porto Seguro' }
    ]

    // Tenta salvar cada benefício individualmente
    for (const benefit of benefits) {
      const { error } = await supabase
        .from('rh_benefits_config')
        .upsert({
          benefit_key: benefit.key,
          cost: benefit.cost,
          provider: benefit.provider,
          updated_at: new Date()
        }, { onConflict: 'benefit_key' })

      if (error) {
        console.log(`⚠️  ${benefit.key}: Tabela não existe ainda`)
      } else {
        console.log(`✅ ${benefit.key}: R$ ${benefit.cost} (${benefit.provider})`)
      }
    }

    console.log('\n💡 Se recebeu erros, execute o SQL no console do Supabase:')
    console.log('📋 Arquivo: create-benefits-config.sql')

  } catch (err) {
    console.error('Erro:', err.message)
  }
}

saveBenefitsConfig()
