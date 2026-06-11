import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pt-BR')
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export const STATUS_COLORS: Record<string, string> = {
  ativo: 'bg-green-100 text-green-800',
  aberta: 'bg-green-100 text-green-800',
  ativa: 'bg-green-100 text-green-800',
  planejada: 'bg-blue-100 text-blue-800',
  planejado: 'bg-blue-100 text-blue-800',
  rascunho: 'bg-gray-100 text-gray-700',
  pendente: 'bg-yellow-100 text-yellow-800',
  em_andamento: 'bg-blue-100 text-blue-800',
  encerrado: 'bg-gray-100 text-gray-600',
  encerrada: 'bg-gray-100 text-gray-600',
  cancelada: 'bg-red-100 text-red-700',
  cancelado: 'bg-red-100 text-red-700',
  concluido: 'bg-green-100 text-green-800',
  aprovado: 'bg-green-100 text-green-800',
  reprovado: 'bg-red-100 text-red-700',
  contratado: 'bg-purple-100 text-purple-800',
  proposta: 'bg-orange-100 text-orange-800',
}

export const STATUS_LABELS: Record<string, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  encerrada: 'Encerrada',
  cancelada: 'Cancelada',
  ativo: 'Ativo',
  ativa: 'Ativa',
  rascunho: 'Rascunho',
  encerrado: 'Encerrado',
  pendente: 'Pendente',
  concluido: 'Concluído',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
  inscrito: 'Inscrito',
  triagem: 'Triagem',
  entrevista_rh: 'Entrevista RH',
  entrevista_tecnica: 'Entrevista Técnica',
  proposta: 'Proposta',
  contratado: 'Contratado',
  voluntario: 'Voluntário',
  involuntario: 'Involuntário',
  aposentadoria: 'Aposentadoria',
  fim_contrato: 'Fim de Contrato',
  comportamental: 'Comportamental',
  tecnica: 'Técnica',
  lideranca: 'Liderança',
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
  on_the_job: 'On the Job',
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
  lideranca_cargo: 'Liderança',
  direcao: 'Direção',
  comunicado: 'Comunicado',
  celebracao: 'Celebração',
  reconhecimento: 'Reconhecimento',
  campanha: 'Campanha',
  evento: 'Evento',
  planejada: 'Planejada',
  planejado: 'Planejado',
  cancelado: 'Cancelado',
}
