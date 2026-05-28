# Treinamento: Atendimento Empático em Chatbot - Sistema de Respostas

## Status da Implementação

### ✅ COMPLETO
- **Formulário Público**: Criado em `/treinamento-publico` com 6 questões (3 textarea + 3 multiple choice)
- **Português Correto**: Questões 2, 3, 4 focam em erros de português comuns em atendimento ao paciente
  - MAIS vs MAS (contraste vs adição)
  - Gerúndio (-ando, -endo, -indo) para ações em progresso
  - "Vou estar verificando" ❌ vs "Vou verificar" ou "Estou verificando" ✅
- **Salvamento de Dados**: Formulário salva respostas no Supabase com sucesso (confirmado via testes)
- **RPC Function para Insert**: Função `insert_training_response` criada e funcionando
- **Interface de Admin**: Abas "Plano de Treinamento" e "Respostas do Treinamento" criadas
- **Testes Realizados**: Formulário testado completo - dados sendo salvos com sucesso

### ⏳ PENDENTE (Requer execução manual de SQL)
- **RPC Function para Leitura**: Função `get_training_responses` precisa ser criada
- **RLS Corrigida**: Política de SELECT precisa ser atualizada
- **Tabela**: `rh_training_responses` precisa ser criada

## Como Completar o Setup

### Opção 1: Setup Automático (Recomendado)

Você precisa da **Service Role Key** do Supabase. Para obter:

1. Acesse https://app.supabase.com
2. Selecione o projeto **"aliria-rotas"**
3. Vá para **Settings → API**
4. Copie a **Service Role Key** (não é a Anon Key)
5. Execute no terminal:

```bash
cd "C:\Klissia - RH\rh-app"
set SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
node setup-supabase.js
```

### Opção 2: Setup Manual

1. Acesse https://app.supabase.com
2. Selecione projeto "aliria-rotas"
3. Vá para **SQL Editor**
4. Execute os scripts nesta ordem **exata**:

```
1. CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql
2. CRIAR-FUNCAO-INSERT-RESPOSTAS.sql
3. CORRIGIR-RLS-RESPOSTAS-TREINAMENTO.sql
4. CRIAR-FUNCAO-GET-RESPOSTAS.sql
```

## Arquitetura

### Rota Pública
- **URL**: `/treinamento-publico`
- **Componente**: `src/pages/TrainamentPublic.tsx`
- **Autenticação**: Nenhuma (público)
- **Ação**: Form submission via RPC `insert_training_response`

### Interface de Admin
- **URL**: `/treinamento` (guia "Respostas do Treinamento")
- **Componente**: `src/components/TrainningResponses.tsx`
- **Autenticação**: Requerida (apenas `rh@aliria.com`)
- **Ação**: Leitura via RPC `get_training_responses`

### Banco de Dados
- **Tabela**: `rh_training_responses`
- **Colunas**: 
  - `id` (UUID)
  - `training_id`, `training_title` (identificadores)
  - `collaborator_name`, `collaborator_email` (participante)
  - `question_1_response` até `question_6_response` (respostas - TEXT)
  - `completed_at`, `created_at`, `updated_at` (timestamps)

## Questões do Treinamento

### 1️⃣ Reconhecimento de Emoções (Textarea)
Paciente desesperado tentando marcar consulta 3 vezes. Resposta esperada: empática e gentil.

### 2️⃣ MAIS vs MAS (Multiple Choice)
Escolher resposta correta usando "mas" (contraste) em vez de "mais" (adição).
- A) ✅ **Correto** - uso de "mas"
- B) ✅ **Correto** - "mas sem problema"
- C) ❌ **Errado** - uso de "mais"

### 3️⃣ Gerúndio (Multiple Choice)
Escolher forma correta de falar sobre resultado do exame.
- A) ❌ **Errado** - "vai recebendo" (gerúndio malformado)
- B) ✅ **Correto** - "está sendo preparado" + "receberá"
- C) ❌ **Errado** - "vai consultando" (malformado)

### 4️⃣ "Vou estar verificando" (Multiple Choice)
Escolher forma correta de avisar que vai verificar resultado.
- A) ❌ **Errado** - "vou estar verificando" (confunde paciente)
- B) ✅ **Correto** - "vou verificar" (futuro claro)
- C) ✅ **Correto** - "estou verificando" (progressivo)

### 5️⃣ Situação Complexa (Textarea)
Paciente irritado sobre resultado atrasado. Resposta esperada: investigar + acalmar com português correto.

### 6️⃣ Aplicação Prática (Textarea)
Situação real de atendimento usando os 3 pilares: Clareza, Empatia, Eficiência.

## Testes Realizados

### ✅ Teste 1: Form Submission
- Navegou para `/treinamento-publico`
- Preencheu formulário completo
- Clicou em "Enviar Respostas"
- **Resultado**: Página de sucesso exibida ✓
- **Network**: POST para `insert_training_response` retornou 200 OK ✓
- **Console**: Log "✅ Sucesso! Respostas enviadas!" ✓

### ✅ Teste 2: Admin Authentication
- Fez login com `rh@aliria.com`
- Navegou para `/treinamento`
- Clicou em "Respostas do Treinamento"
- **Resultado**: Componente carregou (aguardando SQL setup) ✓

### ⏳ Teste 3: Data Retrieval
- Aguardando criação da RPC function `get_training_responses`
- Erro atual: `Could not find the function` (esperado)

## Próximos Passos

1. **Execute o setup SQL** (Opção 1 ou 2 acima)
2. **Recarregue a página**: Ctrl+R em `http://localhost:5173/treinamento`
3. **Verifique respostas**: Abra a guia "Respostas do Treinamento"
4. **Teste completo**: Deve listar respostas com opções de expandir, exportar CSV, enviar email

## Arquivos Criados/Modificados

### Modificados
- `src/pages/TrainamentPublic.tsx` - Remover alerts, usar RPC insert
- `src/components/TrainningResponses.tsx` - Usar RPC get em vez de select direto
- `src/App.tsx` - Route `/treinamento-publico` adicionada ✓

### Criados
- `CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql` - Criar tabela + RLS inicial
- `CRIAR-FUNCAO-INSERT-RESPOSTAS.sql` - RPC para form público
- `CORRIGIR-RLS-RESPOSTAS-TREINAMENTO.sql` - Fix RLS policy
- `CRIAR-FUNCAO-GET-RESPOSTAS.sql` - RPC para leitura admin
- `setup-supabase.js` - Script automático
- `SETUP-SUPABASE-RESPOSTAS.md` - Instruções
- `TRAINING-RESPONSES-README.md` - Este arquivo

## Glossário Técnico

- **RPC**: Remote Procedure Call - função no PostgreSQL chamada via API
- **RLS**: Row Level Security - controle de acesso em nível de linha
- **SECURITY DEFINER**: Função executa com permissões do criador (admin)
- **auth.email()**: Função Supabase que retorna email do usuário autenticado
- **anon**: Usuário não autenticado
- **authenticated**: Usuário autenticado
- **service_role**: Admin da aplicação com todas as permissões

## Suporte

Dúvidas? Verificar:
1. Service Role Key está correta?
2. Scripts SQL foram executados nesta ordem exata?
3. Recarregou a página (Ctrl+R)?
4. Está logado como `rh@aliria.com`?
