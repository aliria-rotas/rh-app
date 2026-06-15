-- Criar função para incrementar contador de respostas
CREATE OR REPLACE FUNCTION public.increment_climate_responses(p_survey_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.rh_climate_surveys
  SET responses_count = COALESCE(responses_count, 0) + 1
  WHERE id = p_survey_id;
END;
$$ LANGUAGE plpgsql;
