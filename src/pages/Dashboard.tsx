import { Building2, Users, Award, Wind, UserSearch, UserX, BarChart3, Megaphone, BookOpen, DollarSign, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/Card'

const modules = [
  { label: 'Identidade Organizacional', icon: Building2, to: '/identidade', color: 'bg-indigo-50 text-indigo-600', desc: 'Missão, visão, valores e cultura' },
  { label: 'Descrição de Cargos', icon: Users, to: '/cargos', color: 'bg-blue-50 text-blue-600', desc: 'Estrutura e responsabilidades' },
  { label: 'Competências', icon: Award, to: '/competencias', color: 'bg-purple-50 text-purple-600', desc: 'Mapeamento e indicadores' },
  { label: 'Pesquisa de Clima', icon: Wind, to: '/clima', color: 'bg-cyan-50 text-cyan-600', desc: 'Engajamento e satisfação' },
  { label: 'Recrutamento & Seleção', icon: UserSearch, to: '/recrutamento', color: 'bg-green-50 text-green-600', desc: 'Por competências' },
  { label: 'Gestão de Desligamento', icon: UserX, to: '/desligamento', color: 'bg-red-50 text-red-600', desc: 'Offboarding estruturado' },
  { label: 'Avaliação de Desempenho', icon: BarChart3, to: '/desempenho', color: 'bg-orange-50 text-orange-600', desc: 'Por competências' },
  { label: 'Endomarketing', icon: Megaphone, to: '/endomarketing', color: 'bg-pink-50 text-pink-600', desc: 'Comunicação interna' },
  { label: 'Plano de Treinamento', icon: BookOpen, to: '/treinamento', color: 'bg-yellow-50 text-yellow-600', desc: 'PDI e capacitação' },
  { label: 'Cargos e Salários', icon: DollarSign, to: '/cargos-salarios', color: 'bg-emerald-50 text-emerald-600', desc: 'Estrutura salarial' },
  { label: 'KPIs de RH', icon: TrendingUp, to: '/kpis', color: 'bg-slate-50 text-slate-600', desc: 'Indicadores estratégicos' },
]

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Aliria People</h2>
        <p className="text-orange-100 text-sm max-w-xl">
          Plataforma integrada de gestão de pessoas com todos os módulos essenciais para uma área de RH estratégica e eficiente.
        </p>
        <div className="mt-6 flex gap-4">
          <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold">10</p>
            <p className="text-xs text-orange-100">Módulos ativos</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold">360°</p>
            <p className="text-xs text-orange-100">Visão de RH</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold">KPIs</p>
            <p className="text-xs text-orange-100">Integrados</p>
          </div>
        </div>
      </div>

      {/* Tripé */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Tripé Estratégico</h3>
        <div className="grid grid-cols-3 gap-4">
          {modules.slice(0, 3).map(m => (
            <Link key={m.to} to={m.to}>
              <Card className="hover:shadow-md transition-all group">
                <CardContent className="flex items-start gap-4 py-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>
                    <m.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors mt-1 flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Módulos */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Módulos de RH</h3>
        <div className="grid grid-cols-4 gap-4">
          {modules.slice(3).map(m => (
            <Link key={m.to} to={m.to}>
              <Card className="hover:shadow-md transition-all group h-full">
                <CardContent className="flex flex-col gap-3 py-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color}`}>
                    <m.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{m.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-xs text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Acessar <ArrowRight size={12} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
