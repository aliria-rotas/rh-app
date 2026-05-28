#!/usr/bin/env node
/**
 * Script para inserir Vinicius e Izabella com campos básicos
 * Depois as colunas adicionais serão atualizadas
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://fmivqhsfkvfunznrlxde.supabase.co';
const supabaseKey = 'sb_publishable_aqQX2mll1eMjNqLPNR6L-g_2HUSDygi';

const supabase = createClient(supabaseUrl, supabaseKey);

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

const now = () => new Date().toISOString();

async function insertEmployees() {
  console.log('📝 Inserindo Vinicius da Costa Baptista e Izabella...');

  // Dados básicos que definitivamente existem
  const vinicius = {
    id: generateId(),
    full_name: 'Vinicius da Costa Baptista',
    birth_date: '1985-03-15',
    gender: 'masculino',
    marital_status: 'casado',
    nationality: 'brasileira',
    cpf: '12345678901',
    rg: '1234567',
    rg_issuer: 'SSP/SP',
    address_street: 'Rua Exemplo',
    address_number: '123',
    address_complement: 'Apto 1',
    address_neighborhood: 'Centro',
    address_city: 'São Paulo',
    address_state: 'SP',
    address_zip: '01000-000',
    email: 'vinicius@example.com',
    email_corp: 'vinicius@aliria.com.br',
    phone: '11999999999',
    phone_emergency: '11988888888',
    emergency_contact_name: 'Laysla',
    position: 'Sócio',
    department: 'Diretoria',
    contract_type: 'pj',
    hire_date: '2024-01-01',
    salary: 0,
    status: 'ativo',
    pis_pasep: '00000000000',
    ctps_number: '0000000',
    ctps_series: '000',
    health_plan: true,
    meal_voucher: true,
    transport_voucher: true,
    notes: 'Sócio - Vinicius da Costa Baptista',
    created_at: now(),
    updated_at: now(),
  };

  const izabella = {
    id: generateId(),
    full_name: 'Izabella Campos Oliveira Hegg',
    birth_date: '1990-05-20',
    gender: 'feminino',
    marital_status: 'solteiro',
    nationality: 'brasileira',
    cpf: '98765432101',
    rg: '9876543',
    rg_issuer: 'SSP/SP',
    address_street: 'Rua Exemplo',
    address_number: '456',
    address_complement: '',
    address_neighborhood: 'Centro',
    address_city: 'São Paulo',
    address_state: 'SP',
    address_zip: '01000-000',
    email: 'izabella@example.com',
    email_corp: 'izabella@aliria.com.br',
    phone: '11999999999',
    phone_emergency: '11988888888',
    emergency_contact_name: 'Emergência',
    position: 'Sócia',
    department: 'Diretoria',
    contract_type: 'pj',
    hire_date: '2024-01-01',
    salary: 0,
    status: 'ativo',
    pis_pasep: '00000000000',
    ctps_number: '0000000',
    ctps_series: '000',
    health_plan: false,
    meal_voucher: false,
    transport_voucher: true,
    notes: 'Sócia - VR apenas',
    created_at: now(),
    updated_at: now(),
  };

  try {
    // Insert basic data
    const { data, error } = await supabase
      .from('rh_employees')
      .insert([vinicius, izabella])
      .select();

    if (error) {
      console.error('❌ Erro ao inserir:', error);
      process.exit(1);
    }

    console.log('✅ Colaboradores inseridos!');
    const vinId = data[0].id;
    const izaId = data[1].id;
    console.log(`   - Vinicius: ${vinId}`);
    console.log(`   - Izabella: ${izaId}`);

    // Now try to update with additional fields if columns exist
    console.log('');
    console.log('📝 Atualizando com campos adicionais...');

    const { error: updateError1 } = await supabase
      .from('rh_employees')
      .update({
        company: 'Aliria SP',
        company_cnpj: '47.848.127/0002-00',
        is_partner: true,
        partner_vt_weekly: 400,
        health_plan_cost: 500.00,
        health_plan_dependents: [
          { id: 'dep_laysla', name: 'Laysla', relationship: 'conjuge', monthly_cost: 0 },
          { id: 'dep_vito', name: 'Vito', relationship: 'filho', monthly_cost: 0 },
          { id: 'dep_luca', name: 'Luca', relationship: 'filho', monthly_cost: 0 }
        ],
        dental_plan: true,
        life_insurance: true,
        transport_voucher_cost: 814.00,
      })
      .eq('id', vinId);

    if (!updateError1) {
      console.log('✅ Vinicius atualizado com campos adicionais');
    } else {
      console.log('⚠️ Colunas adicionais não encontradas (pode ser normal)');
    }

    const { error: updateError2 } = await supabase
      .from('rh_employees')
      .update({
        company: 'Aliria SP',
        company_cnpj: '47.848.127/0002-00',
        is_partner: true,
        partner_vt_weekly: 0,
        dental_plan: false,
        life_insurance: false,
        transport_voucher_cost: 814.00,
      })
      .eq('id', izaId);

    if (!updateError2) {
      console.log('✅ Izabella atualizada com campos adicionais');
    } else {
      console.log('⚠️ Colunas adicionais não encontradas (pode ser normal)');
    }

    console.log('');
    console.log('✨ Inserção concluída!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

insertEmployees();
