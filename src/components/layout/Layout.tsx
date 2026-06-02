import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { LogOut, User, Settings } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/identidade': 'Identidade Organizacional',
  '/cargos': 'Descrição de Cargos',
  '/competencias': 'Mapeamento de Competências',
  '/clima': 'Pesquisa de Clima Organizacional',
  '/recrutamento': 'Recrutamento e Seleção',
  '/desligamento': 'Gestão de Desligamento',
  '/desempenho': 'Avaliação de Desempenho',
  '/endomarketing': 'Endomarketing',
  '/treinamento': 'Plano de Treinamento',
  '/cargos-salarios': 'Plano de Cargos e Salários',
  '/kpis': 'KPIs de RH',
  '/colaboradores': 'Colaboradores',
  '/beneficios': 'Benefícios',
  '/relatorios': 'Relatórios',
}

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const title = PAGE_TITLES[location.pathname] ?? 'Aliria People'

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>

          {/* User Info + Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition"
                onClick={() => navigate('/perfil')}
              >
                <User size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-slate-700 font-medium">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/perfil')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Meu Perfil"
            >
              <Settings size={16} />
            </button>

            <div className="w-px h-6 bg-slate-200"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Sair"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
