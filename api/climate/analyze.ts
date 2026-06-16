import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { survey, responses, categoryStats, questionStats } = req.body

    if (!survey || !categoryStats || !questionStats) {
      return res.status(400).json({ error: 'Missing required data' })
    }

    // Preparar dados para análise
    const analysisData = {
      totalResponses: responses,
      generalAverage: categoryStats.reduce((sum: number, cat: any) => sum + cat.average, 0) / categoryStats.length,
      categories: categoryStats,
      criticalCategories: categoryStats.filter((cat: any) => cat.average <= 2.5),
      strongCategories: categoryStats.filter((cat: any) => cat.average >= 4),
      questions: questionStats.map((q: any) => ({
        text: q.text,
        category: q.category,
        average: q.average,
        distribution: q.distribution,
      })),
    }

    // Gerar análise com template
    const analysis = generateAnalysis(analysisData)

    return res.status(200).json({ analysis })
  } catch (error) {
    console.error('Error analyzing report:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function generateAnalysis(data: any): string {
  const generalAvg = data.generalAverage

  let analysis = `
## 📊 ANÁLISE DETALHADA DOS RESULTADOS

### 📈 Visão Geral
A pesquisa de clima organizacional recebeu **${data.totalResponses}** resposta(s) com uma **média geral de ${generalAvg.toFixed(2)}/5.0**.

`

  // Interpretação geral
  if (generalAvg >= 4) {
    analysis += `**Situação:** O clima organizacional está **MUITO BOM**, com alto nível de satisfação e concordância entre os respondentes.\n\n`
  } else if (generalAvg >= 3) {
    analysis += `**Situação:** O clima organizacional está **NEUTRO**, com oportunidades de melhoria em diversos aspectos.\n\n`
  } else {
    analysis += `**Situação:** O clima organizacional apresenta **DESAFIOS**, com baixo nível de concordância que requer atenção imediata.\n\n`
  }

  // Categorias críticas
  if (data.criticalCategories.length > 0) {
    analysis += `### ⚠️ ÁREAS CRÍTICAS (Média ≤ 2.5)\n\n`
    data.criticalCategories.forEach((cat: any) => {
      analysis += `**${cat.name}** (${cat.average.toFixed(2)}/5.0)\n`
      analysis += `- Esta categoria requer atenção imediata\n`
      analysis += `- Baixo nível de satisfação ou concordância\n`
      analysis += `- Recomenda-se investigação e ação corretiva\n\n`
    })
  }

  // Categorias fortes
  if (data.strongCategories.length > 0) {
    analysis += `### ✅ PONTOS FORTES (Média ≥ 4.0)\n\n`
    data.strongCategories.forEach((cat: any) => {
      analysis += `**${cat.name}** (${cat.average.toFixed(2)}/5.0)\n`
      analysis += `- Alta satisfação e concordância\n`
      analysis += `- Aspecto bem desenvolvido na organização\n\n`
    })
  }

  // Resumo por categoria
  analysis += `### 📋 RESUMO POR CATEGORIA\n\n`
  analysis += `| Categoria | Média | Interpretação |\n`
  analysis += `|-----------|-------|---------------|\n`
  data.categories.forEach((cat: any) => {
    let interpretation = ''
    if (cat.average <= 2) interpretation = 'Crítico'
    else if (cat.average <= 3) interpretation = 'Neutro/Atenção'
    else if (cat.average <= 4) interpretation = 'Bom'
    else interpretation = 'Muito Bom'

    analysis += `| ${cat.name} | ${cat.average.toFixed(2)} | ${interpretation} |\n`
  })
  analysis += `\n`

  // Recomendações
  analysis += `### 💡 RECOMENDAÇÕES\n\n`

  if (data.criticalCategories.length > 0) {
    analysis += `**Ações Imediatas:**\n`
    data.criticalCategories.forEach((cat: any) => {
      analysis += `- Investigar raízes das insatisfações em "${cat.name}"\n`
      analysis += `- Implementar plano de ação com metas e prazos definidos\n`
    })
    analysis += `\n`
  }

  analysis += `**Estratégia Geral:**\n`
  analysis += `1. **Comunicação:** Compartilhe estes resultados com a equipe\n`
  analysis += `2. **Engajamento:** Discuta as descobertas em reuniões de equipe\n`
  analysis += `3. **Ação:** Crie planos de melhoria para as áreas críticas\n`
  analysis += `4. **Acompanhamento:** Realize pesquisas periódicas para medir progresso\n`
  analysis += `5. **Reconhecimento:** Celebre os pontos fortes e progresso\n\n`

  analysis += `### 📌 PRÓXIMOS PASSOS\n\n`
  analysis += `- Reunir liderança para discutir resultados\n`
  analysis += `- Priorizar áreas para intervenção\n`
  analysis += `- Definir responsáveis pelas ações\n`
  analysis += `- Estabelecer cronograma de implementação\n`
  analysis += `- Comunicar plano à organização\n`
  analysis += `- Monitorar e reportar progresso\n\n`

  analysis += `---\n`
  analysis += `*Análise gerada automaticamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}*\n`

  return analysis
}
