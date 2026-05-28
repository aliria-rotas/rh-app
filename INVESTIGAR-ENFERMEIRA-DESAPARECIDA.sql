-- ============================================
-- SCRIPT: Investigar Vaga de Enfermeira Desaparecida
-- ============================================
-- Procurar por qualquer posição relacionada a enfermeira

-- 1. Buscar todas as vagas com "enfermeira" ou "enfermeiro" no title
SELECT
  id,
  title,
  description,
  status,
  created_at,
  updated_at
FROM rh_job_openings
WHERE LOWER(title) LIKE '%enfermeira%'
   OR LOWER(title) LIKE '%enfermeiro%'
   OR LOWER(description) LIKE '%enfermeira%'
   OR LOWER(description) LIKE '%enfermeiro%'
ORDER BY created_at DESC;

-- 2. Listar TODAS as vagas abertas atualmente para comparação
SELECT
  id,
  title,
  status,
  created_at,
  updated_at
FROM rh_job_openings
WHERE status = 'open' OR status = 'aberta'
ORDER BY created_at DESC;

-- 3. Listar TODAS as vagas (inclusive fechadas/deletadas) para verificar histórico
SELECT
  id,
  title,
  status,
  created_at,
  updated_at
FROM rh_job_openings
ORDER BY updated_at DESC
LIMIT 50;

-- 4. Contar total de vagas por status
SELECT
  status,
  COUNT(*) as total
FROM rh_job_openings
GROUP BY status;
