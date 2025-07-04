const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const http = require('http');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_URL = 'http://localhost:3000';
const TEST_WORD = 'serendipity';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const data = options.body ? JSON.stringify(options.body) : '';
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(jsonBody),
            text: () => Promise.resolve(body)
          });
        } catch (error) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.reject(error),
            text: () => Promise.resolve(body)
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testWordCache() {
  console.log('🧪 Testing Word Details Caching System\n');

  try {
    // Step 1: First API call - should generate and cache data
    console.log('1️⃣ Making first API call (should generate and cache)...');
    const firstResponse = await makeRequest(`${BASE_URL}/api/word-maze/generate-details`, {
      method: 'POST',
      body: {
        word: TEST_WORD
      }
    });

    if (!firstResponse.ok) {
      const errorText = await firstResponse.text();
      console.error(`❌ First API call failed: ${firstResponse.status} - ${errorText}`);
      return;
    }

    const firstData = await firstResponse.json();
    console.log('✅ First call successful');
    console.log(`   Definition: ${firstData.definition?.substring(0, 50)}...`);
    console.log(`   Example: ${firstData.example?.substring(0, 50)}...`);
    console.log(`   Synonyms: ${firstData.synonyms?.join(', ')}`);
    console.log(`   Usage Tip: ${firstData.usageTip?.substring(0, 50)}...`);
    console.log(`   Cached: ${firstData.cached}`);

    // Step 2: Second API call - should hit cache
    console.log('\n2️⃣ Making second API call (should hit cache)...');
    const secondResponse = await makeRequest(`${BASE_URL}/api/word-maze/generate-details`, {
      method: 'POST',
      body: {
        word: TEST_WORD
      }
    });

    if (!secondResponse.ok) {
      const errorText = await secondResponse.text();
      console.error(`❌ Second API call failed: ${secondResponse.status} - ${errorText}`);
      return;
    }

    const secondData = await secondResponse.json();
    console.log('✅ Second call successful');
    console.log(`   Cached: ${secondData.cached}`);
    console.log(`   Definition: ${secondData.definition?.substring(0, 50)}...`);

    // Step 3: Verify cache behavior
    console.log('\n3️⃣ Verifying cache behavior...');
    if (firstData.cached === false && secondData.cached === true) {
      console.log('✅ Cache working correctly!');
      console.log('   - First call: Generated and cached');
      console.log('   - Second call: Retrieved from cache');
    } else {
      console.log('⚠️  Cache behavior unexpected:');
      console.log(`   - First call cached: ${firstData.cached}`);
      console.log(`   - Second call cached: ${secondData.cached}`);
    }

    // Step 4: Test with different word to ensure isolation
    console.log('\n4️⃣ Testing cache isolation with different word...');
    const differentWordResponse = await makeRequest(`${BASE_URL}/api/word-maze/generate-details`, {
      method: 'POST',
      body: {
        word: 'ephemeral'
      }
    });

    if (differentWordResponse.ok) {
      const differentWordData = await differentWordResponse.json();
      console.log('✅ Different word call successful');
      console.log(`   Word: ephemeral`);
      console.log(`   Cached: ${differentWordData.cached}`);
    } else {
      console.log('❌ Different word call failed');
    }

    console.log('\n🎉 Cache testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testWordCache(); 