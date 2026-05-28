-- ============================================
-- TABELA: Respostas de Treinamento
-- ============================================
-- Armazena as respostas dos colaboradores aos treinamentos

CREATE TABLE IF NOT EXISTS rh_training_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id TEXT NOT NULL,
  training_title TEXT NOT NULL,
  collaborator_name TEXT NOT NULL,
  collaborator_email TEXT NOT NULL,

  -- Respostas do teste (3 perguntas)
  question_1_response TEXT,
  question_2_response TEXT,
  question_3_response TEXT,

  -- Metadata
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES (para performance nas buscas)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_training_responses_training_id
  ON rh_training_responses(training_id);

CREATE INDEX IF NOT EXISTS idx_training_responses_email
  ON rh_training_responses(collaborator_email);

CREATE INDEX IF NOT EXISTS idx_training_responses_created_at
  ON rh_training_responses(created_at DESC);

-- ============================================
-- SEGURANÇA: RLS (Row Level Security)
-- ============================================
ALTER TABLE rh_training_responses ENABLE ROW LEVEL SECURITY;

-- Política 1: Admin (Klissia) pode ver todas as respostas
CREATE POLICY "Admin can view all responses"
  ON rh_training_responses
  FOR SELECT
  USING (auth.uid() = (SELECT id FROM auth.users WHERE email = 'rh@aliria.com'));

-- Política 2: Qualquer um pode inserir respostas (página pública)
CREATE POLICY "Anyone can submit responses"
  ON rh_training_responses
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT COUNT(*) as total_responses FROM rh_training_responses;
