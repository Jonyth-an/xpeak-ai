import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // For video streaming, we'll check if the user has a valid session
    // instead of requiring the Authorization header (which browsers don't send for video requests)
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication token required' }, { status: 401 });
    }

    // Verify the token with Supabase
    const supabase = serverSupabase;
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Check if user has admin role (you might need to adjust this based on your role system)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const videoUrl = searchParams.get('url');
    
    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    console.log('Original video URL:', videoUrl);
    
    // Try to generate a fresh signed URL if this is a Supabase storage URL
    let fetchUrl = videoUrl;
    if (videoUrl.includes('supabase') && videoUrl.includes('storage')) {
      try {
        let bucket = '';
        let filePath = '';
        
        if (videoUrl.includes('/object/sign/')) {
          // Handle signed URLs: /storage/v1/object/sign/bucket/path
          const urlParts = videoUrl.split('/');
          const signIndex = urlParts.findIndex(part => part === 'sign');
          if (signIndex !== -1) {
            const pathParts = urlParts.slice(signIndex + 1);
            bucket = pathParts[0];
            filePath = pathParts.slice(1).join('/').split('?')[0]; // Remove query params
          }
        } else if (videoUrl.includes('/object/')) {
          // Handle regular object URLs: /storage/v1/object/bucket/path
          const urlParts = videoUrl.split('/');
          const objectIndex = urlParts.findIndex(part => part === 'object');
          if (objectIndex !== -1) {
            const pathParts = urlParts.slice(objectIndex + 1);
            bucket = pathParts[0];
            filePath = pathParts.slice(1).join('/').split('?')[0]; // Remove query params
          }
        }
        
        if (bucket && filePath) {
          console.log('Extracting from Supabase URL - Bucket:', bucket, 'File:', filePath);
          
          // Generate fresh signed URL
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, 3600);
          
          if (!error && data?.signedUrl) {
            fetchUrl = data.signedUrl;
            console.log('Generated fresh signed URL');
          } else {
            console.error('Failed to generate signed URL:', error);
          }
        } else {
          console.log('Could not extract bucket/file from URL');
        }
      } catch (error) {
        console.error('Error processing Supabase URL:', error);
      }
    }
    
    console.log('Fetching video from URL:', fetchUrl);
    
    // Fetch the video from the URL (original or fresh signed)
    const response = await fetch(fetchUrl);
    
    console.log('Video fetch response status:', response.status);
    
    if (!response.ok) {
      console.error('Video fetch failed:', response.status, response.statusText);
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Video fetch error details:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch video', 
        details: `${response.status}: ${response.statusText}`,
        originalUrl: videoUrl,
        fetchUrl: fetchUrl
      }, { status: response.status });
    }

    // Get the video data
    const videoData = await response.arrayBuffer();
    
    // Return the video with proper headers
    return new NextResponse(videoData, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'video/mp4',
        'Content-Length': videoData.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    });

  } catch (error) {
    console.error('Error in video proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 