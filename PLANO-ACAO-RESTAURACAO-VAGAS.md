# 🚨 PLANO DE AÇÃO — Restauração de Vagas Deletadas

**Situação:** Todas as vagas foram deletadas do banco de dados
**Data:** 28/05/2026
**Prioridade:** 🔴 CRÍTICA

---

## ✅ O que Descobri

1. **Confirmado:** Tabela `rh_job_openings` está completamente vazia
2. **Prova:** Arquivo `add-rh-questions-to-enfermeiro.sql` referencia vaga de Enfermeiro que não existe mais
3. **App:** Página http://localhost:5173/recrutamento mostra "Nenhuma vaga cadastrada"
4. **Métricas:** 
   - 0 Vagas abertas
   - 0 Vagas em andamento
   - 0 Total de vagas
   - 0 Candidatos

---

## 📋 Vagas Identificadas para Restaurar

Com base no histórico do sistema, estas vagas existiam:

| # | Posição | Status | Confirmação | Detalhes |
|---|---------|--------|-------------|----------|
| 1 | **Enfermeira** (ou Enfermeiro) | ✅ CONFIRMADA | Arquivo SQL referencia esta vaga | Precisa de: Descrição, Dept, Salário, etc |
| 2 | Coordenador de Frota | ⚠️ REFERENCIADA | Vista em queries anteriores | Idem |
| 3 | Analista de Sistemas | ⚠️ REFERENCIADA | Vista em queries anteriores | Idem |

---

## 🛠️ Opção 1: Restaurar via SQL (Rápido)

### Passo 1: Abrir Supabase SQL Editor

1. Acesse seu projeto Supabase
2. Vá para SQL Editor
3. Cole e execute cada script abaixo

### Passo 2: Listar Vagas Existentes (Verificação)

```sql
-- Verificar se a tabela está realmente vazia
SELECT COUNT(*) as total_vagas FROM rh_job_openings;

-- Se retornar 0, continuar com restauração
```

### Passo 3: Inserir Vagas Mínimas (Template)

```sql
-- Restaurar Vaga de Enfermeira (dados básicos)
INSERT INTO rh_job_openings (
  id, title, position_id, department, status,
  description, required_competencies,
  opening_date, closing_date, candidates_count,
  created_at
) VALUES
  ('job_enfermeira_001', 'Enfermeira', '', 'Saúde/Clínica', 'aberta',
   'Vaga para Enfermeira. Descrição completa a completar.',
   '["cuidado_pacientes", "empatia", "comunicacao"]'::jsonb,
   '2026-05-01', '', 0, NOW());

-- Restaurar Vaga de Coordenador de Frota
INSERT INTO rh_job_openings (
  id, title, position_id, department, status,
  description, required_competencies,
  opening_date, closing_date, candidates_count,
  created_at
) VALUES
  ('job_frota_001', 'Coordenador de Frota', '', 'Logística/Operações', 'aberta',
   'Vaga para Coordenador de Frota. Descrição completa a completar.',
   '["lideranca", "organizacao", "planejamento"]'::jsonb,
   '2026-04-15', '', 0, NOW());

-- Restaurar Vaga de Analista de Sistemas
INSERT INTO rh_job_openings (
  id, title, position_id, department, status,
  description, required_competencies,
  opening_date, closing_date, candidates_count,
  created_at
) VALUES
  ('job_ti_001', 'Analista de Sistemas', '', 'TI/Tecnologia', 'aberta',
   'Vaga para Analista de Sistemas. Descrição completa a completar.',
   '["programacao", "problema_solving", "comunicacao"]'::jsonb,
   '2026-05-10', '', 0, NOW());

-- Verificar restauração
SELECT id, title, department, status, created_at
FROM rh_job_openings
ORDER BY created_at DESC;
```

### Passo 4: Atualizar Descrições Completas

Após restaurar as vagas básicas, atualize com as descrições reais:

```sql
-- EDITAR COM OS DADOS REAIS ANTES DE EXECUTAR
UPDATE rh_job_openings
SET description = 'Descrição completa da vaga de Enfermeira aqui...',
    required_competencies = '["competencia1", "competencia2"]'::jsonb,
    opening_date = '2026-05-XX',
    candidates_count = 0
WHERE id = 'job_enfermeira_001';

-- Idem para outras vagas
UPDATE rh_job_openings
SET description = 'Descrição completa da vaga de Coordenador de Frota aqui...',
    required_competencies = '["competencia1", "competencia2"]'::jsonb
WHERE id = 'job_frota_001';

UPDATE rh_job_openings
SET description = 'Descrição completa da vaga de Analista de Sistemas aqui...',
    required_competencies = '["competencia1", "competencia2"]'::jsonb
WHERE id = 'job_ti_001';
```

---

## 🖥️ Opção 2: Restaurar via App (Interface)

### Passo 1: Acessar Recrutamento
- URL: http://localhost:5173/recrutamento
- Clique em "Nova Vaga" (botão laranja)

### Passo 2: Preencher Formulário
Para cada vaga, preencha:
- **Posição:** Enfermeira, Coordenador de Frota, Analista de Sistemas
- **Descrição:** Descrição detalhada
- **Departamento:** Saúde, Logística, TI
- **Localização:** Local de trabalho
- **Salário:** (se aplicável)
- **Tipo de Contrato:** Full-time, Part-time, etc
- **Competências:** Listadas por tipo
- **Data de Abertura:** Quando foi criada
- **Data de Encerramento:** (deixar em branco se continua aberta)

### Passo 3: Salvar
- Clique em "Salvar Vaga"
- Verifique se aparece na listagem

---

## 📚 Opção 3: Restaurar com Detalhes Completos

Para restaurar com TODAS as informações corretas:

### Passo A: Liste as Informações
Para cada vaga, forneça:

```markdown
**Vaga: [Nome]**
- Descrição: [Texto completo]
- Departamento: [Ex: Saúde]
- Localização: [Ex: São Paulo, SP]
- Salário Mínimo: [Ex: 3000]
- Salário Máximo: [Ex: 5000]
- Tipo de Contrato: [full-time]
- Competências: [List separated by comma]
- Data de Abertura: [YYYY-MM-DD]
- Quantos candidatos haviam: [Number]
```

### Passo B: Eu Criarei Script SQL Personalizado
Com as informações, criarei um script SQL com todos os dados corretos.

### Passo C: Executar no Supabase
Você executa o script no SQL Editor.

---

## ✨ Verificação Final

Após restaurar, verifique:

1. **No App:**
   - Acesse http://localhost:5173/recrutamento
   - Deve mostrar "3 Vagas abertas" (ou conforme restaurado)
   - Vagas devem aparecer na listagem

2. **No Supabase:**
   ```sql
   SELECT id, title, department, candidates_count
   FROM rh_job_openings
   ORDER BY created_at DESC;
   ```
   - Deve retornar as 3 vagas

3. **Candidatos:**
   - Se havia candidatos para essas vagas, eles também precisarão ser restaurados
   - Dependem da relação com `rh_job_openings`

---

## 🔐 Prevenção: Documentação Permanente

Criar arquivo `DADOS-VAGAS-ABERTAS.md`:

```markdown
# 📋 Vagas Abertas — Documento de Verdade

**Atualizado:** 28/05/2026
**Responsável:** [Seu nome]

## Vaga 1: Enfermeira
- Descrição: [Completa]
- Departamento: Saúde
- Salário: R$ XXX - R$ XXX
- Data de criação: 2026-XX-XX
- Status: aberta
- Candidatos inscritos: 0

## Vaga 2: Coordenador de Frota
[...]

## Vaga 3: Analista de Sistemas
[...]

---
**NOTA:** Este arquivo é a fonte da verdade. Sempre atualizar após criar/modificar vagas.
```

---

## 🚀 Próximos Passos

- [ ] **URGENTE:** Escolher entre Opção 1, 2 ou 3 acima
- [ ] Restaurar as 3 vagas identificadas
- [ ] Verificar no app que aparecem corretamente
- [ ] Criar DADOS-VAGAS-ABERTAS.md
- [ ] Fazer commit em Git
- [ ] Implementar backup automático no Supabase

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas, os seguintes arquivos estão disponíveis:
- `GUIA-RESTAURACAO-VAGAS.md` — Guia detalhado
- `INVESTIGAR-ENFERMEIRA-DESAPARECIDA.sql` — Queries de investigação
- `RESTAURAR-VAGA-ENFERMEIRA.sql` — Template para uma vaga
