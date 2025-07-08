import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's theme preferences from profiles table
    const { data: profileData, error: profileError } = await serverSupabase
      .from('profiles')
      .select('theme_preference, custom_theme_data, theme_updated_at')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching theme preferences:', profileError);
      return NextResponse.json({ error: 'Failed to fetch theme preferences' }, { status: 500 });
    }

    // If no profile exists, create one with default values
    if (!profileData) {
      const { data: newProfile, error: createError } = await serverSupabase
        .from('profiles')
        .insert({
          id: user.id,
          theme_preference: 'system',
          custom_theme_data: null,
          theme_updated_at: new Date().toISOString()
        })
        .select('theme_preference, custom_theme_data, theme_updated_at')
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }

      return NextResponse.json({
        theme_preference: newProfile.theme_preference || 'system',
        custom_theme_data: newProfile.custom_theme_data || null,
        theme_updated_at: newProfile.theme_updated_at || null
      });
    }

    return NextResponse.json({
      theme_preference: profileData?.theme_preference || 'system',
      custom_theme_data: profileData?.custom_theme_data || null,
      theme_updated_at: profileData?.theme_updated_at || null
    });

  } catch (error) {
    console.error('Theme GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get current user
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { theme_preference, custom_theme_data } = body;

    // Validate theme preference
    const validThemes = ['light', 'dark', 'system'];
    if (theme_preference && !validThemes.includes(theme_preference) && !theme_preference.startsWith('custom-')) {
      return NextResponse.json({ error: 'Invalid theme preference' }, { status: 400 });
    }

    // Update user's theme preferences in profiles table
    const { error: updateError } = await serverSupabase
      .from('profiles')
      .upsert({
        id: user.id,
        theme_preference: theme_preference || 'system',
        custom_theme_data: custom_theme_data || null,
        theme_updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (updateError) {
      console.error('Error updating theme preferences:', updateError);
      return NextResponse.json({ error: 'Failed to update theme preferences' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Theme preferences updated successfully'
    });

  } catch (error) {
    console.error('Theme PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 