-- Tabela para armazenar cálculos de benefícios por mês validados
CREATE TABLE IF NOT EXISTS rh_benefits_monthly (
  id                  text primary key default gen_random_uuid()::text,

  -- Período
  year                integer not null,
  month               integer not null check (month >= 1 and month <= 12),

  -- Dados dos benefícios
  company_cnpj        text not null,
  benefits_data       jsonb not null default '{}'::jsonb, -- { "total_vr": 5000, "total_vt": 1000, ... }

  -- Validação
  is_validated        boolean not null default false,
  validated_at        timestamptz,
  validated_by        text, -- username ou email de quem validou
  validation_notes    text,

  -- Auditoria
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- Constraint: apenas um registro por mês/empresa
  unique(year, month, company_cnpj)
);

alter table rh_benefits_monthly disable row level security;

-- Índices para busca rápida
create index if not exists idx_benefits_monthly_year_month on rh_benefits_monthly(year, month);
create index if not exists idx_benefits_monthly_company on rh_benefits_monthly(company_cnpj);
create index if not exists idx_benefits_monthly_validated on rh_benefits_monthly(is_validated);
