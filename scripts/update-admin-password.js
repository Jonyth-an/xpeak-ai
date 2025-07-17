const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase client with service role key (has admin privileges)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // This is the service role key, not the anon key
);

async function updateAdminPassword() {
  try {
    // First, let's find the admin user by email
    const adminEmail = 'clshou@gmail.com'; // Replace with your admin email
    
    console.log('🔍 Looking for admin user:', adminEmail);
    
    // Get user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error fetching users:', userError);
      return;
    }
    
    const adminUser = users.users.find(user => user.email === adminEmail);
    
    if (!adminUser) {
      console.error('❌ Admin user not found with email:', adminEmail);
      return;
    }
    
    console.log('✅ Found admin user:', adminUser.id);
    
    // Set new password
    const newPassword = 'Admin123!'; // Change this to your desired password
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: newPassword }
    );
    
    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }
    
    console.log('✅ Password updated successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 New password:', newPassword);
    console.log('\n⚠️  Please change this password after logging in!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Alternative method using SQL if the above doesn't work
async function updatePasswordViaSQL() {
  try {
    console.log('🔄 Trying SQL method...');
    
    // This requires the service role key to have database access
    const { data, error } = await supabase
      .from('auth.users')
      .update({ 
        encrypted_password: '$2a$10$newhashedpasswordhere' // This would need to be properly hashed
      })
      .eq('email', 'xpeakshou@gmail.com');
    
    if (error) {
      console.error('❌ SQL update error:', error);
    } else {
      console.log('✅ SQL update successful');
    }
    
  } catch (error) {
    console.error('❌ SQL method error:', error);
  }
}

// Run the update
updateAdminPassword().then(() => {
  console.log('\n🎯 If the first method failed, trying SQL method...');
  return updatePasswordViaSQL();
}).catch(console.error); 