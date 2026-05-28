import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function Perfil() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Aqui você poderia chamar uma API para atualizar o perfil
      // Por enquanto, apenas simulamos
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess('Perfil atualizado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={32} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
              <p className="text-indigo-100 mt-1">Gerencie suas informações pessoais</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Mensagens */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Informações de Conta */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail size={20} className="text-indigo-600" />
              Informações de Conta
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium">
                  {user.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Não pode ser alterado. Contate o administrador se precisar trocar.
                </p>
              </div>

              {/* Status de Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Email
                </label>
                <div className="px-4 py-3 bg-white border border-green-300 rounded-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span className="text-gray-900 font-medium">Confirmado</span>
                </div>
              </div>

              {/* Data de Criação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Conta Criada em
                </label>
                <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Não disponível'}
                </div>
              </div>

              {/* ID do Usuário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID do Usuário
                </label>
                <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-600 text-xs font-mono overflow-hidden overflow-ellipsis">
                  {user.id}
                </div>
              </div>
            </div>
          </div>

          {/* Forma de Segurança */}
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Segurança
            </h2>

            <div className="space-y-3">
              <button className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between group">
                <span className="text-gray-900 font-medium">Trocar Senha</span>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>

              <button className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between group">
                <span className="text-gray-900 font-medium">Sessões Ativas</span>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>

              <button className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-between group">
                <span className="text-gray-900 font-medium">Atividades Recentes</span>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </button>
            </div>
          </div>

          {/* Info sobre RLS */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Privacidade:</strong> Seus dados estão protegidos por políticas de Segurança em Nível de Linha (RLS).
              Você só consegue ver as informações que lhe pertencem, mesmo que tenha acesso ao banco de dados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
