# 🔗 Link Público — Treinamento Empático em Chatbot

**COMPARTILHE ESTE LINK COM SEUS COLABORADORES:**

---

## 📱 Link para Acessar

```
http://localhost:5173/treinamento-publico
```

**Ou compartilhe diretamente o URL completo:**

```
http://seu-dominio.com/treinamento-publico
```

---

## 📋 O que os Colaboradores Vão Encontrar

1. **📚 Resumo do Treinamento** - Conteúdo principal resumido
2. **✍️ 3 Perguntas do Teste** - Exercícios práticos
3. **📧 Formulário de Envio** - Nome, email e respostas
4. **✅ Confirmação** - Feedback imediato de envio

---

## 🎯 Instruções para Compartilhar

### Opção 1: Copiar e Colar o Link
- Copie o link acima
- Cole no email, Slack, WhatsApp, etc
- Colaboradores clicam e acessam

### Opção 2: QR Code
Se quiser gerar um QR code:
1. Acesse: https://qr-code-generator.com
2. Cole o link: `http://localhost:5173/treinamento-publico`
3. Gere o QR code
4. Imprima ou compartilhe a imagem

### Opção 3: Email com Instruções
```
Assunto: Treinamento Empático em Chatbot - Acesse Agora! 🎓

Oi [Nome],

Você foi convidado para completar o treinamento de "Atendimento Empático em Chatbot".

📌 ACESSE AQUI: http://localhost:5173/treinamento-publico

O treinamento tem:
✅ 2 horas de conteúdo (pode fazer em etapas)
✅ 3 perguntas práticas no final
✅ Feedback imediato

Após completar, suas respostas chegarão para revisão.

Qualquer dúvida, é só chamar! 💬

Abraços,
Klissia
```

---

## 📊 Onde Ver as Respostas

**Dentro do APP (somente você):**
1. Acesse: http://localhost:5173
2. Faça login
3. Vá para: **Treinamento** → **Respostas Enviadas**
4. Veja todas as respostas dos colaboradores em uma tabela

---

## 🔐 Segurança

✅ **O link é público**: Qualquer um pode acessar (sem senha)
✅ **Mas as respostas são privadas**: Só você vê no app
✅ **Dados salvos no banco**: Nunca são perdidos

---

## 📞 Troubleshooting

### "O link não funciona"
- Verifique se o app está rodando: `npm run dev`
- Confirme que a porta é 5173
- Tente abrir: http://localhost:5173 (sem `/treinamento-publico`)

### "Erro ao enviar as respostas"
- Verifique se a tabela foi criada no Supabase
- Verifique a conexão com o banco
- Veja o console do navegador (F12) para mais detalhes

### "Não estou vendo as respostas no app"
- Faça login com a conta admin (`rh@aliria.com`)
- Vá para a página de Treinamentos
- Atualize a página (F5)
- Verifique se as políticas RLS foram criadas corretamente

---

## 📋 Checklist

- [ ] Tabela `rh_training_responses` criada no Supabase (execute o SQL)
- [ ] Rota `/treinamento-publico` adicionada ao App.tsx
- [ ] App rodando (`npm run dev`)
- [ ] Link testado: http://localhost:5173/treinamento-publico
- [ ] Compartilhou com colaboradores
- [ ] Testou o envio de uma resposta
- [ ] Verificou as respostas no app em Treinamento

---

## 🚀 Como Ativar (Passo a Passo)

### Passo 1: Criar a Tabela no Supabase

1. Abra Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo de: `CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql`
4. Execute
5. Verifique se a tabela foi criada

### Passo 2: Já está Pronto!

O App.tsx já foi atualizado com a rota. Basta:

```bash
cd "C:\Klissia - RH\rh-app"
npm run dev
```

### Passo 3: Teste a Página

1. Abra: http://localhost:5173/treinamento-publico
2. Preencha o formulário com dados de teste
3. Envie as respostas
4. Verifique se funcionou (deve aparecer mensagem de sucesso)

### Passo 4: Veja no App

1. Faça login em: http://localhost:5173
2. Vá para **Treinamento**
3. Clique em **Ver Respostas**
4. Deve aparecer a resposta que você acabou de enviar

---

## 📈 Métricas que Você Pode Acompanhar

Na aba de respostas, você verá:
- ✅ Quantos colaboradores completaram
- ✅ Quando cada um completou
- ✅ As respostas de cada um para análise
- ✅ Email de contato de cada colaborador

---

## 💡 Dicas

1. **Customize o link**: Se colocar em produção, use um domain mais bonito
2. **Lembretes**: Envie lembretes periodicamente para quem não respondeu
3. **Análise**: Revise as respostas para ver o nível de compreensão
4. **Feedback**: Responda aos colaboradores com feedback das respostas deles

---

**Versão**: 1.0  
**Data**: Maio 2026  
**Status**: ✅ Pronto para Usar
