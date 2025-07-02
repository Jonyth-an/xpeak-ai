require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSessionAfterOAuth() {
  console.log('Testing session after OAuth login...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  // Create Supabase client with localStorage simulation
  const mockLocalStorage = {
    data: {},
    getItem(key) {
      console.log('🔍 localStorage.getItem:', key);
      const value = this.data[key];
      console.log('📄 Retrieved value:', value ? `${value.substring(0, 50)}...` : 'null');
      return value || null;
    },
    setItem(key, value) {
      console.log('💾 localStorage.setItem:', key);
      console.log('📄 Stored value length:', value?.length || 0);
      this.data[key] = value;
    },
    removeItem(key) {
      console.log('🗑️ localStorage.removeItem:', key);
      delete this.data[key];
    }
  };

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: mockLocalStorage
    }
  });

  try {
    // Test 1: Check if there's an existing session
    console.log('=== Test 1: Check Existing Session ===');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
    } else if (session) {
      console.log('✅ Session found!');
      console.log('👤 User:', session.user.email);
      console.log('🆔 User ID:', session.user.id);
      console.log('⏰ Expires at:', new Date(session.expires_at * 1000));
      console.log('🔑 Access token length:', session.access_token.length);
      console.log('🔄 Refresh token length:', session.refresh_token.length);
      
      // Test 2: Try to make an API call
      console.log('\n=== Test 2: Test API Call ===');
      const response = await fetch('http://localhost:3000/api/word-maze/words?limit=1', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      console.log('📡 API Response Status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API call successful!');
        console.log('📊 Response:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('❌ API call failed');
        console.log('📄 Error response:', errorText);
      }
      
    } else {
      console.log('ℹ️ No active session found');
      console.log('💡 This is expected if you haven\'t logged in yet');
      
      // Test 3: Simulate OAuth callback
      console.log('\n=== Test 3: Simulate OAuth Callback ===');
      console.log('🔗 To test OAuth flow:');
      console.log('1. Visit: http://localhost:3000/login');
      console.log('2. Click "Continue with Google"');
      console.log('3. Complete Google OAuth');
      console.log('4. You should be redirected to /dashboard');
      console.log('5. Run this test again to check session');
    }

    // Test 4: Check localStorage contents
    console.log('\n=== Test 4: localStorage Contents ===');
    console.log('📦 Stored keys:', Object.keys(mockLocalStorage.data));
    for (const [key, value] of Object.entries(mockLocalStorage.data)) {
      console.log(`🔑 ${key}: ${value ? `${value.substring(0, 100)}...` : 'null'}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSessionAfterOAuth(); 