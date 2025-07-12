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
      .select('id, display_name, timezone, created_at')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || 'month'; // month, quarter, year, all
    const currentDate = new Date();
    
    // Calculate date range
    let startDate: Date;
    let endDate = new Date(currentDate);
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(currentDate.getMonth() / 3) * 3;
        startDate = new Date(currentDate.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(tutorProfile.created_at);
    }

    // Parallel queries for performance data
    const [
      lessonsResult,
      feedbackResult,
      earningsResult,
      performanceResult,
      studentsResult
    ] = await Promise.all([
      // Get lessons in date range
      serverSupabase
        .from('lessons')
        .select('id, status, duration_minutes, scheduled_start, actual_start, actual_end, price_paid')
        .eq('tutor_id', tutorProfile.id)
        .gte('scheduled_start', startDate.toISOString())
        .lte('scheduled_start', endDate.toISOString()),
      
      // Get feedback (only 4-5 star ratings visible to tutors)
      serverSupabase
        .from('lesson_feedback')
        .select('lesson_id, rating, comment, tags, created_at')
        .eq('tutor_id', tutorProfile.id)
        .eq('is_visible_to_tutor', true)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Get earnings in date range
      serverSupabase
        .from('tutor_earnings')
        .select('earning_type, amount, bonus_tier, earned_at')
        .eq('tutor_id', tutorProfile.id)
        .gte('earned_at', startDate.toISOString())
        .lte('earned_at', endDate.toISOString()),
      
      // Get performance metrics (if exists)
      serverSupabase
        .from('tutor_performance')
        .select('*')
        .eq('tutor_id', tutorProfile.id)
        .order('month_year', { ascending: false })
        .limit(12),
      
      // Get unique students
      serverSupabase
        .from('tutor_students')
        .select('student_id, total_lessons, total_minutes')
        .eq('tutor_id', tutorProfile.id)
    ]);

    const lessons = lessonsResult.data || [];
    const feedback = feedbackResult.data || [];
    const earnings = earningsResult.data || [];
    const performanceHistory = performanceResult.data || [];
    const students = studentsResult.data || [];

    // Calculate current metrics
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.status === 'completed').length;
    const cancelledLessons = lessons.filter(l => l.status === 'cancelled').length;
    const noShowLessons = lessons.filter(l => l.status === 'no_show').length;
    
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const cancellationRate = totalLessons > 0 ? (cancelledLessons / totalLessons) * 100 : 0;
    const attendanceRate = totalLessons > 0 ? ((totalLessons - noShowLessons) / totalLessons) * 100 : 0;
    
    const totalMinutes = lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    
    // Calculate ratings
    const ratings = feedback.filter(f => f.rating >= 4); // Only show 4-5 star ratings
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, f) => sum + f.rating, 0) / ratings.length 
      : 0;
    
    const ratingDistribution = {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length
    };
    
    // Calculate earnings
    const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const lessonEarnings = earnings.filter(e => e.earning_type === 'lesson').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const bonusEarnings = earnings.filter(e => e.earning_type === 'bonus').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    // Determine current bonus tier
    const currentBonusTier = calculateBonusTier(averageRating, completionRate, attendanceRate, totalLessons);
    
    // Process feedback tags
    const allTags = feedback.flatMap(f => f.tags || []);
    const tagCounts = allTags.reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
    // Recent feedback
    const recentFeedback = feedback
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(f => ({
        rating: f.rating,
        comment: f.comment,
        tags: f.tags,
        created_at: f.created_at
      }));
    
    // Monthly trends (last 6 months)
    const monthlyTrends = calculateMonthlyTrends(performanceHistory, lessons, feedback);
    
    // Student insights
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.total_lessons > 0).length;
    const avgLessonsPerStudent = totalStudents > 0 
      ? students.reduce((sum, s) => sum + s.total_lessons, 0) / totalStudents 
      : 0;

    return NextResponse.json({
      overview: {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        total_hours: totalHours,
        total_students: totalStudents,
        active_students: activeStudents,
        completion_rate: Math.round(completionRate * 10) / 10,
        attendance_rate: Math.round(attendanceRate * 10) / 10,
        cancellation_rate: Math.round(cancellationRate * 10) / 10,
        average_rating: Math.round(averageRating * 10) / 10,
        total_feedback: ratings.length,
        current_bonus_tier: currentBonusTier
      },
      earnings: {
        total_earnings: totalEarnings,
        lesson_earnings: lessonEarnings,
        bonus_earnings: bonusEarnings,
        currency: 'USD'
      },
      ratings: {
        average_rating: Math.round(averageRating * 10) / 10,
        total_ratings: ratings.length,
        distribution: ratingDistribution,
        recent_feedback: recentFeedback
      },
      performance: {
        completion_rate: Math.round(completionRate * 10) / 10,
        attendance_rate: Math.round(attendanceRate * 10) / 10,
        cancellation_rate: Math.round(cancellationRate * 10) / 10,
        avg_lessons_per_student: Math.round(avgLessonsPerStudent * 10) / 10,
        bonus_tier: currentBonusTier,
        top_feedback_tags: topTags
      },
      trends: {
        monthly_data: monthlyTrends,
        time_range: timeRange,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      tutor_info: {
        id: tutorProfile.id,
        name: tutorProfile.display_name,
        timezone: tutorProfile.timezone,
        member_since: tutorProfile.created_at
      }
    });

  } catch (error) {
    console.error('Error in performance GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate bonus tier
function calculateBonusTier(averageRating: number, completionRate: number, attendanceRate: number, totalLessons: number): string {
  if (totalLessons < 10) return 'base';
  
  if (averageRating >= 4.8 && completionRate >= 95 && attendanceRate >= 98) {
    return 'platinum';
  } else if (averageRating >= 4.5 && completionRate >= 90 && attendanceRate >= 95) {
    return 'gold';
  } else if (averageRating >= 4.0 && completionRate >= 85 && attendanceRate >= 90) {
    return 'silver';
  } else if (averageRating >= 3.5 && completionRate >= 80 && attendanceRate >= 85) {
    return 'bronze';
  }
  
  return 'base';
}

// Helper function to calculate monthly trends
function calculateMonthlyTrends(performanceHistory: any[], lessons: any[], feedback: any[]) {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    
    const monthLessons = lessons.filter(l => {
      const lessonDate = new Date(l.scheduled_start);
      return lessonDate >= monthStart && lessonDate <= monthEnd;
    });
    
    const monthFeedback = feedback.filter(f => {
      const feedbackDate = new Date(f.created_at);
      return feedbackDate >= monthStart && feedbackDate <= monthEnd;
    });
    
    const completedLessons = monthLessons.filter(l => l.status === 'completed').length;
    const avgRating = monthFeedback.length > 0 
      ? monthFeedback.reduce((sum, f) => sum + f.rating, 0) / monthFeedback.length 
      : 0;
    
    months.push({
      month: monthKey,
      month_name: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      lessons_taught: completedLessons,
      average_rating: Math.round(avgRating * 10) / 10,
      total_feedback: monthFeedback.length,
      completion_rate: monthLessons.length > 0 ? (completedLessons / monthLessons.length) * 100 : 0
    });
  }
  
  return months;
} 