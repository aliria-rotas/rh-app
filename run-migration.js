const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    // Read the migration SQL file
    const sqlPath = path.join(__dirname, 'add-missing-columns.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Executing migration...');
    console.log(sqlContent);

    // Execute the SQL using the rpc function or direct query
    // Note: Supabase client doesn't have a direct SQL execution method for admin queries
    // We need to use the service role key or create a function

    // Alternative approach: use node-postgres
    const { Pool } = require('pg');

    // Parse Supabase connection string from URL
    const dbUrl = new URL(supabaseUrl.replace('https://', 'postgres://'));
    const projectId = dbUrl.hostname.split('.')[0];

    const connectionString = `postgres://postgres:${supabaseKey}@${projectId}.db.supabase.co:5432/postgres`;

    const pool = new Pool({ connectionString });

    const client = await pool.connect();
    try {
      const result = await client.query(sqlContent);
      console.log('Migration executed successfully');
      console.log('Result:', result);
    } finally {
      client.release();
    }

    await pool.end();

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
