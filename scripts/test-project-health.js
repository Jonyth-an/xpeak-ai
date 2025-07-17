const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testProjectHealth() {
  console.log('🏥 Testing Supabase Project Health\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  console.log('✅ Environment variables found');
  console.log('Supabase URL:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('\n=== PROJECT HEALTH CHECKS ===\n');

  // Test 1: Basic connectivity
  console.log('Test 1: Basic connectivity');
  try {
    const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
    if (error) {
      console.log('❌ Database connectivity issue:', error.message);
    } else {
      console.log('✅ Database connectivity: OK');
    }
  } catch (err) {
    console.log('❌ Database connectivity failed:', err.message);
  }

  // Test 2: Auth service
  console.log('\nTest 2: Auth service');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Auth service issue:', error.message);
    } else {
      console.log('✅ Auth service: OK');
      console.log('   Current session:', data.session ? 'Present' : 'None');
    }
  } catch (err) {
    console.log('❌ Auth service failed:', err.message);
  }

  // Test 3: Check project settings
  console.log('\nTest 3: Project settings');
  try {
    // Try to get project info
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });
    
    if (response.ok) {
      console.log('✅ Project API: OK');
    } else {
      console.log('❌ Project API issue:', response.status, response.statusText);
    }
  } catch (err) {
    console.log('❌ Project API failed:', err.message);
  }

  // Test 4: OAuth endpoint test
  console.log('\nTest 4: OAuth endpoint test');
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OAuth endpoint: OK');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ OAuth endpoint issue:', response.status, response.statusText);
      const text = await response.text();
      console.log('   Response text:', text.substring(0, 200));
    }
  } catch (err) {
    console.log('❌ OAuth endpoint failed:', err.message);
  }

  console.log('\n=== DIAGNOSIS ===');
  console.log('If all tests pass except OAuth:');
  console.log('- The project is healthy but has OAuth configuration issues');
  console.log('- This suggests a project-level OAuth setting problem');
  console.log('- Creating a new project is the recommended solution');
  
  console.log('\nIf multiple tests fail:');
  console.log('- The project may have broader configuration issues');
  console.log('- Contact Supabase support immediately');
  
  console.log('\n=== RECOMMENDATION ===');
  console.log('Based on the OAuth parameter issues, I recommend:');
  console.log('1. Create a new Supabase project');
  console.log('2. Migrate your data if needed');
  console.log('3. Configure OAuth in the new project');
  console.log('4. This should resolve the OAuth issues');
}

testProjectHealth().catch(console.error); 