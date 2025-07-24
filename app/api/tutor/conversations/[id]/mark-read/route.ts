import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/serverSupabaseClient'
import { getUserFromAuthHeader } from '@/lib/serverSupabaseClient'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get conversation ID from params
    const { id: conversationId } = await params

    // Verify the tutor is a participant in this conversation
    const { data: participant, error: participantError } = await serverSupabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .eq('role', 'tutor')
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Forbidden - Not a participant in this conversation' },
        { status: 403 }
      )
    }

    // Mark conversation as read by resetting unread count and updating last_read_at
    const { error: updateError } = await serverSupabase
      .from('conversations')
      .update({
        unread_count: 0,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (updateError) {
      console.error('Error marking conversation as read:', updateError)
      return NextResponse.json(
        { error: 'Failed to mark conversation as read', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation marked as read'
    })

  } catch (error) {
    console.error('Error in mark conversation as read API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 