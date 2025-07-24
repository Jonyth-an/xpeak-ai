const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupDuplicateConversations() {
  console.log('🧹 Starting conversation cleanup...')
  
  try {
    // Step 1: Find all student_tutor conversations
    console.log('📋 Finding all student_tutor conversations...')
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        participants:conversation_participants(
          user_id,
          role
        )
      `)
      .eq('conversation_type', 'student_tutor')
      .order('created_at', { ascending: true })

    if (conversationsError) {
      console.error('❌ Error fetching conversations:', conversationsError)
      return
    }

    console.log(`📊 Found ${conversations.length} student_tutor conversations`)

    // Step 2: Group conversations by student-tutor pairs
    const conversationGroups = new Map()
    
    conversations.forEach(conversation => {
      const participants = conversation.participants || []
      const student = participants.find(p => p.role === 'student')
      const tutor = participants.find(p => p.role === 'tutor')
      
      if (student && tutor) {
        const pairKey = `${student.user_id}-${tutor.user_id}`
        
        if (!conversationGroups.has(pairKey)) {
          conversationGroups.set(pairKey, [])
        }
        conversationGroups.get(pairKey).push(conversation)
      }
    })

    console.log(`👥 Found ${conversationGroups.size} unique student-tutor pairs`)

    // Step 3: Process each group and merge duplicates
    let totalMerged = 0
    let totalDeleted = 0

    for (const [pairKey, groupConversations] of conversationGroups) {
      if (groupConversations.length > 1) {
        console.log(`\n🔄 Processing pair ${pairKey} with ${groupConversations.length} conversations`)
        
        // Sort by creation date to keep the oldest
        groupConversations.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        const keepConversation = groupConversations[0]
        const deleteConversations = groupConversations.slice(1)
        
        console.log(`  ✅ Keeping conversation: ${keepConversation.id} (created: ${keepConversation.created_at})`)
        
        // Merge messages from all conversations into the one we're keeping
        for (const deleteConversation of deleteConversations) {
          console.log(`  📝 Merging messages from ${deleteConversation.id} into ${keepConversation.id}`)
          
          // Get all messages from the conversation to be deleted
          const { data: messages, error: messagesError } = await supabase
            .from('general_chat_messages')
            .select('*')
            .eq('conversation_id', deleteConversation.id)
            .order('created_at', { ascending: true })

          if (messagesError) {
            console.error(`    ❌ Error fetching messages from ${deleteConversation.id}:`, messagesError)
            continue
          }

          // Move messages to the conversation we're keeping
          if (messages && messages.length > 0) {
            const updatedMessages = messages.map(msg => {
              const { id, ...messageWithoutId } = msg
              return {
                ...messageWithoutId,
                conversation_id: keepConversation.id
              }
            })

            const { error: insertError } = await supabase
              .from('general_chat_messages')
              .insert(updatedMessages)

            if (insertError) {
              console.error(`    ❌ Error moving messages:`, insertError)
              continue
            }

            console.log(`    ✅ Moved ${messages.length} messages`)
          }

          // Delete the old conversation (this will cascade delete participants and messages)
          const { error: deleteError } = await supabase
            .from('conversations')
            .delete()
            .eq('id', deleteConversation.id)

          if (deleteError) {
            console.error(`    ❌ Error deleting conversation ${deleteConversation.id}:`, deleteError)
          } else {
            console.log(`    ✅ Deleted conversation: ${deleteConversation.id}`)
            totalDeleted++
          }
        }
        
        totalMerged++
      }
    }

    console.log(`\n🎉 Cleanup completed!`)
    console.log(`📊 Summary:`)
    console.log(`  - Pairs processed: ${conversationGroups.size}`)
    console.log(`  - Pairs merged: ${totalMerged}`)
    console.log(`  - Conversations deleted: ${totalDeleted}`)

    // Step 4: Verify cleanup
    console.log('\n🔍 Verifying cleanup...')
    const { data: finalConversations, error: finalError } = await supabase
      .from('conversations')
      .select(`
        id,
        participants:conversation_participants(
          user_id,
          role
        )
      `)
      .eq('conversation_type', 'student_tutor')

    if (finalError) {
      console.error('❌ Error verifying cleanup:', finalError)
      return
    }

    const finalGroups = new Map()
    finalConversations.forEach(conversation => {
      const participants = conversation.participants || []
      const student = participants.find(p => p.role === 'student')
      const tutor = participants.find(p => p.role === 'tutor')
      
      if (student && tutor) {
        const pairKey = `${student.user_id}-${tutor.user_id}`
        if (!finalGroups.has(pairKey)) {
          finalGroups.set(pairKey, [])
        }
        finalGroups.get(pairKey).push(conversation)
      }
    })

    let duplicatesFound = 0
    for (const [pairKey, conversations] of finalGroups) {
      if (conversations.length > 1) {
        console.log(`⚠️  Still have duplicates for pair ${pairKey}: ${conversations.length} conversations`)
        duplicatesFound++
      }
    }

    if (duplicatesFound === 0) {
      console.log('✅ No duplicate conversations found! Cleanup successful.')
    } else {
      console.log(`⚠️  Found ${duplicatesFound} pairs still with duplicates`)
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Run the cleanup
cleanupDuplicateConversations()
  .then(() => {
    console.log('🏁 Cleanup script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }) 