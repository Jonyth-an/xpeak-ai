import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/serverSupabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing server-side Supabase client...')
    console.log('Environment variables:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Test a simple query to verify the client works
    const { data, error } = await serverSupabase
      .from('tutor_profiles')
      .select('id, display_name')
      .limit(1)
    
    if (error) {
      console.error('Server client test error:', error)
      return NextResponse.json({ 
        success: false,
        error: error.message,
        details: 'Server-side client query failed'
      })
    }

    console.log('Server client test successful:', data?.length, 'records')
    return NextResponse.json({ 
      success: true,
      data: data,
      message: 'Server-side client is working correctly'
    })
  } catch (error) {
    console.error('Server client test unexpected error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Unexpected error in server client test'
    })
  }
} 