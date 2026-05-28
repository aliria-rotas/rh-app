#!/usr/bin/env node

/**
 * Script to apply the full schema to Supabase
 * This reads the schema.sql and add-missing-columns.sql files and executes them
 *
 * Usage: node scripts/apply-schema.js
 *
 * Note: This requires a PostgreSQL client to be available
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing environment variables');
  console.error('  VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

// Extract project ID from URL
const projectId = new URL(supabaseUrl).hostname.split('.')[0];
const host = `${projectId}.db.supabase.co`;

// Note: Using anon key is not secure for migrations
// In production, use SUPABASE_SERVICE_ROLE_KEY from environment
console.warn('WARNING: Using anonymous key for migrations. For production, set SUPABASE_SERVICE_ROLE_KEY');

async function applySchema() {
  try {
    console.log('Reading migration files...');

    // Read both migration files
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const addColumnsPath = path.join(__dirname, '..', 'add-missing-columns.sql');

    if (!fs.existsSync(schemaPath)) {
      console.error('ERROR: schema.sql not found at', schemaPath);
      process.exit(1);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    let addColumnsSql = '';

    if (fs.existsSync(addColumnsPath)) {
      addColumnsSql = fs.readFileSync(addColumnsPath, 'utf-8');
    }

    // Combine SQL
    const fullSql = schemaSql + '\n\n' + addColumnsSql;

    // Save to temp file
    const tmpFile = path.join(__dirname, '..', '.migrations.tmp.sql');
    fs.writeFileSync(tmpFile, fullSql);

    console.log('Attempting to apply schema via API...');
    console.log('Project ID:', projectId);
    console.log('Host:', host);

    // Try using psql if available
    const connectionString = `postgresql://postgres:${supabaseKey}@${host}:5432/postgres?sslmode=require`;

    try {
      const { stdout, stderr } = await execAsync(`psql "${connectionString}" -f "${tmpFile}"`, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      console.log('Migration applied successfully!');
      if (stdout) console.log('Output:', stdout);
      if (stderr) console.log('Warnings:', stderr);

      // Clean up temp file
      fs.unlinkSync(tmpFile);
    } catch (error) {
      console.error('psql not available or failed');
      console.error('You can manually apply the schema by:');
      console.error('1. Going to Supabase Dashboard > SQL Editor');
      console.error('2. Creating a new query');
      console.error('3. Copying the contents of supabase/schema.sql');
      console.error('4. Executing it');
      console.error('5. Then copying the contents of add-missing-columns.sql and executing it');
      console.error('\nFull error:', error.message);

      // Clean up temp file
      if (fs.existsSync(tmpFile)) {
        fs.unlinkSync(tmpFile);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applySchema();
