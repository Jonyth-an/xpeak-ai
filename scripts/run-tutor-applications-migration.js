const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTutorApplicationsMigration() {
  console.log('🚀 Starting tutor applications migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/create_tutor_applications_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Executing migration SQL...');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }

    console.log('✅ Migration completed successfully!');

    // Verify the table was created
    console.log('\n🔍 Verifying table creation...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'tutor_applications');

    if (tableError) {
      console.error('❌ Error verifying table:', tableError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ tutor_applications table verified');
    } else {
      console.log('❌ tutor_applications table not found');
      return;
    }

    // Test inserting a sample application (will be cleaned up)
    console.log('\n🧪 Testing table functionality...');
    const testUserId = '00000000-0000-0000-0000-000000000001'; // Test user ID
    
    const { data: testInsert, error: insertError } = await supabase
      .from('tutor_applications')
      .insert([{
        user_id: testUserId,
        status: 'drafting',
        application_data: { test: true }
      }])
      .select();

    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
      return;
    }

    console.log('✅ Test insert successful');

    // Clean up test data
    const { error: deleteError } = await supabase
      .from('tutor_applications')
      .delete()
      .eq('user_id', testUserId);

    if (deleteError) {
      console.error('⚠️  Warning: Could not clean up test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 Tutor applications migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log('   ✅ Created tutor_applications table');
    console.log('   ✅ Added indexes for performance');
    console.log('   ✅ Set up Row Level Security policies');
    console.log('   ✅ Created triggers for automatic updates');
    console.log('   ✅ Added role management triggers');
    console.log('   ✅ Verified table functionality');

  } catch (error) {
    console.error('❌ Migration failed with error:', error);
    process.exit(1);
  }
}

runTutorApplicationsMigration(); 