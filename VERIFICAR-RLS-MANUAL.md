# 🔍 COMO VERIFICAR SE RLS FOI IMPLEMENTADO (Manual)

## Opção 1: Verificar no Painel (Recomendado)

### Passo 1: Abra o Supabase Dashboard
```
https://supabase.com/dashboard
```

### Passo 2: Vá para Editors → SQL Editor
- Menu esquerdo → SQL Editor
- Veja se há queries executadas recentemente

### Passo 3: Verifique a Tabela rh_employees
1. Menu esquerdo → **Tables**
2. Clique em: **rh_employees**
3. Clique na aba: **Security (🔒)**
4. Procure por:
   - ✅ "Users can read their own employee data"
   - ✅ "Only admin can update employee data"
   - ✅ "Only admin can insert employees"
   - ✅ "Only admin can delete employees"

Se ver essas políticas → **RLS foi implementado com sucesso!** ✅

---

## Opção 2: Executar SQL de Verificação

Se não encontrou as políticas, execute este SQL para verificar:

```sql
-- Ver se RLS está ativado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('rh_employees', 'rh_benefits_config', 'rh_job_openings', 'rh_interview_questions');

-- Ver todas as políticas criadas
SELECT schemaname, tablename, policyname, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Resultado esperado:**
```
rh_employees          | t  (RLS ativado)
rh_benefits_config    | t  (RLS ativado)
rh_job_openings       | t  (RLS ativado)
rh_interview_questions| t  (RLS ativado)
```

---

## ❌ Se não estiver funcionando:

### Possível Problema 1: Erro na Sintaxe
- Copie e cole o SQL novamente
- Verifique se não há caracteres estranhos

### Possível Problema 2: Limite de Caracteres
- O SQL é muito grande (~2000 caracteres)
- Tente executar em 2 partes:
  1. Primeira: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` (todas as 4 tabelas)
  2. Segunda: `CREATE POLICY ...` (todas as políticas)

### Possível Problema 3: Conexão
- Verifique se está usando a conta correta
- Tente desconectar e conectar novamente no Supabase

---

## ✅ Próxima Ação

Se RLS foi implementado, você precisa:

1. **Adicionar Autenticação no App**
   ```javascript
   // No seu React app, adicione login:
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'usuario@example.com',
     password: 'senha'
   })
   ```

2. **Testar com Usuário Logado**
   - Faça login no app
   - Verifique se consegue ver dados
   - Verifique se dados sensíveis estão protegidos

3. **Testar sem Logado**
   - Faça logout
   - Tente acessar dados
   - Deve bloquear o acesso ✅

---

## 📞 Precisa de Ajuda?

Se o RLS não foi implementado, me avise e vou:
1. Executar o SQL de forma diferente
2. Dividir em partes menores
3. Verificar erros específicos

**Faça print da tela de segurança e me mande!**
