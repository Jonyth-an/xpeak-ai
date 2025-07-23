import { NextRequest, NextResponse } from 'next/server'
import { getUserFromAuthHeader } from '@/lib/serverSupabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing authentication...')
    
    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    
    // Get authenticated user using server-side client
    const { user, error: authError } = await getUserFromAuthHeader(authHeader)
    
    if (authError) {
      console.error('Auth test - Authentication error:', authError)
      return NextResponse.json({ 
        authenticated: false,
        error: authError,
        code: 'AUTH_ERROR'
      })
    }

    if (!user) {
      console.log('Auth test - No user found')
      return NextResponse.json({ 
        authenticated: false,
        error: 'No user found'
      })
    }

    console.log('Auth test - User authenticated:', user.id, user.email)
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      }
    })
  } catch (error) {
    console.error('Auth test - Unexpected error:', error)
    return NextResponse.json({ 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 