const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkOAuthStatus() {
  console.log('🔍 Checking OAuth Configuration Status\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please ensure you have a .env.local file with:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    return;
  }

  console.log('✅ Environment variables found');
  console.log('Supabase URL:', supabaseUrl);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('\n=== CURRENT OAUTH STATUS ===\n');

  try {
    // Test OAuth URL generation
    console.log('Testing OAuth URL generation...');
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
      console.log('\n🔧 This indicates Google OAuth is not properly configured in Supabase');
      return;
    }

    if (!data?.url) {
      console.error('❌ No OAuth URL returned');
      console.log('\n🔧 This indicates Google OAuth is not properly configured in Supabase');
      return;
    }

    console.log('✅ OAuth URL generated successfully');
    console.log('🔗 URL:', data.url);

    // Parse the URL to check parameters
    const url = new URL(data.url);
    console.log('\n=== OAUTH URL ANALYSIS ===');
    
    const requiredParams = {
      'client_id': 'Google OAuth Client ID',
      'redirect_uri': 'Redirect URI',
      'response_type': 'Response Type (should be "code")',
      'scope': 'OAuth Scopes',
      'state': 'State parameter for security',
      'code_challenge': 'PKCE Challenge',
      'code_challenge_method': 'PKCE Method (should be "S256")'
    };

    let allParamsPresent = true;
    console.log('\nChecking required parameters:');
    
    for (const [param, description] of Object.entries(requiredParams)) {
      const value = url.searchParams.get(param);
      if (value) {
        console.log(`✅ ${param}: ${description} - Present`);
        if (param === 'response_type' && value !== 'code') {
          console.log(`   ⚠️  Warning: response_type should be "code", got "${value}"`);
          allParamsPresent = false;
        }
        if (param === 'code_challenge_method' && value !== 'S256') {
          console.log(`   ⚠️  Warning: code_challenge_method should be "S256", got "${value}"`);
          allParamsPresent = false;
        }
      } else {
        console.log(`❌ ${param}: ${description} - Missing`);
        allParamsPresent = false;
      }
    }

    console.log('\n=== DIAGNOSIS ===');
    if (allParamsPresent) {
      console.log('✅ OAuth configuration appears to be correct');
      console.log('✅ All required parameters are present');
      console.log('✅ Using Authorization Code Flow with PKCE');
      console.log('\n🎯 Next steps:');
      console.log('1. Test the login flow at http://localhost:3000/login');
      console.log('2. Check browser console for any errors');
      console.log('3. Monitor the /auth/callback route logs');
    } else {
      console.log('❌ OAuth configuration has issues');
      console.log('❌ Missing required parameters');
      console.log('\n🔧 Recommended action:');
      console.log('Run: node scripts/reset-google-oauth.js');
      console.log('This will guide you through resetting Google OAuth configuration');
    }

    // Check if it's a Supabase URL
    if (data.url.includes('supabase.co')) {
      console.log('\n✅ This is a Supabase OAuth URL (correct)');
    } else {
      console.log('\n⚠️  This is not a Supabase OAuth URL (may indicate configuration issue)');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.log('\n🔧 This may indicate a configuration issue');
    console.log('Run: node scripts/reset-google-oauth.js');
  }

  console.log('\n=== SUMMARY ===');
  console.log('If you see missing parameters (especially client_id), you need to:');
  console.log('1. Configure Google OAuth in Supabase dashboard');
  console.log('2. Set up Google OAuth credentials in Google Cloud Console');
  console.log('3. Ensure redirect URIs match between Google and Supabase');
  console.log('\nFor detailed instructions, run: node scripts/reset-google-oauth.js');
}

// Run the status check
checkOAuthStatus().catch(console.error); 