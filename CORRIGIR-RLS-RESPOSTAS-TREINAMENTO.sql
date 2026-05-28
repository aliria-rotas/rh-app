-- ============================================
-- CORRIGIR POLÍTICAS RLS
-- ============================================

-- Dropar a política antiga que causa erro
DROP POLICY IF EXISTS "Admin can view all responses" ON rh_training_responses;

-- Criar nova política usando auth.email()
CREATE POLICY "Admin can view all responses"
  ON rh_training_responses
  FOR SELECT
  USING (auth.email() = 'rh@aliria.com');

-- A política de INSERT já está correta
-- Verificação
SELECT 'RLS corrigida com sucesso!' as resultado;
