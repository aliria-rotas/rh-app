/**
 * Script para adicionar as 23 campanhas de Endomarketing + Halloween
 * Execute este script uma única vez para popular as campanhas
 */

import { supabase } from './supabase'
import { generateId } from './storage'

const now = () => new Date().toISOString()

export async function seedCampanhasEndomarketing() {
  const campaigns = [
    // NEWSLETTERS 2025
    { id: generateId(), title: 'Newsletter Junho 2025', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2025-06-01', end_date: '2025-06-30', created_at: now() },
    { id: generateId(), title: 'Newsletter Julho 2025', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2025-07-01', end_date: '2025-07-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Agosto 2025', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2025-08-01', end_date: '2025-08-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Setembro 2025', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2025-09-01', end_date: '2025-09-30', created_at: now() },
    { id: generateId(), title: 'Newsletter Outubro 2025', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2025-10-01', end_date: '2025-10-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Novembro 2025', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2025-11-01', end_date: '2025-11-30', created_at: now() },
    { id: generateId(), title: 'Newsletter Dezembro 2025', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2025-12-01', end_date: '2025-12-31', created_at: now() },

    // JANEIRO
    { id: generateId(), title: 'Janeiro Branco — Saúde Mental', type: 'campanha', status: 'planejada',
      description: 'Sua mente merece cuidado. Fale, ouça, acolha. Conscientização sobre saúde mental e prevenção ao suicídio.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital'],
      start_date: '2026-01-01', end_date: '2026-01-31', created_at: now() },
    { id: generateId(), title: 'Janeiro Roxo — Hanseníase', type: 'campanha', status: 'planejada',
      description: 'Hanseníase tem cura. Detecção precoce salva vidas. Conscientização e desmistificação da doença.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital'],
      start_date: '2026-01-01', end_date: '2026-01-31', created_at: now() },

    // FEVEREIRO
    { id: generateId(), title: 'Fevereiro Laranja — Leucemia e Bullying', type: 'campanha', status: 'planejada',
      description: 'Cores diferentes. Coração igual. Sem bullying. Conscientização sobre leucemia e combate ao bullying.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-02-01', end_date: '2026-02-28', created_at: now() },
    { id: generateId(), title: 'Fevereiro Roxo — Fibromialgia, Lúpus e Alzheimer', type: 'campanha', status: 'planejada',
      description: 'Doenças invisíveis. Dor real. Compassão necessária. Dar visibilidade a doenças invisíveis.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-02-01', end_date: '2026-02-28', created_at: now() },

    // MARÇO
    { id: generateId(), title: 'Março Lilás — Prevenção ao Câncer de Colo de Útero', type: 'campanha', status: 'planejada',
      description: 'Previna-se. Diagnostique cedo. Viva pleno. Promover prevenção e diagnóstico precoce.',
      target_audience: 'Colaboradoras mulheres', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital'],
      start_date: '2026-03-01', end_date: '2026-03-31', created_at: now() },
    { id: generateId(), title: 'Março Azul-Marinho — Câncer Colorretal', type: 'campanha', status: 'planejada',
      description: 'Prevenção no trabalho começa por você. Conscientização sobre prevenção de câncer colorretal.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-03-01', end_date: '2026-03-31', created_at: now() },

    // ABRIL
    { id: generateId(), title: 'Abril Verde (SIPAT) — Saúde e Segurança no Trabalho', type: 'campanha', status: 'planejada',
      description: 'Segurança é responsabilidade de todos. Semana de prevenção com palestras, simulado e atividades.',
      target_audience: 'Toda a equipe', channels: ['Reunião presencial','Mural físico/digital','E-mail','WhatsApp (grupo)'],
      start_date: '2026-04-01', end_date: '2026-04-07', created_at: now() },
    { id: generateId(), title: 'Abril Azul — Autismo (TEA)', type: 'campanha', status: 'planejada',
      description: 'Autismo é diferença, não deficiência. Conscientização e inclusão de pessoas com TEA.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-04-01', end_date: '2026-04-30', created_at: now() },
    { id: generateId(), title: 'Abril Laranja — Prevenção de Amputações', type: 'campanha', status: 'planejada',
      description: 'Seus dedos valem ouro. Proteja-os. Conscientização sobre acidentes de trabalho.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital'],
      start_date: '2026-04-01', end_date: '2026-04-30', created_at: now() },

    // MAIO
    { id: generateId(), title: 'Maio Amarelo — Segurança no Trânsito', type: 'campanha', status: 'planejada',
      description: 'No trânsito, todos somos responsáveis. Redução de acidentes de trânsito.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital'],
      start_date: '2026-05-01', end_date: '2026-05-31', created_at: now() },

    // JUNHO
    { id: generateId(), title: 'Junho Vermelho — Doação de Sangue', type: 'campanha', status: 'planejada',
      description: 'Uma gota vermelha pode salvar uma vida. Campanha de doação de sangue.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Reunião presencial'],
      start_date: '2026-06-01', end_date: '2026-06-30', created_at: now() },

    // JULHO
    { id: generateId(), title: 'Julho Amarelo — Hepatites Virais', type: 'campanha', status: 'planejada',
      description: 'Hepatite não é piada. Previna-se. Conscientização sobre hepatites virais.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-07-01', end_date: '2026-07-31', created_at: now() },
    { id: generateId(), title: 'Julho Verde — Câncer de Cabeça e Pescoço', type: 'campanha', status: 'planejada',
      description: 'Câncer de cabeça e pescoço: detecção precoce salva. Conscientização e prevenção.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital'],
      start_date: '2026-07-01', end_date: '2026-07-31', created_at: now() },

    // AGOSTO
    { id: generateId(), title: 'Agosto Lilás — Prevenção à Violência Contra a Mulher', type: 'campanha', status: 'planejada',
      description: 'Não é amor. É violência. Denuncie. Combate à violência contra a mulher.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-08-01', end_date: '2026-08-31', created_at: now() },

    // SETEMBRO
    { id: generateId(), title: 'Setembro Amarelo — Prevenção ao Suicídio', type: 'campanha', status: 'planejada',
      description: 'Fale. Ouça. Salve uma vida. Conscientização sobre prevenção ao suicídio.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-09-01', end_date: '2026-09-30', created_at: now() },
    { id: generateId(), title: 'Setembro Verde — Doação de Órgãos e Tecidos', type: 'campanha', status: 'planejada',
      description: 'Doe órgãos. Doe vida. Doe esperança. Incentivo à doação de órgãos.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital'],
      start_date: '2026-09-01', end_date: '2026-09-30', created_at: now() },

    // OUTUBRO
    { id: generateId(), title: 'Outubro Rosa — Câncer de Mama', type: 'campanha', status: 'planejada',
      description: 'Outubro Rosa. Mês de conscientização e cuidado. Promover prevenção e diagnóstico de câncer de mama.',
      target_audience: 'Colaboradoras mulheres', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-10-01', end_date: '2026-10-31', created_at: now() },
    { id: generateId(), title: 'Halloween — Festa de Confraternização', type: 'evento', status: 'planejada',
      description: 'Diversão e integração da equipe com tema Halloween. Confraternização com fantasia, decoração e atividades temáticas.',
      target_audience: 'Toda a equipe', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'],
      start_date: '2026-10-20', end_date: '2026-10-31', created_at: now() },

    // NOVEMBRO
    { id: generateId(), title: 'Novembro Azul — Câncer de Próstata', type: 'campanha', status: 'planejada',
      description: 'Saúde do homem é importante. Cuide-se. Conscientização sobre prevenção de câncer de próstata.',
      target_audience: 'Colaboradores homens', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-11-01', end_date: '2026-11-30', created_at: now() },

    // DEZEMBRO
    { id: generateId(), title: 'Dezembro Vermelho — HIV/AIDS e ISTs', type: 'campanha', status: 'planejada',
      description: 'Prevenção, Teste e Tratamento. Todos merecem. Conscientização sobre HIV e ISTs.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-12-01', end_date: '2026-12-31', created_at: now() },
    { id: generateId(), title: 'Dezembro Laranja — Acidentes Domésticos', type: 'campanha', status: 'planejada',
      description: 'Segurança em casa e no trabalho salva vidas. Conscientização sobre prevenção de acidentes.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital'],
      start_date: '2026-12-01', end_date: '2026-12-31', created_at: now() },
  ]

  console.log(`🚀 Verificando campanhas de endomarketing...`)

  // Verifica quais campanhas já existem
  const existingTitles = campaigns.map(c => c.title)
  const { data: existing } = await supabase
    .from('rh_endomarketing_campaigns')
    .select('title')
    .in('title', existingTitles)

  const existingTitleSet = new Set(existing?.map(e => e.title) ?? [])
  const campaignsToInsert = campaigns.filter(c => !existingTitleSet.has(c.title))

  if (campaignsToInsert.length === 0) {
    console.log('✅ Todas as campanhas já existem no banco de dados.')
    return
  }

  console.log(`🚀 Inserindo ${campaignsToInsert.length} novas campanhas de endomarketing...`)
  const { error } = await supabase.from('rh_endomarketing_campaigns').insert(campaignsToInsert)

  if (error) {
    console.error('❌ Erro ao inserir campanhas:', error)
    throw error
  }

  console.log(`✅ ${campaignsToInsert.length} campanhas inseridas com sucesso!`)
}
