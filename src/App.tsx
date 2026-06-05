import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'

import Login from '@/pages/Login'
import Perfil from '@/pages/Perfil'
import Dashboard from '@/pages/Dashboard'
import IdentidadeOrganizacional from '@/pages/IdentidadeOrganizacional'
import Cargos from '@/pages/Cargos'
import Competencias from '@/pages/Competencias'
import PesquisaClima from '@/pages/PesquisaClima'
import Recrutamento from '@/pages/Recrutamento'
import Desligamento from '@/pages/Desligamento'
import AvaliacaoDesempenho from '@/pages/AvaliacaoDesempenho'
import Endomarketing from '@/pages/Endomarketing'
import PlanoTreinamento from '@/pages/PlanoTreinamento'
import CargosSalarios from '@/pages/CargosSalarios'
import KPIs from '@/pages/KPIs'
import Colaboradores from '@/pages/Colaboradores'
import Beneficios from '@/pages/Beneficios'
import Relatorios from '@/pages/Relatorios'
import TrainamentPublic from '@/pages/TrainamentPublic'
import TrainamentReteste from '@/pages/TrainamentReteste'
import TreinamentosPublicos from '@/pages/TreinamentosPublicos'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/treinamento-publico" element={<TrainamentPublic />} />
          <Route path="/reteste-treinamento" element={<TrainamentReteste />} />
          <Route path="/treinamentos-publicos" element={<TreinamentosPublicos />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/identidade" element={<IdentidadeOrganizacional />} />
            <Route path="/cargos" element={<Cargos />} />
            <Route path="/competencias" element={<Competencias />} />
            <Route path="/clima" element={<PesquisaClima />} />
            <Route path="/recrutamento" element={<Recrutamento />} />
            <Route path="/desligamento" element={<Desligamento />} />
            <Route path="/desempenho" element={<AvaliacaoDesempenho />} />
            <Route path="/endomarketing" element={<Endomarketing />} />
            <Route path="/treinamento" element={<PlanoTreinamento />} />
            <Route path="/cargos-salarios" element={<CargosSalarios />} />
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/colaboradores" element={<Colaboradores />} />
            <Route path="/beneficios" element={<Beneficios />} />
            <Route path="/beneficios/detalhamento" element={<Beneficios />} />
            <Route path="/beneficios/calculadora" element={<Beneficios />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
