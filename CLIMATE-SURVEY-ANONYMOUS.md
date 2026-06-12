# 📋 Integração: Pesquisa de Clima com Google Forms (Anônima)

## 🎯 Objetivo
Coletar respostas de clima via Google Forms totalmente **anônimo** e enviar automaticamente para o app.

---

## 📝 PASSO 1: Criar o Google Form

### A. Acesse Google Forms
1. Vá para [forms.google.com](https://forms.google.com)
2. Clique em "**+ Criar novo formulário**"
3. Nome: `Pesquisa de Clima Organizacional 2026`

### B. 16 Perguntas de Clima (Escala Likert)

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

#### COMUNICAÇÃO
- [ ] `P3_Comunicacao_Transparencia` - A comunicação interna é clara e transparente
- [ ] `P4_Comunicacao_Informacao` - Tenho informações suficientes sobre decisões que me afetam

#### AMBIENTE DE TRABALHO
- [ ] `P5_Ambiente_Condicoes` - Estou satisfeito(a) com as condições físicas do meu ambiente de trabalho
- [ ] `P6_Ambiente_Seguranca` - O ambiente de trabalho é saudável e seguro

#### DESENVOLVIMENTO
- [ ] `P7_Desenvolvimento_Oportunidades` - Tenho oportunidades claras de desenvolvimento profissional
- [ ] `P8_Desenvolvimento_Investimento` - A empresa investe em meu treinamento e desenvolvimento

#### RECONHECIMENTO
- [ ] `P9_Reconhecimento_Valor` - Meu trabalho é reconhecido e valorizado
- [ ] `P10_Reconhecimento_Contribuicao` - Recebo reconhecimento adequado por minhas contribuições

#### BENEFÍCIOS
- [ ] `P11_Beneficios_Adequacao` - Os benefícios oferecidos são adequados
- [ ] `P12_Beneficios_Remuneracao` - Estou satisfeito(a) com a remuneração oferecida

#### CULTURA
- [ ] `P13_Cultura_Valores` - Os valores da empresa são vivenciados na prática
- [ ] `P14_Cultura_Orgulho` - Tenho orgulho em trabalhar nesta empresa

#### DIVERSIDADE & INCLUSÃO
- [ ] `P15_Diversidade_Inclusao` - Sinto-me incluído(a) e respeitado(a) na empresa
- [ ] `P16_Diversidade_Respeito` - Existe respeito à diversidade no ambiente de trabalho

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
       "answers": {
         "P1_Lideranca_Feedback": "{{ P1_Lideranca_Feedback }}",
         "P2_Lideranca_Motivacao": "{{ P2_Lideranca_Motivacao }}",
         "P3_Comunicacao_Transparencia": "{{ P3_Comunicacao_Transparencia }}",
         "P4_Comunicacao_Informacao": "{{ P4_Comunicacao_Informacao }}",
         "P5_Ambiente_Condicoes": "{{ P5_Ambiente_Condicoes }}",
         "P6_Ambiente_Seguranca": "{{ P6_Ambiente_Seguranca }}",
         "P7_Desenvolvimento_Oportunidades": "{{ P7_Desenvolvimento_Oportunidades }}",
         "P8_Desenvolvimento_Investimento": "{{ P8_Desenvolvimento_Investimento }}",
         "P9_Reconhecimento_Valor": "{{ P9_Reconhecimento_Valor }}",
         "P10_Reconhecimento_Contribuicao": "{{ P10_Reconhecimento_Contribuicao }}",
         "P11_Beneficios_Adequacao": "{{ P11_Beneficios_Adequacao }}",
         "P12_Beneficios_Remuneracao": "{{ P12_Beneficios_Remuneracao }}",
         "P13_Cultura_Valores": "{{ P13_Cultura_Valores }}",
         "P14_Cultura_Orgulho": "{{ P14_Cultura_Orgulho }}",
         "P15_Diversidade_Inclusao": "{{ P15_Diversidade_Inclusao }}",
         "P16_Diversidade_Respeito": "{{ P16_Diversidade_Respeito }}"
       }
     }
     ```

### C. Ativar Zap
1. Clique em "Publish"
2. Seu Zap está ativo!

---

## ✅ Checklist de Configuração

- [ ] Google Form criado com 16 perguntas de clima
- [ ] Todas as opções de resposta estão corretas (1-5)
- [ ] Zapier conta criada
- [ ] Webhook configurado com URL e token corretos
- [ ] Survey ID inserido no Zapier
- [ ] Zap ativado e testado
- [ ] Link do Google Form compartilhado com todos
- [ ] Respostas chegando no app ✓

---

## 🆘 Troubleshooting

### As respostas não chegam
1. Verifique se o Zap está ativo (status: "ON")
2. Teste com uma resposta de teste no Google Forms
3. Clique em "ZAP HISTORY" no Zapier para ver erros
4. Verifique se o Token de API está correto
