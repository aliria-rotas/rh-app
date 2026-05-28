-- ============================================================
-- Schema RH Aliria — rodar no Supabase SQL Editor
-- Prefixo rh_ para coexistir com tabelas do aliria-rotas
-- ============================================================

-- 1. Identidade Organizacional (linha única)
create table if not exists rh_org_identity (
  id                   text primary key default 'singleton',
  mission              text not null default '',
  vision               text not null default '',
  org_values           jsonb not null default '[]'::jsonb,
  strategic_objectives text not null default '',
  culture_description  text not null default '',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
alter table rh_org_identity disable row level security;

-- 2. Competências
create table if not exists rh_competencies (
  id          text primary key,
  name        text not null,
  description text not null default '',
  type        text not null default 'comportamental',
  indicators  jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
alter table rh_competencies disable row level security;

-- 3. Cargos
create table if not exists rh_positions (
  id               text primary key,
  title            text not null,
  department       text not null default '',
  career_level     text not null default 'junior',
  description      text not null default '',
  responsibilities jsonb not null default '[]'::jsonb,
  requirements     jsonb not null default '[]'::jsonb,
  competencies     jsonb not null default '[]'::jsonb,
  salary_range_min numeric not null default 0,
  salary_range_max numeric not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table rh_positions disable row level security;

-- 4. Pesquisa de Clima
create table if not exists rh_climate_surveys (
  id              text primary key,
  title           text not null,
  description     text not null default '',
  status          text not null default 'rascunho',
  start_date      text not null default '',
  end_date        text not null default '',
  questions       jsonb not null default '[]'::jsonb,
  responses_count integer not null default 0,
  created_at      timestamptz not null default now()
);
alter table rh_climate_surveys disable row level security;

-- 5. Vagas
create table if not exists rh_job_openings (
  id                    text primary key,
  title                 text not null,
  position_id           text not null default '',
  department            text not null default '',
  status                text not null default 'aberta',
  description           text not null default '',
  required_competencies jsonb not null default '[]'::jsonb,
  opening_date          text not null default '',
  closing_date          text not null default '',
  candidates_count      integer not null default 0,
  created_at            timestamptz not null default now()
);
alter table rh_job_openings disable row level security;

-- 6. Candidatos
create table if not exists rh_candidates (
  id                text primary key,
  job_opening_id    text not null references rh_job_openings(id) on delete cascade,
  name              text not null,
  email             text not null default '',
  phone             text not null default '',
  linkedin          text not null default '',
  resume_url        text not null default '',
  stage             text not null default 'inscrito',
  competency_scores jsonb not null default '{}'::jsonb,
  notes             text not null default '',
  created_at        timestamptz not null default now()
);
alter table rh_candidates disable row level security;

-- 7. Desligamento
create table if not exists rh_offboarding (
  id                   text primary key,
  employee_name        text not null,
  employee_position    text not null default '',
  department           text not null default '',
  reason               text not null default 'voluntario',
  termination_date     text not null default '',
  notice_date          text not null default '',
  exit_interview_done  boolean not null default false,
  checklist_progress   integer not null default 0,
  checklist_items      jsonb not null default '[]'::jsonb,
  notes                text not null default '',
  created_at           timestamptz not null default now()
);
alter table rh_offboarding disable row level security;

-- 8. Ciclos de Avaliação de Desempenho
create table if not exists rh_performance_cycles (
  id                text primary key,
  name              text not null,
  period            text not null default '',
  start_date        text not null default '',
  end_date          text not null default '',
  status            text not null default 'pendente',
  evaluations_count integer not null default 0,
  created_at        timestamptz not null default now()
);
alter table rh_performance_cycles disable row level security;

-- 9. Avaliações de Desempenho
create table if not exists rh_performance_evaluations (
  id               text primary key,
  cycle_id         text not null references rh_performance_cycles(id) on delete cascade,
  employee_name    text not null,
  position         text not null default '',
  department       text not null default '',
  evaluator        text not null default '',
  status           text not null default 'pendente',
  scores           jsonb not null default '{}'::jsonb,
  final_score      numeric not null default 0,
  feedback         text not null default '',
  development_plan text not null default '',
  created_at       timestamptz not null default now()
);
alter table rh_performance_evaluations disable row level security;

-- 10. Endomarketing
create table if not exists rh_endomarketing_campaigns (
  id              text primary key,
  title           text not null,
  type            text not null default 'comunicado',
  status          text not null default 'planejada',
  description     text not null default '',
  target_audience text not null default '',
  channels        jsonb not null default '[]'::jsonb,
  start_date      text not null default '',
  end_date        text not null default '',
  created_at      timestamptz not null default now()
);
alter table rh_endomarketing_campaigns disable row level security;

-- 11. Plano de Treinamento
create table if not exists rh_trainings (
  id               text primary key,
  title            text not null,
  description      text not null default '',
  target_competency text not null default '',
  target_positions jsonb not null default '[]'::jsonb,
  modality         text not null default 'online',
  provider         text not null default '',
  duration_hours   integer not null default 0,
  cost_per_person  numeric not null default 0,
  participants_count integer not null default 0,
  status           text not null default 'planejado',
  scheduled_date   text not null default '',
  created_at       timestamptz not null default now()
);
alter table rh_trainings disable row level security;

-- 12. Plano de Cargos e Salários
create table if not exists rh_salary_grades (
  id         text primary key,
  grade      text not null,
  level      text not null default '',
  min_salary numeric not null default 0,
  mid_salary numeric not null default 0,
  max_salary numeric not null default 0,
  positions  jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table rh_salary_grades disable row level security;

-- 13. Colaboradores
create table if not exists rh_employees (
  id                      text primary key,
  full_name               text not null,
  birth_date              date,
  gender                  text not null default 'prefiro_nao_informar',
  marital_status          text not null default 'solteiro',
  nationality             text not null default 'Brasileira',
  cpf                     text not null default '',
  rg                      text not null default '',
  rg_issuer               text not null default '',
  address_street          text not null default '',
  address_number          text not null default '',
  address_complement      text not null default '',
  address_neighborhood    text not null default '',
  address_city            text not null default '',
  address_state           text not null default '',
  address_zip             text not null default '',
  email                   text not null default '',
  email_corp              text not null default '',
  phone                   text not null default '',
  phone_emergency         text not null default '',
  emergency_contact_name  text not null default '',
  position                text not null default '',
  department              text not null default '',
  contract_type           text not null default 'clt',
  hire_date               date,
  salary                  numeric not null default 0,
  status                  text not null default 'ativo',
  pis_pasep               text not null default '',
  ctps_number             text not null default '',
  ctps_series             text not null default '',
  company                 text not null default '',
  company_cnpj            text not null default '',
  is_partner              boolean not null default false,
  partner_vt_weekly       numeric,
  health_plan             boolean not null default false,
  health_plan_cost        numeric,
  health_plan_dependents  jsonb default '[]'::jsonb,
  dental_plan             boolean not null default false,
  life_insurance          boolean not null default false,
  meal_voucher            boolean not null default false,
  transport_voucher       boolean not null default false,
  transport_voucher_cost  numeric,
  home_office_day         text,
  monthly_bonus           numeric,
  position_history        jsonb default '[]'::jsonb,
  medical_exams           jsonb default '[]'::jsonb,
  notes                   text not null default '',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
alter table rh_employees disable row level security;
