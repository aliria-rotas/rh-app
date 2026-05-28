-- Tabela para armazenar perguntas de entrevista por categoria
CREATE TABLE IF NOT EXISTS rh_interview_questions (
  id                  text primary key default gen_random_uuid()::text,

  -- Informações da pergunta
  category            text not null, -- 'experiencia_passada', 'competencias_gerais', 'tecnicas_especificas'
  question            text not null,
  type                text not null default 'aberta', -- 'aberta', 'multipla_escolha', 'tecnica'
  order_number        integer not null default 0,

  -- Auditoria
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Índices para busca rápida
create index if not exists idx_interview_questions_category on rh_interview_questions(category);
create index if not exists idx_interview_questions_order on rh_interview_questions(category, order_number);

-- Inserir perguntas pré-configuradas para Enfermeiro
INSERT INTO rh_interview_questions (category, question, type, order_number) VALUES
-- Experiência Passada
('experiencia_passada', 'Descreva uma situação em que você precisou lidar com um paciente muito estressado ou agressivo. Como você reagiu?', 'aberta', 1),
('experiencia_passada', 'Conte sobre um momento em que você cometeu um erro no trabalho. Como você identificou, corrigiu e o que aprendeu?', 'aberta', 2),
('experiencia_passada', 'Qual foi o caso clínico mais desafiador que você enfrentou? Como você contribuiu para a recuperação do paciente?', 'aberta', 3),
('experiencia_passada', 'Descreva uma experiência em que trabalhou em equipe multiprofissional. Como foi a comunicação?', 'aberta', 4),
('experiencia_passada', 'Como você gerencia múltiplos pacientes com prioridades diferentes? Dê um exemplo.', 'aberta', 5),
('experiencia_passada', 'Fale sobre uma situação em que você teve que seguir um protocolo que discordava. Como agiu?', 'aberta', 6),
('experiencia_passada', 'Conte sobre um momento em que você tinha pouco tempo e muitas tarefas. Como se organizou?', 'aberta', 7),
('experiencia_passada', 'Qual foi sua experiência com pacientes terminais? Como você se comporta nessas situações?', 'aberta', 8),
('experiencia_passada', 'Descreva um conflito com um colega ou superior. Como foi resolvido?', 'aberta', 9),
('experiencia_passada', 'Fale sobre quando você precisou aprender uma nova tecnologia ou procedimento rapidamente.', 'aberta', 10),

-- Competências Gerais
('competencias_gerais', 'Por que escolheu ser enfermeiro? O que o motiva nessa profissão?', 'aberta', 1),
('competencias_gerais', 'Quais são seus pontos fortes como enfermeiro?', 'aberta', 2),
('competencias_gerais', 'Em quais áreas você sente que precisa melhorar ou aprender mais?', 'aberta', 3),
('competencias_gerais', 'Como você se mantém atualizado com os protocolos e melhores práticas de enfermagem?', 'aberta', 4),
('competencias_gerais', 'Qual é sua abordagem para o cuidado holístico do paciente?', 'aberta', 5),
('competencias_gerais', 'Como você lida com o estresse e a pressão emocional da profissão?', 'aberta', 6),
('competencias_gerais', 'Qual é sua experiência com registros eletrônicos de saúde (prontuário eletrônico)?', 'aberta', 7),
('competencias_gerais', 'Como você comunica más notícias aos pacientes e familiares?', 'aberta', 8),
('competencias_gerais', 'Descreva sua experiência em diferentes cenários (hospital, clínica, home care, etc.)', 'aberta', 9),
('competencias_gerais', 'Por que deseja trabalhar em nossa organização especificamente?', 'aberta', 10),
('competencias_gerais', 'Quais são seus objetivos profissionais para os próximos 5 anos?', 'aberta', 11),
('competencias_gerais', 'Como você trabalha sob supervisão? Prefere mais autonomia ou mais orientação?', 'aberta', 12),
('competencias_gerais', 'Qual é sua experiência com protocolos de segurança do paciente?', 'aberta', 13),
('competencias_gerais', 'Como você mantém a confidencialidade e a ética profissional?', 'aberta', 14),
('competencias_gerais', 'Descreva um paciente que o marcou. Por quê?', 'aberta', 15),

-- Técnicas/Específicas
('tecnicas_especificas', 'Qual é sua experiência com medicações? Cite um exemplo de erro que viu na prática.', 'aberta', 1),
('tecnicas_especificas', 'Como você realiza uma avaliação rápida de um paciente crítico?', 'aberta', 2),
('tecnicas_especificas', 'Fale sobre protocolos de prevenção de infecção que você segue.', 'aberta', 3),
('tecnicas_especificas', 'Qual é sua experiência com suporte avançado de vida (SVA)?', 'aberta', 4),
('tecnicas_especificas', 'Como você documentaria uma situação inusitada ou um incidente?', 'aberta', 5);
