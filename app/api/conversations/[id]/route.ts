import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase, getUserFromAuthHeader } from '@/lib/serverSupabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id

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
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
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
      return NextResponse.json(
        { error: 'Not authorized to access this conversation' },
        { status: 403 }
      )
    }

    // Get conversation details
    const { data: conversation, error: conversationError } = await serverSupabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Get all participants with their profile information
    const { data: participants, error: participantsError } = await serverSupabase
      .from('conversation_participants')
      .select(`
        user_id,
        role,
        joined_at
      `)
      .eq('conversation_id', conversationId)

    if (participantsError) {
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      )
    }

    // Get profile information for each participant
    const participantsWithProfiles = await Promise.all(
      participants.map(async (participant) => {
        const { data: profile } = await serverSupabase
          .from('profiles')
          .select('id, full_name, email, profile_image_url')
          .eq('id', participant.user_id)
          .single()

        return {
          ...participant,
          user: profile || null
        }
      })
    )

    const conversationWithParticipants = {
      ...conversation,
      participants: participantsWithProfiles
    }

    return NextResponse.json({
      success: true,
      conversation: conversationWithParticipants
    })

  } catch (error) {
    console.error('Error in conversation API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 