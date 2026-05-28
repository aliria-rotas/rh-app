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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        console.error('Erro ao enviar respostas:', error)
        setLoading(false)
        return
      }

      console.log('✅ Sucesso! Respostas enviadas!', data)
      setSubmitted(true)
    } catch (err: any) {
      console.error('❌ Erro:', err.message)
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

              {/* Pergunta 2 - ALTERNATIVA */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  2️⃣ Erros de Português: MAIS vs MAS<br/>
                  <span className="text-sm font-normal">Qual é a forma CORRETA de responder ao paciente?</span>
                </label>
                <p className="text-sm text-gray-600 mb-3 bg-orange-50 p-2 rounded italic">Frase original (ERRADA): "Seu documento foi rejeitado mas você pode enviar outro amanhã"</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_2_response"
                      value="A) Seu documento foi rejeitado mas temos a solução! Posso orientá-lo."
                      checked={formData.question_2_response === 'A) Seu documento foi rejeitado mas temos a solução! Posso orientá-lo.'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>A)</strong> Seu documento foi rejeitado mas temos a solução! Posso orientá-lo.</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_2_response"
                      value="B) Seu documento não atendeu aos requisitos, mas sem problema! Posso ajudar com exatamente o que falta."
                      checked={formData.question_2_response === 'B) Seu documento não atendeu aos requisitos, mas sem problema! Posso ajudar com exatamente o que falta.'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>B)</strong> Seu documento não atendeu aos requisitos, mas sem problema! Posso ajudar com exatamente o que falta.</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_2_response"
                      value="C) Seu documento foi rejeitado mais temos outra opção para você."
                      checked={formData.question_2_response === 'C) Seu documento foi rejeitado mais temos outra opção para você.'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>C)</strong> Seu documento foi rejeitado mais temos outra opção para você.</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-3">💡 MAS = contraste/oposição | MAIS = adição/quantidade</p>
              </div>

              {/* Pergunta 3 - ALTERNATIVA */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  3️⃣ Uso Correto do Gerúndio<br/>
                  <span className="text-sm font-normal">Qual frase está CORRETA?</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Qual forma de falar sobre o resultado está certa para o paciente?</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_3_response"
                      value="A) Você vai recebendo o resultado em breve."
                      checked={formData.question_3_response === 'A) Você vai recebendo o resultado em breve.'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>A)</strong> Você vai recebendo o resultado em breve.</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_3_response"
                      value="B) Seu resultado está sendo preparado neste momento e você receberá em breve."
                      checked={formData.question_3_response === 'B) Seu resultado está sendo preparado neste momento e você receberá em breve.'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>B)</strong> Seu resultado está sendo preparado neste momento e você receberá em breve.</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_3_response"
                      value="C) Você vai consultando o médico amanhã pela manhã."
                      checked={formData.question_3_response === 'C) Você vai consultando o médico amanhã pela manhã.'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>C)</strong> Você vai consultando o médico amanhã pela manhã.</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-3">💡 Gerúndio (-ando,-endo,-indo) = ação em progresso: "Estou analisando" ✅ | "Você vai fazendo" ❌</p>
              </div>

              {/* Pergunta 4 - ALTERNATIVA */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  4️⃣ Erro Comum: "Vou estar verificando"<br/>
                  <span className="text-sm font-normal">Qual forma de falar está CORRETA?</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Como avisar ao paciente que você vai verificar o resultado?</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_4_response"
                      value="A) Vou estar verificando seu resultado em breve, combinado?"
                      checked={formData.question_4_response === 'A) Vou estar verificando seu resultado em breve, combinado?'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>A)</strong> Vou estar verificando seu resultado em breve, combinado?</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_4_response"
                      value="B) Vou verificar seu resultado agora mesmo e retorno com você em minutos."
                      checked={formData.question_4_response === 'B) Vou verificar seu resultado agora mesmo e retorno com você em minutos.'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>B)</strong> Vou verificar seu resultado agora mesmo e retorno com você em minutos.</span>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50">
                    <input
                      type="radio"
                      name="question_4_response"
                      value="C) Estou verificando seu resultado neste exato momento."
                      checked={formData.question_4_response === 'C) Estou verificando seu resultado neste exato momento.'}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                    <span className="text-sm"><strong>C)</strong> Estou verificando seu resultado neste exato momento.</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-3">💡 ❌ "Vou estar verificando" confunde! ✅ Use: "Vou verificar" (futuro) ou "Estou verificando" (em progresso)</p>
              </div>

              {/* Pergunta 5 */}
              <div>
                <label className="block font-bold mb-2 text-gray-900">
                  5️⃣ Situação Complexa: Investigação + Empatia<br/>
                  <span className="text-sm font-normal">Um paciente irritado diz: "Já fiz o exame na segunda e ainda não tenho resultado! Como assim?"</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">Como você investigaria o problema enquanto acalma o paciente? Use português correto!</p>
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
                <p className="text-sm text-gray-600 mb-3">Seja prático! Mostre como os pilares funcionam na prática. Atente-se ao português correto!</p>
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
