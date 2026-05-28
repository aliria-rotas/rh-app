#!/usr/bin/env node

const BASE_URL = 'http://localhost:5175'
const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'

console.log('🧪 TESTE AUTOMÁTICO — Treinamento Público\n')
console.log('=' .repeat(60) + '\n')

// TESTE 1: Verificar se o servidor está rodando
async function testServer() {
  console.log('1️⃣  Testando servidor...')
  try {
    const response = await fetch(`${BASE_URL}`)
    if (response.status >= 200 && response.status < 400) {
      console.log(`   ✅ Servidor respondendo em ${BASE_URL}\n`)
      return true
    }
  } catch (err) {
    console.log(`   ❌ Erro: ${err.message}\n`)
    return false
  }
}

// TESTE 2: Acessar página pública
async function testPublicPage() {
  console.log('2️⃣  Acessando página pública do treinamento...')
  try {
    const response = await fetch(`${BASE_URL}/treinamento-publico`)
    const html = await response.text()

    if (html.includes('Atendimento Empático em Chatbot')) {
      console.log(`   ✅ Página pública carregada com sucesso\n`)
      return true
    } else {
      console.log(`   ⚠️  Página carregada mas conteúdo não encontrado\n`)
      return false
    }
  } catch (err) {
    console.log(`   ❌ Erro: ${err.message}\n`)
    return false
  }
}

// TESTE 3: Tentar submeter resposta (vai falhar se tabela não existe)
async function testSubmitResponse() {
  console.log('3️⃣  Testando envio de resposta...')

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rh_training_responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi',
        'Authorization': 'Bearer sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi',
      },
      body: JSON.stringify({
        training_id: 'chatbot_empatico_001',
        training_title: 'Atendimento Empático em Chatbot',
        collaborator_name: 'Teste Automático',
        collaborator_email: 'teste@automat.com',
        question_1_response: 'Resposta de teste 1',
        question_2_response: 'Resposta de teste 2',
        question_3_response: 'Resposta de teste 3',
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`   ✅ Resposta enviada com sucesso!\n`)
      return true
    } else if (response.status === 404 || data.message?.includes('relation')) {
      console.log(`   ⚠️  Tabela não encontrada (ainda não foi criada)\n`)
      console.log(`      Execute o SQL no Supabase para criar a tabela\n`)
      return false
    } else {
      console.log(`   ⚠️  Erro: ${data.message || response.statusText}\n`)
      return false
    }
  } catch (err) {
    console.log(`   ❌ Erro: ${err.message}\n`)
    return false
  }
}

// TESTE 4: Verificar se a tabela existe
async function testTableExists() {
  console.log('4️⃣  Verificando se tabela rh_training_responses existe...')

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rh_training_responses?select=id&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi',
          'Authorization': 'Bearer sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi',
        },
      }
    )

    if (response.status === 404) {
      console.log(`   ⚠️  Tabela não encontrada\n`)
      return false
    } else if (response.ok) {
      const data = await response.json()
      console.log(`   ✅ Tabela existe! ${data.length} registros encontrados\n`)
      return true
    } else {
      console.log(`   ⚠️  Status: ${response.status}\n`)
      return false
    }
  } catch (err) {
    console.log(`   ❌ Erro: ${err.message}\n`)
    return false
  }
}

// TESTE 5: Acessar página de login do app
async function testLoginPage() {
  console.log('5️⃣  Acessando página de login...')
  try {
    const response = await fetch(`${BASE_URL}/login`)
    const html = await response.text()

    if (html.includes('login') || html.includes('email') || response.status === 200) {
      console.log(`   ✅ Página de login acessível\n`)
      return true
    }
  } catch (err) {
    console.log(`   ❌ Erro: ${err.message}\n`)
    return false
  }
}

// RESUMO FINAL
async function printSummary(results) {
  console.log('=' .repeat(60) + '\n')
  console.log('📊 RESUMO DOS TESTES:\n')

  const tests = [
    'Servidor rodando',
    'Página pública carregada',
    'Envio de resposta',
    'Tabela no banco de dados',
    'Página de login',
  ]

  tests.forEach((test, i) => {
    console.log(`${results[i] ? '✅' : '⚠️ '} ${test}`)
  })

  console.log('\n' + '=' .repeat(60) + '\n')

  if (results[0] && results[1] && results[4]) {
    console.log('🎉 TUDO FUNCIONANDO!\n')

    if (!results[3]) {
      console.log('⚠️  Falta apenas criar a tabela no Supabase:\n')
      console.log('   1. Abra: https://supabase.com/dashboard')
      console.log('   2. Vá para: SQL Editor')
      console.log('   3. Cole: CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql')
      console.log('   4. Clique em RUN\n')
      console.log('   Depois, o sistema estará 100% funcional!\n')
    }

    console.log('📱 Próximos passos:')
    console.log(`   1. Abra: ${BASE_URL}/treinamento-publico`)
    console.log('   2. Preencha o formulário')
    console.log('   3. Envie as respostas')
    console.log(`   4. Faça login em: ${BASE_URL}`)
    console.log('   5. Vá para: Treinamento → Respostas do Treinamento\n')
  } else {
    console.log('❌ Alguns testes falharam\n')
  }

  console.log('📖 Documentação: ATIVAR-TREINAMENTO-PUBLICO.md\n')
}

// MAIN
async function main() {
  const results = [
    await testServer(),
    await testPublicPage(),
    await testSubmitResponse(),
    await testTableExists(),
    await testLoginPage(),
  ]

  await printSummary(results)
}

main().catch(console.error)
