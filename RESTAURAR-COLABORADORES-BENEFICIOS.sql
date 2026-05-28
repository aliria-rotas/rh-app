-- ============================================
-- SCRIPT: Restaurar Colaboradores com Benefícios
-- ============================================
-- Execute este script no Supabase SQL Editor para restaurar os dados de benefícios

-- Atualizar Vinicius da Costa Baptista (Sócio)
UPDATE rh_employees
SET
  is_partner = true,
  partner_vt_weekly = 400,
  health_plan = true,
  health_plan_cost = 500.00,
  health_plan_dependents = '[
    {"id": "dep_laysla", "name": "Laysla", "relationship": "conjuge", "monthly_cost": 0},
    {"id": "dep_vito", "name": "Vito", "relationship": "filho", "monthly_cost": 0},
    {"id": "dep_luca", "name": "Luca", "relationship": "filho", "monthly_cost": 0}
  ]'::jsonb,
  dental_plan = true,
  life_insurance = true,
  meal_voucher = true,
  transport_voucher = true,
  transport_voucher_cost = 814.00,
  updated_at = NOW()
WHERE full_name = 'Vinicius da Costa Baptista';

-- Atualizar Izabella Campos Oliveira Hegg (Sócia)
UPDATE rh_employees
SET
  is_partner = true,
  partner_vt_weekly = 0,
  health_plan = false,
  dental_plan = false,
  life_insurance = false,
  meal_voucher = false,
  transport_voucher = true,
  transport_voucher_cost = 814.00,
  updated_at = NOW()
WHERE full_name = 'Izabella Campos Oliveira Hegg';

-- Verificar se os dados foram atualizados
SELECT
  full_name,
  is_partner,
  partner_vt_weekly,
  meal_voucher,
  transport_voucher,
  transport_voucher_cost,
  health_plan,
  dental_plan,
  life_insurance
FROM rh_employees
WHERE full_name IN ('Vinicius da Costa Baptista', 'Izabella Campos Oliveira Hegg')
ORDER BY full_name;
