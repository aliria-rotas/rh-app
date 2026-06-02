import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { dbTrainings } from '@/lib/db'
import { TrainingAction } from '@/types'
import { BookOpen, Copy, Check, ExternalLink } from 'lucide-react'

export default function TreinamentosPublicos() {
  const [trainings, setTrainings] = useState<TrainingAction[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    dbTrainings.list().then(data => {
      setTrainings(data.filter(t => t.has_public_form))
      setLoading(false)
    })
  }, [])

  const baseUrl = window.location.origin

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Treinamentos Públicos</h1>
        <p className="text-gray-600">Compartilhe os links abaixo com sua equipe para acessar os treinamentos</p>
      </div>

      {trainings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum treinamento público disponível</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trainings.map((training) => {
            const trainingUrl = `${baseUrl}/treinamento-publico?id=${training.id}`
            const isMainTraining = training.id === trainings[0].id // O primeiro é o destaque

            return (
              <Card
                key={training.id}
                className={isMainTraining ? 'border-2 border-orange-500 bg-orange-50' : ''}
              >
                <CardContent className="py-6">
                  <div className="space-y-4">
                    {/* Título e Badge */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{training.title}</h3>
                        {training.description && (
                          <p className="text-sm text-gray-600 mt-1">{training.description}</p>
                        )}
                      </div>
                      {isMainTraining && (
                        <Badge variant="red" className="whitespace-nowrap">
                          ⭐ Destaque
                        </Badge>
                      )}
                    </div>

                    {/* URL e Botões */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Link de Acesso:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 text-xs text-gray-700 break-all font-mono">
                          {trainingUrl}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(trainingUrl)}
                          className="whitespace-nowrap"
                        >
                          {copied === trainingUrl ? (
                            <>
                              <Check size={14} className="text-green-600" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copiar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.open(trainingUrl, '_blank')}
                          className="whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <ExternalLink size={14} />
                          Abrir
                        </Button>
                      </div>
                    </div>

                    {/* Informações */}
                    {(training.target_positions.length > 0 || training.scheduled_date) && (
                      <div className="text-xs text-gray-600 space-y-1">
                        {training.target_positions.length > 0 && (
                          <p>
                            <strong>Para:</strong> {training.target_positions.join(', ')}
                          </p>
                        )}
                        {training.scheduled_date && (
                          <p>
                            <strong>Data:</strong> {new Date(training.scheduled_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {trainings.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Dica:</strong> Compartilhe os links acima com seus colegas. Eles podem acessar os treinamentos sem fazer login!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
