require('dotenv').config({ path: '.env.local' });

const WORDNIK_API_KEY = process.env.WORDNIK_API_KEY;
const OXFORD_APP_ID = process.env.OXFORD_APP_ID;
const OXFORD_APP_KEY = process.env.OXFORD_APP_KEY;

console.log('Environment Variables Check:');
console.log('WORDNIK_API_KEY:', WORDNIK_API_KEY ? `${WORDNIK_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log('OXFORD_APP_ID:', OXFORD_APP_ID ? `${OXFORD_APP_ID.substring(0, 8)}...` : 'NOT SET');
console.log('OXFORD_APP_KEY:', OXFORD_APP_KEY ? `${OXFORD_APP_KEY.substring(0, 8)}...` : 'NOT SET');

// Test Wordnik API directly
async function testWordnikAPI() {
  if (!WORDNIK_API_KEY) {
    console.log('❌ WORDNIK_API_KEY not set');
    return;
  }

  try {
    const response = await fetch(
      `https://api.wordnik.com/v4/word.json/beautiful/definitions?limit=5&includeRelated=true&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=${WORDNIK_API_KEY}`
    );

    console.log('Wordnik API Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Wordnik API working!');
      console.log('Response structure:', Object.keys(data));
      console.log('Definitions count:', data.definitions?.length || 0);
      if (data.definitions && data.definitions.length > 0) {
        console.log('First definition:', JSON.stringify(data.definitions[0], null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Wordnik API error:', errorText);
    }
  } catch (error) {
    console.log('❌ Wordnik API error:', error.message);
  }
}

testWordnikAPI(); 