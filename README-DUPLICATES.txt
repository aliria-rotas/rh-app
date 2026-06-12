╔════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                    ║
║     PROJETO: Limpeza de Campanhas Duplicadas — rh_endomarketing_campaigns        ║
║     DATA: 09/06/2026                                                              ║
║     STATUS: Preparado para Execução (Aguardando Confirmação)                      ║
║                                                                                    ║
╚════════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DIAGNÓSTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total de campanhas: 47
Campanhas com títulos duplicados: 21
Total de duplicatas a DELETAR: 21
Campanhas que serão MANTIDAS: 26 (100% do conteúdo único)

Padrão: Cada grupo duplicado tem exatamente 2 campanhas com o mesmo título
Critério: Mantém a mais recente (por created_at), deleta a cópia mais antiga

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 ARQUIVOS CRIADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOCUMENTAÇÃO:
  ✓ CLEANUP-DUPLICATES.md          — Guia detalhado (passo a passo)
  ✓ DUPLICATES-SUMMARY.txt         — Resumo executivo
  ✓ DELETES-A-EXECUTAR.txt         — Lista dos 21 IDs a deletar
  ✓ CHECKLIST-EXECUCAO.md          — Checklist de aprovação
  ✓ README-DUPLICATES.txt          — Este arquivo

SCRIPTS:
  ✓ scripts/find-duplicates.js     — Identifica duplicatas (SEGURO)
  ✓ scripts/delete-duplicates.js   — Deleta duplicatas (requer --confirm)
  ✓ scripts/verify-cleanup.js      — Verifica resultado final

DADOS:
  ✓ duplicates-report.json         — Relatório estruturado (gerado)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 COMO EXECUTAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASSO 1: Verificar Duplicatas (SEGURO — não modifica nada)
  $ node scripts/find-duplicates.js
  Resultado: Lista 21 duplicatas e salva duplicates-report.json

PASSO 2: Simular Deleção (Opcional mas Recomendado)
  $ node scripts/delete-duplicates.js
  Resultado: Mostra o que SERIA deletado (sem deletar nada)

PASSO 3: Deletar de Verdade (CUIDADO!)
  $ node scripts/delete-duplicates.js --confirm
  Resultado: Deleta os 21 IDs e salva log em deletion-log-TIMESTAMP.json

PASSO 4: Verificar Resultado (SEGURO — validação final)
  $ node scripts/verify-cleanup.js
  Resultado esperado: "✅ EXCELENTE: Nenhuma campanha duplicada encontrada!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPORTANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ SEGURO PORQUE:
  • Scripts apenas LEEM dados (via anon key sem DELETE)
  • Relatório JSON salvo LOCALMENTE antes de qualquer ação
  • Modo DRY-RUN permite VERIFICAR tudo antes de deletar
  • Logs salvos para AUDITORIA COMPLETA
  • Supabase tem BACKUPS AUTOMÁTICOS

❌ NÃO HÁ RISCO DE:
  • Deletar campanhas únicas
  • Deletar a campanha mais recente
  • Perder dados sem rastreamento

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CAMPANHAS AFETADAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Serão deletadas 1 cópia de cada:
 1. Abril Azul — Autismo (TEA)
 2. Abril Laranja — Prevenção de Amputações
 3. Abril Verde (SIPAT) — Saúde e Segurança no Trabalho
 4. Agosto Lilás — Prevenção à Violência Contra a Mulher
 5. Dezembro Laranja — Acidentes Domésticos
 6. Dezembro Vermelho — HIV/AIDS e ISTs
 7. Fevereiro Laranja — Leucemia e Bullying
 8. Fevereiro Roxo — Fibromialgia, Lúpus e Alzheimer
 9. Halloween — Festa de Confraternização
10. Janeiro Branco — Saúde Mental
11. Janeiro Roxo — Hanseníase
12. Julho Amarelo — Hepatites Virais
13. Julho Verde — Câncer de Cabeça e Pescoço
14. Junho Vermelho — Doação de Sangue
15. Maio Amarelo — Segurança no Trânsito
16. Março Azul-Marinho — Câncer Colorretal
17. Março Lilás — Prevenção ao Câncer de Colo de Útero
18. Novembro Azul — Câncer de Próstata
19. Outubro Rosa — Câncer de Mama
20. Setembro Amarelo — Prevenção ao Suicídio
21. Setembro Verde — Doação de Órgãos e Tecidos

(Ver DELETES-A-EXECUTAR.txt para IDs exatos)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 LEITURA RECOMENDADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PRIMEIRO: CLEANUP-DUPLICATES.md
   └─ Entender a situação, critérios e processo

2. DEPOIS: CHECKLIST-EXECUCAO.md
   └─ Seguir passo a passo com checkboxes

3. REFERÊNCIA RÁPIDA: DUPLICATES-SUMMARY.txt
   └─ Quando você precisa lembrar dos números

4. EXECUTAR: Scripts na ordem recomendada
   └─ find-duplicates.js → delete-duplicates.js → verify-cleanup.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 PRÓXIMOS PASSOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Revisar CLEANUP-DUPLICATES.md
2. Executar: node scripts/find-duplicates.js
3. Confirmar números coincidem com este documento
4. Executar: node scripts/delete-duplicates.js (simulação)
5. Revisar saída e IDs
6. Executar: node scripts/delete-duplicates.js --confirm
7. Revisar log em deletion-log-TIMESTAMP.json
8. Executar: node scripts/verify-cleanup.js
9. Confirmar mensagem de sucesso

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✉️  CONTATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dúvidas ou problemas? Revise:
  • CLEANUP-DUPLICATES.md (seção "Troubleshooting")
  • duplicates-report.json (para IDs exatos)
  • Logs do Supabase (para erros de banco de dados)

╔════════════════════════════════════════════════════════════════════════════════════╗
║                         PRONTO PARA EXECUÇÃO!                                     ║
╚════════════════════════════════════════════════════════════════════════════════════╝
