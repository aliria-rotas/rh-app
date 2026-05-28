# Aplicação de Migração de Schema - Instrções Críticas

## Problema

A aplicação está tentando usar a coluna `transport_voucher_cost` (e outras colunas) na tabela `rh_employees`, mas o PostgREST (API do Supabase) não consegue encontrá-las. Embora as colunas existam fisicamente no banco de dados, o cache de schema do PostgREST precisa ser atualizado.

**Erro observado:**
```
PGRST204: Could not find the 'transport_voucher_cost' column of 'rh_employees' in the schema cache
```

## Solução

Você precisará ir ao Supabase Dashboard e executar uma migração SQL para "resetar" o schema cache.

### Passo 1: Acesse o Supabase Dashboard

1. Vá para: https://app.supabase.com
2. Faça login com sua conta
3. Selecione o projeto **aliria-rotas**

### Passo 2: Vá para o SQL Editor

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New query** (ou crie uma nova query)

### Passo 3: Execute a Migração

Cole e execute O SEGUINTE SQL:

```sql
-- Refresh PostgREST schema cache by reloading the service
SELECT
  pg_notify(
    'pgrst',
    'reload schema'
  );
```

**OU** execute o arquivo de migração completo:

```sql
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
```

### Passo 4: Aguarde o Schema Cache Ser Atualizado

Após executar o SQL, aguarde 30 segundos para que o PostgREST recarregue o schema.

### Passo 5: Recarregue a Aplicação

1. Volte para a aplicação no navegador
2. Pressione **F5** ou **Ctrl+R** para recarregar a página
3. Tente salvar um registro novamente

## Verificação

Para verificar se as colunas foram adicionadas com sucesso, você pode executar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rh_employees'
ORDER BY ordinal_position;
```

Procure pelas seguintes colunas:
- ✅ `transport_voucher_cost` (numeric)
- ✅ `company` (text)
- ✅ `company_cnpj` (text)
- ✅ `position_history` (jsonb)
- ✅ `medical_exams` (jsonb)

## Se o Problema Persistir

1. Verifique a coluna `transport_voucher_cost` manualmente no Supabase:
   - Vá para **Databases** > **rh_employees** > **Schema**
   - Procure por `transport_voucher_cost`

2. Se a coluna não estiver lá, adicione manualmente:
   ```sql
   ALTER TABLE rh_employees
   ADD COLUMN transport_voucher_cost numeric;
   ```

3. Aguarde 1 minuto para o cache ser atualizado e recarregue a aplicação.

---

**Arquivo de configuração:** `.env` deve conter as credenciais do Supabase:
```
VITE_SUPABASE_URL=https://fmivqhsfkvfunznrlxde.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi
```
