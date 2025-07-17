const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testGitHubOAuth() {
  console.log('🧪 Testing GitHub OAuth as Comparison\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    if (error) {
      console.error('❌ GitHub OAuth Error:', error.message);
      console.log('\nThis confirms it\'s a project-wide OAuth configuration issue.');
    } else {
      console.log('✅ GitHub OAuth URL generated:', data.url);
      const url = new URL(data.url);
      
      console.log('\n=== GitHub OAuth URL Analysis ===');
      console.log('client_id present:', !!url.searchParams.get('client_id'));
      console.log('response_type:', url.searchParams.get('response_type'));
      console.log('scope:', url.searchParams.get('scope'));
      console.log('state:', url.searchParams.get('state') ? 'Present' : 'Missing');
      
      if (!url.searchParams.get('client_id')) {
        console.log('\n❌ GitHub also missing client_id - this confirms a project-wide OAuth issue');
        console.log('\n🔧 This means:');
        console.log('1. OAuth providers are not properly configured in this Supabase project');
        console.log('2. There might be a project-level setting preventing OAuth');
        console.log('3. The project might need to be recreated or reset');
      } else {
        console.log('\n✅ GitHub has client_id - this suggests Google-specific configuration issue');
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  console.log('\n=== RECOMMENDED ACTIONS ===');
  console.log('1. Check Supabase project status and settings');
  console.log('2. Try disabling and re-enabling ALL OAuth providers');
  console.log('3. Consider contacting Supabase support');
  console.log('4. As a last resort, create a new Supabase project');
}

testGitHubOAuth().catch(console.error); 