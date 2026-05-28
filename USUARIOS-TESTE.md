# Criar Usuários de Teste no Supabase

Para testar o sistema de autenticação, você precisa criar usuários de teste no Supabase Dashboard.

## Passos:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **Authentication > Users**
4. Clique em **Add User**
5. Crie os seguintes usuários:

### Usuário 1: RH Generalista
- **Email**: rh@aliria.com
- **Password**: Teste@123456
- **Função**: Analista de RH II (pode ver dados de todos)

### Usuário 2: Farmácia
- **Email**: farmacia@aliria.com  
- **Password**: Teste@123456
- **Função**: Coordenadora Farmacêutica RT (gestão técnica)

### Usuário 3: Licitações
- **Email**: licitacoes@aliria.com
- **Password**: Teste@123456
- **Função**: Analista de Licitações II

### Usuário 4: Administrativo
- **Email**: admin@aliria.com
- **Password**: Teste@123456
- **Função**: Analista Administrativo II

## Testar o Login:

1. Abra http://localhost:5173
2. Você será redirecionado para /login
3. Teste com um dos usuários acima
4. Após login, verá o Dashboard
5. Clique em "Sair" para logout
6. Você será redirecionado para /login novamente

## Verificar RLS:

Para testar que o RLS está funcionando:

1. Crie um usuário teste1@test.com
2. Crie um registro na tabela `rh_employees` com user_id de teste1@test.com
3. Faça login com teste1@test.com
4. Verifique que ele SÓ consegue ver seus próprios dados
5. Crie outro usuário teste2@test.com
6. Faça login com teste2@test.com
7. Verifique que teste2 NÃO consegue ver os dados de teste1

Isso prova que o RLS está protegendo os dados corretamente!
