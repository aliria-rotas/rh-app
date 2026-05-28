#!/usr/bin/env node

/**
 * Check which columns are missing from the rh_employees table
 * and provide instructions to add them
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split('\n');
const env = {};
lines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected columns based on the Employee interface
const expectedColumns = [
  'id',
  'full_name',
  'birth_date',
  'gender',
  'marital_status',
  'nationality',
  'cpf',
  'rg',
  'rg_issuer',
  'address_street',
  'address_number',
  'address_complement',
  'address_neighborhood',
  'address_city',
  'address_state',
  'address_zip',
  'email',
  'email_corp',
  'phone',
  'phone_emergency',
  'emergency_contact_name',
  'position',
  'department',
  'contract_type',
  'hire_date',
  'salary',
  'status',
  'pis_pasep',
  'ctps_number',
  'ctps_series',
  'company',
  'company_cnpj',
  'is_partner',
  'partner_vt_weekly',
  'health_plan',
  'health_plan_cost',
  'health_plan_dependents',
  'dental_plan',
  'life_insurance',
  'meal_voucher',
  'transport_voucher',
  'transport_voucher_cost', // ← This is the critical one
  'home_office_day',
  'monthly_bonus',
  'position_history',
  'medical_exams',
  'notes',
  'created_at',
  'updated_at',
];

async function checkSchema() {
  try {
    console.log('Checking rh_employees table schema...\n');

    // Try to fetch one row to trigger a schema introspection error
    const { data, error } = await supabase
      .from('rh_employees')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('Could not find')) {
        const match = error.message.match(/Could not find the '(\w+)' column/);
        if (match) {
          const missingColumn = match[1];
          console.error(`❌ MISSING COLUMN: ${missingColumn}`);
          console.error(`\nError: ${error.message}`);
          console.log('\n📋 TO FIX THIS:\n');
          console.log('1. Go to Supabase Dashboard: https://app.supabase.com');
          console.log('2. Select your project and go to SQL Editor');
          console.log('3. Create a new query and execute this SQL:\n');
          console.log('---');
          console.log('ALTER TABLE rh_employees');
          console.log(`ADD COLUMN IF NOT EXISTS ${missingColumn} NUMERIC;`);
          console.log('---\n');
          console.log('4. Or run the full migration file: add-missing-columns.sql\n');
          process.exit(1);
        }
      } else {
        console.error('Unexpected error:', error);
        process.exit(1);
      }
    }

    console.log('✅ Schema check passed - table exists');

    // Check some specific columns by trying to select them
    const criticalColumns = ['transport_voucher_cost', 'company', 'position_history'];

    for (const col of criticalColumns) {
      try {
        const { data } = await supabase
          .from('rh_employees')
          .select(col)
          .limit(1);
        console.log(`✅ Column exists: ${col}`);
      } catch (colError) {
        console.error(`❌ Column missing: ${col}`);
      }
    }

  } catch (error) {
    console.error('Error checking schema:', error.message);
    process.exit(1);
  }
}

checkSchema();
