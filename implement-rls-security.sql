-- ════════════════════════════════════════════════════════════════════════════════
-- IMPLEMENTAÇÃO DE ROW LEVEL SECURITY (RLS)
-- Projeto: Aliria RH
-- Data: 27 de maio de 2026
-- ════════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────────
-- 1. ATIVAR RLS NAS TABELAS SENSÍVEIS
-- ────────────────────────────────────────────────────────────────────────────────

-- Habilitar RLS na tabela rh_employees (CRÍTICO - dados pessoais)
ALTER TABLE rh_employees ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela rh_benefits_config (dados sensíveis)
ALTER TABLE rh_benefits_config ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela rh_job_openings (menos crítico, mas proteger)
ALTER TABLE rh_job_openings ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela rh_interview_questions (menos crítico)
ALTER TABLE rh_interview_questions ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────────────────────
-- 2. CRIAR POLÍTICAS DE ACESSO - rh_employees
-- ────────────────────────────────────────────────────────────────────────────────

-- Política: Usuários autenticados podem ler seus próprios dados
CREATE POLICY "Users can read their own employee data"
  ON rh_employees FOR SELECT
  USING (auth.uid()::text = id OR auth.jwt() ->> 'role' = 'admin');

-- Política: Apenas admin pode atualizar dados de colaboradores
CREATE POLICY "Only admin can update employee data"
  ON rh_employees FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Política: Apenas admin pode inserir novos colaboradores
CREATE POLICY "Only admin can insert employees"
  ON rh_employees FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Política: Apenas admin pode deletar colaboradores
CREATE POLICY "Only admin can delete employees"
  ON rh_employees FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- ────────────────────────────────────────────────────────────────────────────────
-- 3. CRIAR POLÍTICAS DE ACESSO - rh_benefits_config
-- ────────────────────────────────────────────────────────────────────────────────

-- Política: Apenas admin pode ler configurações de benefícios
CREATE POLICY "Only admin can read benefits config"
  ON rh_benefits_config FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Política: Apenas admin pode atualizar configurações
CREATE POLICY "Only admin can update benefits config"
  ON rh_benefits_config FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Política: Apenas admin pode inserir configurações
CREATE POLICY "Only admin can insert benefits config"
  ON rh_benefits_config FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ────────────────────────────────────────────────────────────────────────────────
-- 4. CRIAR POLÍTICAS DE ACESSO - rh_job_openings
-- ────────────────────────────────────────────────────────────────────────────────

-- Política: Qualquer um pode ler vagas abertas (público)
CREATE POLICY "Anyone can read open job openings"
  ON rh_job_openings FOR SELECT
  USING (status = 'open' OR auth.jwt() ->> 'role' = 'admin');

-- Política: Apenas admin pode atualizar vagas
CREATE POLICY "Only admin can update job openings"
  ON rh_job_openings FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Política: Apenas admin pode criar vagas
CREATE POLICY "Only admin can insert job openings"
  ON rh_job_openings FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ────────────────────────────────────────────────────────────────────────────────
-- 5. CRIAR POLÍTICAS DE ACESSO - rh_interview_questions
-- ────────────────────────────────────────────────────────────────────────────────

-- Política: Qualquer um autenticado pode ler perguntas de entrevista
CREATE POLICY "Authenticated users can read interview questions"
  ON rh_interview_questions FOR SELECT
  USING (auth.jwt() ->> 'sub' IS NOT NULL);

-- Política: Apenas admin pode atualizar perguntas
CREATE POLICY "Only admin can update interview questions"
  ON rh_interview_questions FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Política: Apenas admin pode criar perguntas
CREATE POLICY "Only admin can insert interview questions"
  ON rh_interview_questions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ════════════════════════════════════════════════════════════════════════════════
-- RESUMO DAS MUDANÇAS
-- ════════════════════════════════════════════════════════════════════════════════
-- ✅ rh_employees: RLS ativado - Apenas usuários veem seus dados + admin vê tudo
-- ✅ rh_benefits_config: RLS ativado - Apenas admin acessa
-- ✅ rh_job_openings: RLS ativado - Público pode ler vagas abertas
-- ✅ rh_interview_questions: RLS ativado - Autenticados podem ler
-- ════════════════════════════════════════════════════════════════════════════════
