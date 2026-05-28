import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Tabelas conhecidas do projeto
const knownTables = [
  'rh_employees',
  'rh_job_openings',
  'rh_interview_questions',
  'rh_benefits_config',
  'rh_benefits_validation',
  'rh_benefits_validation_items'
]

async function checkSecurity() {
  try {
    console.log('🔍 VERIFICAÇÃO DE SEGURANÇA - SUPABASE')
    console.log('═'.repeat(70))
    console.log(`Projeto: fmivqhsfkvfunznrlxde`)
    console.log(`Data da verificação: ${new Date().toLocaleString('pt-BR')}\n`)

    console.log('📊 ANÁLISE DE ACESSO ÀS TABELAS:')
    console.log('─'.repeat(70))

    let publicTables = []
    let restrictedTables = []
    let errorTables = []

    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('new row violates row-level security')) {
            restrictedTables.push(tableName)
            console.log(`✅ ${tableName.padEnd(40)} | RLS ATIVADO (Protegido)`)
          } else if (error.code === 'PGRST200' || error.message.includes('does not exist')) {
            console.log(`⚠️  ${tableName.padEnd(40)} | Tabela não encontrada`)
            errorTables.push(tableName)
          } else {
            console.log(`⚠️  ${tableName.padEnd(40)} | ${error.message.substring(0, 30)}...`)
            errorTables.push(tableName)
          }
        } else {
          publicTables.push(tableName)
          console.log(`❌ ${tableName.padEnd(40)} | ACESSÍVEL PUBLICAMENTE (⚠️ Revisar!)`)
        }
      } catch (err) {
        console.log(`❌ ${tableName.padEnd(40)} | Erro na conexão`)
        errorTables.push(tableName)
      }
    }

    console.log('\n' + '═'.repeat(70))
    console.log('📈 RESUMO:')
    console.log('─'.repeat(70))
    console.log(`✅ Tabelas protegidas (RLS): ${restrictedTables.length}`)
    restrictedTables.forEach(t => console.log(`   • ${t}`))
    
    if (publicTables.length > 0) {
      console.log(`\n❌ Tabelas públicas (expostas): ${publicTables.length}`)
      publicTables.forEach(t => console.log(`   • ${t} ← REVISAR`))
    } else {
      console.log(`\n✅ Nenhuma tabela publicamente exposta!`)
    }

    if (errorTables.length > 0) {
      console.log(`\n⚠️  Tabelas com erro: ${errorTables.length}`)
      errorTables.forEach(t => console.log(`   • ${t}`))
    }

    console.log('\n' + '═'.repeat(70))
    console.log('🎯 RECOMENDAÇÕES:')
    console.log('─'.repeat(70))
    
    if (publicTables.length > 0) {
      console.log('⚠️  AÇÃO NECESSÁRIA:')
      console.log('   • Analise se essas tabelas realmente precisam estar públicas')
      console.log('   • Implemente RLS (Row Level Security) para proteger dados sensíveis')
      console.log('   • Revise as políticas de acesso no painel Supabase')
    } else {
      console.log('✅ Seu projeto parece bem configurado!')
      console.log('   • As tabelas com dados sensíveis têm RLS ativado')
      console.log('   • Mantenha essa configuração até a migração de outubro')
    }

    console.log('\n📅 PRAZOS IMPORTANTES:')
    console.log('   • 30 de maio de 2026: Novos projetos terão RLS obrigatório')
    console.log('   • 30 de outubro de 2026: Todos os projetos existentes também')
    console.log('\n💡 Próximos passos:')
    console.log('   1. Acesse: https://supabase.com/dashboard')
    console.log('   2. Vá para: Security → Security Advisor')
    console.log('   3. Revise as recomendações de segurança')

  } catch (err) {
    console.error('❌ Erro geral:', err.message)
  }
}

checkSecurity()
