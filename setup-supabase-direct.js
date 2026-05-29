#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const projectUrl = 'https://fmivqhsfkvfunznrlxde.supabase.co';

  if (!serviceRoleKey) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY não foi fornecida');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Copie a chave e use:');
    console.log('');
    console.log('$env:SUPABASE_SERVICE_ROLE_KEY="sua_chave_aqui"');
    console.log('node setup-supabase-direct.js');
    console.log('');
    process.exit(1);
  }

  const supabase = createClient(projectUrl, serviceRoleKey);

  const sqlFiles = [
    'CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql',
    'CRIAR-FUNCAO-INSERT-RESPOSTAS.sql',
    'CORRIGIR-RLS-RESPOSTAS-TREINAMENTO.sql',
    'CRIAR-FUNCAO-GET-RESPOSTAS.sql'
  ];

  console.log('');
  console.log('🔧 Iniciando setup do Supabase...');
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const file of sqlFiles) {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Arquivo não encontrado: ${file}`);
      errorCount++;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf-8');
    process.stdout.write(`📝 Executando: ${file}... `);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        // Se rpc exec_sql não existe, tentar direto com query
        const { error: queryError } = await supabase.from('_none_').select('*').limit(0);

        // Execute via raw PostgreSQL (usando admin endpoint)
        const response = await fetch(`${projectUrl}/rest/v1/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'X-Admin': 'true'
          },
          body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
          const text = await response.text();
          console.log(`❌ ${response.status}`);
          errorCount++;
          continue;
        }
      }

      console.log('✅');
      successCount++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errorCount++;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Resultado: ${successCount} sucesso, ${errorCount} erro(s)`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  if (successCount > 0) {
    console.log('✅ Setup parcialmente completo!');
    console.log('');
    console.log('Se houver erros, execute os scripts manualmente:');
    console.log('1. Vá para https://app.supabase.com → Projeto → SQL Editor');
    console.log('2. Cole cada arquivo .sql e execute na ordem listada acima');
  } else if (errorCount > 0) {
    console.log('❌ Não foi possível executar via API.');
    console.log('');
    console.log('⚠️  Opção Manual:');
    console.log('1. Vá para https://app.supabase.com');
    console.log('2. Selecione projeto "aliria-rotas"');
    console.log('3. SQL Editor');
    console.log('4. Cole e execute cada arquivo .sql nesta ordem:');
    console.log('   • CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql');
    console.log('   • CRIAR-FUNCAO-INSERT-RESPOSTAS.sql');
    console.log('   • CORRIGIR-RLS-RESPOSTAS-TREINAMENTO.sql');
    console.log('   • CRIAR-FUNCAO-GET-RESPOSTAS.sql');
  }

  console.log('');
}

setupSupabase().catch(err => {
  console.error('Erro fatal:', err.message);
  process.exit(1);
});
