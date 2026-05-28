import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { dbKpis } from '@/lib/db'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus,
  Users, UserX, UserSearch, BarChart3,
  BookOpen, Wind, Megaphone, DollarSign,
} from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type {
  JobOpening, Candidate, OffboardingProcess,
  PerformanceCycle, PerformanceEvaluation,
  TrainingAction, ClimateSurvey, EndomarketingCampaign,
  SalaryGrade,
} from '@/types'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function KpiCard({
  label, value, unit, icon: Icon, color = 'blue', trend, trendLabel, description,
}: {
  label: string; value: string | number; unit?: string; icon: React.ElementType;
  color?: string; trend?: 'up' | 'down' | 'neutral'; trendLabel?: string; description?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
  }
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={18} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-400'
            }`}>
              {trend === 'up' ? <TrendingUp size={13} /> : trend === 'down' ? <TrendingDown size={13} /> : <Minus size={13} />}
              {trendLabel}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-800">
          {value}{unit && <span className="text-base font-medium text-slate-400 ml-1">{unit}</span>}
        </p>
        <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

export default function KPIs() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [offboarding, setOffboarding] = useState<OffboardingProcess[]>([])
  const [perfCycles, setPerfCycles] = useState<PerformanceCycle[]>([])
  const [perfEvals, setPerfEvals] = useState<PerformanceEvaluation[]>([])
  const [trainings, setTrainings] = useState<TrainingAction[]>([])
  const [surveys, setSurveys] = useState<ClimateSurvey[]>([])
  const [campaigns, setCampaigns] = useState<EndomarketingCampaign[]>([])
  const [salaryGrades, setSalaryGrades] = useState<SalaryGrade[]>([])

  useEffect(() => {
    dbKpis.fetchAll().then(data => {
      setJobs(data.jobOpenings)
      setCandidates(data.candidates)
      setOffboarding(data.offboarding)
      setPerfCycles(data.cycles)
      setPerfEvals(data.evaluations)
      setTrainings(data.trainings)
      setSurveys(data.surveys)
      setCampaigns(data.campaigns)
      setSalaryGrades(data.grades)
      setLoading(false)
    })
  }, [])

  // ── Recrutamento ─────────────────────────────────────────────────────────
  const totalVagas = jobs.length
  const vagasAbertas = jobs.filter(j => j.status === 'aberta').length
  const contratados = candidates.filter(c => c.stage === 'contratado').length
  const taxaConversao = candidates.length > 0
    ? Math.round((contratados / candidates.length) * 100)
    : 0

  // Candidatos por etapa do funil
  const funilData = [
    { name: 'Inscritos', value: candidates.filter(c => c.stage === 'inscrito').length },
    { name: 'Triagem', value: candidates.filter(c => c.stage === 'triagem').length },
    { name: 'Entrev. RH', value: candidates.filter(c => c.stage === 'entrevista_rh').length },
    { name: 'Entrev. Téc.', value: candidates.filter(c => c.stage === 'entrevista_tecnica').length },
    { name: 'Aprovados', value: candidates.filter(c => c.stage === 'aprovado').length },
    { name: 'Contratados', value: contratados },
  ].filter(d => d.value > 0)

  // ── Desligamento ──────────────────────────────────────────────────────────
  const totalDeslig = offboarding.length
  const desligVoluntario = offboarding.filter(p => p.reason === 'voluntario').length
  const desligInvoluntario = offboarding.filter(p => p.reason === 'involuntario').length
  const entrevistasDone = offboarding.filter(p => p.exit_interview_done).length
  const taxaEntrevistaDeslig = totalDeslig > 0
    ? Math.round((entrevistasDone / totalDeslig) * 100)
    : 0

  const desligPieData = [
    { name: 'Voluntário', value: desligVoluntario },
    { name: 'Involuntário', value: desligInvoluntario },
    { name: 'Aposentadoria', value: offboarding.filter(p => p.reason === 'aposentadoria').length },
    { name: 'Fim contrato', value: offboarding.filter(p => p.reason === 'fim_contrato').length },
  ].filter(d => d.value > 0)

  // ── Desempenho ─────────────────────────────────────────────────────────────
  const totalEvals = perfEvals.length
  const evalsConcluidas = perfEvals.filter(e => e.status === 'concluido').length
  const mediaDesempenho = totalEvals > 0
    ? (perfEvals.reduce((a, e) => a + e.final_score, 0) / totalEvals).toFixed(1)
    : '—'

  // Distribuição de notas
  const notasDist = [
    { label: 'Excepcional (≥4.5)', range: [4.5, 5], color: '#10b981' },
    { label: 'Acima esperado (3.5–4.4)', range: [3.5, 4.5], color: '#3b82f6' },
    { label: 'Dentro esperado (2.5–3.4)', range: [2.5, 3.5], color: '#f59e0b' },
    { label: 'Abaixo esperado (1.5–2.4)', range: [1.5, 2.5], color: '#ef4444' },
    { label: 'Insatisfatório (<1.5)', range: [0, 1.5], color: '#64748b' },
  ]

  const distData = notasDist.map(n => ({
    name: n.label.split(' (')[0],
    value: perfEvals.filter(e => e.final_score >= n.range[0] && e.final_score < n.range[1]).length,
    color: n.color,
  })).filter(d => d.value > 0)

  // ── Treinamento ────────────────────────────────────────────────────────────
  const totalTrein = trainings.length
  const treinConcluidos = trainings.filter(t => t.status === 'concluido').length
  const totalHoras = trainings.reduce((a, t) => a + t.duration_hours, 0)
  const totalInvest = trainings.reduce((a, t) => a + t.cost_per_person * t.participants_count, 0)
  const taxaConclTrein = totalTrein > 0
    ? Math.round((treinConcluidos / totalTrein) * 100)
    : 0

  // Treinamentos por modalidade
  const modalData = ['presencial', 'online', 'hibrido', 'on_the_job'].map(mod => ({
    name: { presencial: 'Presencial', online: 'Online', hibrido: 'Híbrido', on_the_job: 'On the Job' }[mod]!,
    value: trainings.filter(t => t.modality === mod).length,
  })).filter(d => d.value > 0)

  // ── Clima ─────────────────────────────────────────────────────────────────
  const totalSurveys = surveys.length
  const surveysAtivos = surveys.filter(s => s.status === 'ativo').length
  const totalRespostas = surveys.reduce((a, s) => a + s.responses_count, 0)

  // ── Endomarketing ─────────────────────────────────────────────────────────
  const totalCamp = campaigns.length
  const campAtivas = campaigns.filter(c => c.status === 'ativa').length

  const campByType = ['comunicado', 'celebracao', 'reconhecimento', 'campanha', 'evento'].map(t => ({
    name: { comunicado: 'Comunicado', celebracao: 'Celebração', reconhecimento: 'Reconhecimento', campanha: 'Campanha', evento: 'Evento' }[t]!,
    value: campaigns.filter(c => c.type === t).length,
  })).filter(d => d.value > 0)

  // ── Cargos e Salários ──────────────────────────────────────────────────────
  const salaryBarData = salaryGrades
    .sort((a, b) => a.min_salary - b.min_salary)
    .map(g => ({
      name: g.grade,
      min: g.min_salary,
      mid: g.mid_salary,
      max: g.max_salary,
    }))

  const hasNoData = !totalVagas && !totalDeslig && !totalEvals && !totalTrein && !totalSurveys

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  if (hasNoData) {
    return (
      <div className="max-w-4xl">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <TrendingUp size={48} className="text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Nenhum dado disponível ainda</h3>
          <p className="text-blue-600 text-sm max-w-md mx-auto">
            Os KPIs são calculados automaticamente conforme você preenche os módulos do sistema.
            Comece cadastrando vagas, avaliações, treinamentos e pesquisas de clima.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl">

      {/* ── Recrutamento & Seleção ─────────────────────────────────────────── */}
      {(totalVagas > 0 || candidates.length > 0) && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserSearch size={14} /> Recrutamento & Seleção
          </h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <KpiCard label="Vagas abertas" value={vagasAbertas} icon={UserSearch} color="blue" description={`${totalVagas} total`} />
            <KpiCard label="Candidatos" value={candidates.length} icon={Users} color="purple" />
            <KpiCard label="Contratados" value={contratados} icon={Users} color="green" />
            <KpiCard label="Taxa de conversão" value={taxaConversao} unit="%" icon={TrendingUp} color="yellow"
              trend={taxaConversao > 10 ? 'up' : taxaConversao > 5 ? 'neutral' : 'down'}
              description="Inscritos → Contratados"
            />
          </div>
          {funilData.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Funil de Seleção</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={funilData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Candidatos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* ── Desligamento ──────────────────────────────────────────────────── */}
      {totalDeslig > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserX size={14} /> Gestão de Desligamento
          </h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <KpiCard label="Total desligamentos" value={totalDeslig} icon={UserX} color="red" />
            <KpiCard label="Voluntários" value={desligVoluntario} icon={UserX} color="yellow"
              description={totalDeslig > 0 ? `${Math.round((desligVoluntario / totalDeslig) * 100)}% do total` : ''}
            />
            <KpiCard label="Involuntários" value={desligInvoluntario} icon={UserX} color="red"
              description={totalDeslig > 0 ? `${Math.round((desligInvoluntario / totalDeslig) * 100)}% do total` : ''}
            />
            <KpiCard label="Taxa entrevista deslig." value={taxaEntrevistaDeslig} unit="%" icon={BarChart3} color="green"
              trend={taxaEntrevistaDeslig === 100 ? 'up' : taxaEntrevistaDeslig > 60 ? 'neutral' : 'down'}
            />
          </div>
          {desligPieData.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Motivos de Desligamento</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center gap-8">
                <PieChart width={200} height={200}>
                  <Pie data={desligPieData} cx={95} cy={95} innerRadius={50} outerRadius={80} dataKey="value">
                    {desligPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <div className="space-y-2">
                  {desligPieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-700">{d.name}</span>
                      <span className="font-bold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* ── Avaliação de Desempenho ────────────────────────────────────────── */}
      {totalEvals > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 size={14} /> Avaliação de Desempenho
          </h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <KpiCard label="Avaliações realizadas" value={totalEvals} icon={BarChart3} color="blue" />
            <KpiCard label="Concluídas" value={evalsConcluidas} icon={BarChart3} color="green"
              description={`${totalEvals > 0 ? Math.round((evalsConcluidas / totalEvals) * 100) : 0}% do total`}
            />
            <KpiCard label="Média de desempenho" value={mediaDesempenho} unit="/5" icon={TrendingUp} color="yellow"
              trend={Number(mediaDesempenho) >= 3.5 ? 'up' : Number(mediaDesempenho) >= 2.5 ? 'neutral' : 'down'}
            />
            <KpiCard label="Ciclos ativos" value={perfCycles.filter(c => c.status === 'em_andamento').length} icon={BarChart3} color="purple" />
          </div>
          {distData.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Distribuição de Desempenho</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={distData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Colaboradores" radius={[4, 4, 0, 0]}>
                      {distData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* ── Treinamento ────────────────────────────────────────────────────── */}
      {totalTrein > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen size={14} /> Plano de Treinamento
          </h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <KpiCard label="Ações planejadas" value={totalTrein} icon={BookOpen} color="yellow" />
            <KpiCard label="Horas de treinamento" value={totalHoras} unit="h" icon={BookOpen} color="blue" />
            <KpiCard label="Taxa de conclusão" value={taxaConclTrein} unit="%" icon={TrendingUp} color="green"
              trend={taxaConclTrein > 70 ? 'up' : taxaConclTrein > 40 ? 'neutral' : 'down'}
            />
            <KpiCard label="Investimento total" value={formatCurrency(totalInvest)} icon={DollarSign} color="purple" />
          </div>
          {modalData.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Treinamentos por Modalidade</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={modalData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" name="Treinamentos" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* ── Pesquisa de Clima ──────────────────────────────────────────────── */}
      {totalSurveys > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wind size={14} /> Pesquisa de Clima
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <KpiCard label="Pesquisas realizadas" value={totalSurveys} icon={Wind} color="blue" />
            <KpiCard label="Pesquisas ativas" value={surveysAtivos} icon={Wind} color="green" />
            <KpiCard label="Total de respostas" value={totalRespostas} icon={Users} color="purple" />
          </div>
        </section>
      )}

      {/* ── Endomarketing ─────────────────────────────────────────────────── */}
      {totalCamp > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Megaphone size={14} /> Endomarketing
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <KpiCard label="Ações de comunicação" value={totalCamp} icon={Megaphone} color="pink" />
            <KpiCard label="Ações ativas" value={campAtivas} icon={Megaphone} color="green" />
            <KpiCard label="Encerradas" value={campaigns.filter(c => c.status === 'encerrada').length} icon={Megaphone} color="blue" />
          </div>
          {campByType.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Ações por Tipo</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={campByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Ações" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* ── Cargos e Salários ─────────────────────────────────────────────── */}
      {salaryGrades.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign size={14} /> Cargos & Salários
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <KpiCard label="Faixas salariais" value={salaryGrades.length} icon={DollarSign} color="green" />
            <KpiCard label="Menor salário mínimo" value={formatCurrency(Math.min(...salaryGrades.map(g => g.min_salary)))} icon={DollarSign} color="blue" />
            <KpiCard label="Maior salário máximo" value={formatCurrency(Math.max(...salaryGrades.map(g => g.max_salary)))} icon={DollarSign} color="purple" />
          </div>
          {salaryBarData.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Faixas Salariais — Mín / Referência / Máx</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salaryBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                    <Bar dataKey="min" name="Mínimo" fill="#bfdbfe" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="mid" name="Referência" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="max" name="Máximo" fill="#1d4ed8" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  )
}
