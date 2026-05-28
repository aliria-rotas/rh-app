#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

console.log('🚀 SETUP AUTOMÁTICO — Treinamento Público\n')
console.log('=' .repeat(50) + '\n')

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// PASSO 1: Criar tabela via RPC ou inserção
async function setupDatabase() {
  console.log('📊 PASSO 1: Verificando/Criando tabela no Supabase...\n')

  try {
    // Tentar inserir um registro teste
    // Se a tabela não existe, vai dar erro e saberemos que precisa ser criada
    const { data, error } = await supabase
      .from('rh_training_responses')
      .select('id')
      .limit(1)

    if (error && error.code === 'PGRST116') {
      console.log('⚠️  Tabela não encontrada. É necessário executar o SQL manualmente.')
      console.log('\n📌 EXECUTE ISTO NO SUPABASE:')
      console.log('   1. Abra: https://supabase.com/dashboard')
      console.log('   2. SQL Editor')
      console.log('   3. Cole o arquivo: CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql')
      console.log('   4. Clique em RUN\n')
      return false
    }

    if (error) {
      console.log('⚠️  Erro ao verificar tabela:', error.message)
      return false
    }

    console.log('✅ Tabela rh_training_responses encontrada!\n')
    return true
  } catch (err) {
    console.error('❌ Erro:', err.message)
    return false
  }
}

// PASSO 2: Testar conexão com o servidor
async function testServer() {
  console.log('🖥️  PASSO 2: Testando servidor local...\n')

  try {
    const response = await fetch('http://localhost:5173', {
      timeout: 5000,
    })

    if (response.status === 200 || response.status === 304) {
      console.log('✅ Servidor rodando em http://localhost:5173\n')
      return true
    }
  } catch (err) {
    console.log('⚠️  Servidor não está respondendo ainda.')
    console.log('   Execute em outro terminal: npm run dev\n')
    return false
  }
}

// PASSO 3: Resumo final
async function printSummary(serverOk, dbOk) {
  console.log('=' .repeat(50) + '\n')
  console.log('📋 RESUMO DO SETUP:\n')

  console.log(`${dbOk ? '✅' : '⚠️ '} Banco de dados: ${dbOk ? 'OK' : 'Executar SQL manualmente'}`)
  console.log(`${serverOk ? '✅' : '⚠️ '} Servidor local: ${serverOk ? 'OK' : 'Execute npm run dev'}\n`)

  console.log('=' .repeat(50) + '\n')

  if (dbOk && serverOk) {
    console.log('🎉 TUDO PRONTO! Próximos passos:\n')
    console.log('1️⃣  Abra: http://localhost:5173/treinamento-publico')
    console.log('2️⃣  Preencha o formulário com seus dados')
    console.log('3️⃣  Envie as respostas')
    console.log('4️⃣  Vá para: http://localhost:5173/treinamento')
    console.log('5️⃣  Faça login com: rh@aliria.com / Teste@123456')
    console.log('6️⃣  Vá para a aba: "Respostas do Treinamento"')
    console.log('7️⃣  Veja suas respostas!\n')
  } else {
    console.log('⚠️  Você ainda precisa:\n')
    if (!dbOk) {
      console.log('1. Executar o SQL no Supabase (veja instruções acima)')
    }
    if (!serverOk) {
      console.log(`${!dbOk ? '2' : '1'}. Executar: npm run dev`)
    }
    console.log()
  }

  console.log('📖 Documentação completa em: ATIVAR-TREINAMENTO-PUBLICO.md\n')
}

// Main
async function main() {
  const serverOk = await testServer()
  const dbOk = await setupDatabase()
  await printSummary(serverOk, dbOk)

  process.exit(dbOk && serverOk ? 0 : 1)
}

main().catch(console.error)
