# 🏢 Aliria RH - Sistema de Gestão de Pessoas

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0-blue)
![React](https://img.shields.io/badge/React-18.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

Sistema completo de gestão de recursos humanos desenvolvido com **React 18**, **TypeScript** e **Supabase**.

---

## 🚀 Início Rápido (10 minutos)

```bash
# 1. Instale dependências
npm install

# 2. Configure variáveis de ambiente (.env)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# 3. Crie usuário de teste no Supabase Dashboard
# Email: rh@aliria.com
# Senha: Teste@123456

# 4. Inicie o servidor
npm run dev

# 5. Abra http://localhost:5173
```

---

## 📖 Documentação Completa

| Arquivo | Descrição | Tempo |
|---------|-----------|-------|
| **[COMECE-AQUI.md](./COMECE-AQUI.md)** | 5 passos simples para começar | 10 min |
| **[USUARIOS-TESTE.md](./USUARIOS-TESTE.md)** | Como criar usuários no Supabase | 5 min |
| **[GUIA-TESTES-AUTENTICACAO.md](./GUIA-TESTES-AUTENTICACAO.md)** | 13 testes detalhados | 30 min |
| **[MELHORIAS-AUTENTICACAO.md](./MELHORIAS-AUTENTICACAO.md)** | Validações, perfil, tratamento de erros | 10 min |
| **[RESUMO-IMPLEMENTACOES.md](./RESUMO-IMPLEMENTACOES.md)** | Visão geral de tudo que foi feito | 15 min |

---

## ✨ Features Principais

### 🔐 Segurança em Produção
- ✅ **Row Level Security (RLS)** - 13 políticas SQL
- ✅ **Autenticação JWT** - Login com Supabase Auth
- ✅ **Proteção de Rotas** - Apenas autenticados acessam
- ✅ **Validação de Entrada** - Email, senha, campos obrigatórios
- ✅ **Tratamento de Erros** - Mensagens amigáveis, sem exposição de dados

### 📋 Módulos de RH
- ✅ Dashboard com KPIs
- ✅ Gestão de Colaboradores
- ✅ Recrutamento e Seleção
- ✅ Benefícios
- ✅ Treinamento e Desenvolvimento
- ✅ Avaliação de Desempenho
- ✅ Pesquisa de Clima
- ✅ Cargos e Salários
- ✅ Gestão de Desligamento
- ✅ Endomarketing
- ✅ KPIs de RH
- ✅ Relatórios

### 👤 Perfil e Conta
- ✅ Página de Perfil (`/perfil`)
- ✅ Informações pessoais
- ✅ Links para segurança
- ✅ Sessão persistente

---

## 🏗️ Stack Tecnológico

**Frontend**
- React 18
- TypeScript
- React Router
- Tailwind CSS
- Vite

**Backend**
- Supabase (PostgreSQL + Auth)
- Row Level Security (RLS)
- JWT Authentication

**Ferramentas**
- npm
- Node.js 18+

---

## 📁 Estrutura do Projeto

```
rh-app/
├── src/
│   ├── pages/                 # 13 páginas de RH
│   │   ├── Login.tsx          # ✨ Validações aprimoradas
│   │   ├── Perfil.tsx         # ✨ NOVO - Perfil do usuário
│   │   ├── Dashboard.tsx       # Dashboard com KPIs
│   │   └── [outras páginas]
│   ├── components/
│   │   ├── ProtectedRoute.tsx  # Proteção de rotas
│   │   ├── layout/
│   │   │   ├── Layout.tsx      # ✨ Links de perfil
│   │   │   └── Sidebar.tsx     # Menu lateral
│   │   └── ui/                 # Componentes UI
│   ├── contexts/
│   │   └── AuthContext.tsx     # Gerenciamento de auth
│   ├── lib/
│   │   ├── supabase.ts        # Cliente Supabase
│   │   ├── db.ts              # Acesso a dados
│   │   └── seed.ts            # Dados iniciais
│   ├── App.tsx                # Rotas principais
│   └── main.tsx               # Entry point
├── .env                        # Variáveis de ambiente
├── package.json               # Dependências
├── vite.config.ts             # Config Vite
└── README.md                  # Este arquivo
```

---

## 🔐 Como Funciona a Segurança

### Row Level Security (RLS)
Cada usuário vê **APENAS seus dados** no banco de dados:

```sql
-- Exemplo de política RLS
CREATE POLICY "Users can read their own employee data"
  ON rh_employees
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

**Resultado**:
- Usuário A vê APENAS seus dados
- Usuário A NÃO consegue ver dados de B
- Mesmo com acesso ao banco, A não vê dados de B
- Proteção no nível do banco de dados (não iludível)

### Validações no Cliente
- Email obrigatório e formato válido
- Senha obrigatória (mínimo 6 caracteres)
- Campos obrigatórios
- Feedback imediato (sem enviar ao servidor)

### Autenticação
- JWT tokens gerenciados pelo Supabase
- Sessões persistentes
- Logout seguro

---

## 🧪 Testes

### Teste Rápido (5 minutos)
```bash
npm install && npm run dev
# Faça login com rh@aliria.com / Teste@123456
# Clique em "Sair" para testar logout
```

### Testes Completos (30 minutos)
Siga: [GUIA-TESTES-AUTENTICACAO.md](./GUIA-TESTES-AUTENTICACAO.md)

**13 testes incluem:**
- ✅ Login com credenciais válidas/inválidas
- ✅ Validação de email e senha
- ✅ Logout e redirecionamento
- ✅ Proteção de rotas
- ✅ RLS (dados isolados)
- ✅ Persistência de sessão
- ✅ Tratamento de erros

---

## 🎯 Status das Features

| Feature | Status | Detalhes |
|---------|--------|----------|
| Autenticação | ✅ | Login, logout, sessão |
| Validações | ✅ | Email, senha, obrigatórios |
| RLS | ✅ | 13 políticas SQL ativas |
| Perfil | ✅ | Página `/perfil` criada |
| Dashboard | ✅ | KPIs básicos |
| Páginas RH | ✅ | 13 páginas funcionando |
| Documentação | ✅ | 5 arquivos completos |
| Testes | ✅ | 13 testes definidos |

---

## 🚀 Deploy

### Build para Produção
```bash
npm run build
npm run preview
```

### Upload para Vercel
```bash
npm i -g vercel
vercel
```

### Upload para Netlify
Conecte seu repositório GitHub no dashboard da Netlify.

---

## 🔧 Desenvolvimento

### Instalar
```bash
npm install
```

### Dev Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

---

## 🐛 Troubleshooting

### "Erro ao fazer login"
1. Verifique se criou o usuário no Supabase
2. Verifique email e senha (case-sensitive)
3. Abra F12 e veja o erro no console

### "Redireciona para login continuamente"
1. Limpe localStorage: `localStorage.clear()`
2. Verifique `.env`
3. Reinicie o app

### "Conexão recusada"
1. Verifique se `npm run dev` está rodando
2. Verifique se a porta 5173 está disponível

**Mais problemas?** Veja [GUIA-TESTES-AUTENTICACAO.md](./GUIA-TESTES-AUTENTICACAO.md#troubleshooting)

---

## 📚 Aprenda Mais

### Documentação Oficial
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [React Router Docs](https://reactrouter.com)

### Segurança
- [OWASP - Autenticação Segura](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Explicado](https://jwt.io/introduction)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

## 💡 Dicas

- 📌 Mantenha o terminal aberto enquanto desenvolve
- 🔄 Use F5 para recarregar
- 🔍 Use F12 para devtools/console
- 📝 Leia a documentação antes de perguntar
- 🐛 Se encontrar bug, anote os passos e abra uma issue

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Versão | 1.0 |
| Componentes React | 20+ |
| Páginas RH | 13 |
| Políticas RLS | 13 |
| Testes Definidos | 13 |
| Documentação | 5 arquivos |
| Tempo Setup | 10 min |

---

## 🎉 Próximas Melhorias

- [ ] Recuperação de Senha
- [ ] Trocar Senha
- [ ] Multi-Factor Authentication (MFA)
- [ ] Logs de Atividades
- [ ] Rate Limiting
- [ ] Sessões Ativas
- [ ] Tema Escuro
- [ ] Internacionalização (i18n)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MeuFeature`)
3. Commit (`git commit -m 'Add MeuFeature'`)
4. Push (`git push origin feature/MeuFeature`)
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes

---

## 👥 Autores

- **Frontend**: React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Segurança**: RLS + JWT

---

## 📞 Suporte

1. **Comece aqui**: Leia [COMECE-AQUI.md](./COMECE-AQUI.md)
2. **Testes**: Siga [GUIA-TESTES-AUTENTICACAO.md](./GUIA-TESTES-AUTENTICACAO.md)
3. **Problemas**: Verifique console (F12) ou abra uma issue
4. **Docs**: Consulte [RESUMO-IMPLEMENTACOES.md](./RESUMO-IMPLEMENTACOES.md)

---

**Versão**: 1.0  
**Data**: Maio 2026  
**Status**: ✅ Pronto para Produção

**Comece agora!** 🚀 Siga [COMECE-AQUI.md](./COMECE-AQUI.md)
