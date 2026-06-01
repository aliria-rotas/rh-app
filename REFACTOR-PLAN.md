# TrainamentPublic.tsx Refactor Plan

## Objetivo
Reorganizar o fluxo de treinamento para intercalar cada pergunta de múltipla escolha com suas slides explicativos correspondentes.

**Nova Estrutura:** Pergunta → Responde → Feedback (✅/❌) → Slides Explicativos

## Decisão de Implementação
✅ **Reescrever do zero** - não editar o arquivo existente
- Criar novo arquivo com estrutura limpa
- Validar tipos TypeScript
- Testar no navegador
- Depois substituir o antigo

## Fluxo do Formulário (Nova Ordem)

```
1. DADOS PESSOAIS
   ├─ Nome completo (input)
   └─ Email (input)

2. PERGUNTA 2: MAIS vs MAS
   ├─ Múltipla escolha (3 opções)
   ├─ Feedback imediato: ✅ ou ❌
   └─ Slides Explicativos:
       ├─ Slide 3: Palavras-Chave
       ├─ Slide 4: Pontuação nas Frases
       └─ Slide 7: Escrita Profissional

3. PERGUNTA 3: Gerúndio
   ├─ Múltipla escolha (3 opções)
   ├─ Feedback imediato
   └─ Slide 7: Escrita Profissional

4. PERGUNTA 4: "Vou estar verificando"
   ├─ Múltipla escolha (3 opções)
   ├─ Feedback imediato
   └─ Slide 7: Escrita Profissional

5. PERGUNTA 7: Característica Chat
   ├─ Múltipla escolha (4 opções)
   ├─ Feedback imediato
   └─ Slide 5: Fundamentos Comunicação Chat

6. PERGUNTA 9: Melhor Comunicação
   ├─ Múltipla escolha (4 opções)
   ├─ Feedback imediato
   └─ Slides:
       ├─ Slide 7: Escrita Profissional
       └─ Slide 3: Palavras-Chave

7. PERGUNTA 11: Reclamação/Atitude
   ├─ Múltipla escolha (4 opções)
   ├─ Feedback imediato
   └─ Slides:
       ├─ Slide 9: Situações Difíceis
       ├─ Slide 2: Tom de Voz
       └─ Slide 6: Cordialidade

8. PERGUNTA 13: Transferir para Humano
   ├─ Múltipla escolha (4 opções)
   ├─ Feedback imediato
   └─ Slide 11: Chatbot Best Practices

9. PERGUNTAS ABERTAS (sem explicações)
   ├─ Pergunta 1: Emoção do paciente (textarea)
   ├─ Pergunta 5: Investigação + Empatia (textarea)
   ├─ Pergunta 6: Chamar paciente (textarea)
   ├─ Pergunta 8: Reescrever frase (textarea)
   ├─ Pergunta 10: Pergunta clarificadora (textarea)
   ├─ Pergunta 12: Redefinir senha (textarea)
   └─ Pergunta 14: Erro de comunicação (textarea)

10. BOTÃO ENVIAR
```

## Dados para Manter

### formData structure
```javascript
{
  collaborator_name: '',
  collaborator_email: '',
  question_1_response: '',
  question_2_response: '',
  question_3_response: '',
  question_4_response: '',
  question_5_response: '',
  question_6_response: '',
  question_7_response: '',
  question_8_response: '',
  question_9_response: '',
  question_10_response: '',
  question_11_response: '',
  question_12_response: '',
  question_13_response: '',
  question_14_response: '',
}
```

### correctAnswers
```javascript
{
  2: 'B) Não temos este medicamento, mas posso oferecer outra opção com o mesmo princípio ativo.',
  3: 'B) Seu pedido está sendo preparado neste momento e você receberá em até 2 dias.',
  4: 'B) Vou verificar o status agora mesmo e retorno com você em 2 minutos.',
  7: 'B) Clareza e objetividade',
  9: 'B) Favor enviar o documento para análise.',
  11: 'B) Demonstrar compreensão e buscar uma solução',
  13: 'A) Quando o chatbot não consegue resolver a demanda após tentativas adequadas',
}
```

### questionSlideMap (NEW)
```javascript
{
  2: [3, 4, 7],      // MAIS vs MAS
  3: [7],            // Gerúndio
  4: [7],            // Vou estar verificando
  7: [5],            // Chat characteristic
  9: [7, 3],         // Professional communication
  11: [9, 2, 6],     // Complaint/attitude
  13: [11]           // Transfer to human
}
```

### mcQuestionsOrder (NEW)
```javascript
[2, 3, 4, 7, 9, 11, 13]
```

## State Management Necessário

```javascript
const [formData, setFormData] = useState({...})
const [submitted, setSubmitted] = useState(false)
const [loading, setLoading] = useState(false)
const [training, setTraining] = useState<TrainingAction | null>(null)
const [questionFeedback, setQuestionFeedback] = useState<{[key: number]: {isCorrect: boolean; answered: boolean}}>({})
const [answeredCount, setAnsweredCount] = useState(0)
```

## Funções Principais

### handleChange
Quando pergunta MC é respondida:
1. Atualizar formData
2. Validar contra correctAnswers
3. Atualizar questionFeedback com {isCorrect, answered}
4. Atualizar answeredCount

### handleSubmit
- Enviar todos os formData para Supabase
- Mostrar página de sucesso

## Estilos/Componentes

- **Pergunta**: card com borda colorida (cinza, verde se correta, vermelho se errada)
- **Feedback**: emoji ✅/❌ + texto + resposta correta (se errada)
- **Slides**: cards em gradiente com conteúdo
- **Progresso**: barra com "X de 7 respondidas"
- **Botão**: gradiente verde, desabilitado enquanto loading

## Validação Antes de Deploy

1. ✅ Arquivo compila (sem erros TypeScript)
2. ✅ Página carrega sem erros
3. ✅ Dados pessoais renderizam
4. ✅ Pergunta 2 renderiza com opções
5. ✅ Ao selecionar resposta correta: ✅ aparece, resposta desabilita
6. ✅ Ao selecionar resposta errada: ❌ aparece, mostra resposta correta
7. ✅ Slides aparecem abaixo da pergunta
8. ✅ Progresso atualiza
9. ✅ Perguntas abertas renderizam
10. ✅ Botão envio funciona e salva em Supabase
11. ✅ Página de sucesso aparece após envio

## Arquivos a Mover/Reescrever

- `src/pages/TrainamentPublic.tsx` - REESCREVER COMPLETAMENTE

## Referência: Estrutura do Slide
```javascript
{
  id: 1,
  title: '🎯 Os 3 Pilares do Atendimento Empático',
  icon: '🎯',
  color: 'from-orange-500 to-orange-600',
  content: <div>...</div>,
}
```

Há 12 slides no total (IDs 1-12).
