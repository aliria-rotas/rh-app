/**
 * Seed data — Aliria Medicamentos Especiais
 * Gerado a partir dos documentos do RH Generalista (mai/2026)
 * Popula o Supabase apenas uma vez (verifica se já existem competências cadastradas).
 */

import { supabase } from './supabase'
import { generateId } from './storage'

const now = () => new Date().toISOString()

export async function seedIfNeeded() {
  try {
    const { count } = await supabase
      .from('rh_competencies')
      .select('*', { count: 'exact', head: true })
    if ((count ?? 0) > 0) return   // Já foi populado
    await seedAll()
  } catch (error) {
    console.error('Seed check failed:', error)
  }
}

async function seedAll() {
  await seedIdentidade()
  await seedCompetencias()
  await seedCargos()
  await seedClima()
  await seedRecrutamento()
  await seedAvaliacaoDesempenho()
  await seedEndomarketing()
  await seedTreinamento()
  await seedCargosSalarios()
}

// ─── 1. IDENTIDADE ORGANIZACIONAL ──────────────────────────────────────────────
async function seedIdentidade() {
  await supabase.from('rh_org_identity').upsert({
    id: 'singleton',
    mission:
      'Garantir o acesso de pacientes a medicamentos de alto custo para doenças crônicas e tratamentos contínuos, por meio de um atendimento cuidadoso, ágil e tecnicamente preciso — acompanhando cada paciente de ponta a ponta, em todo o Brasil.',
    vision:
      'Ser a farmácia especializada em medicamentos de alto custo mais confiável do Brasil, reconhecida pelo modelo de atendimento que cuida do paciente de ponta a ponta — e pela excelência técnica que garante conformidade em qualquer canal de acesso.',
    org_values: [
      'O Paciente em Primeiro Lugar',
      'Cuidado que Vai Além da Entrega',
      'Excelência Técnica e Regulatória',
      'Agilidade com Responsabilidade',
      'Integridade em Tudo',
      'Colaboração e Pertencimento',
    ],
    strategic_objectives:
      '1. Consolidar os convênios como principal motor de crescimento, ampliando a carteira de operadoras e planos de saúde parceiros em todo o Brasil.\n' +
      '2. Aperfeiçoar continuamente o modelo de acompanhamento de pacientes, tornando-o referência no setor.\n' +
      '3. Fortalecer a estrutura interna de pessoas, processos e tecnologia para suportar o crescimento nacional.\n' +
      '4. Manter excelência regulatória (ANVISA, CRF) como diferencial competitivo inegociável.\n' +
      '5. Ampliar a presença em licitações públicas de medicamentos de alto custo em novos estados.\n' +
      '6. Construir uma marca reconhecida e respeitada por planos de saúde, médicos, pacientes e órgãos públicos.',
    culture_description:
      'A Aliria é uma farmácia especializada em medicamentos especiais para doenças crônicas — como Artrite Reumatoide, Esclerose Múltipla, Doença de Crohn, Oncologia e doenças genéticas — com atuação em todo o Brasil.\n\n' +
      'Nosso diferencial está no modelo de atendimento. Para os pacientes de convênios com contrato de fornecimento, assumimos o cuidado completo: entramos em contato para coletar todas as informações e a receita, enviamos o medicamento e acompanhamos do início ao encerramento do tratamento, já preparando cada novo envio. O paciente não precisa se preocupar — a Aliria cuida de tudo.\n\n' +
      'PROPÓSITO: Existimos para que nenhum paciente interrompa seu tratamento por falta de acesso ao medicamento certo — e para que essa jornada seja vivida com o mínimo de angústia possível.\n\n' +
      'EVP — Por que trabalhar na Aliria:\n' +
      '• Propósito real e visível no cotidiano\n' +
      '• Um modelo de atendimento que você se orgulha de fazer\n' +
      '• Crescimento acelerado em um setor complexo e desafiador\n' +
      '• Participação ativa na construção da empresa\n' +
      '• Ambiente de confiança, proximidade e liderança acessível\n' +
      '• Alcance nacional, impacto local',
    created_at: now(),
    updated_at: now(),
  })
}

// ─── 2. COMPETÊNCIAS ────────────────────────────────────────────────────────────
async function seedCompetencias() {
  const rows = [
    { id: generateId(), name: 'Comprometimento com o Paciente', type: 'comportamental',
      description: 'Coloca o bem-estar e a continuidade do tratamento do paciente como prioridade em todas as ações.',
      indicators: ['Entra em contato proativamente com o paciente antes do envio','Garante que o paciente entenda seu medicamento','Monitora a entrega e antecipa o próximo ciclo para que não haja ruptura de tratamento','Demonstra empatia com pacientes com doenças crônicas em todas as interações'], created_at: now() },
    { id: generateId(), name: 'Integridade e Ética', type: 'comportamental',
      description: 'Age com honestidade, transparência e conformidade legal em todas as situações, sem comprometer a ética por conveniência ou pressão.',
      indicators: ['Cumpre o que promete aos colegas, pacientes e parceiros','Comunica problemas com transparência e antecedência','Nunca compromete a conformidade legal ou ética por pressão comercial','Trata informações confidenciais com sigilo absoluto'], created_at: now() },
    { id: generateId(), name: 'Agilidade com Qualidade', type: 'comportamental',
      description: 'Executa com rapidez sem comprometer a precisão, a conformidade ou o cuidado com o paciente.',
      indicators: ['Processa pedidos com urgência sem gerar erros','Elimina burocracia desnecessária nos processos','Comunica proativamente qualquer atraso ou bloqueio','Antecipa necessidades antes que se tornem urgências'], created_at: now() },
    { id: generateId(), name: 'Colaboração e Trabalho em Equipe', type: 'comportamental',
      description: 'Contribui ativamente para o resultado coletivo, compartilha conhecimento e apoia os colegas sem criar silos entre áreas.',
      indicators: ['Compartilha conhecimento entre as áreas (farmácia, licitações, RH, administrativo)','Apoia os colegas sem criar dependências ou silos','Oferece ajuda espontânea quando percebe que um colega está sobrecarregado','Celebra conquistas da equipe, não apenas as individuais'], created_at: now() },
    { id: generateId(), name: 'Orientação para Resultado', type: 'comportamental',
      description: 'Foca na entrega de resultados concretos, acompanha seus próprios indicadores e assume responsabilidade pelo que compromete.',
      indicators: ['Define e acompanha suas próprias metas e KPIs','Propõe soluções em vez de apenas identificar problemas','Assume responsabilidade pelos resultados sem transferir culpa','Busca melhoria contínua nas entregas do seu cargo'], created_at: now() },
    { id: generateId(), name: 'Conhecimento em Medicamentos de Alto Custo', type: 'tecnica',
      description: 'Domínio sobre medicamentos especiais, biológicos e de alto custo: identificação, classificação, armazenamento e regulação.',
      indicators: ['Identifica corretamente medicamentos biológicos, biossimilares e de controle especial','Conhece as condições de armazenamento e cadeia de frio de cada medicamento','Orienta pacientes sobre medicamentos com precisão técnica','Apoia a equipe de licitações com especificações técnicas'], created_at: now() },
    { id: generateId(), name: 'Conformidade Regulatória (ANVISA / CRF)', type: 'tecnica',
      description: 'Conhecimento e aplicação da legislação sanitária vigente, normas ANVISA e regulamentos do Conselho Federal de Farmácia.',
      indicators: ['Conhece e aplica as principais RDCs e portarias ANVISA','Garante conformidade no controle de medicamentos sujeitos a controle especial (Portaria 344)','Mantém documentação sanitária sempre atualizada','Identifica e reporta não conformidades antes de auditorias'], created_at: now() },
    { id: generateId(), name: 'Processos Licitatórios', type: 'tecnica',
      description: 'Conhecimento da Lei 14.133/2021 e da legislação de licitações públicas, incluindo operação dos portais governamentais e gestão de contratos.',
      indicators: ['Opera com proficiência os portais ComprasNet, PNCP e BNC','Analisa editais identificando requisitos técnicos e riscos','Elabora propostas competitivas dentro da margem de viabilidade','Conduz pregões eletrônicos com autonomia e estratégia'], created_at: now() },
    { id: generateId(), name: 'Gestão de Pessoas e Legislação Trabalhista', type: 'tecnica',
      description: 'Conhecimento da CLT, eSocial, normas previdenciárias e práticas de gestão de pessoas aplicadas ao contexto da Aliria.',
      indicators: ['Conduz processos de admissão e demissão com conformidade legal','Aplica técnicas de recrutamento comportamental (método STAR)','Estrutura e acompanha PDIs com foco em desenvolvimento real','Produz indicadores de RH relevantes para a tomada de decisão'], created_at: now() },
    { id: generateId(), name: 'Gestão Financeira e Controles', type: 'tecnica',
      description: 'Domínio em rotinas financeiras: contas a pagar/receber, fluxo de caixa, conciliação bancária e relatórios gerenciais.',
      indicators: ['Realiza controle financeiro sem pendências ou erros de lançamento','Elabora relatórios de fluxo de caixa e DRE com precisão','Identifica oportunidades de redução de custos','Garante conformidade fiscal e zero de multas por atraso'], created_at: now() },
    { id: generateId(), name: 'BPAD e Gestão de Estoque Farmacêutico', type: 'tecnica',
      description: 'Aplicação das Boas Práticas de Armazenamento e Distribuição no controle de medicamentos de alto custo, cadeia de frio e rastreabilidade.',
      indicators: ['Mantém controle PVPS (primeiro que vence, primeiro que sai) rigorosamente','Monitora e registra temperatura e umidade da cadeia de frio','Garante acuracidade do estoque acima de 99% nos inventários','Zero de não conformidades em auditorias de BPAD'], created_at: now() },
    { id: generateId(), name: 'Gestão e Desenvolvimento de Equipe', type: 'lideranca',
      description: 'Capacidade de liderar, orientar e desenvolver pessoas, criando um ambiente de alta performance e crescimento individual.',
      indicators: ['Dá feedback frequente, específico e construtivo','Delega com clareza e acompanha sem microgerenciar','Identifica potenciais de crescimento na equipe e age sobre eles','Cria ambiente psicologicamente seguro para erros e aprendizado'], created_at: now() },
    { id: generateId(), name: 'Tomada de Decisão Estratégica', type: 'lideranca',
      description: 'Capacidade de analisar cenários complexos, ponderar riscos e tomar decisões assertivas com o nível de informação disponível.',
      indicators: ['Toma decisões com base em dados e evidências, não apenas em intuição','Comunica as decisões com clareza e contexto para a equipe','Assume responsabilidade pelas decisões, incluindo as que resultam em erro','Sabe quando escalar uma decisão para a Diretoria'], created_at: now() },
  ]
  const { error } = await supabase.from('rh_competencies').insert(rows)
  if (error) console.error('seedCompetencias:', error)
}

// ─── 3. CARGOS ──────────────────────────────────────────────────────────────────
async function seedCargos() {
  const rows = [
    { id: generateId(), title: 'Analista de RH I', department: 'Recursos Humanos', career_level: 'junior',
      description: 'Apoiar as rotinas de Recursos Humanos da Aliria com foco em administração de pessoal, processos de recrutamento e onboarding, contribuindo para a estruturação da área sob orientação do analista pleno ou sênior.',
      responsibilities: ['Apoiar no processo de recrutamento e seleção: triagem de currículos, agendamento de entrevistas e aplicação de testes','Auxiliar na administração de pessoal: controle de ponto, férias, documentação de admissão e demissão','Apoiar na condução do onboarding de novos colaboradores','Organizar e manter atualizados os arquivos físicos e digitais de RH','Lançar e conferir dados em sistemas de RH e planilhas de controle','Apoiar na gestão de benefícios: cadastros, alterações e comunicação com fornecedores','Elaborar comunicados e documentos simples de RH','Apoiar na aplicação de pesquisas internas e tabulação de dados'],
      requirements: ['Cursando ou recém-graduado em Administração, Psicologia, Gestão de RH ou correlatas','Até 2 anos de experiência em funções de RH ou administrativas','Noções de legislação trabalhista e rotinas de DP','Pacote Office básico/intermediário'],
      competencies: ['Organização e atenção a detalhes','Comunicação clara e empática','Discrição no trato de informações confidenciais','Disposição para aprendizado contínuo','Proatividade e iniciativa'],
      salary_range_min: 3600, salary_range_max: 4600, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Analista de RH II', department: 'Recursos Humanos', career_level: 'pleno',
      description: 'Conduzir com autonomia os processos de Recursos Humanos da Aliria — recrutamento, desenvolvimento, administração de pessoal e clima organizacional.',
      responsibilities: ['Conduzir o processo completo de recrutamento e seleção por competências (método STAR)','Gerenciar a administração de pessoal: admissões, demissões, férias e controle de ponto','Coordenar o onboarding e integração de novos colaboradores','Aplicar e analisar pesquisas de clima, propondo planos de ação','Apoiar gestores na condução de avaliações de desempenho e construção de PDIs','Identificar necessidades de T&D e coordenar ações de treinamento','Garantir o cumprimento da legislação trabalhista e normas internas','Orientar e supervisionar o Analista de RH I','Produzir relatórios e indicadores de RH para suporte à Diretoria'],
      requirements: ['Graduação em Administração, Psicologia, Gestão de RH ou correlatas','De 2 a 4 anos em funções de RH generalista','Legislação trabalhista (CLT) e rotinas de DP','Técnicas de recrutamento e seleção comportamental'],
      competencies: ['Comunicação empática e influência sem autoridade','Organização e gestão de múltiplas demandas','Pensamento analítico para interpretar indicadores','Identificação genuína com o propósito da Aliria'],
      salary_range_min: 4700, salary_range_max: 6000, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Analista de RH III', department: 'Recursos Humanos', career_level: 'senior',
      description: 'Liderar a estratégia de Recursos Humanos da Aliria, estruturando políticas, processos e a cultura organizacional que sustentam o crescimento da empresa.',
      responsibilities: ['Definir e implementar a estratégia de RH alinhada aos objetivos da Aliria','Liderar o ciclo completo de gestão de pessoas: R&S, onboarding, desenvolvimento, avaliação e desligamento','Estruturar e revisar políticas internas de RH (cargos, salários, benefícios, carreira)','Ser o guardião da cultura organizacional e dos valores da Aliria','Conduzir projetos estratégicos de RH','Analisar indicadores de RH e propor ações corretivas à Diretoria','Garantir conformidade trabalhista e mitigar riscos jurídicos','Orientar, desenvolver e liderar a equipe de RH'],
      requirements: ['Graduação em Administração, Psicologia ou correlatas. Desejável: MBA em Gestão de Pessoas','Mínimo de 5 anos em RH, com experiência comprovada em posição generalista sênior','Legislação trabalhista avançada, eSocial e obrigações previdenciárias'],
      competencies: ['Liderança e desenvolvimento de equipe','Visão estratégica e pensamento sistêmico','Comunicação assertiva com Diretoria e gestores','Tomada de decisão baseada em dados','Resiliência e gestão de conflitos'],
      salary_range_min: 6200, salary_range_max: 8500, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Analista de Licitações I', department: 'Licitações', career_level: 'junior',
      description: 'Apoiar o processo de licitações públicas da Aliria, realizando pesquisa de editais, organização documental e suporte operacional.',
      responsibilities: ['Pesquisar e monitorar editais nos principais portais governamentais (ComprasNet, PNCP, BNC)','Organizar e manter atualizada a documentação de habilitação da empresa','Auxiliar na elaboração e conferência de propostas comerciais de medicamentos','Controlar prazos de vencimento de certidões fiscais, trabalhistas e regulatórias','Realizar cadastros e atualizações no SICAF','Apoiar na gestão de contratos ativos: empenhos, solicitações e notas fiscais','Acompanhar pregões eletrônicos sob orientação do Analista II ou III'],
      requirements: ['Cursando ou graduado em Administração, Direito, Farmácia ou correlatas','Até 2 anos de experiência em processos licitatórios ou administrativos','Noções da Lei 14.133/2021','Portais de compras governamentais (básico/intermediário)'],
      competencies: ['Atenção a detalhes e rigor com prazos','Organização e metodologia','Capacidade de aprendizado rápido','Proatividade'],
      salary_range_min: 3200, salary_range_max: 4000, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Analista de Licitações II', department: 'Licitações', career_level: 'pleno',
      description: 'Conduzir com autonomia os processos licitatórios da Aliria — da prospecção de editais à gestão de contratos.',
      responsibilities: ['Prospectar e analisar editais de licitação nos portais governamentais','Elaborar e conferir propostas comerciais de medicamentos de alto custo','Participar de pregões eletrônicos, conduzindo lances e negociação','Gerenciar contratos com órgãos públicos: empenhos, entregas, notas e aditivos','Articular com a equipe de farmácia sobre especificações técnicas e ANVISA','Orientar e supervisionar o Analista de Licitações I','Elaborar relatórios de desempenho das licitações'],
      requirements: ['Graduação em Administração, Direito, Farmácia ou correlatas','De 2 a 4 anos em licitações públicas, com experiência em pregão eletrônico','Lei 14.133/2021 e Lei 8.666/1993','Portais: ComprasNet, PNCP, BNC'],
      competencies: ['Atenção extrema a detalhes e prazos','Pensamento analítico e interpretação de textos legais','Negociação e decisão sob pressão','Ética e conformidade rigorosa'],
      salary_range_min: 3600, salary_range_max: 4800, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Analista de Licitações III', department: 'Licitações', career_level: 'senior',
      description: 'Liderar a estratégia de licitações públicas da Aliria, maximizando a taxa de sucesso em processos licitatórios de medicamentos de alto custo em todo o Brasil.',
      responsibilities: ['Definir a estratégia de prospecção e participação em licitações públicas','Liderar a equipe de licitações (Analistas I e II)','Analisar editais complexos e tomar decisões sobre viabilidade e estratégia de proposta','Conduzir pregões estratégicos e de alto valor','Representar a Aliria em impugnações, recursos e interações com órgãos públicos','Acompanhar alterações na legislação de licitações e adaptar processos internos'],
      requirements: ['Graduação em Administração, Direito, Farmácia. Desejável: especialização em licitações','Mínimo de 5 anos em licitações públicas','Domínio da Lei 14.133/2021','Medicamentos de alto custo, registros ANVISA e tabela CMED'],
      competencies: ['Liderança e desenvolvimento de equipe','Visão estratégica e análise de mercado público','Negociação de alto nível','Tomada de decisão em situações complexas'],
      salary_range_min: 4800, salary_range_max: 6500, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Analista Administrativo I', department: 'Administrativo / Financeiro', career_level: 'junior',
      description: 'Apoiar as rotinas administrativas e financeiras da Aliria, executando tarefas operacionais de controle documental, lançamentos e suporte à gestão.',
      responsibilities: ['Lançar e conferir notas fiscais, boletos e documentos financeiros nos sistemas','Auxiliar no controle de contas a pagar e a receber','Organizar e arquivar documentos físicos e digitais da empresa','Apoiar no controle de contratos com fornecedores e prestadores','Conferência de extratos bancários e apoio na conciliação','Controlar estoque de materiais de escritório e insumos administrativos'],
      requirements: ['Cursando ou recém-graduado em Administração, Ciências Contábeis, Finanças ou correlatas','Até 2 anos em funções administrativas ou financeiras','Pacote Office básico/intermediário','Noções de rotinas financeiras e documentação fiscal'],
      competencies: ['Organização e atenção a detalhes','Responsabilidade com prazos','Discrição no trato de informações financeiras','Comunicação objetiva'],
      salary_range_min: 3600, salary_range_max: 4600, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Analista Administrativo II', department: 'Administrativo / Financeiro', career_level: 'pleno',
      description: 'Conduzir com autonomia os processos administrativos e financeiros da Aliria, garantindo controle financeiro, gestão de contratos e conformidade documental.',
      responsibilities: ['Realizar controle de contas a pagar e receber, acompanhando o fluxo de caixa','Gerenciar contratos com planos de saúde, órgãos públicos e fornecedores','Realizar conciliação bancária e elaborar relatórios financeiros','Apoiar na gestão de obrigações fiscais e tributárias','Coordenar compras de materiais, cotando e negociando com fornecedores','Orientar e supervisionar o Analista Administrativo I'],
      requirements: ['Graduação em Administração, Ciências Contábeis, Finanças ou correlatas','De 2 a 4 anos em funções administrativas ou financeiras','Excel intermediário/avançado','Rotinas financeiras: contas a pagar/receber, fluxo de caixa, conciliação'],
      competencies: ['Organização e rigor com prazos e documentação','Capacidade analítica para dados financeiros','Discrição e confiabilidade','Proatividade e antecipação de problemas'],
      salary_range_min: 4700, salary_range_max: 6000, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Analista Administrativo III', department: 'Administrativo / Financeiro', career_level: 'senior',
      description: 'Liderar a gestão administrativa e financeira da Aliria, estruturando processos, controles e relatórios gerenciais que suportem o crescimento sustentável da empresa.',
      responsibilities: ['Liderar a área administrativa e financeira da empresa','Estruturar e monitorar o planejamento financeiro (fluxo de caixa, DRE, orçamento)','Gerir contratos estratégicos com planos de saúde, órgãos públicos e grandes fornecedores','Coordenar obrigações fiscais, tributárias e societárias com a contabilidade','Elaborar relatórios gerenciais e financeiros para a Diretoria','Liderar e desenvolver a equipe administrativa'],
      requirements: ['Graduação em Administração, Ciências Contábeis ou Finanças. Desejável: MBA em Gestão Financeira','Mínimo de 5 anos em gestão administrativa/financeira','Gestão financeira: DRE, fluxo de caixa, budget e forecast'],
      competencies: ['Liderança e desenvolvimento de equipe','Visão estratégica e pensamento financeiro','Comunicação executiva com Diretoria e parceiros','Gestão de riscos financeiros e operacionais'],
      salary_range_min: 6200, salary_range_max: 8500, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Assistente de Farmácia I', department: 'Farmácia (SC)', career_level: 'junior',
      description: 'Apoiar as operações básicas da farmácia da Aliria, executando atividades de organização e suporte ao estoque de medicamentos de alto custo, sob supervisão constante da equipe técnica.',
      responsibilities: ['Auxiliar na organização física do estoque de medicamentos e produtos de saúde','Apoiar na conferência de mercadorias recebidas: contagem e organização básica','Manter limpeza e organização da área de armazenamento','Auxiliar na separação de pedidos para envio sob supervisão','Apoiar no controle básico de validade e organização por lote (PVPS)','Participar de inventários periódicos de estoque'],
      requirements: ['Ensino médio completo','Não é exigida experiência prévia','Noções básicas de organização'],
      competencies: ['Organização e zelo com o ambiente','Atenção a detalhes e disciplina','Responsabilidade e comprometimento','Disposição para aprendizado','Trabalho em equipe'],
      salary_range_min: 2200, salary_range_max: 2900, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Assistente de Farmácia II', department: 'Farmácia (SC)', career_level: 'pleno',
      description: 'Executar com autonomia as atividades de suporte ao estoque de medicamentos de alto custo da Aliria, garantindo organização, controle de validade e preparação de pedidos.',
      responsibilities: ['Controlar movimentação de estoque de medicamentos e produtos de saúde','Conferir recebimento de mercadorias: quantidade, validade, acondicionamento e documentação','Executar controle de validade e organização por lote (PVPS) de forma autônoma','Realizar separação e preparação de pedidos para envio ao paciente','Auxiliar no controle de medicamentos sujeitos a controle especial','Orientar o Assistente I nas rotinas do estoque'],
      requirements: ['Ensino médio completo. Desejável: técnico em farmácia ou logística','1 a 2 anos em farmácia, almoxarifado ou logística','Organização de estoque e controle de validade (PVPS)'],
      competencies: ['Organização e precisão nos controles','Atenção a detalhes e validade','Responsabilidade com medicamentos de alto valor','Agilidade na separação de pedidos'],
      salary_range_min: 2700, salary_range_max: 3600, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Assistente de Farmácia III', department: 'Farmácia (SC)', career_level: 'senior',
      description: 'Liderar operacionalmente o estoque da farmácia da Aliria, garantindo excelência no controle de medicamentos de alto custo, cadeia de frio e preparação de pedidos.',
      responsibilities: ['Coordenar as atividades operacionais do estoque de medicamentos de alto custo','Gerenciar o controle de validade, lote e rastreabilidade de todos os medicamentos','Supervisionar e orientar os Assistentes de Farmácia I e II','Garantir a conformidade do estoque com as normas BPAD','Gerenciar o controle de cadeia de frio: temperatura, umidade e registro','Liderar os inventários periódicos'],
      requirements: ['Ensino médio completo ou técnico em farmácia. Desejável: graduação em andamento','Mínimo de 3 anos em farmácia especializada ou distribuição de medicamentos','BPAD — Boas Práticas de Armazenamento e Distribuição'],
      competencies: ['Liderança operacional e orientação de equipe','Organização e rigor técnico','Atenção extrema a detalhes e validade'],
      salary_range_min: 3300, salary_range_max: 4400, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Farmacêutica', department: 'Farmácia', career_level: 'especialista',
      description: 'Executar atividades técnicas farmacêuticas com precisão e conformidade regulatória, apoiando o controle de estoque, dispensação e acompanhamento de pacientes.',
      responsibilities: ['Controlar e movimentar o estoque de medicamentos de alto custo','Conferir recebimento de mercadorias e cadeia de frio','Controlar medicamentos sujeitos a controle especial','Contatar ativamente pacientes: receitas, orientação e acompanhamento','Apoiar na identificação de medicamentos para licitações','Monitorar condições de armazenamento','Apoiar em auditorias e inspeções sanitárias'],
      requirements: ['Graduação em Farmácia com registro ativo no CRF','6 meses a 2 anos em farmácia, distribuição ou correlatos','Identificação e classificação de medicamentos incluindo biológicos','Noções de legislação sanitária e controle especial'],
      competencies: ['Atenção a detalhes e rigor técnico','Empatia e comunicação com pacientes','Responsabilidade com prazos e validade','Comprometimento com o cuidado ao paciente'],
      salary_range_min: 4722, salary_range_max: 6000, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Farmacêutica RT', department: 'Farmácia', career_level: 'especialista',
      description: 'Apoiar a Responsabilidade Técnica da Aliria, executando atividades farmacêuticas com rigor técnico-regulatório no manejo de medicamentos de alto custo.',
      responsibilities: ['Apoiar a Coordenadora RT na gestão técnica e regulatória','Controlar e supervisionar o estoque de medicamentos de alto custo e biológicos','Realizar inspeções de qualidade no recebimento','Controlar e registrar medicamentos sujeitos a controle especial','Orientar a equipe nos POPs','Apoiar tecnicamente a equipe de licitações','Participar de auditorias e inspeções sanitárias'],
      requirements: ['Graduação em Farmácia com registro ativo no CRF','1 a 2 anos em farmácia, distribuição ou indústria farmacêutica','Medicamentos de alto custo, biológicos e imunossupressores','BPAD e cadeia de frio'],
      competencies: ['Rigor técnico e atenção a detalhes','Ética profissional','Orientação técnica ao paciente','Atualização constante'],
      salary_range_min: 4722, salary_range_max: 6500, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Coordenadora Farmacêutica RT', department: 'Farmácia', career_level: 'lideranca',
      description: 'Exercer a Responsabilidade Técnica pela Aliria Medicamentos Especiais, garantindo conformidade regulatória com a ANVISA, coordenando a equipe farmacêutica.',
      responsibilities: ['Exercer a Responsabilidade Técnica (RT) perante ANVISA, CRF e órgãos reguladores','Garantir conformidade com a legislação sanitária vigente (RDC, IN, portarias ANVISA)','Coordenar e supervisionar toda a equipe farmacêutica','Supervisionar aquisição, armazenamento, controle e dispensação de medicamentos','Garantir controle de medicamentos sujeitos a controle especial (Portaria 344)','Elaborar, implantar e revisar POPs','Realizar auditorias internas de garantia de qualidade','Orientar a equipe de licitações sobre especificações técnicas e registros ANVISA'],
      requirements: ['Graduação em Farmácia com registro ativo no CRF','Mínimo de 3 anos, com vivência em Responsabilidade Técnica','Legislação sanitária: RDCs, portarias ANVISA, Lei 5.991/73','Controle especial (Portaria 344/98)','BPAD incluindo cadeia de frio'],
      competencies: ['Liderança técnica e gestão de equipe','Rigor regulatório e conformidade','Tomada de decisão baseada em legislação','Ética e comprometimento com a segurança do paciente'],
      salary_range_min: 6000, salary_range_max: 8000, created_at: now(), updated_at: now() },
    { id: generateId(), title: 'Enfermeira (PJ)', department: 'Saúde', career_level: 'especialista',
      description: 'Executar atividades técnicas de enfermagem com precisão e cuidado, apoiando o acompanhamento, orientação e suporte ao paciente em tratamentos com medicamentos de alto custo. Contratação por projeto (PJ).',
      responsibilities: ['Acompanhar pacientes em tratamentos com medicamentos biológicos e de alto custo','Orientar pacientes sobre medicamentos, administração e possíveis efeitos colaterais','Registrar e monitorar dados clínicos e saúde geral dos pacientes','Coordenar com a equipe farmacêutica no cuidado integral ao paciente','Apoiar em procedimentos administrativos relacionados ao atendimento e acompanhamento','Demonstrar empatia e cuidado humanizado no contato com pacientes com doenças crônicas','Manter sigilo e confidencialidade de informações clínicas'],
      requirements: ['Graduação em Enfermagem com registro ativo no COREN','1 a 2 anos de experiência em enfermagem clínica, hospitalar ou atenção primária','Medicamentos de alto custo, biológicos e imunossupressores','Comunicação empática com pacientes com doenças crônicas','Disponibilidade para contratos por projeto (PJ)'],
      competencies: ['Comprometimento com o Paciente','Comunicação empática e clara','Agilidade com Qualidade','Integridade e Ética'],
      salary_range_min: 150, salary_range_max: 150, created_at: now(), updated_at: now() },
  ]
  const { error } = await supabase.from('rh_positions').insert(rows)
  if (error) console.error('seedCargos:', error)
}

// ─── 4. PESQUISA DE CLIMA ───────────────────────────────────────────────────────
async function seedClima() {
  const survey = {
    id: generateId(),
    title: 'Pesquisa de Clima Organizacional — Aliria 2026',
    description: 'Pesquisa inaugural de clima da Aliria. Objetivo: ouvir os colaboradores sobre como percebem a empresa, a liderança, a comunicação e as condições de trabalho — gerando diagnóstico para orientar as próximas decisões de RH. A pesquisa é anônima.',
    status: 'rascunho',
    start_date: '',
    end_date: '',
    responses_count: 0,
    created_at: now(),
    questions: [
      { id: generateId(), text: 'A liderança da Aliria é acessível e aberta ao diálogo.', category: 'Liderança e gestão', type: 'escala' },
      { id: generateId(), text: 'Recebo orientações claras sobre o que é esperado do meu trabalho.', category: 'Liderança e gestão', type: 'escala' },
      { id: generateId(), text: 'As decisões da liderança são comunicadas de forma transparente.', category: 'Liderança e gestão', type: 'escala' },
      { id: generateId(), text: 'Sinto que a liderança se preocupa genuinamente com o bem-estar da equipe.', category: 'Liderança e gestão', type: 'escala' },
      { id: generateId(), text: 'As informações importantes para o meu trabalho chegam até mim a tempo.', category: 'Comunicação interna', type: 'escala' },
      { id: generateId(), text: 'A comunicação entre as áreas (farmácia, licitações, RH, administrativo) funciona bem.', category: 'Comunicação interna', type: 'escala' },
      { id: generateId(), text: 'Sinto que posso expressar minhas opiniões e sugestões sem receio.', category: 'Comunicação interna', type: 'escala' },
      { id: generateId(), text: 'Tenho acesso às informações que preciso para realizar bem o meu trabalho.', category: 'Comunicação interna', type: 'escala' },
      { id: generateId(), text: 'Entendo claramente de que forma o meu trabalho contribui para a missão da Aliria.', category: 'Propósito e pertencimento', type: 'escala' },
      { id: generateId(), text: 'Sinto orgulho de trabalhar na Aliria.', category: 'Propósito e pertencimento', type: 'escala' },
      { id: generateId(), text: 'Sinto que faço parte de uma equipe, não apenas de um grupo de pessoas.', category: 'Propósito e pertencimento', type: 'escala' },
      { id: generateId(), text: 'Os valores da Aliria estão alinhados com os meus valores pessoais.', category: 'Propósito e pertencimento', type: 'escala' },
      { id: generateId(), text: 'Tenho oportunidades de aprender e crescer profissionalmente na Aliria.', category: 'Crescimento e desenvolvimento', type: 'escala' },
      { id: generateId(), text: 'A empresa investe no meu desenvolvimento (treinamentos, feedbacks, orientações).', category: 'Crescimento e desenvolvimento', type: 'escala' },
      { id: generateId(), text: 'Enxergo possibilidades de crescimento de carreira na Aliria.', category: 'Crescimento e desenvolvimento', type: 'escala' },
      { id: generateId(), text: 'Recebo feedbacks úteis e frequentes sobre o meu desempenho.', category: 'Crescimento e desenvolvimento', type: 'escala' },
      { id: generateId(), text: 'Sinto que o meu trabalho é valorizado pela empresa.', category: 'Reconhecimento', type: 'escala' },
      { id: generateId(), text: 'Quando faço um bom trabalho, isso é reconhecido pela liderança.', category: 'Reconhecimento', type: 'escala' },
      { id: generateId(), text: 'Minha remuneração e benefícios são compatíveis com o que entrego.', category: 'Reconhecimento', type: 'escala' },
      { id: generateId(), text: 'A Aliria reconhece as pessoas de forma justa e coerente.', category: 'Reconhecimento', type: 'escala' },
      { id: generateId(), text: 'Minha carga de trabalho é equilibrada e gerenciável.', category: 'Carga de trabalho', type: 'escala' },
      { id: generateId(), text: 'Tenho os recursos e ferramentas necessários para realizar bem o meu trabalho.', category: 'Carga de trabalho', type: 'escala' },
      { id: generateId(), text: 'Consigo manter um equilíbrio saudável entre trabalho e vida pessoal.', category: 'Carga de trabalho', type: 'escala' },
      { id: generateId(), text: 'O ambiente físico e as condições de trabalho na Aliria são adequados.', category: 'Carga de trabalho', type: 'escala' },
      { id: generateId(), text: 'O relacionamento entre os colegas da minha área é saudável e respeitoso.', category: 'Relacionamento interpessoal', type: 'escala' },
      { id: generateId(), text: 'Existe cooperação e apoio entre as diferentes áreas da empresa.', category: 'Relacionamento interpessoal', type: 'escala' },
      { id: generateId(), text: 'Me sinto respeitado(a) e tratado(a) com dignidade na Aliria.', category: 'Relacionamento interpessoal', type: 'escala' },
      { id: generateId(), text: 'Conflitos e desentendimentos são resolvidos de forma construtiva na empresa.', category: 'Relacionamento interpessoal', type: 'escala' },
      { id: generateId(), text: 'Em uma escala de 0 a 10, qual a probabilidade de você recomendar a Aliria como um bom lugar para trabalhar?', category: 'eNPS', type: 'escala' },
      { id: generateId(), text: 'O que você mais valoriza em trabalhar na Aliria? O que faz você querer continuar aqui?', category: 'Perguntas abertas', type: 'texto_livre' },
      { id: generateId(), text: 'Qual é o principal desafio ou problema que a Aliria precisa resolver com urgência?', category: 'Perguntas abertas', type: 'texto_livre' },
      { id: generateId(), text: 'Se você pudesse mudar uma coisa na empresa amanhã, o que seria?', category: 'Perguntas abertas', type: 'texto_livre' },
      { id: generateId(), text: 'Há algo importante que a liderança precisa saber e que ainda não sabe?', category: 'Perguntas abertas', type: 'texto_livre' },
    ],
  }
  const { error } = await supabase.from('rh_climate_surveys').insert([survey])
  if (error) console.error('seedClima:', error)
}

// ─── 5. RECRUTAMENTO ─────────────────────────────────────────────────────────────
async function seedRecrutamento() {
  const jobs = [
    { id: generateId(), title: 'Analista de Licitações I', department: 'Licitações',
      position_id: '', status: 'aberta',
      description: 'Pesquisar e monitorar editais de licitação, organizar documentação de habilitação, apoiar na elaboração de propostas comerciais de medicamentos de alto custo e acompanhar contratos ativos.',
      required_competencies: ['Atenção a detalhes','Organização','Capacidade de aprendizado','Processos licitatórios'],
      opening_date: '2026-05-01', closing_date: '', candidates_count: 0, created_at: now() },
    { id: generateId(), title: 'Assistente de Farmácia I', department: 'Farmácia (SC)',
      position_id: '', status: 'aberta',
      description: 'Apoiar na organização e controle físico do estoque de medicamentos especiais, conferir mercadorias recebidas, preparar e separar pedidos de medicamentos para envio ao paciente e participar de inventários periódicos.',
      required_competencies: ['Organização','Atenção a detalhes','Comprometimento com o paciente','Responsabilidade'],
      opening_date: '2026-05-01', closing_date: '', candidates_count: 0, created_at: now() },
  ]
  const { error } = await supabase.from('rh_job_openings').insert(jobs)
  if (error) console.error('seedRecrutamento:', error)
}

// ─── 6. AVALIAÇÃO DE DESEMPENHO ─────────────────────────────────────────────────
async function seedAvaliacaoDesempenho() {
  const ciclo = {
    id: generateId(),
    name: 'Ciclo de Avaliação de Desempenho 2026',
    period: 'Janeiro – Dezembro 2026',
    start_date: '2026-03-01',
    end_date: '2026-05-31',
    status: 'pendente',
    evaluations_count: 0,
    created_at: now(),
  }
  const { error } = await supabase.from('rh_performance_cycles').insert([ciclo])
  if (error) console.error('seedAvaliacaoDesempenho:', error)
}

// ─── 7. ENDOMARKETING ────────────────────────────────────────────────────────────
async function seedEndomarketing() {
  const campaigns = [
    { id: generateId(), title: 'Lançamento da Identidade Organizacional', type: 'campanha', status: 'planejada',
      description: 'Apresentação oficial da Identidade Organizacional da Aliria para toda a equipe.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','Reunião presencial','Mural físico/digital','E-mail'],
      start_date: '2026-06-01', end_date: '2026-06-30', created_at: now() },
    { id: generateId(), title: 'Newsletter Interna Mensal — Aliria', type: 'comunicado', status: 'planejada',
      description: 'Newsletter mensal com: mensagem do mês, destaque do colaborador, pauta do paciente, novidades da empresa, aniversariantes e lembrete importante.',
      target_audience: 'Toda a equipe', channels: ['E-mail'],
      start_date: '2026-07-01', end_date: '', created_at: now() },
    { id: generateId(), title: 'Programa Colaborador do Mês', type: 'reconhecimento', status: 'planejada',
      description: 'Reconhecimento mensal do colaborador que mais demonstrou os valores da Aliria.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','Mural físico/digital','Reunião de equipe'],
      start_date: '2026-07-01', end_date: '', created_at: now() },
    { id: generateId(), title: 'Setembro Amarelo — Saúde Mental', type: 'campanha', status: 'planejada',
      description: 'Campanha interna de conscientização sobre saúde mental e prevenção ao suicídio.',
      target_audience: 'Toda a equipe', channels: ['WhatsApp (grupo)','E-mail','Mural físico/digital'],
      start_date: '2026-09-01', end_date: '2026-09-30', created_at: now() },
    { id: generateId(), title: 'Confraternização de Fim de Ano', type: 'evento', status: 'planejada',
      description: 'Celebração de fim de ano com toda a equipe. Reconhecimento público dos destaques do ano.',
      target_audience: 'Toda a equipe', channels: ['Reunião presencial'],
      start_date: '2026-12-01', end_date: '2026-12-31', created_at: now() },
    { id: generateId(), title: 'Dia do Farmacêutico (20/09)', type: 'celebracao', status: 'planejada',
      description: 'Celebração e reconhecimento especial para a equipe farmacêutica no Dia do Farmacêutico.',
      target_audience: 'Equipe farmacêutica', channels: ['WhatsApp (grupo)','Mural físico/digital'],
      start_date: '2026-09-20', end_date: '2026-09-20', created_at: now() },
  ]
  const { error } = await supabase.from('rh_endomarketing_campaigns').insert(campaigns)
  if (error) console.error('seedEndomarketing:', error)
}

// ─── 8. PLANO DE TREINAMENTO ─────────────────────────────────────────────────────
async function seedTreinamento() {
  const trainings = [
    { id: generateId(), title: 'Trilha de Integração — Onboarding Aliria', status: 'planejado', modality: 'hibrido',
      description: 'Trilha obrigatória para todos os novos colaboradores: identidade organizacional, o paciente no centro, descrição de cargo, ferramentas, LGPD e avaliação de integração.',
      target_competency: 'Comprometimento com o Paciente', target_positions: ['Todos os novos colaboradores'],
      provider: 'RH + Coordenadora RT', duration_hours: 8, cost_per_person: 0, participants_count: 0,
      scheduled_date: '', created_at: now() },
    { id: generateId(), title: 'Lançamento da Identidade Organizacional', status: 'planejado', modality: 'presencial',
      description: 'Apresentação da missão, visão, valores e propósito da Aliria para toda a equipe.',
      target_competency: 'Comprometimento com o Paciente', target_positions: ['Toda a equipe'],
      provider: 'RH + Diretoria', duration_hours: 2, cost_per_person: 0, participants_count: 0,
      scheduled_date: '2026-06-01', created_at: now() },
    { id: generateId(), title: 'Lei 14.133 — Nova Lei de Licitações', status: 'planejado', modality: 'online',
      description: 'Capacitação sobre a Nova Lei de Licitações (14.133/2021) aplicada ao fornecimento de medicamentos de alto custo.',
      target_competency: 'Processos Licitatórios', target_positions: ['Analista de Licitações I','Analista de Licitações II','Analista de Licitações III'],
      provider: 'Consultoria especializada em licitações', duration_hours: 4, cost_per_person: 500, participants_count: 3,
      scheduled_date: '2026-07-01', created_at: now() },
    { id: generateId(), title: 'Trilha Farmácia — Medicamentos Biológicos e Biossimilares', status: 'planejado', modality: 'hibrido',
      description: 'Capacitação técnica sobre medicamentos biológicos, biossimilares e imunossupressores: classificação, armazenamento, cadeia de frio, controle especial e orientação ao paciente.',
      target_competency: 'Conhecimento em Medicamentos de Alto Custo', target_positions: ['Farmacêutica','Farmacêutica RT','Coordenadora Farmacêutica RT'],
      provider: 'Laboratório parceiro / Coord. RT', duration_hours: 4, cost_per_person: 0, participants_count: 3,
      scheduled_date: '2026-07-15', created_at: now() },
    { id: generateId(), title: 'Atendimento Empático ao Paciente', status: 'planejado', modality: 'presencial',
      description: 'Treinamento sobre comunicação empática, escuta ativa e abordagem acessível no contato com pacientes de doenças crônicas.',
      target_competency: 'Comprometimento com o Paciente', target_positions: ['Farmacêutica','Farmacêutica RT','Analista de RH II'],
      provider: 'RH / Coordenadora RT', duration_hours: 3, cost_per_person: 0, participants_count: 5,
      scheduled_date: '2026-08-01', created_at: now() },
    { id: generateId(), title: 'LGPD e Segurança da Informação', status: 'planejado', modality: 'online',
      description: 'Treinamento obrigatório sobre a Lei Geral de Proteção de Dados (LGPD) aplicada ao contexto da Aliria.',
      target_competency: 'Conformidade Regulatória (ANVISA / CRF)', target_positions: ['Toda a equipe'],
      provider: 'Consultoria externa', duration_hours: 2, cost_per_person: 150, participants_count: 0,
      scheduled_date: '2026-08-15', created_at: now() },
    { id: generateId(), title: 'Boas Práticas de Armazenamento — BPAD', status: 'planejado', modality: 'presencial',
      description: 'Treinamento nas Boas Práticas de Armazenamento e Distribuição: controle de temperatura, umidade, cadeia de frio, PVPS, rastreabilidade e conformidade com normas ANVISA.',
      target_competency: 'BPAD e Gestão de Estoque Farmacêutico', target_positions: ['Assistente de Farmácia I','Assistente de Farmácia II','Assistente de Farmácia III','Farmacêutica'],
      provider: 'Coordenadora RT', duration_hours: 3, cost_per_person: 0, participants_count: 4,
      scheduled_date: '2026-09-01', created_at: now() },
    { id: generateId(), title: 'Gestão de Contratos Públicos', status: 'planejado', modality: 'online',
      description: 'Capacitação avançada em gestão de contratos administrativos: empenhos, aditivos, penalidades, nota fiscal eletrônica e compliance no fornecimento ao setor público.',
      target_competency: 'Processos Licitatórios', target_positions: ['Analista de Licitações II','Analista de Licitações III'],
      provider: 'Curso online especializado', duration_hours: 4, cost_per_person: 400, participants_count: 2,
      scheduled_date: '2026-10-01', created_at: now() },
    { id: generateId(), title: 'Trilha de Liderança — Módulo 1: Liderança Situacional', status: 'planejado', modality: 'online',
      description: 'Primeiro módulo da trilha de liderança: estilos de liderança, como adaptar a gestão ao perfil e maturidade de cada colaborador, e como dar feedback construtivo.',
      target_competency: 'Gestão e Desenvolvimento de Equipe', target_positions: ['Coordenadora Farmacêutica RT','Analista de Licitações III','Analista de RH III'],
      provider: 'Plataforma EAD / Coach externo', duration_hours: 3, cost_per_person: 300, participants_count: 3,
      scheduled_date: '2026-10-15', created_at: now() },
  ]
  const { error } = await supabase.from('rh_trainings').insert(trainings)
  if (error) console.error('seedTreinamento:', error)
}

// ─── 9. CARGOS E SALÁRIOS ────────────────────────────────────────────────────────
async function seedCargosSalarios() {
  const grades = [
    { id: generateId(), grade: 'N1 — Assistente', level: 'Júnior', positions: ['Assistente de Farmácia I (SC)'],
      min_salary: 2200, mid_salary: 2500, max_salary: 2900, created_at: now() },
    { id: generateId(), grade: 'N1+ — Assistente Pleno', level: 'Pleno', positions: ['Assistente de Farmácia II (SC)'],
      min_salary: 2700, mid_salary: 3100, max_salary: 3600, created_at: now() },
    { id: generateId(), grade: 'N2 — Assistente Sênior / Analista Jr', level: 'Sênior',
      positions: ['Assistente de Farmácia III (SC)','Analista de RH I (SP)','Analista Administrativo I (SP)','Analista de Licitações I (SP)'],
      min_salary: 3200, mid_salary: 3700, max_salary: 4600, created_at: now() },
    { id: generateId(), grade: 'N3 — Analista Pleno', level: 'Pleno',
      positions: ['Analista de RH II (SP)','Analista Administrativo II (SP)','Analista de Licitações II (SP)','Farmacêutica (SP)'],
      min_salary: 3600, mid_salary: 4600, max_salary: 6000, created_at: now() },
    { id: generateId(), grade: 'N4 — Analista Sênior / Especialista', level: 'Sênior',
      positions: ['Analista de Licitações III (SP)','Farmacêutica RT (SP)','Farmacêutica RT (SC — custo Aliria 63%)'],
      min_salary: 4722, mid_salary: 5500, max_salary: 6500, created_at: now() },
    { id: generateId(), grade: 'N5 — Coordenação / Gestão', level: 'Especialista',
      positions: ['Analista de RH III (SP)','Analista Administrativo III (SP)','Coordenadora Farmacêutica RT (SP)'],
      min_salary: 6000, mid_salary: 6800, max_salary: 8500, created_at: now() },
  ]
  const { error } = await supabase.from('rh_salary_grades').insert(grades)
  if (error) console.error('seedCargosSalarios:', error)
}
