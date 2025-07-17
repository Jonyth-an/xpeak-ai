const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testOAuthFlow() {
  console.log('🧪 Testing OAuth Flow');
  console.log('=====================\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    console.log('1. Testing basic OAuth URL generation...');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        flow: 'pkce',
      },
    });

    if (error) {
      console.log('❌ Error generating OAuth URL:', error.message);
      console.log('❌ Error details:', error);
      return;
    }

    if (!data?.url) {
      console.log('❌ No OAuth URL returned');
      return;
    }

    console.log('✅ OAuth URL generated successfully');
    console.log('🔗 URL:', data.url);
    
    // Parse the URL to check parameters
    const url = new URL(data.url);
    console.log('\n2. OAuth URL Analysis:');
    console.log('   client_id:', url.searchParams.get('client_id') ? '✅ Present' : '❌ Missing');
    console.log('   redirect_uri:', url.searchParams.get('redirect_uri'));
    console.log('   response_type:', url.searchParams.get('response_type'));
    console.log('   scope:', url.searchParams.get('scope'));
    console.log('   state:', url.searchParams.get('state') ? '✅ Present' : '❌ Missing');
    console.log('   code_challenge:', url.searchParams.get('code_challenge') ? '✅ Present' : '❌ Missing');
    console.log('   code_challenge_method:', url.searchParams.get('code_challenge_method'));

    console.log('\n3. Manual Testing Instructions:');
    console.log('   📝 Copy this URL and open it in a browser:');
    console.log('   🔗', data.url);
    console.log('\n   📝 After completing Google OAuth, you should be redirected to:');
    console.log('   🔗 http://localhost:3000/auth/callback?code=...&state=...');
    console.log('\n   📝 If you see #access_token=... instead, that means implicit flow is being used');

  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testOAuthFlow(); 