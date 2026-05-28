-- Criar tabela para armazenar configurações de benefícios
CREATE TABLE IF NOT EXISTS rh_benefits_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_key TEXT UNIQUE NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  provider TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir valores dos benefícios
INSERT INTO rh_benefits_config (benefit_key, cost, provider) VALUES
  ('health_plan', 3444.28, 'Alice Operadora'),
  ('dental_plan', 376.85, 'Sul América'),
  ('meal_voucher', 37.00, 'Flash'),
  ('transport_voucher', 13.30, 'Flash'),
  ('life_insurance', 239.70, 'Porto Seguro')
ON CONFLICT (benefit_key) DO UPDATE SET
  cost = EXCLUDED.cost,
  provider = EXCLUDED.provider,
  updated_at = NOW();

-- Verificar dados inseridos
SELECT * FROM rh_benefits_config;
