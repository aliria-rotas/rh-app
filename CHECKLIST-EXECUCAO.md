# Checklist de Execução — Limpeza de Duplicatas

## Status Atual

- **Data:** 09/06/2026, 18:36:03
- **Total de campanhas:** 47
- **Duplicatas encontradas:** 21 grupos
- **IDs a deletar:** 21 (uma cópia de cada par)
- **Campanhas que permanecerão:** 26

---

## Antes de Começar

- [ ] Fazer backup da base de dados Supabase (se possível)
- [ ] Notificar stakeholders sobre a manutenção programada
- [ ] Ler o documento `CLEANUP-DUPLICATES.md`
- [ ] Revisar `duplicates-report.json` para confirmar os IDs

---

## FASE 1: Verificação Inicial

### 1.1 Confirmar Diagnóstico
```bash
node scripts/find-duplicates.js
```

**Resultado esperado:**
- Lista as 21 campanhas duplicadas
- Salva `duplicates-report.json`
- Deve mostrar: "⚠️ ENCONTRADAS 21 CAMPANHAS COM TÍTULOS DUPLICADOS"

- [ ] Saída está correta
- [ ] Arquivo `duplicates-report.json` foi criado
- [ ] IDs listados batem com `DELETES-A-EXECUTAR.txt`

### 1.2 Revisar Relatório
- [ ] Abrir `duplicates-report.json` no editor
- [ ] Verificar que cada grupo tem `count: 2`
- [ ] Confirmar IDs em `delete_ids`

---

## FASE 2: Simulação (DRY-RUN)

### 2.1 Executar em Modo de Simulação
```bash
node scripts/delete-duplicates.js
```

**Resultado esperado:**
- Mostra "🔄 DRY-RUN (simulação)"
- Lista os 21 IDs que SERIA deletes
- Não deleta nada de verdade

- [ ] Execução bem-sucedida
- [ ] Saída mostra [DRY-RUN] para cada ID
- [ ] Nenhum erro no console

### 2.2 Revisar Saída
- [ ] Todas as 21 campanhas listadas
- [ ] Nenhuma campanha única foi afetada
- [ ] IDs correspondem ao arquivo `DELETES-A-EXECUTAR.txt`

---

## FASE 3: Execução Real

### 3.1 Backup Final
- [ ] Anotar o timestamp: ___________________
- [ ] Confirmar que ninguém está usando o app neste momento

### 3.2 Executar com --confirm
```bash
node scripts/delete-duplicates.js --confirm
```

**Resultado esperado:**
- Mostra "🗑️ DELETANDO PARA VALER"
- Exibe "✓ Deletada:" para cada uma das 21 campanhas
- Salva log em `deletion-log-TIMESTAMP.json`

- [ ] Todas as 21 deleções bem-sucedidas
- [ ] Nenhum erro durante a execução
- [ ] Arquivo `deletion-log-TIMESTAMP.json` foi criado

### 3.3 Revisar Log de Deleção
```bash
cat deletion-log-TIMESTAMP.json
```

- [ ] Arquivo criado
- [ ] `total_deleted: 21`
- [ ] `total_failed: 0`
- [ ] Todos os 21 IDs aparecem em `deleted_ids`

---

## FASE 4: Verificação Final

### 4.1 Confirmar Limpeza
```bash
node scripts/verify-cleanup.js
```

**Resultado esperado:**
- Mostra "AGORA: 26 campanhas"
- Mostra "✅ EXCELENTE: Nenhuma campanha duplicada encontrada!"
- Nenhuma campanha duplicada na lista

- [ ] Total de campanhas é 26
- [ ] Mensagem de sucesso aparece
- [ ] Nenhuma duplicata listada

### 4.2 Verificação Manual (Supabase Dashboard)
- [ ] Acessar Supabase → Projeto aliria-rotas
- [ ] Ir para tabela `rh_endomarketing_campaigns`
- [ ] Confirmar que há 26 campanhas
- [ ] Filtrar por cada mês/cor para confirmar unicidade

---

## FASE 5: Comunicação

### 5.1 Notificar Stakeholders
- [ ] Confirmar com time de Endomarketing que tudo correu bem
- [ ] Revisar se algo no app quebrou (dashboard, listagens, etc)
- [ ] Pedir para testar campanhas no sistema

### 5.2 Documentação
- [ ] Guardar `duplicates-report.json` para auditoria
- [ ] Guardar `deletion-log-TIMESTAMP.json` para auditoria
- [ ] Remover ou arquivar scripts de limpeza

---

## FASE 6: Análise Raiz (Post-Limpeza)

### 6.1 Investigar Causa das Duplicatas
- [ ] Revisar processo de seed/import
- [ ] Verificar código que insere campanhas
- [ ] Identificar como 21 campanhas foram duplicadas simultaneamente

### 6.2 Implementar Prevenção
- [ ] Adicionar validação de unicidade de título no backend
- [ ] Adicionar constraint UNIQUE na tabela (se possível)
- [ ] Adicionar testes para evitar duplicatas futuras

### 6.3 Revisar RLS e Segurança
- [ ] Verificar políticas RLS da tabela
- [ ] Confirmar que apenas admin pode deletar
- [ ] Revisar permissões de leitura/escrita

---

## Artifacts

Arquivos criados durante este processo:

```
C:\Klissia - RH\rh-app\
├── CLEANUP-DUPLICATES.md               ← Documentação detalhada
├── DUPLICATES-SUMMARY.txt              ← Resumo executivo
├── DELETES-A-EXECUTAR.txt              ← Lista de 21 IDs a deletar
├── CHECKLIST-EXECUCAO.md               ← Este arquivo
├── duplicates-report.json              ← Relatório JSON (gerado)
├── deletion-log-TIMESTAMP.json         ← Log de deleção (será gerado)
└── scripts/
    ├── find-duplicates.js              ← Identifica duplicatas
    ├── delete-duplicates.js            ← Deleta duplicatas
    ├── verify-cleanup.js               ← Verifica resultado
    ├── cleanup-duplicates.js           ← Alt (não precisa usar)
    └── cleanup-duplicates.ts           ← Alt (não precisa usar)
```

---

## Troubleshooting

### Problema: "Erro ao conectar ao Supabase"
**Solução:**
1. Verificar `.env`:
   ```
   VITE_SUPABASE_URL=https://fmivqhsfkvfunznrlxde.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi
   ```
2. Testar conexão com `find-duplicates.js` (apenas leitura)

### Problema: "Permissão negada ao deletar"
**Solução:**
1. Verificar políticas RLS no Supabase
2. Confirmar que a anon key tem permissão de DELETE
3. Se necessário, usar chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`)

### Problema: "Script saiu sem fazer nada"
**Solução:**
1. Revisar se há erros no console
2. Confirmar que node versão é >= 14
3. Confirmar que dependencies estão instaladas (`npm install`)

---

## Rollback (Se Necessário)

Se algo der errado após a deleção:

1. Verificar `deletion-log-TIMESTAMP.json` para listar IDs deletados
2. Contatar Supabase para recuperar de backup
3. Desculpar-se com o gerente

---

## Notas Adicionais

- Script mantém sempre a campanha mais RECENTE (maior `created_at`)
- Deletadas as 21 cópias mais ANTIGAS
- Diferença de tempo entre originais e duplicatas: ~19ms
- Todas as 21 duplicatas foram criadas no MESMO TIMESTAMP: 09/06/2026, 18:13:43

---

## Aprovação

- [ ] Preparação: ____________________ (data)
- [ ] Execução: ____________________ (data)
- [ ] Verificação: ____________________ (data)
- [ ] Aprovação final: ____________________ (responsável)

---

**RESUMO:** Quando esta checklist estiver 100% marcada, a limpeza estará concluída com sucesso!
