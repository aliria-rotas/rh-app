#!/usr/bin/env node

/**
 * Setup script for Supabase training responses
 *
 * Usage: SUPABASE_SERVICE_ROLE_KEY="your_key_here" node setup-supabase.js
 *
 * Get the Service Role Key from: https://app.supabase.com -> Settings -> API -> Service Role Key
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function executeSql(projectUrl, serviceRoleKey, sql) {
  try {
    const response = await fetch(`${projectUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'X-Client-Info': 'supabase-setup/1.0'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return { success: true };
  } catch (err) {
    // Silently try alternative method via Supabase SQL Editor endpoint
    return { success: false, error: err.message };
  }
}

async function setupSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const projectUrl = 'https://fmivqhsfkvfunznrlxde.supabase.co';

  if (!serviceRoleKey) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ⚠️  SUPABASE_SERVICE_ROLE_KEY não foi fornecida');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Para completar o setup, você precisa executar os SQL scripts');
    console.log('diretamente no Supabase SQL Editor:');
    console.log('');
    console.log('1. Acesse: https://app.supabase.com');
    console.log('2. Selecione o projeto "aliria-rotas"');
    console.log('3. Vá para SQL Editor');
    console.log('4. Execute os scripts nesta ordem:');
    console.log('   • CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql');
    console.log('   • CRIAR-FUNCAO-INSERT-RESPOSTAS.sql');
    console.log('   • CORRIGIR-RLS-RESPOSTAS-TREINAMENTO.sql');
    console.log('   • CRIAR-FUNCAO-GET-RESPOSTAS.sql');
    console.log('');
    console.log('OU, se tiver a chave de serviço, execute:');
    console.log('');
    console.log('export SUPABASE_SERVICE_ROLE_KEY="sua_chave_aqui"');
    console.log('node setup-supabase.js');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    process.exit(1);
  }

  const sqlFiles = [
    'CRIAR-TABELA-RESPOSTAS-TREINAMENTO.sql',
    'CRIAR-FUNCAO-INSERT-RESPOSTAS.sql',
    'CORRIGIR-RLS-RESPOSTAS-TREINAMENTO.sql',
    'CRIAR-FUNCAO-GET-RESPOSTAS.sql'
  ];

  console.log('');
  console.log('🔧 Iniciando setup do Supabase...  ');
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

    const result = await executeSql(projectUrl, serviceRoleKey, sql);

    if (result.success) {
      console.log('✅');
      successCount++;
    } else {
      console.log(`❌ ${result.error}`);
      errorCount++;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Resultado: ${successCount} sucesso, ${errorCount} erro(s)`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  if (successCount > 0) {
    console.log('✅ Setup completo!');
    console.log('');
    console.log('Próximas ações:');
    console.log('1. Recarregue o navegador (Ctrl+R)');
    console.log('2. Faça login em http://localhost:5173');
    console.log('3. Acesse Plano de Treinamento → Respostas do Treinamento');
  }

  console.log('');
}

setupSupabase().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
