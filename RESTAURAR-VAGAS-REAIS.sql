-- ============================================
-- RESTAURAR VAGAS REAIS - Confirmadas pelo usuário
-- ============================================
-- Data: 28/05/2026
-- Vagas a restaurar:
-- 1. Assistente de Farmácia (encerrada)
-- 2. Analista de Licitações (cancelada)
-- 3. Enfermeira (aberta)

-- 1. ASSISTENTE DE FARMÁCIA (Encerrada)
INSERT INTO rh_job_openings (
  id, title, position_id, department, status,
  description, required_competencies,
  opening_date, closing_date, candidates_count,
  created_at
) VALUES
  ('job_farmacia_001', 'Assistente de Farmácia', '', 'Farmácia', 'encerrada',
   'Vaga para Assistente de Farmácia.',
   '[]'::jsonb,
   '2026-01-01', '2026-05-20', 0, NOW());

-- 2. ANALISTA DE LICITAÇÕES (Cancelada)
INSERT INTO rh_job_openings (
  id, title, position_id, department, status,
  description, required_competencies,
  opening_date, closing_date, candidates_count,
  created_at
) VALUES
  ('job_licitacoes_001', 'Analista de Licitações', '', 'Administrativo', 'cancelada',
   'Vaga para Analista de Licitações.',
   '[]'::jsonb,
   '2026-02-01', '2026-05-15', 0, NOW());

-- 3. ENFERMEIRA (Aberta)
INSERT INTO rh_job_openings (
  id, title, position_id, department, status,
  description, required_competencies,
  opening_date, closing_date, candidates_count,
  created_at
) VALUES
  ('job_enfermeira_001', 'Enfermeira', '', 'Saúde', 'aberta',
   'Vaga para Enfermeira.',
   '[]'::jsonb,
   '2026-05-01', '', 0, NOW());

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT
  id,
  title,
  department,
  status,
  created_at
FROM rh_job_openings
ORDER BY created_at DESC;
