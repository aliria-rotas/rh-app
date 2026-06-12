#!/usr/bin/env node
/**
 * Script para forçar reseed das campanhas de endomarketing
 * Uso: node scripts/force-seed.js
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function generateId() {
  return `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const now = () => new Date().toISOString()

async function seedCampanhasEndomarketing() {
  const campaigns = [
    // NEWSLETTERS 2026 (Junho a Dezembro)
    { id: await generateId(), title: 'Newsletter Junho 2026', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2026-06-01', end_date: '2026-06-30', created_at: now() },
    // ... (abreviar por brevidade)

    // OUTUBRO 2026
    { id: await generateId(), title: 'Outubro Rosa — Câncer de Mama', type: 'campanha', status: 'planejada',
      description: 'Outubro Rosa. Mês de conscientização e cuidado. Promover prevenção e diagnóstico de câncer de mama.',
      target_audience: 'Colaboradoras mulheres', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-10-01', end_date: '2026-10-31', created_at: now() },
    { id: await generateId(), title: 'Dia do Farmacêutico', type: 'celebracao', status: 'planejada',
      description: 'Homenagem e reconhecimento aos farmacêuticos e profissionais da farmácia pela dedicação e contribuição na saúde.',
      target_audience: 'Equipe de Farmácia', channels: ['Reunião presencial','E-mail','Mural físico/digital'],
      start_date: '2026-10-20', end_date: '2026-10-20', created_at: now() },
    { id: await generateId(), title: 'Halloween — Festa de Confraternização', type: 'evento', status: 'planejada',
      description: 'Diversão e integração da equipe com tema Halloween. Confraternização com fantasia, decoração e atividades temáticas.',
      target_audience: 'Toda a equipe', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'],
      start_date: '2026-10-31', end_date: '2026-10-31', created_at: now() },
  ]

  try {
    // Delete ALL campaigns
    const { data: all } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('id')

    if (all && all.length > 0) {
      const ids = all.map(c => c.id)
      await supabase
        .from('rh_endomarketing_campaigns')
        .delete()
        .in('id', ids)
      console.log(`✓ Deleted ${ids.length} campaigns`)
    }

    // Insert just Dia do Farmacêutico to verify it works
    const farmaceutico = campaigns[2]
    const { error } = await supabase
      .from('rh_endomarketing_campaigns')
      .insert([farmaceutico])

    if (error) {
      console.error('❌ Error inserting:', error)
      process.exit(1)
    }

    console.log('✅ Dia do Farmacêutico added successfully!')
    console.log(farmaceutico)

  } catch (e) {
    console.error('❌ Seed error:', e)
    process.exit(1)
  }
}

seedCampanhasEndomarketing()
