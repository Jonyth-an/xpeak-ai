import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, url, tags, fileType, fileSize } = body;

    // Validate required fields
    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    // Update material (RLS will ensure user can only update their own materials)
    const { data: material, error } = await serverSupabase
      .from('materials')
      .update({
        title,
        description: description || null,
        url,
        tags: tags || [],
        file_type: fileType || null,
        file_size: fileSize || null
      })
      .eq('id', id)
      .eq('user_id', user.id) // Extra security check
      .select()
      .single();

    if (error) {
      console.error('Error updating material:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
    }

    return NextResponse.json({ material });
  } catch (error) {
    console.error('Error in PUT /api/materials/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete material (RLS will ensure user can only delete their own materials)
    const { error } = await serverSupabase
      .from('materials')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Extra security check

    if (error) {
      console.error('Error deleting material:', error);
      return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/materials/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 