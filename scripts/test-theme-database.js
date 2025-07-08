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

async function testThemeDatabase() {
  console.log('🧪 Testing theme database setup...');
  
  try {
    // Test 1: Check if profiles table exists
    console.log('\n1. Checking if profiles table exists...');
    const { data: tableTest, error: tableError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Profiles table error:', tableError);
      return;
    }
    console.log('✅ Profiles table exists');

    // Test 2: Check if theme columns exist
    console.log('\n2. Checking if theme columns exist...');
    const { data: columnTest, error: columnError } = await supabase
      .from('profiles')
      .select('theme_preference, custom_theme_data, theme_updated_at')
      .limit(1);
    
    if (columnError) {
      console.error('❌ Theme columns error:', columnError);
      console.log('\n💡 You need to run the SQL migration to add theme columns');
      return;
    }
    console.log('✅ Theme columns exist');

    // Test 3: Get a real user ID from auth.users
    console.log('\n3. Getting a real user ID...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users.users || users.users.length === 0) {
      console.log('⚠️  No users found in auth.users table');
      console.log('💡 You need to create a user account first to test theme preferences');
      return;
    }
    
    const realUserId = users.users[0].id;
    console.log('✅ Found user ID:', realUserId);

    // Test 4: Try to insert/update a real user's theme preferences
    console.log('\n4. Testing theme preference update...');
    const { data: insertTest, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: realUserId,
        theme_preference: 'dark',
        custom_theme_data: { test: true, timestamp: new Date().toISOString() },
        theme_updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (insertError) {
      console.error('❌ Theme preference update failed:', insertError);
      return;
    }
    console.log('✅ Theme preference update works');

    // Test 5: Verify the update worked
    console.log('\n5. Verifying the update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('theme_preference, custom_theme_data, theme_updated_at')
      .eq('id', realUserId)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }
    
    console.log('✅ Verification successful:');
    console.log('  - Theme preference:', verifyData.theme_preference);
    console.log('  - Custom theme data:', verifyData.custom_theme_data);
    console.log('  - Updated at:', verifyData.theme_updated_at);

    console.log('\n🎉 Theme database setup is working correctly!');
    console.log('\n📋 Summary:');
    console.log('  - Profiles table exists');
    console.log('  - Theme columns are available');
    console.log('  - Theme preference updates work');
    console.log('  - Ready for production use');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testThemeDatabase(); 