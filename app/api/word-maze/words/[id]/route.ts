import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Authentication helper function
async function getAuthenticatedUser(request: NextRequest) {
  // Check for test mode header
  const bypassAuth = request.headers.get('X-Bypass-Auth') === 'true';
  
  if (bypassAuth) {
    // Test mode: use a hardcoded test user ID (proper UUID format)
    const user = { id: '00000000-0000-0000-0000-000000000001' };
    console.log('Test mode enabled - using test user ID:', user.id);
    return user;
  }

  // Try to get token from Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Use the token to get user session
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error('Error getting user from token:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }

  // No valid authentication found
  return null;
}

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
    const user = await getAuthenticatedUser(request);

    if (!user) {
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