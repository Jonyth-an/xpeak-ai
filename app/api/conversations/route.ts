import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { chatService } from '@/lib/services/chatService'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversations for the user
    const conversations = await chatService.getConversations(user.id)
    
    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/conversations - Starting conversation creation')
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Parse request body
    const body = await request.json()
    console.log('Request body:', body)
    
    const { title, conversation_type, participants, participant_roles } = body

    // Validate required fields
    if (!conversation_type) {
      console.error('Missing conversation_type')
      return NextResponse.json(
        { error: 'Conversation type is required' },
        { status: 400 }
      )
    }

    console.log('Creating conversation with data:', {
      title,
      conversation_type,
      participants: participants || [],
      participant_roles: participant_roles || []
    })

    // Create conversation
    const conversation = await chatService.createConversation({
      title,
      conversation_type,
      participants: participants || [],
      participant_roles: participant_roles || []
    })

    if (!conversation) {
      console.error('Failed to create conversation - chatService returned null')
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      )
    }

    console.log('Conversation created successfully:', conversation)
    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
} 