# Configuração do Sistema de Feedback com Email

## 📧 Setup no Supabase

### 1. Adicionar Variáveis de Ambiente

No Supabase Dashboard → Settings → Edge Functions → Secrets, adicione:

```
GMAIL_EMAIL = rhaliria@gmail.com
GMAIL_PASSWORD = Aliria@47848
RECIPIENT_EMAIL = klissia@eualiria.com.br
```

### 2. Criar a Tabela no Supabase (já foi feita)

Execute o SQL do arquivo `CREATE-FEEDBACKS-TABLE.sql`

---

## 🔗 URLs das Páginas

### Para Colaboradores (enviar feedback):
```
/enviar-feedback
```

### Para RH (visualizar e responder):
```
/reclamacoes
```

---

## 🚀 Como Funciona

1. **Colaborador acessa `/enviar-feedback`**
   - Preenche formulário (tipo, título, mensagem)
   - Opcionalmente deixa nome e email
   - Clica em "Enviar Feedback"

2. **Sistema salva no Supabase**
   - Insere na tabela `feedbacks`
   - Status inicial: "novo"

3. **Email é enviado automaticamente**
   - Para: `klissia@eualiria.com.br`
   - Inclui todos os detalhes do feedback
   - Link para acessar o dashboard

4. **RH acessa `/reclamacoes`**
   - Vê dashboard com todos os feedbacks
   - Filtra por tipo e status
   - Pode responder feedbacks
   - Marca como "resolvido" quando terminar

---

## ⚠️ Notas de Segurança

- A senha do Gmail está nas secrets do Supabase (não fica no código)
- Use "Senha de App" se ativar 2FA no Gmail (é mais seguro)
- O email para onde vai a resposta é `klissia@eualiria.com.br`

---

## 🧪 Testar

1. Acesse: `http://localhost:5173/rh-app/enviar-feedback` (ou o URL do Vercel)
2. Preencha o formulário
3. Envie
4. Verifique se o email chegou em `klissia@eualiria.com.br`
5. Acesse `/reclamacoes` para ver no dashboard
