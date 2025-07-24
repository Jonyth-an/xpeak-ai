import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase, getUserFromAuthHeader } from '@/lib/serverSupabaseClient'

export async function GET(request: NextRequest) {
  try {
    // Get user from auth header
    const authResult = await getUserFromAuthHeader(request.headers.get('authorization'))
    if (!authResult.user) {
      console.error('No user found in auth result:', authResult)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = authResult.user
    console.log('🔍 Fetching student conversations for user:', user.id)

    // Get all conversations where the student is a participant
    const { data: conversations, error: conversationsError } = await serverSupabase
      .from('conversations')
      .select(`
        id,
        title,
        conversation_type,
        created_at,
        updated_at,
        unread_count,
        last_read_at,
        conversation_participants!inner(
          user_id,
          role
        )
      `)
      .eq('conversation_participants.user_id', user.id)
      .eq('conversation_type', 'student_tutor') // Key filter for student conversations
      .order('updated_at', { ascending: false })

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    console.log('📋 Found conversations:', conversations?.length || 0)

    // Process each conversation to get tutor information and latest message
    const processedConversations = await Promise.all(
      (conversations || []).map(async (conversation) => {
        // Get all participants for this conversation
        const { data: participants } = await serverSupabase
          .from('conversation_participants')
          .select('user_id, role')
          .eq('conversation_id', conversation.id)

        // Find the tutor participant
        const tutorParticipant = participants?.find(p => p.role === 'tutor')

        // Get tutor profile data separately
        let tutorName = 'Tutor'
        let tutorEmail = ''
        let tutorId = ''
        let tutorImageUrl = ''
        
        if (tutorParticipant) {
          const { data: tutorProfile } = await serverSupabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', tutorParticipant.user_id)
            .single()
          
          tutorName = tutorProfile?.full_name || tutorProfile?.email || 'Tutor'
          tutorEmail = tutorProfile?.email || ''
          tutorId = tutorProfile?.id || ''
          
          // Get tutor profile image if available
          const { data: tutorImage } = await serverSupabase
            .from('tutor_profiles')
            .select('profile_image_url')
            .eq('user_id', tutorParticipant.user_id)
            .single()
          
          tutorImageUrl = tutorImage?.profile_image_url || ''
        }

        // Get the latest message for this conversation
        const { data: latestMessage } = await serverSupabase
          .from('general_chat_messages')
          .select(`
            id,
            sender_id,
            message,
            message_type,
            file_url,
            file_name,
            file_size,
            created_at,
            sender_name
          `)
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          id: conversation.id,
          title: conversation.title,
          conversation_type: conversation.conversation_type,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          unread_count: conversation.unread_count || 0,
          last_read_at: conversation.last_read_at,
          tutor: {
            id: tutorId,
            name: tutorName,
            email: tutorEmail,
            profile_image_url: tutorImageUrl
          },
          latest_message: latestMessage ? {
            sender_id: latestMessage.sender_id,
            sender_name: latestMessage.sender_name || 'Unknown',
            message: latestMessage.message,
            message_type: latestMessage.message_type || 'text',
            file_url: latestMessage.file_url,
            file_name: latestMessage.file_name,
            file_size: latestMessage.file_size,
            created_at: latestMessage.created_at
          } : undefined
        }
      })
    )

    console.log('✅ Successfully processed conversations:', processedConversations.length)

    return NextResponse.json({
      success: true,
      conversations: processedConversations
    })

  } catch (error) {
    console.error('Error in student conversations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 