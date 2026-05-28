import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function extractBenefits() {
  try {
    const { data: employees, error } = await supabase
      .from('rh_employees')
      .select('full_name, dental_plan, life_insurance, health_plan_cost')
      .neq('status', 'inativo')

    if (error) {
      console.error('Erro:', error)
      return
    }

    console.log('\n📊 BENEFÍCIOS DOS FUNCIONÁRIOS:\n')

    // Recolhe valores únicos de dental_plan
    const dentalValues = new Set()
    const lifeValues = new Set()

    employees.forEach(e => {
      if (e.dental_plan) {
        const plan = typeof e.dental_plan === 'string' ? JSON.parse(e.dental_plan) : e.dental_plan
        if (plan && (plan.cost || plan.monthly_cost)) {
          dentalValues.add(plan.cost || plan.monthly_cost)
        }
      }
      if (e.life_insurance) {
        const insurance = typeof e.life_insurance === 'string' ? JSON.parse(e.life_insurance) : e.life_insurance
        if (insurance && (insurance.cost || insurance.monthly_cost)) {
          lifeValues.add(insurance.cost || insurance.monthly_cost)
        }
      }
    })

    console.log('🦷 CONVÊNIO ODONTOLÓGICO (Sul América):')
    if (dentalValues.size > 0) {
      console.log(`   Valores encontrados: R$ ${Array.from(dentalValues).sort().join(', R$ ')}`)
    } else {
      console.log('   Sem valores configurados para dentistas')
    }

    console.log('\n🛡️ SEGURO DE VIDA EM GRUPO (Porto Seguro):')
    if (lifeValues.size > 0) {
      console.log(`   Valores encontrados: R$ ${Array.from(lifeValues).sort().join(', R$ ')}`)
    } else {
      console.log('   Sem valores configurados para seguro')
    }

    console.log('\n💾 RESUMO:')
    console.log(`   Funcionários com odontológico: ${employees.filter(e => e.dental_plan).length}`)
    console.log(`   Funcionários com seguro de vida: ${employees.filter(e => e.life_insurance).length}`)

  } catch (err) {
    console.error('Erro:', err)
  }
}

extractBenefits()
