-- Insira isso no Supabase SQL Editor para adicionar o Dia do Farmacêutico
-- https://app.supabase.com/project/YOUR_PROJECT/sql

INSERT INTO rh_endomarketing_campaigns (
  id,
  title,
  type,
  status,
  description,
  target_audience,
  channels,
  start_date,
  end_date,
  created_at
) VALUES (
  'camp_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_' || substr(md5(random()::text), 1, 9),
  'Dia do Farmacêutico',
  'celebracao',
  'planejada',
  'Homenagem e reconhecimento aos farmacêuticos e profissionais da farmácia pela dedicação e contribuição na saúde.',
  'Equipe de Farmácia',
  '["Reunião presencial","E-mail","Mural físico/digital"]'::jsonb,
  '2026-10-20',
  '2026-10-20',
  now()
);
