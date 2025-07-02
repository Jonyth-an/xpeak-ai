import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET() {
  try {
    // Test basic Supabase connection
    const { data, error } = await supabase
      .from('word_entries')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database connection failed', details: error }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'API is working',
      database: 'connected',
      wordCount: data || 0
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 