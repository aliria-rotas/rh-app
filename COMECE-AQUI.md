# 🚀 COMECE AQUI - 5 Passos para Testar

Bem-vindo! Siga estes 5 passos simples para testar o app RH.

---

## ✅ Passo 1: Instalação (2 minutos)

### 1.1 Abra o terminal
```bash
cd "C:\Klissia - RH\rh-app"
```

### 1.2 Instale dependências
```bash
npm install
```

Aguarde até aparecer `added X packages` (pode levar 2-3 minutos).

---

## ✅ Passo 2: Crie Usuários de Teste (3 minutos)

### 2.1 Acesse Supabase
Abra no navegador: https://supabase.com/dashboard

### 2.2 Selecione seu projeto

### 2.3 Vá para Authentication → Users

### 2.4 Clique em "Add User"

### 2.5 Preencha:
- **Email**: `rh@aliria.com`
- **Password**: `Teste@123456`
- Clique em "Create User"

### 2.6 (Opcional) Crie mais usuários:
```
Email: farmacia@aliria.com
Senha: Teste@123456

Email: licitacoes@aliria.com
Senha: Teste@123456

Email: admin@aliria.com
Senha: Teste@123456
```

---

## ✅ Passo 3: Inicie o App (1 minuto)

### 3.1 No terminal, execute:
```bash
npm run dev
```

### 3.2 Aguarde aparecer:
```
VITE v4.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 3.3 Abra no navegador:
http://localhost:5173

---

## ✅ Passo 4: Faça Login (1 minuto)

### 4.1 Você será redirecionado para a página de login

### 4.2 Preencha:
- **Email**: `rh@aliria.com`
- **Senha**: `Teste@123456`

### 4.3 Clique em "Entrar"

### 4.4 Se sucesso:
- ✅ Você verá o Dashboard
- ✅ O email aparecerá no header
- ✅ Nenhuma mensagem de erro

---

## ✅ Passo 5: Explore o App (5 minutos)

### 5.1 Teste o Menu
- Clique em "Dashboard" no menu
- Clique em "Colaboradores"
- Clique em "Benefícios"
- Veja outros menus

### 5.2 Acesse seu Perfil
- Clique no ícone de usuário no header
- Veja suas informações
- Veja o ID da sua conta

### 5.3 Teste Logout
- Clique no botão "Sair" no header
- Você será redirecionado para login
- Confirme que precisa fazer login novamente

### 5.4 Tente Login Inválido
- Email: `rh@aliria.com`
- Senha: `senhaerrada`
- Veja a mensagem: "Email ou senha incorretos"

---

## 🎉 Parabéns!

Se você chegou aqui, o app está funcionando! 

Agora você pode:
- ✅ Fazer login/logout
- ✅ Ver sua conta
- ✅ Explorar as páginas
- ✅ Dados estão protegidos por RLS

---

## 📖 Próximos Passos

### Se quer entender melhor:
Leia o arquivo: **`GUIA-TESTES-AUTENTICACAO.md`**
- 13 testes detalhados
- Como testar RLS
- Troubleshooting

### Se quer saber o que foi implementado:
Leia o arquivo: **`RESUMO-IMPLEMENTACOES.md`**
- Tudo que foi feito
- Segurança
- Features

### Se quer criar mais usuários:
Leia o arquivo: **`USUARIOS-TESTE.md`**
- Passo a passo
- Diferentes funções

### Se quer ver as melhorias:
Leia o arquivo: **`MELHORIAS-AUTENTICACAO.md`**
- Validações
- Página de Perfil
- Tratamento de erros

---

## ⚡ Troubleshooting Rápido

### "Erro ao fazer login"
**Solução**: 
1. Verifique se criou o usuário no Supabase
2. Verifique email e senha (case-sensitive)
3. Abra F12 (DevTools) e veja o erro real

### "Conexão recusada em localhost:5173"
**Solução**: 
1. Verifique se `npm run dev` está rodando
2. Verifique se a porta 5173 está disponível
3. Tente `npm run dev` em outro terminal

### "Variáveis de ambiente não encontradas"
**Solução**: 
1. Verifique arquivo `.env`
2. Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão lá
3. Reinicie o app com `npm run dev`

### "Redireciona para login mesmo após login"
**Solução**: 
1. Limpe localStorage: `localStorage.clear()`
2. Feche o navegador completamente
3. Abra novamente e faça login

---

## 💡 Dicas

- 📌 Deixe o terminal aberto enquanto testa
- 🔄 Use F5 para recarregar a página
- 🔍 Use F12 para ver erros no console
- 📝 Tome notas dos testes que fez
- 🐛 Se encontrar bug, anote e relate

---

## 🎯 Checklist Rápido

Marque conforme completa:

- [ ] 1. Instalou dependências (`npm install`)
- [ ] 2. Criou usuário `rh@aliria.com` no Supabase
- [ ] 3. Iniciou o app (`npm run dev`)
- [ ] 4. Fez login com sucesso
- [ ] 5. Viu o Dashboard
- [ ] 6. Clicou em "Colaboradores"
- [ ] 7. Acessou o Perfil
- [ ] 8. Fez logout
- [ ] 9. Testou login inválido
- [ ] 10. Leu `GUIA-TESTES-AUTENTICACAO.md`

---

## 🆘 Precisa de Ajuda?

1. **Leia** a documentação (arquivos `.md`)
2. **Verifique** o console (F12)
3. **Reinicie** o app (`npm run dev`)
4. **Pergunte**: Stack Overflow, ChatGPT, ou documentação

---

## 📅 Próximos Passos

Após confirmar que tudo funciona:

1. **Testes Completos**: Siga `GUIA-TESTES-AUTENTICACAO.md`
2. **Testar RLS**: Crie 2 usuários e veja que cada um vê apenas seus dados
3. **Feedback**: Anote o que gostou e o que pode melhorar
4. **Implantação**: Configure deploy no Vercel/Netlify

---

## ❓ Dúvidas Frequentes

**P: Posso testar sem internet?**  
A: Não, precisa acessar o Supabase (que está na nuvem).

**P: Posso usar outro email para teste?**  
A: Sim! Qualquer email válido funciona. Crie no Supabase.

**P: Minha senha é fraca?**  
A: Não, a senha `Teste@123456` é segura (letras, números, símbolos).

**P: Quanto tempo leva para setup?**  
A: 10-15 minutos no total (1x).

**P: Posso deletar usuários de teste depois?**  
A: Sim, no Supabase Dashboard > Authentication > Users.

---

**Versão**: 1.0  
**Data**: Maio 2026  
**Tempo**: 10-15 minutos  
**Dificuldade**: ⭐ Fácil

---

## 🎊 Boa Sorte!

Você consegue! Qualquer dúvida, leia a documentação ou abra o console (F12).

**Divirta-se explorando o app! 🚀**
