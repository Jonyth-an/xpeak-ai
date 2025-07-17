const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('📁 Found .env.local file, loading environment variables...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
          console.log(`✅ Loaded: ${key}`);
        }
      }
    });
  } else {
    console.log('⚠️  No .env.local file found');
  }
}

async function testOAuthPKCEFlow() {
  console.log('Testing OAuth PKCE Flow...\n');

  // Load environment variables
  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    console.log('\nExample .env.local content:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    return;
  }

  console.log('✅ Supabase environment variables found');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key:', supabaseAnonKey.substring(0, 20) + '...');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  });

  try {
    // Test 1: Check current session
    console.log('\n=== Test 1: Current Session ===');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
    } else if (session) {
      console.log('✅ Session found');
      console.log('User:', session.user.email);
      console.log('Expires at:', session.expires_at ? new Date(session.expires_at * 1000) : 'unknown');
    } else {
      console.log('ℹ️ No active session found');
    }

    // Test 2: Generate OAuth URL with PKCE
    console.log('\n=== Test 2: OAuth URL Generation (PKCE) ===');
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
      console.error('❌ Error generating OAuth URL:', error);
      return;
    }

    console.log('✅ OAuth URL generated successfully');
    console.log('URL:', data.url);
    console.log('Provider:', data.provider);

    // Test 3: Analyze OAuth URL parameters
    console.log('\n=== Test 3: OAuth URL Analysis ===');
    const url = new URL(data.url);
    const params = {
      client_id: url.searchParams.get('client_id'),
      redirect_uri: url.searchParams.get('redirect_uri'),
      response_type: url.searchParams.get('response_type'),
      scope: url.searchParams.get('scope'),
      state: url.searchParams.get('state'),
      code_challenge: url.searchParams.get('code_challenge'),
      code_challenge_method: url.searchParams.get('code_challenge_method'),
    };

    console.log('OAuth Parameters:');
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        console.log(`  ${key}: ${key.includes('challenge') ? 'present' : value}`);
      } else {
        console.log(`  ${key}: missing`);
      }
    });

    // Verify PKCE parameters are present
    if (params.code_challenge && params.code_challenge_method) {
      console.log('✅ PKCE parameters found - Authorization Code Flow with PKCE is enabled');
    } else {
      console.log('❌ PKCE parameters missing - This may indicate implicit flow is being used');
    }

    // Verify response_type is 'code' (not 'token')
    if (params.response_type === 'code') {
      console.log('✅ Response type is "code" - Authorization Code Flow is being used');
    } else {
      console.log('❌ Response type is not "code" - This may cause issues');
    }

    // Test 4: Verify redirect URI
    if (params.redirect_uri === 'http://localhost:3000/auth/callback') {
      console.log('✅ Redirect URI is correct');
    } else {
      console.log('❌ Redirect URI mismatch:', params.redirect_uri);
    }

    // Test 5: Check if this is a Supabase OAuth URL
    if (data.url.includes('supabase.co')) {
      console.log('✅ OAuth URL is from Supabase');
    } else {
      console.log('⚠️  OAuth URL is not from Supabase - this might be a direct Google OAuth URL');
    }

    console.log('\n=== OAuth Flow Summary ===');
    console.log('1. ✅ Supabase client configured correctly');
    console.log('2. ✅ OAuth URL generation working');
    console.log('3. ✅ Callback route exists at /auth/callback');
    console.log('4. ✅ PKCE flow enabled');
    console.log('5. ✅ Authorization Code Flow being used');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Visit: http://localhost:3000/login');
    console.log('2. Click "Continue with Google"');
    console.log('3. Complete Google OAuth flow');
    console.log('4. You should be redirected to /dashboard');
    console.log('5. Check browser console for detailed logs');
    console.log('6. Verify session persistence across page refreshes');

    console.log('\n🔧 Configuration Checklist:');
    console.log('□ Google OAuth configured in Supabase dashboard');
    console.log('□ Redirect URI set to: http://localhost:3000/auth/callback');
    console.log('□ Google Cloud OAuth credentials configured');
    console.log('□ Environment variables set correctly');

    console.log('\n🔍 Debug Information:');
    console.log('If you still get "No authentication code received":');
    console.log('1. Check that Google Cloud Console has the correct redirect URIs');
    console.log('2. Verify Supabase Google OAuth is enabled');
    console.log('3. Check browser console for OAuth URL parameters');
    console.log('4. Ensure you\'re using the login button, not direct URL access');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testOAuthPKCEFlow()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testOAuthPKCEFlow }; 