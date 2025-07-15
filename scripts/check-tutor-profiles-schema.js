const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTutorProfilesSchema() {
  try {
    console.log('Checking tutor_profiles table schema...\n');

    // Method 1: Try to get table info using information_schema
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'tutor_profiles')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (schemaError) {
      console.error('Error fetching schema:', schemaError);
    } else {
      console.log('✅ tutor_profiles table columns:');
      console.table(columns);
    }

    // Method 2: Try a simple select to see what works
    console.log('\n🔍 Testing basic select...');
    const { data: testData, error: testError } = await supabase
      .from('tutor_profiles')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Error with select *:', testError);
    } else {
      console.log('✅ Select * works. Sample data structure:');
      console.log(JSON.stringify(testData, null, 2));
    }

    // Method 3: Test individual columns that we've been trying to use
    const columnsToTest = [
      'id',
      'display_name', 
      'profile_image_url',
      'accent',
      'certificates',
      'onboarding_completed',
      'status',
      'user_id',
      'application_id',
      'bio',
      'hourly_rate',
      'timezone',
      'languages_taught',
      'specializations',
      'is_active',
      'created_at',
      'updated_at'
    ];

    console.log('\n🔍 Testing individual columns...');
    for (const column of columnsToTest) {
      try {
        const { data, error } = await supabase
          .from('tutor_profiles')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ ${column}: ${error.message}`);
        } else {
          console.log(`✅ ${column}: exists`);
        }
      } catch (err) {
        console.log(`❌ ${column}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTutorProfilesSchema(); 