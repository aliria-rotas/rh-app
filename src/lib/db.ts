/**
 * Camada de acesso ao Supabase — Aliria RH
 * Todas as operações CRUD para cada entidade.
 */
import { supabase } from './supabase'
import { generateId } from './storage'
import type {
  OrganizationalIdentity,
  Competency,
  Position,
  ClimateSurvey,
  JobOpening,
  Candidate,
  OffboardingProcess,
  PerformanceCycle,
  PerformanceEvaluation,
  EndomarketingCampaign,
  TrainingAction,
  SalaryGrade,
  Employee,
} from '@/types'

const now = () => new Date().toISOString()

// Mapeia org_values (coluna DB) → values (tipo TS)
function mapIdentity(row: Record<string, unknown>): OrganizationalIdentity {
  const { org_values, ...rest } = row as Record<string, unknown> & { org_values: string[] }
  return { ...rest, values: org_values ?? [] } as unknown as OrganizationalIdentity
}

// ─── 1. Identidade Organizacional ──────────────────────────────────────────────
export const dbIdentity = {
  async get(): Promise<OrganizationalIdentity | null> {
    const { data, error } = await supabase
      .from('rh_org_identity')
      .select('*')
      .eq('id', 'singleton')
      .maybeSingle()
    return data ? mapIdentity(data) : null
  },

  async upsert(payload: Partial<OrganizationalIdentity>): Promise<OrganizationalIdentity> {
    const { values, ...rest } = payload
    const dbPayload: Record<string, unknown> = {
      id: 'singleton',
      ...rest,
      updated_at: now(),
    }
    if (values !== undefined) dbPayload.org_values = values

    const { data, error } = await supabase
      .from('rh_org_identity')
      .upsert(dbPayload)
      .select()
      .single()
    if (error) throw error
    return mapIdentity(data as Record<string, unknown>)
  },
}

// ─── 2. Competências ────────────────────────────────────────────────────────────
export const dbCompetencies = {
  async list(): Promise<Competency[]> {
    const { data, error } = await supabase
      .from('rh_competencies')
      .select('*')
      .order('created_at')
    return (data ?? []) as Competency[]
  },

  async create(item: Omit<Competency, 'id' | 'created_at'>): Promise<Competency> {
    const { data, error } = await supabase
      .from('rh_competencies')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as Competency
  },

  async update(id: string, updates: Partial<Competency>): Promise<Competency> {
    const { data, error } = await supabase
      .from('rh_competencies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Competency
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_competencies').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<Competency, 'created_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now() }))
    const { error } = await supabase.from('rh_competencies').insert(rows)
    if (error) throw error
  },
}

// ─── 3. Cargos ──────────────────────────────────────────────────────────────────
export const dbPositions = {
  async list(): Promise<Position[]> {
    const { data, error } = await supabase
      .from('rh_positions')
      .select('*')
      .order('created_at')
    return (data ?? []) as Position[]
  },

  async create(item: Omit<Position, 'id' | 'created_at' | 'updated_at'>): Promise<Position> {
    const { data, error } = await supabase
      .from('rh_positions')
      .insert({ ...item, id: generateId(), created_at: now(), updated_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as Position
  },

  async update(id: string, updates: Partial<Position>): Promise<Position> {
    const { data, error } = await supabase
      .from('rh_positions')
      .update({ ...updates, updated_at: now() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Position
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_positions').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<Position, 'created_at' | 'updated_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now(), updated_at: now() }))
    const { error } = await supabase.from('rh_positions').insert(rows)
    if (error) throw error
  },
}

// ─── 4. Pesquisa de Clima ───────────────────────────────────────────────────────
export const dbClimateSurveys = {
  async list(): Promise<ClimateSurvey[]> {
    const { data, error } = await supabase
      .from('rh_climate_surveys')
      .select('*')
      .order('created_at')
    return (data ?? []) as ClimateSurvey[]
  },

  async create(item: Omit<ClimateSurvey, 'id' | 'created_at'>): Promise<ClimateSurvey> {
    const { data, error } = await supabase
      .from('rh_climate_surveys')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as ClimateSurvey
  },

  async update(id: string, updates: Partial<ClimateSurvey>): Promise<ClimateSurvey> {
    const { data, error } = await supabase
      .from('rh_climate_surveys')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as ClimateSurvey
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_climate_surveys').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<ClimateSurvey, 'created_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now() }))
    const { error } = await supabase.from('rh_climate_surveys').insert(rows)
    if (error) throw error
  },
}

// ─── 5. Vagas ───────────────────────────────────────────────────────────────────
export const dbJobOpenings = {
  async list(): Promise<JobOpening[]> {
    const { data, error } = await supabase
      .from('rh_job_openings')
      .select('*')
      .order('created_at')
    return (data ?? []) as JobOpening[]
  },

  async create(item: Omit<JobOpening, 'id' | 'created_at'>): Promise<JobOpening> {
    const { data, error } = await supabase
      .from('rh_job_openings')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as JobOpening
  },

  async update(id: string, updates: Partial<JobOpening>): Promise<JobOpening> {
    const { data, error } = await supabase
      .from('rh_job_openings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as JobOpening
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_job_openings').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<JobOpening, 'created_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now() }))
    const { error } = await supabase.from('rh_job_openings').insert(rows)
    if (error) throw error
  },
}

// ─── 6. Candidatos ──────────────────────────────────────────────────────────────
export const dbCandidates = {
  async listByJob(jobOpeningId: string): Promise<Candidate[]> {
    const { data, error } = await supabase
      .from('rh_candidates')
      .select('*')
      .eq('job_opening_id', jobOpeningId)
      .order('created_at')
    return (data ?? []) as Candidate[]
  },

  async create(item: Omit<Candidate, 'id' | 'created_at'>): Promise<Candidate> {
    const { data, error } = await supabase
      .from('rh_candidates')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as Candidate
  },

  async update(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const { data, error } = await supabase
      .from('rh_candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Candidate
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_candidates').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── 7. Desligamento ────────────────────────────────────────────────────────────
export const dbOffboarding = {
  async list(): Promise<OffboardingProcess[]> {
    const { data, error } = await supabase
      .from('rh_offboarding')
      .select('*')
      .order('created_at', { ascending: false })
    return (data ?? []) as OffboardingProcess[]
  },

  async create(item: Omit<OffboardingProcess, 'id' | 'created_at'>): Promise<OffboardingProcess> {
    const { data, error } = await supabase
      .from('rh_offboarding')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as OffboardingProcess
  },

  async update(id: string, updates: Partial<OffboardingProcess>): Promise<OffboardingProcess> {
    const { data, error } = await supabase
      .from('rh_offboarding')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as OffboardingProcess
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_offboarding').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── 8. Ciclos de Avaliação ─────────────────────────────────────────────────────
export const dbPerformanceCycles = {
  async list(): Promise<PerformanceCycle[]> {
    const { data, error } = await supabase
      .from('rh_performance_cycles')
      .select('*')
      .order('created_at', { ascending: false })
    return (data ?? []) as PerformanceCycle[]
  },

  async create(item: Omit<PerformanceCycle, 'id' | 'created_at'>): Promise<PerformanceCycle> {
    const { data, error } = await supabase
      .from('rh_performance_cycles')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as PerformanceCycle
  },

  async update(id: string, updates: Partial<PerformanceCycle>): Promise<PerformanceCycle> {
    const { data, error } = await supabase
      .from('rh_performance_cycles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as PerformanceCycle
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_performance_cycles').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<PerformanceCycle, 'created_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now() }))
    const { error } = await supabase.from('rh_performance_cycles').insert(rows)
    if (error) throw error
  },
}

// ─── 9. Avaliações de Desempenho ────────────────────────────────────────────────
export const dbPerformanceEvaluations = {
  async listByCycle(cycleId: string): Promise<PerformanceEvaluation[]> {
    const { data, error } = await supabase
      .from('rh_performance_evaluations')
      .select('*')
      .eq('cycle_id', cycleId)
      .order('created_at')
    return (data ?? []) as PerformanceEvaluation[]
  },

  async create(item: Omit<PerformanceEvaluation, 'id' | 'created_at'>): Promise<PerformanceEvaluation> {
    const { data, error } = await supabase
      .from('rh_performance_evaluations')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as PerformanceEvaluation
  },

  async update(id: string, updates: Partial<PerformanceEvaluation>): Promise<PerformanceEvaluation> {
    const { data, error } = await supabase
      .from('rh_performance_evaluations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as PerformanceEvaluation
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_performance_evaluations').delete().eq('id', id)
    if (error) throw error
  },
}

// ─── 10. Endomarketing ──────────────────────────────────────────────────────────
export const dbEndomarketing = {
  async list(): Promise<EndomarketingCampaign[]> {
    const { data, error } = await supabase
      .from('rh_endomarketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    return (data ?? []) as EndomarketingCampaign[]
  },

  async create(item: Omit<EndomarketingCampaign, 'id' | 'created_at'>): Promise<EndomarketingCampaign> {
    const { data, error } = await supabase
      .from('rh_endomarketing_campaigns')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as EndomarketingCampaign
  },

  async update(id: string, updates: Partial<EndomarketingCampaign>): Promise<EndomarketingCampaign> {
    const { data, error } = await supabase
      .from('rh_endomarketing_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as EndomarketingCampaign
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_endomarketing_campaigns').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<EndomarketingCampaign, 'created_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now() }))
    const { error } = await supabase.from('rh_endomarketing_campaigns').insert(rows)
    if (error) throw error
  },
}

// ─── 11. Plano de Treinamento ───────────────────────────────────────────────────
export const dbTrainings = {
  async list(): Promise<TrainingAction[]> {
    const { data, error } = await supabase
      .from('rh_trainings')
      .select('*')
      .order('created_at')
    return (data ?? []) as TrainingAction[]
  },

  async create(item: Omit<TrainingAction, 'id' | 'created_at'>): Promise<TrainingAction> {
    const { data, error } = await supabase
      .from('rh_trainings')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as TrainingAction
  },

  async update(id: string, updates: Partial<TrainingAction>): Promise<TrainingAction> {
    const { data, error } = await supabase
      .from('rh_trainings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as TrainingAction
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_trainings').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<TrainingAction, 'created_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now() }))
    const { error } = await supabase.from('rh_trainings').insert(rows)
    if (error) throw error
  },
}

// ─── 12. Cargos e Salários ──────────────────────────────────────────────────────
export const dbSalaryGrades = {
  async list(): Promise<SalaryGrade[]> {
    const { data, error } = await supabase
      .from('rh_salary_grades')
      .select('*')
      .order('min_salary')
    return (data ?? []) as SalaryGrade[]
  },

  async create(item: Omit<SalaryGrade, 'id' | 'created_at'>): Promise<SalaryGrade> {
    const { data, error } = await supabase
      .from('rh_salary_grades')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as SalaryGrade
  },

  async update(id: string, updates: Partial<SalaryGrade>): Promise<SalaryGrade> {
    const { data, error } = await supabase
      .from('rh_salary_grades')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as SalaryGrade
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_salary_grades').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<SalaryGrade, 'created_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now() }))
    const { error } = await supabase.from('rh_salary_grades').insert(rows)
    if (error) throw error
  },
}

// ─── 13. Colaboradores ─────────────────────────────────────────────────────────
export const dbEmployees = {
  async list(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('rh_employees')
      .select('*')
      .order('full_name')
    return (data ?? []) as Employee[]
  },

  async create(item: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const { data, error } = await supabase
      .from('rh_employees')
      .insert({ ...item, id: generateId(), created_at: now(), updated_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as Employee
  },

  async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('rh_employees')
      .update({ ...updates, updated_at: now() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Employee
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('rh_employees').delete().eq('id', id)
    if (error) throw error
  },

  async bulkInsert(items: Omit<Employee, 'created_at' | 'updated_at'>[]): Promise<void> {
    const rows = items.map(i => ({ ...i, created_at: now(), updated_at: now() }))
    const { error } = await supabase.from('rh_employees').insert(rows)
    if (error) throw error
  },
}

// ─── 14. Interview Questions ───────────────────────────────────────────────
export const dbInterviewQuestions = {
  async list(): Promise<any[]> {
    const { data, error } = await supabase
      .from('rh_interview_questions')
      .select('*')
      .order('category, order_number')
    return (data ?? []) as any[]
  },

  async listByJob(jobOpeningId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('rh_interview_questions')
      .select('*')
      .eq('job_opening_id', jobOpeningId)
      .order('category, order_number')
    return (data ?? []) as any[]
  },

  async listByCategory(category: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('rh_interview_questions')
      .select('*')
      .eq('category', category)
      .order('order_number')
    return (data ?? []) as any[]
  },

  async create(item: { category: string; question: string; type: string; order_number: number; job_opening_id?: string }): Promise<any> {
    const { data, error } = await supabase
      .from('rh_interview_questions')
      .insert({ ...item, id: generateId(), created_at: now() })
      .select()
      .single()
    if (error) throw error
    return data as any
  },

  async update(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('rh_interview_questions')
      .update({ ...updates, updated_at: now() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as any
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('rh_interview_questions')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}

// ─── 15. Monthly Benefits Validation ───────────────────────────────────────────
export const dbBenefitsValidation = {
  async getValidation(year: number, month: number, companyCnpj: string): Promise<{ id: string; is_validated: boolean; validated_at: string; validated_by: string; benefits_data: Record<string, unknown> } | null> {
    const { data, error } = await supabase
      .from('rh_benefits_monthly')
      .select('id, is_validated, validated_at, validated_by, benefits_data')
      .eq('year', year)
      .eq('month', month)
      .eq('company_cnpj', companyCnpj)
      .maybeSingle()
    return data as { id: string; is_validated: boolean; validated_at: string; validated_by: string; benefits_data: Record<string, unknown> } | null
  },

  async saveValidation(year: number, month: number, companyCnpj: string, benefitsData: Record<string, unknown>, validatedBy: string = 'Klissia'): Promise<{ id: string; is_validated: boolean; validated_at: string; validated_by: string } | null> {
    const { data: existing } = await supabase
      .from('rh_benefits_monthly')
      .select('id')
      .eq('year', year)
      .eq('month', month)
      .eq('company_cnpj', companyCnpj)
      .maybeSingle()

    const payload = {
      year,
      month,
      company_cnpj: companyCnpj,
      benefits_data: benefitsData,
      is_validated: true,
      validated_at: now(),
      validated_by: validatedBy,
      updated_at: now(),
    }

    let result
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('rh_benefits_monthly')
        .update(payload)
        .eq('id', existing.id)
        .select('id, is_validated, validated_at, validated_by')
        .single()
      result = { data, error }
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('rh_benefits_monthly')
        .insert({ ...payload, id: generateId(), created_at: now() })
        .select('id, is_validated, validated_at, validated_by')
        .single()
      result = { data, error }
    }

    if (result.error) {
      return null
    }
    return result.data as { id: string; is_validated: boolean; validated_at: string; validated_by: string }
  },
}

// ─── KPIs — leituras agregadas ──────────────────────────────────────────────────
export const dbKpis = {
  async fetchAll() {
    const [
      jobOpenings,
      candidates_res,
      offboarding,
      cycles,
      evaluations_all,
      trainings,
      surveys,
      campaigns,
      grades,
    ] = await Promise.all([
      supabase.from('rh_job_openings').select('*'),
      supabase.from('rh_candidates').select('*'),
      supabase.from('rh_offboarding').select('*'),
      supabase.from('rh_performance_cycles').select('*'),
      supabase.from('rh_performance_evaluations').select('*'),
      supabase.from('rh_trainings').select('*'),
      supabase.from('rh_climate_surveys').select('*'),
      supabase.from('rh_endomarketing_campaigns').select('*'),
      supabase.from('rh_salary_grades').select('*'),
    ])
    return {
      jobOpenings: (jobOpenings.data ?? []) as JobOpening[],
      candidates: (candidates_res.data ?? []) as Candidate[],
      offboarding: (offboarding.data ?? []) as OffboardingProcess[],
      cycles: (cycles.data ?? []) as PerformanceCycle[],
      evaluations: (evaluations_all.data ?? []) as PerformanceEvaluation[],
      trainings: (trainings.data ?? []) as TrainingAction[],
      surveys: (surveys.data ?? []) as ClimateSurvey[],
      campaigns: (campaigns.data ?? []) as EndomarketingCampaign[],
      grades: (grades.data ?? []) as SalaryGrade[],
    }
  },
}
