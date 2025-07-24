import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/serverSupabaseClient'
import { getUserFromAuthHeader } from '@/lib/serverSupabaseClient'

export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid authorization header' },
        { status: 401 }
      )
    }

    const { user, error: authError } = await getUserFromAuthHeader(authHeader)
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Verify user is a tutor
    const { data: tutorProfile, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (tutorError || !tutorProfile) {
      return NextResponse.json(
        { error: 'Forbidden - User is not an active tutor' },
        { status: 403 }
      )
    }

    // Get all conversations where the tutor is a participant
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
      .eq('conversation_type', 'student_tutor')
      .order('updated_at', { ascending: false })

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      return NextResponse.json(
        { error: 'Failed to fetch conversations', details: conversationsError.message },
        { status: 500 }
      )
    }

    // Process conversations to get student info and latest message
    const processedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Get all participants for this conversation
        const { data: participants, error: participantsError } = await serverSupabase
          .from('conversation_participants')
          .select(`
            user_id,
            role
          `)
          .eq('conversation_id', conversation.id)

        if (participantsError) {
          console.error('Error fetching participants:', participantsError)
          return null
        }

        // Get the student participant (not the tutor)
        const studentParticipant = participants?.find((p: any) => p.role === 'student')

        // Get the latest message for preview
        const { data: latestMessage, error: messageError } = await serverSupabase
          .from('general_chat_messages')
          .select(`
            id,
            message,
            created_at,
            sender_id
          `)
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get sender profile for latest message
        let senderName = 'Unknown'
        if (latestMessage) {
          const { data: senderProfile } = await serverSupabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', latestMessage.sender_id)
            .single()
          
          senderName = senderProfile?.full_name || senderProfile?.email || 'Unknown'
        }

        // Get student profile image if available
        let studentProfileImage = null
        if (studentParticipant) {
          const { data: studentProfile } = await serverSupabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', studentParticipant.user_id)
            .single()
          studentProfileImage = studentProfile?.avatar_url
          console.log('DEBUG studentProfileImage:', studentProfileImage, 'for user_id:', studentParticipant.user_id)
        }

        // Get student profile data separately
        let studentName = 'Student'
        let studentEmail = ''
        if (studentParticipant) {
          const { data: studentProfile } = await serverSupabase
            .from('profiles')
            .select('full_name')
            .eq('id', studentParticipant.user_id)
            .single()
          studentName = studentProfile?.full_name || 'Student'
          console.log('DEBUG studentProfile:', studentProfile, 'for user_id:', studentParticipant.user_id)
        }
        
        return {
          id: conversation.id,
          title: conversation.title || `Chat with ${studentName}`,
          conversation_type: conversation.conversation_type,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          unread_count: conversation.unread_count || 0,
          last_read_at: conversation.last_read_at,
          student: {
            id: studentParticipant?.user_id,
            name: studentName,
            profile_image_url: studentProfileImage
          },
          latest_message: latestMessage ? {
            id: latestMessage.id,
            message: latestMessage.message,
            created_at: latestMessage.created_at,
            sender_name: senderName
          } : null
        }
      })
    )

    // Filter out null values
    const validConversations = processedConversations.filter(conv => conv !== null)

    return NextResponse.json({
      success: true,
      conversations: validConversations
    })

  } catch (error) {
    console.error('Error in tutor conversations API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 