import { serverSupabase } from '@/lib/serverSupabaseClient';
import { dbCacheService } from './cacheService';

interface QueryOptions {
  cache?: boolean;
  cacheTTL?: number;
  cacheTags?: string[];
  select?: string;
  where?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

interface BatchQueryOptions {
  cache?: boolean;
  cacheTTL?: number;
  cacheTags?: string[];
}

class DatabaseService {
  private supabase = serverSupabase;

  // Optimized single query with caching
  async query<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<T[]> {
    const cacheKey = this.generateQueryKey(table, options);
    
    if (options.cache !== false) {
      return await dbCacheService.cacheQuery(
        cacheKey,
        () => this.executeQuery<T>(table, options),
        {
          ttl: options.cacheTTL || 5 * 60 * 1000, // 5 minutes default
          tags: options.cacheTags || [`table:${table}`]
        }
      );
    }

    return await this.executeQuery<T>(table, options);
  }

  // Optimized single record query
  async querySingle<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const results = await this.query<T>(table, { ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  // Batch queries for multiple tables
  async batchQuery<T extends Record<string, any>>(
    queries: Array<{ table: string; options: QueryOptions; key: string }>,
    batchOptions: BatchQueryOptions = {}
  ): Promise<T> {
    const cacheKey = this.generateBatchQueryKey(queries);
    
    if (batchOptions.cache !== false) {
      return await dbCacheService.cacheQuery(
        cacheKey,
        () => this.executeBatchQuery<T>(queries),
        {
          ttl: batchOptions.cacheTTL || 5 * 60 * 1000,
          tags: batchOptions.cacheTags || queries.map(q => `table:${q.table}`)
        }
      );
    }

    return await this.executeBatchQuery<T>(queries);
  }

  // Optimized tutor dashboard data fetch
  async getTutorDashboardData(tutorId: string, userId: string) {
    const cacheKey = `tutor_dashboard:${tutorId}:${userId}`;
    
    return await dbCacheService.cacheQuery(
      cacheKey,
      async () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentMonth = now.toISOString().slice(0, 7);

        // Parallel queries for all dashboard data
        const [
          profile,
          todayLessons,
          monthlyLessons,
          activeStudents,
          monthlyEarnings,
          nextLesson,
          todaySchedule,
          performance
        ] = await Promise.all([
          // Tutor profile
          this.querySingle('tutor_profiles', {
            where: { user_id: userId },
            select: 'id, display_name, timezone, profile_image_url'
          }),

          // Today's lessons count
          this.supabase
            .from('lessons')
            .select('id', { count: 'exact' })
            .eq('tutor_id', tutorId)
            .gte('scheduled_start', `${today}T00:00:00`)
            .lt('scheduled_start', `${today}T23:59:59`)
            .in('status', ['confirmed', 'completed']),

          // Monthly lessons count
          this.supabase
            .from('lessons')
            .select('id', { count: 'exact' })
            .eq('tutor_id', tutorId)
            .gte('scheduled_start', `${currentMonth}-01T00:00:00`)
            .lt('scheduled_start', `${currentMonth}-31T23:59:59`)
            .in('status', ['confirmed', 'completed']),

          // Active students (last 30 days)
          this.supabase
            .from('lessons')
            .select('student_id')
            .eq('tutor_id', tutorId)
            .gte('scheduled_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .in('status', ['confirmed', 'completed']),

          // Monthly earnings
          this.supabase
            .from('tutor_earnings')
            .select('amount')
            .eq('tutor_id', tutorId)
            .gte('earned_at', `${currentMonth}-01T00:00:00`)
            .lt('earned_at', `${currentMonth}-31T23:59:59`),

          // Next lesson
          this.supabase
            .from('lessons')
            .select(`
              id, scheduled_start, scheduled_end, lesson_type, 
              duration_minutes, status, student_id, student_timezone, lesson_notes
            `)
            .eq('tutor_id', tutorId)
            .eq('status', 'confirmed')
            .gte('scheduled_start', now.toISOString())
            .order('scheduled_start', { ascending: true })
            .limit(1)
            .single(),

          // Today's schedule
          this.supabase
            .from('lessons')
            .select(`
              id, scheduled_start, scheduled_end, lesson_type, 
              duration_minutes, status, student_id, student_timezone,
              reschedule_requested_by, reschedule_requested_at
            `)
            .eq('tutor_id', tutorId)
            .gte('scheduled_start', `${today}T00:00:00`)
            .lt('scheduled_start', `${today}T23:59:59`)
            .order('scheduled_start', { ascending: true }),

          // Performance metrics
          this.supabase
            .from('tutor_performance')
            .select('*')
            .eq('tutor_id', tutorId)
            .eq('month_year', currentMonth)
            .single()
        ]);

        // Get student details for lessons
        const studentIds = new Set<string>();
        if (nextLesson.data) {
          studentIds.add(nextLesson.data.student_id);
        }
        if (todaySchedule.data) {
          todaySchedule.data.forEach(lesson => studentIds.add(lesson.student_id));
        }

        let studentDetails: Record<string, any> = {};
        if (studentIds.size > 0) {
          const { data: students } = await this.supabase.auth.admin.listUsers();
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
        const todayLessonsCount = todayLessons.count || 0;
        const monthlyLessonsCount = monthlyLessons.count || 0;
        const uniqueStudents = new Set(
          (activeStudents.data || []).map(lesson => lesson.student_id)
        );
        const activeStudentsCount = uniqueStudents.size;
        const monthlyEarningsTotal = (monthlyEarnings.data || [])
          .reduce((total, earning) => total + parseFloat(earning.amount), 0);

        // Process next lesson
        let nextLessonData = null;
        if (nextLesson.data) {
          const lesson = nextLesson.data;
          const student = studentDetails[lesson.student_id];
          const scheduledStart = new Date(lesson.scheduled_start);
          const minutesUntil = Math.max(0, Math.floor((scheduledStart.getTime() - now.getTime()) / (1000 * 60)));
          
          nextLessonData = {
            id: lesson.id,
            student_name: student?.full_name || 'Student',
            student_country: student?.country || 'Unknown',
            student_avatar: student?.avatar_url,
            lesson_type: lesson.lesson_type,
            duration: lesson.duration_minutes,
            scheduled_start: lesson.scheduled_start,
            scheduled_end: lesson.scheduled_end,
            minutes_until: minutesUntil,
            can_join: minutesUntil <= 15,
            status: lesson.status
          };
        }

        // Process today's schedule
        const todayScheduleData = (todaySchedule.data || []).map(lesson => {
          const student = studentDetails[lesson.student_id];
          const scheduledStart = new Date(lesson.scheduled_start);
          const minutesUntil = Math.max(0, Math.floor((scheduledStart.getTime() - now.getTime()) / (1000 * 60)));
          
          return {
            id: lesson.id,
            student_name: student?.full_name || 'Student',
            student_country: student?.country || 'Unknown',
            student_avatar: student?.avatar_url,
            lesson_type: lesson.lesson_type,
            duration: lesson.duration_minutes,
            scheduled_start: lesson.scheduled_start,
            scheduled_end: lesson.scheduled_end,
            minutes_until: minutesUntil,
            can_join: minutesUntil <= 15,
            status: lesson.status,
            reschedule_requested_by: lesson.reschedule_requested_by,
            reschedule_requested_at: lesson.reschedule_requested_at
          };
        });

        return {
          profile,
          metrics: {
            today_lessons: todayLessonsCount,
            monthly_lessons: monthlyLessonsCount,
            active_students: activeStudentsCount,
            monthly_earnings: monthlyEarningsTotal
          },
          next_lesson: nextLessonData,
          today_schedule: todayScheduleData,
          performance: performance.data
        };
      },
      {
        ttl: 2 * 60 * 1000, // 2 minutes for dashboard data
        tags: ['tutor_dashboard', `tutor:${tutorId}`]
      }
    );
  }

  // Optimized lessons query with pagination
  async getTutorLessons(
    tutorId: string,
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ) {
    const cacheKey = `tutor_lessons:${tutorId}:${page}:${limit}:${JSON.stringify(filters)}`;
    
    return await dbCacheService.cacheQuery(
      cacheKey,
      async () => {
        let query = this.supabase
          .from('lessons')
          .select(`
            id, scheduled_start, scheduled_end, lesson_type, 
            duration_minutes, status, student_id, student_timezone,
            lesson_notes, created_at, updated_at
          `)
          .eq('tutor_id', tutorId);

        // Apply filters
        if (filters.status) {
          query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
        }
        if (filters.date_from) {
          query = query.gte('scheduled_start', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('scheduled_start', filters.date_to);
        }
        if (filters.lesson_type) {
          query = query.eq('lesson_type', filters.lesson_type);
        }

        // Get total count
        const { count } = await this.supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', tutorId);

        // Apply pagination
        const offset = (page - 1) * limit;
        const { data: lessons, error } = await query
          .order('scheduled_start', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        // Get student details for lessons
        const studentIds = new Set(lessons.map(lesson => lesson.student_id));
        let studentDetails: Record<string, any> = {};
        
        if (studentIds.size > 0) {
          const { data: students } = await this.supabase.auth.admin.listUsers();
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

        // Enrich lessons with student data
        const enrichedLessons = lessons.map(lesson => {
          const student = studentDetails[lesson.student_id];
          return {
            ...lesson,
            student_name: student?.full_name || 'Student',
            student_country: student?.country || 'Unknown',
            student_avatar: student?.avatar_url,
            student_email: student?.email
          };
        });

        return {
          lessons: enrichedLessons,
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
          }
        };
      },
      {
        ttl: 5 * 60 * 1000, // 5 minutes for lessons data
        tags: ['tutor_lessons', `tutor:${tutorId}`]
      }
    );
  }

  // Optimized lesson history query with summary statistics
  async getTutorLessonHistory(
    tutorId: string,
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ) {
    const cacheKey = `tutor_lesson_history:${tutorId}:${page}:${limit}:${JSON.stringify(filters)}`;
    
    return await dbCacheService.cacheQuery(
      cacheKey,
      async () => {
        // Get tutor timezone
        const { data: tutorProfile } = await this.supabase
          .from('tutor_profiles')
          .select('timezone')
          .eq('id', tutorId)
          .single();

        // Get lessons with student details
        let query = this.supabase
          .from('lessons')
          .select(`
            id, scheduled_start, scheduled_end, actual_start, actual_end, lesson_type, 
            duration_minutes, status, student_id, student_timezone,
            lesson_notes, student_goals, homework_assigned, created_at, updated_at,
            price_paid, currency
          `)
          .eq('tutor_id', tutorId);

        // Apply filters
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.date_from) {
          query = query.gte('scheduled_start', filters.date_from);
        }
        if (filters.date_to) {
          query = query.lte('scheduled_start', filters.date_to);
        }
        if (filters.lesson_type && filters.lesson_type !== 'all') {
          query = query.eq('lesson_type', filters.lesson_type);
        }

        // Get total count for pagination
        const { count } = await this.supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', tutorId);

        // Apply pagination
        const offset = (page - 1) * limit;
        const { data: lessons, error } = await query
          .order('scheduled_start', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        // Get student details for lessons
        const studentIds = new Set(lessons.map(lesson => lesson.student_id));
        let studentDetails: Record<string, any> = {};
        
        if (studentIds.size > 0) {
          const { data: students } = await this.supabase.auth.admin.listUsers();
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

        // Get summary statistics
        const { data: allLessons } = await this.supabase
          .from('lessons')
          .select('student_id, duration_minutes, status')
          .eq('tutor_id', tutorId);

        // Calculate summary statistics
        const totalLessons = allLessons?.length || 0;
        const uniqueStudents = new Set(allLessons?.map(lesson => lesson.student_id) || []);
        const totalStudents = uniqueStudents.size;
        const totalMinutes = allLessons?.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) || 0;
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        // Get unique countries from students
        const studentCountries = new Set();
        allLessons?.forEach(lesson => {
          const student = studentDetails[lesson.student_id];
          if (student?.country && student.country !== 'Unknown') {
            studentCountries.add(student.country);
          }
        });
        const countriesReached = studentCountries.size;

        // Enrich lessons with student data
        const enrichedLessons = lessons.map(lesson => {
          const student = studentDetails[lesson.student_id];
          return {
            id: lesson.id,
            lesson_type: lesson.lesson_type,
            duration_minutes: lesson.duration_minutes,
            scheduled_start: lesson.scheduled_start,
            scheduled_end: lesson.scheduled_end,
            actual_start: lesson.actual_start,
            actual_end: lesson.actual_end,
            status: lesson.status,
            lesson_notes: lesson.lesson_notes,
            student_goals: lesson.student_goals,
            homework_assigned: lesson.homework_assigned,
            price_paid: lesson.price_paid,
            currency: lesson.currency,
            created_at: lesson.created_at,
            student: {
              id: student?.id || lesson.student_id,
              name: student?.full_name || 'Student',
              email: student?.email,
              avatar_url: student?.avatar_url,
              country: student?.country || 'Unknown'
            }
          };
        });

        return {
          lessons: enrichedLessons,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          },
          summary: {
            total_lessons: totalLessons,
            total_students: totalStudents,
            total_minutes: totalMinutes,
            total_hours: totalHours,
            countries_reached: countriesReached
          },
          tutor_timezone: tutorProfile?.timezone || 'UTC'
        };
      },
      {
        ttl: 5 * 60 * 1000, // 5 minutes for lesson history data
        tags: ['tutor_lesson_history', `tutor:${tutorId}`]
      }
    );
  }

  // Optimized earnings query
  async getTutorEarnings(
    tutorId: string,
    range: string = 'month',
    type: string = 'all',
    page: number = 1,
    limit: number = 20
  ) {
    const cacheKey = `tutor_earnings:${tutorId}:${range}:${type}:${page}:${limit}`;
    
    return await dbCacheService.cacheQuery(
      cacheKey,
      async () => {
        const now = new Date();
        let dateFrom: string;
        
        switch (range) {
          case 'week':
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'month':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            break;
          case 'quarter':
            dateFrom = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString();
            break;
          case 'year':
            dateFrom = new Date(now.getFullYear(), 0, 1).toISOString();
            break;
          default:
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        }

        let query = this.supabase
          .from('tutor_earnings')
          .select('*')
          .eq('tutor_id', tutorId)
          .gte('earned_at', dateFrom);

        if (type !== 'all') {
          query = query.eq('type', type);
        }

        // Get total count
        const { count } = await this.supabase
          .from('tutor_earnings')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', tutorId)
          .gte('earned_at', dateFrom);

        // Apply pagination
        const offset = (page - 1) * limit;
        const { data: earnings, error } = await query
          .order('earned_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;

        // Calculate summary
        const totalEarnings = earnings.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
        const averageEarnings = earnings.length > 0 ? totalEarnings / earnings.length : 0;

        return {
          earnings,
          summary: {
            total: totalEarnings,
            average: averageEarnings,
            count: earnings.length
          },
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit)
          }
        };
      },
      {
        ttl: 10 * 60 * 1000, // 10 minutes for earnings data
        tags: ['tutor_earnings', `tutor:${tutorId}`]
      }
    );
  }

  // Invalidate cache when data changes
  async invalidateTutorCache(tutorId: string, operation: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE') {
    await dbCacheService.invalidateOnChange('tutor_profiles', operation);
    await dbCacheService.invalidateOnChange('lessons', operation);
    await dbCacheService.invalidateOnChange('tutor_earnings', operation);
    await dbCacheService.invalidateOnChange('tutor_performance', operation);
    
    // Invalidate specific tutor caches
    await dbCacheService.invalidate([
      `tutor:${tutorId}`,
      'tutor_dashboard',
      'tutor_lessons',
      'tutor_earnings'
    ]);
  }

  private async executeQuery<T>(table: string, options: QueryOptions): Promise<T[]> {
    let query = this.supabase.from(table).select(options.select || '*');

    // Apply where conditions
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending !== false
      });
    }

    // Apply pagination
    if (options.limit) {
      if (options.offset) {
        query = query.range(options.offset, options.offset + options.limit - 1);
      } else {
        query = query.limit(options.limit);
      }
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Database query error: ${error.message}`);
    }

    return (data as T[]) || [];
  }

  private async executeBatchQuery<T extends Record<string, any>>(queries: Array<{ table: string; options: QueryOptions; key: keyof T }>): Promise<T> {
    const results = await Promise.all(
      queries.map(async ({ table, options, key }) => {
        const data = await this.executeQuery<any>(table, options);
        return { key, data };
      })
    );

    return results.reduce((acc, { key, data }) => {
      acc[key] = data as T[keyof T];
      return acc;
    }, {} as T);
  }

  private generateQueryKey(table: string, options: QueryOptions): string {
    const params = {
      table,
      select: options.select,
      where: options.where,
      orderBy: options.orderBy,
      limit: options.limit,
      offset: options.offset
    };
    return `query:${table}:${JSON.stringify(params)}`;
  }

  private generateBatchQueryKey(queries: Array<{ table: string; options: QueryOptions; key: string }>): string {
    return `batch:${queries.map(q => `${q.table}:${JSON.stringify(q.options)}`).join('|')}`;
  }
}

export const databaseService = new DatabaseService(); 