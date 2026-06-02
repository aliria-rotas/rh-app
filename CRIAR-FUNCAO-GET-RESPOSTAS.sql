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
  question_2_response TEXT,
  question_3_response TEXT,
  question_4_response TEXT,
  question_5_response TEXT,
  question_6_response TEXT,
  question_7_response TEXT,
  question_8_response TEXT,
  question_9_response TEXT,
  question_10_response TEXT,
  question_11_response TEXT,
  question_13_response TEXT,
  question_14_response TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  -- Acesso autorizado para usuários autenticados
  -- (pode ser refinado se necessário)
  RETURN QUERY
  SELECT
    r.id,
    r.training_id,
    r.training_title,
    r.collaborator_name,
    r.collaborator_email,
    r.question_2_response,
    r.question_3_response,
    r.question_4_response,
    r.question_5_response,
    r.question_6_response,
    r.question_7_response,
    r.question_8_response,
    r.question_9_response,
    r.question_10_response,
    r.question_11_response,
    r.question_13_response,
    r.question_14_response,
    r.completed_at,
    r.created_at,
    r.updated_at
  FROM public.rh_training_responses r
  WHERE r.training_id = p_training_id
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para chamar a função
GRANT EXECUTE ON FUNCTION public.get_training_responses TO authenticated, service_role;

-- Verificação
SELECT 'Função get_training_responses criada com sucesso!' as resultado;
