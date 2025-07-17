const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugOAuthFlow() {
  console.log('🔍 OAuth Flow Debug Script');
  console.log('==========================\n');

  // 1. Check environment variables
  console.log('1. Environment Variables Check:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  console.log('');

  // 2. Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 3. Test OAuth URL generation
  console.log('2. Testing OAuth URL Generation:');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        queryParams: {
          response_type: 'code',
        },
      },
    });

    if (error) {
      console.log('   ❌ Error generating OAuth URL:', error.message);
      return;
    }

    if (data?.url) {
      console.log('   ✅ OAuth URL generated successfully');
      console.log('   🔗 URL:', data.url);
      
      // Parse the URL to check parameters
      const url = new URL(data.url);
      console.log('   📋 URL Parameters:');
      console.log('      client_id:', url.searchParams.get('client_id') ? '✅ Present' : '❌ Missing');
      console.log('      redirect_uri:', url.searchParams.get('redirect_uri'));
      console.log('      response_type:', url.searchParams.get('response_type'));
      console.log('      scope:', url.searchParams.get('scope'));
      console.log('      state:', url.searchParams.get('state') ? '✅ Present' : '❌ Missing');
      console.log('      code_challenge:', url.searchParams.get('code_challenge') ? '✅ Present' : '❌ Missing');
      console.log('      code_challenge_method:', url.searchParams.get('code_challenge_method'));
      console.log('      access_type:', url.searchParams.get('access_type'));
      console.log('      prompt:', url.searchParams.get('prompt'));
    } else {
      console.log('   ❌ No URL returned from OAuth request');
    }
  } catch (err) {
    console.log('   ❌ Exception during OAuth URL generation:', err.message);
  }
  console.log('');

  // 4. Test Supabase configuration
  console.log('3. Testing Supabase Configuration:');
  try {
    const { data: configData, error: configError } = await supabase.auth.getSession();
    if (configError) {
      console.log('   ❌ Error getting session:', configError.message);
    } else {
      console.log('   ✅ Supabase client configured correctly');
    }
  } catch (err) {
    console.log('   ❌ Exception testing Supabase config:', err.message);
  }
  console.log('');

  // 5. Check if we can access Supabase auth settings
  console.log('4. Testing Supabase Auth Settings:');
  try {
    // Try to get the current user (should be null if not authenticated)
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.log('   ❌ Error getting user:', userError.message);
    } else {
      console.log('   ✅ Auth endpoint accessible');
      console.log('   👤 Current user:', userData.user ? 'Authenticated' : 'Not authenticated');
    }
  } catch (err) {
    console.log('   ❌ Exception testing auth settings:', err.message);
  }
  console.log('');

  // 6. Test callback URL format
  console.log('5. Callback URL Analysis:');
  const callbackUrl = 'http://localhost:3000/auth/callback';
  console.log('   🔗 Callback URL:', callbackUrl);
  console.log('   📋 URL Structure:');
  console.log('      Protocol:', new URL(callbackUrl).protocol);
  console.log('      Host:', new URL(callbackUrl).host);
  console.log('      Path:', new URL(callbackUrl).pathname);
  console.log('');

  // 7. Instructions for manual testing
  console.log('6. Manual Testing Instructions:');
  console.log('   📝 To test the OAuth flow manually:');
  console.log('   1. Copy the OAuth URL from step 2');
  console.log('   2. Open it in a browser');
  console.log('   3. Complete the Google OAuth flow');
  console.log('   4. Check the final redirect URL');
  console.log('   5. Look for query parameters like ?code=...&state=...');
  console.log('   6. If you see #access_token=... instead, that indicates implicit flow');
  console.log('');

  // 8. Common issues and solutions
  console.log('7. Common Issues and Solutions:');
  console.log('   ❌ Issue: No code parameter in callback');
  console.log('      🔧 Solution: Check Google Cloud Console redirect URIs');
  console.log('      🔧 Solution: Verify Supabase OAuth settings');
  console.log('      🔧 Solution: Ensure response_type=code is set');
  console.log('');
  console.log('   ❌ Issue: Implicit flow instead of Authorization Code flow');
  console.log('      🔧 Solution: Add response_type=code to queryParams');
  console.log('      🔧 Solution: Check Google OAuth configuration');
  console.log('');
  console.log('   ❌ Issue: Invalid redirect URI');
  console.log('      🔧 Solution: Add http://localhost:3000/auth/callback to Google Cloud Console');
  console.log('      🔧 Solution: Check Supabase site URL setting');
  console.log('');
}

// Run the debug script
debugOAuthFlow().catch(console.error); 