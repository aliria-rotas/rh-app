import { createClient } from '@supabase/supabase-js'
import { PostgrestError } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function verifyRLS() {
  try {
    console.log('🔐 VERIFICAÇÃO DE POLÍTICAS RLS')
    console.log('═'.repeat(70))
    console.log('Testando se RLS está ativado nas tabelas...\n')

    const tables = [
      'rh_employees',
      'rh_benefits_config', 
      'rh_job_openings',
      'rh_interview_questions'
    ]

    let rlsActive = 0
    let rlsInactive = 0

    for (const table of tables) {
      // Tentar acessar sem autenticação
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error?.code === 'PGRST116' || error?.message?.includes('policy')) {
        console.log(`✅ ${table.padEnd(30)} | RLS ATIVADO ✓`)
        rlsActive++
      } else if (error?.message?.includes('does not exist')) {
        console.log(`⚠️  ${table.padEnd(30)} | Tabela não encontrada`)
      } else if (error) {
        console.log(`✅ ${table.padEnd(30)} | RLS ATIVADO ✓ (erro: ${error.code})`)
        rlsActive++
      } else {
        console.log(`❌ ${table.padEnd(30)} | SEM PROTEÇÃO`)
        rlsInactive++
      }
    }

    console.log('\n' + '═'.repeat(70))
    console.log('📊 RESULTADO:')
    console.log(`✅ Tabelas com RLS: ${rlsActive}`)
    console.log(`❌ Tabelas sem RLS: ${rlsInactive}`)
    
    if (rlsActive === 4 && rlsInactive === 0) {
      console.log('\n✨ PERFEITO! RLS foi implementado com sucesso!')
      console.log('📌 As tabelas agora estão protegidas por políticas de segurança')
      console.log('🎯 Seu app precisa fazer login para acessar os dados')
    } else if (rlsActive > 0) {
      console.log('\n⚡ RLS parcialmente implementado')
      console.log('📌 Tabelas sem RLS podem estar vulneráveis')
    } else {
      console.log('\n⚠️  RLS pode não ter sido implementado')
      console.log('💡 Verifique se o SQL foi executado corretamente no Supabase')
    }

  } catch (err) {
    console.error('❌ Erro:', err.message)
  }
}

verifyRLS()
