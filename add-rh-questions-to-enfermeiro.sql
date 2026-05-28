-- Obter o ID da vaga Enfermeiro
-- SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro';

-- Inserir 15 perguntas genéricas de RH para a vaga do Enfermeiro
-- As perguntas focam em: experiência geral, comportamento, motivação, competências transversais
-- Removidas: perguntas muito técnicas/específicas da área

INSERT INTO rh_interview_questions (category, question, type, order_number, job_opening_id) VALUES
-- Motivação e Escolha de Carreira
('competencias_gerais', 'Por que escolheu trabalhar nessa área? O que o motiva nessa profissão?', 'aberta', 1, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),

-- Experiência Passada - Comportamental
('experiencia_passada', 'Descreva uma situação em que você precisou lidar com um paciente/pessoa muito estressada ou agressiva. Como você reagiu?', 'aberta', 2, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),
('experiencia_passada', 'Conte sobre um momento em que você cometeu um erro no trabalho. Como você identificou, corrigiu e o que aprendeu?', 'aberta', 3, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),
('experiencia_passada', 'Descreva uma experiência em que trabalhou em equipe multiprofissional. Como foi a comunicação?', 'aberta', 4, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),
('experiencia_passada', 'Como você gerencia múltiplas tarefas/pacientes com prioridades diferentes? Dê um exemplo.', 'aberta', 5, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),
('experiencia_passada', 'Conte sobre um momento em que você tinha pouco tempo e muitas tarefas. Como se organizou?', 'aberta', 6, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),
('experiencia_passada', 'Descreva um conflito com um colega ou superior. Como foi resolvido?', 'aberta', 7, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),

-- Competências Genéricas
('competencias_gerais', 'Quais são seus pontos fortes como profissional?', 'aberta', 8, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),
('competencias_gerais', 'Em quais áreas você sente que precisa melhorar ou aprender mais?', 'aberta', 9, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),
('competencias_gerais', 'Como você se mantém atualizado em sua área?', 'aberta', 10, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),
('competencias_gerais', 'Como você lida com o estresse e a pressão emocional da profissão?', 'aberta', 11, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),

-- Alinhamento com a Empresa
('competencias_gerais', 'Por que deseja trabalhar em nossa organização especificamente?', 'aberta', 12, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),

-- Desenvolvimento Profissional
('competencias_gerais', 'Quais são seus objetivos profissionais para os próximos 5 anos?', 'aberta', 13, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),

-- Estilo de Trabalho
('competencias_gerais', 'Como você trabalha sob supervisão? Prefere mais autonomia ou mais orientação?', 'aberta', 14, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1)),

-- Ética e Profissionalismo
('competencias_gerais', 'Como você mantém a confidencialidade e a ética profissional?', 'aberta', 15, (SELECT id FROM rh_job_openings WHERE title = 'Enfermeiro' LIMIT 1));
