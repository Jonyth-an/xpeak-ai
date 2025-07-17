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

async function debugOAuthURL() {
  console.log('🔍 Debugging OAuth URL...\n');

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
    // Generate OAuth URL
    console.log('\n=== Generating OAuth URL ===');
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
    console.log('🔗 Full URL:', data.url);
    console.log('Provider:', data.provider);

    // Parse the URL to see what's actually in it
    const url = new URL(data.url);
    console.log('\n=== URL Analysis ===');
    console.log('Base URL:', url.origin + url.pathname);
    console.log('Search params:', url.search);

    // Check each parameter
    const params = url.searchParams;
    console.log('\n=== All URL Parameters ===');
    for (const [key, value] of params.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Check if this is a Supabase OAuth URL or direct Google URL
    if (data.url.includes('supabase.co')) {
      console.log('\n✅ This is a Supabase OAuth URL');
      console.log('📋 Next steps:');
      console.log('1. Copy this URL and paste it in your browser');
      console.log('2. You should be redirected to Google OAuth');
      console.log('3. After Google OAuth, you should be redirected to /auth/callback');
      console.log('4. Check the browser console for any errors');
    } else {
      console.log('\n⚠️  This appears to be a direct Google OAuth URL');
      console.log('This might indicate the OAuth flow is bypassing Supabase');
    }

    // Test the URL by making a request to see what happens
    console.log('\n=== Testing URL Response ===');
    try {
      const response = await fetch(data.url, {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 302 || response.status === 301) {
        const location = response.headers.get('location');
        console.log('Redirect location:', location);
        
        if (location && location.includes('accounts.google.com')) {
          console.log('✅ Correctly redirecting to Google OAuth');
        } else {
          console.log('⚠️  Redirecting to unexpected location');
        }
      }
    } catch (fetchError) {
      console.log('❌ Error testing URL:', fetchError.message);
    }

    console.log('\n=== Manual Test Instructions ===');
    console.log('1. Open your browser');
    console.log('2. Navigate to:', data.url);
    console.log('3. Check if you see Google OAuth consent screen');
    console.log('4. If you see an error, note the error message');
    console.log('5. Check browser console for any JavaScript errors');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  debugOAuthURL()
    .then(() => {
      console.log('\n✅ Debug completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugOAuthURL }; 