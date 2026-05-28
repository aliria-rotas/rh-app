-- ============================================
-- ADICIONAR NOVAS COLUNAS à tabela existente
-- ============================================

-- Adicionar as 3 novas colunas de perguntas
ALTER TABLE rh_training_responses 
ADD COLUMN IF NOT EXISTS question_4_response TEXT,
ADD COLUMN IF NOT EXISTS question_5_response TEXT,
ADD COLUMN IF NOT EXISTS question_6_response TEXT;

-- Verificação
SELECT * FROM rh_training_responses LIMIT 1;
