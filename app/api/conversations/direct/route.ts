import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase, getUserFromAuthHeader } from '@/lib/serverSupabaseClient'
import { chatService } from '@/lib/services/chatService'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/conversations/direct - Starting direct conversation lookup/creation')
    
    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    console.log('Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'none')
    
    // Get authenticated user using server-side client
    const { user, error: authError } = await getUserFromAuthHeader(authHeader)
    
    if (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: authError,
        code: 'AUTH_ERROR'
      }, { status: 401 })
    }

    if (!user) {
      console.error('No user found in session')
      return NextResponse.json({ 
        error: 'No authenticated user found',
        details: 'User session is missing or invalid'
      }, { status: 401 })
    }

    console.log('User authenticated:', user.id, user.email)

    // Parse request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const { tutorId } = body

    // Validate required fields
    if (!tutorId) {
      console.error('Missing tutorId')
      return NextResponse.json(
        { error: 'Tutor ID is required' },
        { status: 400 }
      )
    }

    // Get tutor profile first to get their user_id
    const { data: tutorProfile, error: tutorError } = await serverSupabase
      .from('tutor_profiles')
      .select('display_name, user_id')
      .eq('id', tutorId)
      .single()

    if (tutorError) {
      console.error('Error fetching tutor profile:', tutorError)
      return NextResponse.json(
        { error: 'Tutor not found', details: tutorError.message },
        { status: 404 }
      )
    }

    if (!tutorProfile?.user_id) {
      console.error('Tutor profile found but user_id is missing')
      return NextResponse.json(
        { error: 'Tutor profile is invalid', details: 'Tutor user_id is missing' },
        { status: 400 }
      )
    }

    console.log('Looking for direct conversation between student:', user.id, 'and tutor user_id:', tutorProfile.user_id)

    // First, check if a direct conversation already exists
    const { data: existingConversations, error: fetchError } = await serverSupabase
      .from('conversations')
      .select(`
        id,
        title,
        conversation_type,
        created_at,
        participants:conversation_participants(
          user_id,
          role
        )
      `)
      .eq('conversation_type', 'student_tutor')
      .eq('conversation_participants.user_id', user.id)

    if (fetchError) {
      console.error('Error fetching existing conversations:', fetchError)
      return NextResponse.json(
        { error: 'Failed to check existing conversations', details: fetchError.message },
        { status: 500 }
      )
    }

    // Find if there's already a conversation with this tutor (using their user_id)
    const existingConversation = existingConversations?.find(conv => 
      conv.participants?.some(p => p.user_id === tutorProfile.user_id)
    )

    if (existingConversation) {
      console.log('Found existing conversation:', existingConversation.id)
      return NextResponse.json({ 
        conversation: existingConversation,
        isNew: false
      })
    }

    const conversationTitle = tutorProfile.display_name 
      ? `Chat with ${tutorProfile.display_name}`
      : `Chat with Tutor`

    console.log('Creating new direct conversation with title:', conversationTitle)
    console.log('Tutor user_id:', tutorProfile.user_id)

    // Create new conversation using the tutor's user_id, not their profile ID
    const newConversation = await chatService.createConversationWithUser({
      title: conversationTitle,
      conversation_type: 'student_tutor',
      participants: [tutorProfile.user_id], // Use the tutor's user_id, not their profile ID
      participant_roles: ['tutor'],
      userId: user.id
    }, serverSupabase)

    if (!newConversation) {
      console.error('Failed to create conversation - chatService returned null')
      return NextResponse.json(
        { error: 'Failed to create conversation', details: 'Chat service returned null' },
        { status: 500 }
      )
    }

    console.log('Direct conversation created successfully:', newConversation)
    return NextResponse.json({ 
      conversation: newConversation,
      isNew: true
    })
  } catch (error) {
    console.error('Error in direct conversation API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create or find direct conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 