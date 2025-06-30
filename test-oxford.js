require('dotenv').config({ path: '.env.local' });

const OXFORD_APP_ID = process.env.OXFORD_APP_ID;
const OXFORD_APP_KEY = process.env.OXFORD_APP_KEY;

console.log('Oxford API Credentials Check:');
console.log('OXFORD_APP_ID:', OXFORD_APP_ID ? `${OXFORD_APP_ID.substring(0, 8)}...` : 'NOT SET');
console.log('OXFORD_APP_KEY:', OXFORD_APP_KEY ? `${OXFORD_APP_KEY.substring(0, 8)}...` : 'NOT SET');

// Test Oxford API directly
async function testOxfordAPI() {
  if (!OXFORD_APP_ID || !OXFORD_APP_KEY) {
    console.log('❌ Oxford API credentials not set');
    return;
  }

  try {
    const response = await fetch(
      'https://od-api.oxforddictionaries.com/api/v2/entries/en/a',
      {
        headers: {
          'app_id': OXFORD_APP_ID,
          'app_key': OXFORD_APP_KEY
        }
      }
    );

    console.log('Oxford API Response Status:', response.status);
    console.log('Oxford API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Oxford API working!');
      console.log('Response keys:', Object.keys(data));
      if (data.results && data.results.length > 0) {
        console.log('First result word:', data.results[0].word);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Oxford API error:', errorText);
    }
  } catch (error) {
    console.log('❌ Oxford API request failed:', error.message);
  }
}

testOxfordAPI(); 