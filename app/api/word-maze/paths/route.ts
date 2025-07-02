import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serverSupabase } from '@/lib/serverSupabaseClient';

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
      const { data: { user }, error } = await serverSupabase.auth.getUser(token);
      
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

// ========================================
// GET - GET MAZE PATHS
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get the current user
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (pathId) {
      // Get specific path with nodes
      const { data: path, error: pathError } = await supabase
        .from('maze_paths')
        .select('*')
        .eq('id', pathId)
        .single();

      if (pathError) {
        console.error('Error fetching path:', pathError);
        return NextResponse.json(
          { error: 'Path not found' },
          { status: 404 }
        );
      }

      // Get nodes for this path
      const { data: nodes, error: nodesError } = await supabase
        .from('maze_nodes')
        .select(`
          *,
          word_entries (
            id,
            word,
            definition,
            example,
            difficulty_level,
            tags
          )
        `)
        .eq('path_id', pathId)
        .order('position', { ascending: true });

      if (nodesError) {
        console.error('Error fetching path nodes:', nodesError);
        return NextResponse.json(
          { error: 'Failed to fetch path nodes' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        path,
        nodes: nodes || []
      });

    } else {
      // Get all paths
      let query = supabase
        .from('maze_paths')
        .select(`
          *,
          maze_nodes (
            id,
            position,
            challenge_type
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // If userId provided, filter by user's paths
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: paths, error } = await query;

      if (error) {
        console.error('Error fetching maze paths:', error);
        return NextResponse.json(
          { error: 'Failed to fetch maze paths' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        paths: paths || []
      });
    }

  } catch (error) {
    console.error('Error in GET /api/word-maze/paths:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ========================================
// POST - CREATE NEW MAZE PATH
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, path_type, difficulty_level, estimated_duration, metadata, wordIds } = body;

    // Get the current user
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!name || !path_type) {
      return NextResponse.json(
        { error: 'Name and path_type are required' },
        { status: 400 }
      );
    }

    // Create the maze path
    const { data: path, error: pathError } = await supabase
      .from('maze_paths')
      .insert({
        name,
        description: description || '',
        path_type,
        difficulty_level: difficulty_level || 'beginner',
        estimated_duration: estimated_duration || 30,
        is_active: true,
        user_id: user.id,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (pathError) {
      console.error('Error creating maze path:', pathError);
      return NextResponse.json(
        { error: 'Failed to create maze path' },
        { status: 500 }
      );
    }

    // Add word nodes if wordIds provided
    if (wordIds && Array.isArray(wordIds) && wordIds.length > 0) {
      const nodes = wordIds.map((wordId: string, index: number) => ({
        path_id: path.id,
        word_id: wordId,
        position: index + 1,
        challenge_type: 'definition',
        unlock_condition: {},
        created_at: new Date().toISOString()
      }));

      const { error: nodesError } = await supabase
        .from('maze_nodes')
        .insert(nodes);

      if (nodesError) {
        console.error('Error creating maze nodes:', nodesError);
        // Don't fail the entire request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Maze path created successfully',
      path
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/word-maze/paths:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ========================================
// PUT - UPDATE MAZE PATH
// ========================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, path_type, difficulty_level, estimated_duration, metadata, is_active } = body;

    // Get the current user
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Path ID is required' },
        { status: 400 }
      );
    }

    // Update the maze path
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (path_type !== undefined) updateData.path_type = path_type;
    if (difficulty_level !== undefined) updateData.difficulty_level = difficulty_level;
    if (estimated_duration !== undefined) updateData.estimated_duration = estimated_duration;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: path, error } = await supabase
      .from('maze_paths')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns the path
      .select()
      .single();

    if (error) {
      console.error('Error updating maze path:', error);
      return NextResponse.json(
        { error: 'Failed to update maze path' },
        { status: 500 }
      );
    }

    if (!path) {
      return NextResponse.json(
        { error: 'Path not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Maze path updated successfully',
      path
    });

  } catch (error) {
    console.error('Error in PUT /api/word-maze/paths:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE - DELETE MAZE PATH
// ========================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathId = searchParams.get('id');

    // Get the current user
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!pathId) {
      return NextResponse.json(
        { error: 'Path ID is required' },
        { status: 400 }
      );
    }

    // Soft delete the maze path
    const { error } = await supabase
      .from('maze_paths')
      .update({ is_active: false })
      .eq('id', pathId)
      .eq('user_id', user.id); // Ensure user owns the path

    if (error) {
      console.error('Error deleting maze path:', error);
      return NextResponse.json(
        { error: 'Failed to delete maze path' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Maze path deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/word-maze/paths:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 