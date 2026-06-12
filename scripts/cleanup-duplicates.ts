/**
 * Script para identificar e remover campanhas duplicadas na tabela rh_endomarketing_campaigns
 *
 * PROCESSO:
 * 1. Conecta ao Supabase usando as variáveis de ambiente
 * 2. Busca campanhas com mesmo título (agrupa e conta)
 * 3. Para cada grupo de duplicatas, mantém a mais recente (created_at) e deleta as outras
 * 4. Log detalhado das operações
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Carrega variáveis de ambiente do .env
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Precisa ser a chave de serviço, não anon

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas no .env')
  console.error('   - VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CampaignRow {
  id: string
  title: string
  created_at: string
}

interface DuplicateGroup {
  title: string
  count: number
  campaigns: CampaignRow[]
}

async function findDuplicates(): Promise<void> {
  console.log('🔍 Buscando campanhas duplicadas...\n')

  try {
    // Fetch todas as campanhas
    const { data: allCampaigns, error: fetchError } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('id, title, created_at')
      .order('title')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Erro ao buscar campanhas:', fetchError)
      process.exit(1)
    }

    if (!allCampaigns || allCampaigns.length === 0) {
      console.log('✓ Nenhuma campanha encontrada na tabela')
      process.exit(0)
    }

    // Agrupa por título e identifica duplicatas
    const grouped = new Map<string, CampaignRow[]>()
    allCampaigns.forEach((campaign) => {
      const existing = grouped.get(campaign.title) || []
      existing.push(campaign)
      grouped.set(campaign.title, existing)
    })

    // Filtra apenas grupos com duplicatas
    const duplicates: DuplicateGroup[] = []
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
      console.log(`  Total de campanhas: ${allCampaigns.length}`)
      process.exit(0)
    }

    // Exibe relatório de duplicatas
    console.log(`⚠️  ENCONTRADAS ${duplicates.length} CAMPANHAS COM TÍTULOS DUPLICADOS:\n`)
    console.log('─'.repeat(100))

    let totalToDelete = 0
    duplicates.forEach((group, index) => {
      const toDelete = group.count - 1
      totalToDelete += toDelete

      console.log(`\n${index + 1}. "${group.title}"`)
      console.log(`   Total: ${group.count} campanhas (será deletada 1, manterá ${group.count - 1})`)
      console.log(`   `)

      group.campaigns.forEach((campaign, idx) => {
        const isKeep = idx === 0
        const status = isKeep ? '✓ MANTER (mais recente)' : '✗ DELETE'
        console.log(`   [${status}] ID: ${campaign.id} | Criada em: ${new Date(campaign.created_at).toLocaleString('pt-BR')}`)
      })
    })

    console.log(`\n${'─'.repeat(100)}`)
    console.log(`\n📊 RESUMO:`)
    console.log(`   Campanhas duplicadas: ${duplicates.length}`)
    console.log(`   Total de duplicatas a deletar: ${totalToDelete}`)
    console.log(`   Total de campanhas que serão mantidas: ${allCampaigns.length - totalToDelete}`)

    // Pergunta confirmação antes de deletar
    console.log(`\n${'─'.repeat(100)}`)
    console.log(`\n⚠️  PRÓXIMO PASSO: Execute o script com a flag --confirm para deletar as duplicatas:`)
    console.log(`    npx ts-node scripts/cleanup-duplicates.ts --confirm`)
    console.log(`\nOu execute apenas para SIMULAR (sem deletar):`)
    console.log(`    npx ts-node scripts/cleanup-duplicates.ts --dry-run\n`)

    // Se passou --confirm ou --dry-run, processa
    const args = process.argv.slice(2)
    if (args.includes('--confirm')) {
      await deleteDuplicates(duplicates)
    } else if (args.includes('--dry-run')) {
      console.log('DRY RUN: Nenhuma campanha foi deletada (modo simulação)')
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  }
}

async function deleteDuplicates(duplicates: DuplicateGroup[]): Promise<void> {
  console.log('\n🗑️  DELETANDO DUPLICATAS...\n')

  let totalDeleted = 0
  const failedGroups: string[] = []

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
          console.error(`  ❌ Erro ao deletar "${campaign.id}": ${error.message}`)
          failedGroups.push(group.title)
        } else {
          console.log(`  ✓ Deletada: ${campaign.id} (título: "${group.title}")`)
          totalDeleted++
        }
      } catch (error) {
        console.error(`  ❌ Exceção ao deletar "${campaign.id}":`, error)
        failedGroups.push(group.title)
      }
    }
  }

  console.log(`\n${'─'.repeat(100)}`)
  console.log(`\n✅ LIMPEZA CONCLUÍDA:`)
  console.log(`   Campanhas deletadas: ${totalDeleted}`)
  if (failedGroups.length > 0) {
    console.log(`   ⚠️  Grupos com erro: ${failedGroups.join(', ')}`)
  }
  console.log()
}

// Executa
findDuplicates()
