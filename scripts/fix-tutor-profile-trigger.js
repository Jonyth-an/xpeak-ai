const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTutorProfileTrigger() {
  console.log('🔧 Fixing tutor profile trigger function...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/fix_tutor_profile_trigger_no_hourly_rate.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded, executing...');

    // Split SQL into statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('INSERT INTO public.migration_log'));

    console.log(`⚡ Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   [${i + 1}/${statements.length}] Executing statement...`);
        
        try {
          // Use Supabase RPC to execute SQL
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            // If exec_sql doesn't exist, try direct query (for CREATE FUNCTION)
            if (error.message && error.message.includes('exec_sql')) {
              console.log('   ⚠️  exec_sql RPC not available, trying alternative method...');
              // For CREATE FUNCTION, we might need to use a different approach
              // This is a limitation - we'll need to run this manually in Supabase SQL editor
              console.log('   ⚠️  Please run this SQL manually in Supabase SQL Editor:');
              console.log('   ' + statement.substring(0, 100) + '...');
            } else {
              console.error(`   ❌ Error:`, error.message);
            }
          } else {
            console.log('   ✅ Statement executed successfully');
          }
        } catch (err) {
          console.log(`   ⚠️  Error (may be expected):`, err.message);
        }
      }
    }

    console.log('\n✅ Migration script completed!');
    console.log('\n📝 IMPORTANT: If exec_sql RPC is not available, please run the following SQL manually in Supabase SQL Editor:');
    console.log('   File: database/migrations/fix_tutor_profile_trigger_no_hourly_rate.sql\n');

  } catch (error) {
    console.error('💥 Error running migration:', error);
    console.error('\n📝 Please run the SQL manually in Supabase SQL Editor:');
    console.error('   File: database/migrations/fix_tutor_profile_trigger_no_hourly_rate.sql');
  }
}

// Run the migration
fixTutorProfileTrigger()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });

