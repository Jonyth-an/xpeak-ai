import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase, getUserFromAuthHeader } from '@/lib/serverSupabaseClient'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params

    // Get user from auth header
    const authResult = await getUserFromAuthHeader(request.headers.get('authorization'))
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = authResult.user

    console.log('🔍 Marking conversation as read:', conversationId, 'for user:', user.id)

    // Verify the user is a participant in this conversation
    const { data: participant, error: participantError } = await serverSupabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      console.error('User is not a participant in this conversation')
      return NextResponse.json(
        { error: 'Not authorized to access this conversation' },
        { status: 403 }
      )
    }

    // Update the conversation to mark it as read
    const { error: updateError } = await serverSupabase
      .from('conversations')
      .update({
        unread_count: 0,
        last_read_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (updateError) {
      console.error('Error updating conversation:', updateError)
      return NextResponse.json(
        { error: 'Failed to mark conversation as read' },
        { status: 500 }
      )
    }

    console.log('✅ Successfully marked conversation as read:', conversationId)

    return NextResponse.json({
      success: true,
      message: 'Conversation marked as read'
    })

  } catch (error) {
    console.error('Error in mark-read API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 