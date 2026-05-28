import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { dbEmployees } from '@/lib/db'
import type { Employee } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  Users, DollarSign, TrendingUp, ShieldCheck, Award,
  Building2, Briefcase, Calendar, BarChart3, ArrowUpRight, ArrowRightLeft,
  Star, Clock, FileText, RefreshCw, Calculator, ExternalLink
} from 'lucide-react'

// ─── Tipos e constantes ───────────────────────────────────────────────────────
type BenefitKey = 'health_plan' | 'dental_plan' | 'meal_voucher' | 'transport_voucher' | 'life_insurance'

// ─── Cálculo de Impostos (INSS e IR) ───────────────────────────────────────────
function calcINSS(salary: number): number {
  if (salary <= 1302) return salary * 0.0765
  if (salary <= 2571.29) return salary * 0.09
  if (salary <= 3856.94) return salary * 0.12
  if (salary <= 7507.49) return salary * 0.14
  return 7507.49 * 0.14 // teto
}

function calcIR(salary: number): number {
  const inss = calcINSS(salary)
  const base = salary - inss

  if (base <= 2259.20) return 0
  if (base <= 2826.65) return (base - 2259.20) * 0.075
  if (base <= 3751.05) return (base - 2826.65) * 0.15 + 42.54
  if (base <= 4664.68) return (base - 3751.05) * 0.225 + 184.29
  return (base - 4664.68) * 0.275 + 389.02
}

function calcFGTS(salary: number): number {
  return salary * 0.08 // 8% do salário bruto
}

const BENEFITS_INFO: { key: BenefitKey; name: string; emoji: string; colorText: string; colorBg: string }[] = [
  { key: 'health_plan',       name: 'Convênio Médico',         emoji: '🏥', colorText: 'text-blue-700',   colorBg: 'bg-blue-50'   },
  { key: 'dental_plan',       name: 'Convênio Odontológico',   emoji: '🦷', colorText: 'text-teal-700',   colorBg: 'bg-teal-50'   },
  { key: 'meal_voucher',      name: 'Vale Refeição',           emoji: '🍽️', colorText: 'text-orange-700', colorBg: 'bg-orange-50' },
  { key: 'transport_voucher', name: 'Vale Transporte',         emoji: '🚌', colorText: 'text-green-700',  colorBg: 'bg-green-50'  },
  { key: 'life_insurance',    name: 'Seguro de Vida em Grupo', emoji: '🛡️', colorText: 'text-purple-700', colorBg: 'bg-purple-50' },
]

const DEFAULT_COSTS: Record<BenefitKey, number> = {
  health_plan: 0, dental_plan: 0, meal_voucher: 0, transport_voucher: 0, life_insurance: 0,
}

const CONTRACT_LABELS: Record<string, string> = {
  clt: 'CLT', pj: 'PJ', estagio: 'Estágio', temporario: 'Temporário', autonomo: 'Autônomo',
}
const STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo', afastado: 'Afastado', ferias: 'Férias', inativo: 'Inativo',
}
const REASON_LABELS: Record<string, string> = {
  promocao: 'Promoção',
  transferencia: 'Transferência',
  readequacao_salarial: 'Readequação Salarial',
  ajuste_salarial: 'Ajuste Salarial',
  mudanca_contrato: 'Mudança de Contrato',
  outro: 'Outro',
}
const REASON_ICON: Record<string, React.ReactNode> = {
  promocao:            <ArrowUpRight size={13} className="text-green-600" />,
  transferencia:       <ArrowRightLeft size={13} className="text-blue-600" />,
  readequacao_salarial:<TrendingUp size={13} className="text-orange-600" />,
  ajuste_salarial:     <DollarSign size={13} className="text-yellow-600" />,
  mudanca_contrato:    <RefreshCw size={13} className="text-purple-600" />,
  outro:               <FileText size={13} className="text-slate-500" />,
}

function companyShort(cnpj: string) {
  if (cnpj === '47.848.127/0002-00') return 'Aliria SP'
  if (cnpj === '47.848.127/0001-29') return 'Aliria SC'
  if (cnpj === '58.348.779/0001-10') return 'Alicare'
  return cnpj || '—'
}

function tenureYears(hireDateStr: string): number {
  if (!hireDateStr) return 0
  const hire = new Date(hireDateStr)
  const now = new Date()
  return (now.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
}

function tenureBucket(years: number): string {
  if (years < 0.5) return '< 6 meses'
  if (years < 1)   return '6m – 1 ano'
  if (years < 2)   return '1 – 2 anos'
  if (years < 3)   return '2 – 3 anos'
  if (years < 5)   return '3 – 5 anos'
  return '5+ anos'
}

function loadLS<T>(key: string, def: T): T {
  try { const s = localStorage.getItem(key); return s ? { ...def, ...JSON.parse(s) } : def } catch { return def }
}

const TENURE_ORDER = ['< 6 meses', '6m – 1 ano', '1 – 2 anos', '2 – 3 anos', '3 – 5 anos', '5+ anos']

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-orange-500">{icon}</span>
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
    </div>
  )
}

function BarRow({ label, value, max, colorClass, suffix = '' }: {
  label: string; value: number; max: number; colorClass: string; suffix?: string
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-36 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-24 text-right flex-shrink-0">
        {suffix || value}
      </span>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color = 'text-slate-700' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <Card><CardContent className="py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-slate-300 mt-0.5">{icon}</span>
      </div>
    </CardContent></Card>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function Relatorios() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading]     = useState(true)
  const [costs]                   = useState<Record<BenefitKey, number>>(() => loadLS('aliria_benefit_costs', DEFAULT_COSTS))
  const [vrConfig]                = useState<{ daily_rate: number; working_days: number }>(() => loadLS('aliria_vr_config', { daily_rate: 37, working_days: 22 }))

  useEffect(() => {
    dbEmployees.list().then(data => { setEmployees(data); setLoading(false) })
  }, [])

  // ── Cálculos ─────────────────────────────────────────────────────────────
  const active = useMemo(() => employees.filter(e => e.status !== 'inativo'), [employees])

  // Folha de pagamento
  const totalPayroll = useMemo(() => active.reduce((s, e) => s + (e.salary || 0), 0), [active])
  const avgSalary    = useMemo(() => active.length ? totalPayroll / active.length : 0, [totalPayroll, active])
  const maxSalary    = useMemo(() => Math.max(...active.map(e => e.salary || 0), 0), [active])
  const minSalary    = useMemo(() => active.length ? Math.min(...active.filter(e => e.salary > 0).map(e => e.salary)) : 0, [active])

  // Por empresa
  const byCompany = useMemo(() => {
    const map: Record<string, { count: number; payroll: number }> = {}
    active.forEach(e => {
      const key = companyShort(e.company_cnpj)
      if (!map[key]) map[key] = { count: 0, payroll: 0 }
      map[key].count++
      map[key].payroll += e.salary || 0
    })
    return Object.entries(map).sort((a, b) => b[1].payroll - a[1].payroll)
  }, [active])

  // Por departamento
  const byDept = useMemo(() => {
    const map: Record<string, { count: number; payroll: number }> = {}
    active.forEach(e => {
      const key = e.department || 'Sem departamento'
      if (!map[key]) map[key] = { count: 0, payroll: 0 }
      map[key].count++
      map[key].payroll += e.salary || 0
    })
    return Object.entries(map).sort((a, b) => b[1].payroll - a[1].payroll)
  }, [active])

  const maxDeptPayroll = useMemo(() => Math.max(...byDept.map(([, v]) => v.payroll), 0), [byDept])

  // Por tipo de contrato
  const byContract = useMemo(() => {
    const map: Record<string, number> = {}
    active.forEach(e => { const k = e.contract_type || 'outro'; map[k] = (map[k] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [active])

  // Por status (todos os colaboradores)
  const byStatus = useMemo(() => {
    const map: Record<string, number> = {}
    employees.forEach(e => { map[e.status] = (map[e.status] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [employees])

  // Por gênero
  const byGender = useMemo(() => {
    const m = active.filter(e => e.gender === 'masculino').length
    const f = active.filter(e => e.gender === 'feminino').length
    const o = active.length - m - f
    return [
      { label: 'Feminino',   value: f },
      { label: 'Masculino',  value: m },
      ...(o > 0 ? [{ label: 'Outro/N.I.', value: o }] : []),
    ].filter(x => x.value > 0)
  }, [active])

  // Benefícios
  const benefitStats = useMemo(() => BENEFITS_INFO.map(b => {
    const enrolled = active.filter(e => !!(e as any)[b.key])
    // Convênio médico: soma custos individuais + dependentes
    // Vale Refeição: diária × dias úteis
    const monthly = b.key === 'health_plan'
      ? enrolled.reduce((s, e) => s + (e.health_plan_cost ?? 0) + (e.health_plan_dependents ?? []).reduce((sd, d) => sd + d.monthly_cost, 0), 0)
      : b.key === 'meal_voucher'
      ? enrolled.length * vrConfig.daily_rate * vrConfig.working_days
      : enrolled.length * costs[b.key]
    const pct = active.length ? Math.round((enrolled.length / active.length) * 100) : 0
    return { ...b, enrolled: enrolled.length, monthly, pct }
  }), [active, costs, vrConfig])

  const totalBenefitMonthly = useMemo(() => benefitStats.reduce((s, b) => s + b.monthly, 0), [benefitStats])
  const hasCosts            = totalBenefitMonthly > 0

  // Movimentações de carreira
  const allMovements = useMemo(() => {
    const arr: { date: string; employee: string; reason: string; position: string; salary: number }[] = []
    employees.forEach(e => {
      ;(e.position_history || []).forEach(h => {
        arr.push({ date: h.date, employee: e.full_name, reason: h.reason, position: h.position, salary: h.salary })
      })
    })
    return arr.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [employees])

  const movByReason = useMemo(() => {
    const map: Record<string, number> = {}
    allMovements.forEach(m => { map[m.reason] = (map[m.reason] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [allMovements])

  // Tempo de empresa
  const tenureBuckets = useMemo(() => {
    const map: Record<string, number> = {}
    TENURE_ORDER.forEach(b => { map[b] = 0 })
    active.forEach(e => { if (e.hire_date) { const b = tenureBucket(tenureYears(e.hire_date)); map[b]++ } })
    return TENURE_ORDER.map(b => ({ label: b, count: map[b] }))
  }, [active])

  const avgTenure = useMemo(() => {
    const all = active.filter(e => e.hire_date).map(e => tenureYears(e.hire_date))
    return all.length ? all.reduce((s, v) => s + v, 0) / all.length : 0
  }, [active])

  // Turnover (inativo no total)
  const turnoverPct = employees.length ? Math.round((employees.filter(e => e.status === 'inativo').length / employees.length) * 100) : 0

  // Cálculo de Impostos (INSS, IR e FGTS)
  const employeeTaxes = useMemo(() => {
    return active.map(e => {
      const salary = e.salary || 0
      const inss = calcINSS(salary)
      const ir = calcIR(salary)
      const fgts = calcFGTS(salary)
      return { employee: e.full_name, salary, inss, ir, fgts, total: inss + ir + fgts }
    })
  }, [active])

  const totalINSS = useMemo(() => employeeTaxes.reduce((s, e) => s + e.inss, 0), [employeeTaxes])
  const totalIR = useMemo(() => employeeTaxes.reduce((s, e) => s + e.ir, 0), [employeeTaxes])
  const totalFGTS = useMemo(() => employeeTaxes.reduce((s, e) => s + e.fgts, 0), [employeeTaxes])
  const totalTaxes = useMemo(() => totalINSS + totalIR + totalFGTS, [totalINSS, totalIR, totalFGTS])
  const avgINSS = useMemo(() => active.length ? totalINSS / active.length : 0, [totalINSS, active.length])
  const avgIR = useMemo(() => active.length ? totalIR / active.length : 0, [totalIR, active.length])
  const avgFGTS = useMemo(() => active.length ? totalFGTS / active.length : 0, [totalFGTS, active.length])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-b-orange-500 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">

      {/* ── KPIs principais ── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Users size={22}/>}       label="Colaboradores ativos"   value={active.length}              sub={`${employees.length} total cadastrados`}           color="text-slate-700" />
        <StatCard icon={<DollarSign size={22}/>}   label="Folha mensal total"     value={formatCurrency(totalPayroll)} sub={`Média ${formatCurrency(avgSalary)}`}             color="text-orange-600" />
        <StatCard icon={<ShieldCheck size={22}/>}  label="Custo benefícios / mês" value={hasCosts ? formatCurrency(totalBenefitMonthly) : '—'} sub={hasCosts ? `${formatCurrency((totalPayroll + totalBenefitMonthly))} custo total` : 'Configure em Benefícios'} color="text-blue-600" />
        <StatCard icon={<TrendingUp size={22}/>}   label="Movimentações de carreira" value={allMovements.length}    sub={`Tempo médio: ${avgTenure.toFixed(1)} anos`}        color="text-teal-600" />
      </div>

      {/* ── Grid 2 colunas ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Folha por empresa */}
        <Card>
          <CardContent className="py-5">
            <SectionTitle icon={<Building2 size={15}/>} title="Folha de Pagamento por Empresa" />
            <div className="space-y-3">
              {byCompany.map(([name, v]) => (
                <BarRow key={name} label={name}
                  value={v.payroll} max={totalPayroll}
                  colorClass="bg-orange-400"
                  suffix={`${formatCurrency(v.payroll)} · ${v.count} col.`}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Total mensal</span>
              <span className="font-bold text-slate-700">{formatCurrency(totalPayroll)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Folha por departamento */}
        <Card>
          <CardContent className="py-5">
            <SectionTitle icon={<Briefcase size={15}/>} title="Folha de Pagamento por Departamento" />
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {byDept.map(([name, v]) => (
                <BarRow key={name} label={name}
                  value={v.payroll} max={maxDeptPayroll}
                  colorClass="bg-blue-400"
                  suffix={`${formatCurrency(v.payroll)} · ${v.count}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Headcount */}
        <Card>
          <CardContent className="py-5">
            <SectionTitle icon={<Users size={15}/>} title="Headcount" />
            <div className="grid grid-cols-2 gap-6">
              {/* Por status */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Por Status</p>
                <div className="space-y-2">
                  {byStatus.map(([s, n]) => {
                    const colors: Record<string, string> = { ativo: 'bg-green-400', ferias: 'bg-blue-400', afastado: 'bg-yellow-400', inativo: 'bg-slate-300' }
                    return (
                      <BarRow key={s} label={STATUS_LABELS[s] || s}
                        value={n} max={employees.length}
                        colorClass={colors[s] || 'bg-slate-400'}
                        suffix={String(n)}
                      />
                    )
                  })}
                </div>
              </div>
              {/* Por gênero */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Por Gênero (ativos)</p>
                <div className="space-y-2">
                  {byGender.map(g => {
                    const colors: Record<string, string> = { Feminino: 'bg-pink-400', Masculino: 'bg-indigo-400', 'Outro/N.I.': 'bg-slate-400' }
                    const pct = active.length ? Math.round((g.value / active.length) * 100) : 0
                    return (
                      <BarRow key={g.label} label={g.label}
                        value={g.value} max={active.length}
                        colorClass={colors[g.label] || 'bg-slate-400'}
                        suffix={`${g.value} (${pct}%)`}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Por contrato */}
            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Por Tipo de Contrato</p>
              <div className="flex flex-wrap gap-2">
                {byContract.map(([c, n]) => (
                  <span key={c} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs font-medium text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                    {CONTRACT_LABELS[c] || c}: {n}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefícios */}
        <Card>
          <CardContent className="py-5">
            <SectionTitle icon={<ShieldCheck size={15}/>} title="Cobertura de Benefícios" />
            <div className="space-y-3">
              {benefitStats.map(b => (
                <div key={b.key} className="flex items-center gap-3">
                  <span className="text-base w-5 flex-shrink-0">{b.emoji}</span>
                  <span className="text-xs text-slate-600 flex-1 min-w-0 truncate">{b.name}</span>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                    <div className={`h-full rounded-full ${b.colorBg.replace('bg-', 'bg-').replace('-50', '-400')}`}
                         style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right flex-shrink-0">{b.pct}%</span>
                  <span className="text-xs font-semibold text-slate-700 w-8 text-right flex-shrink-0">{b.enrolled}</span>
                </div>
              ))}
            </div>
            {hasCosts && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custo Mensal por Benefício</p>
                <div className="space-y-2">
                  {benefitStats.filter(b => b.monthly > 0).map(b => (
                    <div key={b.key} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{b.emoji} {b.name}</span>
                      <span className={`font-semibold ${b.colorText}`}>{formatCurrency(b.monthly)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 font-semibold">
                    <span className="text-slate-700">Total mensal</span>
                    <span className="text-orange-600">{formatCurrency(totalBenefitMonthly)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total anual estimado</span>
                    <span className="text-slate-700 font-medium">{formatCurrency(totalBenefitMonthly * 12)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flash Calculator Preview */}
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="py-5">
            <div className="flex items-start justify-between">
              <div>
                <SectionTitle icon={<Calculator size={15}/>} title="Calculadora Flash" />
                <p className="text-xs text-slate-600 mb-4">Previsão detalhada de gastos com benefícios para o próximo mês, com descontos de home office e emendas de feriado.</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-orange-200 px-4 py-3">
              <p className="text-xs text-slate-500 mb-3">
                <span className="font-semibold">Próximas funcionalidades:</span> seleção de mês, marcação de emendas de feriado por colaborador, cálculo automático de custos com todos os descontos aplicados.
              </p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  const beneficiosLink = document.querySelector('a[href*="beneficios"]') as HTMLAnchorElement
                  if (beneficiosLink) beneficiosLink.click()
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors group"
              >
                Acessar Calculadora
                <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Impostos ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* INSS, IR e FGTS */}
        <Card>
          <CardContent className="py-5">
            <SectionTitle icon={<Calculator size={15}/>} title="Impostos - INSS, IR e FGTS" />
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 font-medium mb-1">INSS Total Mês</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(totalINSS)}</p>
                <p className="text-xs text-blue-500 mt-1">Média: {formatCurrency(avgINSS)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-700 font-medium mb-1">IR Total Mês</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(totalIR)}</p>
                <p className="text-xs text-purple-500 mt-1">Média: {formatCurrency(avgIR)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-green-700 font-medium mb-1">FGTS Total Mês</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalFGTS)}</p>
                <p className="text-xs text-green-500 mt-1">Média: {formatCurrency(avgFGTS)}</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 font-medium mb-1">Descontos Totais (INSS + IR + FGTS)</p>
              <p className="text-2xl font-bold text-slate-700">{formatCurrency(totalTaxes)}</p>
              <p className="text-xs text-slate-500 mt-2">
                % da folha: <span className="font-semibold text-slate-700">{totalPayroll ? ((totalTaxes / totalPayroll) * 100).toFixed(1) : '0'}%</span>
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-4 italic">INSS e IR baseados em tabelas de 2026 • FGTS 8% do salário bruto</p>
          </CardContent>
        </Card>

        {/* Detalhamento por funcionário */}
        <Card>
          <CardContent className="py-5">
            <SectionTitle icon={<FileText size={15}/>} title="Impostos por Funcionário" />
            <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
              {employeeTaxes.slice(0, 10).map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">{e.employee.split(' ').slice(0, 2).join(' ')}</p>
                    <p className="text-slate-500">{formatCurrency(e.salary)}</p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className="text-blue-600 font-medium">{formatCurrency(e.inss)}</p>
                    <p className="text-purple-600 font-medium">{formatCurrency(e.ir)}</p>
                    <p className="text-green-600 font-medium">{formatCurrency(e.fgts)}</p>
                  </div>
                </div>
              ))}
              {employeeTaxes.length > 10 && (
                <p className="text-xs text-slate-400 pt-2 text-center italic">
                  +{employeeTaxes.length - 10} colaboradores...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Segunda linha ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Tempo de empresa */}
        <Card>
          <CardContent className="py-5">
            <SectionTitle icon={<Clock size={15}/>} title="Distribuição de Tempo de Empresa" />
            <div className="flex items-center gap-3 mb-5 p-3 bg-orange-50 rounded-xl">
              <div>
                <p className="text-xs text-orange-700 font-medium">Tempo médio de casa</p>
                <p className="text-2xl font-bold text-orange-600">{avgTenure.toFixed(1)} <span className="text-sm font-normal">anos</span></p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-orange-700 font-medium">Turnover acumulado</p>
                <p className="text-2xl font-bold text-orange-600">{turnoverPct}%</p>
              </div>
            </div>
            <div className="space-y-3">
              {tenureBuckets.map(b => (
                <BarRow key={b.label} label={b.label}
                  value={b.count} max={Math.max(...tenureBuckets.map(x => x.count), 1)}
                  colorClass="bg-teal-400"
                  suffix={`${b.count} col.`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Movimentações de carreira */}
        <Card>
          <CardContent className="py-5">
            <SectionTitle icon={<Award size={15}/>} title="Movimentações de Carreira" />
            {allMovements.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhuma movimentação registrada.</p>
            ) : (
              <>
                {/* Por tipo */}
                <div className="space-y-2 mb-5">
                  {movByReason.map(([reason, count]) => (
                    <div key={reason} className="flex items-center gap-2.5">
                      {REASON_ICON[reason]}
                      <span className="text-xs text-slate-600 flex-1">{REASON_LABELS[reason] || reason}</span>
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: `${allMovements.length ? (count / allMovements.length) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>

                {/* Últimas movimentações */}
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Últimas movimentações</p>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {allMovements.slice(0, 10).map((m, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <span className="mt-0.5 flex-shrink-0">{REASON_ICON[m.reason]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 truncate">{m.employee.split(' ').slice(0,2).join(' ')}</p>
                        <p className="text-slate-500 truncate">{m.position}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-500">{m.date ? new Date(m.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</p>
                        {m.salary > 0 && <p className="font-medium text-slate-600">{formatCurrency(m.salary)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Custo total consolidado ── */}
      {hasCosts && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-500 to-orange-600">
          <CardContent className="py-5">
            <div className="grid grid-cols-4 gap-6 text-white">
              <div>
                <p className="text-xs opacity-80 font-medium flex items-center gap-1.5"><DollarSign size={12}/>Folha mensal</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalPayroll)}</p>
                <p className="text-xs opacity-70 mt-0.5">{formatCurrency(totalPayroll * 12)} / ano</p>
              </div>
              <div>
                <p className="text-xs opacity-80 font-medium flex items-center gap-1.5"><ShieldCheck size={12}/>Benefícios / mês</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalBenefitMonthly)}</p>
                <p className="text-xs opacity-70 mt-0.5">{formatCurrency(totalBenefitMonthly * 12)} / ano</p>
              </div>
              <div>
                <p className="text-xs opacity-80 font-medium flex items-center gap-1.5"><BarChart3 size={12}/>Custo total / mês</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalPayroll + totalBenefitMonthly)}</p>
                <p className="text-xs opacity-70 mt-0.5">{formatCurrency((totalPayroll + totalBenefitMonthly) * 12)} / ano</p>
              </div>
              <div>
                <p className="text-xs opacity-80 font-medium flex items-center gap-1.5"><Users size={12}/>Custo médio / pessoa</p>
                <p className="text-2xl font-bold mt-1">{active.length ? formatCurrency((totalPayroll + totalBenefitMonthly) / active.length) : '—'}</p>
                <p className="text-xs opacity-70 mt-0.5">folha + benefícios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tabela de colaboradores com salários ── */}
      <Card>
        <CardContent className="py-5">
          <SectionTitle icon={<FileText size={15}/>} title="Quadro de Colaboradores Ativos" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Nome','Empresa','Depto','Cargo','Contrato','Admissão','Tempo','Salário'].map(h => (
                    <th key={h} className="text-left font-semibold text-slate-400 py-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active
                  .sort((a, b) => (b.salary || 0) - (a.salary || 0))
                  .map(e => {
                    const t = tenureYears(e.hire_date)
                    const years = Math.floor(t)
                    const months = Math.floor((t - years) * 12)
                    const tenure = years > 0 ? `${years}a ${months}m` : `${months}m`
                    return (
                      <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 pr-4 font-medium text-slate-700 whitespace-nowrap">
                          {e.full_name.split(' ').slice(0,2).join(' ')}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500">{companyShort(e.company_cnpj)}</td>
                        <td className="py-2.5 pr-4 text-slate-500 max-w-[120px] truncate">{e.department || '—'}</td>
                        <td className="py-2.5 pr-4 text-slate-500 max-w-[140px] truncate">{e.position || '—'}</td>
                        <td className="py-2.5 pr-4">
                          <span className="bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-medium">
                            {CONTRACT_LABELS[e.contract_type] || e.contract_type}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500">
                          {e.hire_date ? new Date(e.hire_date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500">{e.hire_date ? tenure : '—'}</td>
                        <td className="py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                          {e.salary > 0 ? formatCurrency(e.salary) : '—'}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
