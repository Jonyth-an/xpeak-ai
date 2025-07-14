'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from './TutorLayout';
import { 
  Card, 
  Text, 
  Button, 
  TutorPageLayout, 
  TutorPageHeader, 
  MetricsGrid, 
  LoadingState, 
  ErrorState 
} from '@/app/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { 
  Calendar,
  Clock,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  CheckCircle,
  Video,
  Eye,
  AlertCircle,
  Flag
} from 'lucide-react';

interface DashboardData {
  tutor: {
    id: string;
    name: string;
    timezone: string;
  };
  summary: {
    completed_lessons: number;
    total_lessons: number;
    total_students: number;
    total_earnings: number;
  };
  next_lesson: {
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
  } | null;
  upcoming_schedule: Array<{
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
  performance_metrics: {
    student_satisfaction: number;
    completion_rate: number;
    // bonus_tier: string; // This field is no longer returned by the API
    // top_strengths: string[]; // This field is no longer returned by the API
  };
}

export default function TutorDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/tutor/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCountryFlag = (country: string) => {
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
  };

  const getBonusTierColor = (tier: string) => {
    switch (tier) {
      case 'tier2': return 'bg-token-warning-light text-token-warning';
      case 'tier1': return 'bg-token-info-light text-token-info';
      default: return 'bg-token-surface-subtle text-token-text-secondary';
    }
  };

  const getBonusTierText = (tier: string) => {
    switch (tier) {
      case 'tier2': return 'Tier 2';
      case 'tier1': return 'Tier 1';
      default: return 'Base';
    }
  };

  // Loading state
  if (loading) {
    return (
      <TutorLayout>
        <LoadingState 
          message="Loading your dashboard..." 
          fullScreen 
        />
      </TutorLayout>
    );
  }

  // Error state
  if (error || !dashboardData) {
    return (
      <TutorLayout>
        <ErrorState 
          title="Unable to Load Dashboard"
          message={error || 'Please try refreshing the page'}
          onRetry={fetchDashboardData}
          fullScreen
        />
      </TutorLayout>
    );
  }

  // Prepare metrics for the standardized grid
  const metrics = [
    {
      title: "Today's Lessons",
      value: dashboardData.summary.completed_lessons,
      icon: <Calendar className="w-6 h-6" />, 
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: "This Month",
      value: dashboardData.summary.total_lessons,
      icon: <CheckCircle className="w-6 h-6" />, 
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: "Active Students",
      value: dashboardData.summary.total_students,
      icon: <Users className="w-6 h-6" />, 
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: "This Month",
      value: formatCurrency(dashboardData.summary.total_earnings),
      icon: <DollarSign className="w-6 h-6" />, 
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <TutorLayout>
      <TutorPageLayout
        header={
          <TutorPageHeader
            title={`Welcome back, ${dashboardData.tutor.name}!`}
            subtitle="Here's your teaching overview for today"
          />
        }
      >
        {/* Metrics Grid */}
        <div className="mb-8">
          <MetricsGrid metrics={metrics} columns={4} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Lesson Card */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" as="h3" className="text-token-primary">
                  Next Lesson
                </Text>
              </div>
              {dashboardData.next_lesson ? (
                <div className="bg-token-surface-subtle rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-token-primary rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {dashboardData.next_lesson.student_avatar ? (
                          <img
                            src={dashboardData.next_lesson.student_avatar}
                            alt={dashboardData.next_lesson.student_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          dashboardData.next_lesson.student_name.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div>
                        <Text variant="body" className="font-medium text-token-text-primary">
                          {dashboardData.next_lesson.lesson_type} with {dashboardData.next_lesson.student_name}
                        </Text>
                        <Text variant="small" className="text-token-text-secondary">
                          {getCountryFlag(dashboardData.next_lesson.student_country)} {dashboardData.next_lesson.student_country}
                        </Text>
                      </div>
                    </div>
                    <div className="text-center">
                      <Text variant="small" className="text-token-text-secondary">
                        {dashboardData.next_lesson.minutes_until > 0 ? 'Ready in' : 'Starting now'}
                      </Text>
                      <Text variant="body" className="font-medium text-token-primary">
                        {dashboardData.next_lesson.minutes_until > 0 
                          ? `${dashboardData.next_lesson.minutes_until} minutes`
                          : 'Now'
                        }
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text variant="small" className="text-token-text-secondary">
                        {new Date(dashboardData.next_lesson.scheduled_start).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })} - {new Date(dashboardData.next_lesson.scheduled_end).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })} • {dashboardData.next_lesson.duration} min
                      </Text>
                    </div>
                    <Button
                      variant={dashboardData.next_lesson.can_join ? "primary" : "outline"}
                      size="sm"
                      disabled={!dashboardData.next_lesson.can_join}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {dashboardData.next_lesson.can_join ? 'Join Lesson' : `Join in ${dashboardData.next_lesson.minutes_until} min`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-token-surface-subtle rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-token-text-muted mx-auto mb-3" />
                  <Text variant="body" className="text-token-text-secondary">
                    No upcoming lessons scheduled
                  </Text>
                  <Text variant="small" className="text-token-text-muted mt-1">
                    Set your availability to start receiving bookings
                  </Text>
                </div>
              )}
            </Card>

            {/* Today's Schedule */}
            <Card className="p-6 bg-token-surface border border-token">
              <Text variant="h3" as="h3" className="text-token-primary mb-4">
                Today's Schedule
              </Text>
              {dashboardData.upcoming_schedule.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcoming_schedule.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-token-surface-subtle rounded-lg">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-token-primary rounded-full flex items-center justify-center text-white font-medium">
                          {lesson.student_avatar ? (
                            <img
                              src={lesson.student_avatar}
                              alt={lesson.student_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            lesson.student_name.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div className="ml-3">
                          <Text variant="body" className="font-medium text-token-text-primary">
                            {lesson.time}
                          </Text>
                          <Text variant="small" className="text-token-text-secondary">
                            {getCountryFlag(lesson.student_country)} {lesson.student_name} • {lesson.lesson_type}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lesson.has_reschedule_request && (
                          <span className="px-2 py-1 bg-token-warning-light text-token-warning rounded text-xs font-medium">
                            Reschedule Request
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          lesson.status === 'confirmed' 
                            ? 'bg-token-success-light text-token-success' 
                            : lesson.status === 'completed'
                            ? 'bg-token-info-light text-token-info'
                            : 'bg-token-surface-subtle text-token-text-secondary'
                        }`}>
                          {lesson.status === 'confirmed' ? 'Confirmed' : 
                           lesson.status === 'completed' ? 'Completed' : 
                           lesson.status}
                        </span>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-token-text-muted mx-auto mb-3" />
                  <Text variant="body" className="text-token-text-secondary">
                    No lessons scheduled for today
                  </Text>
                  <Text variant="small" className="text-token-text-muted mt-1">
                    Your next lessons will appear here
                  </Text>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Card */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-token-success mr-2" />
                <Text variant="h3" as="h3" className="text-token-primary">
                  Performance
                </Text>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text variant="small" className="text-token-text-secondary">
                    Rating
                  </Text>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <Text variant="body" className="font-medium text-token-text-primary">
                      {dashboardData.performance_metrics.student_satisfaction > 0 ? (dashboardData.performance_metrics.student_satisfaction / 20).toFixed(1) : 'N/A'}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Text variant="small" className="text-token-text-secondary">
                    Attendance
                  </Text>
                  <Text variant="body" className={`font-medium ${
                    dashboardData.performance_metrics.completion_rate >= 95 ? 'text-token-success' :
                    dashboardData.performance_metrics.completion_rate >= 90 ? 'text-token-warning' :
                    'text-token-error'
                  }`}>
                    {dashboardData.performance_metrics.completion_rate}%
                  </Text>
                </div>
                {/* Bonus Tier and Top Strengths are no longer returned by the API */}
                {/* <div className="flex items-center justify-between">
                  <Text variant="small" className="text-token-text-secondary">
                    Bonus Tier
                  </Text>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getBonusTierColor(dashboardData.performance.bonus_tier)}`}>
                    {getBonusTierText(dashboardData.performance.bonus_tier)}
                  </span>
                </div>
                {dashboardData.performance.top_strengths.length > 0 && (
                  <div>
                    <Text variant="small" className="text-token-text-secondary mb-2">
                      Top Strengths
                    </Text>
                    <div className="flex flex-wrap gap-1">
                      {dashboardData.performance.top_strengths.map((strength, index) => (
                        <span key={index} className="px-2 py-1 bg-token-info-light text-token-info rounded text-xs">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-token-surface border border-token">
              <Text variant="h3" as="h3" className="text-token-primary mb-4">
                Quick Actions
              </Text>
              <div className="space-y-3">
                <Text variant="small" className="text-token-text-secondary">
                  🎯 Set availability for next week
                </Text>
                <Text variant="small" className="text-token-text-secondary">
                  📝 Review lesson notes
                </Text>
                <Text variant="small" className="text-token-text-secondary">
                  💰 Check earnings summary
                </Text>
                <Text variant="small" className="text-token-text-secondary">
                  🔧 Test video connection
                </Text>
              </div>
            </Card>
          </div>
        </div>
      </TutorPageLayout>
    </TutorLayout>
  );
} 