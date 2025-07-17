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
        }
      }
    });
  }
}

async function testBrowserOAuthFlow() {
  console.log('🧪 Testing Browser OAuth Flow...\n');

  // Load environment variables
  loadEnvFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  console.log('✅ Supabase environment variables found');
  console.log('Supabase URL:', supabaseUrl);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  });

  try {
    // Simulate the exact same call that the login button makes
    console.log('\n=== Simulating Login Button Click ===');
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
    console.log('🔗 OAuth URL:', data.url);
    console.log('Provider:', data.provider);

    // Parse the URL to see the actual parameters
    const url = new URL(data.url);
    console.log('\n=== Actual OAuth Parameters ===');
    for (const [key, value] of url.searchParams.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Check if this URL would work
    console.log('\n=== OAuth URL Analysis ===');
    
    // Check if it's a Supabase URL
    if (data.url.includes('supabase.co')) {
      console.log('✅ This is a Supabase OAuth URL');
    } else {
      console.log('⚠️  This is not a Supabase OAuth URL');
    }

    // Check if it has the right parameters
    const hasProvider = url.searchParams.get('provider') === 'google';
    const hasRedirectTo = url.searchParams.get('redirect_to') === 'http://localhost:3000/auth/callback';
    
    console.log(`Provider parameter: ${hasProvider ? '✅' : '❌'}`);
    console.log(`Redirect parameter: ${hasRedirectTo ? '✅' : '❌'}`);

    console.log('\n=== Manual Test Instructions ===');
    console.log('1. Copy this URL and paste it in your browser:');
    console.log(data.url);
    console.log('\n2. You should be redirected to Google OAuth');
    console.log('3. After Google OAuth, you should be redirected to:');
    console.log('   http://localhost:3000/auth/callback?code=...&state=...');
    console.log('\n4. If you get an error, note the error message');

    console.log('\n=== Expected Flow ===');
    console.log('1. Browser visits Supabase OAuth URL');
    console.log('2. Supabase redirects to Google OAuth');
    console.log('3. Google OAuth redirects back to Supabase');
    console.log('4. Supabase redirects to your callback with code');
    console.log('5. Your callback exchanges code for session');
    console.log('6. User is redirected to /dashboard');

    console.log('\n=== Troubleshooting ===');
    console.log('If you still get "No authentication code received":');
    console.log('1. Check browser console for errors');
    console.log('2. Check network tab for failed requests');
    console.log('3. Verify the final redirect URL contains "code=" parameter');
    console.log('4. Ensure your development server is running on port 3000');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBrowserOAuthFlow()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testBrowserOAuthFlow }; 