import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LogIn, AlertCircle, CheckCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { signIn } = useAuth()
  const navigate = useNavigate()

  // Validar email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validar formulário
  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!email.trim()) {
      errors.push('Email é obrigatório')
    } else if (!isValidEmail(email)) {
      errors.push('Email inválido')
    }

    if (!password) {
      errors.push('Senha é obrigatória')
    } else if (password.length < 6) {
      errors.push('Senha deve ter no mínimo 6 caracteres')
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setValidationErrors([])

    // Validar antes de enviar
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: any) {
      // Mapear erros do Supabase para mensagens amigáveis
      let friendlyError = 'Erro ao fazer login'

      if (err.message?.includes('Invalid login credentials')) {
        friendlyError = 'Email ou senha incorretos'
      } else if (err.message?.includes('Email not confirmed')) {
        friendlyError = 'Email não foi confirmado. Verifique sua caixa de entrada.'
      } else if (err.message?.includes('User not found')) {
        friendlyError = 'Usuário não encontrado'
      } else if (err.message?.includes('Too many requests')) {
        friendlyError = 'Muitas tentativas de login. Tente novamente mais tarde.'
      } else {
        friendlyError = err.message || 'Erro ao fazer login'
      }

      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Aliria RH</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão de Pessoas</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Erro genérico */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Erros de validação */}
          {validationErrors.length > 0 && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-900 mb-2">Verifique os campos:</p>
              <ul className="space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || validationErrors.length > 0}
              className="w-full py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Aliria RH © 2026 · Sistema de Gestão de Pessoas
        </p>
      </div>
    </div>
  )
}
