-- ============================================
-- SCRIPT: Atualizar Dados de Benefícios Corretos
-- ============================================
-- Valores confirmados com Klissia em 28/05/2026

-- 1. Vinicius: VR 37/dia, VT 400/semana
UPDATE rh_employees
SET
  meal_voucher = true,
  transport_voucher = true,
  partner_vt_weekly = 400.00,
  updated_at = NOW()
WHERE full_name = 'Vinicius da Costa Baptista';

-- 2. Izabella: VR 37/dia, SEM VT
UPDATE rh_employees
SET
  meal_voucher = true,
  transport_voucher = false,
  partner_vt_weekly = 0,
  transport_voucher_cost = NULL,
  updated_at = NOW()
WHERE full_name = 'Izabella Campos Oliveira Hegg';

-- 3. Verificar atualização
SELECT
  full_name,
  meal_voucher,
  transport_voucher,
  partner_vt_weekly,
  transport_voucher_cost
FROM rh_employees
WHERE full_name IN ('Vinicius da Costa Baptista', 'Izabella Campos Oliveira Hegg')
ORDER BY full_name;

-- NOTA IMPORTANTE sobre VR:
-- O VR diário é configurado na calculadora em "Configurar Vale Refeição"
-- Valor: R$ 37,00 por dia útil (já está em localStorage)
