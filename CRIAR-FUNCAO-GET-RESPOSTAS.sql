-- ============================================
-- FUNÇÃO PÚBLICA PARA OBTER RESPOSTAS DO TREINAMENTO
-- ============================================

CREATE OR REPLACE FUNCTION public.get_training_responses(
  p_training_id TEXT
) RETURNS TABLE (
  id UUID,
  training_id TEXT,
  training_title TEXT,
  collaborator_name TEXT,
  collaborator_email TEXT,
  question_1_response TEXT,
  question_2_response TEXT,
  question_3_response TEXT,
  question_4_response TEXT,
  question_5_response TEXT,
  question_6_response TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  -- Apenas rh@aliria.com pode acessar
  IF auth.email() != 'rh@aliria.com' THEN
    RAISE EXCEPTION 'Sem permissão para acessar respostas';
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    r.training_id,
    r.training_title,
    r.collaborator_name,
    r.collaborator_email,
    r.question_1_response,
    r.question_2_response,
    r.question_3_response,
    r.question_4_response,
    r.question_5_response,
    r.question_6_response,
    r.completed_at,
    r.created_at,
    r.updated_at
  FROM public.rh_training_responses r
  WHERE r.training_id = p_training_id
  ORDER BY r.completed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para chamar a função
GRANT EXECUTE ON FUNCTION public.get_training_responses TO authenticated, service_role;

-- Verificação
SELECT 'Função get_training_responses criada com sucesso!' as resultado;
