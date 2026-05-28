-- ============================================
-- CRIAR FUNÇÃO PÚBLICA PARA INSERIR RESPOSTAS
-- ============================================

-- Criar a função que qualquer um pode chamar
CREATE OR REPLACE FUNCTION public.insert_training_response(
  p_training_id TEXT,
  p_training_title TEXT,
  p_collaborator_name TEXT,
  p_collaborator_email TEXT,
  p_question_1_response TEXT,
  p_question_2_response TEXT,
  p_question_3_response TEXT,
  p_question_4_response TEXT,
  p_question_5_response TEXT,
  p_question_6_response TEXT
) RETURNS JSON AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.rh_training_responses (
    training_id,
    training_title,
    collaborator_name,
    collaborator_email,
    question_1_response,
    question_2_response,
    question_3_response,
    question_4_response,
    question_5_response,
    question_6_response
  ) VALUES (
    p_training_id,
    p_training_title,
    p_collaborator_name,
    p_collaborator_email,
    p_question_1_response,
    p_question_2_response,
    p_question_3_response,
    p_question_4_response,
    p_question_5_response,
    p_question_6_response
  ) RETURNING id INTO v_id;
  
  RETURN json_build_object('success', true, 'id', v_id);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão para chamar a função (públicamente acessível)
GRANT EXECUTE ON FUNCTION public.insert_training_response TO anon, authenticated, service_role;

-- Verificação
SELECT 'Função criada com sucesso!' as resultado;
