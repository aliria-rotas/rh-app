# 📋 Vagas Abertas — Configuração Permanente

**IMPORTANTE:** Este arquivo documenta as vagas reais da empresa. Usar como fonte da verdade para restaurações e migrações. **NUNCA** deixar este arquivo sair do controle de versão.

---

## 🎯 Vagas Cadastradas

### 1. Enfermeira ✅ ABERTA
- **ID no banco:** `job_enfermeira_001`
- **Departamento:** Saúde/Clínica
- **Status:** aberta
- **Data de abertura:** 2026-05-01
- **Data de encerramento:** (em aberto)
- **Descrição:** Profissional de enfermagem responsável por cuidados diretos com pacientes, atendimento empático e procedimentos clínicos.
- **Competências obrigatórias:**
  - Cuidado e empatia com pacientes
  - Comunicação clara e gentil
  - Conhecimento técnico de enfermagem
  - Trabalho em equipe
  - Orientação para atendimento humanizado
- **Número de candidatos:** (será preenchido conforme inscrições)
- **Observações:** Vaga crítica para a operação. Prioridade alta.

### 2. Assistente de Farmácia ⏸️ ENCERRADA
- **ID no banco:** `job_farmacia_001`
- **Departamento:** Farmácia
- **Status:** encerrada
- **Data de abertura:** 2026-01-01
- **Data de encerramento:** 2026-05-20
- **Descrição:** Assistente responsável por organização de medicamentos, atendimento ao balcão e suporte ao farmacêutico.
- **Competências obrigatórias:**
  - Organização e atenção aos detalhes
  - Comunicação clara com clientes
  - Conhecimento básico de medicamentos
  - Responsabilidade e discrição
  - Orientação para atendimento empático
- **Número de candidatos:** 0
- **Observações:** Vaga encerrada. Poder ser reacessada se necessário.

### 3. Analista de Licitações ❌ CANCELADA
- **ID no banco:** `job_licitacoes_001`
- **Departamento:** Administrativo
- **Status:** cancelada
- **Data de abertura:** 2026-02-01
- **Data de encerramento:** 2026-05-15
- **Descrição:** Especialista em processos de licitação pública, análise de editais e conformidade regulatória.
- **Competências obrigatórias:**
  - Conhecimento de legislação de licitações
  - Análise de documentação complexa
  - Atenção aos prazos
  - Comunicação eficaz com órgãos públicos
  - Excelência em organização de processos
- **Número de candidatos:** 0
- **Observações:** Vaga cancelada (posição não disponível no momento).

---

## 📊 Resumo de Status

| Posição | Departamento | Status | Candidatos | Prioridade |
|---------|--------------|--------|-----------|-----------|
| Enfermeira | Saúde | ✅ Aberta | — | 🔴 Alta |
| Assistente de Farmácia | Farmácia | ⏸️ Encerrada | 0 | ⚪ Média |
| Analista de Licitações | Administrativo | ❌ Cancelada | 0 | ⚪ Baixa |

---

## 🔐 Prevenção de Perda de Dados

**Histórico de Restaurações:**

| Data | Ação | Responsável | Motivo |
|------|------|-------------|--------|
| 28/05/2026 | Restauração das 3 vagas | Klissia Corazza | Dados haviam sido deletados do banco sem backup |
| — | — | — | — |

**REGRA CRÍTICA:** Toda vez que uma vaga for criada, modificada ou deletada:
1. ✅ Atualizar este arquivo
2. ✅ Fazer commit em Git com mensagem descritiva
3. ✅ Verificar no app que a vaga aparece corretamente

---

## 📝 Últimas Atualizações

**Data:** 28/05/2026  
**Responsável:** Klissia Corazza  
**Mudanças:**
- Documentação permanente das 3 vagas principais
- Estrutura criada para rastrear histórico de restaurações
- Competências detalhadas para cada posição
- Status claro e observações importantes

**Data de próxima revisão:** Conforme novas vagas forem criadas ou modificadas

---

## ⚠️ Aviso Importante

Este arquivo é a **fonte única da verdade** para as vagas da Aliria. Se houver dúvida sobre quais vagas existem ou seus detalhes, consultar **este arquivo primeiro**, não o banco de dados (que pode ser perdido).

O banco de dados deve **sempre** estar sincronizado com este arquivo.
