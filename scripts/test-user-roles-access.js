const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserRolesAccess() {
  console.log('🔍 Testing user_roles table access...\n');

  try {
    // Test 1: Check if table exists and has any data
    console.log('1. Testing basic table access...');
    const { data: allData, error: allError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5);
    
    if (allError) {
      console.error('❌ Error accessing user_roles table:', allError);
      return;
    }
    
    console.log('✅ Table access successful');
    console.log('📊 Total rows found:', allData?.length || 0);
    console.log('📋 Sample data:', allData);

    // Test 2: Check for specific roles
    console.log('\n2. Testing role-specific queries...');
    const privilegedRoles = ['admin', 'marketer', 'tutor approver'];
    
    for (const role of privilegedRoles) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', role.toLowerCase());
      
      if (roleError) {
        console.error(`❌ Error querying role '${role}':`, roleError);
      } else {
        console.log(`✅ Role '${role}': ${roleData?.length || 0} users`);
      }
    }

    // Test 3: Check RLS policies
    console.log('\n3. Testing with authenticated user context...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('⚠️ No authenticated user (this is normal for service role)');
    } else {
      console.log('👤 Authenticated user:', user?.email);
      
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      if (userRolesError) {
        console.error('❌ Error querying user roles:', userRolesError);
      } else {
        console.log('✅ User roles query successful:', userRoles);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testUserRolesAccess(); 