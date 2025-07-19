'use client';

import React, { useMemo, useCallback } from 'react';
import TutorLayout from '../TutorLayout';
import { 
  Card, 
  Text, 
  Button, 
  TutorPageLayout, 
  TutorPageHeader, 
  MetricsGrid, 
  LoadingState, 
  ErrorState,
  ErrorBoundary
} from '@/app/components/ui';
import { useDashboardData } from '@/lib/hooks/useOptimizedData';
import { useErrorHandler, useErrorRecovery } from '@/lib/hooks/useErrorHandler';
import { 
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Star,
  Award,
  BookOpen,
  Target,
  AlertTriangle,
  RefreshCw,
  Play,
  Eye,
  Activity,
  Zap,
  Settings
} from 'lucide-react';

interface DashboardData {
  tutor: {
    id: string;
    name: string;
    timezone: string;
  };
  summary: {
    total_lessons: number;
    completed_lessons: number;
    upcoming_lessons: number;
    total_students: number;
    average_rating: number;
    total_earnings: number;
    currency: string;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
  performance_metrics: {
    completion_rate: number;
    student_satisfaction: number;
    response_time: number;
    availability_score: number;
  };
  upcoming_schedule: Array<{
    id: string;
    student_name: string;
    lesson_type: string;
    start_time: string;
    duration: number;
    status: string;
  }>;
  next_lesson?: {
    id: string;
    student_name: string;
    student_country: string;
    student_avatar?: string;
    lesson_type: string;
    duration: number;
    scheduled_start: string;
    scheduled_end: string;
    minutes_until: number;
    can_join: boolean;
    status: string;
  };
  today_schedule: Array<{
    id: string;
    time: string;
    student_name: string;
    student_country: string;
    student_avatar?: string;
    lesson_type: string;
    duration: number;
    status: string;
    has_reschedule_request: boolean;
    reschedule_requested_at?: string;
    scheduled_start: string;
  }>;
}

export default function TutorDashboard() {
  // Use optimized data hook with error handling
  const { 
    data: dashboardData, 
    loading, 
    error, 
    refetch 
  } = useDashboardData<DashboardData>();

  // Enhanced error handling
  const errorHandler = useErrorHandler({
    context: 'TutorDashboard',
    autoReport: true,
    retryable: true
  });

  // Error recovery actions
  const errorRecovery = useErrorRecovery(
    errorHandler.error,
    refetch,
    () => window.history.back(),
    () => window.location.href = '/'
  );

  // Memoized metrics for performance
  const metrics = useMemo(() => {
    if (!dashboardData || typeof dashboardData !== 'object' || !('summary' in dashboardData)) return [];
    
    const data = dashboardData as any;
    
    return [
      {
        title: 'Total Lessons',
        value: data.summary.total_lessons.toString(),
        icon: <BookOpen className="w-6 h-6" />,
        iconBgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      {
        title: 'Active Students',
        value: data.summary.total_students.toString(),
        icon: <Users className="w-6 h-6" />,
        iconBgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      {
        title: 'Average Rating',
        value: `${data.summary.average_rating.toFixed(1)} ⭐`,
        icon: <Star className="w-6 h-6" />,
        iconBgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      },
      {
        title: 'Total Earnings',
        value: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: data.summary.currency || 'USD'
        }).format(data.summary.total_earnings),
        icon: <TrendingUp className="w-6 h-6" />,
        iconBgColor: 'bg-purple-100',
        iconColor: 'text-purple-600'
      }
    ];
  }, [dashboardData]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getCountryFlag = useCallback((country: string) => {
    const flags: Record<string, string> = {
      'South Korea': '🇰🇷',
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'Australia': '🇦🇺',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'Taiwan': '🇹🇼',
      'Egypt': '🇪🇬',
      'Mexico': '🇲🇽',
      'Unknown': '🌍'
    };
    return flags[country] || '🌍';
  }, []);

  // Enhanced error state with better user feedback
  if (errorHandler.hasError) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="lg" padding="lg">
          <ErrorState
            type={errorHandler.error?.type === 'unknown' ? 'generic' : errorHandler.error?.type || 'generic'}
            severity={errorHandler.error?.severity || 'medium'}
            title={errorHandler.error?.userMessage || 'Unable to load dashboard'}
            message={errorHandler.error?.technicalDetails}
            onRetry={errorRecovery.handleRetry}
            onBack={errorRecovery.handleBack}
            onHome={errorRecovery.handleHome}
            showDetails={process.env.NODE_ENV === 'development'}
            showActions={true}
          >
            {errorHandler.retryCount > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Text variant="small" className="text-blue-800">
                  Retry attempt {errorHandler.retryCount} of 3
                </Text>
              </div>
            )}
          </ErrorState>
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  if (loading) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="xl" padding="lg">
          <LoadingState 
            message="Loading your dashboard..." 
            size="lg" 
            variant="spinner"
          />
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  // Type guard to ensure we have the expected data structure
  if (!dashboardData || typeof dashboardData !== 'object' || 
      !('summary' in dashboardData) || !('recent_activity' in dashboardData) || 
      !('performance_metrics' in dashboardData) || !('upcoming_schedule' in dashboardData)) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="lg" padding="lg">
          <ErrorState
            type="not-found"
            severity="low"
            title="Invalid Data Format"
            message="The dashboard data format is invalid"
            onRetry={refetch}
            showDetails={false}
          />
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  const data = dashboardData as any;

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Dashboard Error:', error, errorInfo);
        errorHandler.handleError(error);
      }}
      showDetails={process.env.NODE_ENV === 'development'}
      errorMessage="Something went wrong with the dashboard"
      showHomeButton={true}
      showBackButton={true}
    >
      <TutorLayout>
        <TutorPageLayout containerWidth="xl" padding="lg">
          <TutorPageHeader
            title="Dashboard"
            subtitle="Welcome back! Here's your teaching overview"
            titleVariant="h1"
            subtitleVariant="body"
            actions={
              <Button
                variant="outline"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            }
          />

          {/* Summary Cards */}
          <MetricsGrid 
            metrics={metrics} 
            columns={4} 
            className="mb-8"
            cardVariant="default"
            cardPadding="lg"
          />

          {/* Next Lesson Section */}
          {data.next_lesson && (
            <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl" variant="default">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <Text variant="h3" className="text-blue-900 font-bold">Next Lesson</Text>
                    <Text variant="small" className="text-blue-700">
                      {data.next_lesson.minutes_until > 0 
                        ? `Starting in ${Math.floor(data.next_lesson.minutes_until / 60)}h ${data.next_lesson.minutes_until % 60}m`
                        : 'Starting now!'
                      }
                    </Text>
                  </div>
                </div>
                {data.next_lesson.can_join && (
                  <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-2" />
                    Join Lesson
                  </Button>
                )}
              </div>
              
              <div className="flex items-center p-4 bg-white rounded-lg border border-blue-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-4">
                  {data.next_lesson.student_avatar ? (
                    <img 
                      src={data.next_lesson.student_avatar} 
                      alt={data.next_lesson.student_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Text variant="h4" className="font-bold text-gray-900">
                      {data.next_lesson.student_name}
                    </Text>
                    <span className="text-lg">{getCountryFlag(data.next_lesson.student_country)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {data.next_lesson.lesson_type}
                    </span>
                    <span>{data.next_lesson.duration} minutes</span>
                    <span>{formatTime(data.next_lesson.scheduled_start)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Metrics */}
            <Card className="p-6 rounded-xl" variant="default">
              <div className="flex items-center mb-4">
                <Target className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Performance Metrics</Text>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary">Completion Rate</Text>
                  <div className="flex items-center">
                    <div className="w-16 bg-token-surface-subtle rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${data.performance_metrics.completion_rate}%` }}
                      ></div>
                    </div>
                    <Text variant="body" className="font-medium text-token-text-primary">
                      {data.performance_metrics.completion_rate}%
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary">Student Satisfaction</Text>
                  <div className="flex items-center">
                    <div className="w-16 bg-token-surface-subtle rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${data.performance_metrics.student_satisfaction}%` }}
                      ></div>
                    </div>
                    <Text variant="body" className="font-medium text-token-text-primary">
                      {data.performance_metrics.student_satisfaction}%
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary">Response Time</Text>
                  <Text variant="body" className="font-medium text-token-text-primary">
                    {data.performance_metrics.response_time} min
                  </Text>
                </div>
                
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary">Availability Score</Text>
                  <div className="flex items-center">
                    <div className="w-16 bg-token-surface-subtle rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${data.performance_metrics.availability_score}%` }}
                      ></div>
                    </div>
                    <Text variant="body" className="font-medium text-token-text-primary">
                      {data.performance_metrics.availability_score}%
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 rounded-xl" variant="default">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Recent Activity</Text>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.recent_activity.length === 0 ? (
                  <Text variant="body" className="text-token-text-secondary text-center py-4">
                    No recent activity
                  </Text>
                ) : (
                  data.recent_activity.slice(0, 5).map((activity: any) => (
                    <div key={activity.id} className="flex items-center p-3 border border-token rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-token-surface-subtle rounded-full flex items-center justify-center mr-3">
                        {activity.type === 'lesson' && <BookOpen className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'rating' && <Star className="w-4 h-4 text-yellow-600" />}
                        {activity.type === 'achievement' && <Award className="w-4 h-4 text-green-600" />}
                        {activity.type === 'default' && <AlertTriangle className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text variant="body" className="font-medium text-token-text-primary truncate">
                          {activity.title}
                        </Text>
                        <Text variant="small" className="text-token-text-muted">
                          {activity.description}
                        </Text>
                      </div>
                      <Text variant="small" className="text-token-text-muted ml-2">
                        {formatDate(activity.timestamp)}
                      </Text>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Today's Schedule */}
          <Card className="p-6 rounded-xl" variant="default">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Today's Schedule</Text>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
            
            {/* Filter to only show upcoming lessons */}
            {(() => {
              const now = new Date();
              const upcomingLessons = data.today_schedule?.filter(lesson => {
                const lessonTime = new Date(lesson.scheduled_start);
                return lessonTime > now && lesson.status === 'confirmed';
              }).sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()) || [];

              if (upcomingLessons.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-token-text-muted mx-auto mb-3" />
                    <Text variant="body" className="text-token-text-secondary mb-2">
                      No upcoming lessons today
                    </Text>
                    <Text variant="small" className="text-token-text-muted">
                      Set your availability to start receiving bookings
                    </Text>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {upcomingLessons.map((lesson) => {
                    const lessonTime = new Date(lesson.scheduled_start);
                    const minutesUntil = Math.max(0, Math.floor((lessonTime.getTime() - now.getTime()) / (1000 * 60)));
                    const canJoin = minutesUntil <= 60 && minutesUntil >= -60;

                    return (
                      <div key={lesson.id} className="flex items-center p-4 border border-token rounded-lg hover:bg-token-surface-subtle transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-4">
                          {lesson.student_avatar ? (
                            <img 
                              src={lesson.student_avatar} 
                              alt={lesson.student_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Text variant="body" className="font-medium text-token-text-primary truncate">
                              {lesson.student_name}
                            </Text>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getCountryFlag(lesson.student_country)}</span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Confirmed
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-token-text-secondary">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {lesson.lesson_type}
                            </span>
                            <span>{lesson.duration} min</span>
                            <span>{lesson.time}</span>
                            {canJoin && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                Can Join
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {canJoin && (
                            <Button variant="primary" size="sm">
                              <Play className="w-4 h-4 mr-1" />
                              Join
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </Card>
        </TutorPageLayout>
      </TutorLayout>
    </ErrorBoundary>
  );
} 