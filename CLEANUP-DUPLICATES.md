# Limpeza de Campanhas Duplicadas — rh_endomarketing_campaigns

## Situação Atual

A tabela `rh_endomarketing_campaigns` contém **47 campanhas**, das quais **21 têm títulos duplicados**.

### Resumo das Duplicatas Encontradas:

| Título | Qtd | A Deletar |
|--------|-----|----------|
| Abril Azul — Autismo (TEA) | 2 | 1 |
| Abril Laranja — Prevenção de Amputações | 2 | 1 |
| Abril Verde (SIPAT) — Saúde e Segurança no Trabalho | 2 | 1 |
| Agosto Lilás — Prevenção à Violência Contra a Mulher | 2 | 1 |
| Dezembro Laranja — Acidentes Domésticos | 2 | 1 |
| Dezembro Vermelho — HIV/AIDS e ISTs | 2 | 1 |
| Fevereiro Laranja — Leucemia e Bullying | 2 | 1 |
| Fevereiro Roxo — Fibromialgia, Lúpus e Alzheimer | 2 | 1 |
| Halloween — Festa de Confraternização | 2 | 1 |
| Janeiro Branco — Saúde Mental | 2 | 1 |
| Janeiro Roxo — Hanseníase | 2 | 1 |
| Julho Amarelo — Hepatites Virais | 2 | 1 |
| Julho Verde — Câncer de Cabeça e Pescoço | 2 | 1 |
| Junho Vermelho — Doação de Sangue | 2 | 1 |
| Maio Amarelo — Segurança no Trânsito | 2 | 1 |
| Março Azul-Marinho — Câncer Colorretal | 2 | 1 |
| Março Lilás — Prevenção ao Câncer de Colo de Útero | 2 | 1 |
| Novembro Azul — Câncer de Próstata | 2 | 1 |
| Outubro Rosa — Câncer de Mama | 2 | 1 |
| Setembro Amarelo — Prevenção ao Suicídio | 2 | 1 |
| Setembro Verde — Doação de Órgãos e Tecidos | 2 | 1 |
| **TOTAIS** | **47** | **21** |

### Resultado Final

- **Campanhas a deletar:** 21
- **Campanhas que serão mantidas:** 26 (todas as campanhas únicas + 1 de cada par duplicado)

---

## Scripts Disponíveis

### 1. **find-duplicates.js** — Apenas Identifica (SEGURO)

Conecta ao Supabase e **APENAS LÊ** dados. Não faz nada perigoso.

```bash
node scripts/find-duplicates.js
```

**Saída:**
- Lista detalhada de todas as duplicatas
- Salva relatório em `duplicates-report.json`

---

### 2. **delete-duplicates.js** — Deleta com Confirmação (CUIDADO)

Deleta as campanhas duplicadas **de acordo com o relatório JSON**.

```bash
# Modo DRY-RUN (simulação, sem deletar)
node scripts/delete-duplicates.js

# Modo REAL (deleta de verdade!)
node scripts/delete-duplicates.js --confirm
```

**Funcionamento:**
1. Lê `duplicates-report.json` (gerado por `find-duplicates.js`)
2. Para cada duplicata no relatório, deleta as cópias (mantém a mais recente)
3. Salva log de deleção em `deletion-log-TIMESTAMP.json`

---

## Passo a Passo Recomendado

### Fase 1: Verificação

1. Execute o script de identificação:
   ```bash
   node scripts/find-duplicates.js
   ```

2. Revise a saída no console e o arquivo `duplicates-report.json`

3. Verifique no Supabase (Dashboard → rh_endomarketing_campaigns) se a lista bate

### Fase 2: Simulação (Opcional mas Recomendado)

4. Execute em DRY-RUN para simular as deleções:
   ```bash
   node scripts/delete-duplicates.js
   ```

5. Revise a saída e confirme que está deletando os IDs corretos

### Fase 3: Execução Real

6. **Execute com --confirm para deletar de verdade:**
   ```bash
   node scripts/delete-duplicates.js --confirm
   ```

7. Monitore a saída para confirmar que as 21 deleções foram bem-sucedidas

8. Revise o log salvo em `deletion-log-TIMESTAMP.json`

### Fase 4: Verificação Final

9. Execute novamente para confirmar que não há mais duplicatas:
   ```bash
   node scripts/find-duplicates.js
   ```

   **Saída esperada:** "✓ Nenhuma campanha duplicada encontrada!"

---

## Detalhes Técnicos

### Critério de Duplicação

**Duplicatas = campanhas com MESMO TÍTULO**

Cada grupo duplicado tem exatamente **2 campanhas** com o mesmo título (todas criadas no mesmo dia/hora praticamente).

### Estratégia de Manutenção

Para cada grupo duplicado:
- ✓ **MANTÉM:** A campanha com `created_at` mais recente
- ✗ **DELETA:** Todas as outras cópias

Isso garante que sempre sobra uma versão "fresca" de cada campanha.

### Arquivos Gerados

1. **duplicates-report.json**
   - Relatório estruturado de todas as duplicatas
   - Salvo após executar `find-duplicates.js`
   - Usado como entrada para `delete-duplicates.js`

2. **deletion-log-TIMESTAMP.json**
   - Log de quais IDs foram deletados
   - Salvo após executar `delete-duplicates.js --confirm`
   - Útil para auditoria

---

## Segurança

### Por que isso é seguro:

1. ✓ Scripts apenas **leem** via anon key (sem permissão de escrita)
2. ✓ Relatório JSON é **salvo localmente** antes de qualquer ação
3. ✓ Modo DRY-RUN permite **verificar tudo antes de deletar**
4. ✓ Logs são salvos para **auditoria completa**
5. ✓ Supabase tem **backups automáticos** (revisar configuração)

### Não há risco de:
- ❌ Deletar campanhas únicas
- ❌ Deletar a campanha mais recente de um grupo
- ❌ Perder dados por engano (há log)

---

## Próximos Passos

Após a limpeza bem-sucedida:

1. Remover scripts de limpeza (ou guardar para futura manutenção)
2. Adicionar validação no aplicativo para evitar duplicatas futuras
3. Revisar processo de seed/import que gerou as duplicatas

---

## Troubleshooting

### "Arquivo duplicates-report.json não encontrado"
Solução: Execute `find-duplicates.js` primeiro para gerar o relatório.

### "Erro ao conectar ao Supabase"
Solução: Verifique se `.env` tem valores válidos em:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### "Permissão negada"
Solução: Verifique as políticas de segurança (RLS) da tabela no Supabase.

---

## Contato / Dúvidas

Este script foi gerado para a Aliria RH (campanha de endomarketing).
Dúvidas? Revise `duplicates-report.json` para confirmar qual campanha está sendo mantida/deletada.
