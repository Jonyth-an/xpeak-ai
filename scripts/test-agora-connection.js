require('dotenv').config({ path: '.env.local' });
const { RtcTokenBuilder, RtcRole } = require('agora-token');

console.log('🔍 Testing Agora connection and credentials...');

const appID = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

console.log('\n📋 Credentials check:');
console.log('- App ID:', appID ? `${appID.substring(0, 8)}...${appID.substring(appID.length - 4)}` : 'MISSING');
console.log('- App Certificate:', appCertificate ? `${appCertificate.substring(0, 8)}...${appCertificate.substring(appCertificate.length - 4)}` : 'MISSING');

if (!appID || !appCertificate) {
  console.error('❌ Missing Agora credentials!');
  process.exit(1);
}

// Test token generation with various parameters
const testCases = [
  {
    name: 'Basic test',
    channelName: 'test_channel',
    uid: 12345,
    role: RtcRole.PUBLISHER
  },
  {
    name: 'Lesson format test',
    channelName: 'lesson_2a63cf38',
    uid: 6221414,
    role: RtcRole.PUBLISHER
  },
  {
    name: 'Student role test',
    channelName: 'lesson_test',
    uid: 999999,
    role: RtcRole.SUBSCRIBER
  }
];

console.log('\n🧪 Testing token generation...');

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}:`);
  
  try {
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      testCase.channelName,
      testCase.uid,
      testCase.role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    if (token) {
      console.log(`   ✅ Token generated successfully`);
      console.log(`   📏 Token length: ${token.length}`);
      console.log(`   🔑 Token preview: ${token.substring(0, 30)}...`);
      
      // Basic token format validation
      if (token.length > 50 && token.length < 500) {
        console.log(`   ✅ Token length looks reasonable`);
      } else {
        console.log(`   ⚠️  Token length seems unusual`);
      }
    } else {
      console.log(`   ❌ Failed to generate token`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
});

console.log('\n📝 Recommendations:');
console.log('1. Verify your Agora App ID and App Certificate in the Agora Console');
console.log('2. Ensure your Agora app is enabled and not in testing mode');
console.log('3. Check if your Agora app has the correct permissions');
console.log('4. Verify that the App Certificate matches the App ID');

console.log('\n🔗 Agora Console: https://console.agora.io/');
console.log('   - Go to your project');
console.log('   - Check the App ID and App Certificate');
console.log('   - Ensure the app is enabled for production use'); 