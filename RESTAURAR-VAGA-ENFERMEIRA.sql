-- ============================================
-- SCRIPT: Restaurar Vaga de Enfermeira
-- ============================================
-- Se a vaga de enfermeira foi deletada, execute este script para restaurá-la
-- IMPORTANTE: Preencha os valores corretos antes de executar

-- Template para inserir a vaga de enfermeira (ajuste conforme necessário)
INSERT INTO rh_job_openings (
  title,
  description,
  status,
  department,
  location,
  salary_min,
  salary_max,
  employment_type,
  required_skills,
  created_at,
  updated_at
) VALUES (
  'Enfermeira',
  'Vaga em aberto para Enfermeira',  -- Ajuste a descrição conforme necessário
  'open',
  'Saúde',  -- Departamento - ajuste conforme necessário
  'São Paulo, SP',  -- Localização - ajuste conforme necessário
  NULL,  -- Salário mínimo - ajuste conforme necessário
  NULL,  -- Salário máximo - ajuste conforme necessário
  'full-time',  -- Tipo de contrato - ajuste conforme necessário
  NULL,  -- Habilidades requeridas - ajuste conforme necessário
  NOW(),
  NOW()
)
RETURNING *;

-- Verificar que a vaga foi inserida com sucesso
SELECT
  id,
  title,
  status,
  created_at
FROM rh_job_openings
WHERE LOWER(title) LIKE '%enfermeira%'
ORDER BY created_at DESC;
