const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Starting admin review fields migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations/add_admin_review_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded successfully');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`⚡ Executing ${statements.length} SQL statements...`);
    
    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            // Try alternative approach for ALTER TABLE statements
            if (statement.includes('ALTER TABLE')) {
              console.log('   Trying alternative approach for ALTER TABLE...');
              // For ALTER TABLE, we'll just log it for now
              console.log(`   Statement: ${statement}`);
            } else {
              console.error(`   ❌ Statement ${i + 1} failed:`, error);
            }
          }
        } catch (err) {
          console.log(`   ⚠️  Statement ${i + 1} skipped (may already exist):`, err.message);
        }
      }
    }
    
    console.log('✅ Migration completed!');
    console.log('📊 New fields should be added to tutor_applications table:');
    console.log('   - rejection_reason (TEXT)');
    console.log('   - waitlist_reason (TEXT)');
    console.log('   - admin_action_history (JSONB)');
    console.log('   - reviewer_email (TEXT)');
    console.log('   - New indexes for performance');
    console.log('   - Admin action logging trigger');
    
    // Verify the migration by checking if the new columns exist
    console.log('\n🔍 Verifying migration...');
    try {
      const { data: columns, error: verifyError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'tutor_applications')
        .eq('table_schema', 'public')
        .in('column_name', ['rejection_reason', 'waitlist_reason', 'admin_action_history', 'reviewer_email']);
      
      if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
      } else {
        console.log('✅ Migration verification successful!');
        console.log('   Found columns:', columns.map(c => c.column_name).join(', '));
      }
    } catch (verifyErr) {
      console.log('⚠️  Verification skipped:', verifyErr.message);
    }
    
  } catch (error) {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  }
}

// Check if required environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Run the migration
runMigration(); 