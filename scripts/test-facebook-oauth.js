const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testFacebookOAuth() {
  console.log('📘 Testing Facebook OAuth\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  console.log('✅ Environment variables found');
  console.log('Supabase URL:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('\n=== Testing Facebook OAuth URL Generation ===');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        queryParams: {
          access_type: 'offline',
        },
      },
    });

    if (error) {
      console.error('❌ Facebook OAuth Error:', error.message);
      console.log('\nThis suggests a project-wide OAuth configuration issue.');
    } else {
      console.log('✅ Facebook OAuth URL generated successfully');
      console.log('🔗 URL:', data.url);
      
      // Parse the URL to check parameters
      const url = new URL(data.url);
      console.log('\n=== Facebook OAuth URL Analysis ===');
      
      const requiredParams = {
        'client_id': 'Facebook App ID',
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
        console.log('✅ Facebook OAuth configuration appears to be correct');
        console.log('✅ All required parameters are present');
        console.log('✅ Using Authorization Code Flow with PKCE');
        console.log('\n🎯 This means:');
        console.log('- Facebook OAuth is working properly');
        console.log('- The issue is specific to Google OAuth');
        console.log('- Your Supabase project OAuth configuration is fine');
      } else {
        console.log('❌ Facebook OAuth also has missing parameters');
        console.log('❌ This confirms a project-wide OAuth configuration issue');
        console.log('\n🔧 This means:');
        console.log('- The problem is not specific to Google');
        console.log('- There\'s a Supabase project-level OAuth configuration issue');
        console.log('- All OAuth providers will have the same problem');
      }

      // Check if it's a Supabase URL
      if (data.url.includes('supabase.co')) {
        console.log('\n✅ This is a Supabase OAuth URL (correct)');
      } else {
        console.log('\n⚠️  This is not a Supabase OAuth URL (may indicate configuration issue)');
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }

  console.log('\n=== NEXT STEPS ===');
  console.log('If Facebook OAuth works (all parameters present):');
  console.log('1. The issue is specific to Google OAuth configuration');
  console.log('2. Focus on fixing Google OAuth settings');
  console.log('3. Consider using Facebook OAuth as an alternative');
  
  console.log('\nIf Facebook OAuth also fails (missing parameters):');
  console.log('1. This confirms a Supabase project-level issue');
  console.log('2. Consider creating a new Supabase project');
  console.log('3. Contact Supabase support');
}

// Run the test
testFacebookOAuth().catch(console.error); 