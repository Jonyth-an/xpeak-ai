require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test OAuth callback functionality
async function testOAuthCallback() {
  console.log('Testing OAuth callback setup...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    return;
  }

  console.log('✅ Supabase environment variables found');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test OAuth URL generation
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
      console.error('❌ Error generating OAuth URL:', error.message);
      return;
    }

    console.log('✅ OAuth URL generated successfully');
    console.log('🔗 OAuth URL:', data.url);
    console.log('\n📋 Next steps:');
    console.log('1. Make sure Google OAuth is configured in your Supabase dashboard');
    console.log('2. Ensure the redirect URI is set to: http://localhost:3000/auth/callback');
    console.log('3. Test the login flow by visiting /login and clicking "Continue with Google"');
    console.log('4. Check that the /auth/callback route handles the redirect properly');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testOAuthCallback(); 