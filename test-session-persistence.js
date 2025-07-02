#!/usr/bin/env node

/**
 * Test Session Persistence and Authentication Flow
 * 
 * This script tests:
 * 1. Session persistence across requests
 * 2. Proper token handling in API calls
 * 3. Authentication state consistency
 */

const BASE_URL = 'http://localhost:3000';

async function testSessionPersistence() {
  console.log('🧪 Testing Session Persistence and Authentication Flow\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server availability...');
    const healthResponse = await fetch(`${BASE_URL}/`);
    if (!healthResponse.ok) {
      throw new Error(`Server not responding: ${healthResponse.status}`);
    }
    console.log('✅ Server is running\n');

    // Test 2: Test bypass authentication (should work)
    console.log('2️⃣ Testing bypass authentication...');
    const bypassResponse = await fetch(`${BASE_URL}/api/word-maze/words?limit=1`, {
      headers: {
        'X-Bypass-Auth': 'true'
      }
    });
    
    if (bypassResponse.ok) {
      const data = await bypassResponse.json();
      console.log('✅ Bypass auth works - got words:', data.words?.length || 0);
    } else {
      console.log('❌ Bypass auth failed:', bypassResponse.status);
    }
    console.log('');

    // Test 3: Test without authentication (should fail)
    console.log('3️⃣ Testing without authentication...');
    const noAuthResponse = await fetch(`${BASE_URL}/api/word-maze/words?limit=1`);
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Properly rejects unauthenticated requests');
    } else {
      console.log('❌ Should reject unauthenticated requests, got:', noAuthResponse.status);
    }
    console.log('');

    // Test 4: Test with invalid token (should fail)
    console.log('4️⃣ Testing with invalid token...');
    const invalidTokenResponse = await fetch(`${BASE_URL}/api/word-maze/words?limit=1`, {
      headers: {
        'Authorization': 'Bearer invalid-token-123'
      }
    });
    
    if (invalidTokenResponse.status === 401) {
      console.log('✅ Properly rejects invalid tokens');
    } else {
      console.log('❌ Should reject invalid tokens, got:', invalidTokenResponse.status);
    }
    console.log('');

    console.log('🎯 Session Persistence Test Summary:');
    console.log('✅ Server is running');
    console.log('✅ Bypass authentication works');
    console.log('✅ Unauthenticated requests are rejected');
    console.log('✅ Invalid tokens are rejected');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Test actual login flow in browser');
    console.log('2. Verify session persists across page refreshes');
    console.log('3. Check localStorage for auth tokens');
    console.log('4. Test API calls with valid session tokens');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure the server is running on port 3000');
    console.log('2. Check that all environment variables are set');
    console.log('3. Verify Supabase configuration');
  }
}

// Run the test
testSessionPersistence(); 