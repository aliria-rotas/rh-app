# 📋 Guia Completo de Restauração de Vagas

## Situação: Todos os dados de vagas foram deletados

A tabela `rh_job_openings` está vazia. Nenhuma vaga está registrada no sistema.

---

## 📝 Vagas Identificadas para Restaurar

Com base no histórico e arquivos do sistema, estas vagas existiam:

### 1. ✅ Vaga de Enfermeira (CONFIRMADA)
- **Arquivo SQL relacionado:** `add-rh-questions-to-enfermeiro.sql`
- **Status:** Tinha perguntas de entrevista configuradas
- **Detalhes a recuperar:**
  - Descrição completa da vaga
  - Departamento
  - Localização
  - Salário (mínimo/máximo)
  - Tipo de contrato (full-time, part-time, etc)
  - Competências requeridas
  - Data de abertura
  - Data de encerramento (se aplicável)
  - Quantos candidatos havia inscritos

### 2. Coordenador de Frota (referenciado em queries)
- **Status:** Precisa de confirmação
- **Detalhes necessários:** idem acima

### 3. Analista de Sistemas (referenciado em queries)
- **Status:** Precisa de confirmação
- **Detalhes necessários:** idem acima

---

## 🛠️ Como Restaurar

### Passo 1: Confirmar Informações
Você precisa fornecer os dados de cada vaga que existia:

```markdown
Vaga: [Nome da posição]
Descrição: [Descrição da vaga]
Departamento: [Qual departamento]
Localização: [Onde funciona]
Salário Mínimo: [Valor ou deixar em branco]
Salário Máximo: [Valor ou deixar em branco]
Tipo de Contrato: [full-time, part-time, contrato]
Data de Abertura: [Data YYYY-MM-DD]
Data de Encerramento: [Data ou em aberto]
Competências Requeridas: [Listar separadas por vírgula]
Quantos candidatos havia: [Número ou 0]
```

### Passo 2: Executar Restauração
Após fornecer as informações, usar o script SQL gerado para restaurar.

### Passo 3: Verificação
Confirmar que as vagas aparecem no sistema:
- Acesse http://localhost:5173/recrutamento
- Verifique o contador "Vagas abertas"
- Verifique se as vagas aparecem na listagem

---

## 📂 Arquivos de Suporte Criados

1. **INVESTIGAR-ENFERMEIRA-DESAPARECIDA.sql**
   - Queries para investigar o que aconteceu
   - Execute no Supabase SQL Editor

2. **RESTAURAR-VAGA-ENFERMEIRA.sql**
   - Template para restaurar UMA vaga
   - Customize antes de executar

3. **RESTAURAR-VAGAS-COMPLETO.sql** (será criado após confirmação)
   - Script completo para restaurar TODAS as vagas
   - Com todos os dados corretos

---

## 🚨 Prevenção Futura

Como foi feito com os dados de benefícios (DADOS-ALIRIA.md), criar:

**DADOS-VAGAS-ABERTAS.md** - Documentação permanente de vagas

```markdown
# Vagas Abertas — Documento de Verdade

Atualizado: [data]
Responsável: [seu nome]

## Vaga: Enfermeira
- Descrição: [...]
- Departamento: [...]
- Data de criação: [...]
- [... outras informações]

## Vaga: Coordenador de Frota
[...]

## Vaga: Analista de Sistemas
[...]
```

Este arquivo será a fonte da verdade e poderá ser usado para restaurar dados em caso de novo acidente.

---

## ⚙️ Script SQL Parametrizado

Quando tiver as informações, will gerar um script como:

```sql
INSERT INTO rh_job_openings (
  id, title, position_id, department, status,
  description, required_competencies,
  opening_date, closing_date, candidates_count,
  created_at
) VALUES
  ('job_001', 'Enfermeira', '', 'Saúde', 'aberta',
   'Descrição aqui...', '["competência1", "competência2"]'::jsonb,
   '2026-05-01', '', 2, NOW()),
  ('job_002', 'Coordenador de Frota', '', 'Logística', 'aberta',
   'Descrição aqui...', '["competência1"]'::jsonb,
   '2026-04-15', '', 1, NOW()),
  ('job_003', 'Analista de Sistemas', '', 'TI', 'aberta',
   'Descrição aqui...', '["competência1"]'::jsonb,
   '2026-05-10', '', 0, NOW());

-- Verificar
SELECT id, title, department, status, candidates_count
FROM rh_job_openings
ORDER BY created_at DESC;
```

---

## 🔒 Recomendações Críticas

1. **Sempre documentar em Markdown** - Cria arquivo humanamente legível
2. **Versionamento em Git** - Cada mudança documentada
3. **Backups automáticos** - Configurar no Supabase
4. **Auditoria** - Log de quem alterou o quê
5. **RLS com cuidado** - Políticas de segurança podem esconder dados

---

## ✅ Próximos Passos

1. [ ] Confirmar lista de vagas que existiam
2. [ ] Fornecer detalhes de cada vaga
3. [ ] Executar script de restauração
4. [ ] Verificar no app
5. [ ] Criar DADOS-VAGAS-ABERTAS.md
6. [ ] Fazer commit no Git

