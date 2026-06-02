-- ============================================
-- CORRIGIR FUNÇÃO PARA INSERIR TODAS AS 14 RESPOSTAS
-- ============================================

DROP FUNCTION IF EXISTS public.insert_training_response(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.insert_training_response(
  p_training_id TEXT,
  p_training_title TEXT,
  p_collaborator_name TEXT,
  p_collaborator_email TEXT,
  p_question_2_response TEXT,
  p_question_3_response TEXT,
  p_question_4_response TEXT,
  p_question_5_response TEXT,
  p_question_6_response TEXT,
  p_question_7_response TEXT,
  p_question_8_response TEXT,
  p_question_9_response TEXT,
  p_question_10_response TEXT,
  p_question_11_response TEXT,
  p_question_13_response TEXT,
  p_question_14_response TEXT
) RETURNS JSON AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.rh_training_responses (
    training_id,
    training_title,
    collaborator_name,
    collaborator_email,
    question_2_response,
    question_3_response,
    question_4_response,
    question_5_response,
    question_6_response,
    question_7_response,
    question_8_response,
    question_9_response,
    question_10_response,
    question_11_response,
    question_13_response,
    question_14_response
  ) VALUES (
    p_training_id,
    p_training_title,
    p_collaborator_name,
    p_collaborator_email,
    p_question_2_response,
    p_question_3_response,
    p_question_4_response,
    p_question_5_response,
    p_question_6_response,
    p_question_7_response,
    p_question_8_response,
    p_question_9_response,
    p_question_10_response,
    p_question_11_response,
    p_question_13_response,
    p_question_14_response
  ) RETURNING id INTO v_id;

  RETURN json_build_object('success', true, 'id', v_id);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.insert_training_response TO anon, authenticated, service_role;

SELECT 'Função corrigida! Agora aceita todas as 14 respostas' as resultado;
