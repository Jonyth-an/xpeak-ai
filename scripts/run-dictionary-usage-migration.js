const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('Running dictionary_api_usage table migration...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
    
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '..', 'dictionary_api_usage.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('SQL Migration:');
    console.log(sql);
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Migration failed:', error);
      
      // If exec_sql doesn't exist, try direct query
      console.log('Trying direct query approach...');
      
      // Split the SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('Executing:', statement.trim());
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (stmtError) {
            console.error('Statement failed:', stmtError);
          }
        }
      }
    } else {
      console.log('Migration completed successfully!');
    }
    
    // Verify the table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'dictionary_api_usage');
    
    if (tableError) {
      console.error('Error checking table:', tableError);
    } else if (tables && tables.length > 0) {
      console.log('✅ dictionary_api_usage table created successfully!');
    } else {
      console.log('❌ dictionary_api_usage table not found');
    }
    
  } catch (error) {
    console.error('Migration script failed:', error);
  }
}

runMigration(); 