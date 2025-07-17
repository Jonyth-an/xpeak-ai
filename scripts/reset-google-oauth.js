const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function resetGoogleOAuth() {
  console.log('🔄 Google OAuth Reset Process\n');
  console.log('This script will help you reset Google OAuth configuration in Supabase.\n');

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

  console.log('\n📋 STEP-BY-STEP RESET PROCESS\n');

  console.log('STEP 1: Remove Google OAuth from Supabase Dashboard');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Authentication > Providers');
  console.log('3. Find "Google" in the list');
  console.log('4. Click "Edit" and disable Google authentication');
  console.log('5. Clear the Client ID and Client Secret fields');
  console.log('6. Save the configuration');
  console.log('7. Wait 30 seconds for changes to propagate\n');

  console.log('STEP 2: Remove Google OAuth from Google Cloud Console');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Select your project');
  console.log('3. Go to APIs & Services > Credentials');
  console.log('4. Find your OAuth 2.0 Client ID for this app');
  console.log('5. Click on it to edit');
  console.log('6. Remove these redirect URIs:');
  console.log('   - http://localhost:3000/auth/callback');
  console.log('   - https://your-project.supabase.co/auth/v1/callback');
  console.log('7. Save the changes\n');

  console.log('STEP 3: Create New Google OAuth Credentials');
  console.log('1. In Google Cloud Console, go to APIs & Services > Credentials');
  console.log('2. Click "Create Credentials" > "OAuth 2.0 Client IDs"');
  console.log('3. Choose "Web application" as application type');
  console.log('4. Name: "XPeak AI - Supabase OAuth"');
  console.log('5. Add these Authorized redirect URIs:');
  console.log('   - http://localhost:3000/auth/callback');
  console.log('   - https://your-project.supabase.co/auth/v1/callback');
  console.log('6. Click "Create"');
  console.log('7. Copy the new Client ID and Client Secret\n');

  console.log('STEP 4: Re-add Google OAuth to Supabase');
  console.log('1. Go back to your Supabase project dashboard');
  console.log('2. Navigate to Authentication > Providers');
  console.log('3. Find "Google" and click "Edit"');
  console.log('4. Enable Google authentication');
  console.log('5. Enter the new Client ID and Client Secret');
  console.log('6. Save the configuration');
  console.log('7. Wait 30 seconds for changes to propagate\n');

  console.log('STEP 5: Test the Configuration');
  console.log('1. Run this command to test: node tests/oauth-debug.js');
  console.log('2. Check that the OAuth URL includes all required parameters');
  console.log('3. Test the login flow at http://localhost:3000/login\n');

  console.log('🔍 VALIDATION CHECKLIST\n');
  console.log('After completing the steps above, verify:');
  console.log('□ Google OAuth is enabled in Supabase');
  console.log('□ Client ID and Secret are set in Supabase');
  console.log('□ Redirect URIs are configured in Google Cloud Console');
  console.log('□ OAuth URL includes client_id parameter');
  console.log('□ OAuth URL includes code_challenge parameter');
  console.log('□ OAuth URL includes response_type=code');
  console.log('□ Login flow redirects to Google OAuth consent screen');
  console.log('□ Callback receives authorization code (not access token)');

  console.log('\n⚠️  IMPORTANT NOTES');
  console.log('- Always use Authorization Code Flow (response_type=code)');
  console.log('- Never use Implicit Flow (response_type=token)');
  console.log('- PKCE (Proof Key for Code Exchange) is required for security');
  console.log('- Redirect URIs must match exactly between Google and Supabase');
  console.log('- Changes may take up to 5 minutes to propagate');

  console.log('\n🚀 Ready to proceed? Follow the steps above, then run:');
  console.log('node tests/oauth-debug.js');
}

// Run the reset process
resetGoogleOAuth().catch(console.error); 