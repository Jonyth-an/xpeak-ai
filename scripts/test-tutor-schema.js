require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTutorSchema() {
  try {
    console.log('🔍 Testing tutor_profiles table schema...\n');

    // Method 1: Check schema using information_schema
    console.log('1. Checking schema via information_schema...');
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'tutor_profiles')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (schemaError) {
      console.error('❌ Error fetching schema:', schemaError);
    } else {
      console.log('✅ Available columns in tutor_profiles:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
    }

    // Method 2: Try to select specific columns that might be missing
    console.log('\n2. Testing specific column selection...');
    const columnsToTest = [
      'id',
      'display_name',
      'bio',
      'teaching_style',
      'education',
      'languages_taught',
      'specializations'
    ];

    for (const column of columnsToTest) {
      try {
        const { data, error } = await supabase
          .from('tutor_profiles')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ Column '${column}' - Error:`, error.message);
        } else {
          console.log(`✅ Column '${column}' - OK`);
        }
      } catch (err) {
        console.log(`❌ Column '${column}' - Exception:`, err.message);
      }
    }

    // Method 3: Try to get a sample record
    console.log('\n3. Testing sample record fetch...');
    const { data: sampleRecord, error: sampleError } = await supabase
      .from('tutor_profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error fetching sample record:', sampleError);
    } else {
      console.log('✅ Sample record structure:');
      console.log(JSON.stringify(sampleRecord?.[0], null, 2));
    }

    // Method 4: Check if the migration was applied
    console.log('\n4. Checking if migration was applied...');
    const { data: migrationCheck, error: migrationError } = await supabase
      .rpc('check_column_exists', {
        table_name: 'tutor_profiles',
        column_name: 'teaching_style'
      });

    if (migrationError) {
      console.log('❌ Could not check migration status:', migrationError.message);
      console.log('💡 You may need to run the migration manually in Supabase SQL editor');
    } else {
      console.log('✅ Migration check result:', migrationCheck);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTutorSchema().then(() => {
  console.log('\n🏁 Schema test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 