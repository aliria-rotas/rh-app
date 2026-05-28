# 🔐 GUIA: Implementar Row Level Security (RLS)

## ⏰ TEMPO ESTIMADO: 5 minutos

---

## 📋 PASSO-A-PASSO

### 1️⃣ Abra o Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2️⃣ Selecione seu projeto
- Clique em: **fmivqhsfkvfunznrlxde** (ou seu projeto RH)

### 3️⃣ Vá para o SQL Editor
- Menu esquerdo → **SQL Editor**
- Clique em **+ New query**

### 4️⃣ Copie e cole o SQL abaixo

Copie TODO o código SQL e cole no editor:

```sql
-- ════════════════════════════════════════════════════════════════════════════════
-- IMPLEMENTAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════════════════════════════════

-- 1. ATIVAR RLS
ALTER TABLE rh_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE rh_benefits_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE rh_job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rh_interview_questions ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS - rh_employees
CREATE POLICY "Users can read their own employee data"
  ON rh_employees FOR SELECT
  USING (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can update employee data"
  ON rh_employees FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can insert employees"
  ON rh_employees FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can delete employees"
  ON rh_employees FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- 3. POLÍTICAS - rh_benefits_config
CREATE POLICY "Only admin can read benefits config"
  ON rh_benefits_config FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can update benefits config"
  ON rh_benefits_config FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can insert benefits config"
  ON rh_benefits_config FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 4. POLÍTICAS - rh_job_openings
CREATE POLICY "Anyone can read open job openings"
  ON rh_job_openings FOR SELECT
  USING (status = 'open' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can update job openings"
  ON rh_job_openings FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can insert job openings"
  ON rh_job_openings FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 5. POLÍTICAS - rh_interview_questions
CREATE POLICY "Authenticated users can read interview questions"
  ON rh_interview_questions FOR SELECT
  USING (auth.jwt() ->> 'sub' IS NOT NULL);

CREATE POLICY "Only admin can update interview questions"
  ON rh_interview_questions FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admin can insert interview questions"
  ON rh_interview_questions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### 5️⃣ Execute o SQL
- Clique em **▶️ RUN** (botão azul no canto superior direito)
- Aguarde a confirmação ✅

### 6️⃣ Verifique
- Você deve ver: `Query executed successfully`
- Se houver erro, anote a mensagem

---

## ✅ O que foi implementado:

| Tabela | Proteção | Quem acessa |
|--------|----------|------------|
| **rh_employees** | 🔐 RLS ativado | Usuários veem seus dados + admin vê tudo |
| **rh_benefits_config** | 🔐 RLS ativado | Apenas admin |
| **rh_job_openings** | 🔐 RLS ativado | Público lê vagas abertas |
| **rh_interview_questions** | 🔐 RLS ativado | Autenticados leem |

---

## ⚠️ IMPORTANTE: Configure Autenticação

Para que o RLS funcione, seu app precisa usar autenticação Supabase:

```javascript
// No seu app, adicione:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Login
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Agora as queries respeitam RLS
const { data } = await supabase.from('rh_employees').select('*')
```

---

## 🆘 Se algo der errado:

### Erro: "role" de admin não funciona
- Configure o `auth.jwt() ->> 'role' = 'admin'` no seu sistema de autenticação

### Erro: Nenhum resultado
- Usuário logado não pode acessar dados porque não tem permissão
- Verifique a política de segurança

### Precisa reverter?
```sql
ALTER TABLE rh_employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE rh_benefits_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE rh_job_openings DISABLE ROW LEVEL SECURITY;
ALTER TABLE rh_interview_questions DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own employee data" ON rh_employees;
-- ... remova as outras políticas
```

---

## 📞 Suporte

Se tiver dúvidas:
1. Leia: https://supabase.com/docs/guides/auth/row-level-security
2. Painel Security Advisor: https://supabase.com/dashboard
3. Documentação RLS: https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security

---

**Status:** ✅ Pronto para implementar
**Data:** 27 de maio de 2026
**Validade:** Até 30 de outubro de 2026 (quando RLS será obrigatório)
