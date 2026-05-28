import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  Building2, Users, Award, Wind, UserSearch, UserX,
  BarChart3, Megaphone, BookOpen, DollarSign, TrendingUp,
  ChevronRight, LayoutDashboard, Contact, ShieldCheck, FileBarChart2
} from 'lucide-react'

type NavLeaf = { label: string; icon: LucideIcon; to: string }
type NavSection = { section: string; items: NavLeaf[] }
type NavItem = NavLeaf | NavSection

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Colaboradores', icon: Contact, to: '/colaboradores' },
  {
    section: 'Tripé Estratégico',
    items: [
      { label: 'Identidade Organizacional', icon: Building2, to: '/identidade' },
      { label: 'Descrição de Cargos', icon: Users, to: '/cargos' },
      { label: 'Mapeamento de Competências', icon: Award, to: '/competencias' },
    ]
  },
  {
    section: 'Módulos de RH',
    items: [
      { label: 'Pesquisa de Clima', icon: Wind, to: '/clima' },
      { label: 'Recrutamento & Seleção', icon: UserSearch, to: '/recrutamento' },
      { label: 'Gestão de Desligamento', icon: UserX, to: '/desligamento' },
      { label: 'Avaliação de Desempenho', icon: BarChart3, to: '/desempenho' },
      { label: 'Endomarketing', icon: Megaphone, to: '/endomarketing' },
      { label: 'Plano de Treinamento', icon: BookOpen, to: '/treinamento' },
      { label: 'Cargos e Salários', icon: DollarSign, to: '/cargos-salarios' },
    ]
  },
  {
    section: 'Benefícios',
    items: [
      { label: 'Detalhamento de benefícios', icon: ShieldCheck, to: '/beneficios/detalhamento' },
      { label: 'Calculadora Benefícios', icon: ShieldCheck, to: '/beneficios/calculadora' },
    ]
  },
  {
    section: 'Indicadores',
    items: [
      { label: 'KPIs de RH', icon: TrendingUp, to: '/kpis' },
      { label: 'Relatórios', icon: FileBarChart2, to: '/relatorios' },
    ]
  },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">RH</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">Aliria People</p>
            <p className="text-xs text-slate-500">Gestão de Pessoas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {navItems.map((item, i) => {
          if ('to' in item) {
            const Icon = item.icon
            return (
              <NavLink
                key={i}
                to={item.to}
                end
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            )
          }
          return (
            <div key={i}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {item.section}
              </p>
              <div className="space-y-0.5">
                {item.items.map((sub, j) => {
                  const SubIcon = sub.icon
                  return (
                    <NavLink
                      key={j}
                      to={sub.to}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                        isActive
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      )}
                    >
                      <SubIcon size={16} />
                      <span className="flex-1">{sub.label}</span>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">v1.0 · Aliria People</p>
      </div>
    </aside>
  )
}
