import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, Award } from 'lucide-react'

interface TrainingResponse {
  id: string
  collaborator_name: string
  question_2_response?: string
  question_3_response?: string
  question_4_response?: string
  question_7_response?: string
  question_9_response?: string
  question_11_response?: string
  question_13_response?: string
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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6']

function KpiCard({
  label, value, unit, icon: Icon, color = 'blue',
}: {
  label: string; value: string | number; unit?: string; icon: React.ElementType; color?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={18} />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-800">
          {value}{unit && <span className="text-base font-medium text-slate-400 ml-1">{unit}</span>}
        </p>
        <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  )
}

export function TrainingKPISummary() {
  const [loading, setLoading] = useState(true)
  const [avgScore, setAvgScore] = useState(0)
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [approvalRate, setApprovalRate] = useState(0)
  const [categoryData, setCategoryData] = useState<Array<{name: string, value: number}>>([])

  useEffect(() => {
    loadTrainingData()
  }, [])

  async function loadTrainingData() {
    try {
      const { data, error } = await supabase
        .from('rh_training_responses')
        .select('*')

      if (error) throw error

      const responses = (data || []) as TrainingResponse[]

      if (responses.length === 0) {
        setLoading(false)
        return
      }

      const categoryScores: {[key: string]: {correct: number, total: number}} = {
        'Português': {correct: 0, total: 0},
        'Comunicação': {correct: 0, total: 0},
        'Empatia': {correct: 0, total: 0},
      }

      let totalCorrect = 0
      const mcQuestions = [2, 3, 4, 7, 9, 11, 13]

      responses.forEach(response => {
        mcQuestions.forEach(qNum => {
          const key = `question_${qNum}_response` as keyof TrainingResponse
          const userAnswer = response[key]
          if (userAnswer === CORRECT_ANSWERS[qNum]) {
            totalCorrect++
            const category = QUESTION_CATEGORIES[qNum]
            categoryScores[category].correct++
          }
          categoryScores[QUESTION_CATEGORIES[qNum]].total++
        })
      })

      const avg = Math.round((totalCorrect / (responses.length * mcQuestions.length)) * 100)
      const approval = Math.round(((totalCorrect / (responses.length * mcQuestions.length)) >= 0.7 ? responses.length : Math.floor(responses.length * (totalCorrect / (responses.length * mcQuestions.length)))) / responses.length * 100)

      setAvgScore(avg)
      setTotalParticipants(responses.length)
      setApprovalRate(approval)

      const catData = Object.entries(categoryScores).map(([cat, scores]) => ({
        name: cat,
        value: Math.round((scores.correct / scores.total) * 100)
      }))
      setCategoryData(catData)
      setLoading(false)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setLoading(false)
    }
  }

  if (loading || totalParticipants === 0) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Award size={14} /> KPIs de Treinamento - Atendimento Empático
      </h2>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <KpiCard label="Participantes" value={totalParticipants} icon={Users} color="blue" />
        <KpiCard label="Média Geral" value={avgScore} unit="%" icon={TrendingUp} color="green" />
        <KpiCard label="Taxa Aprovação (≥70%)" value={approvalRate} unit="%" icon={Target} color="purple" />
        <KpiCard label="Status Meta (80%)" value={approvalRate >= 80 ? '✅ ATINGIDA' : '⚠️ AGUARDANDO'} icon={Award} color={approvalRate >= 80 ? 'green' : 'blue'} />
      </div>
      {categoryData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Taxa de Acerto por Competência</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="%" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
