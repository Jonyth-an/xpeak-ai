import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // Build the query for tutor_profiles
    let query = serverSupabase
      .from('tutor_profiles')
      .select(`
        id,
        display_name,
        bio,
        timezone,
        languages_taught,
        specializations,
        profile_image_url,
        is_active,
        created_at,
        updated_at
      `)
      .eq('is_active', true);

    // Add search filter if provided
    if (search.trim()) {
      // Search in name, bio, and languages
      query = query.or(`
        display_name.ilike.%${search}%,
        bio.ilike.%${search}%,
        languages_taught::text.ilike.%${search}%
      `);
    }

    // Get total count for pagination
    const { count } = await serverSupabase
      .from('tutor_profiles')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    // Get paginated results
    const { data: tutors, error } = await query
      .order('display_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching tutors:', error);
      return NextResponse.json({ error: 'Failed to fetch tutors' }, { status: 500 });
    }

    // Get availability data for each tutor
    const tutorsWithAvailability = await Promise.all(
      tutors.map(async (tutor) => {
        // Get next 3 available slots for this tutor
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const { data: availability } = await serverSupabase
          .from('tutor_availability')
          .select('*')
          .eq('tutor_id', tutor.id)
          .gte('specific_date', today)
          .lte('specific_date', nextWeek.toISOString().split('T')[0])
          .order('specific_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(3);

        // Format availability slots
        const availableSlots = availability?.map(slot => {
          const date = new Date(slot.specific_date);
          const time = slot.start_time;
          return {
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            time: time,
            fullDate: slot.specific_date,
            fullTime: `${slot.specific_date}T${slot.start_time}`
          };
        }) || [];

        // Get country from timezone (simplified mapping)
        const getCountryFromTimezone = (timezone: string) => {
          const countryMap: Record<string, string> = {
            'America/New_York': 'United States',
            'America/Los_Angeles': 'United States',
            'America/Chicago': 'United States',
            'America/Denver': 'United States',
            'Europe/London': 'United Kingdom',
            'Europe/Paris': 'France',
            'Europe/Berlin': 'Germany',
            'Asia/Tokyo': 'Japan',
            'Asia/Shanghai': 'China',
            'Australia/Sydney': 'Australia'
          };
          return countryMap[timezone] || 'Unknown';
        };

        // Get flag emoji for country
        const getCountryFlag = (country: string) => {
          const flags: Record<string, string> = {
            'United States': '🇺🇸',
            'United Kingdom': '🇬🇧',
            'Canada': '🇨🇦',
            'Australia': '🇦🇺',
            'France': '🇫🇷',
            'Germany': '🇩🇪',
            'Japan': '🇯🇵',
            'China': '🇨🇳',
            'Unknown': '🌍'
          };
          return flags[country] || '🌍';
        };

        const country = getCountryFromTimezone(tutor.timezone);
        const flag = getCountryFlag(country);

        // Get accent from country/timezone
        const getAccent = (country: string) => {
          const accents: Record<string, string> = {
            'United States': 'American',
            'United Kingdom': 'British',
            'Canada': 'Canadian',
            'Australia': 'Australian',
            'France': 'French',
            'Germany': 'German',
            'Japan': 'Japanese',
            'China': 'Chinese'
          };
          return accents[country] || 'Standard';
        };

        return {
          id: tutor.id,
          name: tutor.display_name,
          country,
          flag,
          accent: getAccent(country),
          rating: 4.8 + Math.random() * 0.2, // Placeholder rating between 4.8-5.0
          reviewCount: Math.floor(Math.random() * 50) + 10, // Placeholder review count
          bio: tutor.bio || 'No bio provided yet.',
          languages: tutor.languages_taught || [],
          specializations: tutor.specializations || [],
          profileImageUrl: tutor.profile_image_url,
          availableSlots,
          timezone: tutor.timezone
        };
      })
    );

    const totalCount = count || 0;
    
    return NextResponse.json({
      tutors: tutorsWithAvailability,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error in tutors API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 