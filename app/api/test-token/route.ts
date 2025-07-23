import { NextRequest, NextResponse } from 'next/server'
import { validateUserToken } from '@/lib/serverSupabaseClient'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing token validation...')
    
    const body = await request.json()
    const { token } = body
    
    if (!token) {
      return NextResponse.json({ 
        success: false,
        error: 'No token provided'
      })
    }

    console.log('Token provided:', token.substring(0, 20) + '...')
    
    const { user, error } = await validateUserToken(token)
    
    if (error) {
      console.error('Token validation failed:', error)
      return NextResponse.json({ 
        success: false,
        error: (error as any)?.message || 'Token validation failed',
        details: error
      })
    }

    if (!user) {
      console.log('No user found for token')
      return NextResponse.json({ 
        success: false,
        error: 'No user found for token'
      })
    }

    console.log('Token validation successful for user:', user.email)
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at
      },
      message: 'Token is valid'
    })
  } catch (error) {
    console.error('Token test unexpected error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Unexpected error in token test'
    })
  }
} 