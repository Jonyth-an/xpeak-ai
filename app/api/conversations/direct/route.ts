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

    console.log('🔍 Looking for direct conversation between student:', user.id, 'and tutor user_id:', tutorProfile.user_id)

    // Prevent users from messaging themselves
    if (user.id === tutorProfile.user_id) {
      console.error('❌ User attempting to message themselves:', user.id)
      return NextResponse.json(
        { 
          error: 'Cannot message yourself', 
          details: 'You cannot start a conversation with your own tutor profile',
          code: 'SELF_MESSAGE_ATTEMPT'
        },
        { status: 400 }
      )
    }

    // First, check if a direct conversation already exists using the chat service
    console.log('🔍 Checking for existing conversation...')
    const existingConversation = await chatService.findExistingConversation(
      user.id, 
      tutorProfile.user_id, 
      'student_tutor'
    )

    if (existingConversation) {
      console.log('✅ Found existing conversation:', existingConversation.id)
      return NextResponse.json({ 
        conversation: existingConversation,
        isNew: false
      })
    }

    console.log('❌ No existing conversation found, creating new one...')

    const conversationTitle = tutorProfile.display_name 
      ? `Chat with ${tutorProfile.display_name}`
      : `Chat with Tutor`

    console.log('🔄 Creating new direct conversation with title:', conversationTitle)
    console.log('🔄 Tutor user_id:', tutorProfile.user_id)

    // Create new conversation using the tutor's user_id, not their profile ID
    try {
      console.log('🔄 Calling chatService.createConversationWithUser...')
      console.log('🔄 Student ID:', user.id)
      console.log('🔄 Tutor user_id:', tutorProfile.user_id)
      console.log('🔄 Title:', conversationTitle)
      
      // Validate that we have all required data
      if (!tutorProfile.user_id) {
        throw new Error('Tutor user_id is missing')
      }
      
      const newConversation = await chatService.createConversationWithUser({
        title: conversationTitle,
        conversation_type: 'student_tutor',
        participants: [tutorProfile.user_id], // Use the tutor's user_id, not their profile ID
        participant_roles: ['tutor'],
        userId: user.id
      }, serverSupabase)

      if (!newConversation) {
        console.error('❌ Failed to create conversation - chatService returned null')
        return NextResponse.json(
          { error: 'Failed to create conversation', details: 'Chat service returned null' },
          { status: 500 }
        )
      }

      console.log('✅ Conversation created successfully:', newConversation.id)
      return NextResponse.json({ 
        conversation: newConversation,
        isNew: true
      })
    } catch (error) {
      console.error('❌ Error creating conversation:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      
      // Handle specific error cases
      if (error instanceof Error) {
        console.log('❌ Error message:', error.message)
        if (error.message.includes('Student and tutor must be different users') || 
            error.message.includes('Cannot create conversation: Student and tutor must be different users')) {
          console.log('❌ Self-messaging detected')
          return NextResponse.json(
            { 
              error: 'Cannot message yourself', 
              details: 'You cannot start a conversation with your own tutor profile',
              code: 'SELF_MESSAGE_ATTEMPT'
            },
            { status: 400 }
          )
        }
        
        if (error.message.includes('Conversation already exists')) {
          // If conversation already exists, try to find it
          console.log('🔄 Conversation already exists, attempting to find it...')
          const existingConversation = await chatService.findExistingConversation(
            user.id, 
            tutorProfile.user_id, 
            'student_tutor'
          )
          
          if (existingConversation) {
            console.log('✅ Found existing conversation:', existingConversation.id)
            return NextResponse.json({ 
              conversation: existingConversation,
              isNew: false
            })
          }
        }
        
        console.log('❌ Generic error, returning 500')
        return NextResponse.json(
          { 
            error: 'Failed to create conversation', 
            details: error.message || 'Unknown error occurred'
          },
          { status: 500 }
        )
      }
      
      // Handle Supabase PostgrestError
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message || 'Unknown error'
        return NextResponse.json(
          { 
            error: 'Failed to create conversation', 
            details: errorMessage
          },
          { status: 500 }
        )
      }
      
      console.log('❌ Unknown error type')
      return NextResponse.json(
        { 
          error: 'Failed to create conversation', 
          details: error ? String(error) : 'Unknown error occurred' 
        },
        { status: 500 }
      )
    }
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