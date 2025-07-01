import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: wordId } = await params;

    if (!wordId) {
      return NextResponse.json(
        { error: 'Word ID is required' },
        { status: 400 }
      );
    }

    // Get the current user
    const cookieStore = await cookies();
    const supabaseAuth = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabaseAuth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove the word from the user's personal collection (soft delete)
    const { error: deleteError } = await supabase
      .from('user_word_collections')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('word_id', wordId);

    if (deleteError) {
      console.error('Error removing word from user collection:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove word from your collection' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Word removed from your collection successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in DELETE /api/word-maze/words/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 