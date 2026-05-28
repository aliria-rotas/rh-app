import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const questions = [
  // Motivação e Escolha de Carreira
  {
    category: 'competencias_gerais',
    question: 'Por que escolheu trabalhar nessa área? O que o motiva nessa profissão?',
    type: 'aberta',
    order: 1
  },
  // Experiência Passada - Comportamental
  {
    category: 'experiencia_passada',
    question: 'Descreva uma situação em que você precisou lidar com um paciente/pessoa muito estressada ou agressiva. Como você reagiu?',
    type: 'aberta',
    order: 2
  },
  {
    category: 'experiencia_passada',
    question: 'Conte sobre um momento em que você cometeu um erro no trabalho. Como você identificou, corrigiu e o que aprendeu?',
    type: 'aberta',
    order: 3
  },
  {
    category: 'experiencia_passada',
    question: 'Descreva uma experiência em que trabalhou em equipe multiprofissional. Como foi a comunicação?',
    type: 'aberta',
    order: 4
  },
  {
    category: 'experiencia_passada',
    question: 'Como você gerencia múltiplas tarefas/pacientes com prioridades diferentes? Dê um exemplo.',
    type: 'aberta',
    order: 5
  },
  {
    category: 'experiencia_passada',
    question: 'Conte sobre um momento em que você tinha pouco tempo e muitas tarefas. Como se organizou?',
    type: 'aberta',
    order: 6
  },
  {
    category: 'experiencia_passada',
    question: 'Descreva um conflito com um colega ou superior. Como foi resolvido?',
    type: 'aberta',
    order: 7
  },
  // Competências Genéricas
  {
    category: 'competencias_gerais',
    question: 'Quais são seus pontos fortes como profissional?',
    type: 'aberta',
    order: 8
  },
  {
    category: 'competencias_gerais',
    question: 'Em quais áreas você sente que precisa melhorar ou aprender mais?',
    type: 'aberta',
    order: 9
  },
  {
    category: 'competencias_gerais',
    question: 'Como você se mantém atualizado em sua área?',
    type: 'aberta',
    order: 10
  },
  {
    category: 'competencias_gerais',
    question: 'Como você lida com o estresse e a pressão emocional da profissão?',
    type: 'aberta',
    order: 11
  },
  // Alinhamento com a Empresa
  {
    category: 'competencias_gerais',
    question: 'Por que deseja trabalhar em nossa organização especificamente?',
    type: 'aberta',
    order: 12
  },
  // Desenvolvimento Profissional
  {
    category: 'competencias_gerais',
    question: 'Quais são seus objetivos profissionais para os próximos 5 anos?',
    type: 'aberta',
    order: 13
  },
  // Estilo de Trabalho
  {
    category: 'competencias_gerais',
    question: 'Como você trabalha sob supervisão? Prefere mais autonomia ou mais orientação?',
    type: 'aberta',
    order: 14
  },
  // Ética e Profissionalismo
  {
    category: 'competencias_gerais',
    question: 'Como você mantém a confidencialidade e a ética profissional?',
    type: 'aberta',
    order: 15
  }
]

async function insertQuestions() {
  try {
    // Get Enfermeiro job ID
    const { data: jobs, error: jobError } = await supabase
      .from('rh_job_openings')
      .select('id')
      .eq('title', 'Enfermeiro')
      .limit(1)

    if (jobError) {
      console.error('Error fetching job:', jobError)
      return
    }

    if (!jobs || jobs.length === 0) {
      console.error('Enfermeiro job not found')
      return
    }

    const jobId = jobs[0].id
    console.log(`Found Enfermeiro job with ID: ${jobId}`)

    // Insert questions
    const questionsToInsert = questions.map(q => ({
      category: q.category,
      question: q.question,
      type: q.type,
      order_number: q.order,
      job_opening_id: jobId
    }))

    const { data, error } = await supabase
      .from('rh_interview_questions')
      .insert(questionsToInsert)

    if (error) {
      console.error('Error inserting questions:', error)
      return
    }

    console.log(`✅ Successfully inserted ${questionsToInsert.length} questions for Enfermeiro job!`)
  } catch (err) {
    console.error('Error:', err)
  }
}

insertQuestions()
