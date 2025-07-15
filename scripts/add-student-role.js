const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addStudentRole() {
  try {
    // First, get the user ID for clshou@gmail.com using the admin API
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error listing users:', userError);
      return;
    }

    const user = users.find(u => u.email === 'clshou@gmail.com');
    
    if (!user) {
      console.error('User clshou@gmail.com not found');
      return;
    }

    console.log('Found user ID:', user.id);

    // Check if student role already exists
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'student')
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing role:', checkError);
      return;
    }

    if (existingRole) {
      console.log('Student role already exists for this user');
      return;
    }

    // Add the student role
    const { data: newRole, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'student'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding student role:', insertError);
      return;
    }

    console.log('Successfully added student role:', newRole);

    // Verify the user's roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return;
    }

    console.log('User roles after update:', roles.map(r => r.role));

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addStudentRole(); 