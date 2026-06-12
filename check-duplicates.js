import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkDuplicates() {
  try {
    // Get all campaigns
    const { data: campaigns, error } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('*')
      .order('title')

    if (error) throw error

    console.log(`📊 Total de campanhas: ${campaigns.length}`)
    console.log('')

    // Check for duplicate titles
    const titleCounts = {}
    campaigns.forEach(c => {
      titleCounts[c.title] = (titleCounts[c.title] || 0) + 1
    })

    const duplicates = Object.entries(titleCounts).filter(([_, count]) => count > 1)

    if (duplicates.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada!')
      console.log('✅ Todas as campanhas têm títulos únicos')
    } else {
      console.log(`❌ ${duplicates.length} campanhas duplicadas encontradas:`)
      duplicates.forEach(([title, count]) => {
        console.log(`  - "${title}": ${count} vezes`)
      })
    }

    console.log('')
    console.log('📋 Campanhas por mês:')
    const byMonth = {}
    campaigns.forEach(c => {
      const month = c.start_date?.substring(5, 7) || 'N/A'
      const monthName = {
        '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
        '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
        '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
      }[month] || month
      byMonth[monthName] = (byMonth[monthName] || 0) + 1
    })

    Object.entries(byMonth).sort().forEach(([month, count]) => {
      console.log(`  ${month}: ${count}`)
    })

  } catch (err) {
    console.error('❌ Erro:', err.message)
  }
  process.exit(0)
}

checkDuplicates()
