-- Criar tabela de feedbacks (reclamações, sugestões, elogios)
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('reclamacao', 'sugestao', 'elogio')),
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_andamento', 'resolvido')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_name TEXT,
  sender_email TEXT,
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_feedbacks_status ON public.feedbacks(status);
CREATE INDEX idx_feedbacks_type ON public.feedbacks(type);
CREATE INDEX idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem enviar feedback
CREATE POLICY "Usuários autenticados podem criar feedback"
  ON public.feedbacks
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Usuários podem ver seus próprios feedbacks (se tiverem email)
CREATE POLICY "Usuários podem ver seus feedbacks"
  ON public.feedbacks
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    (sender_email = auth.jwt() ->> 'email' OR sender_email IS NULL)
  );

-- Policy: RH pode atualizar e ver todos
CREATE POLICY "RH pode gerenciar todos os feedbacks"
  ON public.feedbacks
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_feedbacks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feedbacks_timestamp
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_feedbacks_updated_at();
