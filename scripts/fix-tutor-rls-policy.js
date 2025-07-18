const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixTutorRLSPolicy() {
  console.log('🔧 Fixing tutor RLS policy for lesson_chat_messages...')
  
  try {
    // Drop the old tutor policy
    console.log('\n1. Dropping old tutor policy...')
    try {
      await supabase.rpc('exec_sql', { 
        sql: 'DROP POLICY IF EXISTS "Tutors can access their lesson messages" ON lesson_chat_messages;' 
      })
      console.log('✅ Old tutor policy dropped')
    } catch (error) {
      console.log('ℹ️  Old policy not found or error:', error.message)
    }
    
    // Create the correct tutor policy that joins through tutor_profiles
    console.log('\n2. Creating correct tutor policy...')
    const correctTutorPolicy = `
      CREATE POLICY "Tutors can access their lesson messages" ON lesson_chat_messages
      FOR ALL USING (
        lesson_id IN (
          SELECT l.id FROM lessons l
          JOIN tutor_profiles tp ON l.tutor_id = tp.id
          WHERE tp.user_id = auth.uid()
        )
      );
    `
    
    try {
      await supabase.rpc('exec_sql', { sql: correctTutorPolicy })
      console.log('✅ Correct tutor policy created')
    } catch (error) {
      console.error('❌ Could not create tutor policy:', error.message)
      return
    }
    
    // Also update the insert policy to include the correct tutor check
    console.log('\n3. Updating insert policy...')
    try {
      await supabase.rpc('exec_sql', { 
        sql: 'DROP POLICY IF EXISTS "Users can insert messages in their lessons" ON lesson_chat_messages;' 
      })
      console.log('✅ Old insert policy dropped')
    } catch (error) {
      console.log('ℹ️  Old insert policy not found or error:', error.message)
    }
    
    const correctInsertPolicy = `
      CREATE POLICY "Users can insert messages in their lessons" ON lesson_chat_messages
      FOR INSERT WITH CHECK (
        lesson_id IN (
          SELECT l.id FROM lessons l
          WHERE l.student_id = auth.uid() 
          OR l.tutor_id IN (
            SELECT id FROM tutor_profiles WHERE user_id = auth.uid()
          )
        )
      );
    `
    
    try {
      await supabase.rpc('exec_sql', { sql: correctInsertPolicy })
      console.log('✅ Correct insert policy created')
    } catch (error) {
      console.error('❌ Could not create insert policy:', error.message)
    }
    
    // Test the new policies
    console.log('\n4. Testing new policies...')
    
    // Get a lesson with tutor info
    const { data: lessons } = await supabase
      .from('lessons')
      .select(`
        id, 
        student_id, 
        tutor_id,
        tutor_profiles!inner(user_id)
      `)
      .limit(1)
    
    if (!lessons || lessons.length === 0) {
      console.error('❌ No lessons found for testing')
      return
    }
    
    const lesson = lessons[0]
    console.log('Testing with lesson:', lesson.id)
    console.log('  - Student ID:', lesson.student_id)
    console.log('  - Tutor Profile ID:', lesson.tutor_id)
    console.log('  - Tutor User ID:', lesson.tutor_profiles.user_id)
    
    // Create a test message
    const testMessage = {
      lesson_id: lesson.id,
      sender_id: lesson.student_id,
      sender_name: 'Test Student',
      message: 'Test message for fixed RLS',
      message_type: 'text'
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('lesson_chat_messages')
      .insert([testMessage])
      .select()
    
    if (insertError) {
      console.error('❌ Could not insert test message:', insertError.message)
    } else {
      console.log('✅ Test message inserted:', insertData[0].id)
      
      // Verify it can be read
      const { data: readData, error: readError } = await supabase
        .from('lesson_chat_messages')
        .select('*')
        .eq('id', insertData[0].id)
      
      if (readError) {
        console.error('❌ Could not read test message:', readError.message)
      } else {
        console.log('✅ Test message can be read:', readData[0].message)
      }
      
      // Clean up
      await supabase
        .from('lesson_chat_messages')
        .delete()
        .eq('id', insertData[0].id)
      
      console.log('✅ Test message cleaned up')
    }
    
    console.log('\n✅ Tutor RLS policy fixed!')
    console.log('\n📝 The issue was:')
    console.log('  - tutor_id in lessons table = tutor profile ID')
    console.log('  - auth.uid() = user ID')
    console.log('  - Need to join through tutor_profiles table')
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message)
  }
}

fixTutorRLSPolicy() 