import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkSecurity() {
  try {
    console.log('🔍 Verificando segurança do projeto Supabase...\n')
    console.log(`Projeto: ${SUPABASE_URL}\n`)

    // Consultar informações das tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')

    if (tablesError) {
      console.error('❌ Erro ao listar tabelas:', tablesError.message)
      return
    }

    console.log('📊 TABELAS ENCONTRADAS:')
    console.log('═'.repeat(60))
    
    const publicTables = tables.filter(t => !t.table_name.startsWith('_'))
    
    if (publicTables.length === 0) {
      console.log('Nenhuma tabela pública encontrada')
      return
    }

    for (const table of publicTables) {
      console.log(`\n📋 Tabela: ${table.table_name}`)
    }

    // Tentar acessar cada tabela para verificar se está exposta
    console.log('\n\n🔐 VERIFICANDO ACESSO ÀS TABELAS:')
    console.log('═'.repeat(60))

    for (const table of publicTables) {
      const { data, error } = await supabase
        .from(table.table_name)
        .select('*')
        .limit(1)

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`\n❌ ${table.table_name}: BLOQUEADA (RLS ativado ou sem permissão)`)
        } else {
          console.log(`\n⚠️  ${table.table_name}: Erro - ${error.message}`)
        }
      } else {
        console.log(`\n✅ ${table.table_name}: ACESSÍVEL (Publicamente exposta)`)
      }
    }

    console.log('\n\n⚡ RESUMO DE SEGURANÇA:')
    console.log('═'.repeat(60))
    console.log('• Verifique quais tabelas realmente precisam estar públicas')
    console.log('• Dados sensíveis devem ter RLS (Row Level Security) ativado')
    console.log('• Você tem até 30 de outubro de 2026 para se preparar')
    console.log('• Use o Security Advisor no painel para mais detalhes')

  } catch (err) {
    console.error('Erro:', err.message)
  }
}

checkSecurity()
