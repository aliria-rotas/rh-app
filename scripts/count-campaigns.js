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

async function count() {
  const { count, error } = await supabase
    .from('rh_endomarketing_campaigns')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }

  console.log(`\n📊 Total de campanhas na tabela: ${count}\n`)
}

count()
