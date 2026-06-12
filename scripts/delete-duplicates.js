/**
 * Script para DELETAR campanhas duplicadas baseado no relatório JSON
 *
 * CUIDADO: Este script DELETA dados da base de dados!
 *
 * USO:
 *    node scripts/delete-duplicates.js --confirm
 *
 * O script sempre roda em DRY-RUN por padrão. Use --confirm para executar de verdade.
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

// Carrega relatório
const reportPath = path.join(__dirname, '..', 'duplicates-report.json')
if (!fs.existsSync(reportPath)) {
  console.error('❌ Arquivo duplicates-report.json não encontrado!')
  console.error('   Execute primeiro: node scripts/find-duplicates.js')
  process.exit(1)
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'))

async function deleteDuplicates() {
  const args = process.argv.slice(2)
  const isConfirm = args.includes('--confirm')
  const mode = isConfirm ? '🗑️  DELETANDO PARA VALER' : '🔄 DRY-RUN (simulação)'

  console.log(`\n${mode}\n`)
  console.log(`Relatório de: ${report.timestamp}`)
  console.log(`Total a deletar: ${report.summary.total_to_delete} campanhas\n`)
  console.log('═'.repeat(130))

  let totalDeleted = 0
  let totalFailed = 0
  const deletedIds = []
  const failedIds = []

  for (const group of report.duplicates) {
    console.log(`\n"${group.title}"`)

    for (const campaign of group.delete_ids) {
      try {
        if (isConfirm) {
          const { error } = await supabase
            .from('rh_endomarketing_campaigns')
            .delete()
            .eq('id', campaign.id)

          if (error) {
            console.log(`   ❌ Erro: ${error.message}`)
            totalFailed++
            failedIds.push(campaign.id)
          } else {
            console.log(`   ✓ Deletada: ${campaign.id.substring(0, 8)}...`)
            totalDeleted++
            deletedIds.push(campaign.id)
          }
        } else {
          // DRY-RUN: apenas simula
          console.log(`   [DRY-RUN] Seria deletada: ${campaign.id.substring(0, 8)}...`)
          totalDeleted++
          deletedIds.push(campaign.id)
        }
      } catch (error) {
        console.log(`   ❌ Exceção: ${error.message}`)
        totalFailed++
        failedIds.push(campaign.id)
      }
    }
  }

  console.log(`\n${'═'.repeat(130)}`)
  console.log(`\n📊 RESULTADO FINAL:`)
  console.log(`   Processadas: ${report.summary.total_to_delete}`)
  console.log(`   Deletadas (ou a deletar): ${totalDeleted}`)
  if (totalFailed > 0) {
    console.log(`   ⚠️  Com falha: ${totalFailed}`)
  }

  if (isConfirm) {
    // Salva log de deleção
    const deletionLog = {
      timestamp: new Date().toISOString(),
      total_deleted: totalDeleted,
      total_failed: totalFailed,
      deleted_ids: deletedIds,
      failed_ids: failedIds,
    }
    const logPath = path.join(__dirname, '..', `deletion-log-${Date.now()}.json`)
    fs.writeFileSync(logPath, JSON.stringify(deletionLog, null, 2))
    console.log(`\n📄 Log de deleção salvo em: ${path.basename(logPath)}`)
  } else {
    console.log(`\n${'─'.repeat(130)}`)
    console.log(`\n⏸️  Para executar DE VERDADE, use:`)
    console.log(`\n   node scripts/delete-duplicates.js --confirm`)
    console.log()
  }
}

deleteDuplicates()
