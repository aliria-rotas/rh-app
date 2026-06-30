/**
 * Script para DELETAR TUDO de rh_endomarketing_campaigns
 * ⚠️ CUIDADO: Isso vai remover TODAS as campanhas!
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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function nuke() {
  const args = process.argv.slice(2)
  const isConfirm = args.includes('--confirm')

  if (!isConfirm) {
    console.log('\n⚠️  DRY-RUN: Use --confirm para deletar tudo\n')
  }

  try {
    const { count } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total de campanhas: ${count}`)

    if (isConfirm && count && count > 0) {
      const { error } = await supabase
        .from('rh_endomarketing_campaigns')
        .delete()
        .neq('id', '') // deleta tudo

      if (error) {
        console.error('❌ Erro:', error.message)
        process.exit(1)
      }

      console.log(`🗑️  Deletadas: ${count} campanhas\n`)

      const { count: after } = await supabase
        .from('rh_endomarketing_campaigns')
        .select('*', { count: 'exact', head: true })

      console.log(`✓ Tabela agora tem: ${after} campanhas\n`)
    } else {
      console.log('Use --confirm para executar\n')
    }
  } catch (err) {
    console.error('❌ Erro fatal:', err.message)
    process.exit(1)
  }
}

nuke()
