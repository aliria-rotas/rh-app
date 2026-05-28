# Setup Respostas de Treinamento no Supabase

Para que o formulário de respostas do treinamento funcione completamente, execute os seguintes SQL scripts no Supabase SQL Editor:

## 1. Criar Tabela (executar primeiro)
Arquivo: `CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql`

Cria a tabela `rh_training_responses` e suas políticas RLS iniciais.

## 2. Criar Função de Insert (executar segundo)
Arquivo: `CRIAR-FUNCAO-INSERT-RESPOSTAS.sql`

Cria a função RPC `insert_training_response` que permite que o formulário público salve as respostas sem autenticação.

## 3. Corrigir RLS (executar terceiro)
Arquivo: `CORRIGIR-RLS-RESPOSTAS-TREINAMENTO.sql`

Corrige a política de SELECT para usar `auth.email()` em vez de uma subquery na tabela `users`, evitando erro de permissão.

## 4. Criar Função de Leitura (executar quarto)
Arquivo: `CRIAR-FUNCAO-GET-RESPOSTAS.sql`

Cria a função RPC `get_training_responses` que permite ao admin visualizar as respostas de forma segura.

## Ordem de Execução:
1. CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql
2. CRIAR-FUNCAO-INSERT-RESPOSTAS.sql
3. CORRIGIR-RLS-RESPOSTAS-TREINAMENTO.sql
4. CRIAR-FUNCAO-GET-RESPOSTAS.sql

## Como Executar:
1. Acesse https://app.supabase.com
2. Selecione o projeto "aliria-rotas"
3. Vá para SQL Editor
4. Cole o conteúdo de cada arquivo e execute

## Status do Formulário:
- ✅ Formulário público funciona (dados sendo salvos)
- ✅ RPC function insert_training_responses criada
- ⏳ Admin precisa executar os SQL scripts acima para visualizar as respostas
