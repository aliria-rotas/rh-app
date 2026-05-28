-- Adicionar colunas faltantes à tabela rh_employees
-- Executar no Supabase SQL Editor

ALTER TABLE IF EXISTS rh_employees
ADD COLUMN IF NOT EXISTS company text not null default '',
ADD COLUMN IF NOT EXISTS company_cnpj text not null default '',
ADD COLUMN IF NOT EXISTS is_partner boolean not null default false,
ADD COLUMN IF NOT EXISTS partner_vt_weekly numeric,
ADD COLUMN IF NOT EXISTS health_plan_cost numeric,
ADD COLUMN IF NOT EXISTS health_plan_dependents jsonb default '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dental_plan boolean not null default false,
ADD COLUMN IF NOT EXISTS life_insurance boolean not null default false,
ADD COLUMN IF NOT EXISTS transport_voucher_cost numeric,
ADD COLUMN IF NOT EXISTS home_office_day text,
ADD COLUMN IF NOT EXISTS monthly_bonus numeric,
ADD COLUMN IF NOT EXISTS position_history jsonb default '[]'::jsonb,
ADD COLUMN IF NOT EXISTS medical_exams jsonb default '[]'::jsonb;
