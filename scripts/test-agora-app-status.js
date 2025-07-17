require('dotenv').config({ path: '.env.local' });
const https = require('https');

console.log('🔍 Testing Agora app status and configuration...');

const appID = process.env.AGORA_APP_ID;

if (!appID) {
  console.error('❌ Missing Agora App ID!');
  process.exit(1);
}

console.log('\n📋 App ID:', appID);

// Test if we can reach Agora's servers
console.log('\n🌐 Testing connectivity to Agora servers...');

const testUrls = [
  'https://api.agora.io',
  'https://console.agora.io',
  'https://download.agora.io'
];

testUrls.forEach(url => {
  console.log(`\nTesting ${url}...`);
  
  const req = https.get(url, (res) => {
    console.log(`   ✅ Status: ${res.statusCode}`);
    console.log(`   📡 Headers: ${JSON.stringify(res.headers, null, 2)}`);
  });
  
  req.on('error', (err) => {
    console.log(`   ❌ Error: ${err.message}`);
  });
  
  req.setTimeout(5000, () => {
    console.log(`   ⏰ Timeout`);
    req.destroy();
  });
});

console.log('\n📝 Common issues and solutions:');
console.log('\n1. Agora App in Testing Mode:');
console.log('   - Go to https://console.agora.io');
console.log('   - Select your project');
console.log('   - Check if the app is in "Testing" mode');
console.log('   - If so, change it to "Production" mode');
console.log('   - Or add your IP address to the allowed list');

console.log('\n2. App Certificate Issues:');
console.log('   - Verify the App Certificate matches the App ID');
console.log('   - Regenerate the App Certificate if needed');
console.log('   - Ensure you copied the entire certificate');

console.log('\n3. Network/Firewall Issues:');
console.log('   - Check if your network blocks Agora servers');
console.log('   - Try from a different network');
console.log('   - Check corporate firewall settings');

console.log('\n4. App Status:');
console.log('   - Ensure the app is not suspended');
console.log('   - Check if there are any billing issues');
console.log('   - Verify the app has the correct permissions');

console.log('\n🔗 Next steps:');
console.log('1. Visit https://console.agora.io');
console.log('2. Go to your project settings');
console.log('3. Check the app status and mode');
console.log('4. Verify the App ID and App Certificate');
console.log('5. Test with a simple demo app first'); 