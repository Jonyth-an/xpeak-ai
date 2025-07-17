require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Agora environment variables...\n');

const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

console.log('AGORA_APP_ID:', appId ? '✅ SET' : '❌ MISSING');
console.log('AGORA_APP_CERTIFICATE:', appCertificate ? '✅ SET' : '❌ MISSING');

if (!appId || !appCertificate) {
  console.log('\n❌ Missing Agora credentials! Please check your .env.local file.');
  console.log('Make sure you have:');
  console.log('AGORA_APP_ID=your_app_id_here');
  console.log('AGORA_APP_CERTIFICATE=your_app_certificate_here');
} else {
  console.log('\n✅ Agora credentials are set!');
  console.log('App ID length:', appId.length);
  console.log('Certificate length:', appCertificate.length);
} 