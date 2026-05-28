-- ============================================
-- SCRIPT: Adicionar Treinamento de Chatbot
-- ============================================
-- Execute este script no Supabase SQL Editor

-- Adicionar o treinamento
INSERT INTO rh_trainings (
  id,
  title,
  description,
  status,
  modality,
  target_competency,
  target_positions,
  provider,
  duration_hours,
  cost_per_person,
  participants_count,
  scheduled_date,
  created_at
) VALUES (
  gen_random_uuid()::text,
  'Atendimento Empático em Chatbot',
  'Treinamento sobre como criar experiências positivas e empáticas através de interações em chatbot. Aborda linguagem clara, gentileza, respeito, empatia, eficiência nas respostas e melhores práticas de comunicação digital.',
  'planejado',
  'online',
  'Comprometimento com o Paciente',
  ARRAY['Farmacêutica', 'Assistente de Farmácia', 'Analista de RH'],
  'RH Interna',
  2,
  0,
  0,
  NULL,
  NOW()
);

-- Verificar se foi criado com sucesso
SELECT
  id,
  title,
  status,
  modality,
  duration_hours,
  cost_per_person,
  created_at
FROM rh_trainings
WHERE title = 'Atendimento Empático em Chatbot'
ORDER BY created_at DESC
LIMIT 1;
