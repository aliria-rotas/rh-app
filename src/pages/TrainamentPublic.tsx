import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'

export default function TrainmentPublic() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    collaborator_name: '',
    collaborator_email: '',
    question_1_response: '',
    question_2_response: '',
    question_3_response: '',
    question_4_response: '',
    question_5_response: '',
    question_6_response: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    alert('✅ Formulário funciona! Enviando dados...')
    setLoading(true)

    try {
      const { data, error } = await supabase.rpc('insert_training_response', {
        p_training_id: 'chatbot_empatico_001',
        p_training_title: 'Atendimento Empático em Chatbot',
        p_collaborator_name: formData.collaborator_name,
        p_collaborator_email: formData.collaborator_email,
        p_question_1_response: formData.question_1_response,
        p_question_2_response: formData.question_2_response,
        p_question_3_response: formData.question_3_response,
        p_question_4_response: formData.question_4_response,
        p_question_5_response: formData.question_5_response,
        p_question_6_response: formData.question_6_response,
      })

      if (error) {
        alert('❌ Erro: ' + error.message)
        setLoading(false)
        return
      }

      alert('✅ Sucesso! Respostas enviadas!')
      setSubmitted(true)
    } catch (err: any) {
      alert('❌ Erro: ' + err.message)
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
        <div className="text-center">
          <CheckCircle className="text-green-600 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-green-900 mb-2">Obrigado!</h2>
          <p className="text-green-700 mb-6">Suas respostas foram enviadas com sucesso.</p>
          <p className="text-gray-600">Klissia receberá suas respostas para análise.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          📱 Atendimento Empático em Chatbot
        </h1>
        <p className="text-center text-gray-600 mb-8">Duração: 2 horas | Complete o treinamento e responda as perguntas</p>

        {/* RESUMO DO TREINAMENTO */}
        <Card className="mb-8 border-2 border-blue-300">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📚 Resumo do Treinamento</h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">🎯 Os 3 Pilares</h3>
                <ul className="space-y-2 ml-4">
                  <li>✅ <strong>Clareza</strong>: Mensagens diretas, sem ambiguidade</li>
                  <li>✅ <strong>Empatia</strong>: Reconhecimento de sentimentos</li>
                  <li>✅ <strong>Eficiência</strong>: Respostas rápidas e precisas</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">💬 Tom de Voz Ideal</h3>
                <ul className="space-y-2 ml-4">
                  <li>✅ Profissional - Competente, seguro</li>
                  <li>✅ Amigável - Acessível, personalizado</li>
                  <li>✅ Respeitoso - Formal quando necessário</li>
                  <li>✅ Empático - Compreensivo das dificuldades</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">✨ Palavras-Chave</h3>
                <p className="text-sm bg-blue-50 p-3 rounded">
                  Por favor, obrigado, desculpa, entendo, claro, sem problema, com prazer, fico feliz em ajudar
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>📖 Documento Completo:</strong><br/>
                  C:\Users\Klissia Corazza\Downloads\Treinamento-Atendimento-Empatico-em-Chatbot.md
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEPARADOR */}
        <div className="my-8 text-center">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-blue-300"></div>
            <span className="text-blue-600 font-bold whitespace-nowrap">✍️ RESPONDA AS PERGUNTAS</span>
            <div className="flex-1 h-px bg-blue-300"></div>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-bold text-lg">Seus Dados</h3>
                <Input
                  type="text"
                  name="collaborator_name"
                  placeholder="Nome completo"
                  value={formData.collaborator_name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
                <Input
                  type="email"
                  name="collaborator_email"
                  placeholder="Email"
                  value={formData.collaborator_email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Pergunta 1 */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  1️⃣ Reconhecimento de Emoções do Paciente<br/>
                  <span className="text-sm font-normal">Um paciente envia: "Tentei marcar consulta 3 vezes e ninguém consegue me ajudar! Estou desesperado!"</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Como você responderia reconhecendo a frustração e o desespero dele de forma empática e gentil?</p>
                <Textarea
                  name="question_1_response"
                  value={formData.question_1_response}
                  onChange={handleChange}
                  required
                  placeholder="Sua resposta..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Pergunta 2 */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  2️⃣ Erros de Português no Atendimento ao Paciente: MAIS vs MAS<br/>
                  <span className="text-sm font-normal">Reescreva com gentileza e português correto:</span>
                </label>
                <p className="text-sm text-gray-600 mb-2 bg-orange-50 p-2 rounded italic">"Seu documento foi rejeitado mas você pode enviar outro amanhã"</p>
                <p className="text-sm text-gray-600 mb-3">💡 Dica: Use MAIS quando quer adicionar algo. Use MAS quando há contraste/oposição. No atendimento ao paciente, isso é muito importante!</p>
                <Textarea
                  name="question_2_response"
                  value={formData.question_2_response}
                  onChange={handleChange}
                  required
                  placeholder="Sua resposta corrigida e empática..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Pergunta 3 */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  3️⃣ Uso Correto do Gerúndio no Atendimento ao Paciente<br/>
                  <span className="text-sm font-normal">Reescreva com gerúndio correto:</span>
                </label>
                <p className="text-sm text-gray-600 mb-2 bg-orange-50 p-2 rounded italic">"Você vai recebendo o resultado em breve" ou "Você vai consultando o médico amanhã"</p>
                <p className="text-sm text-gray-600 mb-3">💡 Dica: Gerúndio (-ando, -endo, -indo) é para ações em PROGRESSO. "Estou analisando" está certo. "Você vai fazendo" está ERRADO. Isso confunde o paciente!</p>
                <Textarea
                  name="question_3_response"
                  value={formData.question_3_response}
                  onChange={handleChange}
                  required
                  placeholder="Sua resposta corrigida..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Pergunta 4 */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  4️⃣ Erro Comum: "Vou estar" vs "Vou" / "Estou"<br/>
                  <span className="text-sm font-normal">Reescreva com português correto:</span>
                </label>
                <p className="text-sm text-gray-600 mb-2 bg-orange-50 p-2 rounded italic">"Vou estar verificando seu resultado em breve"</p>
                <p className="text-sm text-gray-600 mb-3">💡 Dica: "Vou estar verificando" é ERRADO e confunde muito. Use: "Vou verificar" (futuro) ou "Estou verificando" (em progresso). Esse erro é muito comum na saúde!</p>
                <Textarea
                  name="question_4_response"
                  value={formData.question_4_response}
                  onChange={handleChange}
                  required
                  placeholder="Sua resposta corrigida..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Pergunta 5 */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  5️⃣ Situação Complexa: Investigação + Empatia<br/>
                  <span className="text-sm font-normal">Um paciente irritado diz: "Já fiz o exame na segunda e ainda não tenho resultado! Como assim?"</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Como você investigaria o problema enquanto acalma o paciente? Use pontuação correta e português adequado. Use gerúndio quando apropriado!</p>
                <Textarea
                  name="question_5_response"
                  value={formData.question_5_response}
                  onChange={handleChange}
                  required
                  placeholder="Sua resposta..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Pergunta 6 */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  6️⃣ Aplicação Prática dos 3 Pilares no Atendimento ao Paciente<br/>
                  <span className="text-sm font-normal">Descreva uma situação REAL de atendimento ao paciente onde você usaria Clareza, Empatia e Eficiência juntos.</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Seja prático! Mostre como os pilares funcionam na prática. Atente-se ao português correto (MAIS vs MAS, gerúndio, pontuação)!</p>
                <Textarea
                  name="question_6_response"
                  value={formData.question_6_response}
                  onChange={handleChange}
                  required
                  placeholder="Sua resposta..."
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Botão */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-bold text-lg"
              >
                {loading ? '⏳ Enviando...' : '✅ Enviar Respostas'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-6">
          Treinamento criado para a equipe Aliria com ❤️
        </p>
      </div>
    </div>
  )
}
