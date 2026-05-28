# Guia de Testes - Autenticação e Segurança RLS

## 📋 Índice
1. [Preparação](#preparação)
2. [Testes de Autenticação](#testes-de-autenticação)
3. [Testes de RLS](#testes-de-rls)
4. [Testes de Validação](#testes-de-validação)
5. [Troubleshooting](#troubleshooting)

---

## Preparação

### 1. Instalar dependências
```bash
cd "C:\Klissia - RH\rh-app"
npm install
```

### 2. Criar usuários no Supabase

Acesse: https://supabase.com/dashboard → Seu Projeto → Authentication → Users

**Crie os seguintes usuários:**

| Email | Senha | Função |
|-------|-------|--------|
| rh@aliria.com | Teste@123456 | Analista de RH |
| farmacia@aliria.com | Teste@123456 | Coordenadora Farmácia |
| licitacoes@aliria.com | Teste@123456 | Analista Licitações |
| admin@aliria.com | Teste@123456 | Admin |

### 3. Iniciar o servidor

```bash
npm run dev
```

O app abrirá em: http://localhost:5173

---

## Testes de Autenticação

### ✅ Teste 1: Login Válido
**Objetivo**: Verificar que o login funciona corretamente

**Passos**:
1. Acesse http://localhost:5173
2. Você será redirecionado para /login automaticamente
3. Preencha:
   - Email: `rh@aliria.com`
   - Senha: `Teste@123456`
4. Clique em "Entrar"

**Resultado esperado**:
- ✅ Sem erros
- ✅ Redirecionado para o Dashboard
- ✅ Header mostra o email do usuário
- ✅ URL muda para `http://localhost:5173/`

---

### ✅ Teste 2: Login com Credenciais Inválidas
**Objetivo**: Verificar tratamento de erros

**Passos**:
1. Acesse http://localhost:5173/login
2. Preencha:
   - Email: `rh@aliria.com`
   - Senha: `senhaerrada123`
3. Clique em "Entrar"

**Resultado esperado**:
- ✅ Mensagem de erro: "Email ou senha incorretos"
- ✅ Continua na página de login
- ✅ Campo de senha é limpo

---

### ✅ Teste 3: Email Inválido
**Objetivo**: Validação de email antes do envio

**Passos**:
1. Acesse http://localhost:5173/login
2. Preencha:
   - Email: `notanemailavalid`
   - Senha: `Teste@123456`
3. Tente clicar em "Entrar"

**Resultado esperado**:
- ✅ Mensagem de validação: "Email inválido"
- ✅ Botão "Entrar" desabilitado
- ✅ Não faz requisição para o servidor

---

### ✅ Teste 4: Campo Obrigatório
**Objetivo**: Validação de campos vazios

**Passos**:
1. Acesse http://localhost:5173/login
2. Deixe campos vazios
3. Tente clicar em "Entrar"

**Resultado esperado**:
- ✅ Mensagens de validação aparecem
- ✅ Botão "Entrar" desabilitado
- ✅ Erros: "Email é obrigatório" ou "Senha é obrigatória"

---

### ✅ Teste 5: Logout
**Objetivo**: Verificar logout e redirecionamento

**Passos**:
1. Faça login com sucesso
2. No header, clique no botão "Sair"

**Resultado esperado**:
- ✅ Usuário é desconectado
- ✅ Redirecionado para /login
- ✅ Tentar acessar /dashboard redireciona para /login
- ✅ Dados do usuário não aparecem mais

---

### ✅ Teste 6: Proteção de Rotas
**Objetivo**: Verificar que rotas protegidas só são acessíveis após login

**Passos**:
1. Sem fazer login, tente acessar: `http://localhost:5173/`
2. Você deverá ser redirecionado para login

**Resultado esperado**:
- ✅ Redirecionado para /login automaticamente
- ✅ Spinner de carregamento aparece brevemente
- ✅ Não consegue acessar as páginas protegidas

---

### ✅ Teste 7: Perfil de Usuário
**Objetivo**: Acessar página de perfil

**Passos**:
1. Faça login
2. Clique no ícone de usuário no header
3. Ou clique no ícone de engrenagem

**Resultado esperado**:
- ✅ Abre página de Perfil
- ✅ Mostra email do usuário
- ✅ Mostra data de criação da conta
- ✅ Mostra ID do usuário
- ✅ Links para mudar senha, sessões ativas, atividades

---

## Testes de RLS (Row Level Security)

### ✅ Teste 8: RLS - Usuários veem apenas seus dados
**Objetivo**: Verificar que o RLS funciona (usuários não conseguem ver dados uns dos outros)

**Passos**:
1. Crie dois usuários no Supabase:
   - `usuario1@test.com` / `Teste@123456`
   - `usuario2@test.com` / `Teste@123456`

2. No Supabase, crie registros na tabela `rh_employees`:
   ```sql
   INSERT INTO rh_employees (id, user_id, full_name, email, position, department)
   VALUES 
     ('emp1', 'USER_ID_DE_USUARIO1', 'Usuário 1', 'usuario1@test.com', 'Analista RH', 'RH'),
     ('emp2', 'USER_ID_DE_USUARIO2', 'Usuário 2', 'usuario2@test.com', 'Farmacêutica', 'Farmácia');
   ```

3. Faça login com `usuario1@test.com`
4. Acesse a página de Colaboradores
5. Faça logout e login com `usuario2@test.com`
6. Acesse a página de Colaboradores

**Resultado esperado**:
- ✅ usuario1 vê apenas seu próprio registro
- ✅ usuario2 vê apenas seu próprio registro
- ✅ usuario1 NÃO consegue ver dados de usuario2
- ✅ usuario2 NÃO consegue ver dados de usuario1

---

### ✅ Teste 9: RLS - Proteção contra modificação indevida
**Objetivo**: Verificar que usuários não conseguem modificar dados de outros

**Passos**:
1. Com usuário autenticado como `usuario1@test.com`
2. Abra o console do navegador (F12)
3. Tente executar:
   ```javascript
   const { data } = await supabase
     .from('rh_employees')
     .update({ full_name: 'HACKEADO' })
     .eq('user_id', 'USER_ID_DE_USUARIO2')
   ```

**Resultado esperado**:
- ✅ Erro: "new row violates row-level security policy"
- ✅ Dados de usuario2 continuam intactos
- ✅ Ninguém consegue modificar dados alheios

---

## Testes de Validação

### ✅ Teste 10: Senha Fraca
**Objetivo**: Validação de senha forte

**Passos**:
1. Acesse http://localhost:5173/login
2. Preencha:
   - Email: `test@test.com`
   - Senha: `123`
3. Tente clicar em "Entrar"

**Resultado esperado**:
- ✅ Erro de validação: "Senha deve ter no mínimo 6 caracteres"
- ✅ Botão "Entrar" desabilitado

---

### ✅ Teste 11: Múltiplos Erros de Validação
**Objetivo**: Mostrar todos os erros ao mesmo tempo

**Passos**:
1. Acesse http://localhost:5173/login
2. Deixe tudo em branco ou preenchimento inválido
3. Veja todos os erros aparecerem

**Resultado esperado**:
- ✅ Todos os erros listados em uma caixa de aviso
- ✅ Cada erro em uma linha separada
- ✅ Botão "Entrar" desabilitado enquanto houver erros

---

## Teste de Persistência de Sessão

### ✅ Teste 12: Sessão Persiste após Reload
**Objetivo**: Usuário continua logado após atualizar página

**Passos**:
1. Faça login com sucesso
2. Pressione F5 para recarregar a página
3. Verifique se permanece no Dashboard

**Resultado esperado**:
- ✅ Breve spinner de carregamento
- ✅ Permanece no Dashboard (não redireciona para login)
- ✅ Email do usuário continua visível

---

### ✅ Teste 13: Logout após Reload
**Objetivo**: Verificar que logout também persiste

**Passos**:
1. Faça logout
2. Pressione F5 para recarregar
3. Tente acessar http://localhost:5173/

**Resultado esperado**:
- ✅ Continua redirecionando para /login
- ✅ Login é necessário para acessar o app

---

## Troubleshooting

### Problema: "Erro ao fazer login" genérico
**Solução**:
1. Verifique se o usuário foi criado no Supabase
2. Verifique credenciais (email e senha)
3. Verifique variáveis de ambiente (.env)
4. Abra F12 (DevTools) e veja o erro real no console

---

### Problema: "Invalid login credentials"
**Solução**:
1. Verifique se o email e senha estão corretos
2. Verifique se o usuário existe no Supabase
3. Tente criar um novo usuário e fazer login

---

### Problema: Redireciona para login mesmo após login
**Solução**:
1. Verifique se Supabase está respondendo
2. Verifique variáveis de ambiente
3. Limpe localStorage:
   ```javascript
   localStorage.clear()
   ```
4. Feche o navegador e reabra
5. Faça login novamente

---

### Problema: RLS está bloqueando acesso legítimo
**Solução**:
1. Verifique se as políticas RLS foram criadas corretamente:
   ```sql
   SELECT * FROM pg_policies;
   ```
2. Verifique se o `user_id` nos registros corresponde ao `user.id` do Supabase Auth
3. Consulte a documentação de RLS do Supabase

---

## Checklist Final

Antes de considerar a autenticação pronta, teste todos estes itens:

- [ ] Login funciona com credenciais válidas
- [ ] Erro aparece com credenciais inválidas
- [ ] Validação de email funciona
- [ ] Validação de campos obrigatórios funciona
- [ ] Logout redireciona para login
- [ ] Rotas protegidas redirecionam para login
- [ ] Perfil carrega dados do usuário
- [ ] RLS impede acesso a dados de outros usuários
- [ ] Sessão persiste após reload
- [ ] Logout persiste após reload
- [ ] Sem erros no console do navegador
- [ ] Sem erros no terminal (npm run dev)

---

## Próximas Melhorias Opcionais

- [ ] Implementar "Esqueci a Senha"
- [ ] Implementar "Trocar Senha"
- [ ] Implementar MFA (Multi-Factor Authentication)
- [ ] Implementar "Lembrar de mim"
- [ ] Implementar limite de tentativas de login (rate limiting)
- [ ] Implementar logs de atividades

---

## Dúvidas?

Se tiver dúvidas ou encontrar problemas não listados aqui:
1. Verifique o console do navegador (F12)
2. Verifique os logs do terminal
3. Verifique se as variáveis de ambiente estão corretas
4. Consulte a documentação do Supabase: https://supabase.com/docs
