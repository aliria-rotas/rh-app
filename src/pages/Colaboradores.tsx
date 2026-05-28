import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { dbEmployees } from '@/lib/db'
import {
  Employee, EmployeeStatus, ContractType, Gender, MaritalStatus,
  PositionChange, PositionChangeReason, MedicalExam, MedicalExamResult,
  HealthPlanDependent, DependentRelationship,
} from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Plus, Pencil, Trash2, Users, Search, Building2, Calendar,
  FileText, ShieldCheck, MapPin, TrendingUp, CircleDot,
  AlertTriangle, CheckCircle2, Clock, Stethoscope, X, Home,
} from 'lucide-react'

// ─── Empresas ─────────────────────────────────────────────────────────────────
const KNOWN_COMPANIES = [
  { label: 'Aliria SP — 47.848.127/0002-00', name: 'ALIRIA MEDICAMENTOS ESPECIAIS LTDA', cnpj: '47.848.127/0002-00' },
  { label: 'Aliria SC — 47.848.127/0001-29', name: 'ALIRIA MEDICAMENTOS ESPECIAIS LTDA', cnpj: '47.848.127/0001-29' },
  { label: 'Alicare — 58.348.779/0001-10',   name: 'ALICARE DISTRIBUIDORA LTDA',         cnpj: '58.348.779/0001-10' },
]
const COMPANY_OPTS = [
  { value: '', label: 'Selecione a empresa...' },
  ...KNOWN_COMPANIES.map(c => ({ value: c.cnpj, label: c.label })),
  { value: '__outro', label: 'Outra empresa' },
]
function companyShortName(cnpj: string) {
  if (cnpj === '47.848.127/0002-00') return 'Aliria SP'
  if (cnpj === '47.848.127/0001-29') return 'Aliria SC'
  if (cnpj === '58.348.779/0001-10') return 'Alicare'
  return cnpj || '—'
}
const COMPANY_COLORS: Record<string, string> = {
  '47.848.127/0002-00': 'bg-orange-50 text-orange-700 border-orange-200',
  '47.848.127/0001-29': 'bg-blue-50 text-blue-700 border-blue-200',
  '58.348.779/0001-10': 'bg-purple-50 text-purple-700 border-purple-200',
}
const COMPANY_HEADER_COLORS: Record<string, string> = {
  '47.848.127/0002-00': 'from-orange-500 to-orange-600',
  '47.848.127/0001-29': 'from-blue-500 to-blue-600',
  '58.348.779/0001-10': 'from-purple-500 to-purple-600',
}

// ─── Exames ───────────────────────────────────────────────────────────────────
const EXAM_TYPE_OPTS = [
  { value: 'ASO Periódico', label: 'ASO Periódico' },
  { value: 'ASO Admissional', label: 'ASO Admissional' },
  { value: 'ASO Demissional', label: 'ASO Demissional' },
  { value: 'ASO Retorno ao Trabalho', label: 'ASO Retorno ao Trabalho' },
  { value: 'Audiometria', label: 'Audiometria' },
  { value: 'Acuidade Visual', label: 'Acuidade Visual' },
  { value: 'Espirometria', label: 'Espirometria' },
  { value: 'Eletrocardiograma (ECG)', label: 'Eletrocardiograma (ECG)' },
  { value: 'Hemograma Completo', label: 'Hemograma Completo' },
  { value: 'Raio-X de Tórax', label: 'Raio-X de Tórax' },
  { value: '__outro', label: 'Outro (digitar)' },
]
const EXAM_RESULT_OPTS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'apto', label: 'Apto' },
  { value: 'apto_com_restricao', label: 'Apto com Restrição' },
  { value: 'inapto', label: 'Inapto' },
]
const RESULT_COLOR: Record<MedicalExamResult, string> = {
  apto: 'bg-green-100 text-green-700',
  apto_com_restricao: 'bg-yellow-100 text-yellow-700',
  inapto: 'bg-red-100 text-red-700',
  pendente: 'bg-slate-100 text-slate-500',
}
const RESULT_LABEL: Record<MedicalExamResult, string> = {
  apto: 'Apto', apto_com_restricao: 'Apto c/ Restrição', inapto: 'Inapto', pendente: 'Pendente',
}

function examStatus(next_exam_date: string): 'vencido' | 'alerta' | 'ok' | 'sem_data' {
  if (!next_exam_date) return 'sem_data'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(next_exam_date + 'T00:00:00')
  const days = Math.floor((due.getTime() - today.getTime()) / 86400000)
  if (days < 0) return 'vencido'
  if (days <= 30) return 'alerta'
  return 'ok'
}
function daysLabel(next_exam_date: string): string {
  if (!next_exam_date) return ''
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(next_exam_date + 'T00:00:00')
  const days = Math.floor((due.getTime() - today.getTime()) / 86400000)
  if (days < 0) return `vencido há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}`
  if (days === 0) return 'vence hoje'
  return `vence em ${days} dia${days !== 1 ? 's' : ''}`
}

// ─── Motivos de cargo ─────────────────────────────────────────────────────────
const REASON_OPTS = [
  { value: 'promocao', label: 'Promoção' },
  { value: 'transferencia', label: 'Transferência de setor' },
  { value: 'readequacao_salarial', label: 'Readequação salarial' },
  { value: 'ajuste_salarial', label: 'Ajuste salarial' },
  { value: 'mudanca_contrato', label: 'Mudança de contrato' },
  { value: 'outro', label: 'Outro' },
]
const REASON_LABEL: Record<PositionChangeReason, string> = {
  promocao: 'Promoção', transferencia: 'Transferência', readequacao_salarial: 'Readequação',
  ajuste_salarial: 'Ajuste salarial', mudanca_contrato: 'Mudança de contrato', outro: 'Outro',
}
const REASON_COLOR: Record<PositionChangeReason, string> = {
  promocao: 'bg-green-100 text-green-700', transferencia: 'bg-blue-100 text-blue-700',
  readequacao_salarial: 'bg-orange-100 text-orange-700', ajuste_salarial: 'bg-yellow-100 text-yellow-700',
  mudanca_contrato: 'bg-purple-100 text-purple-700', outro: 'bg-slate-100 text-slate-600',
}

// ─── Outros selects ────────────────────────────────────────────────────────────
const STATUS_OPTS = [{ value: 'ativo', label: 'Ativo' }, { value: 'afastado', label: 'Afastado' }, { value: 'ferias', label: 'Férias' }, { value: 'inativo', label: 'Inativo' }]
const CONTRACT_OPTS = [{ value: 'clt', label: 'CLT' }, { value: 'pj', label: 'PJ' }, { value: 'estagio', label: 'Estágio' }, { value: 'temporario', label: 'Temporário' }, { value: 'autonomo', label: 'Autônomo' }]
const GENDER_OPTS = [{ value: 'masculino', label: 'Masculino' }, { value: 'feminino', label: 'Feminino' }, { value: 'outro', label: 'Outro' }, { value: 'prefiro_nao_informar', label: 'Prefiro não informar' }]
const MARITAL_OPTS = [{ value: 'solteiro', label: 'Solteiro(a)' }, { value: 'casado', label: 'Casado(a)' }, { value: 'divorciado', label: 'Divorciado(a)' }, { value: 'viuvo', label: 'Viúvo(a)' }, { value: 'uniao_estavel', label: 'União Estável' }]
const STATE_OPTS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(s => ({ value: s, label: s }))
const STATUS_COLOR: Record<EmployeeStatus, 'green'|'yellow'|'blue'|'red'> = { ativo: 'green', afastado: 'yellow', ferias: 'blue', inativo: 'red' }
const STATUS_LABEL: Record<EmployeeStatus, string> = { ativo: 'Ativo', afastado: 'Afastado', ferias: 'Férias', inativo: 'Inativo' }
const CONTRACT_LABEL: Record<ContractType, string> = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', temporario: 'Temporário', autonomo: 'Autônomo' }

// ─── Benefícios ───────────────────────────────────────────────────────────────
type BenefitKey = 'health_plan' | 'dental_plan' | 'meal_voucher' | 'transport_voucher' | 'life_insurance'
const BENEFITS_CATALOG: { key: BenefitKey; name: string; colorOn: string }[] = [
  { key: 'health_plan',       name: 'Convênio Médico',         colorOn: 'bg-blue-50 text-blue-700 border-blue-200'    },
  { key: 'dental_plan',       name: 'Convênio Odontológico',   colorOn: 'bg-teal-50 text-teal-700 border-teal-200'    },
  { key: 'meal_voucher',      name: 'Vale Refeição',           colorOn: 'bg-green-50 text-green-700 border-green-200'  },
  { key: 'transport_voucher', name: 'Vale Transporte',         colorOn: 'bg-green-50 text-green-700 border-green-200'  },
  { key: 'life_insurance',    name: 'Seguro de Vida em Grupo', colorOn: 'bg-purple-50 text-purple-700 border-purple-200'},
]
const DEFAULT_BENEFIT_PROVIDERS: Record<BenefitKey, string> = {
  health_plan:       'Alice Operadora',
  dental_plan:       'Sul América',
  meal_voucher:      'Flash',
  transport_voucher: 'Flash',
  life_insurance:    'Porto Seguro',
}
const WEEKDAY_OPTS = [
  { value: '', label: 'Não definido' },
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca',   label: 'Terça-feira'   },
  { value: 'quarta',  label: 'Quarta-feira'  },
  { value: 'quinta',  label: 'Quinta-feira'  },
  { value: 'sexta',   label: 'Sexta-feira'   },
]
const WEEKDAY_LABEL: Record<string, string> = {
  segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta',
}
const HOME_OFFICE_START = '11/05/2025'

// ─── Form vazio ────────────────────────────────────────────────────────────────
function emptyForm(): Omit<Employee, 'id'|'created_at'|'updated_at'> {
  return {
    company: '', company_cnpj: '', is_partner: false, partner_vt_weekly: 0, full_name: '', birth_date: '', gender: 'prefiro_nao_informar',
    marital_status: 'solteiro', nationality: 'Brasileira', cpf: '', rg: '', rg_issuer: '',
    address_street: '', address_number: '', address_complement: '', address_neighborhood: '',
    address_city: '', address_state: 'SP', address_zip: '',
    email: '', email_corp: '', phone: '', phone_emergency: '', emergency_contact_name: '',
    position: '', department: '', contract_type: 'clt', hire_date: '', salary: 0, status: 'ativo',
    pis_pasep: '', ctps_number: '', ctps_series: '',
    health_plan: false, health_plan_cost: 0, health_plan_dependents: [],
    dental_plan: false, life_insurance: false,
    meal_voucher: false, transport_voucher: false, transport_voucher_cost: 0,
    home_office_day: '', banco_horas_days: 0, day_off_dates: [], notes: '',
    position_history: [], medical_exams: [],
  }
}
function emptyExamForm() {
  return { exam_type: 'ASO Periódico', custom_type: '', last_exam_date: '', next_exam_date: '', result: 'pendente' as MedicalExamResult, notes: '' }
}
function emptyHistoryForm() {
  return {
    date: new Date().toISOString().slice(0, 10),
    position: '',     // cargo ANTERIOR — salvo no histórico
    salary: 0,        // salário ANTERIOR — salvo no histórico
    newPosition: '',  // novo cargo — atualiza o atual
    newSalary: 0,     // novo salário — atualiza o atual
    reason: 'promocao' as PositionChangeReason,
    notes: '',
  }
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }: { name: string; size?: 'sm'|'md'|'lg' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const colors = ['bg-orange-500','bg-blue-500','bg-purple-500','bg-green-500','bg-pink-500','bg-teal-500']
  const color = colors[(name.charCodeAt(0) ?? 0) % colors.length]
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }
  return <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>{initials||'?'}</div>
}

// ─── Linha do tempo de cargos ─────────────────────────────────────────────────
function PositionTimeline({ history, currentPosition, currentSalary, hireDate }: { history: PositionChange[], currentPosition: string, currentSalary: number, hireDate: string }) {
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="space-y-0">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-orange-500 mt-1 flex-shrink-0" />
          {(sorted.length > 0 || hireDate) && <div className="w-0.5 bg-slate-200 flex-1 mt-1" />}
        </div>
        <div className="pb-5 flex-1">
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Cargo atual</span>
          <p className="text-sm font-semibold text-slate-800 mt-1">{currentPosition||'—'}</p>
          <p className="text-xs text-slate-500 mt-0.5">{currentSalary ? formatCurrency(currentSalary) : '—'}</p>
        </div>
      </div>
      {sorted.map((entry, i) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <CircleDot size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
            {(i < sorted.length - 1 || hireDate) && <div className="w-0.5 bg-slate-200 flex-1 mt-1" />}
          </div>
          <div className="pb-5 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-slate-400">{formatDate(entry.date)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REASON_COLOR[entry.reason]}`}>{REASON_LABEL[entry.reason]}</span>
            </div>
            <p className="text-sm font-medium text-slate-700">{entry.position}</p>
            <p className="text-xs text-slate-500">{entry.salary ? formatCurrency(entry.salary) : '—'}</p>
            {entry.notes && <p className="text-xs text-slate-400 italic mt-1">{entry.notes}</p>}
          </div>
        </div>
      ))}
      {hireDate && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-slate-300 mt-0.5 flex-shrink-0" />
          </div>
          <div className="pb-2 flex-1">
            <p className="text-xs text-slate-400">Admissão — {formatDate(hireDate)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type TabId = 'pessoal'|'profissional'|'contato'|'documentos'|'beneficios'|'historico'|'exames'
const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'pessoal',      label: 'Dados Pessoais', icon: Users       },
  { id: 'profissional', label: 'Profissional',   icon: Building2   },
  { id: 'contato',      label: 'Contato',        icon: FileText    },
  { id: 'documentos',   label: 'Documentos',     icon: ShieldCheck },
  { id: 'beneficios',   label: 'Benefícios',     icon: Home        },
  { id: 'historico',    label: 'Hist. Cargos',   icon: TrendingUp  },
  { id: 'exames',       label: 'Exames',         icon: Stethoscope },
]
const TAB_ORDER: TabId[] = ['pessoal','profissional','contato','documentos','beneficios','historico','exames']

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Colaboradores() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [viewing, setViewing] = useState<Employee | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [customCompany, setCustomCompany] = useState(false)
  const [tab, setTab] = useState<TabId>('pessoal')
  const [search, setSearch] = useState('')
  const [activeCompanyTab, setActiveCompanyTab] = useState('todos')
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [editingSalary, setEditingSalary] = useState<{ id: string; draft: string } | null>(null)

  // Prestadores de benefícios — config global em localStorage
  const [benefitProviders, setBenefitProviders] = useState<Record<BenefitKey, string>>(() => {
    try {
      const stored = localStorage.getItem('aliria_benefit_providers')
      return stored ? { ...DEFAULT_BENEFIT_PROVIDERS, ...JSON.parse(stored) } : { ...DEFAULT_BENEFIT_PROVIDERS }
    } catch { return { ...DEFAULT_BENEFIT_PROVIDERS } }
  })
  const [editingProvider, setEditingProvider] = useState<BenefitKey | null>(null)
  const [providerDraft, setProviderDraft] = useState('')

  // Dependentes do plano médico
  const [addingDependent, setAddingDependent] = useState(false)
  const [depForm, setDepForm] = useState<{ name: string; cpf: string; relationship: DependentRelationship; monthly_cost: number }>({
    name: '', cpf: '', relationship: 'filho', monthly_cost: 0,
  })

  // Histórico de cargos
  const [addingHistory, setAddingHistory] = useState(false)
  const [historyForm, setHistoryForm] = useState(emptyHistoryForm())
  const [applyToCurrentPosition, setApplyToCurrentPosition] = useState(true)

  // Exames
  const [addingExam, setAddingExam] = useState(false)
  const [examForm, setExamForm] = useState(emptyExamForm())
  const [editingExamId, setEditingExamId] = useState<string | null>(null)

  // Dias de folga
  const [addingDayOff, setAddingDayOff] = useState(false)
  const [dayOffDraft, setDayOffDraft] = useState('')
  const [dayOffYear, setDayOffYear] = useState(new Date().getFullYear().toString())

  useEffect(() => {
    dbEmployees.list().then(data => { setEmployees(data); setLoading(false) })
  }, [])

  // ── Alertas de exames ──────────────────────────────────────────────────────
  const examAlerts = useMemo(() => {
    const alerts: { employee: Employee; exam: MedicalExam; status: 'vencido'|'alerta' }[] = []
    employees.forEach(emp => {
      (emp.medical_exams ?? []).forEach(exam => {
        const s = examStatus(exam.next_exam_date)
        if (s === 'vencido' || s === 'alerta') alerts.push({ employee: emp, exam, status: s })
      })
    })
    return alerts.sort((a, b) => a.exam.next_exam_date.localeCompare(b.exam.next_exam_date))
  }, [employees])

  const companyGroups = useMemo(() => {
    const filtered = employees.filter(e =>
      !search || e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()) || e.cpf.includes(search)
    )
    if (activeCompanyTab !== 'todos') return { [activeCompanyTab]: filtered.filter(e => e.company_cnpj === activeCompanyTab) }
    const groups: Record<string, Employee[]> = {}
    filtered.forEach(e => {
      // Sócios vão para grupo "SÓCIOS", outros pela empresa
      const k = e.is_partner ? 'SÓCIOS' : (e.company_cnpj||'sem-empresa')
      if (!groups[k]) groups[k] = []
      groups[k].push(e)
    })
    // Ordenar para que SÓCIOS apareça em primeiro
    const ordered: Record<string, Employee[]> = {}
    if (groups['SÓCIOS']) ordered['SÓCIOS'] = groups['SÓCIOS']
    Object.keys(groups).forEach(k => { if (k !== 'SÓCIOS') ordered[k] = groups[k] })
    return ordered
  }, [employees, search, activeCompanyTab])

  const availableCompanies = useMemo(() => [...new Set(employees.map(e => e.company_cnpj).filter(Boolean))], [employees])

  // ── Ações ──────────────────────────────────────────────────────────────────
  function openNew() { setEditing(null); setForm(emptyForm()); setCustomCompany(false); setAddingHistory(false); setAddingExam(false); setTab('pessoal'); setModal(true) }
  function openEdit(emp: Employee) {
    setEditing(emp)
    const { id, created_at, updated_at, ...rest } = emp
    setForm({ ...rest, position_history: rest.position_history??[], medical_exams: rest.medical_exams??[], health_plan_dependents: rest.health_plan_dependents??[], health_plan_cost: rest.health_plan_cost??0, transport_voucher_cost: rest.transport_voucher_cost??0 })
    setCustomCompany(!KNOWN_COMPANIES.find(c => c.cnpj === emp.company_cnpj))
    setAddingHistory(false); setAddingExam(false); setTab('pessoal'); setModal(true)
  }
  function openDetail(emp: Employee) { setViewing(emp); setEditingSalary(null); setDetailModal(true) }

  async function saveQuickSalary() {
    if (!editingSalary) return
    const newSalary = parseFloat(editingSalary.draft.replace(',', '.'))
    if (isNaN(newSalary) || newSalary < 0) { setEditingSalary(null); return }
    try {
      const updated = await dbEmployees.update(editingSalary.id, { salary: newSalary })
      setEmployees(prev => prev.map(e => e.id === editingSalary.id ? updated : e))
      if (viewing?.id === editingSalary.id) setViewing(updated)
    } finally { setEditingSalary(null) }
  }

  async function save() {
    if (!form.full_name.trim()) return
    try {
      if (editing) {
        const updated = await dbEmployees.update(editing.id, form)
        setEmployees(prev => prev.map(e => e.id === editing.id ? updated : e))
        if (viewing?.id === editing.id) setViewing(updated)
      } else {
        const created = await dbEmployees.create(form)
        setEmployees(prev => [...prev, created])
      }
      setModal(false)
    } catch (err) {
      console.error('Save error:', err)
      const errorMsg = err instanceof Error ? err.message :
                      typeof err === 'object' && err !== null && 'message' in err ? (err as any).message :
                      String(err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      alert(`Erro ao salvar: ${errorMsg}`)
    }
  }

  async function remove(id: string) {
    if (!confirm('Deseja remover este colaborador?')) return
    await dbEmployees.remove(id)
    setEmployees(prev => prev.filter(e => e.id !== id))
    if (detailModal && viewing?.id === id) setDetailModal(false)
  }

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) { setForm(prev => ({ ...prev, [key]: value })) }

  function startEditProvider(key: BenefitKey) { setEditingProvider(key); setProviderDraft(benefitProviders[key]) }
  function confirmEditProvider() {
    if (!editingProvider) return
    const updated = { ...benefitProviders, [editingProvider]: providerDraft.trim() || DEFAULT_BENEFIT_PROVIDERS[editingProvider] }
    setBenefitProviders(updated)
    localStorage.setItem('aliria_benefit_providers', JSON.stringify(updated))
    setEditingProvider(null)
  }

  function handleCompanySelect(cnpj: string) {
    if (cnpj === '__outro') { setCustomCompany(true); set('company_cnpj', ''); set('company', '') }
    else { setCustomCompany(false); const f = KNOWN_COMPANIES.find(c => c.cnpj === cnpj); set('company_cnpj', cnpj); set('company', f?.name??'') }
  }

  // Histórico
  function openAddHistory() {
    setHistoryForm({
      ...emptyHistoryForm(),
      position:    form.position, // cargo anterior (ficará no histórico)
      salary:      form.salary,   // salário anterior (ficará no histórico)
      newPosition: form.position, // pré-preenche novo; usuário altera
      newSalary:   form.salary,
    })
    setApplyToCurrentPosition(true)
    setAddingHistory(true)
  }
  function saveHistoryEntry() {
    if (!historyForm.date) return
    const uid = Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2)
    // O registro histórico preserva o CARGO ANTERIOR (o que era antes da mudança)
    const entry: PositionChange = {
      id:       uid,
      date:     historyForm.date,
      position: historyForm.position,
      salary:   historyForm.salary,
      reason:   historyForm.reason,
      notes:    historyForm.notes,
    }
    setForm(prev => ({
      ...prev,
      position_history: [entry, ...(prev.position_history ?? [])],
      ...(applyToCurrentPosition ? {
        position: historyForm.newPosition || historyForm.position,
        salary:   historyForm.newSalary   || historyForm.salary,
      } : {}),
    }))
    setAddingHistory(false)
  }

  // Exames
  function openAddExam() { setExamForm(emptyExamForm()); setEditingExamId(null); setAddingExam(true) }
  function saveExam() {
    const type = examForm.exam_type === '__outro' ? examForm.custom_type : examForm.exam_type
    if (!type.trim()) return
    const uid = editingExamId ?? (Math.random().toString(36).slice(2) + Date.now().toString(36))
    const exam: MedicalExam = { id: uid, exam_type: type, last_exam_date: examForm.last_exam_date, next_exam_date: examForm.next_exam_date, result: examForm.result, notes: examForm.notes }
    if (editingExamId) {
      setForm(prev => ({ ...prev, medical_exams: (prev.medical_exams??[]).map(e => e.id === editingExamId ? exam : e) }))
    } else {
      setForm(prev => ({ ...prev, medical_exams: [...(prev.medical_exams??[]), exam] }))
    }
    setAddingExam(false); setEditingExamId(null)
  }
  function editExam(exam: MedicalExam) {
    const isCustom = !EXAM_TYPE_OPTS.find(o => o.value === exam.exam_type && o.value !== '__outro')
    setExamForm({ exam_type: isCustom ? '__outro' : exam.exam_type, custom_type: isCustom ? exam.exam_type : '', last_exam_date: exam.last_exam_date, next_exam_date: exam.next_exam_date, result: exam.result, notes: exam.notes })
    setEditingExamId(exam.id); setAddingExam(true)
  }
  function removeExam(id: string) { setForm(prev => ({ ...prev, medical_exams: (prev.medical_exams??[]).filter(e => e.id !== id) })) }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total geral', value: employees.length, color: 'text-slate-700' },
          { label: 'Ativos', value: employees.filter(e => e.status === 'ativo').length, color: 'text-green-600' },
          { label: 'Empresas', value: availableCompanies.length, color: 'text-orange-600' },
          { label: 'Exames a vencer', value: examAlerts.length, color: examAlerts.length > 0 ? 'text-red-600' : 'text-slate-400' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Banner de alertas de exames ── */}
      {examAlerts.length > 0 && !alertDismissed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-amber-800">
                {examAlerts.filter(a => a.status === 'vencido').length > 0 && `${examAlerts.filter(a => a.status === 'vencido').length} exame(s) vencido(s) · `}
                {examAlerts.filter(a => a.status === 'alerta').length > 0 && `${examAlerts.filter(a => a.status === 'alerta').length} exame(s) vencem em até 30 dias`}
              </p>
            </div>
            <button onClick={() => setAlertDismissed(true)} className="text-amber-400 hover:text-amber-600"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {examAlerts.map((alert, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm cursor-pointer hover:opacity-90 transition-opacity ${alert.status === 'vencido' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}
                onClick={() => { openEdit(alert.employee); setTimeout(() => setTab('exames'), 100) }}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.status === 'vencido' ? 'bg-red-500' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 truncate">{alert.employee.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{alert.exam.exam_type} · <span className={alert.status === 'vencido' ? 'text-red-600 font-semibold' : 'text-amber-700 font-semibold'}>{daysLabel(alert.exam.next_exam_date)}</span></p>
                </div>
                <Pencil size={12} className="text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Busca + botão */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, cargo ou CPF..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
        </div>
        <Button onClick={openNew}><Plus size={15} className="mr-1.5" />Novo Colaborador</Button>
      </div>

      {/* Tabs empresa */}
      <div className="flex border-b border-slate-200 gap-1">
        {[{ key: 'todos', label: `Todas (${employees.length})` },
          ...KNOWN_COMPANIES.filter(c => availableCompanies.includes(c.cnpj))
            .map(c => ({ key: c.cnpj, label: `${companyShortName(c.cnpj)} (${employees.filter(e => e.company_cnpj === c.cnpj).length})` }))
        ].map(t => (
          <button key={t.key} onClick={() => setActiveCompanyTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeCompanyTab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-slate-200 border-b-orange-500 animate-spin" /></div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Nenhum colaborador cadastrado</p>
          <Button variant="outline" className="mt-4" onClick={openNew}>Cadastrar primeiro colaborador</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(companyGroups).map(([key, group]) => {
            if (group.length === 0) return null
            const isSocios = key === 'SÓCIOS'
            const compInfo = !isSocios ? KNOWN_COMPANIES.find(c => c.cnpj === key) : null
            const headerColor = isSocios ? 'from-purple-500 to-purple-600' : (COMPANY_HEADER_COLORS[key]??'from-slate-500 to-slate-600')
            return (
              <div key={key}>
                <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r ${headerColor} text-white`}>
                  <Building2 size={18} />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{isSocios ? 'SÓCIOS' : (compInfo?.name ?? key)}</p>
                    {!isSocios && <p className="text-xs opacity-80">CNPJ: {key} · {group.filter(e => e.status === 'ativo').length} ativo(s)</p>}
                  </div>
                  <span className="text-lg font-bold">{group.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {group.map(emp => {
                    const empAlerts = (emp.medical_exams??[]).filter(ex => examStatus(ex.next_exam_date) !== 'ok' && examStatus(ex.next_exam_date) !== 'sem_data')
                    return (
                      <Card key={emp.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => openDetail(emp)}>
                        <CardContent className="py-4">
                          <div className="flex items-start gap-3">
                            <Avatar name={emp.full_name} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-800 truncate">{emp.full_name}</p>
                                <Badge variant={STATUS_COLOR[emp.status]}>{STATUS_LABEL[emp.status]}</Badge>
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{emp.position||'—'}</p>
                              {emp.address_city && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10}/>{emp.address_city}/{emp.address_state}</p>}
                              {emp.company_cnpj === '47.848.127/0002-00' && emp.home_office_day && (
                                <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5"><Home size={10}/>HO {WEEKDAY_LABEL[emp.home_office_day]}</p>
                              )}
                            </div>
                          </div>
                          {empAlerts.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-md px-2 py-1">
                              <AlertTriangle size={11} />
                              <span>{empAlerts.length} exame(s) a verificar</span>
                            </div>
                          )}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                            {editingSalary?.id === emp.id ? (
                              <input
                                type="number" step="0.01" min="0"
                                value={editingSalary.draft}
                                onChange={e => setEditingSalary(s => s ? { ...s, draft: e.target.value } : s)}
                                onBlur={saveQuickSalary}
                                onKeyDown={e => { if (e.key === 'Enter') saveQuickSalary(); if (e.key === 'Escape') setEditingSalary(null) }}
                                onClick={e => e.stopPropagation()}
                                className="border border-orange-400 rounded px-2 py-0.5 text-xs font-semibold text-slate-800 w-28 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                                autoFocus
                              />
                            ) : (
                              <button
                                onClick={e => { e.stopPropagation(); setEditingSalary({ id: emp.id, draft: String(emp.salary ?? '') }) }}
                                className="flex items-center gap-1 group/sal font-medium text-slate-500 hover:text-orange-600"
                                title="Clique para corrigir o salário"
                              >
                                {emp.salary ? formatCurrency(emp.salary) : '—'}
                                <Pencil size={10} className="opacity-0 group-hover/sal:opacity-100 transition-opacity" />
                              </button>
                            )}
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{CONTRACT_LABEL[emp.contract_type]}</span>
                          </div>
                          <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEdit(emp)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"><Pencil size={12}/> Editar</button>
                            <button onClick={() => remove(emp.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={12}/> Remover</button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal edição ─────────────────────────────────────────────────────── */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? `Editar — ${editing.full_name}` : 'Novo Colaborador'} size="xl">
        <div className="flex border-b border-slate-200 mb-6 -mt-1 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon
            const badge = t.id === 'historico' ? (form.position_history?.length??0)
                        : t.id === 'exames'    ? (form.medical_exams?.length??0)
                        : t.id === 'beneficios' ? BENEFITS_CATALOG.filter(b => !!(form as Record<string,unknown>)[b.key]).length
                        : 0
            const examBadgeColor = t.id === 'exames' && (form.medical_exams??[]).some(ex => examStatus(ex.next_exam_date) === 'vencido') ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
            return (
              <button key={t.id} onClick={() => { setTab(t.id); setAddingHistory(false); setAddingExam(false) }}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon size={14}/>{t.label}
                {badge > 0 && <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold ${t.id === 'historico' ? 'bg-orange-100 text-orange-600' : examBadgeColor}`}>{badge}</span>}
              </button>
            )
          })}
        </div>

        <div className="space-y-4">
          {/* Pessoal */}
          {tab === 'pessoal' && (<>
            <Input label="Nome completo *" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Nome e sobrenome" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Data de nascimento" type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} />
              <Select label="Sexo" value={form.gender} onChange={v => set('gender', v as Gender)} options={GENDER_OPTS} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Estado civil" value={form.marital_status} onChange={v => set('marital_status', v as MaritalStatus)} options={MARITAL_OPTS} />
              <Input label="Nacionalidade" value={form.nationality} onChange={e => set('nationality', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="CPF" value={form.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" />
              <div className="grid grid-cols-2 gap-2">
                <Input label="RG" value={form.rg} onChange={e => set('rg', e.target.value)} />
                <Input label="Órgão/UF" value={form.rg_issuer} onChange={e => set('rg_issuer', e.target.value)} placeholder="SSP/SP" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Endereço</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2"><Input label="Logradouro" value={form.address_street} onChange={e => set('address_street', e.target.value)} /></div>
              <Input label="Número" value={form.address_number} onChange={e => set('address_number', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Complemento" value={form.address_complement} onChange={e => set('address_complement', e.target.value)} />
              <Input label="Bairro" value={form.address_neighborhood} onChange={e => set('address_neighborhood', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="CEP" value={form.address_zip} onChange={e => set('address_zip', e.target.value)} placeholder="00000-000" />
              <Input label="Cidade" value={form.address_city} onChange={e => set('address_city', e.target.value)} />
              <Select label="Estado" value={form.address_state} onChange={v => set('address_state', v)} options={STATE_OPTS} />
            </div>
          </>)}

          {/* Profissional */}
          {tab === 'profissional' && (<>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</p>
            <Select label="Selecionar empresa" value={customCompany ? '__outro' : (form.company_cnpj||'')} onChange={handleCompanySelect} options={COMPANY_OPTS} />
            {customCompany && <div className="grid grid-cols-2 gap-4"><Input label="Razão social" value={form.company} onChange={e => set('company', e.target.value)} /><Input label="CNPJ" value={form.company_cnpj} onChange={e => set('company_cnpj', e.target.value)} placeholder="00.000.000/0000-00" /></div>}

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_partner ?? false}
                  onChange={e => set('is_partner', e.target.checked)}
                  className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-400"
                />
                <div>
                  <p className="font-semibold text-purple-800">Sócio/Sócia</p>
                  <p className="text-xs text-purple-600">Marque se esta pessoa é sócio da empresa</p>
                </div>
              </label>
              {form.is_partner && (
                <Input
                  label="VT semanal (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.partner_vt_weekly ?? 0}
                  onChange={e => set('partner_vt_weekly', parseFloat(e.target.value) || 0)}
                  placeholder="400"
                  className="mt-3"
                />
              )}
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Cargo atual</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cargo / Função" value={form.position} onChange={e => set('position', e.target.value)} />
              <Input label="Departamento / Setor" value={form.department} onChange={e => set('department', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Tipo de contrato" value={form.contract_type} onChange={v => set('contract_type', v as ContractType)} options={CONTRACT_OPTS} />
              <Select label="Status" value={form.status} onChange={v => set('status', v as EmployeeStatus)} options={STATUS_OPTS} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Data de admissão" type="date" value={form.hire_date} onChange={e => set('hire_date', e.target.value)} />
              <Input label="Salário atual (R$)" type="number" step="0.01" min="0" value={form.salary||''} onChange={e => set('salary', parseFloat(e.target.value)||0)} />
            </div>
            <Textarea label="Observações" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
          </>)}

          {/* Contato */}
          {tab === 'contato' && (<>
            <div className="grid grid-cols-2 gap-4">
              <Input label="E-mail pessoal" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              <Input label="E-mail corporativo" type="email" value={form.email_corp} onChange={e => set('email_corp', e.target.value)} />
            </div>
            <Input label="Telefone / WhatsApp" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 99999-9999" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Contato de emergência</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nome do contato" value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} />
              <Input label="Telefone de emergência" value={form.phone_emergency} onChange={e => set('phone_emergency', e.target.value)} />
            </div>
          </>)}

          {/* Documentos */}
          {tab === 'documentos' && (<>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documentos</p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="PIS/PASEP" value={form.pis_pasep} onChange={e => set('pis_pasep', e.target.value)} />
              <Input label="Nº CTPS" value={form.ctps_number} onChange={e => set('ctps_number', e.target.value)} />
              <Input label="Série CTPS" value={form.ctps_series} onChange={e => set('ctps_series', e.target.value)} />
            </div>
          </>)}

          {/* Benefícios */}
          {tab === 'beneficios' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Benefícios ativos para este colaborador</p>
                  <p className="text-xs text-slate-400 italic">Clique no nome do prestador para editar</p>
                </div>
                <div className="space-y-2.5">
                  {BENEFITS_CATALOG.map(b => {
                    const active = !!(form as Record<string, unknown>)[b.key]
                    return (
                      <div key={b.key} className="border border-slate-200 rounded-xl overflow-hidden">
                        <label className="flex items-center gap-4 p-3.5 cursor-pointer hover:bg-slate-50 transition-colors">
                          <input type="checkbox" checked={active} onChange={e => set(b.key as any, e.target.checked)} className="w-4 h-4 accent-orange-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-700">{b.name}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                              Operadora:{' '}
                              {editingProvider === b.key ? (
                                <input
                                  className="border border-orange-300 rounded px-1.5 py-0 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400 w-36"
                                  value={providerDraft}
                                  onChange={e => setProviderDraft(e.target.value)}
                                  onBlur={confirmEditProvider}
                                  onKeyDown={e => { if (e.key === 'Enter') confirmEditProvider(); if (e.key === 'Escape') setEditingProvider(null) }}
                                  autoFocus
                                  onClick={e => e.preventDefault()}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={e => { e.preventDefault(); startEditProvider(b.key) }}
                                  className="flex items-center gap-1 font-medium text-slate-600 hover:text-orange-600 transition-colors group"
                                >
                                  {benefitProviders[b.key]}
                                  <Pencil size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${active ? b.colorOn : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {active ? 'Ativo' : 'Inativo'}
                          </span>
                        </label>

                        {/* Seção extra: custo individual + configs especiais */}
                        {b.key === 'transport_voucher' && active && (
                          <div className="border-t border-slate-100 bg-green-50/40 px-4 py-3 space-y-2">
                            <div className="flex items-center gap-3">
                              <p className="text-xs text-slate-500 flex-1">Custo por dia útil (ida e volta)</p>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">R$</span>
                                <input
                                  type="number" step="0.01" min="0"
                                  value={form.transport_voucher_cost || ''}
                                  onChange={e => set('transport_voucher_cost' as any, parseFloat(e.target.value) || 0)}
                                  placeholder="10,60"
                                  className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 w-24 text-right focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
                                />
                              </div>
                            </div>
                            {form.company_cnpj === '47.848.127/0002-00' && (
                              <p className="text-xs text-slate-500">
                                {form.home_office_day
                                  ? `⚠️ Home office na ${form.home_office_day}: 1 dia/semana será desconto do VT`
                                  : '💡 Configure um dia de home office para descontar do VT'}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Seção extra do Convênio Médico: custo individual + dependentes */}
                        {b.key === 'health_plan' && active && (
                          <div className="border-t border-slate-100 bg-blue-50/40 px-4 py-3 space-y-3">
                            {/* Custo do titular */}
                            <div className="flex items-center gap-3">
                              <p className="text-xs text-slate-500 flex-1">Custo mensal do titular (faixa etária)</p>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-400">R$</span>
                                <input
                                  type="number" step="0.01" min="0"
                                  value={form.health_plan_cost || ''}
                                  onChange={e => set('health_plan_cost' as any, parseFloat(e.target.value) || 0)}
                                  placeholder="0,00"
                                  className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 w-24 text-right focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                />
                              </div>
                            </div>

                            {/* Dependentes */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-slate-500">
                                  Dependentes ({(form.health_plan_dependents ?? []).length})
                                  {(form.health_plan_dependents ?? []).length > 0 && (
                                    <span className="ml-2 font-normal text-blue-600">
                                      + {formatCurrency((form.health_plan_dependents ?? []).reduce((s, d) => s + d.monthly_cost, 0))}/mês
                                    </span>
                                  )}
                                </p>
                                {!addingDependent && (
                                  <button
                                    type="button"
                                    onClick={() => { setDepForm({ name:'', cpf:'', relationship:'filho', monthly_cost:0 }); setAddingDependent(true) }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                  >
                                    <Plus size={11}/> Adicionar
                                  </button>
                                )}
                              </div>

                              {/* Formulário de novo dependente */}
                              {addingDependent && (
                                <div className="bg-white border border-blue-200 rounded-lg p-3 space-y-2 mb-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs text-slate-500 block mb-1">Nome completo</label>
                                      <input
                                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
                                        value={depForm.name}
                                        onChange={e => setDepForm(p => ({ ...p, name: e.target.value }))}
                                        placeholder="Nome do dependente"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500 block mb-1">CPF (opcional)</label>
                                      <input
                                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300"
                                        value={depForm.cpf}
                                        onChange={e => setDepForm(p => ({ ...p, cpf: e.target.value }))}
                                        placeholder="000.000.000-00"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs text-slate-500 block mb-1">Parentesco</label>
                                      <select
                                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                                        value={depForm.relationship}
                                        onChange={e => setDepForm(p => ({ ...p, relationship: e.target.value as DependentRelationship }))}
                                      >
                                        <option value="conjuge">Cônjuge / Companheiro(a)</option>
                                        <option value="filho">Filho</option>
                                        <option value="filha">Filha</option>
                                        <option value="outro">Outro</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-500 block mb-1">Custo / mês (R$)</label>
                                      <input
                                        type="number" step="0.01" min="0"
                                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-300"
                                        value={depForm.monthly_cost || ''}
                                        onChange={e => setDepForm(p => ({ ...p, monthly_cost: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0,00"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2 justify-end pt-1">
                                    <button type="button" onClick={() => setAddingDependent(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1">Cancelar</button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!depForm.name.trim()) return
                                        const newDep: HealthPlanDependent = {
                                          id: Math.random().toString(36).slice(2),
                                          name: depForm.name.trim(),
                                          cpf: depForm.cpf || undefined,
                                          relationship: depForm.relationship as DependentRelationship,
                                          monthly_cost: depForm.monthly_cost,
                                        }
                                        set('health_plan_dependents' as any, [...(form.health_plan_dependents ?? []), newDep])
                                        setAddingDependent(false)
                                      }}
                                      className="text-xs bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 font-medium"
                                    >Adicionar</button>
                                  </div>
                                </div>
                              )}

                              {/* Lista de dependentes */}
                              {(form.health_plan_dependents ?? []).length > 0 && (
                                <div className="space-y-1.5">
                                  {(form.health_plan_dependents ?? []).map(dep => (
                                    <div key={dep.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                        {dep.name.charAt(0)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-700 truncate">{dep.name.split(' ').slice(0,2).join(' ')}</p>
                                        <p className="text-slate-400 capitalize">{dep.relationship === 'conjuge' ? 'Cônjuge' : dep.relationship}</p>
                                      </div>
                                      <span className="font-semibold text-blue-700 flex-shrink-0">{dep.monthly_cost > 0 ? formatCurrency(dep.monthly_cost) : '—'}</span>
                                      <button
                                        type="button"
                                        onClick={() => set('health_plan_dependents' as any, (form.health_plan_dependents ?? []).filter(d => d.id !== dep.id))}
                                        className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                                      ><X size={13}/></button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {form.company_cnpj === '47.848.127/0002-00' && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Home size={13}/> Home Office</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Home size={17} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-800">1 dia de home office por semana</p>
                        <p className="text-xs text-blue-500 mt-0.5">Vigência desde {HOME_OFFICE_START} · Sorteio a cada 3 meses</p>
                      </div>
                    </div>
                    <Select
                      label="Dia da semana (home office)"
                      value={form.home_office_day ?? ''}
                      onChange={v => set('home_office_day', v)}
                      options={WEEKDAY_OPTS}
                    />
                  </div>
                </div>
              )}

              {/* Banco de Horas */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Folgas Acumuladas</p>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-2">Banco de Horas</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={form.banco_horas_days ?? 0}
                          onChange={e => set('banco_horas_days', parseFloat(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder="0"
                        />
                        <span className="text-xs text-slate-500 font-medium">dias</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Folgas acumuladas por banco de horas. <strong>Nota:</strong> Aniversariantes recebem automaticamente 1 Day Off no mês de aniversário.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dias de Folga */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Calendar size={13}/> Dias de Folga</p>
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 space-y-4">
                  {/* Inputs para adicionar */}
                  {addingDayOff ? (
                    <div className="space-y-3 bg-white border border-cyan-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Data de Folga</label>
                          <input
                            type="date"
                            value={dayOffDraft}
                            onChange={e => setDayOffDraft(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1.5">Ano</label>
                          <select
                            value={dayOffYear}
                            onChange={e => setDayOffYear(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          >
                            {[...Array(5)].map((_, i) => {
                              const year = (new Date().getFullYear() - 1 + i).toString()
                              return <option key={year} value={year}>{year}</option>
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAddingDayOff(false)
                            setDayOffDraft('')
                          }}
                          className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1"
                        >Cancelar</button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!dayOffDraft.trim()) return
                            const currentDates = form.day_off_dates ?? []
                            set('day_off_dates', [...currentDates, dayOffDraft])
                            setAddingDayOff(false)
                            setDayOffDraft('')
                            setDayOffYear(new Date().getFullYear().toString())
                          }}
                          className="text-xs bg-cyan-600 text-white rounded px-3 py-1 hover:bg-cyan-700 font-medium"
                        >Adicionar</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingDayOff(true)
                        setDayOffDraft('')
                        setDayOffYear(new Date().getFullYear().toString())
                      }}
                      className="text-sm font-medium text-cyan-700 hover:text-cyan-800 flex items-center gap-2"
                    >
                      <Plus size={14} /> Adicionar data de folga
                    </button>
                  )}

                  {/* Lista de datas */}
                  {(form.day_off_dates ?? []).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600">Folgas registradas:</p>
                      <div className="space-y-1.5">
                        {(form.day_off_dates ?? [])
                          .sort()
                          .map((date, idx) => {
                            const dateObj = new Date(date + 'T00:00:00')
                            const formatted = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })
                            return (
                              <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                                <Calendar size={13} className="text-cyan-600 flex-shrink-0" />
                                <span className="font-medium text-slate-700">{formatted}</span>
                                <button
                                  type="button"
                                  onClick={() => set('day_off_dates', (form.day_off_dates ?? []).filter((_, i) => i !== idx))}
                                  className="ml-auto text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {(form.day_off_dates ?? []).length === 0 && (
                    <p className="text-xs text-slate-500 italic">Nenhuma folga registrada. As folgas descontadas do mês anterior aparecerão aqui.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Histórico */}
          {tab === 'historico' && (
            <div>
              {addingHistory ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 space-y-4">
                  <p className="text-sm font-semibold text-orange-700 flex items-center gap-2"><TrendingUp size={15}/>Registrar alteração de cargo</p>

                  {/* Cargo ANTERIOR — salvo no histórico */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cargo anterior — ficará no histórico</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-xs text-slate-400 mb-0.5">Cargo</p><p className="font-medium text-slate-700">{historyForm.position || '—'}</p></div>
                      <div><p className="text-xs text-slate-400 mb-0.5">Salário</p><p className="font-medium text-slate-700">{historyForm.salary ? formatCurrency(historyForm.salary) : '—'}</p></div>
                    </div>
                  </div>

                  {/* Data e motivo */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Data da alteração *" type="date" value={historyForm.date} onChange={e => setHistoryForm(p => ({ ...p, date: e.target.value }))} />
                    <Select label="Motivo *" value={historyForm.reason} onChange={v => setHistoryForm(p => ({ ...p, reason: v as PositionChangeReason }))} options={REASON_OPTS} />
                  </div>

                  {/* Novo cargo */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Novo cargo</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Novo cargo / função" value={historyForm.newPosition} onChange={e => setHistoryForm(p => ({ ...p, newPosition: e.target.value }))} placeholder={historyForm.position||'Cargo...'} />
                      <Input label="Novo salário (R$)" type="number" step="0.01" min="0" value={historyForm.newSalary||''} onChange={e => setHistoryForm(p => ({ ...p, newSalary: parseFloat(e.target.value)||0 }))} />
                    </div>
                  </div>

                  <Input label="Observações" value={historyForm.notes} onChange={e => setHistoryForm(p => ({ ...p, notes: e.target.value }))} />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={applyToCurrentPosition} onChange={e => setApplyToCurrentPosition(e.target.checked)} className="w-4 h-4 accent-orange-500" />
                    <span className="text-sm text-slate-600">Atualizar cargo e salário atual para os novos valores</span>
                  </label>
                  <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setAddingHistory(false)}>Cancelar</Button><Button onClick={saveHistoryEntry}>Salvar</Button></div>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-slate-500">{(form.position_history?.length??0)===0 ? 'Nenhuma alteração registrada.' : `${form.position_history?.length} alteração(ões).`}</p>
                  <Button variant="outline" onClick={openAddHistory}><Plus size={14} className="mr-1.5"/>Registrar alteração</Button>
                </div>
              )}
              <PositionTimeline history={form.position_history??[]} currentPosition={form.position} currentSalary={form.salary} hireDate={form.hire_date} />
              {(form.position_history?.length??0) > 0 && !addingHistory && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Remover entrada:</p>
                  {[...form.position_history].sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between text-xs text-slate-500 hover:bg-slate-50 px-2 py-1 rounded-md">
                      <span>{formatDate(entry.date)} — {entry.position}</span>
                      <button onClick={() => setForm(prev => ({ ...prev, position_history: prev.position_history.filter(e => e.id !== entry.id) }))} className="text-red-400 hover:text-red-600"><Trash2 size={12}/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Exames */}
          {tab === 'exames' && (
            <div>
              {addingExam ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 space-y-3">
                  <p className="text-sm font-semibold text-blue-700 flex items-center gap-2"><Stethoscope size={15}/>{editingExamId ? 'Editar exame' : 'Adicionar exame'}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Tipo de exame *" value={examForm.exam_type} onChange={v => setExamForm(p => ({ ...p, exam_type: v }))} options={EXAM_TYPE_OPTS} />
                    <Select label="Resultado" value={examForm.result} onChange={v => setExamForm(p => ({ ...p, result: v as MedicalExamResult }))} options={EXAM_RESULT_OPTS} />
                  </div>
                  {examForm.exam_type === '__outro' && <Input label="Nome do exame *" value={examForm.custom_type} onChange={e => setExamForm(p => ({ ...p, custom_type: e.target.value }))} placeholder="Ex: Glicemia, Raio-X..." />}
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Data de realização" type="date" value={examForm.last_exam_date} onChange={e => setExamForm(p => ({ ...p, last_exam_date: e.target.value }))} />
                    <Input label="Próximo exame (vencimento) *" type="date" value={examForm.next_exam_date} onChange={e => setExamForm(p => ({ ...p, next_exam_date: e.target.value }))} />
                  </div>
                  <Input label="Observações" value={examForm.notes} onChange={e => setExamForm(p => ({ ...p, notes: e.target.value }))} placeholder="Ex: Laudo normal, repetir em 6 meses..." />
                  <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => { setAddingExam(false); setEditingExamId(null) }}>Cancelar</Button><Button onClick={saveExam}>Salvar exame</Button></div>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-slate-500">{(form.medical_exams?.length??0)===0 ? 'Nenhum exame cadastrado.' : `${form.medical_exams?.length} exame(s) cadastrado(s).`}</p>
                  <Button variant="outline" onClick={openAddExam}><Plus size={14} className="mr-1.5"/>Adicionar exame</Button>
                </div>
              )}
              <div className="space-y-2">
                {(form.medical_exams??[]).map(exam => {
                  const st = examStatus(exam.next_exam_date)
                  const statusIcon = st === 'vencido' ? <AlertTriangle size={14} className="text-red-500"/> : st === 'alerta' ? <Clock size={14} className="text-amber-500"/> : <CheckCircle2 size={14} className="text-green-500"/>
                  return (
                    <div key={exam.id} className={`flex items-center gap-3 p-3 rounded-lg border ${st === 'vencido' ? 'bg-red-50 border-red-200' : st === 'alerta' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                      {statusIcon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-700">{exam.exam_type}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${RESULT_COLOR[exam.result]}`}>{RESULT_LABEL[exam.result]}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exam.last_exam_date && `Realizado: ${formatDate(exam.last_exam_date)} · `}
                          {exam.next_exam_date && <span className={st === 'vencido' ? 'text-red-600 font-semibold' : st === 'alerta' ? 'text-amber-600 font-semibold' : ''}>{daysLabel(exam.next_exam_date)}</span>}
                        </p>
                        {exam.notes && <p className="text-xs text-slate-400 italic mt-0.5 truncate">{exam.notes}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editExam(exam)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-md"><Pencil size={13}/></button>
                        <button onClick={() => removeExam(exam.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
          {tab !== 'pessoal' && (
            <button onClick={() => { const ids = TAB_ORDER; setTab(ids[ids.indexOf(tab)-1]); setAddingHistory(false); setAddingExam(false) }} className="text-sm text-slate-500 hover:text-slate-700">← Anterior</button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
            {tab !== 'exames' ? (
              <Button onClick={() => { const ids = TAB_ORDER; setTab(ids[ids.indexOf(tab)+1]) }}>Próximo →</Button>
            ) : (
              <Button onClick={save}>Salvar Colaborador</Button>
            )}
          </div>
        </div>
      </Modal>

      {/* ── Modal detalhe ────────────────────────────────────────────────────── */}
      {viewing && (
        <Modal open={detailModal} onClose={() => setDetailModal(false)} title="" size="xl">
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <Avatar name={viewing.full_name} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-800">{viewing.full_name}</h2>
                  <Badge variant={STATUS_COLOR[viewing.status]}>{STATUS_LABEL[viewing.status]}</Badge>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{CONTRACT_LABEL[viewing.contract_type]}</span>
                  {viewing.company_cnpj && <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${COMPANY_COLORS[viewing.company_cnpj]??'bg-slate-100 text-slate-600 border-slate-200'}`}>{companyShortName(viewing.company_cnpj)}</span>}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{viewing.position}{viewing.department ? ` · ${viewing.department}` : ''}</p>

                {/* Salário — editável inline para correções */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">Salário:</span>
                  {editingSalary?.id === viewing.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number" step="0.01" min="0"
                        value={editingSalary.draft}
                        onChange={e => setEditingSalary(s => s ? { ...s, draft: e.target.value } : s)}
                        onBlur={saveQuickSalary}
                        onKeyDown={e => { if (e.key === 'Enter') saveQuickSalary(); if (e.key === 'Escape') setEditingSalary(null) }}
                        className="border border-orange-400 rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-800 w-36 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                        autoFocus
                      />
                      <span className="text-xs text-slate-400">Enter · Esc para cancelar</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingSalary({ id: viewing.id, draft: String(viewing.salary ?? '') })}
                      className="flex items-center gap-1.5 group/sal"
                      title="Clique para corrigir o salário"
                    >
                      <span className="text-sm font-semibold text-slate-700">{viewing.salary ? formatCurrency(viewing.salary) : '—'}</span>
                      <Pencil size={12} className="text-slate-300 group-hover/sal:text-orange-500 transition-colors" />
                    </button>
                  )}
                </div>

                {viewing.company && <p className="text-xs text-slate-400 mt-0.5">{viewing.company} · CNPJ {viewing.company_cnpj}</p>}
                {viewing.hire_date && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Calendar size={11}/> Admitido em {formatDate(viewing.hire_date)}</p>}
              </div>
              <Button variant="outline" onClick={() => { setDetailModal(false); openEdit(viewing) }}><Pencil size={14} className="mr-1"/>Editar</Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dados Pessoais</p>
                <dl className="space-y-2">
                  {[{ label: 'CPF', value: viewing.cpf }, { label: 'RG', value: viewing.rg ? `${viewing.rg}${viewing.rg_issuer ? ` / ${viewing.rg_issuer}` : ''}` : null }, { label: 'Nascimento', value: viewing.birth_date ? formatDate(viewing.birth_date) : null }, { label: 'Estado civil', value: MARITAL_OPTS.find(o => o.value === viewing.marital_status)?.label }, { label: 'Nacionalidade', value: viewing.nationality }].map(row => row.value ? (
                    <div key={row.label} className="flex gap-2 text-sm"><span className="text-slate-400 w-28 shrink-0">{row.label}</span><span className="text-slate-700 font-medium">{row.value}</span></div>
                  ) : null)}
                </dl>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contato</p>
                <dl className="space-y-2">
                  {[{ label: 'E-mail', value: viewing.email }, { label: 'E-mail corp.', value: viewing.email_corp }, { label: 'Telefone', value: viewing.phone }, { label: 'Emergência', value: viewing.phone_emergency }, { label: 'Contato emerg.', value: viewing.emergency_contact_name }].map(row => row.value ? (
                    <div key={row.label} className="flex gap-2 text-sm"><span className="text-slate-400 w-28 shrink-0">{row.label}</span><span className="text-slate-700 font-medium">{row.value}</span></div>
                  ) : null)}
                </dl>
              </div>
            </div>

            {/* Exames no detalhe */}
            {(viewing.medical_exams?.length??0) > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Stethoscope size={13}/> Exames Periódicos</p>
                  <button onClick={() => { setDetailModal(false); openEdit(viewing); setTimeout(() => setTab('exames'), 100) }} className="text-xs text-orange-500 hover:text-orange-700 flex items-center gap-1 font-medium"><Plus size={12}/>Adicionar</button>
                </div>
                <div className="space-y-2">
                  {(viewing.medical_exams??[]).map(exam => {
                    const st = examStatus(exam.next_exam_date)
                    return (
                      <div key={exam.id} className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm ${st === 'vencido' ? 'bg-red-50 border-red-200' : st === 'alerta' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                        {st === 'vencido' ? <AlertTriangle size={14} className="text-red-500 flex-shrink-0"/> : st === 'alerta' ? <Clock size={14} className="text-amber-500 flex-shrink-0"/> : <CheckCircle2 size={14} className="text-green-500 flex-shrink-0"/>}
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><span className="font-medium text-slate-700">{exam.exam_type}</span><span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${RESULT_COLOR[exam.result]}`}>{RESULT_LABEL[exam.result]}</span></div>
                          {exam.next_exam_date && <p className="text-xs mt-0.5"><span className={st === 'vencido' ? 'text-red-600 font-semibold' : st === 'alerta' ? 'text-amber-600 font-semibold' : 'text-slate-500'}>{daysLabel(exam.next_exam_date)}</span>{exam.last_exam_date && ` · realizado ${formatDate(exam.last_exam_date)}`}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><ShieldCheck size={13}/> Benefícios</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {BENEFITS_CATALOG.map(b => {
                  const active = !!viewing[b.key as keyof Employee]
                  return (
                    <div key={b.key} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm border ${active ? b.colorOn : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-current' : 'bg-slate-300'}`} />
                      <div className="min-w-0">
                        <p className={`font-medium text-xs truncate ${active ? '' : 'line-through'}`}>{b.name}</p>
                        <p className="text-xs opacity-60 truncate">{benefitProviders[b.key]}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              {viewing.company_cnpj === '47.848.127/0002-00' && (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <Home size={14} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">Home Office — 1x/semana</p>
                    <p className="text-xs text-blue-500">
                      {viewing.home_office_day ? `${WEEKDAY_LABEL[viewing.home_office_day] ?? viewing.home_office_day} · desde ${HOME_OFFICE_START}` : `Dia não definido · desde ${HOME_OFFICE_START}`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"><TrendingUp size={13}/> Histórico de Cargos</p>
                <button onClick={() => { setDetailModal(false); openEdit(viewing); setTimeout(() => setTab('historico'), 100) }} className="text-xs text-orange-500 hover:text-orange-700 flex items-center gap-1 font-medium"><Plus size={12}/>Registrar</button>
              </div>
              <PositionTimeline history={viewing.position_history??[]} currentPosition={viewing.position} currentSalary={viewing.salary} hireDate={viewing.hire_date} />
            </div>

            {viewing.notes && <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Observações</p><p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{viewing.notes}</p></div>}
          </div>
        </Modal>
      )}
    </div>
  )
}
