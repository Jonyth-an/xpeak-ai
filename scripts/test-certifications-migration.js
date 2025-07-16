require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCertificationsMigration() {
  console.log('🧪 Testing certifications migration...\n');

  try {
    // 1. Check if the new field exists
    console.log('1. Checking if certifications field exists...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'tutor_profiles')
      .eq('column_name', 'certifications');

    if (columnError) {
      console.error('❌ Error checking columns:', columnError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ Certifications field exists');
    } else {
      console.log('❌ Certifications field does not exist');
      return;
    }

    // 2. Check sample tutor profiles
    console.log('\n2. Checking sample tutor profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('tutor_profiles')
      .select('id, display_name, specializations, certifications')
      .limit(5);

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return;
    }

    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach((profile, index) => {
      console.log(`\nProfile ${index + 1}: ${profile.display_name}`);
      console.log(`  Specializations: ${JSON.stringify(profile.specializations)}`);
      console.log(`  Certifications: ${JSON.stringify(profile.certifications)}`);
    });

    // 3. Test the public API
    console.log('\n3. Testing public tutor API...');
    if (profiles.length > 0) {
      const testProfile = profiles[0];
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('.supabase.co', '.supabase.co')}/api/tutors/${testProfile.id}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Public API response includes certifications:', !!data.tutor.certifications);
        console.log('  Certifications:', JSON.stringify(data.tutor.certifications));
      } else {
        console.log('❌ Public API test failed');
      }
    }

    console.log('\n✅ Migration test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCertificationsMigration(); 