-- Adicionar coluna job_opening_id à tabela rh_interview_questions
ALTER TABLE rh_interview_questions ADD COLUMN IF NOT EXISTS job_opening_id text;

-- Criar índice para busca rápida por vaga
CREATE INDEX IF NOT EXISTS idx_interview_questions_job ON rh_interview_questions(job_opening_id);

-- Criar índice composto para buscas mais eficientes
CREATE INDEX IF NOT EXISTS idx_interview_questions_job_category ON rh_interview_questions(job_opening_id, category, order_number);

-- Nota: As perguntas existentes ficarão com job_opening_id = NULL (genéricas)
-- Quando criar novas perguntas, associá-las a uma vaga específica
