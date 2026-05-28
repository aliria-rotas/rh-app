import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configurar Supabase
const supabaseUrl = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const supabaseAnonKey = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

// Chave de serviço (para admin operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

console.log('🚀 Iniciando setup do treinamento público...\n')

// Função para executar SQL via API REST (admin)
async function executeSQL(sql) {
  try {
    // Usar fetch para executar SQL diretamente via Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'X-Client-Info': 'supabase-js/2.0.0',
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      console.error('❌ Erro ao executar SQL:', response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Erro na execução:', error.message)
    return false
  }
}

// Função alternativa: usar psql
async function executeSQLWithPSQL(sqlFile) {
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execPromise = promisify(exec)

  console.log('📝 Tentando executar SQL com psql...')

  try {
    // Isso só funciona se psql estiver instalado
    const command = `cat "${sqlFile}" | psql -h fmivqhsfkvfunznrlxde.supabase.co -U postgres -d postgres`
    const { stdout } = await execPromise(command)
    console.log('✅ SQL executado com sucesso via psql')
    console.log(stdout)
    return true
  } catch (error) {
    console.error('❌ psql não disponível ou erro:', error.message)
    return false
  }
}

// Função para registrar manualmente (workaround)
async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n')

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Tentar ler uma tabela existente
    const { data, error } = await supabase
      .from('rh_employees')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao conectar:', error.message)
      return false
    }

    console.log('✅ Conexão com Supabase funcionando!\n')
    return true
  } catch (error) {
    console.error('❌ Erro:', error.message)
    return false
  }
}

// Main
async function main() {
  // Teste 1: Verificar conexão
  const connected = await testConnection()

  if (!connected) {
    console.log('\n⚠️  Não foi possível conectar ao Supabase.')
    console.log('📌 INSTRUÇÕES MANUAIS:')
    console.log('1. Abra: https://supabase.com/dashboard')
    console.log('2. Vá para: SQL Editor')
    console.log('3. Cole o arquivo: CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql')
    console.log('4. Clique em RUN\n')
    process.exit(1)
  }

  // Teste 2: Tentar executar o SQL
  console.log('📊 Criando tabela de respostas do treinamento...\n')

  const sqlFile = path.join(process.cwd(), 'CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql')
  const sqlContent = fs.readFileSync(sqlFile, 'utf-8')

  // Tentar via psql primeiro
  const psqlSuccess = await executeSQLWithPSQL(sqlFile)

  if (psqlSuccess) {
    console.log('\n✅ Setup concluído com sucesso!')
    console.log('\n🎉 Próximos passos:')
    console.log('1. npm run dev')
    console.log('2. Abra: http://localhost:5173/treinamento-publico')
    console.log('3. Preencha o formulário e envie')
    console.log('4. Verifique em: http://localhost:5173/treinamento\n')
    process.exit(0)
  }

  // Se psql não funcionar, instruções manuais
  console.log('\n⚠️  Não foi possível executar automaticamente via psql.')
  console.log('\n📌 EXECUÇÃO MANUAL NECESSÁRIA:')
  console.log('1. Abra: https://supabase.com/dashboard')
  console.log('2. Vá para: SQL Editor')
  console.log('3. Cole todo o conteúdo de: CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql')
  console.log('4. Clique em RUN')
  console.log('5. Depois, volta aqui e executa: npm run dev\n')

  process.exit(1)
}

main()
