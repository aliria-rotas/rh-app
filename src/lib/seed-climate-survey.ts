import { generateId } from './storage'
import { ClimateSurvey } from '@/types'

export function createLikertClimateSurvey(): ClimateSurvey {
  return {
    id: generateId(),
    title: 'Pesquisa de Clima Organizacional - Likert',
    description: 'Pesquisa de clima com escala Likert por setor: Licitações, Farmácia e Financeiro',
    status: 'rascunho',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    responses_count: 0,
    created_at: new Date().toISOString(),
    questions: [
      // Liderança
      {
        id: generateId(),
        text: 'Meu gestor fornece feedback claro sobre meu desempenho',
        category: 'lideranca',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
      {
        id: generateId(),
        text: 'Sinto-me motivado(a) pelas ações do meu gestor',
        category: 'lideranca',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
      {
        id: generateId(),
        text: 'Meu gestor é acessível e aberto ao diálogo',
        category: 'lideranca',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },

      // Comunicação
      {
        id: generateId(),
        text: 'A comunicação interna é clara e transparente',
        category: 'comunicacao',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
      {
        id: generateId(),
        text: 'Tenho informações suficientes sobre decisões que me afetam',
        category: 'comunicacao',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },

      // Ambiente de Trabalho
      {
        id: generateId(),
        text: 'Estou satisfeito(a) com as condições físicas do meu ambiente de trabalho',
        category: 'ambiente',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
      {
        id: generateId(),
        text: 'O ambiente de trabalho é saudável e seguro',
        category: 'ambiente',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },

      // Desenvolvimento
      {
        id: generateId(),
        text: 'Tenho oportunidades claras de desenvolvimento profissional',
        category: 'desenvolvimento',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
      {
        id: generateId(),
        text: 'A empresa investe em meu treinamento e desenvolvimento',
        category: 'desenvolvimento',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },

      // Reconhecimento
      {
        id: generateId(),
        text: 'Meu trabalho é reconhecido e valorizado',
        category: 'reconhecimento',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
      {
        id: generateId(),
        text: 'Recebo reconhecimento adequado por minhas contribuições',
        category: 'reconhecimento',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },

      // Benefícios
      {
        id: generateId(),
        text: 'Os benefícios oferecidos são adequados',
        category: 'beneficios',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
      {
        id: generateId(),
        text: 'Estou satisfeito(a) com a remuneração oferecida',
        category: 'beneficios',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },

      // Cultura
      {
        id: generateId(),
        text: 'Tenho orgulho em trabalhar nesta empresa',
        category: 'cultura',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },

      // Diversidade & Inclusão
      {
        id: generateId(),
        text: 'Sinto-me incluído(a) e respeitado(a) na empresa',
        category: 'diversidade',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
      {
        id: generateId(),
        text: 'Existe respeito à diversidade no ambiente de trabalho',
        category: 'diversidade',
        type: 'escala',
        options: ['1 - Discordo totalmente', '2 - Discordo', '3 - Neutro', '4 - Concordo', '5 - Concordo totalmente'],
      },
    ],
  }
}
