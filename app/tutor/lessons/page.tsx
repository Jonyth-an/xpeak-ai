'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { 
  Card, 
  Text, 
  Button, 
  TutorPageLayout, 
  TutorPageHeader, 
  LoadingState, 
  ErrorState 
} from '@/app/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { 
  Clock,
  User,
  Video,
  Eye,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Globe
} from 'lucide-react';

interface UpcomingLesson {
  id: string;
  student_name: string;
  student_country: string;
  student_avatar?: string;
  lesson_type: string;
  duration: number;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  has_reschedule_request: boolean;
  reschedule_requested_at?: string;
  proposed_new_time?: string;
  minutes_until: number;
  can_join: boolean;
}

export default function UpcomingLessons() {
  const [lessons, setLessons] = useState<UpcomingLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingLessons();
    // Refresh every minute to update countdown timers
    const interval = setInterval(fetchUpcomingLessons, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUpcomingLessons = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // For now, we'll use the dashboard API and extract upcoming lessons
      const response = await fetch('/api/tutor/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Convert today's schedule to upcoming lessons format
        const upcomingLessons = data.today_schedule.map((lesson: any) => {
          const now = new Date();
          const scheduledStart = new Date(lesson.scheduled_start);
          const minutesUntil = Math.max(0, Math.floor((scheduledStart.getTime() - now.getTime()) / (1000 * 60)));
          
          return {
            id: lesson.id,
            student_name: lesson.student_name,
            student_country: lesson.student_country,
            student_avatar: lesson.student_avatar,
            lesson_type: lesson.lesson_type,
            duration: lesson.duration,
            scheduled_start: lesson.scheduled_start,
            scheduled_end: lesson.scheduled_start, // Will be calculated
            status: lesson.status,
            has_reschedule_request: lesson.has_reschedule_request,
            reschedule_requested_at: lesson.reschedule_requested_at,
            minutes_until: minutesUntil,
            can_join: minutesUntil <= 15 && minutesUntil >= 0
          };
        });

        // Add next lesson if it exists
        if (data.next_lesson) {
          const nextLesson = {
            id: data.next_lesson.id,
            student_name: data.next_lesson.student_name,
            student_country: data.next_lesson.student_country,
            student_avatar: data.next_lesson.student_avatar,
            lesson_type: data.next_lesson.lesson_type,
            duration: data.next_lesson.duration,
            scheduled_start: data.next_lesson.scheduled_start,
            scheduled_end: data.next_lesson.scheduled_end,
            status: data.next_lesson.status,
            has_reschedule_request: false,
            minutes_until: data.next_lesson.minutes_until,
            can_join: data.next_lesson.can_join
          };

          // Add to lessons if not already in today's schedule
          if (!upcomingLessons.find((l: any) => l.id === nextLesson.id)) {
            upcomingLessons.unshift(nextLesson);
          }
        }

        // Sort by scheduled start time
        upcomingLessons.sort((a: any, b: any) => 
          new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()
        );

        setLessons(upcomingLessons);
      } else {
        setError('Failed to load upcoming lessons');
      }
    } catch (error) {
      console.error('Error fetching upcoming lessons:', error);
      setError('An error occurred while loading lessons');
    } finally {
      setLoading(false);
    }
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getStatusBadge = (lesson: UpcomingLesson) => {
    if (lesson.has_reschedule_request) {
      return (
        <span className="px-2 py-1 bg-token-warning-light text-token-warning rounded text-xs font-medium">
          Reschedule Request
        </span>
      );
    } else if (lesson.status === 'confirmed') {
      return (
        <span className="px-2 py-1 bg-token-success-light text-token-success rounded text-xs font-medium">
          Confirmed
        </span>
      );
    }
    return null;
  };

  const getTimeStatus = (lesson: UpcomingLesson) => {
    if (lesson.minutes_until <= 0) {
      return {
        text: 'Starting now',
        color: 'text-token-error',
        urgent: true
      };
    } else if (lesson.minutes_until <= 15) {
      return {
        text: `Ready in ${lesson.minutes_until} minutes`,
        color: 'text-token-warning',
        urgent: true
      };
    } else if (lesson.minutes_until <= 60) {
      return {
        text: `in ${lesson.minutes_until} minutes`,
        color: 'text-token-info',
        urgent: false
      };
    } else {
      const hours = Math.floor(lesson.minutes_until / 60);
      return {
        text: `in ${hours} hour${hours > 1 ? 's' : ''}`,
        color: 'text-token-text-secondary',
        urgent: false
      };
    }
  };

  if (loading) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="lg" padding="lg">
          <LoadingState 
            message="Loading your upcoming lessons..." 
            size="lg" 
            variant="spinner"
          />
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <TutorPageLayout containerWidth="lg" padding="lg">
        <TutorPageHeader
          title="Upcoming Lessons"
          subtitle="Here are your upcoming lessons. Be ready a few minutes early!"
          titleVariant="h1"
          subtitleVariant="body"
        />

        {/* Rescheduling Rules */}
        <Card className="p-6 bg-orange-50 border border-orange-200 mb-6" variant="outlined">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <Text variant="h4" className="text-orange-800 mb-2">Rescheduling Rules</Text>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Students can request to reschedule if more than 12 hours before the lesson</li>
                <li>• Tutors are expected to avoid cancellations within 12 hours of the lesson start time</li>
                <li>• All reschedule requests require confirmation from both parties</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Lessons List */}
        {error ? (
          <ErrorState
            title="Unable to Load Lessons"
            message={error}
            onRetry={fetchUpcomingLessons}
            showDetails={false}
          />
        ) : lessons.length === 0 ? (
          <Card className="p-12 text-center" variant="outlined">
            <Calendar className="w-16 h-16 text-token-text-muted mx-auto mb-4" />
            <Text variant="h3" className="text-token-text-secondary mb-2">No Upcoming Lessons</Text>
            <Text variant="body" className="text-token-text-muted">
              Your upcoming lessons will appear here once students book your available time slots.
            </Text>
          </Card>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => {
              const timeStatus = getTimeStatus(lesson);
              
              return (
                <Card key={lesson.id} className="p-6" variant="default">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-token-primary rounded-full flex items-center justify-center text-white font-medium mr-4 flex-shrink-0">
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
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center mb-1">
                          <Text variant="h4" className="text-token-text-primary mr-2 truncate">
                            {lesson.student_name}
                          </Text>
                          <span className="text-lg mr-1 flex-shrink-0">{getCountryFlag(lesson.student_country)}</span>
                          <Text variant="small" className="text-token-text-secondary flex-shrink-0">
                            {lesson.student_country}
                          </Text>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-token-text-secondary">
                          <span>{formatDate(lesson.scheduled_start)}</span>
                          <span>{formatTime(lesson.scheduled_start)} - {formatTime(lesson.scheduled_end)}</span>
                          <span>{lesson.lesson_type}</span>
                          <span>{lesson.duration} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {getStatusBadge(lesson)}
                      
                      <div className="text-right">
                        <div className={`font-medium ${timeStatus.color}`}>
                          {timeStatus.text}
                        </div>
                        {timeStatus.urgent && (
                          <Text variant="small" className="text-token-text-secondary">
                            {timeStatus.text.includes('Ready') ? 'Ready' : 'Status'}
                          </Text>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {lesson.can_join ? (
                          <Button variant="primary" size="sm">
                            <Video className="w-4 h-4 mr-2" />
                            Join Lesson
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reschedule Request */}
                  {lesson.has_reschedule_request && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <Text variant="body" className="text-red-800 font-medium">
                              Reschedule Request: This student has requested to reschedule your upcoming lesson. Please review and confirm the new time.
                            </Text>
                            {lesson.proposed_new_time && (
                              <Text variant="small" className="text-red-700 mt-1">
                                Proposed new time: Tomorrow, 7:00 PM - 7:30 PM
                              </Text>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="primary" size="sm">
                            Accept New Time
                          </Button>
                          <Button variant="outline" size="sm">
                            Propose Different Time
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message Student
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </TutorPageLayout>
    </TutorLayout>
  );
} 