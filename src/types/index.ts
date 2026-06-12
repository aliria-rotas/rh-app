// ─── Identidade Organizacional ───────────────────────────────────────────────
export interface OrganizationalIdentity {
  id: string
  mission: string
  vision: string
  values: string[]
  strategic_objectives: string
  culture_description: string
  created_at: string
  updated_at: string
}

// ─── Competências ─────────────────────────────────────────────────────────────
export type CompetencyType = 'comportamental' | 'tecnica' | 'lideranca'

export interface Competency {
  id: string
  name: string
  description: string
  type: CompetencyType
  indicators: string[]
  created_at: string
}

// ─── Cargos ───────────────────────────────────────────────────────────────────
export type CareerLevel = 'junior' | 'pleno' | 'senior' | 'especialista' | 'lideranca' | 'direcao'

export interface Position {
  id: string
  title: string
  department: string
  career_level: CareerLevel
  description: string
  responsibilities: string[]
  requirements: string[]
  competencies: string[]
  salary_range_min: number
  salary_range_max: number
  created_at: string
  updated_at: string
}

// ─── Pesquisa de Clima ────────────────────────────────────────────────────────
export type SurveyStatus = 'rascunho' | 'ativo' | 'encerrado'

export interface ClimateSurvey {
  id: string
  title: string
  description: string
  status: SurveyStatus
  start_date: string
  end_date: string
  questions: ClimateQuestion[]
  responses_count: number
  created_at: string
}

export interface ClimateQuestion {
  id: string
  text: string
  category: string
  type: 'escala' | 'multipla_escolha' | 'texto_livre'
  options?: string[]
}

export interface ClimateResponse {
  id: string
  survey_id: string
  sector: 'licitacoes' | 'farmacia' | 'financeiro'
  answers: Record<string, string | number>
  submitted_at: string
}

// ─── Recrutamento e Seleção ───────────────────────────────────────────────────
export type JobStatus = 'aberta' | 'em_andamento' | 'encerrada' | 'cancelada'
export type CandidateStage = 'inscrito' | 'triagem' | 'entrevista_rh' | 'entrevista_tecnica' | 'aprovado' | 'reprovado' | 'proposta' | 'contratado'

export interface JobOpening {
  id: string
  title: string
  position_id: string
  department: string
  status: JobStatus
  description: string
  required_competencies: string[]
  opening_date: string
  closing_date: string
  candidates_count: number
  created_at: string
}

export interface Candidate {
  id: string
  job_opening_id: string
  name: string
  email: string
  phone: string
  linkedin: string
  resume_url: string
  stage: CandidateStage
  competency_scores: Record<string, number>
  notes: string
  interview_date?: string
  interview_time?: string
  created_at: string
}

// ─── Desligamento ─────────────────────────────────────────────────────────────
export type OffboardingReason = 'voluntario' | 'involuntario' | 'aposentadoria' | 'fim_contrato'

export interface OffboardingProcess {
  id: string
  employee_name: string
  employee_position: string
  department: string
  reason: OffboardingReason
  termination_date: string
  notice_date: string
  exit_interview_done: boolean
  checklist_progress: number
  checklist_items: ChecklistItem[]
  notes: string
  created_at: string
}

export interface ChecklistItem {
  id: string
  task: string
  responsible: string
  completed: boolean
  due_date: string
}

// ─── Avaliação de Desempenho ──────────────────────────────────────────────────
export type EvaluationStatus = 'pendente' | 'em_andamento' | 'concluido'

export interface PerformanceCycle {
  id: string
  name: string
  period: string
  start_date: string
  end_date: string
  status: EvaluationStatus
  evaluations_count: number
  created_at: string
}

export interface PerformanceEvaluation {
  id: string
  cycle_id: string
  employee_name: string
  position: string
  department: string
  evaluator: string
  status: EvaluationStatus
  scores: Record<string, number>
  final_score: number
  feedback: string
  development_plan: string
  created_at: string
}

// ─── Endomarketing ────────────────────────────────────────────────────────────
export type CampaignStatus = 'planejada' | 'ativa' | 'encerrada'
export type CampaignType = 'comunicado' | 'celebracao' | 'reconhecimento' | 'campanha' | 'evento'

export interface EndomarketingCampaign {
  id: string
  title: string
  type: CampaignType
  status: CampaignStatus
  description: string
  target_audience: string
  channels: string[]
  start_date: string
  end_date: string
  created_at: string
}

// ─── Plano de Treinamento ─────────────────────────────────────────────────────
export type TrainingStatus = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
export type TrainingModality = 'presencial' | 'online' | 'hibrido' | 'on_the_job'

export interface TrainingAction {
  id: string
  title: string
  description: string
  target_competency: string
  target_positions: string[]
  modality: TrainingModality
  provider: string
  duration_hours: number
  cost_per_person: number
  participants_count: number
  status: TrainingStatus
  scheduled_date: string
  has_public_form?: boolean
  created_at: string
}

// ─── Plano de Cargos e Salários ───────────────────────────────────────────────
export interface SalaryGrade {
  id: string
  grade: string
  level: string
  min_salary: number
  mid_salary: number
  max_salary: number
  positions: string[]
  created_at: string
}

// ─── Colaboradores ────────────────────────────────────────────────────────────
export type EmployeeStatus = 'ativo' | 'afastado' | 'ferias' | 'inativo'
export type ContractType = 'clt' | 'pj' | 'estagio' | 'temporario' | 'autonomo'
export type MaritalStatus = 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel'
export type Gender = 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar'
export type PositionChangeReason = 'promocao' | 'transferencia' | 'readequacao_salarial' | 'ajuste_salarial' | 'mudanca_contrato' | 'outro'
export type MedicalExamResult = 'apto' | 'apto_com_restricao' | 'inapto' | 'pendente'
export type WeekDay = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta'

// ─── Convênio Médico ──────────────────────────────────────────────────────────
export type DependentRelationship = 'conjuge' | 'filho' | 'filha' | 'outro'

export interface HealthPlanDependent {
  id: string
  name: string
  cpf?: string
  relationship: DependentRelationship
  monthly_cost: number
}

export interface MedicalExam {
  id: string
  exam_type: string
  last_exam_date: string
  next_exam_date: string
  result: MedicalExamResult
  notes: string
}

export interface PositionChange {
  id: string
  date: string
  position: string
  salary: number
  reason: PositionChangeReason
  notes: string
}

export interface Employee {
  id: string
  // Empresa
  company: string
  company_cnpj: string
  is_partner: boolean
  partner_vt_weekly?: number
  // Dados pessoais
  full_name: string
  birth_date: string
  gender: Gender
  marital_status: MaritalStatus
  nationality: string
  cpf: string
  rg: string
  rg_issuer: string
  // Endereço
  address_street: string
  address_number: string
  address_complement: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_zip: string
  // Contato
  email: string
  email_corp: string
  phone: string
  phone_emergency: string
  emergency_contact_name: string
  // Dados profissionais
  position: string
  department: string
  contract_type: ContractType
  hire_date: string
  salary: number
  status: EmployeeStatus
  // Documentos
  pis_pasep: string
  ctps_number: string
  ctps_series: string
  // Benefícios
  health_plan: boolean
  health_plan_cost?: number
  health_plan_dependents?: HealthPlanDependent[]
  dental_plan: boolean
  life_insurance: boolean
  meal_voucher: boolean
  transport_voucher: boolean
  transport_voucher_cost?: number
  home_office_day?: string
  banco_horas_days?: number
  day_off_dates?: string[]
  monthly_bonus?: number
  notes: string
  position_history: PositionChange[]
  medical_exams: MedicalExam[]
  created_at: string
  updated_at: string
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export interface KpiData {
  label: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trend_value?: number
  target?: number
  color?: string
}
