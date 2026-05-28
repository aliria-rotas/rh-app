import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fmivqhsfkvfunznrlxde.supabase.co'
const SUPABASE_KEY = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function verifyQuestions() {
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
    console.log(`\n📋 Enfermeiro Job ID: ${jobId}\n`)

    // Get all questions for Enfermeiro
    const { data: questions, error: questionsError } = await supabase
      .from('rh_interview_questions')
      .select('*')
      .eq('job_opening_id', jobId)
      .order('order_number', { ascending: true })

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return
    }

    console.log(`✅ Found ${questions.length} questions for Enfermeiro:\n`)
    questions.forEach((q, idx) => {
      console.log(`${idx + 1}. [${q.category}] ${q.question}`)
    })
    console.log('')
  } catch (err) {
    console.error('Error:', err)
  }
}

verifyQuestions()
