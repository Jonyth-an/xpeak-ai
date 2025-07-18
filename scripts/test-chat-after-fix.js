const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testChatAfterFix() {
  console.log('🔍 Testing chat functionality after RLS policy fix...')
  
  try {
    // 1. Get a lesson to test with
    console.log('\n1. Getting a lesson for testing...')
    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('id, student_id, tutor_id')
      .limit(1)
    
    if (lessonError || !lessons || lessons.length === 0) {
      console.error('❌ No lessons found for testing')
      return
    }
    
    const lesson = lessons[0]
    console.log('✅ Found lesson:', lesson.id)
    
    // 2. Get the tutor profile to get the user_id
    console.log('\n2. Getting tutor profile...')
    const { data: tutorProfile, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('user_id')
      .eq('id', lesson.tutor_id)
      .single()
    
    if (tutorError || !tutorProfile) {
      console.error('❌ Could not find tutor profile:', tutorError?.message)
      return
    }
    
    console.log('✅ Found tutor user_id:', tutorProfile.user_id)
    
    // 3. Test sending a message as student
    console.log('\n3. Testing message sending as student...')
    const testMessage = {
      lesson_id: lesson.id,
      sender_id: lesson.student_id,
      sender_name: 'Test Student',
      message: 'Test message from student',
      message_type: 'text'
    }
    
    const { data: sentMessage, error: sendError } = await supabase
      .from('lesson_chat_messages')
      .insert(testMessage)
      .select()
      .single()
    
    if (sendError) {
      console.error('❌ Failed to send message:', sendError.message)
      return
    }
    
    console.log('✅ Message sent successfully:', sentMessage.id)
    
    // 4. Test retrieving messages as tutor (using tutor's user_id)
    console.log('\n4. Testing message retrieval as tutor...')
    const { data: retrievedMessages, error: retrieveError } = await supabase
      .from('lesson_chat_messages')
      .select('*')
      .eq('lesson_id', lesson.id)
    
    if (retrieveError) {
      console.error('❌ Failed to retrieve messages:', retrieveError.message)
      return
    }
    
    console.log('✅ Retrieved messages:', retrievedMessages.length)
    retrievedMessages.forEach(msg => {
      console.log(`  - ${msg.sender_name}: ${msg.message}`)
    })
    
    // 5. Test real-time subscription
    console.log('\n5. Testing real-time subscription...')
    const subscription = supabase
      .channel('test-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'lesson_chat_messages',
        filter: `lesson_id=eq.${lesson.id}`
      }, (payload) => {
        console.log('✅ Real-time message received:', payload.new)
      })
      .subscribe()
    
    // Wait a moment for subscription to be established
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Send another test message
    const realtimeMessage = {
      lesson_id: lesson.id,
      sender_id: lesson.student_id,
      sender_name: 'Test Student',
      message: 'Real-time test message',
      message_type: 'text'
    }
    
    const { error: realtimeError } = await supabase
      .from('lesson_chat_messages')
      .insert(realtimeMessage)
    
    if (realtimeError) {
      console.error('❌ Failed to send real-time message:', realtimeError.message)
    } else {
      console.log('✅ Real-time message sent')
    }
    
    // Wait for real-time message to be processed
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Clean up
    subscription.unsubscribe()
    
    // 6. Clean up test messages
    console.log('\n6. Cleaning up test messages...')
    const { error: cleanupError } = await supabase
      .from('lesson_chat_messages')
      .delete()
      .eq('lesson_id', lesson.id)
      .eq('message', 'Test message from student')
    
    if (cleanupError) {
      console.error('⚠️  Could not clean up test messages:', cleanupError.message)
    } else {
      console.log('✅ Test messages cleaned up')
    }
    
    console.log('\n🎉 Chat functionality test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testChatAfterFix() 