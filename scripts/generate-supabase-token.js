// scripts/generate-supabase-token.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_EMAIL = 'clshou@gmail.com';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase URL or Service Role Key in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  // List all users and find the one with the target email
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
  const user = data.users.find(u => u.email === TARGET_EMAIL);
  if (!user) {
    console.error('User not found:', TARGET_EMAIL);
    process.exit(1);
  }
  // Generate a JWT for the user (impersonation)
  // Supabase does not provide a direct way to generate a user access token from the admin API.
  // You must use a custom JWT library or use the user's refresh_token if available.
  // For most use cases, you should log in as the user to get a token.
  // Here, we just print the user ID for manual login or further scripting.
  console.log('User ID:', user.id);
  console.log('Supabase does not support generating a user access token directly from the admin API.');
  console.log('To get a token, log in as the user via the app, or use the refresh_token if available.');
}

main(); 