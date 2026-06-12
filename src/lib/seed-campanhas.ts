/**
 * Script para adicionar as campanhas de Endomarketing
 * Campanhas de junho 2026 até junho 2027
 */

import { supabase } from './supabase'
import { generateId } from './storage'

const now = () => new Date().toISOString()

export async function seedCampanhasEndomarketing() {
  const campaigns = [
    // NEWSLETTERS 2026 (Junho a Dezembro)
    { id: generateId(), title: 'Newsletter Junho 2026', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2026-06-01', end_date: '2026-06-30', created_at: now() },
    { id: generateId(), title: 'Newsletter Julho 2026', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2026-07-01', end_date: '2026-07-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Agosto 2026', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2026-08-01', end_date: '2026-08-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Setembro 2026', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2026-09-01', end_date: '2026-09-30', created_at: now() },
    { id: generateId(), title: 'Newsletter Outubro 2026', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2026-10-01', end_date: '2026-10-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Novembro 2026', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2026-11-01', end_date: '2026-11-30', created_at: now() },
    { id: generateId(), title: 'Newsletter Dezembro 2026', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2026-12-01', end_date: '2026-12-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Janeiro 2027', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2027-01-01', end_date: '2027-01-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Fevereiro 2027', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2027-02-01', end_date: '2027-02-28', created_at: now() },
    { id: generateId(), title: 'Newsletter Março 2027', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2027-03-01', end_date: '2027-03-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Abril 2027', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2027-04-01', end_date: '2027-04-30', created_at: now() },
    { id: generateId(), title: 'Newsletter Maio 2027', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2027-05-01', end_date: '2027-05-31', created_at: now() },
    { id: generateId(), title: 'Newsletter Junho 2027', type: 'comunicado', status: 'planejada',
      description: 'Boletim informativo mensal com notícias, dicas e informações sobre saúde e bem-estar.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Newsletter'],
      start_date: '2027-06-01', end_date: '2027-06-30', created_at: now() },

    // JUNHO 2026
    { id: generateId(), title: 'Festa Junina + Jogo da Copa + Aniversariante do Mês', type: 'evento', status: 'planejada',
      description: 'Celebração de junho com tema junino, transmissão de jogo da Copa e homenagem aos aniversariantes do mês. Confraternização com comidas típicas, danças, jogo ao vivo e reconhecimento dos colaboradores aniversariantes.',
      target_audience: 'Toda a equipe', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'],
      start_date: '2026-06-24', end_date: '2026-06-24', created_at: now() },
    { id: generateId(), title: 'Junho Vermelho — Doação de Sangue', type: 'campanha', status: 'planejada',
      description: 'Uma gota vermelha pode salvar uma vida. Campanha de doação de sangue.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Reunião presencial'],
      start_date: '2026-06-01', end_date: '2026-06-30', created_at: now() },

    // JULHO 2026
    { id: generateId(), title: 'Julho Amarelo — Hepatites Virais', type: 'campanha', status: 'planejada',
      description: 'Hepatite não é piada. Previna-se. Conscientização sobre hepatites virais.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-07-01', end_date: '2026-07-31', created_at: now() },
    { id: generateId(), title: 'Julho Verde — Câncer de Cabeça e Pescoço', type: 'campanha', status: 'planejada',
      description: 'Câncer de cabeça e pescoço: detecção precoce salva. Conscientização e prevenção.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital'],
      start_date: '2026-07-01', end_date: '2026-07-31', created_at: now() },

    // AGOSTO 2026
    { id: generateId(), title: 'Agosto Lilás — Prevenção à Violência Contra a Mulher', type: 'campanha', status: 'planejada',
      description: 'Não é amor. É violência. Denuncie. Combate à violência contra a mulher.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-08-01', end_date: '2026-08-31', created_at: now() },

    // SETEMBRO 2026
    { id: generateId(), title: 'Setembro Amarelo — Prevenção ao Suicídio', type: 'campanha', status: 'planejada',
      description: 'Fale. Ouça. Salve uma vida. Conscientização sobre prevenção ao suicídio.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-09-01', end_date: '2026-09-30', created_at: now() },
    { id: generateId(), title: 'Setembro Verde — Doação de Órgãos e Tecidos', type: 'campanha', status: 'planejada',
      description: 'Doe órgãos. Doe vida. Doe esperança. Incentivo à doação de órgãos.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital'],
      start_date: '2026-09-01', end_date: '2026-09-30', created_at: now() },
    { id: generateId(), title: 'Dia do Farmacêutico', type: 'reconhecimento', status: 'planejada',
      description: 'Homenagem e reconhecimento aos farmacêuticos da equipe. Valorização profissional e confraternização.',
      target_audience: 'Farmacêuticos e equipe', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'],
      start_date: '2026-09-20', end_date: '2026-09-20', created_at: now() },

    // OUTUBRO 2026
    { id: generateId(), title: 'Outubro Rosa — Câncer de Mama', type: 'campanha', status: 'planejada',
      description: 'Outubro Rosa. Mês de conscientização e cuidado. Promover prevenção e diagnóstico de câncer de mama.',
      target_audience: 'Colaboradoras mulheres', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-10-01', end_date: '2026-10-31', created_at: now() },
    { id: generateId(), title: 'Halloween — Festa de Confraternização', type: 'evento', status: 'planejada',
      description: 'Diversão e integração da equipe com tema Halloween. Confraternização com fantasia, decoração e atividades temáticas.',
      target_audience: 'Toda a equipe', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'],
      start_date: '2026-10-20', end_date: '2026-10-31', created_at: now() },

    // NOVEMBRO 2026
    { id: generateId(), title: 'Novembro Azul — Câncer de Próstata', type: 'campanha', status: 'planejada',
      description: 'Saúde do homem é importante. Cuide-se. Conscientização sobre prevenção de câncer de próstata.',
      target_audience: 'Colaboradores homens', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-11-01', end_date: '2026-11-30', created_at: now() },

    // DEZEMBRO 2026
    { id: generateId(), title: 'Confraternização de Fim de Ano', type: 'evento', status: 'planejada',
      description: 'Celebração do encerramento do ano com toda a equipe. Confraternização, premiações e atividades de integração.',
      target_audience: 'Toda a equipe', channels: ['Reunião presencial','Mural físico/digital','WhatsApp (grupo)'],
      start_date: '2026-12-15', end_date: '2026-12-31', created_at: now() },
    { id: generateId(), title: 'Dezembro Vermelho — HIV/AIDS e ISTs', type: 'campanha', status: 'planejada',
      description: 'Prevenção, Teste e Tratamento. Todos merecem. Conscientização sobre HIV e ISTs.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital','Reunião presencial'],
      start_date: '2026-12-01', end_date: '2026-12-31', created_at: now() },
    { id: generateId(), title: 'Dezembro Laranja — Acidentes Domésticos', type: 'campanha', status: 'planejada',
      description: 'Segurança em casa e no trabalho salva vidas. Conscientização sobre prevenção de acidentes.',
      target_audience: 'Toda a equipe', channels: ['E-mail','Mural físico/digital'],
      start_date: '2026-12-01', end_date: '2026-12-31', created_at: now() },
  ]

  // Verifica quais campanhas já existem
  const existingTitles = campaigns.map(c => c.title)
  const { data: existing } = await supabase
    .from('rh_endomarketing_campaigns')
    .select('title')
    .in('title', existingTitles)

  const existingTitleSet = new Set(existing?.map(e => e.title) ?? [])
  const campaignsToInsert = campaigns.filter(c => !existingTitleSet.has(c.title))

  if (campaignsToInsert.length === 0) {
    return
  }

  const { error } = await supabase.from('rh_endomarketing_campaigns').insert(campaignsToInsert)

  if (error) {
    throw error
  }
}
