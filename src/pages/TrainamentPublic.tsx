import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function TrainmentPublic() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    collaborator_name: '',
    collaborator_email: '',
    question_1_response: '',
    question_2_response: '',
    question_3_response: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('rh_training_responses')
        .insert([
          {
            training_id: 'chatbot_empatico_001',
            training_title: 'Atendimento Empático em Chatbot',
            collaborator_name: formData.collaborator_name,
            collaborator_email: formData.collaborator_email,
            question_1_response: formData.question_1_response,
            question_2_response: formData.question_2_response,
            question_3_response: formData.question_3_response,
          },
        ])

      if (insertError) throw insertError

      setSubmitted(true)
      setFormData({
        collaborator_name: '',
        collaborator_email: '',
        question_1_response: '',
        question_2_response: '',
        question_3_response: '',
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar respostas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📱 Treinamento: Atendimento Empático em Chatbot
          </h1>
          <p className="text-xl text-gray-600 mb-2">Duração: 2 horas</p>
          <p className="text-gray-500">Complete o treinamento e responda as perguntas abaixo</p>
        </div>

        {/* Conteúdo do Treinamento */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Resumo do Treinamento</h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-bold text-lg mb-2">🎯 Os 3 Pilares</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Clareza</strong>: Mensagens diretas, sem ambiguidade</li>
                <li><strong>Empatia</strong>: Reconhecimento de sentimentos</li>
                <li><strong>Eficiência</strong>: Respostas rápidas e precisas</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">💬 Tom de Voz Ideal</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Profissional - Competente, seguro</li>
                <li>Amigável - Acessível, personalizado</li>
                <li>Respeitoso - Formal quando necessário</li>
                <li>Empático - Compreensivo das dificuldades</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">✨ Palavras-Chave de Gentileza</h3>
              <p className="text-sm bg-blue-50 p-3 rounded">
                Por favor, obrigado, desculpa, entendo, claro, sem problema, com prazer, fico feliz em ajudar
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">📋 Regra de Ouro</h3>
              <p className="bg-green-50 p-3 rounded">
                <strong>Uma ideia por mensagem. Máximo 3 linhas.</strong> Escreva como se estivesse falando com um amigo.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>💡 Dica:</strong> Você pode abrir o documento completo em:
              <br/><code className="bg-yellow-100 px-2 py-1 rounded text-xs">C:\Users\Klissia Corazza\Downloads\Treinamento-Atendimento-Empatico-em-Chatbot.md</code>
            </p>
          </div>
        </div>

        {/* Separador */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-blue-300"></div>
          <span className="text-blue-600 font-bold">✍️ AGORA RESPONDA AS PERGUNTAS ABAIXO</span>
          <div className="flex-1 h-px bg-blue-300"></div>
        </div>

        {/* Formulário de Respostas */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✍️ Responda as Perguntas</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-green-900 mb-1">Respostas enviadas com sucesso!</h3>
                  <p className="text-green-700 text-sm">
                    Obrigado por completar o treinamento. Suas respostas foram registradas e Klissia receberá uma notificação.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-bold text-red-900 mb-1">Erro ao enviar</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados do Colaborador */}
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <h3 className="font-bold text-lg text-gray-900">Seus Dados</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      type="text"
                      name="collaborator_name"
                      value={formData.collaborator_name}
                      onChange={handleChange}
                      required
                      placeholder="Ex: João Silva"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="collaborator_email"
                      value={formData.collaborator_email}
                      onChange={handleChange}
                      required
                      placeholder="Ex: joao@aliria.com"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Perguntas do Teste */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      1️⃣ Reescreva esta mensagem para ser mais empática e clara:
                      <br/>
                      <code className="bg-gray-100 text-xs p-2 rounded mt-2 block">"Sistema indisponível"</code>
                    </label>
                    <Textarea
                      name="question_1_response"
                      value={formData.question_1_response}
                      onChange={handleChange}
                      required
                      placeholder="Sua resposta aqui..."
                      rows={3}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Dica: Seja empático, claro, use tom acessível e ofereça próximo passo
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      2️⃣ Reescreva esta mensagem para ser melhor:
                      <br/>
                      <code className="bg-gray-100 text-xs p-2 rounded mt-2 block">"Documento inválido, tente novamente"</code>
                    </label>
                    <Textarea
                      name="question_2_response"
                      value={formData.question_2_response}
                      onChange={handleChange}
                      required
                      placeholder="Sua resposta aqui..."
                      rows={3}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Dica: Ajude o colaborador a resolver o problema, não só aponte o erro
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      3️⃣ Reescreva esta mensagem para ser mais útil:
                      <br/>
                      <code className="bg-gray-100 text-xs p-2 rounded mt-2 block">"Pedido não encontrado"</code>
                    </label>
                    <Textarea
                      name="question_3_response"
                      value={formData.question_3_response}
                      onChange={handleChange}
                      required
                      placeholder="Sua resposta aqui..."
                      rows={3}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Dica: Ofereça uma solução alternativa ou próximo passo
                    </p>
                  </div>
                </div>

                {/* Botão Enviar */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-bold text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="animate-spin" size={20} />
                      Enviando...
                    </span>
                  ) : (
                    '✅ Enviar Respostas'
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ao enviar, você concorda que suas respostas serão revisadas por Klissia
                </p>
              </form>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Parabéns!</h3>
                <p className="text-gray-600 mb-6">
                  Você completou o treinamento de "Atendimento Empático em Chatbot"
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  ← Voltar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Treinamento criado para a equipe Aliria com ❤️</p>
          <p>Versão 1.0 — Maio 2026</p>
        </div>
      </div>
    </div>
  )
}
