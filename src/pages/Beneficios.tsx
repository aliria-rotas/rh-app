import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'
import { dbEmployees, dbBenefitsValidation, dbBenefitsCosts } from '@/lib/db'
import type { Employee, DependentRelationship } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Pencil, ChevronDown, ChevronRight, Users, DollarSign, ShieldCheck, AlertTriangle, X, Calculator, ChevronLeft, Cake, Lock, Check } from 'lucide-react'

// ─── Tipos e constantes ───────────────────────────────────────────────────────
type BenefitKey = 'health_plan' | 'dental_plan' | 'meal_voucher' | 'transport_voucher' | 'life_insurance'

const BENEFITS: {
  key: BenefitKey; name: string; emoji: string
  colorBg: string; colorText: string; colorBorder: string
}[] = [
  { key: 'health_plan',       name: 'Convênio Médico',         emoji: '🏥', colorBg: 'bg-blue-50',   colorText: 'text-blue-700',   colorBorder: 'border-blue-200'   },
  { key: 'dental_plan',       name: 'Convênio Odontológico',   emoji: '🦷', colorBg: 'bg-teal-50',   colorText: 'text-teal-700',   colorBorder: 'border-teal-200'   },
  { key: 'meal_voucher',      name: 'Vale Refeição',           emoji: '🍽️', colorBg: 'bg-orange-50', colorText: 'text-orange-700', colorBorder: 'border-orange-200' },
  { key: 'transport_voucher', name: 'Vale Transporte',         emoji: '🚌', colorBg: 'bg-green-50',  colorText: 'text-green-700',  colorBorder: 'border-green-200'  },
  { key: 'life_insurance',    name: 'Seguro de Vida em Grupo', emoji: '🛡️', colorBg: 'bg-purple-50', colorText: 'text-purple-700', colorBorder: 'border-purple-200' },
]

const DEFAULT_PROVIDERS: Record<BenefitKey, string> = {
  health_plan: 'Alice Operadora', dental_plan: 'Sul América',
  meal_voucher: 'Flash', transport_voucher: 'Flash', life_insurance: 'Porto Seguro',
}
const DEFAULT_COSTS: Record<BenefitKey, number> = {
  health_plan: 0, dental_plan: 0, meal_voucher: 0, transport_voucher: 0, life_insurance: 0,
}
const DEFAULT_VR_CONFIG = { daily_rate: 37, working_days: 22 }

const DEP_RELATION_LABEL: Record<string, string> = {
  conjuge: 'Cônjuge', filho: 'Filho', filha: 'Filha', outro: 'Outro',
}

const WEEKDAY_LABEL: Record<string, string> = {
  segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta',
}

function loadLS<T>(key: string, def: T): T {
  try { const s = localStorage.getItem(key); return s ? { ...def, ...JSON.parse(s) } : def } catch { return def }
}

function companyShort(cnpj: string) {
  if (cnpj === '47.848.127/0002-00') return 'Aliria SP'
  if (cnpj === '47.848.127/0001-29') return 'Aliria SC'
  if (cnpj === '58.348.779/0001-10') return 'Alicare'
  return cnpj || '—'
}

function getBirthdaysThisMonth(employees: Employee[]): Employee[] {
  const now = new Date()
  const thisMonth = now.getMonth()
  return employees
    .filter(e => e.birth_date && e.status !== 'inativo')
    .filter(e => {
      const [, m] = e.birth_date.split('-').map(Number)
      return (m - 1) === thisMonth  // m é 1-indexed, getMonth() é 0-indexed
    })
    .sort((a, b) => {
      const [, , aDay] = a.birth_date.split('-').map(Number)
      const [, , bDay] = b.birth_date.split('-').map(Number)
      return aDay - bDay
    })
}

function getBirthdaysInMonth(employees: Employee[], month: Date): Employee[] {
  const monthValue = month.getMonth()
  return employees
    .filter(e => e.birth_date && e.status !== 'inativo')
    .filter(e => {
      const [, m] = e.birth_date.split('-').map(Number)
      return (m - 1) === monthValue  // m é 1-indexed, getMonth() é 0-indexed
    })
    .sort((a, b) => {
      const [, , aDay] = a.birth_date.split('-').map(Number)
      const [, , bDay] = b.birth_date.split('-').map(Number)
      return aDay - bDay
    })
}

// Brazilian holidays in 2026 (format: YYYY-MM-DD)
const BRAZILIAN_HOLIDAYS_2026 = [
  '2026-01-01', // Ano Novo
  '2026-02-17', // Carnaval (Terça)
  '2026-02-18', // Quarta de Cinzas
  '2026-04-21', // Tiradentes
  '2026-05-01', // Dia do Trabalho
  '2026-09-07', // Independência
  '2026-10-12', // Nossa Senhora Aparecida
  '2026-11-02', // Finados
  '2026-11-20', // Consciência Negra
  '2026-12-25', // Natal
]

function getWorkingDaysInMonth(date: Date, holidays: string[] = BRAZILIAN_HOLIDAYS_2026): number {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  let workingDays = 0
  const holidaySet = new Set(holidays)

  for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    const dateStr = d.toISOString().split('T')[0]
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidaySet.has(dateStr)) {
      workingDays++
    }
  }

  return workingDays
}

function getEmendaDaysInMonth(date: Date, holidays: string[] = BRAZILIAN_HOLIDAYS_2026): Array<{ date: Date; isEmenda: boolean }> {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const potentialEmendas: Array<{ date: Date; isEmenda: boolean }> = []
  const holidaySet = new Set(holidays)

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    const dateStr = d.toISOString().split('T')[0]
    const isHoliday = holidaySet.has(dateStr)
    const isFriday = dayOfWeek === 5
    const isMonday = dayOfWeek === 1

    // Emenda = segunda após feriado (ter-qui) OU sexta antes de feriado (seg-qua)
    if (isHoliday || (isFriday && isHoliday) || (isMonday && isHoliday)) {
      // Check if it's an emenda (Friday before holiday or Monday after)
      const nextDay = new Date(d)
      nextDay.setDate(nextDay.getDate() + 1)
      const prevDay = new Date(d)
      prevDay.setDate(prevDay.getDate() - 1)
      const nextDateStr = nextDay.toISOString().split('T')[0]
      const prevDateStr = prevDay.toISOString().split('T')[0]

      if ((isFriday && holidaySet.has(nextDateStr)) || (isMonday && holidaySet.has(prevDateStr))) {
        potentialEmendas.push({ date: new Date(d), isEmenda: true })
      }
    }
  }

  return potentialEmendas
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function Beneficios() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [providers, setProviders] = useState<Record<BenefitKey, string>>(() => loadLS('aliria_benefit_providers', DEFAULT_PROVIDERS))
  const [costs, setCosts]         = useState<Record<BenefitKey, number>>(() => loadLS('aliria_benefit_costs', DEFAULT_COSTS))
  const [vrConfig, setVrConfig]   = useState<{ daily_rate: number; working_days: number }>(() => loadLS('aliria_vr_config', DEFAULT_VR_CONFIG))
  const [editingProvider, setEditingProvider] = useState<BenefitKey | null>(null)
  const [providerDraft,   setProviderDraft]   = useState('')
  const [editingCost, setEditingCost] = useState<BenefitKey | null>(null)
  const [costDraft,   setCostDraft]   = useState('')
  const [editingVR, setEditingVR] = useState<'daily' | 'days' | null>(null)
  const [expanded, setExpanded] = useState<BenefitKey | null>(null)
  const [benefitGroup, setBenefitGroup] = useState<'all' | 'health' | 'food' | 'transport' | 'protection'>('all')
  const [mainTab, setMainTab] = useState<'flash' | 'catalog'>('flash')
  const location = useLocation()

  // Validation state
  const [monthlyValidation, setMonthlyValidation] = useState<{ id: string; is_validated: boolean; validated_at: string; validated_by: string } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Flash calculator state
  const [showFlash, setShowFlash] = useState(false)
  const [flashMonth, setFlashMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 1)
  })
  const [flashWorkingDays, setFlashWorkingDays] = useState<number>(() => loadLS('aliria_flash_working_days', vrConfig.working_days))
  const [workedOnEmenda, setWorkedOnEmenda] = useState<Record<string, boolean>>(() => loadLS('aliria_emenda_worked', {}))
  const [flashAdjustments, setFlashAdjustments] = useState<Record<string, { dias_computados?: number; dias_computados_vr?: number; dias_computados_vt?: number; semanas_vt?: number }>>(() => {
    try {
      const stored = localStorage.getItem('aliria_flash_adjustments_v3')
      return stored ? JSON.parse(stored) : {}
    } catch {
      // Clear old format data
      localStorage.removeItem('aliria_flash_adjustments')
      localStorage.removeItem('aliria_flash_adjustments_v2')
      localStorage.removeItem('aliria_flash_adjustments_v3')
      return {}
    }
  })

  useEffect(() => {
    Promise.all([
      dbEmployees.list().then(data => setEmployees(data.filter(e => e.status !== 'inativo'))),
      dbBenefitsCosts.loadCosts().then(costs => setCosts(costs))
    ]).finally(() => setLoading(false))
  }, [])

  // Detect route and set active tab
  useEffect(() => {
    if (location.pathname.includes('calculadora')) {
      setMainTab('flash')
    } else if (location.pathname.includes('detalhamento')) {
      setMainTab('catalog')
    }
  }, [location.pathname])

  // Load validation status when flashMonth changes
  useEffect(() => {
    const loadValidation = async () => {
      const year = flashMonth.getFullYear()
      const month = flashMonth.getMonth() + 1 // getMonth() is 0-indexed
      // For now, check for ALIRIA SP (main company) - can be extended to multi-company support
      const companyCnpj = '47.848.127/0002-00'

      const validation = await dbBenefitsValidation.getValidation(year, month, companyCnpj)
      setMonthlyValidation(validation)
    }

    loadValidation()
  }, [flashMonth])

  function saveProvider(key: BenefitKey) {
    const updated = { ...providers, [key]: providerDraft.trim() || DEFAULT_PROVIDERS[key] }
    setProviders(updated); localStorage.setItem('aliria_benefit_providers', JSON.stringify(updated))
    setEditingProvider(null)
  }
  function saveCost(key: BenefitKey) {
    const v = parseFloat(costDraft.replace(',', '.'))
    const updated = { ...costs, [key]: isNaN(v) ? 0 : v }
    setCosts(updated); localStorage.setItem('aliria_benefit_costs', JSON.stringify(updated))
    setEditingCost(null)
  }
  function saveVrConfig(newConfig: typeof vrConfig) {
    setVrConfig(newConfig)
    localStorage.setItem('aliria_vr_config', JSON.stringify(newConfig))
  }

  async function handleValidateMonth(benefitsSnapshot: Record<string, unknown>) {
    setIsValidating(true)
    try {
      const year = flashMonth.getFullYear()
      const month = flashMonth.getMonth() + 1
      const companyCnpj = '47.848.127/0002-00' // ALIRIA SP

      const result = await dbBenefitsValidation.saveValidation(year, month, companyCnpj, benefitsSnapshot, 'Klissia')
      if (result) {
        setMonthlyValidation(result)
      }
    } catch (error) {
    } finally {
      setIsValidating(false)
    }
  }

  // ── Stats por benefício ─────────────────────────────────────────────────────
  const stats = useMemo(() => BENEFITS.map(b => {
    const enrolled = employees.filter(e => !!(e as any)[b.key])

    // Convênio Médico: custo individual por pessoa
    if (b.key === 'health_plan') {
      const empTotal    = enrolled.reduce((s, e) => s + (e.health_plan_cost ?? 0), 0)
      const depTotal    = enrolled.reduce((s, e) => s + (e.health_plan_dependents ?? []).reduce((sd, d) => sd + d.monthly_cost, 0), 0)
      const monthly     = empTotal + depTotal
      const allDeps     = enrolled.flatMap(e => (e.health_plan_dependents ?? []))
      return { ...b, enrolled, count: enrolled.length, monthly, empTotal, depTotal, allDepsCount: allDeps.length, isHealthPlan: true, isVR: false, isVT: false } as any
    }

    // Vale Refeição: diária × dias úteis
    if (b.key === 'meal_voucher') {
      const monthly = enrolled.length * vrConfig.daily_rate * vrConfig.working_days
      return { ...b, enrolled, count: enrolled.length, monthly, empTotal: monthly, depTotal: 0, allDepsCount: 0, isHealthPlan: false, isVR: true, isVT: false } as any
    }

    // Vale Transporte: custo individual por pessoa
    if (b.key === 'transport_voucher') {
      const monthly = enrolled.reduce((s, e) => s + (e.transport_voucher_cost ?? 0) * vrConfig.working_days, 0)
      return { ...b, enrolled, count: enrolled.length, monthly, empTotal: monthly, depTotal: 0, allDepsCount: 0, isHealthPlan: false, isVR: false, isVT: true } as any
    }

    // Demais benefícios: flat cost × inscritos
    const monthly = enrolled.length * (costs as any)[b.key]
    return { ...b, enrolled, count: enrolled.length, monthly, empTotal: monthly, depTotal: 0, allDepsCount: 0, isHealthPlan: false, isVR: false, isVT: false } as any
  }), [employees, costs, vrConfig]) as any[]

  const totalMonthly  = useMemo(() => stats.reduce((s, b) => s + b.monthly, 0), [stats])
  const annualTotal   = totalMonthly * 12
  const hasAnyCost    = totalMonthly > 0

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-b-orange-500 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── Resumo de Valores Médios ── */}
      {!location.pathname.includes('/beneficios/calculadora') && (
      <Card>
        <CardContent className="py-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Valores Médios dos Benefícios</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Convênio Médico */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-3">
              <p className="text-xs text-blue-600 font-semibold">Convênio Médico</p>
              <p className="text-lg font-bold text-blue-700 mt-1">{costs.health_plan > 0 ? formatCurrency(costs.health_plan) : 'R$ 0,00'}</p>
              <p className="text-xs text-slate-500 mt-1">custo mensal total</p>
            </div>

            {/* Vale Transporte */}
            {(() => {
              const vtEnrolled = employees.filter(e => !!e.transport_voucher && e.status === 'ativo')
              const avgVT = vtEnrolled.length > 0
                ? vtEnrolled.reduce((s, e) => s + (e.transport_voucher_cost ?? 0), 0) / vtEnrolled.length
                : 0
              return (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-3">
                  <p className="text-xs text-green-600 font-semibold">Vale Transporte</p>
                  <p className="text-lg font-bold text-green-700 mt-1">R$ {avgVT.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">média/dia útil</p>
                </div>
              )
            })()}

            {/* Vale Refeição */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-3">
              <p className="text-xs text-orange-600 font-semibold">Vale Refeição</p>
              <p className="text-lg font-bold text-orange-700 mt-1">R$ {vrConfig.daily_rate.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">taxa diária</p>
            </div>

            {/* Convênio Odontológico */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-3">
              <p className="text-xs text-teal-600 font-semibold">Convênio Odontológico</p>
              <p className="text-lg font-bold text-teal-700 mt-1">{costs.dental_plan > 0 ? formatCurrency(costs.dental_plan) : 'R$ 0,00'}</p>
              <p className="text-xs text-slate-500 mt-1">custo mensal total</p>
            </div>

            {/* Seguro de Vida */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-3">
              <p className="text-xs text-purple-600 font-semibold">Seguro de Vida em Grupo</p>
              <p className="text-lg font-bold text-purple-700 mt-1">{costs.life_insurance > 0 ? formatCurrency(costs.life_insurance) : 'R$ 0,00'}</p>
              <p className="text-xs text-slate-500 mt-1">custo mensal total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* ── Aniversariantes do mês ── */}
      {!location.pathname.includes('/beneficios/') && (() => {
        const birthdays = getBirthdaysThisMonth(employees)
        return birthdays.length > 0 ? (
          <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
            <CardContent className="py-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cake size={18} className="text-pink-600" />
                  <h3 className="font-semibold text-slate-800">Aniversariantes do Mês</h3>
                </div>
                <span className="text-xs bg-pink-200 text-pink-800 px-2 py-1 rounded-full font-semibold">{birthdays.length} {birthdays.length === 1 ? 'aniversariante' : 'aniversariantes'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {birthdays.map(emp => {
                  // Parse data sem timezone issues: "YYYY-MM-DD" → extrair dia/mês diretamente
                  const [year, month, day] = emp.birth_date.split('-').map(Number)
                  const birthDate = new Date(year, month - 1, day)  // month é 0-indexed
                  const monthName = birthDate.toLocaleDateString('pt-BR', { month: 'long' })
                  const age = new Date().getFullYear() - year
                  return (
                    <div key={emp.id} className="bg-white rounded-lg border border-pink-200 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-600 flex-shrink-0">
                          {emp.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{emp.full_name}</p>
                          <p className="text-xs text-slate-500">{companyShort(emp.company_cnpj)}</p>
                          <p className="text-xs font-medium text-pink-600 mt-1">
                            🎂 {day} de {monthName} ({age} anos)
                          </p>
                          {!emp.is_partner && (
                            <p className="text-xs font-semibold text-rose-600 mt-1">🎉 Direito a Day Off</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : null
      })()}

      {/* ── Alertas ── */}
      {!location.pathname.includes('/beneficios/') && (
        <div className="space-y-3">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Renovação do Convênio Médico em junho/2026</p>
            <p className="text-xs text-amber-600 mt-0.5">O contrato com a Alice Operadora vence em junho. Os valores individuais podem ser alterados após a renovação — atualize os custos na aba de cada colaborador.</p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Reajuste do Convênio Odontológico em junho/2026</p>
            <p className="text-xs text-blue-600 mt-0.5"><strong>Ref. nº 524874 (Sul América)</strong> - Reajuste de 5,42% será aplicado. Atualize os custos do plano odontológico após junho.</p>
          </div>
        </div>
      </div>
      )}

      {/* ── Stats ── */}
      {!location.pathname.includes('/beneficios/') && (
        <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Colaboradores ativos',        value: employees.length,            sub: 'elegíveis',                color: 'text-slate-700' },
          { label: 'Custo total / mês',            value: formatCurrency(totalMonthly),  sub: hasAnyCost ? `${formatCurrency(annualTotal)} / ano` : 'Configure os custos ↓', color: 'text-orange-600' },
          { label: 'Custo médio p/ colaborador',   value: employees.length ? formatCurrency(totalMonthly / employees.length) : '—', sub: 'por mês (RH)',       color: 'text-blue-600'  },
          { label: 'Tipos de benefício',           value: BENEFITS.length,            sub: 'cadastrados',             color: 'text-teal-600'  },
        ].map(s => (
          <Card key={s.label}><CardContent className="py-4">
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </CardContent></Card>
        ))}
      </div>
      )}

      {/* ── Abas principais: Calculadora Flash / Detalhamento de Benefícios ── */}
      <div className="space-y-4">
        {/* Tabs Header - Mostrar apenas se estiver na rota raiz de benefícios */}
        {!location.pathname.includes('/beneficios/') && (
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setMainTab('flash')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                mainTab === 'flash'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calculator size={16} />
                Calculadora de Benefícios - Depósito
              </span>
            </button>
            <button
              onClick={() => setMainTab('catalog')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                mainTab === 'catalog'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} />
                Detalhamento de Benefícios
              </span>
            </button>
          </div>
        )}

        {/* Tab 1: Flash Calculator */}
        {(mainTab === 'flash' || location.pathname.includes('/beneficios/calculadora')) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-5 space-y-5">
              {/* ─ Seletor de mês ─ */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selecionar mês</label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setFlashMonth(p => new Date(p.getFullYear(), p.getMonth() - 1, 1))}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <select
                      value={flashMonth.getMonth()}
                      onChange={e => setFlashMonth(p => new Date(p.getFullYear(), parseInt(e.target.value), 1))}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      {(() => {
                        const currentYear = flashMonth.getFullYear()
                        const startMonth = currentYear === 2026 ? 5 : 0 // June (5) for 2026, January (0) for other years
                        const endMonth = 12
                        return Array.from({ length: endMonth - startMonth }, (_, i) => i + startMonth).map(i => (
                          <option key={i} value={i}>
                            {new Date(currentYear, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                          </option>
                        ))
                      })()}
                    </select>
                    <select
                      value={flashMonth.getFullYear()}
                      onChange={e => setFlashMonth(p => new Date(parseInt(e.target.value), p.getMonth(), 1))}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      {Array.from({ length: 10 }, (_, i) => 2026 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setFlashMonth(p => new Date(p.getFullYear(), p.getMonth() + 1, 1))}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronDown size={16} className="rotate-90" />
                  </button>
                </div>
              </div>

              {/* ─ Emendas de feriado ─ */}
              {getEmendaDaysInMonth(flashMonth).length > 0 && (
                <div className="pb-5 border-b border-slate-200">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Emendas de feriado</label>
                  <p className="text-xs text-slate-500 mb-3">Marque os colaboradores que compareceram no dia da emenda (VT não é descontado nesse dia)</p>
                  <div className="space-y-2">
                    {getEmendaDaysInMonth(flashMonth).map(emenda => {
                      const dateKey = emenda.date.toISOString().split('T')[0]
                      return (
                        <div key={dateKey} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-amber-900">
                              {emenda.date.toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">Colaboradores que foram trabalhar:</p>
                          </div>
                          <div className="flex gap-1">
                            {employees.filter(e => e.status === 'ativo').map(emp => (
                              <button
                                key={`${dateKey}-${emp.id}`}
                                onClick={() => {
                                  const key = `${dateKey}_${emp.id}`
                                  const updated = { ...workedOnEmenda, [key]: !workedOnEmenda[key] }
                                  setWorkedOnEmenda(updated)
                                  localStorage.setItem('aliria_emenda_worked', JSON.stringify(updated))
                                }}
                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  workedOnEmenda[`${dateKey}_${emp.id}`]
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-100'
                                }`}
                                title={emp.full_name}
                              >
                                {emp.full_name.split(' ')[0].substring(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ─ Resumo de custos para o mês ─ */}
              <FlashCalculatorSummary
                employees={employees}
                flashMonth={flashMonth}
                vrConfig={vrConfig}
                flashAdjustments={flashAdjustments}
                setFlashAdjustments={setFlashAdjustments}
                flashWorkingDays={flashWorkingDays}
                setFlashWorkingDays={setFlashWorkingDays}
                birthdaysInMonth={getBirthdaysInMonth(employees, flashMonth)}
                monthlyValidation={monthlyValidation}
                onValidateMonth={handleValidateMonth}
                isValidating={isValidating}
              />
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Catálogo de Benefícios */}
        {(mainTab === 'catalog' || location.pathname.includes('/beneficios/detalhamento')) && (
          <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2"><ShieldCheck size={15} className="text-orange-500"/>Catálogo de Benefícios</h2>
          <p className="text-xs text-slate-400">Clique no prestador ou no valor para editar · alterações valem para toda a empresa</p>
        </div>

        {/* Grupos de benefícios */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: 'all', label: '📋 Todos', icon: '📋' },
            { id: 'health', label: '🏥 Saúde', icon: '🏥' },
            { id: 'food', label: '🍽️ Alimentação', icon: '🍽️' },
            { id: 'transport', label: '🚌 Transporte', icon: '🚌' },
            { id: 'protection', label: '🛡️ Proteção', icon: '🛡️' },
          ].map(group => (
            <button
              key={group.id}
              onClick={() => setBenefitGroup(group.id as typeof benefitGroup)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                benefitGroup === group.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {stats
            .filter(b => {
              if (benefitGroup === 'all') return true
              if (benefitGroup === 'health') return b.key === 'health_plan' || b.key === 'dental_plan'
              if (benefitGroup === 'food') return b.key === 'meal_voucher'
              if (benefitGroup === 'transport') return b.key === 'transport_voucher'
              if (benefitGroup === 'protection') return b.key === 'life_insurance'
              return true
            })
            .map(b => {
            const isExpanded = expanded === b.key
            const vrMonthly = b.isVR ? vrConfig.daily_rate * vrConfig.working_days : 0
            const vtDailyAvg = b.isVT && b.enrolled.length > 0
              ? b.enrolled.reduce((s: number, e: Employee) => s + (e.transport_voucher_cost ?? 0), 0) / b.enrolled.length
              : 0
            return (
              <Card key={b.key} className="overflow-hidden">
                <CardContent className="py-0 px-0">
                  {/* Row principal */}
                  <div className="flex items-center gap-4 px-5 py-4">

                    {/* Emoji + nome + prestador */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${b.colorBg} ${b.colorBorder} border`}>
                      {b.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                        Prestador:{' '}
                        {editingProvider === b.key ? (
                          <input
                            className="border border-orange-300 rounded px-1.5 py-0 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 w-40"
                            value={providerDraft}
                            onChange={e => setProviderDraft(e.target.value)}
                            onBlur={() => saveProvider(b.key)}
                            onKeyDown={e => { if (e.key === 'Enter') saveProvider(b.key); if (e.key === 'Escape') setEditingProvider(null) }}
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => { setEditingProvider(b.key); setProviderDraft((providers as any)[b.key]) }}
                            className="flex items-center gap-1 font-medium text-slate-600 hover:text-orange-600 transition-colors group/p"
                          >
                            {(providers as any)[b.key]}
                            <Pencil size={9} className="opacity-0 group-hover/p:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Custo p/ pessoa */}
                    <div className="text-right flex-shrink-0 min-w-[150px]">
                      {b.isHealthPlan ? (
                        <>
                          <p className="text-xs text-slate-400 mb-1">Custo por faixa etária</p>
                          <p className="text-sm font-medium text-blue-600 italic">Individual (variável)</p>
                        </>
                      ) : b.isVT ? (
                        <>
                          <p className="text-xs text-slate-400 mb-1">Custo por rota (dia útil)</p>
                          <p className="text-sm font-medium text-green-600">Médio: R$ {vtDailyAvg.toFixed(2)}</p>
                          <p className="text-xs text-slate-400">Individual (variável)</p>
                        </>
                      ) : b.isVR ? (
                        <>
                          <p className="text-xs text-slate-400 mb-1">Taxa diária</p>
                          <p className="text-base font-bold text-orange-600">R$ {vrConfig.daily_rate.toFixed(2)}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-slate-400 mb-1">Custo total / mês</p>
                          {editingCost === b.key ? (
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-xs text-slate-400">R$</span>
                              <input
                                type="number" step="0.01" min="0"
                                className="border border-orange-300 rounded px-2 py-1 text-sm font-semibold text-slate-800 w-24 focus:outline-none focus:ring-1 focus:ring-orange-400 text-right"
                                value={costDraft}
                                onChange={e => setCostDraft(e.target.value)}
                                onBlur={() => saveCost(b.key)}
                                onKeyDown={e => { if (e.key === 'Enter') saveCost(b.key); if (e.key === 'Escape') setEditingCost(null) }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingCost(b.key); setCostDraft(String((costs as any)[b.key])) }}
                              className="flex items-center gap-1 justify-end font-semibold text-slate-700 hover:text-orange-600 group/c transition-colors"
                            >
                              {(costs as any)[b.key] > 0
                                ? <span className="text-base">{formatCurrency((costs as any)[b.key])}</span>
                                : <span className="text-sm text-slate-400 font-normal italic">Clique para configurar</span>
                              }
                              <Pencil size={10} className="opacity-0 group-hover/c:opacity-100 transition-opacity text-orange-500" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Nº colaboradores */}
                    <div className="text-right flex-shrink-0 min-w-[90px]">
                      <p className="text-xs text-slate-400 mb-1">Colaboradores</p>
                      <p className="text-base font-bold text-slate-700 flex items-center justify-end gap-1">
                        <Users size={13} className="text-slate-400" />{b.count}
                      </p>
                      {b.isHealthPlan && b.allDepsCount > 0 && (
                        <p className="text-xs text-slate-400">+ {b.allDepsCount} dep.</p>
                      )}
                    </div>

                    {/* Total mensal */}
                    <div className="text-right flex-shrink-0 min-w-[120px]">
                      <p className="text-xs text-slate-400 mb-1">Total / mês</p>
                      <p className={`text-base font-bold ${b.monthly > 0 ? b.colorText : 'text-slate-400'}`}>
                        {b.monthly > 0 ? formatCurrency(b.monthly) : '—'}
                      </p>
                      {b.isVR && (
                        <p className="text-xs text-slate-400">{formatCurrency(vrMonthly)}/pessoa</p>
                      )}
                      {b.isHealthPlan && b.depTotal > 0 && (
                        <p className="text-xs text-slate-400">{formatCurrency(b.empTotal)} + {formatCurrency(b.depTotal)}</p>
                      )}
                    </div>

                    {/* Expand */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : b.key)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                    >
                      {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                    </button>
                  </div>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                      {b.isVR && (
                        <div className="mb-4 pb-4 border-b border-slate-200">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Configurar Vale Refeição</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-500 block mb-1">Taxa diária</label>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">R$</span>
                                {editingVR === 'daily' ? (
                                  <input
                                    type="number" step="0.01" min="0"
                                    className="border border-orange-300 rounded px-2 py-1 text-sm font-semibold w-20 focus:outline-none focus:ring-1 focus:ring-orange-400"
                                    value={vrConfig.daily_rate}
                                    onChange={e => setVrConfig(p => ({ ...p, daily_rate: parseFloat(e.target.value) || 0 }))}
                                    onBlur={() => { saveVrConfig(vrConfig); setEditingVR(null) }}
                                    autoFocus
                                  />
                                ) : (
                                  <button onClick={() => setEditingVR('daily')} className="flex-1 font-semibold text-slate-700 hover:text-orange-600 group/vr">
                                    {vrConfig.daily_rate.toFixed(2)} <Pencil size={9} className="opacity-0 group-hover/vr:opacity-100 transition-opacity inline ml-1" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 block mb-1">Dias úteis / mês</label>
                              {editingVR === 'days' ? (
                                <input
                                  type="number" step="1" min="1" max="31"
                                  className="w-full border border-orange-300 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-orange-400"
                                  value={vrConfig.working_days}
                                  onChange={e => setVrConfig(p => ({ ...p, working_days: parseInt(e.target.value) || 22 }))}
                                  onBlur={() => { saveVrConfig(vrConfig); setEditingVR(null) }}
                                  autoFocus
                                />
                              ) : (
                                <button onClick={() => setEditingVR('days')} className="w-full text-left font-semibold text-slate-700 hover:text-orange-600 group/vrd">
                                  {vrConfig.working_days} dias <Pencil size={9} className="opacity-0 group-hover/vrd:opacity-100 transition-opacity inline ml-1" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            <span className="font-semibold text-slate-700">Mensal por pessoa: </span>
                            {formatCurrency(vrConfig.daily_rate * vrConfig.working_days)}
                          </p>
                        </div>
                      )}

                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Users size={11}/> Colaboradores inscritos ({b.count})
                      </p>
                      {b.count === 0 ? (
                        <p className="text-sm text-slate-400 italic">Nenhum colaborador inscrito neste benefício.</p>
                      ) : b.isVT ? (
                        /* Vale Transporte: mostra custo individual */
                        <div className="space-y-2">
                          <p className="text-xs text-slate-500 mb-2">Custo diário varia por rota · <strong>Cálculo:</strong> R$ diário × dias úteis/mês (descontado home office de segunda a quinta e emendas de feriado)<br/><span className="text-blue-600">Vale Refeição não tem desconto em emendas</span></p>
                          {b.enrolled.map((emp: any) => {
                            const vCost = emp.transport_voucher_cost ?? 0
                            const monthly = vCost * vrConfig.working_days
                            const homeOfficeDiscount = emp.company_cnpj === '47.848.127/0002-00' && emp.home_office_day ? (vCost * 4.3) : 0
                            const estimatedMonthly = monthly - homeOfficeDiscount
                            return (
                              <div key={emp.id} className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-xs">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-700">{emp.full_name.split(' ').slice(0,2).join(' ')}</p>
                                    <p className="text-slate-400">{['ônibus','metrô','RP','etc'].includes(emp.full_name) ? '...' : ''} {companyShort(emp.company_cnpj)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-green-700">R$ {vCost.toFixed(2)}/dia</p>
                                    <p className="text-slate-500">{vCost * vrConfig.working_days > 0 ? `≈ ${formatCurrency(estimatedMonthly)}/mês` : '—'}</p>
                                    {homeOfficeDiscount > 0 && <p className="text-xs text-blue-600 mt-0.5">- R$ {homeOfficeDiscount.toFixed(2)} (home office)</p>}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : b.isHealthPlan ? (
                        /* Convênio Médico: mostra custo individual + dependentes */
                        <div className="space-y-2">
                          {b.enrolled.map((emp: any) => {
                            const deps = emp.health_plan_dependents ?? []
                            const empCost  = emp.health_plan_cost ?? 0
                            const depsCost = deps.reduce((s: number, d: any) => s + d.monthly_cost, 0)
                            return (
                              <div key={emp.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-3 px-4 py-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${b.colorBg} ${b.colorText}`}>
                                    {emp.full_name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-700">{emp.full_name.split(' ').slice(0,3).join(' ')}</p>
                                    <p className="text-xs text-slate-400">{companyShort(emp.company_cnpj)}</p>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-semibold text-blue-700">{empCost > 0 ? formatCurrency(empCost) : <span className="text-slate-300 italic">não config.</span>}</p>
                                    {deps.length > 0 && <p className="text-xs text-slate-400">+ {formatCurrency(depsCost)} dep.</p>}
                                  </div>
                                </div>
                                {deps.length > 0 && (
                                  <div className="border-t border-slate-100 px-4 py-2 bg-blue-50/30">
                                    <div className="space-y-1">
                                      {deps.map((d: any) => (
                                        <div key={d.id} className="flex items-center gap-2 text-xs text-slate-500">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                                          <span className="flex-1 truncate">{d.name} <span className="text-slate-400">({DEP_RELATION_LABEL[d.relationship] || d.relationship})</span></span>
                                          <span className="font-medium text-blue-600">{d.monthly_cost > 0 ? formatCurrency(d.monthly_cost) : '—'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        /* Demais benefícios: grid de cards */
                        <div className="grid grid-cols-3 gap-2">
                          {b.enrolled.map((emp: any) => (
                            <div key={emp.id} className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${b.colorBg} ${b.colorText}`}>
                                {emp.full_name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{emp.full_name.split(' ').slice(0,2).join(' ')}</p>
                                <p className="text-xs text-slate-400 truncate">{companyShort(emp.company_cnpj)}</p>
                              </div>
                              {((costs as any)[b.key] > 0 || b.isVR) && (
                                <span className={`ml-auto text-xs font-medium flex-shrink-0 ${b.colorText}`}>
                                  {b.isVR ? formatCurrency(vrMonthly) : formatCurrency((costs as any)[b.key])}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
          </div>
        )}
      </div>

      {/* ── Resumo de custos ── */}
      {hasAnyCost && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-500 to-orange-600">
          <CardContent className="py-5">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-90 flex items-center gap-2"><DollarSign size={15}/>Custo total mensal com benefícios</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(totalMonthly)}</p>
                <p className="text-sm opacity-80 mt-1">Equivale a {formatCurrency(annualTotal)} / ano</p>
              </div>
              <div className="text-right opacity-90 space-y-3">
                {stats.filter(b => b.monthly > 0).map(b => (
                  <div key={b.key} className="flex items-center gap-3 text-sm">
                    <span className="opacity-80">{b.name}</span>
                    <span className="font-semibold">{formatCurrency(b.monthly)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Flash Calculator Summary Component ───────────────────────────────────────
function FlashCalculatorSummary({
  employees,
  flashMonth,
  vrConfig,
  flashAdjustments,
  setFlashAdjustments,
  flashWorkingDays,
  setFlashWorkingDays,
  birthdaysInMonth,
  monthlyValidation,
  onValidateMonth,
  isValidating,
}: {
  employees: Employee[]
  flashMonth: Date
  vrConfig: { daily_rate: number; working_days: number }
  flashAdjustments: Record<string, { dias_computados?: number; dias_computados_vr?: number; dias_computados_vt?: number; semanas_vt?: number }>
  setFlashAdjustments: (adj: Record<string, { dias_computados?: number; dias_computados_vr?: number; dias_computados_vt?: number; semanas_vt?: number }>) => void
  flashWorkingDays: number
  setFlashWorkingDays: (days: number) => void
  birthdaysInMonth: Employee[]
  monthlyValidation: { id: string; is_validated: boolean; validated_at: string; validated_by: string } | null
  onValidateMonth: (benefitsSnapshot: Record<string, unknown>) => Promise<void>
  isValidating: boolean
}) {
  const activeEmployees = employees.filter(e => e.status === 'ativo')
  const workingDays = flashWorkingDays || getWorkingDaysInMonth(flashMonth)

  // Employees with VR
  const vrEnrolled = activeEmployees.filter(e => !!e.meal_voucher)
  // Employees with VT (both regular employees and partners)
  const vtEnrolled = activeEmployees.filter(e => !!e.transport_voucher || (e.is_partner && (e.partner_vt_weekly ?? 0) > 0))
  // Separate partners and employees
  const vtPartners = vtEnrolled.filter(e => e.is_partner && (e.partner_vt_weekly ?? 0) > 0)
  const vtEmployees = vtEnrolled.filter(e => !e.is_partner)

  // Calculate VR and VT totals based on adjustments
  const calculateValues = () => {
    let vrTotal = 0
    let vtTotal = 0
    let bonusTotal = 0

    vrEnrolled.forEach(emp => {
      const adj = flashAdjustments[emp.id] ?? { dias_computados: workingDays, dias_computados_vr: workingDays, dias_computados_vt: workingDays, semanas_vt: 4 }
      // For partners: use dias_computados; for employees: use dias_computados_vr
      const diasVR = emp.is_partner ? (adj.dias_computados ?? workingDays) : (adj.dias_computados_vr ?? workingDays)
      vrTotal += diasVR * vrConfig.daily_rate
    })

    // Regular VT employees (daily cost per route)
    vtEmployees.forEach(emp => {
      const adj = flashAdjustments[emp.id] ?? { dias_computados: workingDays, dias_computados_vr: workingDays, dias_computados_vt: workingDays, semanas_vt: 4 }
      const dailyCost = emp.transport_voucher_cost ?? 0
      // For employees: use dias_computados_vt
      const diasVT = adj.dias_computados_vt ?? workingDays
      vtTotal += Math.max(0, dailyCost * diasVT)
    })

    // Partner VT (weekly fixed amount)
    vtPartners.forEach(emp => {
      const adj = flashAdjustments[emp.id] ?? { dias_computados: workingDays, dias_computados_vr: workingDays, dias_computados_vt: workingDays, semanas_vt: 4 }
      const weeklyAmount = emp.partner_vt_weekly ?? 0
      const semanasVT = adj.semanas_vt ?? 4
      const partnerMonthlyVT = weeklyAmount * semanasVT
      vtTotal += Math.max(0, partnerMonthlyVT)
    })

    // Monthly bonuses
    activeEmployees.forEach(emp => {
      bonusTotal += emp.monthly_bonus ?? 0
    })

    return { vrTotal, vtTotal, bonusTotal, total: vrTotal + vtTotal + bonusTotal }
  }

  const { vrTotal, vtTotal, bonusTotal, total } = calculateValues()

  const updateAdjustment = (empId: string, key: 'dias_computados' | 'dias_computados_vr' | 'dias_computados_vt' | 'semanas_vt', value: number) => {
    const current = flashAdjustments[empId] ?? { dias_computados: workingDays, dias_computados_vr: workingDays, dias_computados_vt: workingDays, semanas_vt: 4 }
    const updated = { ...flashAdjustments, [empId]: { ...current, [key]: value } }
    setFlashAdjustments(updated)
    localStorage.setItem('aliria_flash_adjustments_v3', JSON.stringify(updated))
  }

  const emendaDaysCount = getEmendaDaysInMonth(flashMonth).length

  // Get the last working day of the PREVIOUS month (when payment happens)
  const lastWorkingDay = useMemo(() => {
    const year = flashMonth.getFullYear()
    const month = flashMonth.getMonth() - 1  // Get previous month
    const lastDay = new Date(year, month + 1, 0).getDate()
    const holidaySet = new Set(BRAZILIAN_HOLIDAYS_2026)

    for (let d = lastDay; d >= 1; d--) {
      const date = new Date(year, month, d)
      const dayOfWeek = date.getDay()
      const dateStr = date.toISOString().split('T')[0]
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && !holidaySet.has(dateStr)) {
        return d
      }
    }
    return lastDay
  }, [flashMonth])

  // Combine VR and VT for all employees
  const allEmployeesWithBenefits = useMemo(() => {
    return activeEmployees
      .filter(emp => {
        // Exclude Alicare employees only
        if (emp.company_cnpj === '58.348.779/0001-10') return false

        // Sócios com VT (partner_vt_weekly)
        if (emp.is_partner && (emp.partner_vt_weekly ?? 0) > 0) return true
        // CLT com benefícios
        if (emp.meal_voucher || emp.transport_voucher || (emp.monthly_bonus ?? 0) > 0) return true
        return false
      })
      .map(emp => {
        const adj = flashAdjustments[emp.id] ?? { dias_computados: workingDays, dias_computados_vr: workingDays, dias_computados_vt: workingDays, semanas_vt: 4 }

        // For partners: use dias_computados (one field)
        // For employees: use dias_computados_vr for VR and dias_computados_vt for VT
        const diasVR = emp.is_partner ? (adj.dias_computados ?? workingDays) : (adj.dias_computados_vr ?? workingDays)
        const diasVT = emp.is_partner ? (adj.dias_computados ?? workingDays) : (adj.dias_computados_vt ?? workingDays)

        // VR Calculation
        const vrValue = emp.meal_voucher ? diasVR * vrConfig.daily_rate : 0

        // VT Calculation
        let vtValue = 0

        if (emp.is_partner && (emp.partner_vt_weekly ?? 0) > 0) {
          // Partner VT: based on number of weeks to compute
          const semanasVT = adj.semanas_vt ?? 4
          vtValue = (emp.partner_vt_weekly ?? 0) * semanasVT
        } else if (emp.transport_voucher) {
          // Regular employee VT: use dias_computados_vt directly
          const dailyCost = emp.transport_voucher_cost ?? 0
          vtValue = Math.max(0, dailyCost * diasVT)
        }

        // Monthly bonus
        const bonusValue = emp.monthly_bonus ?? 0

        return {
          emp,
          vrValue,
          vtValue,
          bonusValue,
          totalValue: vrValue + vtValue + bonusValue,
          adj,
          diasVR,
          diasVT,
        }
      })
      .sort((a, b) => a.emp.full_name.localeCompare(b.emp.full_name))
  }, [activeEmployees, flashAdjustments, workingDays])

  // Separate SÓCIOS, SC and SP employees
  const sociosEmployees = useMemo(() => {
    return allEmployeesWithBenefits.filter(item => item.emp.is_partner)
  }, [allEmployeesWithBenefits])

  const scEmployees = useMemo(() => {
    return allEmployeesWithBenefits.filter(item => item.emp.company_cnpj === '47.848.127/0001-29' && !item.emp.is_partner)
  }, [allEmployeesWithBenefits])

  const spEmployees = useMemo(() => {
    return allEmployeesWithBenefits.filter(item => item.emp.company_cnpj === '47.848.127/0002-00' && !item.emp.is_partner)
  }, [allEmployeesWithBenefits])

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Calculadora para {flashMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
        <p className="text-xs text-slate-400 mt-1">Pagamento: {lastWorkingDay} de {new Date(flashMonth.getFullYear(), flashMonth.getMonth() - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })}</p>
      </div>

      {/* SÓCIOS */}
      {sociosEmployees.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="text-purple-600">●</span> SÓCIOS
          </h3>
          <div className="bg-gradient-to-b from-orange-50 to-white border border-orange-200 rounded-lg p-4 space-y-3">
            {sociosEmployees.map(({ emp, vrValue, vtValue, bonusValue, totalValue, adj, diasVR, diasVT }) => {
              const isPartner = emp.is_partner && (emp.partner_vt_weekly ?? 0) > 0
              return (
                <div key={emp.id} className="bg-white border border-orange-100 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-800">{emp.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {isPartner ? 'Sócio(a)' : 'Sócio(a) - Funcionário(a)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">TOTAL FLASH</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalValue)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Vale Refeição */}
                  {emp.meal_voucher && (
                    <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded p-3">
                      <p className="text-xs font-semibold text-orange-600 mb-2">🍽️ VALE REFEIÇÃO</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Dias computados:</span>
                          <span className="font-semibold text-slate-800">{diasVR.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Taxa diária:</span>
                          <span className="font-semibold text-slate-800">R$ {vrConfig.daily_rate.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-orange-200 flex justify-between font-semibold">
                          <span className="text-orange-700">Subtotal VR:</span>
                          <span className="text-orange-600">{formatCurrency(vrValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vale Transporte */}
                  {(emp.transport_voucher || isPartner) && (
                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded p-3">
                      <p className="text-xs font-semibold text-green-600 mb-2">🚌 VALE TRANSPORTE</p>
                      <div className="space-y-2 text-xs">
                        {isPartner ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Semanas a computar:</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="5"
                                value={adj.semanas_vt ?? 4}
                                onChange={e => updateAdjustment(emp.id, 'semanas_vt', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-slate-300 rounded font-semibold text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                              />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">VT semanal:</span>
                              <span className="font-semibold text-slate-800">R$ {(emp.partner_vt_weekly ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-blue-600 font-semibold italic text-xs">
                              <span>Sem descontos (sócio)</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Dias úteis (VT):</span>
                              <span className="font-semibold text-slate-800">{diasVT.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Custo/dia:</span>
                              <span className="font-semibold text-slate-800">R$ {(emp.transport_voucher_cost ?? 0).toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        <div className="pt-2 border-t border-green-200 flex justify-between font-semibold">
                          <span className="text-green-700">Subtotal VT:</span>
                          <span className="text-green-600">{formatCurrency(vtValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bônus Mensal */}
                  {bonusValue > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded p-3">
                      <p className="text-xs font-semibold text-purple-600 mb-2">💰 BÔNUS MENSAL</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Valor:</span>
                          <span className="font-semibold text-slate-800">{formatCurrency(bonusValue)}</span>
                        </div>
                        <div className="pt-2 border-t border-purple-200 flex justify-between font-semibold">
                          <span className="text-purple-700">Subtotal:</span>
                          <span className="text-purple-600">{formatCurrency(bonusValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Adjustments - SÓCIOS: apenas 1 campo */}
                {emp.is_partner && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                  <div className="grid gap-2 text-xs">
                    <div>
                      <label className="text-slate-500 block mb-1">Dias a computar</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={workingDays}
                        value={adj.dias_computados ?? workingDays}
                        onChange={e => updateAdjustment(emp.id, 'dias_computados', parseFloat(e.target.value) || workingDays)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                </div>
                )}
              </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ALIRIA SC */}
      {scEmployees.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="text-purple-600">●</span> ALIRIA SC
          </h3>
          <div className="bg-gradient-to-b from-orange-50 to-white border border-orange-200 rounded-lg p-4 space-y-3">
            {scEmployees.map(({ emp, vrValue, vtValue, bonusValue, totalValue, adj, diasVR, diasVT }) => {
              const isPartner = emp.is_partner && (emp.partner_vt_weekly ?? 0) > 0
              return (
                <div key={emp.id} className="bg-white border border-orange-100 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-800">{emp.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {companyShort(emp.company_cnpj)}
                      {isPartner && <span className="ml-2 font-semibold text-purple-600">• Sócio(a)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">TOTAL FLASH</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalValue)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Vale Refeição */}
                  {emp.meal_voucher && (
                    <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded p-3">
                      <p className="text-xs font-semibold text-orange-600 mb-2">🍽️ VALE REFEIÇÃO</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Dias computados:</span>
                          <span className="font-semibold text-slate-800">{diasVR.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Taxa diária:</span>
                          <span className="font-semibold text-slate-800">R$ {vrConfig.daily_rate.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-orange-200 flex justify-between font-semibold">
                          <span className="text-orange-700">Subtotal VR:</span>
                          <span className="text-orange-600">{formatCurrency(vrValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vale Transporte */}
                  {(emp.transport_voucher || isPartner) && (
                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded p-3">
                      <p className="text-xs font-semibold text-green-600 mb-2">🚌 VALE TRANSPORTE</p>
                      <div className="space-y-2 text-xs">
                        {isPartner ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Semanas a computar:</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="5"
                                value={adj.semanas_vt ?? 4}
                                onChange={e => updateAdjustment(emp.id, 'semanas_vt', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-slate-300 rounded font-semibold text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                              />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">VT semanal:</span>
                              <span className="font-semibold text-slate-800">R$ {(emp.partner_vt_weekly ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-blue-600 font-semibold italic text-xs">
                              <span>Sem descontos (sócio)</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Dias úteis (VT):</span>
                              <span className="font-semibold text-slate-800">{diasVT.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Custo/dia:</span>
                              <span className="font-semibold text-slate-800">R$ {(emp.transport_voucher_cost ?? 0).toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        <div className="pt-2 border-t border-green-200 flex justify-between font-semibold">
                          <span className="text-green-700">Subtotal VT:</span>
                          <span className="text-green-600">{formatCurrency(vtValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bônus Mensal */}
                  {bonusValue > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded p-3">
                      <p className="text-xs font-semibold text-purple-600 mb-2">💰 BÔNUS MENSAL</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Valor:</span>
                          <span className="font-semibold text-slate-800">{formatCurrency(bonusValue)}</span>
                        </div>
                        <div className="pt-2 border-t border-purple-200 flex justify-between font-semibold">
                          <span className="text-purple-700">Subtotal:</span>
                          <span className="text-purple-600">{formatCurrency(bonusValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Adjustments - Funcionários: 2 campos separados */}
                {!emp.is_partner && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                  <div className="grid gap-2 text-xs">
                    <div>
                      <label className="text-slate-500 block mb-1">Dias a computar (VR)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={workingDays}
                        value={adj.dias_computados_vr ?? workingDays}
                        onChange={e => updateAdjustment(emp.id, 'dias_computados_vr', parseFloat(e.target.value) || workingDays)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Dias a computar (VT)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={workingDays}
                        value={adj.dias_computados_vt ?? workingDays}
                        onChange={e => updateAdjustment(emp.id, 'dias_computados_vt', parseFloat(e.target.value) || workingDays)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                </div>
                )}
              </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ALIRIA SP */}
      {spEmployees.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="text-blue-600">●</span> ALIRIA SP
          </h3>
          <div className="bg-gradient-to-b from-orange-50 to-white border border-orange-200 rounded-lg p-4 space-y-3">
            {spEmployees.map(({ emp, vrValue, vtValue, bonusValue, totalValue, adj, diasVR, diasVT }) => {
              const isPartner = emp.is_partner && (emp.partner_vt_weekly ?? 0) > 0
              return (
                <div key={emp.id} className="bg-white border border-orange-100 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-slate-800">{emp.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {companyShort(emp.company_cnpj)}
                      {isPartner && <span className="ml-2 font-semibold text-purple-600">• Sócio(a)</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">TOTAL FLASH</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalValue)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Vale Refeição */}
                  {emp.meal_voucher && (
                    <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded p-3">
                      <p className="text-xs font-semibold text-orange-600 mb-2">🍽️ VALE REFEIÇÃO</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Dias computados:</span>
                          <span className="font-semibold text-slate-800">{diasVR.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Taxa diária:</span>
                          <span className="font-semibold text-slate-800">R$ {vrConfig.daily_rate.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-orange-200 flex justify-between font-semibold">
                          <span className="text-orange-700">Subtotal VR:</span>
                          <span className="text-orange-600">{formatCurrency(vrValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vale Transporte */}
                  {(emp.transport_voucher || isPartner) && (
                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded p-3">
                      <p className="text-xs font-semibold text-green-600 mb-2">🚌 VALE TRANSPORTE</p>
                      <div className="space-y-2 text-xs">
                        {isPartner ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Semanas a computar:</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="5"
                                value={adj.semanas_vt ?? 4}
                                onChange={e => updateAdjustment(emp.id, 'semanas_vt', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-slate-300 rounded font-semibold text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                              />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">VT semanal:</span>
                              <span className="font-semibold text-slate-800">R$ {(emp.partner_vt_weekly ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-blue-600 font-semibold italic text-xs">
                              <span>Sem descontos (sócio)</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Dias úteis (VT):</span>
                              <span className="font-semibold text-slate-800">{diasVT.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Custo/dia:</span>
                              <span className="font-semibold text-slate-800">R$ {(emp.transport_voucher_cost ?? 0).toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        <div className="pt-2 border-t border-green-200 flex justify-between font-semibold">
                          <span className="text-green-700">Subtotal VT:</span>
                          <span className="text-green-600">{formatCurrency(vtValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bônus Mensal */}
                  {bonusValue > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded p-3">
                      <p className="text-xs font-semibold text-purple-600 mb-2">💰 BÔNUS MENSAL</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Valor:</span>
                          <span className="font-semibold text-slate-800">{formatCurrency(bonusValue)}</span>
                        </div>
                        <div className="pt-2 border-t border-purple-200 flex justify-between font-semibold">
                          <span className="text-purple-700">Subtotal:</span>
                          <span className="text-purple-600">{formatCurrency(bonusValue)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Adjustments - Funcionários: 2 campos separados */}
                {!emp.is_partner && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                  <div className="grid gap-2 text-xs">
                    <div>
                      <label className="text-slate-500 block mb-1">Dias a computar (VR)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={workingDays}
                        value={adj.dias_computados_vr ?? workingDays}
                        onChange={e => updateAdjustment(emp.id, 'dias_computados_vr', parseFloat(e.target.value) || workingDays)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Dias a computar (VT)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={workingDays}
                        value={adj.dias_computados_vt ?? workingDays}
                        onChange={e => updateAdjustment(emp.id, 'dias_computados_vt', parseFloat(e.target.value) || workingDays)}
                        className="w-full px-2 py-1 border border-slate-300 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                </div>
                )}
              </div>
            )
          })}
          </div>
        </div>
      )}

      {/* TOTAL GERAL */}
      {(() => {
        const totalBonus = allEmployeesWithBenefits.reduce((s, item) => s + item.bonusValue, 0)
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg px-5 py-5 text-white">
              <p className="text-sm font-medium opacity-90">TOTAL FLASH PARA {flashMonth.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()} DE {flashMonth.getFullYear()}</p>
              <p className="text-4xl font-bold mt-3">{formatCurrency(total)}</p>
              <p className="text-xs opacity-80 mt-2">Depósito único a realizar no dia {lastWorkingDay}</p>
              <div className="text-sm opacity-90 mt-4 grid grid-cols-4">
                <div>
                  <p className="text-xs opacity-75">Vale Refeição</p>
                  <p className="font-semibold">{formatCurrency(vrTotal)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Vale Transporte</p>
                  <p className="font-semibold">{formatCurrency(vtTotal)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Bônus</p>
                  <p className="font-semibold">{formatCurrency(totalBonus)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Colaboradores</p>
                  <p className="font-semibold">{allEmployeesWithBenefits.length}</p>
                </div>
              </div>
            </div>

            {/* ─ Validation Status and Button ─ */}
            {monthlyValidation?.is_validated ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg px-5 py-4 flex items-center gap-3">
                <Lock size={20} className="text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">
                    ✓ De Acordo em {new Date(monthlyValidation.validated_at).toLocaleDateString('pt-BR')} às {new Date(monthlyValidation.validated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-green-700 mt-1">Validado por {monthlyValidation.validated_by} • Cálculos congelados</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  const benefitsSnapshot = {
                    vr_total: vrTotal,
                    vt_total: vtTotal,
                    bonus_total: totalBonus,
                    grand_total: total,
                    working_days: workingDays,
                    employees_count: allEmployeesWithBenefits.length,
                    calculated_at: new Date().toISOString(),
                  }
                  onValidateMonth(benefitsSnapshot)
                }}
                disabled={isValidating}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-semibold py-4 px-5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    De Acordo com {flashMonth.toLocaleDateString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())}
                  </>
                )}
              </button>
            )}
          </div>
        )
      })()}
    </div>
  )
}
