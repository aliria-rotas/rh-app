-- Criar tabela de respostas de pesquisa de clima
CREATE TABLE IF NOT EXISTS public.climate_responses (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_climate_responses_survey_id ON public.climate_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_climate_responses_submitted_at ON public.climate_responses(submitted_at);

-- Permitir leitura/escrita
ALTER TABLE public.climate_responses ENABLE ROW LEVEL SECURITY;

-- Política para INSERT (qualquer um pode inserir com token válido)
CREATE POLICY "Allow insert climate responses" ON public.climate_responses
  FOR INSERT WITH CHECK (true);

-- Política para SELECT
CREATE POLICY "Allow select climate responses" ON public.climate_responses
  FOR SELECT USING (true);
