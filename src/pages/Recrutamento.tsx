import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { dbJobOpenings, dbCandidates, dbInterviewQuestions } from '@/lib/db'
import { JobOpening, Candidate, JobStatus, CandidateStage } from '@/types'
import { formatDate, STATUS_LABELS } from '@/lib/utils'
import { Plus, Pencil, Trash2, UserSearch, Users, ChevronRight, X, Star, HelpCircle, Trash } from 'lucide-react'

const JOB_STATUS_OPTS = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'encerrada', label: 'Encerrada' },
  { value: 'cancelada', label: 'Cancelada' },
]

const STAGE_OPTS = [
  { value: 'inscrito', label: 'Inscrito' },
  { value: 'triagem', label: 'Triagem' },
  { value: 'entrevista_rh', label: 'Entrevista RH' },
  { value: 'entrevista_tecnica', label: 'Entrevista Técnica' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'contratado', label: 'Contratado' },
  { value: 'reprovado', label: 'Reprovado' },
]

const PIPELINE_STAGES: CandidateStage[] = ['inscrito', 'triagem', 'entrevista_rh', 'entrevista_tecnica', 'aprovado', 'proposta', 'contratado']

const CATEGORIES = [
  { value: 'experiencia_passada', label: '📋 Experiência Passada' },
  { value: 'competencias_gerais', label: '⭐ Competências Gerais' },
  { value: 'tecnicas_especificas', label: '🔧 Técnicas Específicas' },
]

export default function Recrutamento() {
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingCands, setLoadingCands] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null)
  const [activeTab, setActiveTab] = useState<'vagas' | 'candidatos' | 'perguntas'>('vagas')
  const [jobQuestions, setJobQuestions] = useState<any[]>([])
  const [selectedJobTab, setSelectedJobTab] = useState<'candidatos' | 'perguntas'>('candidatos')
  const [jobModal, setJobModal] = useState(false)
  const [candModal, setCandModal] = useState(false)
  const [questionModal, setQuestionModal] = useState(false)
  const [inlineEditId, setInlineEditId] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null)
  const [editingCand, setEditingCand] = useState<Candidate | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null)
  const [jobForm, setJobForm] = useState({ title: '', department: '', description: '', status: 'aberta' as JobStatus, opening_date: '', closing_date: '' })
  const [candForm, setCandForm] = useState({ name: '', email: '', phone: '', linkedin: '', notes: '', stage: 'inscrito' as CandidateStage })
  const [questionForm, setQuestionForm] = useState({ category: 'experiencia_passada', question: '', type: 'aberta', order_number: 0 })
  const [inlineForm, setInlineForm] = useState({ category: '', question: '', type: '' })

  useEffect(() => {
    dbJobOpenings.list().then(data => { setJobs(data); setLoadingJobs(false) })
    dbInterviewQuestions.list().then(data => { setQuestions(data); setLoadingQuestions(false) })
  }, [])

  useEffect(() => {
    if (!selectedJob) { setCandidates([]); setJobQuestions([]); return }
    setLoadingCands(true)
    dbCandidates.listByJob(selectedJob.id).then(data => { setCandidates(data); setLoadingCands(false) })
    dbInterviewQuestions.listByJob(selectedJob.id).then(data => { setJobQuestions(data) })
  }, [selectedJob])

  function openNewJob() {
    setEditingJob(null)
    setJobForm({ title: '', department: '', description: '', status: 'aberta', opening_date: '', closing_date: '' })
    setJobModal(true)
  }

  async function saveJob() {
    if (!jobForm.title.trim()) return
    if (editingJob) {
      const updated = await dbJobOpenings.update(editingJob.id, jobForm)
      setJobs(prev => prev.map(j => j.id === editingJob.id ? updated : j))
    } else {
      const created = await dbJobOpenings.create({ ...jobForm, position_id: '', required_competencies: [], candidates_count: 0 })
      setJobs(prev => [...prev, created])
    }
    setJobModal(false)
  }

  async function saveCandidate() {
    if (!candForm.name.trim() || !selectedJob) return
    if (editingCand) {
      const updated = await dbCandidates.update(editingCand.id, candForm)
      setCandidates(prev => prev.map(c => c.id === editingCand.id ? updated : c))
    } else {
      const created = await dbCandidates.create({
        ...candForm, job_opening_id: selectedJob.id,
        resume_url: '', competency_scores: {},
      })
      setCandidates(prev => [...prev, created])
      const jobUpdated = await dbJobOpenings.update(selectedJob.id, { candidates_count: selectedJob.candidates_count + 1 })
      setJobs(prev => prev.map(j => j.id === selectedJob.id ? jobUpdated : j))
    }
    setCandModal(false)
  }

  async function updateCandStage(candId: string, stage: CandidateStage) {
    const updated = await dbCandidates.update(candId, { stage })
    setCandidates(prev => prev.map(c => c.id === candId ? updated : c))
  }

  async function removeCand(id: string) {
    await dbCandidates.remove(id)
    setCandidates(prev => prev.filter(c => c.id !== id))
  }

  async function removeJob(id: string) {
    await dbJobOpenings.remove(id)
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  async function handleResumeUpload(file: File | undefined) {
    if (!file) return

    try {
      const text = await file.text()

      // Extração simples de informações do PDF
      // Procura por padrões comuns
      const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m)
      const emailMatch = text.match(/([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      const phoneMatch = text.match(/(?:\+55|55)?[\s\-]?(?:\(?\d{2}\)?[\s\-]?)?(?:9\d{4}|[2-9]\d{3})[\s\-]?\d{4,5}[\s\-]?\d{4}/)
      const linkedinMatch = text.match(/(?:linkedin\.com\/in\/[\w-]+|linkedin\.com\/profile\/[\w\d-]+)/i)

      const extractedData = {
        name: nameMatch?.[0]?.trim() || '',
        email: emailMatch?.[0]?.toLowerCase() || '',
        phone: phoneMatch?.[0]?.replace(/\D/g, '').slice(-11) || '',
        linkedin: linkedinMatch?.[0] || ''
      }

      // Atualiza o formulário com dados extraídos
      setCandForm(f => ({
        ...f,
        name: extractedData.name || f.name,
        email: extractedData.email || f.email,
        phone: extractedData.phone || f.phone,
        linkedin: extractedData.linkedin || f.linkedin
      }))

      // Mostra mensagem de sucesso
      if (extractedData.name) {
        alert(`✅ Currículo processado! Encontradas informações: ${extractedData.name}${extractedData.email ? ', ' + extractedData.email : ''}`)
      } else {
        alert('⚠️ Currículo enviado, mas não foi possível extrair informações automaticamente. Por favor, preencha os dados manualmente.')
      }
    } catch (error) {
      alert('❌ Erro ao processar o currículo. Certifique-se de que é um arquivo PDF válido.')
    }
  }

  async function saveQuestion() {
    if (!questionForm.question.trim()) return
    if (editingQuestion) {
      const updated = await dbInterviewQuestions.update(editingQuestion.id, questionForm)
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updated : q))
      if (selectedJob) {
        setJobQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updated : q))
      }
    } else {
      const created = await dbInterviewQuestions.create({ ...questionForm, job_opening_id: selectedJob?.id })
      setQuestions(prev => [...prev, created])
      if (selectedJob) {
        setJobQuestions(prev => [...prev, created])
      }
    }
    setQuestionModal(false)
    setEditingQuestion(null)
    setQuestionForm({ category: 'experiencia_passada', question: '', type: 'aberta', order_number: 0 })
  }

  async function deleteQuestion(id: string) {
    await dbInterviewQuestions.remove(id)
    setQuestions(prev => prev.filter(q => q.id !== id))
    if (selectedJob) {
      setJobQuestions(prev => prev.filter(q => q.id !== id))
    }
  }

  function openNewQuestion() {
    setEditingQuestion(null)
    setQuestionForm({ category: 'experiencia_passada', question: '', type: 'aberta', order_number: 0 })
    setQuestionModal(true)
  }

  function startInlineEdit(q: any) {
    setInlineEditId(q.id)
    setInlineForm({ category: q.category, question: q.question, type: q.type })
  }

  async function saveInlineQuestion() {
    if (!inlineForm.question.trim()) return
    const updated = await dbInterviewQuestions.update(inlineEditId!, inlineForm)
    setQuestions(prev => prev.map(q => q.id === inlineEditId ? updated : q))
    if (selectedJob) {
      setJobQuestions(prev => prev.map(q => q.id === inlineEditId ? updated : q))
    }
    setInlineEditId(null)
    setInlineForm({ category: '', question: '', type: '' })
  }

  function cancelInlineEdit() {
    setInlineEditId(null)
    setInlineForm({ category: '', question: '', type: '' })
  }

  const jobCandidates = candidates

  if (loadingJobs) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Abas */}
      {!selectedJob && (
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('vagas')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'vagas'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            📋 Vagas
          </button>
        </div>
      )}

      {!selectedJob && activeTab === 'vagas' ? (
        <>
          <div className="flex justify-end">
            <Button onClick={openNewJob}><Plus size={16} /> Nova Vaga</Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Vagas abertas', value: jobs.filter(j => j.status === 'aberta').length, color: 'text-green-600' },
              { label: 'Em andamento', value: jobs.filter(j => j.status === 'em_andamento').length, color: 'text-blue-600' },
              { label: 'Total de vagas', value: jobs.length, color: 'text-slate-800' },
              { label: 'Candidatos', value: jobs.reduce((a, j) => a + j.candidates_count, 0), color: 'text-purple-600' },
            ].map(stat => (
              <Card key={stat.label}><CardContent className="py-4">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </CardContent></Card>
            ))}
          </div>

          {jobs.length === 0 ? (
            <Card><CardContent className="py-16 text-center">
              <UserSearch size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhuma vaga cadastrada</p>
              <Button className="mt-4" onClick={openNewJob}><Plus size={16} /> Criar vaga</Button>
            </CardContent></Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map(j => (
                <Card key={j.id} onClick={() => setSelectedJob(j)} className="cursor-pointer hover:border-blue-300">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">{j.title}</h3>
                          <StatusBadge status={j.status} />
                          {j.department && <Badge variant="outline">{j.department}</Badge>}
                        </div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>{j.candidates_count} candidatos</span>
                          {j.opening_date && <span>Aberta em: {formatDate(j.opening_date)}</span>}
                          {j.closing_date && <span>Fecha em: {formatDate(j.closing_date)}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setEditingJob(j); setJobForm({ title: j.title, department: j.department, description: j.description, status: j.status, opening_date: j.opening_date, closing_date: j.closing_date }); setJobModal(true) }}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={e => { e.stopPropagation(); removeJob(j.id) }}>
                          <Trash2 size={14} />
                        </Button>
                        <ChevronRight size={16} className="text-slate-400 ml-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Seleção de Vaga e Abas */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedJob(null)} className="text-sm text-blue-600 hover:underline">← Vagas</button>
              <span className="text-slate-400">/</span>
              <h2 className="font-semibold text-slate-800">{selectedJob.title}</h2>
              <StatusBadge status={selectedJob.status} />
            </div>
          </div>

          {/* Abas dentro da vaga */}
          <div className="flex gap-2 border-b border-slate-200 mb-4">
            <button
              onClick={() => setSelectedJobTab('candidatos')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                selectedJobTab === 'candidatos'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              👥 Candidatos
            </button>
            <button
              onClick={() => setSelectedJobTab('perguntas')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                selectedJobTab === 'perguntas'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              ❓ Perguntas da Vaga
            </button>
          </div>

          {selectedJobTab === 'candidatos' ? (
            <>
              <div className="flex justify-end">
                <Button onClick={() => { setEditingCand(null); setCandForm({ name: '', email: '', phone: '', linkedin: '', notes: '', stage: 'inscrito' }); setCandModal(true) }}>
                  <Plus size={16} /> Adicionar candidato
                </Button>
              </div>

              {/* Pipeline visual */}
              {loadingCands ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                </div>
              ) : null}
              <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
              {PIPELINE_STAGES.map(stage => {
                const stageCands = jobCandidates.filter(c => c.stage === stage)
                return (
                  <div key={stage} className="w-52 flex-shrink-0">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-semibold text-slate-600">{STATUS_LABELS[stage]}</span>
                      <span className="text-xs bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5">{stageCands.length}</span>
                    </div>
                    <div className="space-y-2 min-h-16">
                      {stageCands.map(c => (
                        <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                          <p className="text-sm font-medium text-slate-800 mb-1">{c.name}</p>
                          <p className="text-xs text-slate-500 truncate">{c.email}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Select
                              value={c.stage}
                              onChange={v => updateCandStage(c.id, v as CandidateStage)}
                              options={STAGE_OPTS}
                              className="text-xs py-1 h-7"
                            />
                            <button onClick={() => removeCand(c.id)} className="text-slate-300 hover:text-red-500 ml-1">
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

              {jobCandidates.filter(c => c.stage === 'reprovado').length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reprovados</p>
                  <div className="flex flex-wrap gap-2">
                    {jobCandidates.filter(c => c.stage === 'reprovado').map(c => (
                      <div key={c.id} className="bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 text-sm text-red-700 flex items-center gap-2">
                        {c.name}
                        <button onClick={() => removeCand(c.id)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Perguntas da Vaga */}
              <div className="flex justify-end mb-4">
                <Button onClick={openNewQuestion}><Plus size={16} /> Adicionar Pergunta</Button>
              </div>

              {jobQuestions.length === 0 ? (
                <Card><CardContent className="py-16 text-center">
                  <HelpCircle size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Nenhuma pergunta adicionada para esta vaga</p>
                  <Button className="mt-4" onClick={openNewQuestion}><Plus size={16} /> Adicionar primeira pergunta</Button>
                </CardContent></Card>
              ) : (
                <div className="space-y-6">
                  {CATEGORIES.map(cat => {
                    const catQuestions = jobQuestions.filter(q => q.category === cat.value)
                    return catQuestions.length > 0 ? (
                      <div key={cat.value}>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">{cat.label}</h3>
                        <div className="space-y-2">
                          {catQuestions.map((q, idx) => (
                            <Card key={q.id} className={`${inlineEditId === q.id ? 'border-blue-400 bg-blue-50' : 'bg-slate-50'}`}>
                              <CardContent className="py-4">
                                {inlineEditId === q.id ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-semibold text-slate-700">Categoria</label>
                                      <Select value={inlineForm.category} onChange={(val) => setInlineForm({...inlineForm, category: val})} options={CATEGORIES} />
                                    </div>
                                    <div>
                                      <label className="text-xs font-semibold text-slate-700">Pergunta</label>
                                      <Textarea value={inlineForm.question} onChange={(e) => setInlineForm({...inlineForm, question: e.target.value})} placeholder="Digite a pergunta..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs font-semibold text-slate-700">Tipo</label>
                                        <Select value={inlineForm.type} onChange={(val) => setInlineForm({...inlineForm, type: val})} options={[
                                          { value: 'aberta', label: 'Aberta' },
                                          { value: 'multipla_escolha', label: 'Múltipla escolha' },
                                          { value: 'tecnica', label: 'Técnica' }
                                        ]} />
                                      </div>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                      <Button variant="outline" size="sm" onClick={cancelInlineEdit}>Cancelar</Button>
                                      <Button size="sm" onClick={saveInlineQuestion} className="bg-green-600 hover:bg-green-700">Salvar</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 cursor-pointer hover:bg-blue-100 p-2 rounded transition" onClick={() => startInlineEdit(q)}>
                                      <p className="text-sm text-slate-700"><strong>{idx + 1}.</strong> {q.question}</p>
                                      <p className="text-xs text-slate-400 mt-1">Tipo: {q.type}</p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button variant="ghost" size="sm" onClick={() => startInlineEdit(q)}>
                                        <Pencil size={14} />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteQuestion(q.id)}>
                                        <Trash size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Job Modal */}
      <Modal open={jobModal} onClose={() => setJobModal(false)} title={editingJob ? 'Editar Vaga' : 'Nova Vaga'} size="md">
        <div className="space-y-4">
          <Input label="Título da vaga *" value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Analista de RH Pleno" />
          <Input label="Departamento" value={jobForm.department} onChange={e => setJobForm(f => ({ ...f, department: e.target.value }))} />
          <Select label="Status" value={jobForm.status} onChange={v => setJobForm(f => ({ ...f, status: v as JobStatus }))} options={JOB_STATUS_OPTS} />
          <Textarea label="Descrição da vaga" value={jobForm.description} onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de abertura" type="date" value={jobForm.opening_date} onChange={e => setJobForm(f => ({ ...f, opening_date: e.target.value }))} />
            <Input label="Data de encerramento" type="date" value={jobForm.closing_date} onChange={e => setJobForm(f => ({ ...f, closing_date: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setJobModal(false)}>Cancelar</Button>
            <Button onClick={saveJob}>Salvar vaga</Button>
          </div>
        </div>
      </Modal>

      {/* Candidate Modal */}
      <Modal open={candModal} onClose={() => setCandModal(false)} title="Adicionar Candidato" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Enviar Currículo (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleResumeUpload(e.target.files?.[0])}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">Enviando um currículo, as informações serão extraídas automaticamente</p>
          </div>
          <Input label="Nome *" value={candForm.name} onChange={e => setCandForm(f => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="E-mail" type="email" value={candForm.email} onChange={e => setCandForm(f => ({ ...f, email: e.target.value }))} />
            <Input label="Telefone" value={candForm.phone} onChange={e => setCandForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <Input label="LinkedIn" value={candForm.linkedin} onChange={e => setCandForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="linkedin.com/in/..." />
          <Select label="Etapa" value={candForm.stage} onChange={v => setCandForm(f => ({ ...f, stage: v as CandidateStage }))} options={STAGE_OPTS} />
          <Textarea label="Observações" value={candForm.notes} onChange={e => setCandForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCandModal(false)}>Cancelar</Button>
            <Button onClick={saveCandidate}>Adicionar candidato</Button>
          </div>
        </div>
      </Modal>

      {/* Question Modal */}
      <Modal open={questionModal} onClose={() => { setQuestionModal(false); setEditingQuestion(null) }} title={editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'} size="md">
        <div className="space-y-4">
          <Select label="Categoria *" value={questionForm.category} onChange={v => setQuestionForm(f => ({ ...f, category: v }))} options={CATEGORIES} />
          <Textarea label="Pergunta *" value={questionForm.question} onChange={e => setQuestionForm(f => ({ ...f, question: e.target.value }))} placeholder="Digite a pergunta de entrevista..." rows={4} />
          <Select label="Tipo" value={questionForm.type} onChange={v => setQuestionForm(f => ({ ...f, type: v }))} options={[
            { value: 'aberta', label: 'Aberta' },
            { value: 'multipla_escolha', label: 'Múltipla Escolha' },
            { value: 'tecnica', label: 'Técnica' },
          ]} />
          <Input label="Ordem" type="number" value={questionForm.order_number} onChange={e => setQuestionForm(f => ({ ...f, order_number: parseInt(e.target.value) || 0 }))} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setQuestionModal(false); setEditingQuestion(null) }}>Cancelar</Button>
            <Button onClick={saveQuestion}>Salvar pergunta</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
