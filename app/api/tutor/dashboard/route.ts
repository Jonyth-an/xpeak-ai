import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tutor profile
    const { data: tutorProfile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select('id, display_name, timezone')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const tutorId = tutorProfile.id;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format

    // Parallel queries for dashboard data
    const [
      todayLessonsResult,
      monthlyLessonsResult,
      activeStudentsResult,
      monthlyEarningsResult,
      nextLessonResult,
      todayScheduleResult,
      performanceResult
    ] = await Promise.all([
      // Today's lessons count
      serverSupabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('tutor_id', tutorId)
        .gte('scheduled_start', `${today}T00:00:00`)
        .lt('scheduled_start', `${today}T23:59:59`)
        .in('status', ['confirmed', 'completed']),

      // This month's lessons count
      serverSupabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('tutor_id', tutorId)
        .gte('scheduled_start', `${currentMonth}-01T00:00:00`)
        .lt('scheduled_start', `${currentMonth}-31T23:59:59`)
        .in('status', ['confirmed', 'completed']),

      // Active students count (students with lessons in last 30 days)
      serverSupabase
        .from('lessons')
        .select('student_id', { count: 'exact' })
        .eq('tutor_id', tutorId)
        .gte('scheduled_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .in('status', ['confirmed', 'completed']),

      // Monthly earnings
      serverSupabase
        .from('tutor_earnings')
        .select('amount')
        .eq('tutor_id', tutorId)
        .gte('earned_at', `${currentMonth}-01T00:00:00`)
        .lt('earned_at', `${currentMonth}-31T23:59:59`),

      // Next upcoming lesson
      serverSupabase
        .from('lessons')
        .select(`
          id,
          scheduled_start,
          scheduled_end,
          lesson_type,
          duration_minutes,
          status,
          student_id,
          student_timezone,
          lesson_notes
        `)
        .eq('tutor_id', tutorId)
        .eq('status', 'confirmed')
        .gte('scheduled_start', now.toISOString())
        .order('scheduled_start', { ascending: true })
        .limit(1)
        .single(),

      // Today's schedule
      serverSupabase
        .from('lessons')
        .select(`
          id,
          scheduled_start,
          scheduled_end,
          lesson_type,
          duration_minutes,
          status,
          student_id,
          student_timezone,
          reschedule_requested_by,
          reschedule_requested_at
        `)
        .eq('tutor_id', tutorId)
        .gte('scheduled_start', `${today}T00:00:00`)
        .lt('scheduled_start', `${today}T23:59:59`)
        .order('scheduled_start', { ascending: true }),

      // Performance metrics
      serverSupabase
        .from('tutor_performance')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('month_year', currentMonth)
        .single()
    ]);

    // Get student details for lessons
    const studentIds = new Set();
    if (nextLessonResult.data) {
      studentIds.add(nextLessonResult.data.student_id);
    }
    if (todayScheduleResult.data) {
      todayScheduleResult.data.forEach(lesson => studentIds.add(lesson.student_id));
    }

    let studentDetails: Record<string, any> = {};
    if (studentIds.size > 0) {
      const { data: students } = await serverSupabase.auth.admin.listUsers();
      
      if (students?.users) {
        const studentIdsArray = Array.from(studentIds);
        studentDetails = students.users
          .filter(user => studentIdsArray.includes(user.id))
          .reduce((acc: Record<string, any>, user: any) => {
            acc[user.id] = {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown Student',
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
              country: user.user_metadata?.country || 'Unknown'
            };
            return acc;
          }, {});
      }
    }

    // Calculate metrics
    const todayLessonsCount = todayLessonsResult.count || 0;
    const monthlyLessonsCount = monthlyLessonsResult.count || 0;
    
    // Calculate unique active students
    const uniqueStudents = new Set(
      (activeStudentsResult.data || []).map(lesson => lesson.student_id)
    );
    const activeStudentsCount = uniqueStudents.size;

    // Calculate monthly earnings
    const monthlyEarnings = (monthlyEarningsResult.data || [])
      .reduce((total, earning) => total + parseFloat(earning.amount), 0);

    // Process next lesson
    let nextLesson = null;
    if (nextLessonResult.data) {
      const lesson = nextLessonResult.data;
      const student = studentDetails[lesson.student_id];
      const scheduledStart = new Date(lesson.scheduled_start);
      const minutesUntil = Math.max(0, Math.floor((scheduledStart.getTime() - now.getTime()) / (1000 * 60)));
      
      nextLesson = {
        id: lesson.id,
        student_name: student?.full_name || 'Student',
        student_country: student?.country || 'Unknown',
        student_avatar: student?.avatar_url,
        lesson_type: lesson.lesson_type,
        duration: lesson.duration_minutes,
        scheduled_start: lesson.scheduled_start,
        scheduled_end: lesson.scheduled_end,
        minutes_until: minutesUntil,
        can_join: minutesUntil <= 60, // Allow joining 60 minutes before for testing
        status: lesson.status
      };
    }

    // Process today's schedule
    const todaySchedule = (todayScheduleResult.data || []).map(lesson => {
      const student = studentDetails[lesson.student_id];
      const scheduledStart = new Date(lesson.scheduled_start);
      
      return {
        id: lesson.id,
        time: scheduledStart.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        student_name: student?.full_name || 'Student',
        student_country: student?.country || 'Unknown',
        student_avatar: student?.avatar_url,
        lesson_type: lesson.lesson_type,
        duration: lesson.duration_minutes,
        status: lesson.status,
        has_reschedule_request: lesson.reschedule_requested_by === 'student',
        reschedule_requested_at: lesson.reschedule_requested_at,
        scheduled_start: lesson.scheduled_start
      };
    });

    // Process performance data
    const performance = performanceResult.data || {
      average_rating: 0,
      attendance_rate: 0,
      bonus_tier: 'base',
      top_strengths: []
    };

    // Calculate performance metrics if no stored data
    if (!performanceResult.data) {
      // Get recent feedback for rating
      const { data: recentFeedback } = await serverSupabase
        .from('lesson_feedback')
        .select('rating')
        .eq('tutor_id', tutorId)
        .eq('is_visible_to_tutor', true)
        .gte('created_at', `${currentMonth}-01T00:00:00`)
        .lt('created_at', `${currentMonth}-31T23:59:59`);

      if (recentFeedback && recentFeedback.length > 0) {
        const avgRating = recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length;
        performance.average_rating = Math.round(avgRating * 10) / 10;
      }

      // Calculate attendance rate
      const { data: monthlyLessons } = await serverSupabase
        .from('lessons')
        .select('status')
        .eq('tutor_id', tutorId)
        .gte('scheduled_start', `${currentMonth}-01T00:00:00`)
        .lt('scheduled_start', `${currentMonth}-31T23:59:59`);

      if (monthlyLessons && monthlyLessons.length > 0) {
        const completedLessons = monthlyLessons.filter(l => l.status === 'completed').length;
        performance.attendance_rate = Math.round((completedLessons / monthlyLessons.length) * 100);
      }

      // Determine bonus tier based on performance
      if (performance.average_rating >= 4.8 && performance.attendance_rate >= 95) {
        performance.bonus_tier = 'tier2';
      } else if (performance.average_rating >= 4.5 && performance.attendance_rate >= 90) {
        performance.bonus_tier = 'tier1';
      } else {
        performance.bonus_tier = 'base';
      }

      // Mock top strengths (in production, this would be AI-generated)
      performance.top_strengths = [
        'Clear Explanation',
        'Patient Teaching',
        'Engaging Lessons'
      ];
    }

    // Build response in dashboard's expected format
    return NextResponse.json({
      tutor: {
        id: tutorId,
        name: tutorProfile.display_name,
        timezone: tutorProfile.timezone
      },
      summary: {
        total_lessons: monthlyLessonsCount,
        completed_lessons: todayLessonsCount, // You may want to adjust this if you have a true completed count
        upcoming_lessons: todaySchedule.filter(l => l.status === 'confirmed').length,
        total_students: activeStudentsCount,
        average_rating: performance.average_rating,
        total_earnings: monthlyEarnings,
        currency: 'USD', // Adjust if you have multi-currency
      },
      recent_activity: [], // Placeholder, populate if you have activity data
      performance_metrics: {
        completion_rate: performance.attendance_rate,
        student_satisfaction: performance.average_rating * 20, // Example: scale 0-5 to 0-100
        response_time: 5, // Placeholder, replace with real data if available
        availability_score: 100 // Placeholder, replace with real data if available
      },
      upcoming_schedule: todaySchedule.map(l => ({
        id: l.id,
        student_name: l.student_name,
        lesson_type: l.lesson_type,
        start_time: l.scheduled_start,
        duration: l.duration,
        status: l.status
      })),
      next_lesson: nextLesson,
      today_schedule: todaySchedule
    });

  } catch (error) {
    console.error('Error in tutor dashboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 