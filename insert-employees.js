#!/usr/bin/env node
/**
 * Script para inserir Vinicius e Izabella no Supabase
 * Execução: node insert-employees.js
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuração Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://epsfsgxltlhuzjmgtyzf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não está definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

const now = () => new Date().toISOString();

async function insertEmployees() {
  console.log('📝 Inserindo Vinicius da Costa Baptista...');

  const vinicius = {
    id: generateId(),
    // Empresa
    company: 'Aliria SP',
    company_cnpj: '47.848.127/0002-00',
    is_partner: true,
    partner_vt_weekly: 400,
    // Dados pessoais
    full_name: 'Vinicius da Costa Baptista',
    birth_date: '1985-03-15',
    gender: 'masculino',
    marital_status: 'casado',
    nationality: 'brasileira',
    cpf: '12345678901',  // Placeholder
    rg: '1234567',
    rg_issuer: 'SSP/SP',
    // Endereço
    address_street: 'Rua Exemplo',
    address_number: '123',
    address_complement: 'Apto 1',
    address_neighborhood: 'Centro',
    address_city: 'São Paulo',
    address_state: 'SP',
    address_zip: '01000-000',
    // Contato
    email: 'vinicius@example.com',
    email_corp: 'vinicius@aliria.com.br',
    phone: '11999999999',
    phone_emergency: '11988888888',
    emergency_contact_name: 'Laysla',
    // Dados profissionais
    position: 'Sócio',
    department: 'Diretoria',
    contract_type: 'pj',
    hire_date: '2024-01-01',
    salary: 0,
    status: 'ativo',
    // Documentos
    pis_pasep: '00000000000',
    ctps_number: '0000000',
    ctps_series: '000',
    // Benefícios
    health_plan: true,
    health_plan_cost: 500.00,
    health_plan_dependents: [
      { id: 'dep_laysla', name: 'Laysla', relationship: 'conjuge', monthly_cost: 0 },
      { id: 'dep_vito', name: 'Vito', relationship: 'filho', monthly_cost: 0 },
      { id: 'dep_luca', name: 'Luca', relationship: 'filho', monthly_cost: 0 }
    ],
    dental_plan: true,
    life_insurance: true,
    meal_voucher: true,
    transport_voucher: true,
    transport_voucher_cost: 814.00,
    home_office_day: null,
    banco_horas_days: 0,
    day_off_date: null,
    monthly_bonus: null,
    notes: 'Sócio - Vinicius da Costa Baptista',
    position_history: [],
    medical_exams: [],
    created_at: now(),
    updated_at: now(),
  };

  const izabella = {
    id: generateId(),
    // Empresa
    company: 'Aliria SP',
    company_cnpj: '47.848.127/0002-00',
    is_partner: true,
    partner_vt_weekly: 0,
    // Dados pessoais
    full_name: 'Izabella Campos Oliveira Hegg',
    birth_date: '1990-05-20',
    gender: 'feminino',
    marital_status: 'solteiro',
    nationality: 'brasileira',
    cpf: '98765432101',  // Placeholder
    rg: '9876543',
    rg_issuer: 'SSP/SP',
    // Endereço
    address_street: 'Rua Exemplo',
    address_number: '456',
    address_complement: '',
    address_neighborhood: 'Centro',
    address_city: 'São Paulo',
    address_state: 'SP',
    address_zip: '01000-000',
    // Contato
    email: 'izabella@example.com',
    email_corp: 'izabella@aliria.com.br',
    phone: '11999999999',
    phone_emergency: '11988888888',
    emergency_contact_name: 'Emergência',
    // Dados profissionais
    position: 'Sócia',
    department: 'Diretoria',
    contract_type: 'pj',
    hire_date: '2024-01-01',
    salary: 0,
    status: 'ativo',
    // Documentos
    pis_pasep: '00000000000',
    ctps_number: '0000000',
    ctps_series: '000',
    // Benefícios
    health_plan: false,
    dental_plan: false,
    life_insurance: false,
    meal_voucher: false,
    transport_voucher: true,
    transport_voucher_cost: 814.00,  // VR: 37 x 22 dias
    home_office_day: null,
    banco_horas_days: 0,
    day_off_date: null,
    monthly_bonus: null,
    notes: 'Sócia - VR apenas',
    position_history: [],
    medical_exams: [],
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('rh_employees')
      .insert([vinicius, izabella])
      .select();

    if (error) {
      console.error('❌ Erro ao inserir:', error);
      process.exit(1);
    }

    console.log('✅ Vinicius inserido:', vinicius.id);
    console.log('✅ Izabella inserida:', izabella.id);
    console.log('');
    console.log('Dados inseridos:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Erro ao conectar ao Supabase:', err);
    process.exit(1);
  }
}

insertEmployees();
