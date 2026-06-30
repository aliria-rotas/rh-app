/**
 * Seed inicial ÚNICO de campanhas
 * Execute APENAS UMA VEZ quando iniciar o projeto
 * 
 * npm run seed-campaigns
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
const generateId = () => crypto.randomUUID()
const now = () => new Date().toISOString()

const CAMPANHAS = [
  // NEWSLETTERS 2026-2027
  { title: 'Newsletter Junho 2026', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2026-06-01', end_date: '2026-06-30' },
  { title: 'Newsletter Julho 2026', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2026-07-01', end_date: '2026-07-31' },
  { title: 'Newsletter Agosto 2026', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2026-08-01', end_date: '2026-08-31' },
  { title: 'Newsletter Setembro 2026', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2026-09-01', end_date: '2026-09-30' },
  { title: 'Newsletter Outubro 2026', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2026-10-01', end_date: '2026-10-31' },
  { title: 'Newsletter Novembro 2026', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2026-11-01', end_date: '2026-11-30' },
  { title: 'Newsletter Dezembro 2026', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2026-12-01', end_date: '2026-12-31' },
  { title: 'Newsletter Janeiro 2027', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2027-01-01', end_date: '2027-01-31' },
  { title: 'Newsletter Fevereiro 2027', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2027-02-01', end_date: '2027-02-28' },
  { title: 'Newsletter Março 2027', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2027-03-01', end_date: '2027-03-31' },
  { title: 'Newsletter Abril 2027', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2027-04-01', end_date: '2027-04-30' },
  { title: 'Newsletter Maio 2027', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2027-05-01', end_date: '2027-05-31' },
  { title: 'Newsletter Junho 2027', type: 'comunicado', channels: ['E-mail','Newsletter'], start_date: '2027-06-01', end_date: '2027-06-30' },

  // EVENTOS E CELEBRAÇÕES
  { title: 'Festa Junina + Jogo da Copa + Aniversariante do Mês', type: 'evento', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'], start_date: '2026-06-24', end_date: '2026-06-24' },
  { title: 'Dia do Farmacêutico', type: 'celebracao', channels: ['Reunião presencial','E-mail','Mural físico/digital'], start_date: '2026-10-20', end_date: '2026-10-20' },
  { title: 'Halloween — Festa de Confraternização', type: 'evento', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'], start_date: '2026-10-31', end_date: '2026-10-31' },
  { title: 'Confraternização de Fim de Ano', type: 'evento', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'], start_date: '2026-12-15', end_date: '2026-12-31' },

  // CAMPANHAS DE SAÚDE
  { title: 'Junho Vermelho — Doação de Sangue', type: 'campanha', channels: ['WhatsApp (grupo)','E-mail','Reunião presencial'], start_date: '2026-06-01', end_date: '2026-06-30' },
  { title: 'Julho Amarelo — Hepatites Virais', type: 'campanha', channels: ['E-mail','Mural físico/digital','Reunião presencial'], start_date: '2026-07-01', end_date: '2026-07-31' },
  { title: 'Julho Verde — Câncer de Cabeça e Pescoço', type: 'campanha', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital'], start_date: '2026-07-01', end_date: '2026-07-31' },
  { title: 'Agosto Lilás — Prevenção à Violência Contra a Mulher', type: 'campanha', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'], start_date: '2026-08-01', end_date: '2026-08-31' },
  { title: 'Setembro Amarelo — Prevenção ao Suicídio', type: 'campanha', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'], start_date: '2026-09-01', end_date: '2026-09-30' },
  { title: 'Setembro Verde — Doação de Órgãos e Tecidos', type: 'campanha', channels: ['E-mail','Mural físico/digital'], start_date: '2026-09-01', end_date: '2026-09-30' },
  { title: 'Outubro Rosa — Câncer de Mama', type: 'campanha', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'], start_date: '2026-10-01', end_date: '2026-10-31' },
  { title: 'Novembro Azul — Câncer de Próstata', type: 'campanha', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'], start_date: '2026-11-01', end_date: '2026-11-30' },
  { title: 'Dezembro Vermelho — HIV/AIDS e ISTs', type: 'campanha', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'], start_date: '2026-12-01', end_date: '2026-12-31' },
  { title: 'Dezembro Laranja — Acidentes Domésticos', type: 'campanha', channels: ['E-mail','Mural físico/digital'], start_date: '2026-12-01', end_date: '2026-12-31' },
]

async function seed() {
  console.log('\n🌱 Verificando se seed é necessário...\n')

  try {
    const { count } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Campanhas atuais: ${count}`)

    if (count && count > 0) {
      console.log('\n✓ Tabela já possui campanhas. Seed não necessário.\n')
      process.exit(0)
    }

    console.log('\n🌱 Inserindo 27 campanhas...\n')

    const toInsert = CAMPANHAS.map(c => ({
      id: generateId(),
      ...c,
      status: 'planejada',
      description: c.title,
      target_audience: 'Toda a equipe',
      created_at: now(),
    }))

    const { error } = await supabase
      .from('rh_endomarketing_campaigns')
      .insert(toInsert)

    if (error) {
      console.error('❌ Erro ao inserir:', error.message)
      process.exit(1)
    }

    const { count: after } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('*', { count: 'exact', head: true })

    console.log(`✓ Seed completo! ${after} campanhas adicionadas\n`)
  } catch (err) {
    console.error('❌ Erro fatal:', err.message)
    process.exit(1)
  }
}

seed()
