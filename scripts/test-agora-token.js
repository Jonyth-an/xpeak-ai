require('dotenv').config({ path: '.env.local' });
const { RtcTokenBuilder, RtcRole } = require('agora-token');

console.log('🔑 Testing Agora token generation with exact parameters...');

// Use the exact same parameters as the failing video call
const appID = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;
const channelName = 'lesson_2a63cf38'; // From the error logs
const uid = 6221414; // From the error logs
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 3600;
const currentTimestamp = Math.floor(Date.now() / 1000);
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

console.log('\nGenerating token with:');
console.log('- App ID:', appID ? appID.substring(0, 8) + '...' : 'MISSING');
console.log('- App Certificate:', appCertificate ? appCertificate.substring(0, 8) + '...' : 'MISSING');
console.log('- Channel:', channelName);
console.log('- UID:', uid);
console.log('- Role:', role);
console.log('- Expires:', new Date(privilegeExpiredTs * 1000).toISOString());

if (!appID || !appCertificate) {
  console.error('❌ Missing Agora credentials!');
  process.exit(1);
}

try {
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs,
    privilegeExpiredTs
  );

  if (token) {
    console.log('\n✅ Token generated successfully!');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Test token validation
    console.log('\n🔍 Testing token validation...');
    try {
      // Try to decode the token to see if it's valid
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        console.log('✅ Token format looks valid (JWT format)');
      } else {
        console.log('⚠️  Token format may be invalid');
      }
    } catch (e) {
      console.log('❌ Token validation failed:', e.message);
    }
  } else {
    console.error('❌ Failed to generate token');
  }
} catch (error) {
  console.error('❌ Error generating token:', error.message);
} 