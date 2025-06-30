// Test script to verify word addition functionality
const fetch = require('node-fetch');

async function testWordAddition() {
  console.log('Testing word addition...');
  
  try {
    const response = await fetch('http://localhost:3000/api/word-maze/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    console.error('❌ Test failed with error:', error);
  }
}

testWordAddition(); 