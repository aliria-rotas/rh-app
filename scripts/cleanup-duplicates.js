/**
 * Script para identificar e remover campanhas duplicadas na tabela rh_endomarketing_campaigns
 *
 * USO:
 * 1. Identificar duplicatas:
 *    node scripts/cleanup-duplicates.js
 *
 * 2. Deletar duplicatas (CUIDADO!):
 *    node scripts/cleanup-duplicates.js --confirm
 *
 * 3. Simular delete sem executar:
 *    node scripts/cleanup-duplicates.js --dry-run
 *
 * REQUISITOS:
 * - Arquivo .env na raiz do projeto com VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Carrega .env manualmente
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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Credenciais do Supabase não encontradas')
  console.error('   Adicione ao .env:')
  console.error('   - VITE_SUPABASE_URL=https://seu-projeto.supabase.co')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findDuplicates() {
  console.log('🔍 Buscando campanhas duplicadas na tabela rh_endomarketing_campaigns...\n')

  try {
    // Fetch todas as campanhas
    const { data: allCampaigns, error: fetchError } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('id, title, created_at')
      .order('title')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Erro ao buscar campanhas:', fetchError.message)
      process.exit(1)
    }

    if (!allCampaigns || allCampaigns.length === 0) {
      console.log('✓ Nenhuma campanha encontrada na tabela')
      process.exit(0)
    }

    console.log(`📋 Total de campanhas: ${allCampaigns.length}`)
    console.log()

    // Agrupa por título e identifica duplicatas
    const grouped = new Map()
    allCampaigns.forEach((campaign) => {
      const existing = grouped.get(campaign.title) || []
      existing.push(campaign)
      grouped.set(campaign.title, existing)
    })

    // Filtra apenas grupos com duplicatas
    const duplicates = []
    grouped.forEach((campaigns, title) => {
      if (campaigns.length > 1) {
        duplicates.push({
          title,
          count: campaigns.length,
          campaigns,
        })
      }
    })

    if (duplicates.length === 0) {
      console.log('✓ Nenhuma campanha duplicada encontrada!')
      process.exit(0)
    }

    // Exibe relatório de duplicatas
    console.log(`⚠️  ENCONTRADAS ${duplicates.length} CAMPANHAS COM TÍTULOS DUPLICADOS:\n`)
    console.log('═'.repeat(120))

    let totalToDelete = 0
    duplicates.forEach((group, index) => {
      const toDelete = group.count - 1
      totalToDelete += toDelete

      console.log(`\n${index + 1}. TÍTULO: "${group.title}"`)
      console.log(`   └─ Total: ${group.count} campanhas | Será deletada: ${toDelete}`)
      console.log()

      group.campaigns.forEach((campaign, idx) => {
        const isKeep = idx === 0
        const status = isKeep ? '✓ MANTER (mais recente)' : '✗ DELETE'
        const createdDate = new Date(campaign.created_at).toLocaleString('pt-BR')
        console.log(
          `      [${status}] ID: ${campaign.id.substring(0, 8)}... | Criada: ${createdDate}`
        )
      })
    })

    console.log(`\n${'═'.repeat(120)}`)
    console.log(`\n📊 RESUMO FINAL:`)
    console.log(`   • Campanhas com duplicatas: ${duplicates.length}`)
    console.log(`   • Total a deletar: ${totalToDelete}`)
    console.log(`   • Total que será mantido: ${allCampaigns.length - totalToDelete}`)

    // Pronto para deletar
    const args = process.argv.slice(2)

    if (args.includes('--confirm')) {
      await deleteDuplicates(duplicates)
    } else if (args.includes('--dry-run')) {
      console.log(`\n🔄 DRY-RUN: Nenhuma campanha foi deletada (apenas simulação)`)
      console.log(`\nPara deletar as duplicatas, execute:`)
      console.log(`   node scripts/cleanup-duplicates.js --confirm`)
    } else {
      console.log(`\n${'─'.repeat(120)}`)
      console.log(`\n⏸️  PRÓXIMO PASSO: Para deletar as duplicatas, execute:`)
      console.log(`\n   node scripts/cleanup-duplicates.js --confirm`)
      console.log(`\nOu para simular primeiro:`)
      console.log(`   node scripts/cleanup-duplicates.js --dry-run\n`)
    }
  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  }
}

async function deleteDuplicates(duplicates) {
  console.log(`\n${'─'.repeat(120)}`)
  console.log('\n🗑️  INICIANDO DELEÇÃO DE DUPLICATAS...\n')

  let totalDeleted = 0
  const failedIds = []

  for (const group of duplicates) {
    // Pega todos EXCETO o primeiro (que é o mais recente)
    const toDelete = group.campaigns.slice(1)

    for (const campaign of toDelete) {
      try {
        const { error } = await supabase
          .from('rh_endomarketing_campaigns')
          .delete()
          .eq('id', campaign.id)

        if (error) {
          console.log(`   ❌ Erro ao deletar: ${error.message}`)
          failedIds.push(campaign.id)
        } else {
          console.log(
            `   ✓ Deletada: ${campaign.id.substring(0, 8)}... (título: "${group.title.substring(0, 50)}")`
          )
          totalDeleted++
        }
      } catch (error) {
        console.log(`   ❌ Exceção ao deletar ${campaign.id.substring(0, 8)}...`)
        failedIds.push(campaign.id)
      }
    }
  }

  console.log(`\n${'═'.repeat(120)}`)
  console.log(`\n✅ LIMPEZA CONCLUÍDA:`)
  console.log(`   • Campanhas deletadas: ${totalDeleted}`)
  if (failedIds.length > 0) {
    console.log(`   ⚠️  IDs com falha: ${failedIds.length}`)
  } else {
    console.log(`   ✓ Nenhuma falha reportada`)
  }
  console.log()
}

// Executa
findDuplicates()
