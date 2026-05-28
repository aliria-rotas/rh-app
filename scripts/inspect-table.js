#!/usr/bin/env node

/**
 * Inspect the rh_employees table structure directly
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '..', '.env');
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

console.log('Inspecting rh_employees table...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  try {
    // Try to get table info using information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'rh_employees')
      .eq('table_schema', 'public');

    if (error) {
      console.error('Could not query information_schema:', error);
      console.log('\nTrying alternative method...\n');

      // Try a simple select to see what happens
      const { data: sample, error: err2 } = await supabase
        .from('rh_employees')
        .select('*')
        .limit(1);

      if (err2) {
        console.error('Error querying rh_employees:');
        console.error(JSON.stringify(err2, null, 2));
      } else {
        console.log('Sample data retrieved successfully');
        if (sample && sample[0]) {
          console.log('\nAvailable columns in first row:');
          Object.keys(sample[0]).forEach(col => {
            console.log(`  - ${col}`);
          });
        }
      }
    } else {
      console.log('Columns in rh_employees:');
      if (data && data.length > 0) {
        data.forEach(col => {
          const nullable = col.is_nullable ? 'nullable' : 'not null';
          console.log(`  ✓ ${col.column_name} (${col.data_type}) ${nullable}`);
        });

        // Check for critical columns
        const criticalCols = ['transport_voucher_cost', 'company', 'position_history'];
        console.log('\nCritical columns status:');
        criticalCols.forEach(colName => {
          const exists = data.some(c => c.column_name === colName);
          console.log(`  ${exists ? '✓' : '✗'} ${colName}`);
        });
      } else {
        console.log('No columns found!');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

inspectTable();
