// Test script to verify word addition functionality

async function createTestUser() {
  console.log('Creating test user...');
  
  try {
    const response = await fetch('http://localhost:3000/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'create_test_user',
        userId: 'test-user-id-12345'
      }),
    });

    const result = await response.json();
    console.log('Test user creation result:', result);
    return response.ok;
  } catch (error) {
    console.error('Failed to create test user:', error.message);
    return false;
  }
}

async function testWordAddition() {
  console.log('Testing word addition...');
  
  // First create a test user
  const userCreated = await createTestUser();
  if (!userCreated) {
    console.log('⚠️  Could not create test user, proceeding anyway...');
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/word-maze/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bypass-Auth': 'true' // Enable test mode
      },
      body: JSON.stringify({ 
        words: ['test', 'example', 'sample'] 
      }),
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Word addition test passed!');
    } else {
      console.log('❌ Word addition test failed!');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testWordAddition(); 