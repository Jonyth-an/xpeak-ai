// Test script for maze paths API
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testMazePathsAPI() {
  console.log('🧪 Testing Maze Paths API...\n');

  try {
    // Test 1: Get all paths (should return empty array initially)
    console.log('📋 Test 1: Getting all maze paths...');
    const response1 = await fetch(`${BASE_URL}/api/word-maze/paths`, {
      headers: {
        'X-Bypass-Auth': 'true' // Use test mode
      }
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success:', data1);
    } else {
      console.log('❌ Failed:', response1.status, response1.statusText);
    }

    // Test 2: Create a new maze path
    console.log('\n📋 Test 2: Creating a new maze path...');
    const response2 = await fetch(`${BASE_URL}/api/word-maze/paths`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bypass-Auth': 'true'
      },
      body: JSON.stringify({
        name: 'Test Learning Path',
        description: 'A test path for vocabulary learning',
        path_type: 'thematic',
        difficulty_level: 'intermediate',
        estimated_duration: 30,
        metadata: {
          theme: 'business',
          tags: ['professional', 'communication']
        }
      })
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Success:', data2);
      
      // Test 3: Get specific path
      if (data2.path && data2.path.id) {
        console.log('\n📋 Test 3: Getting specific path...');
        const response3 = await fetch(`${BASE_URL}/api/word-maze/paths?id=${data2.path.id}`, {
          headers: {
            'X-Bypass-Auth': 'true'
          }
        });

        if (response3.ok) {
          const data3 = await response3.json();
          console.log('✅ Success:', data3);
        } else {
          console.log('❌ Failed:', response3.status, response3.statusText);
        }
      }
    } else {
      console.log('❌ Failed:', response2.status, response2.statusText);
      const errorText = await response2.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testMazePathsAPI(); 