'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Text, Button } from '@/app/components/ui';
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
      base: { name: 'Base', color: 'bg-gray-100 text-gray-800', icon: '🌟', bonus: '0%' },
      bronze: { name: 'Bronze', color: 'bg-orange-100 text-orange-800', icon: '🥉', bonus: '5%' },
      silver: { name: 'Silver', color: 'bg-gray-100 text-gray-800', icon: '🥈', bonus: '10%' },
      gold: { name: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: '🥇', bonus: '15%' },
      platinum: { name: 'Platinum', color: 'bg-purple-100 text-purple-800', icon: '💎', bonus: '20%' }
    };
    return tiers[tier as keyof typeof tiers] || tiers.base;
  };

  const getPerformanceColor = (rate: number, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      if (rate >= 90) return 'text-green-600';
      if (rate >= 80) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (rate <= 5) return 'text-green-600';
      if (rate <= 10) return 'text-yellow-600';
      return 'text-red-600';
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
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary"></div>
        </div>
      </TutorLayout>
    );
  }

  if (error || !performanceData) {
    return (
      <TutorLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <Text variant="h2" className="text-token-error mb-2">Unable to Load Performance Data</Text>
            <Text variant="body" className="text-token-text-secondary mb-4">{error}</Text>
            <Button variant="primary" onClick={fetchPerformanceData}>Retry</Button>
          </div>
        </div>
      </TutorLayout>
    );
  }

  const bonusTierInfo = getBonusTierInfo(performanceData.overview.current_bonus_tier);

  return (
    <TutorLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Text variant="h1" as="h1" className="text-token-primary mb-2">
                Performance Dashboard
              </Text>
              <Text variant="body" className="text-token-text-secondary">
                Track your teaching metrics and student feedback
              </Text>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-token rounded-md bg-token-surface"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Bonus Tier Banner */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-token">
            <div className="flex items-center justify-between">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="text-token-text-secondary mb-1">
                    Total Lessons
                  </Text>
                  <Text variant="h2" className="text-2xl font-bold text-token-text-primary">
                    {performanceData.overview.total_lessons}
                  </Text>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="text-token-text-secondary mb-1">
                    Average Rating
                  </Text>
                  <div className="flex items-center">
                    <Text variant="h2" className="text-2xl font-bold text-token-text-primary mr-2">
                      {performanceData.ratings.average_rating}
                    </Text>
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="text-token-text-secondary mb-1">
                    Completion Rate
                  </Text>
                  <Text variant="h2" className={`text-2xl font-bold ${getPerformanceColor(performanceData.performance.completion_rate)}`}>
                    {performanceData.performance.completion_rate}%
                  </Text>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="text-token-text-secondary mb-1">
                    Total Students
                  </Text>
                  <Text variant="h2" className="text-2xl font-bold text-token-text-primary">
                    {performanceData.overview.total_students}
                  </Text>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Overview */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Performance Metrics</Text>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <Text variant="body" className="text-token-text-secondary">Completion Rate</Text>
                  </div>
                  <Text variant="body" className={`font-medium ${getPerformanceColor(performanceData.performance.completion_rate)}`}>
                    {performanceData.performance.completion_rate}%
                  </Text>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-blue-600 mr-2" />
                    <Text variant="body" className="text-token-text-secondary">Attendance Rate</Text>
                  </div>
                  <Text variant="body" className={`font-medium ${getPerformanceColor(performanceData.performance.attendance_rate)}`}>
                    {performanceData.performance.attendance_rate}%
                  </Text>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-600 mr-2" />
                    <Text variant="body" className="text-token-text-secondary">Cancellation Rate</Text>
                  </div>
                  <Text variant="body" className={`font-medium ${getPerformanceColor(performanceData.performance.cancellation_rate, false)}`}>
                    {performanceData.performance.cancellation_rate}%
                  </Text>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-purple-600 mr-2" />
                    <Text variant="body" className="text-token-text-secondary">Avg Lessons/Student</Text>
                  </div>
                  <Text variant="body" className="font-medium text-token-text-primary">
                    {performanceData.performance.avg_lessons_per_student}
                  </Text>
                </div>
              </div>
            </Card>

            {/* Rating Distribution */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Rating Distribution</Text>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <Text variant="body" className="text-token-text-secondary ml-2">5 Stars</Text>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
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
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                    <Text variant="body" className="text-token-text-secondary ml-2">4 Stars</Text>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
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
          </div>

          {/* Recent Feedback & Top Tags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Feedback */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Recent Feedback</Text>
              </div>
              
              <div className="space-y-4">
                {performanceData.ratings.recent_feedback.length === 0 ? (
                  <Text variant="body" className="text-token-text-secondary text-center py-4">
                    No feedback yet
                  </Text>
                ) : (
                  performanceData.ratings.recent_feedback.slice(0, 3).map((feedback, index) => (
                    <div key={index} className="border-b border-token pb-3 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {[1,2,3,4,5].map(i => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i <= feedback.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <Text variant="small" className="text-token-text-muted">
                          {formatDate(feedback.created_at)}
                        </Text>
                      </div>
                      {feedback.comment && (
                        <Text variant="body" className="text-token-text-secondary mb-2">
                          "{feedback.comment}"
                        </Text>
                      )}
                      {feedback.tags && feedback.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {feedback.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-token-info-light text-token-info rounded text-xs">
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
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Top Strengths</Text>
              </div>
              
              <div className="space-y-3">
                {performanceData.performance.top_feedback_tags.length === 0 ? (
                  <Text variant="body" className="text-token-text-secondary text-center py-4">
                    No feedback tags yet
                  </Text>
                ) : (
                  performanceData.performance.top_feedback_tags.slice(0, 8).map((tag, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Text variant="body" className="text-token-text-secondary capitalize">
                        {tag.tag.replace(/_/g, ' ')}
                      </Text>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(tag.count / Math.max(...performanceData.performance.top_feedback_tags.map(t => t.count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <Text variant="small" className="text-token-text-primary font-medium">
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
          <Card className="p-6 bg-token-surface border border-token">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-token-primary mr-2" />
              <Text variant="h3" className="text-token-primary">Monthly Trends</Text>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-token">
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Month</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Lessons</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Rating</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Completion</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.trends.monthly_data.map((month, index) => (
                    <tr key={index} className="border-b border-token hover:bg-token-surface-subtle">
                      <td className="py-3 px-4">
                        <Text variant="body" className="font-medium text-token-text-primary">
                          {month.month_name}
                        </Text>
                      </td>
                      <td className="py-3 px-4">
                        <Text variant="body" className="text-token-text-primary">
                          {month.lessons_taught}
                        </Text>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                          <Text variant="body" className="text-token-text-primary">
                            {month.average_rating || 'N/A'}
                          </Text>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Text variant="body" className={`font-medium ${getPerformanceColor(month.completion_rate)}`}>
                          {Math.round(month.completion_rate)}%
                        </Text>
                      </td>
                      <td className="py-3 px-4">
                        <Text variant="body" className="text-token-text-primary">
                          {month.total_feedback}
                        </Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
} 