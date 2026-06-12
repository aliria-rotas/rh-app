# 📋 Integração: Pesquisa de Clima com Google Forms

## 🎯 Objetivo
Coletar respostas de clima via Google Forms (fácil para não-devs) e enviar automaticamente para o app.

---

## 📝 PASSO 1: Criar o Google Form

### A. Acesse Google Forms
1. Vá para [forms.google.com](https://forms.google.com)
2. Clique em "**+ Criar novo formulário**"
3. Nome: `Pesquisa de Clima Organizacional 2026`

### B. Primeira pergunta - Setor
- **Tipo:** Múltipla escolha
- **Pergunta:** "Qual é o seu setor?"
- **Opções:**
  - Licitações
  - Farmácia
  - Financeiro
- **Obrigatória:** Sim

### C. 16 Perguntas de Clima (Escala Likert)

Para cada pergunta abaixo:
1. **Tipo:** Múltipla escolha
2. **Opções:** (copie exatamente)
   ```
   1 - Discordo totalmente
   2 - Discordo
   3 - Neutro
   4 - Concordo
   5 - Concordo totalmente
   ```
3. **Obrigatória:** Sim

### Perguntas:

#### LIDERANÇA
- [ ] `P1_Lideranca_Feedback` - Meu gestor fornece feedback claro sobre meu desempenho
- [ ] `P2_Lideranca_Motivacao` - Sinto-me motivado(a) pelas ações do meu gestor
- [ ] `P3_Lideranca_Acesso` - Meu gestor é acessível e aberto ao diálogo

#### COMUNICAÇÃO
- [ ] `P4_Comunicacao_Transparencia` - A comunicação interna é clara e transparente
- [ ] `P5_Comunicacao_Informacao` - Tenho informações suficientes sobre decisões que me afetam

#### AMBIENTE DE TRABALHO
- [ ] `P6_Ambiente_Condicoes` - Estou satisfeito(a) com as condições físicas do meu ambiente de trabalho
- [ ] `P7_Ambiente_Seguranca` - O ambiente de trabalho é saudável e seguro

#### DESENVOLVIMENTO
- [ ] `P8_Desenvolvimento_Oportunidades` - Tenho oportunidades claras de desenvolvimento profissional
- [ ] `P9_Desenvolvimento_Investimento` - A empresa investe em meu treinamento e desenvolvimento

#### RECONHECIMENTO
- [ ] `P10_Reconhecimento_Valor` - Meu trabalho é reconhecido e valorizado
- [ ] `P11_Reconhecimento_Contribuicao` - Recebo reconhecimento adequado por minhas contribuições

#### BENEFÍCIOS
- [ ] `P12_Beneficios_Adequacao` - Os benefícios oferecidos são adequados
- [ ] `P13_Beneficios_Remuneracao` - Estou satisfeito(a) com a remuneração oferecida

#### CULTURA
- [ ] `P14_Cultura_Valores` - Os valores da empresa são vivenciados na prática
- [ ] `P15_Cultura_Orgulho` - Tenho orgulho em trabalhar nesta empresa

#### DIVERSIDADE & INCLUSÃO
- [ ] `P16_Diversidade_Inclusao` - Sinto-me incluído(a) e respeitado(a) na empresa
- [ ] `P17_Diversidade_Respeito` - Existe respeito à diversidade no ambiente de trabalho

---

## 🔄 PASSO 2: Configurar Automação com Zapier (Gratuito)

### A. Criar conta Zapier
1. Vá para [zapier.com](https://zapier.com)
2. Clique em "Sign up" (gratuito)
3. Crie uma conta com seu email

### B. Criar Zap
1. Clique em "**Create Zap**"
2. **Trigger (Gatilho):**
   - App: Google Forms
   - Trigger: "New Response in Google Form"
   - Selecione seu formulário de clima
3. **Action (Ação):**
   - App: Webhook by Zapier
   - Action: "POST"
   - URL: `https://seu-app.com/api/climate/responses`
   - Method: POST
   - Headers:
     ```
     Content-Type: application/json
     Authorization: Bearer [TOKEN_DE_API]
     ```
   - Body (JSON):
     ```json
     {
       "survey_id": "ID_DA_PESQUISA_AQUI",
       "sector": "{{ Qual é o seu setor }}",
       "answers": {
         "P1_Lideranca_Feedback": "{{ P1_Lideranca_Feedback }}",
         "P2_Lideranca_Motivacao": "{{ P2_Lideranca_Motivacao }}",
         "P3_Lideranca_Acesso": "{{ P3_Lideranca_Acesso }}",
         "P4_Comunicacao_Transparencia": "{{ P4_Comunicacao_Transparencia }}",
         "P5_Comunicacao_Informacao": "{{ P5_Comunicacao_Informacao }}",
         "P6_Ambiente_Condicoes": "{{ P6_Ambiente_Condicoes }}",
         "P7_Ambiente_Seguranca": "{{ P7_Ambiente_Seguranca }}",
         "P8_Desenvolvimento_Oportunidades": "{{ P8_Desenvolvimento_Oportunidades }}",
         "P9_Desenvolvimento_Investimento": "{{ P9_Desenvolvimento_Investimento }}",
         "P10_Reconhecimento_Valor": "{{ P10_Reconhecimento_Valor }}",
         "P11_Reconhecimento_Contribuicao": "{{ P11_Reconhecimento_Contribuicao }}",
         "P12_Beneficios_Adequacao": "{{ P12_Beneficios_Adequacao }}",
         "P13_Beneficios_Remuneracao": "{{ P13_Beneficios_Remuneracao }}",
         "P14_Cultura_Valores": "{{ P14_Cultura_Valores }}",
         "P15_Cultura_Orgulho": "{{ P15_Cultura_Orgulho }}",
         "P16_Diversidade_Inclusao": "{{ P16_Diversidade_Inclusao }}",
         "P17_Diversidade_Respeito": "{{ P17_Diversidade_Respeito }}"
       }
     }
     ```

### C. Ativar Zap
1. Clique em "Publish"
2. Seu Zap está ativo!

---

## 📊 PASSO 3: Usar no App

### A. Criar Pesquisa de Clima no App
1. Vá para **Pesquisa de Clima**
2. Clique em "**Nova Pesquisa**"
3. Título: `Pesquisa de Clima 2026`
4. Copie o **Survey ID** que aparecer
5. Cole esse ID no JSON do Zapier (campo `survey_id`)

### B. Compartilhar Google Form
1. Abra seu Google Form
2. Clique em "Enviar" (botão azul no canto superior)
3. Copie o link
4. Envie para os colaboradores dos 3 setores

### C. Ver Respostas no App
1. **Dashboard → Pesquisa de Clima**
2. Veja as respostas agrupadas por setor
3. Analise os padrões por Licitações, Farmácia e Financeiro

---

## 🔐 Segurança

⚠️ **Token de API:**
- O desenvolvedor precisa gerar um token seguro
- Contacte: [seu-desenvolvedor@email.com]
- Nunca compartilhe esse token publicamente

---

## ✅ Checklist de Configuração

- [ ] Google Form criado com 1 pergunta de setor + 16 de clima
- [ ] Todas as opções de resposta estão corretas (1-5)
- [ ] Zapier conta criada
- [ ] Webhook configurado com URL e token corretos
- [ ] Survey ID inserido no Zapier
- [ ] Zap ativado e testado
- [ ] Link do Google Form compartilhado com os setores
- [ ] Respostas chegando no app ✓

---

## 🆘 Troubleshooting

### As respostas não chegam
1. Verifique se o Zap está ativo (status: "ON")
2. Teste com uma resposta de teste no Google Forms
3. Clique em "ZAP HISTORY" no Zapier para ver erros
4. Verifique se o Token de API está correto

### Os números estão errados
- Certifique-se que as opções no Google Form são exatamente:
  ```
  1 - Discordo totalmente
  2 - Discordo
  3 - Neutro
  4 - Concordo
  5 - Concordo totalmente
  ```

### Setor não está reconhecido
- Nomes devem ser exatamente: "Licitações", "Farmácia", "Financeiro"
- Sem abreviações ou variações

---

## 📞 Próximos Passos

Após as respostas chegarem:
1. Dashboard de análise por setor
2. Gráficos comparativos
3. Relatório executivo automático
4. Planos de ação por dimensão

