/**
 * Script para VERIFICAR resultado da limpeza de duplicatas
 *
 * Compara os dados ANTES e DEPOIS da deleção.
 *
 * USO:
 *    node scripts/verify-cleanup.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Carrega .env
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach((line) => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=')
    if (key && value) {
      env[key.trim()] = value.trim()
    }
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Credenciais do Supabase não encontradas em .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyCleanup() {
  console.log('\n🔍 Verificando status da limpeza...\n')

  try {
    // Fetch todas as campanhas atuais
    const { data: allCampaigns, error: fetchError } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('id, title, created_at')
      .order('title')

    if (fetchError) {
      console.error('❌ Erro ao buscar campanhas:', fetchError.message)
      process.exit(1)
    }

    const currentCount = allCampaigns?.length || 0

    // Carrega relatório anterior (se existir)
    const reportPath = path.join(__dirname, '..', 'duplicates-report.json')
    let previousCount = 0
    let expectedCount = 0
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
      previousCount = report.summary.total_campaigns
      expectedCount = report.summary.will_remain
    }

    // Agrupa por título
    const grouped = new Map()
    allCampaigns.forEach((campaign) => {
      const existing = grouped.get(campaign.title) || []
      existing.push(campaign)
      grouped.set(campaign.title, existing)
    })

    // Verifica duplicatas restantes
    let remainingDuplicates = 0
    const duplicateGroups = []
    grouped.forEach((campaigns, title) => {
      if (campaigns.length > 1) {
        remainingDuplicates++
        duplicateGroups.push({
          title,
          count: campaigns.length,
        })
      }
    })

    // Exibe relatório
    console.log('═'.repeat(130))
    console.log(`\n📊 STATUS DA TABELA rh_endomarketing_campaigns:\n`)

    if (previousCount > 0) {
      console.log(`ANTES da limpeza: ${previousCount} campanhas`)
      console.log(`Esperado DEPOIS: ${expectedCount} campanhas`)
    }
    console.log(`AGORA: ${currentCount} campanhas`)

    if (previousCount > 0 && expectedCount > 0) {
      const deleted = previousCount - currentCount
      console.log(`\nDeletadas: ${deleted} (esperado: 21)`)

      if (deleted === 21) {
        console.log(`✅ Limpeza COMPLETA e BEM-SUCEDIDA!`)
      } else if (deleted < 21) {
        console.log(`⚠️  Limpeza PARCIAL (${21 - deleted} ainda não foram deletadas)`)
      } else {
        console.log(`❌ ATENÇÃO: Deletadas mais do que o esperado!`)
      }
    }

    // Verifica duplicatas restantes
    console.log(`\n${'─'.repeat(130)}`)
    if (remainingDuplicates === 0) {
      console.log(`\n✅ EXCELENTE: Nenhuma campanha duplicada encontrada!`)
      console.log(`   Todos os ${currentCount} títulos são únicos.\n`)
    } else {
      console.log(`\n⚠️  ATENÇÃO: Ainda existem ${remainingDuplicates} duplicatas:\n`)
      duplicateGroups.forEach((group) => {
        console.log(`   • "${group.title}" (${group.count} cópias)`)
      })
      console.log()
    }

    console.log('═'.repeat(130))
    console.log()
  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  }
}

verifyCleanup()
