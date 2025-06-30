import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ========================================
// GET MAZE PATHS
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (id) {
      // Get specific maze path with nodes
      const { data: path, error: pathError } = await supabase
        .from('maze_paths')
        .select('*')
        .eq('id', id)
        .single();

      if (pathError) {
        return NextResponse.json({ error: 'Maze path not found' }, { status: 404 });
      }

      // Get nodes for this path
      const { data: nodes, error: nodesError } = await supabase
        .from('maze_nodes')
        .select(`
          *,
          word_entries (
            id,
            word_text,
            type,
            difficulty_level,
            is_verified
          )
        `)
        .eq('path_id', id)
        .order('position');

      if (nodesError) {
        console.error('Error fetching nodes:', nodesError);
        return NextResponse.json({ error: 'Error fetching maze nodes' }, { status: 500 });
      }

      return NextResponse.json({
        path,
        nodes: nodes || []
      });
    }

    // Get all maze paths
    const { data: paths, error } = await supabase
      .from('maze_paths')
      .select(`
        *,
        maze_nodes (
          id,
          position,
          word_entries (
            id,
            word_text,
            type,
            difficulty_level
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching maze paths:', error);
      return NextResponse.json({ error: 'Error fetching maze paths' }, { status: 500 });
    }

    return NextResponse.json({
      paths: paths || [],
      total: paths?.length || 0
    });

  } catch (error) {
    console.error('Error in GET /api/word-maze/paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ========================================
// CREATE MAZE PATH
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, difficulty_level, tags, word_ids } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Create the maze path
    const { data: path, error: pathError } = await supabase
      .from('maze_paths')
      .insert({
        name,
        description: description || '',
        difficulty_level: difficulty_level || 'intermediate',
        tags: tags || [],
        is_active: true
      })
      .select()
      .single();

    if (pathError) {
      console.error('Error creating maze path:', pathError);
      return NextResponse.json({ error: 'Error creating maze path' }, { status: 500 });
    }

    // Add words as nodes if provided
    if (word_ids && Array.isArray(word_ids) && word_ids.length > 0) {
      const nodes = word_ids.map((wordId: string, index: number) => ({
        path_id: path.id,
        word_id: wordId,
        position: index + 1,
        challenge_type: 'definition'
      }));

      const { error: nodesError } = await supabase
        .from('maze_nodes')
        .insert(nodes);

      if (nodesError) {
        console.error('Error creating maze nodes:', nodesError);
        // Continue anyway - the path was created successfully
      }
    }

    return NextResponse.json({
      message: 'Maze path created successfully',
      path
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/word-maze/paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ========================================
// UPDATE MAZE PATH
// ========================================

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Path ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, difficulty_level, tags, is_active } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (difficulty_level !== undefined) updateData.difficulty_level = difficulty_level;
    if (tags !== undefined) updateData.tags = tags;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('maze_paths')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating maze path:', error);
      return NextResponse.json({ error: 'Error updating maze path' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Maze path updated successfully',
      path: data
    });

  } catch (error) {
    console.error('Error in PUT /api/word-maze/paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ========================================
// DELETE MAZE PATH
// ========================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Path ID is required' }, { status: 400 });
    }

    // Delete associated nodes first
    const { error: nodesError } = await supabase
      .from('maze_nodes')
      .delete()
      .eq('maze_path_id', id);

    if (nodesError) {
      console.error('Error deleting maze nodes:', nodesError);
      return NextResponse.json({ error: 'Error deleting maze nodes' }, { status: 500 });
    }

    // Delete the maze path
    const { error } = await supabase
      .from('maze_paths')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting maze path:', error);
      return NextResponse.json({ error: 'Error deleting maze path' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Maze path deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/word-maze/paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 