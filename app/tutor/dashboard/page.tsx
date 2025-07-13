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
  RefreshCw
} from 'lucide-react';

interface DashboardData {
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

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Metrics */}
            <Card className="p-6" variant="default">
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
            <Card className="p-6" variant="default">
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

          {/* Upcoming Schedule */}
          <Card className="p-6" variant="default">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-token-primary mr-2" />
              <Text variant="h3" className="text-token-primary">Upcoming Schedule</Text>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-token">
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Student</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Lesson Type</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Start Time</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Duration</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcoming_schedule.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center">
                        <Text variant="body" className="text-token-text-secondary">
                          No upcoming lessons scheduled
                        </Text>
                      </td>
                    </tr>
                  ) : (
                    data.upcoming_schedule.slice(0, 10).map((lesson: any) => (
                      <tr key={lesson.id} className="border-b border-token hover:bg-token-surface-subtle">
                        <td className="py-3 px-4">
                          <Text variant="body" className="font-medium text-token-text-primary">
                            {lesson.student_name}
                          </Text>
                        </td>
                        <td className="py-3 px-4">
                          <Text variant="body" className="text-token-text-primary">
                            {lesson.lesson_type}
                          </Text>
                        </td>
                        <td className="py-3 px-4">
                          <Text variant="body" className="text-token-text-primary">
                            {formatDate(lesson.start_time)}
                          </Text>
                        </td>
                        <td className="py-3 px-4">
                          <Text variant="body" className="text-token-text-primary">
                            {lesson.duration} min
                          </Text>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            lesson.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            lesson.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lesson.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TutorPageLayout>
      </TutorLayout>
    </ErrorBoundary>
  );
} 