const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testStatusFilter() {
  console.log('🧪 Testing Status Filter Fix\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ No active session found');
      return;
    }

    console.log('✅ Session found for user:', session.user.email);

    // Test different API calls
    const testCases = [
      {
        name: 'Dashboard style (no status filter)',
        params: 'upcoming=true&limit=5'
      },
      {
        name: 'Lessons page style (with status filter)',
        params: 'upcoming=true&limit=20&status=confirmed,pending,reschedule_requested'
      },
      {
        name: 'Single status test',
        params: 'upcoming=true&limit=20&status=pending'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.name}`);
      console.log(`📡 API call: /api/lessons/user?${testCase.params}`);
      
      const response = await fetch(`http://localhost:3000/api/lessons/user?${testCase.params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: Found ${data.lessons?.length || 0} lessons`);
        
        if (data.lessons && data.lessons.length > 0) {
          console.log('📋 Lessons:');
          data.lessons.forEach((lesson, index) => {
            console.log(`  ${index + 1}. ${lesson.tutor.name} - ${lesson.lesson_type} - ${lesson.status} - ${new Date(lesson.scheduled_start).toLocaleString()}`);
          });
        } else {
          console.log('  No lessons found');
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ Error: ${response.status} - ${errorData.error}`);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testStatusFilter(); 