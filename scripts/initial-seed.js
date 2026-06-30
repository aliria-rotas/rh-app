/**
 * Script para SEED INICIAL de campanhas
 * Isso só deve rodar UMA VEZ quando a tabela está vazia
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const generateId = () => crypto.randomUUID()

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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function initialSeed() {
  console.log('\n🌱 Iniciando seed de campanhas...\n')

  try {
    const { count } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Campanhas atuais: ${count}`)

    if (count && count > 0) {
      console.log('\n⚠️  Tabela não está vazia! Seed inicial deve rodar apenas UMA VEZ.')
      console.log('   Se você deseja re-seedar, delete as campanhas primeiro:\n')
      console.log('   node scripts/nuke-campaigns.js --confirm\n')
      process.exit(1)
    }

    // Executa o seed
    await seedCampanhasEndomarketing()

    const { count: after } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('*', { count: 'exact', head: true })

    console.log(`\n✓ Seed completo! ${after} campanhas adicionadas\n`)
  } catch (err) {
    console.error('❌ Erro:', err.message)
    process.exit(1)
  }
}

initialSeed()
