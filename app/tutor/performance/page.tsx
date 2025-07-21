'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
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
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  Clock,
  Target,
  Award,
  Calendar,
  BarChart3,
  MessageSquare,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react';

interface PerformanceData {
  overview: {
    total_lessons: number;
    completed_lessons: number;
    total_hours: number;
    total_students: number;
    active_students: number;
    completion_rate: number;
    attendance_rate: number;
    cancellation_rate: number;
    average_rating: number;
    total_feedback: number;
    current_bonus_tier: string;
  };
  earnings: {
    total_earnings: number;
    lesson_earnings: number;
    bonus_earnings: number;
    currency: string;
  };
  ratings: {
    average_rating: number;
    total_ratings: number;
    distribution: {
      5: number;
      4: number;
    };
    recent_feedback: Array<{
      rating: number;
      comment: string;
      tags: string[];
      created_at: string;
    }>;
  };
  performance: {
    completion_rate: number;
    attendance_rate: number;
    cancellation_rate: number;
    avg_lessons_per_student: number;
    bonus_tier: string;
    top_feedback_tags: Array<{
      tag: string;
      count: number;
    }>;
  };
  trends: {
    monthly_data: Array<{
      month: string;
      month_name: string;
      lessons_taught: number;
      average_rating: number;
      total_feedback: number;
      completion_rate: number;
    }>;
    time_range: string;
    start_date: string;
    end_date: string;
  };
  tutor_info: {
    id: string;
    name: string;
    timezone: string;
    member_since: string;
  };
}

export default function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/tutor/performance?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data);
      } else {
        setError('Failed to load performance data');
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setError('An error occurred while loading performance data');
    } finally {
      setLoading(false);
    }
  };

  const getBonusTierInfo = (tier: string) => {
    const tiers = {
      base: { name: 'Base', color: 'bg-surface-muted text-text-secondary', icon: '🌟', bonus: '0%' },
      bronze: { name: 'Bronze', color: 'bg-warning/20 text-warning', icon: '🥉', bonus: '5%' },
      silver: { name: 'Silver', color: 'bg-surface-subtle text-text-secondary', icon: '🥈', bonus: '10%' },
      gold: { name: 'Gold', color: 'bg-warning/20 text-warning', icon: '🥇', bonus: '15%' },
      platinum: { name: 'Platinum', color: 'bg-primary/20 text-primary', icon: '💎', bonus: '20%' }
    };
    return tiers[tier as keyof typeof tiers] || tiers.base;
  };

  const getPerformanceColor = (rate: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      if (rate >= 90) return 'text-success';
      if (rate >= 80) return 'text-warning';
      return 'text-error';
    } else {
      if (rate <= 5) return 'text-success';
      if (rate <= 10) return 'text-warning';
      return 'text-error';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="xl" padding="lg">
          <LoadingState 
            message="Loading your performance data..." 
            size="lg" 
            variant="spinner"
          />
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  if (error || !performanceData) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="lg" padding="lg">
          <ErrorState
            title="Unable to Load Performance Data"
            message={error || 'No data available'}
            onRetry={fetchPerformanceData}
            showDetails={false}
          />
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  const bonusTierInfo = getBonusTierInfo(performanceData.overview.current_bonus_tier);

  // Prepare metrics for MetricsGrid
  const metrics = [
    {
      title: 'Total Lessons',
      value: performanceData.overview.total_lessons,
      icon: <Calendar className="w-6 h-6" />,
      iconBgColor: 'bg-accent/20',
      iconColor: 'text-accent'
    },
    {
      title: 'Average Rating',
      value: performanceData.ratings.average_rating,
      subtitle: `${performanceData.ratings.total_ratings} reviews`,
      icon: <Star className="w-6 h-6" />,
      iconBgColor: 'bg-warning/20',
      iconColor: 'text-warning'
    },
    {
      title: 'Completion Rate',
      value: `${performanceData.performance.completion_rate}%`,
      icon: <CheckCircle className="w-6 h-6" />,
      iconBgColor: 'bg-success/20',
      iconColor: 'text-success'
    },
    {
      title: 'Total Students',
      value: performanceData.overview.total_students,
      icon: <Users className="w-6 h-6" />,
      iconBgColor: 'bg-primary/20',
      iconColor: 'text-primary'
    }
  ];

  return (
    <TutorLayout>
      <TutorPageLayout containerWidth="xl" padding="lg">
        <TutorPageHeader
          title="Performance Dashboard"
          subtitle="Track your teaching metrics and student feedback"
          titleVariant="h1"
          subtitleVariant="body"
          actions={
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
              aria-label="Select time range"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          }
        />

        {/* Bonus Tier Banner */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-accent/10 to-primary/10 border border-border rounded-xl" variant="outlined">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center">
              <div className="text-4xl mr-4">{bonusTierInfo.icon}</div>
              <div>
                <Text variant="h3" className="text-token-primary mb-1">
                  Current Tier: {bonusTierInfo.name}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Earning {bonusTierInfo.bonus} bonus on all lessons
                </Text>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${bonusTierInfo.color}`}>
                {bonusTierInfo.name} Tier
              </span>
            </div>
          </div>
        </Card>

        {/* Key Metrics Cards */}
        <MetricsGrid 
          metrics={metrics} 
          columns={4} 
          className="mb-8"
          cardVariant="default"
          cardPadding="lg"
        />

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Overview */}
          <Card className="p-6 rounded-xl shadow-sm" variant="default">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Performance Metrics</Text>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-token-success/5 rounded-lg border border-token-success/20">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-token-success mr-3" />
                  <Text variant="body" className="text-token-text-secondary">Completion Rate</Text>
                </div>
                <Text variant="body" className={`font-semibold ${getPerformanceColor(performanceData.performance.completion_rate)}`}>
                  {performanceData.performance.completion_rate}%
                </Text>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-token-info/5 rounded-lg border border-token-info/20">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-token-info mr-3" />
                  <Text variant="body" className="text-token-text-secondary">Attendance Rate</Text>
                </div>
                <Text variant="body" className={`font-semibold ${getPerformanceColor(performanceData.performance.attendance_rate)}`}>
                  {performanceData.performance.attendance_rate}%
                </Text>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-token-warning/5 rounded-lg border border-token-warning/20">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-token-warning mr-3" />
                  <Text variant="body" className="text-token-text-secondary">Cancellation Rate</Text>
                </div>
                <Text variant="body" className={`font-semibold ${getPerformanceColor(100 - performanceData.performance.cancellation_rate)}`}>
                  {performanceData.performance.cancellation_rate}%
                </Text>
              </div>
            </div>
          </Card>

          {/* Student Engagement */}
          <Card className="p-6 rounded-xl shadow-sm" variant="default">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-token-success/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-token-success" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Student Engagement</Text>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-primary mr-3" />
                  <Text variant="body" className="text-token-text-secondary">Active Students</Text>
                </div>
                <Text variant="body" className="font-semibold text-primary">
                  {performanceData.overview.active_students}
                </Text>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-center">
                  <Target className="w-4 h-4 text-accent mr-3" />
                  <Text variant="body" className="text-token-text-secondary">Repeat Students</Text>
                </div>
                <Text variant="body" className="font-semibold text-accent">
                  {Math.round((performanceData.overview.active_students / performanceData.overview.total_students) * 100)}%
                </Text>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-token-warning/5 rounded-lg border border-token-warning/20">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-token-warning mr-3" />
                  <Text variant="body" className="text-token-text-secondary">Average Rating</Text>
                </div>
                <div className="flex items-center">
                  <Text variant="body" className="font-semibold text-token-warning mr-1">
                    {performanceData.ratings.average_rating}
                  </Text>
                  <Text variant="small" className="text-token-text-muted">
                    ({performanceData.ratings.total_ratings})
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card className="p-6 rounded-xl" variant="default">
            <div className="flex items-center mb-4">
              <Star className="w-5 h-5 text-token-primary mr-2" />
              <Text variant="h3" className="text-token-primary">Rating Distribution</Text>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-warning fill-current" />
                    ))}
                  </div>
                  <Text variant="body" className="text-token-text-secondary ml-2">5 Stars</Text>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-surface-muted rounded-full h-2 mr-2">
                    <div 
                      className="bg-warning h-2 rounded-full" 
                      style={{ 
                        width: `${performanceData.ratings.total_ratings > 0 ? (performanceData.ratings.distribution[5] / performanceData.ratings.total_ratings) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <Text variant="small" className="text-token-text-primary font-medium">
                    {performanceData.ratings.distribution[5]}
                  </Text>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex">
                    {[1,2,3,4].map(i => (
                      <Star key={i} className="w-4 h-4 text-warning fill-current" />
                    ))}
                    <Star className="w-4 h-4 text-text-muted" />
                  </div>
                  <Text variant="body" className="text-token-text-secondary ml-2">4 Stars</Text>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-surface-muted rounded-full h-2 mr-2">
                    <div 
                      className="bg-accent h-2 rounded-full" 
                      style={{ 
                        width: `${performanceData.ratings.total_ratings > 0 ? (performanceData.ratings.distribution[4] / performanceData.ratings.total_ratings) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <Text variant="small" className="text-token-text-primary font-medium">
                    {performanceData.ratings.distribution[4]}
                  </Text>
                </div>
              </div>
              
              <div className="pt-4 border-t border-token">
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary">Total Reviews</Text>
                  <Text variant="body" className="font-medium text-token-text-primary">
                    {performanceData.ratings.total_ratings}
                  </Text>
                </div>
              </div>
            </div>
          </Card>

        {/* Recent Feedback & Top Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Feedback */}
          <Card className="p-6 rounded-xl shadow-sm" variant="default">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-accent" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Recent Feedback</Text>
            </div>
            
            <div className="space-y-4">
              {performanceData.ratings.recent_feedback.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-token-text-muted/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-token-text-muted" />
                  </div>
                  <Text variant="body" className="text-token-text-secondary">
                    No feedback yet
                  </Text>
                </div>
              ) : (
                performanceData.ratings.recent_feedback.slice(0, 3).map((feedback, index) => (
                  <div key={index} className="p-4 bg-token-surface-accent rounded-lg border-l-4 border-accent/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {[1,2,3,4,5].map(i => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i <= feedback.rating ? 'text-token-warning fill-current' : 'text-token-text-muted'}`} 
                          />
                        ))}
                      </div>
                      <Text variant="small" className="text-token-text-muted">
                        {formatDate(feedback.created_at)}
                      </Text>
                    </div>
                    {feedback.comment && (
                      <Text variant="body" className="text-token-text-secondary mb-3 leading-relaxed">
                        "{feedback.comment}"
                      </Text>
                    )}
                    {feedback.tags && feedback.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {feedback.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-3 py-1 bg-token-success/20 text-token-success rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Top Feedback Tags */}
          <Card className="p-6 rounded-xl shadow-sm" variant="default">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-token-success/20 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-token-success" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Top Strengths</Text>
            </div>
            
            <div className="space-y-3">
              {performanceData.performance.top_feedback_tags.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-token-text-muted/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-token-text-muted" />
                  </div>
                  <Text variant="body" className="text-token-text-secondary">
                    No feedback tags yet
                  </Text>
                </div>
              ) : (
                performanceData.performance.top_feedback_tags.slice(0, 8).map((tag, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-token-surface-accent rounded-lg">
                    <Text variant="body" className="text-token-text font-medium capitalize">
                      {tag.tag.replace(/_/g, ' ')}
                    </Text>
                    <div className="flex items-center">
                      <div className="w-20 bg-token-surface-muted rounded-full h-2 mr-3">
                        <div 
                          className="bg-token-success h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${(tag.count / Math.max(...performanceData.performance.top_feedback_tags.map(t => t.count))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <Text variant="small" className="text-token-success font-semibold">
                        {tag.count}
                      </Text>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="p-6 rounded-xl shadow-sm" variant="default">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <Text variant="h3" className="text-token-text font-semibold">Monthly Trends</Text>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-token-text-secondary font-semibold">Month</th>
                  <th className="text-left py-4 px-4 text-token-text-secondary font-semibold">Lessons</th>
                  <th className="text-left py-4 px-4 text-token-text-secondary font-semibold">Rating</th>
                  <th className="text-left py-4 px-4 text-token-text-secondary font-semibold">Completion</th>
                  <th className="text-left py-4 px-4 text-token-text-secondary font-semibold">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.trends.monthly_data.map((month, index) => (
                  <tr key={index} className="border-b border-border hover:bg-token-surface-accent transition-colors">
                    <td className="py-4 px-4">
                      <Text variant="body" className="font-semibold text-token-text">
                        {month.month_name}
                      </Text>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        <Text variant="body" className="text-token-text font-medium">
                          {month.lessons_taught}
                        </Text>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-token-warning fill-current mr-2" />
                        <Text variant="body" className="text-token-text font-medium">
                          {month.average_rating || 'N/A'}
                        </Text>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${month.completion_rate >= 90 ? 'bg-token-success' : month.completion_rate >= 70 ? 'bg-token-warning' : 'bg-token-error'}`}></div>
                        <Text variant="body" className={`font-semibold ${getPerformanceColor(month.completion_rate)}`}>
                          {Math.round(month.completion_rate)}%
                        </Text>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Text variant="body" className="text-token-text font-medium">
                        {month.total_feedback}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TutorPageLayout>
    </TutorLayout>
  );
} 