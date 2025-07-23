import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase, getUserFromAuthHeader } from '@/lib/serverSupabaseClient'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const { message, messageType = 'text' } = await request.json()

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    // Get authenticated user using server-side client
    const { user, error: authError } = await getUserFromAuthHeader(authHeader)
    
    if (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed', details: authError },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('No user found in session')
      return NextResponse.json(
        { error: 'No authenticated user found', details: 'User session is missing or invalid' },
        { status: 401 }
      )
    }

    console.log('Sending message to conversation:', conversationId)
    console.log('Message from user:', user.id)

    // Verify the user is a participant in this conversation
    const { data: participant, error: participantError } = await serverSupabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      console.error('User not a participant in conversation:', participantError)
      return NextResponse.json(
        { error: 'Not authorized to send messages to this conversation' },
        { status: 403 }
      )
    }

    // Get user profile for sender name
    const { data: userProfile } = await serverSupabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const senderName = userProfile?.full_name || user.email || 'Unknown User'

    // Insert the message
    const messageData = {
      conversation_id: conversationId,
      sender_id: user.id,
      sender_name: senderName,
      message: message,
      message_type: messageType
    }

    const { data: sentMessage, error: insertError } = await serverSupabase
      .from('general_chat_messages')
      .insert([messageData])
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting message:', insertError)
      return NextResponse.json(
        { error: 'Failed to send message', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('Message sent successfully:', sentMessage.id)

    return NextResponse.json({
      success: true,
      message: sentMessage
    })

  } catch (error) {
    console.error('Error in send message API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    // Get authenticated user using server-side client
    const { user, error: authError } = await getUserFromAuthHeader(authHeader)
    
    if (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed', details: authError },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('No user found in session')
      return NextResponse.json(
        { error: 'No authenticated user found', details: 'User session is missing or invalid' },
        { status: 401 }
      )
    }

    // Verify the user is a participant in this conversation
    const { data: participant, error: participantError } = await serverSupabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      console.error('User not a participant in conversation:', participantError)
      return NextResponse.json(
        { error: 'Not authorized to view messages in this conversation' },
        { status: 403 }
      )
    }

    // Get messages for this conversation
    const { data: messages, error: fetchError } = await serverSupabase
      .from('general_chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (fetchError) {
      console.error('Error fetching messages:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch messages', details: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    })

  } catch (error) {
    console.error('Error in get messages API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 