/**
 * Script para IDENTIFICAR campanhas duplicadas na tabela rh_endomarketing_campaigns
 *
 * Este script APENAS LÊ dados — não deleta nada.
 * Usa a anon key do .env, não precisa de credenciais adicionais.
 *
 * USO:
 *    node scripts/find-duplicates.js
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

async function findDuplicates() {
  console.log('\n🔍 Buscando campanhas duplicadas...\n')

  try {
    // Fetch todas as campanhas
    const { data: allCampaigns, error: fetchError } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('id, title, created_at, description')
      .order('title')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Erro ao buscar campanhas:', fetchError.message)
      process.exit(1)
    }

    if (!allCampaigns || allCampaigns.length === 0) {
      console.log('ℹ️  Nenhuma campanha encontrada na tabela')
      process.exit(0)
    }

    console.log(`📋 Total de campanhas na tabela: ${allCampaigns.length}\n`)

    // Agrupa por título
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
      console.log(`   Todas as ${allCampaigns.length} campanhas têm títulos únicos.\n`)
      process.exit(0)
    }

    // Exibe relatório detalhado
    console.log(`⚠️  ENCONTRADAS ${duplicates.length} CAMPANHAS COM TÍTULOS DUPLICADOS\n`)
    console.log('═'.repeat(130))

    let totalToDelete = 0
    duplicates.forEach((group, index) => {
      const toDelete = group.count - 1
      totalToDelete += toDelete

      console.log(`\n${index + 1}. TÍTULO: "${group.title}"`)
      console.log(`   ├─ Total de duplicatas: ${group.count}`)
      console.log(`   ├─ Será deletada: ${toDelete} campanha(s)`)
      console.log(`   └─ Será mantida: 1 (a mais recente)\n`)

      group.campaigns.forEach((campaign, idx) => {
        const isKeep = idx === 0
        const icon = isKeep ? '✓ MANTER' : '✗ DELETE'
        const createdDate = new Date(campaign.created_at).toLocaleString('pt-BR')
        const desc = campaign.description
          ? campaign.description.substring(0, 40).replace(/\n/g, ' ')
          : '(sem descrição)'

        console.log(`      ${icon}`)
        console.log(`      ├─ ID: ${campaign.id}`)
        console.log(`      ├─ Criada em: ${createdDate}`)
        console.log(`      └─ Descrição: ${desc}...`)
        if (idx < group.campaigns.length - 1) console.log()
      })

      console.log()
    })

    console.log('═'.repeat(130))
    console.log(`\n📊 RESUMO FINAL:`)
    console.log(`   • Total de campanhas: ${allCampaigns.length}`)
    console.log(`   • Campanhas com títulos duplicados: ${duplicates.length}`)
    console.log(`   • Total de duplicatas a deletar: ${totalToDelete}`)
    console.log(`   • Campanhas que serão mantidas: ${allCampaigns.length - totalToDelete}`)

    // Salva relatório em arquivo
    const reportPath = path.join(__dirname, '..', 'duplicates-report.json')
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_campaigns: allCampaigns.length,
        duplicated_titles: duplicates.length,
        total_to_delete: totalToDelete,
        will_remain: allCampaigns.length - totalToDelete,
      },
      duplicates: duplicates.map((d) => ({
        title: d.title,
        count: d.count,
        keep_id: d.campaigns[0].id,
        keep_created_at: d.campaigns[0].created_at,
        delete_ids: d.campaigns.slice(1).map((c) => ({
          id: c.id,
          created_at: c.created_at,
        })),
      })),
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Relatório salvo em: duplicates-report.json`)
    console.log()
  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
    process.exit(1)
  }
}

findDuplicates()
