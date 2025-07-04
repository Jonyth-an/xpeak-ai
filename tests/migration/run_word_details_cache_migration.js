const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running word_details_cache table migration...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create_word_details_cache_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('The word_details_cache table has been created.');
    console.log('');
    console.log('Table structure:');
    console.log('- id: SERIAL PRIMARY KEY');
    console.log('- word: TEXT UNIQUE NOT NULL');
    console.log('- definition: TEXT');
    console.log('- example: TEXT');
    console.log('- synonyms: JSONB');
    console.log('- usage_tip: TEXT');
    console.log('- created_at: TIMESTAMP');
    console.log('- updated_at: TIMESTAMP');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 