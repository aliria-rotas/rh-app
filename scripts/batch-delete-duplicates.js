/**
 * Script para deletar campanhas duplicadas em BATCH (mais rápido)
 * Usa a API do Supabase para deletar múltiplos IDs de uma vez
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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

async function batchDeleteDuplicates() {
  console.log('\n🔍 Carregando relatório de duplicatas...\n')

  const reportPath = path.join(__dirname, '..', 'duplicates-report.json')
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Arquivo duplicates-report.json não encontrado!')
    console.error('   Execute primeiro: node scripts/find-duplicates.js')
    process.exit(1)
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))
  const args = process.argv.slice(2)
  const isConfirm = args.includes('--confirm')

  console.log(`${isConfirm ? '🗑️  DELETANDO' : '🔄 DRY-RUN'}: ${report.summary.total_to_delete} campanhas em BATCH\n`)

  const allIdsToDelete = []
  report.duplicates.forEach((group) => {
    group.delete_ids.forEach((campaign) => {
      allIdsToDelete.push(campaign.id)
    })
  })

  console.log(`📋 Total de IDs para deletar: ${allIdsToDelete.length}`)
  console.log(`   Batch size: 500 registros por request\n`)

  let totalDeleted = 0
  let totalFailed = 0

  // Deleta em batches de 500
  const batchSize = 500
  for (let i = 0; i < allIdsToDelete.length; i += batchSize) {
    const batch = allIdsToDelete.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(allIdsToDelete.length / batchSize)

    console.log(`[Batch ${batchNum}/${totalBatches}] Deletando ${batch.length} campanhas...`)

    if (isConfirm) {
      try {
        const { error } = await supabase
          .from('rh_endomarketing_campaigns')
          .delete()
          .in('id', batch)

        if (error) {
          console.error(`❌ Erro no batch ${batchNum}: ${error.message}`)
          totalFailed += batch.length
        } else {
          totalDeleted += batch.length
          console.log(`   ✓ ${batch.length} deletadas`)
        }
      } catch (err) {
        console.error(`❌ Erro fatal no batch ${batchNum}:`, err.message)
        totalFailed += batch.length
      }
    } else {
      totalDeleted += batch.length
      console.log(`   [DRY-RUN] Seria deletado: ${batch.length}`)
    }
  }

  console.log('\n' + '═'.repeat(130))
  console.log(`\n📊 RESULTADO:`)
  console.log(`   • Total de campanhas deletadas: ${totalDeleted}`)
  console.log(`   • Total de falhas: ${totalFailed}`)
  console.log()
}

batchDeleteDuplicates()
