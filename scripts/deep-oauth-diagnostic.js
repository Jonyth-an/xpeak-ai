const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function deepOAuthDiagnostic() {
  console.log('🔍 Deep OAuth Diagnostic\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  console.log('✅ Environment variables found');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('\n=== TESTING DIFFERENT OAUTH APPROACHES ===\n');

  // Test 1: Basic OAuth call
  console.log('Test 1: Basic OAuth call');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ URL generated:', data.url);
      const url = new URL(data.url);
      console.log('   client_id present:', !!url.searchParams.get('client_id'));
      console.log('   response_type:', url.searchParams.get('response_type'));
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  // Test 2: OAuth with queryParams
  console.log('\nTest 2: OAuth with queryParams');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ URL generated:', data.url);
      const url = new URL(data.url);
      console.log('   client_id present:', !!url.searchParams.get('client_id'));
      console.log('   response_type:', url.searchParams.get('response_type'));
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  // Test 3: Try with different provider
  console.log('\nTest 3: Test with GitHub provider (to see if it\'s a Google-specific issue)');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ GitHub URL generated:', data.url);
      const url = new URL(data.url);
      console.log('   client_id present:', !!url.searchParams.get('client_id'));
      console.log('   response_type:', url.searchParams.get('response_type'));
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  // Test 4: Check if we can get provider info
  console.log('\nTest 4: Check provider configuration');
  try {
    // Try to get the OAuth URL directly from the auth endpoint
    const response = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent('http://localhost:3000/auth/callback')}`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct auth endpoint response:', data);
    } else {
      console.log('❌ Direct auth endpoint failed:', response.status, response.statusText);
    }
  } catch (err) {
    console.error('❌ Direct auth endpoint exception:', err.message);
  }

  console.log('\n=== DIAGNOSIS SUMMARY ===');
  console.log('If all tests show missing client_id, this indicates:');
  console.log('1. Google OAuth is not properly configured in Supabase');
  console.log('2. The Client ID/Secret may not be saved correctly');
  console.log('3. There might be a Supabase project configuration issue');
  console.log('4. The OAuth provider might be disabled at the project level');
  
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Double-check Supabase dashboard: Authentication > Providers > Google');
  console.log('2. Verify the Client ID and Secret are exactly as copied from Google Cloud');
  console.log('3. Try disabling and re-enabling Google OAuth in Supabase');
  console.log('4. Check if there are any project-level OAuth settings');
  console.log('5. Consider creating a new Supabase project to test');
}

// Run the diagnostic
deepOAuthDiagnostic().catch(console.error); 