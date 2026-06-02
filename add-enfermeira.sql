-- Adicionar posição Enfermeira (PJ) ao banco de dados
INSERT INTO rh_positions (
  id, title, department, career_level, description,
  responsibilities, requirements, competencies,
  salary_range_min, salary_range_max, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Enfermeira (PJ)',
  'Saúde',
  'especialista',
  'Executar atividades técnicas de enfermagem com precisão e cuidado, apoiando o acompanhamento, orientação e suporte ao paciente em tratamentos com medicamentos de alto custo. Contratação por projeto (PJ).',
  ARRAY[
    'Acompanhar pacientes em tratamentos com medicamentos biológicos e de alto custo',
    'Orientar pacientes sobre medicamentos, administração e possíveis efeitos colaterais',
    'Registrar e monitorar dados clínicos e saúde geral dos pacientes',
    'Coordenar com a equipe farmacêutica no cuidado integral ao paciente',
    'Apoiar em procedimentos administrativos relacionados ao atendimento e acompanhamento',
    'Demonstrar empatia e cuidado humanizado no contato com pacientes com doenças crônicas',
    'Manter sigilo e confidencialidade de informações clínicas'
  ],
  ARRAY[
    'Graduação em Enfermagem com registro ativo no COREN',
    '1 a 2 anos de experiência em enfermagem clínica, hospitalar ou atenção primária',
    'Medicamentos de alto custo, biológicos e imunossupressores',
    'Comunicação empática com pacientes com doenças crônicas',
    'Disponibilidade para contratos por projeto (PJ)'
  ],
  ARRAY[
    'Comprometimento com o Paciente',
    'Comunicação empática e clara',
    'Agilidade com Qualidade',
    'Integridade e Ética'
  ],
  150,
  150,
  NOW(),
  NOW()
);
