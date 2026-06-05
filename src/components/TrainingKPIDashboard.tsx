import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, FileText, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

interface Response {
  id: string
  collaborator_name: string
  collaborator_email: string
  question_2_response?: string
  question_3_response?: string
  question_4_response?: string
  question_5_response?: string
  question_6_response?: string
  question_7_response?: string
  question_8_response?: string
  question_9_response?: string
  question_10_response?: string
  question_11_response?: string
  question_13_response?: string
  question_14_response?: string
  created_at: string
}

const CORRECT_ANSWERS: {[key: number]: string} = {
  2: 'A) O medicamento não está disponível, mais temos outros que você pode usar.',
  3: 'A) Vou estar consultando seu histórico e já retorno com a informação.',
  4: 'A) Vou estar verificando o status e retorno para você.',
  7: 'B) Clareza e objetividade',
  9: 'B) Favor enviar o documento para análise.',
  11: 'B) Demonstrar compreensão e buscar uma solução',
  13: 'B) Em toda conversa',
}

const QUESTION_CATEGORIES: {[key: number]: string} = {
  2: 'Português',
  3: 'Português',
  4: 'Português',
  7: 'Comunicação',
  9: 'Comunicação',
  11: 'Empatia',
  13: 'Empatia',
}

interface KPIData {
  avgScore: number
  totalParticipants: number
  approved: number
  disapproved: number
  approvalRate: number
  categoryScores: {[key: string]: {correct: number, total: number}}
  personScores: Array<{name: string, email: string, score: number, passed: boolean}>
  scoreDistribution: Array<{range: string, count: number}>
}

const MIN_APPROVAL = 70
const TARGET_RATE = 80

export function TrainingKPIDashboard({ trainingId }: {trainingId?: string}) {
  const [responses, setResponses] = useState<Response[]>([])
  const [kpiData, setKPIData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResponses()
  }, [trainingId])

  async function loadResponses() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('rh_training_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setResponses(data || [])
      calculateKPIs(data || [])
    } catch (err) {
      console.error('Erro ao carregar respostas:', err)
    } finally {
      setLoading(false)
    }
  }

  function calculateKPIs(data: Response[]) {
    if (data.length === 0) {
      setKPIData(null)
      return
    }

    const categoryScores: {[key: string]: {correct: number, total: number}} = {
      'Português': {correct: 0, total: 0},
      'Comunicação': {correct: 0, total: 0},
      'Empatia': {correct: 0, total: 0},
    }

    const personScores = data.map(response => {
      let correctCount = 0
      const mcQuestions = [2, 3, 4, 7, 9, 11, 13]

      mcQuestions.forEach(qNum => {
        const key = `question_${qNum}_response` as keyof Response
        const userAnswer = response[key]
        if (userAnswer === CORRECT_ANSWERS[qNum]) {
          correctCount++
          const category = QUESTION_CATEGORIES[qNum]
          categoryScores[category].correct++
        }
        categoryScores[QUESTION_CATEGORIES[qNum]].total++
      })

      const score = (correctCount / mcQuestions.length) * 100
      return {
        name: response.collaborator_name,
        email: response.collaborator_email,
        score: Math.round(score),
        passed: score >= MIN_APPROVAL
      }
    })

    const approved = personScores.filter(p => p.passed).length
    const avgScore = Math.round(personScores.reduce((sum, p) => sum + p.score, 0) / personScores.length)
    const approvalRate = Math.round((approved / personScores.length) * 100)

    // Distribuição de notas
    const scoreDistribution = [
      {range: '0-40', count: personScores.filter(p => p.score < 50).length},
      {range: '50-70', count: personScores.filter(p => p.score >= 50 && p.score < 70).length},
      {range: '70-85', count: personScores.filter(p => p.score >= 70 && p.score < 85).length},
      {range: '85-100', count: personScores.filter(p => p.score >= 85).length},
    ]

    setKPIData({
      avgScore,
      totalParticipants: personScores.length,
      approved,
      disapproved: personScores.length - approved,
      approvalRate,
      categoryScores,
      personScores: personScores.sort((a, b) => b.score - a.score),
      scoreDistribution
    })
  }

  function getFeedbackAutomatico() {
    if (!kpiData) return []

    const feedback = []

    if (kpiData.approvalRate < TARGET_RATE) {
      feedback.push({
        level: 'critical',
        message: `Taxa de aprovação (${kpiData.approvalRate}%) abaixo da meta (${TARGET_RATE}%)`
      })
    }

    Object.entries(kpiData.categoryScores).forEach(([category, scores]) => {
      const categoryRate = Math.round((scores.correct / scores.total) * 100)
      if (categoryRate < 70) {
        feedback.push({
          level: 'warning',
          message: `${category}: ${categoryRate}% - Priorizar treino nessa competência`
        })
      }
    })

    if (kpiData.disapproved > 0) {
      feedback.push({
        level: 'info',
        message: `${kpiData.disapproved} pessoa(s) abaixo de ${MIN_APPROVAL}% - Considerar reteste`
      })
    }

    return feedback
  }

  function exportPDF() {
    if (!kpiData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let yPosition = 15

    // ===== PÁGINA 1: RESUMO =====

    // Cabeçalho
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text('RELATORIO DE KPIs - TREINAMENTO', pageWidth / 2, yPosition, {align: 'center'})
    yPosition += 12

    // Data
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition)
    yPosition += 8
    doc.setTextColor(0, 0, 0)

    // Linha separadora
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // Resumo Executivo - Cards
    doc.setFontSize(13)
    doc.setFont(undefined, 'bold')
    doc.text('RESUMO EXECUTIVO', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    // Card 1
    doc.setFillColor(230, 245, 255)
    doc.rect(margin, yPosition, 40, 18, 'F')
    doc.setFont(undefined, 'bold')
    doc.text(`${kpiData.avgScore}%`, margin + 5, yPosition + 8)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    doc.text('Media Geral', margin + 5, yPosition + 15)

    // Card 2
    const statusColor = kpiData.approvalRate >= TARGET_RATE ? [200, 255, 200] : [255, 200, 200]
    doc.setFillColor(...statusColor)
    doc.rect(margin + 50, yPosition, 40, 18, 'F')
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(`${kpiData.approvalRate}%`, margin + 55, yPosition + 8)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    doc.text('Taxa Aprovacao', margin + 55, yPosition + 15)

    // Card 3
    doc.setFillColor(230, 230, 255)
    doc.rect(margin + 100, yPosition, 40, 18, 'F')
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(`${kpiData.approved}/${kpiData.totalParticipants}`, margin + 105, yPosition + 8)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    doc.text('Aprovados', margin + 105, yPosition + 15)

    yPosition += 28

    // Performance por Competência
    doc.setFontSize(13)
    doc.setFont(undefined, 'bold')
    doc.text('PERFORMANCE POR COMPETENCIA', margin, yPosition)
    yPosition += 10

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    Object.entries(kpiData.categoryScores).forEach(([category, scores]) => {
      const rate = Math.round((scores.correct / scores.total) * 100)
      doc.text(`${category}:`, margin + 5, yPosition)
      doc.text(`${rate}%`, margin + 60, yPosition)

      // Barra de progresso simples
      const barWidth = (rate / 100) * 30
      doc.setDrawColor(150, 150, 150)
      doc.rect(margin + 70, yPosition - 2, 30, 3)
      const barColor = rate >= 70 ? [50, 200, 50] : [255, 150, 0]
      doc.setFillColor(...barColor)
      doc.rect(margin + 70, yPosition - 2, barWidth, 3, 'F')

      yPosition += 7
    })

    yPosition += 8

    // Feedback/Recomendações
    const feedback = getFeedbackAutomatico()
    if (feedback.length > 0) {
      doc.setFontSize(13)
      doc.setFont(undefined, 'bold')
      doc.text('RECOMENDACOES', margin, yPosition)
      yPosition += 8

      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      feedback.forEach(item => {
        const prefix = item.level === 'critical' ? '[CRITICO]' : item.level === 'warning' ? '[AVISO]' : '[INFO]'
        doc.text(`${prefix} ${item.message}`, margin + 5, yPosition)
        yPosition += 6
      })
    }

    yPosition += 8

    // ===== PÁGINA 2: TABELA INDIVIDUAL =====
    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = 15
    }

    doc.setFontSize(13)
    doc.setFont(undefined, 'bold')
    doc.text('DESEMPENHO INDIVIDUAL', margin, yPosition)
    yPosition += 10

    // Cabeçalho da tabela
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.setFillColor(230, 150, 20)
    doc.setTextColor(255, 255, 255)
    doc.rect(margin, yPosition - 5, pageWidth - 2*margin, 6, 'F')
    doc.text('Nome', margin + 3, yPosition)
    doc.text('Email', margin + 70, yPosition)
    doc.text('Nota', margin + 130, yPosition)
    doc.text('Status', margin + 160, yPosition)
    yPosition += 8

    // Dados
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(8)

    kpiData.personScores.forEach((person, idx) => {
      if (yPosition > pageHeight - 10) {
        doc.addPage()
        yPosition = 15
      }

      // Cor alternada
      if (idx % 2 === 0) {
        doc.setFillColor(245, 245, 245)
        doc.rect(margin, yPosition - 4, pageWidth - 2*margin, 5, 'F')
      }

      doc.text(person.name.substring(0, 25), margin + 3, yPosition)
      doc.text(person.email.substring(0, 35), margin + 70, yPosition)
      doc.text(`${person.score}%`, margin + 130, yPosition)
      doc.text(person.passed ? 'APROVADO' : 'REPROVADO', margin + 160, yPosition)

      yPosition += 6
    })

    doc.save('relatorio-kpis-treinamento.pdf')
  }

  function exportExcel() {
    if (!kpiData) return

    const wsData = [
      ['RELATÓRIO DE KPIs - TREINAMENTO'],
      [],
      ['RESUMO EXECUTIVO'],
      ['Métrica', 'Valor'],
      ['Média Geral', `${kpiData.avgScore}%`],
      ['Total Participantes', kpiData.totalParticipants],
      ['Aprovados', `${kpiData.approved} (${kpiData.approvalRate}%)`],
      ['Reprovados', kpiData.disapproved],
      ['Meta Atingida?', kpiData.approvalRate >= TARGET_RATE ? 'SIM ✅' : 'NÃO ❌'],
      [],
      ['PERFORMANCE POR COMPETÊNCIA'],
      ['Competência', 'Taxa de Acerto'],
      ...Object.entries(kpiData.categoryScores).map(([cat, scores]) => [
        cat,
        `${Math.round((scores.correct / scores.total) * 100)}%`
      ]),
      [],
      ['DESEMPENHO INDIVIDUAL'],
      ['Nome', 'Email', 'Nota (%)', 'Status'],
      ...kpiData.personScores.map(p => [
        p.name,
        p.email,
        `${p.score}%`,
        p.passed ? 'APROVADO ✅' : 'REPROVADO ❌'
      ])
    ]

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'KPIs')
    XLSX.writeFile(wb, 'relatorio-kpis-treinamento.xlsx')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </CardContent>
      </Card>
    )
  }

  if (!kpiData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Nenhuma resposta ainda</p>
        </CardContent>
      </Card>
    )
  }

  const feedback = getFeedbackAutomatico()

  return (
    <div className="space-y-6">
      {/* RESUMO EXECUTIVO */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-900">{kpiData.avgScore}%</p>
              <p className="text-sm text-blue-700 mt-1">Média Geral</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${kpiData.approvalRate >= TARGET_RATE ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'}`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className={`text-3xl font-bold ${kpiData.approvalRate >= TARGET_RATE ? 'text-green-900' : 'text-red-900'}`}>{kpiData.approvalRate}%</p>
              <p className={`text-sm mt-1 ${kpiData.approvalRate >= TARGET_RATE ? 'text-green-700' : 'text-red-700'}`}>Taxa de Aprovação</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-900">{kpiData.approved}/{kpiData.totalParticipants}</p>
              <p className="text-sm text-purple-700 mt-1">Aprovados</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${kpiData.approvalRate >= TARGET_RATE ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-yellow-50 to-yellow-100 border-yellow-200'}`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className={`text-3xl font-bold ${kpiData.approvalRate >= TARGET_RATE ? 'text-emerald-900' : 'text-yellow-900'}`}>🎯</p>
              <p className={`text-sm mt-1 ${kpiData.approvalRate >= TARGET_RATE ? 'text-emerald-700' : 'text-yellow-700'}`}>Meta {TARGET_RATE}% ${kpiData.approvalRate >= TARGET_RATE ? '✅' : '❌'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-2 gap-4">
        {/* Distribuição de Notas */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Distribuição de Notas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance por Competência */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Taxa de Acerto por Competência</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(kpiData.categoryScores).map(([cat, scores]) => ({
                name: cat,
                rate: Math.round((scores.correct / scores.total) * 100)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="rate" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* FEEDBACK AUTOMÁTICO */}
      {feedback.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold text-gray-900 mb-4">🎯 Feedback Automático e Recomendações</h3>
            <div className="space-y-3">
              {feedback.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-l-4 ${
                  item.level === 'critical' ? 'bg-red-50 border-red-500' :
                  item.level === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <p className={`text-sm font-medium ${
                    item.level === 'critical' ? 'text-red-900' :
                    item.level === 'warning' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {item.level === 'critical' && '🔴'} {item.level === 'warning' && '🟡'} {item.level === 'info' && '🔵'} {item.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TABELA DE PESSOAS */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-bold text-gray-900 mb-4">Desempenho Individual</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-center">Nota</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.personScores.map((person, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{person.name}</td>
                    <td className="px-4 py-2 text-gray-600">{person.email}</td>
                    <td className="px-4 py-2 text-center font-bold text-orange-600">{person.score}%</td>
                    <td className="px-4 py-2 text-center">
                      {person.passed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          <CheckCircle size={14} /> Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          <AlertCircle size={14} /> Reprovado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* BOTÕES EXPORT */}
      <div className="flex gap-3 justify-end">
        <Button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <FileText size={18} /> Exportar PDF
        </Button>
        <Button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Download size={18} /> Exportar Excel
        </Button>
      </div>
    </div>
  )
}
