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
  Globe,
  Check,
  X,
  Ban,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface Lesson {
  id: string;
  lesson_type: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  created_at: string;
  minutes_until: number;
  can_join: boolean;
  student: {
    name: string;
    email: string;
    profile_image_url?: string;
  };
}

interface RescheduleRequest {
  id: string;
  lesson_id: string;
  requested_by: string;
  requested_date: string;
  requested_start_time: string;
  requested_end_time: string;
  reason: string;
  status: string;
  created_at: string;
  lesson: {
    id: string;
    student_id: string;
    lesson_type: string;
    scheduled_start: string;
    scheduled_end: string;
    duration_minutes: number;
    student: {
      name: string;
      email: string;
      profile_image_url?: string;
    };
  };
}

export default function TutorLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rescheduleActionLoading, setRescheduleActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
    fetchRescheduleRequests();
    // Refresh every minute to update countdown timers and join availability
    const interval = setInterval(() => {
      fetchLessons();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }

      const response = await fetch('/api/tutor/lessons?upcoming=true&limit=20', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      } else {
        console.error('Failed to fetch lessons:', response.status);
        setError('Failed to fetch lessons');
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('Error fetching lessons');
    } finally {
      setLoading(false);
    }
  };

  const fetchRescheduleRequests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/reschedule-requests/pending', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRescheduleRequests(data.requests || []);
      } else {
        console.error('Failed to fetch reschedule requests:', response.status);
      }
    } catch (error) {
      console.error('Error fetching reschedule requests:', error);
    }
  };

  const handleRescheduleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setRescheduleActionLoading(requestId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/reschedule-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh both lessons and reschedule requests
        await Promise.all([fetchLessons(), fetchRescheduleRequests()]);
      } else {
        console.error(`Failed to ${action} reschedule request:`, response.status);
      }
    } catch (error) {
      console.error(`Error ${action}ing reschedule request:`, error);
    } finally {
      setRescheduleActionLoading(null);
    }
  };

  const handleConfirmLesson = async (lessonId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/lessons/${lessonId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh lessons
        await fetchLessons();
      } else {
        console.error('Failed to confirm lesson:', response.status);
      }
    } catch (error) {
      console.error('Error confirming lesson:', error);
    }
  };

  const handleCancelLesson = async (lessonId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/lessons/${lessonId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh lessons
        await fetchLessons();
      } else {
        console.error('Failed to cancel lesson:', response.status);
      }
    } catch (error) {
      console.error('Error cancelling lesson:', error);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes <= 0) {
      return 'Starting now';
    } else if (diffInMinutes < 60) {
      return `in ${diffInMinutes} minutes`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      if (minutes === 0) {
        return `in ${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `in ${hours}h ${minutes}m`;
      }
    } else { // 24 hours or more
      const days = Math.floor(diffInMinutes / 1440);
      const remainingMinutes = diffInMinutes % 1440;
      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      
      if (hours === 0 && minutes === 0) {
        return `in ${days} day${days > 1 ? 's' : ''}`;
      } else if (minutes === 0) {
        return `in ${days}d ${hours}h`;
      } else {
        return `in ${days}d ${hours}h ${minutes}m`;
      }
    }
  };

  const getLessonStatus = (lesson: Lesson) => {
    if (lesson.status === 'cancelled') return 'Cancelled';
    if (lesson.status === 'completed') return 'Completed';
    if (lesson.status === 'reschedule_requested') return 'Reschedule Requested';
    if (lesson.status === 'pending') return 'Needs Review';
    if (lesson.status === 'confirmed') return 'Confirmed';
    return lesson.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-token-success bg-token-success-light border-token-success/20';
      case 'pending':
        return 'text-token-warning bg-token-warning-light border-token-warning/20';
      case 'completed':
        return 'text-token-info bg-token-info-light border-token-info/20';
      case 'cancelled':
        return 'text-token-error bg-token-error-light border-token-error/20';
      case 'no_show':
        return 'text-token-error bg-token-error-light border-token-error/20';
      case 'reschedule_requested':
        return 'text-token-warning bg-token-warning-light border-token-warning/20';
      default:
        return 'text-token-text-secondary bg-token-surface-accent border-token-border';
    }
  };

  // Add status icons
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'cancelled':
        return <X className="w-3.5 h-3.5" />;
      case 'no_show':
        return <X className="w-3.5 h-3.5" />;
      case 'reschedule_requested':
        return <RefreshCw className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  // Enhanced time formatting with timezone
  const formatLessonTime = (scheduledStart: string) => {
    const lessonDate = new Date(scheduledStart);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const lessonDay = new Date(lessonDate.getFullYear(), lessonDate.getMonth(), lessonDate.getDate());
    
    let dayLabel = '';
    if (lessonDay.getTime() === today.getTime()) {
      dayLabel = 'Today';
    } else if (lessonDay.getTime() === tomorrow.getTime()) {
      dayLabel = 'Tomorrow';
    } else {
      dayLabel = lessonDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
    
    const timeString = lessonDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Get timezone abbreviation (simplified)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneAbbr = timezone.includes('America/New_York') ? 'EST' :
                        timezone.includes('America/Chicago') ? 'CST' :
                        timezone.includes('America/Denver') ? 'MST' :
                        timezone.includes('America/Los_Angeles') ? 'PST' :
                        timezone.includes('Europe/London') ? 'GMT' :
                        timezone.includes('Asia/Shanghai') ? 'CST' :
                        timezone.includes('Asia/Tokyo') ? 'JST' :
                        'GMT';
    
    return `${dayLabel} at ${timeString} (${timezoneAbbr})`;
  };

  // Enhanced time until formatting with highlighting
  const formatTimeUntilHighlighted = (minutesUntil: number) => {
    const timeString = formatDateTime(new Date(Date.now() + minutesUntil * 60000).toISOString());
    
    if (minutesUntil <= 15) {
      return <span className="text-orange-600 font-medium">{timeString}</span>;
    } else if (minutesUntil <= 60) {
      return <span className="text-orange-500">{timeString}</span>;
    } else {
      return <span className="text-token-text-secondary">{timeString}</span>;
    }
  };

  // Separate lessons with reschedule requests from regular lessons
  const lessonsWithRescheduleRequests = lessons.filter(lesson => 
    rescheduleRequests.some(req => req.lesson_id === lesson.id)
  );
  
  const regularLessons = lessons.filter(lesson => 
    !rescheduleRequests.some(req => req.lesson_id === lesson.id)
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <TutorLayout>
      <TutorPageLayout>
        <TutorPageHeader
          title="Upcoming Lessons"
          subtitle="Manage your upcoming lessons and reschedule requests"
        />

        {/* Rescheduling Rules */}
        <Card className="p-6 bg-orange-50 border border-orange-200 rounded-xl mb-6" variant="outlined">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <Text variant="subtitle" className="font-semibold text-orange-800 mb-2">
                Rescheduling Rules
              </Text>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Students can request to reschedule if more than 12 hours before the lesson</li>
                <li>• Tutors are expected to avoid cancellations within 12 hours of the lesson start time</li>
                <li>• All reschedule requests require confirmation from both parties</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Lessons with Reschedule Requests */}
        {lessonsWithRescheduleRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-orange-600" />
              </div>
              <Text variant="h3" className="font-bold text-gray-900">
                Reschedule Requests ({lessonsWithRescheduleRequests.length})
              </Text>
            </div>
            <div className="space-y-4">
              {lessonsWithRescheduleRequests.map((lesson) => {
                const rescheduleRequest = rescheduleRequests.find(req => req.lesson_id === lesson.id);
                return (
                  <Card key={lesson.id} className="p-6 border border-gray-200 bg-orange-50 rounded-xl shadow-sm hover:shadow-md transition-shadow" variant="outlined">
                    <div className="flex items-start justify-between">
                      {/* Left Section: Avatar, Name, Time, Details */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Student Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          {lesson.student.profile_image_url ? (
                            <img 
                              src={lesson.student.profile_image_url} 
                              alt={lesson.student.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          {/* Name and Time Until */}
                          <div className="flex items-center gap-2 mb-1">
                            <Text variant="h3" as="h3" className="truncate">
                              {lesson.student.name}
                            </Text>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                              Student
                            </span>
                            {lesson.minutes_until >= 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${lesson.minutes_until <= 15 ? 'bg-token-warning animate-pulse' : 'bg-token-success'}`}></div>
                                <Text variant="small" className="text-token-text-secondary">
                                  {formatTimeUntilHighlighted(lesson.minutes_until)}
                                </Text>
                              </div>
                            )}
                          </div>
                          
                          {/* Lesson Time */}
                          <Text variant="body" className="text-token-text-secondary mb-3">
                            {formatLessonTime(lesson.scheduled_start)}
                          </Text>
                          
                          {/* Labeled Details */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-xs text-token-text-muted uppercase tracking-wide">Lesson Type</div>
                                <div className="font-medium text-token-text">{lesson.lesson_type}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-xs text-token-text-muted uppercase tracking-wide">Duration</div>
                                <div className="font-medium text-token-text">{lesson.duration_minutes} Minutes</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-xs text-token-text-muted uppercase tracking-wide">Status</div>
                                <div className="font-medium text-token-text">
                                  {lesson.status === 'confirmed' && lesson.can_join ? 'Ready to Join' :
                                   lesson.status === 'confirmed' ? 'Confirmed' :
                                   lesson.status === 'pending' ? 'Pending Confirmation' :
                                   getLessonStatus(lesson)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Reschedule Request Details */}
                          {rescheduleRequest && (
                            <div className="mt-4 p-4 bg-white rounded-xl border border-orange-200 shadow-sm">
                              <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                  <RefreshCw className="w-4 h-4 text-orange-600" />
                                </div>
                                <Text variant="subtitle" className="font-semibold text-orange-800">
                                  Reschedule Request
                                </Text>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                  <Text variant="caption" className="text-gray-500 font-medium uppercase tracking-wide">Current Schedule</Text>
                                  <Text variant="body" className="text-gray-900 font-medium">
                                    {new Date(lesson.scheduled_start).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </Text>
                                </div>
                                <div className="space-y-1">
                                  <Text variant="caption" className="text-gray-500 font-medium uppercase tracking-wide">Requested New Time</Text>
                                  <Text variant="body" className="text-gray-900 font-medium">
                                    {new Date(`${rescheduleRequest.requested_date}T${rescheduleRequest.requested_start_time}`).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </Text>
                                </div>
                              </div>
                              {rescheduleRequest.reason && (
                                <div className="mt-4 pt-4 border-t border-orange-100">
                                  <Text variant="caption" className="text-gray-500 font-medium uppercase tracking-wide mb-2 block">Reason</Text>
                                  <Text variant="body" className="text-gray-900 leading-relaxed">{rescheduleRequest.reason}</Text>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section: Status Badge */}
                      <div className="flex-shrink-0 ml-4">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${getStatusColor(lesson.status)}`}>
                          {getStatusIcon(lesson.status)}
                          {getLessonStatus(lesson)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Section: Action Buttons */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      {/* Join button for lessons within 60 minutes */}
                      {lesson.can_join && (
                        <Link href={`/lessons/${lesson.id}/video`}>
                          <Button variant="primary" size="sm" className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:shadow-md">
                            <Video className="w-3.5 h-3.5 mr-1.5" />
                            Join Lesson
                          </Button>
                        </Link>
                      )}
                      
                      {rescheduleRequest && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRescheduleAction(rescheduleRequest.id, 'approve')}
                            disabled={rescheduleActionLoading === rescheduleRequest.id}
                            className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-green-50 hover:border-green-300 text-green-600 border-green-200"
                          >
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                            {rescheduleActionLoading === rescheduleRequest.id ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRescheduleAction(rescheduleRequest.id, 'reject')}
                            disabled={rescheduleActionLoading === rescheduleRequest.id}
                            className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-red-50 hover:border-red-300 text-red-600 border-red-200"
                          >
                            <X className="w-3.5 h-3.5 mr-1.5" />
                            {rescheduleActionLoading === rescheduleRequest.id ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </>
                      )}
                      
                      {/* Show Cancel button for lessons that can be cancelled */}
                      {['pending', 'confirmed', 'reschedule_requested'].includes(lesson.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelLesson(lesson.id)}
                          className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      )}
                      
                      <Link href={`/lessons/${lesson.id}`}>
                        <Button variant="outline" size="sm" className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-gray-50 hover:border-gray-300">
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Lessons */}
        {regularLessons.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <Text variant="h3" className="font-bold text-gray-900">
                Other Lessons ({regularLessons.length})
              </Text>
            </div>
            <div className="space-y-4">
              {regularLessons.map((lesson) => (
                <Card key={lesson.id} className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow" variant="outlined">
                  <div className="flex items-start justify-between">
                    {/* Left Section: Avatar, Name, Time, Details */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Student Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {lesson.student.profile_image_url ? (
                          <img 
                            src={lesson.student.profile_image_url} 
                            alt={lesson.student.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        {/* Name and Time Until */}
                        <div className="flex items-center gap-2 mb-1">
                          <Text variant="h3" as="h3" className="truncate">
                            {lesson.student.name}
                          </Text>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                            Student
                          </span>
                          {lesson.minutes_until >= 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${lesson.minutes_until <= 15 ? 'bg-token-warning animate-pulse' : 'bg-token-success'}`}></div>
                              <Text variant="small" className="text-token-text-secondary">
                                {formatTimeUntilHighlighted(lesson.minutes_until)}
                              </Text>
                            </div>
                          )}
                        </div>
                        
                        {/* Lesson Time */}
                        <Text variant="body" className="text-token-text-secondary mb-3">
                          {formatLessonTime(lesson.scheduled_start)}
                        </Text>
                        
                        {/* Labeled Details */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-token-text-muted uppercase tracking-wide">Lesson Type</div>
                              <div className="font-medium text-token-text">{lesson.lesson_type}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-token-text-muted uppercase tracking-wide">Duration</div>
                              <div className="font-medium text-token-text">{lesson.duration_minutes} Minutes</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-token-text-muted uppercase tracking-wide">Status</div>
                              <div className="font-medium text-token-text">
                                {lesson.status === 'confirmed' && lesson.can_join ? 'Ready to Join' :
                                 lesson.status === 'confirmed' ? 'Confirmed' :
                                 lesson.status === 'pending' ? 'Pending Confirmation' :
                                 getLessonStatus(lesson)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section: Status Badge */}
                    <div className="flex-shrink-0 ml-4">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${getStatusColor(lesson.status)}`}>
                        {getStatusIcon(lesson.status)}
                        {getLessonStatus(lesson)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Section: Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    {/* Join button for lessons within 60 minutes */}
                    {lesson.can_join && (
                      <Link href={`/lessons/${lesson.id}/video`}>
                        <Button variant="primary" size="sm" className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:shadow-md">
                          <Video className="w-3.5 h-3.5 mr-1.5" />
                          Join Lesson
                        </Button>
                      </Link>
                    )}
                    
                    {/* Show Confirm and Cancel buttons for pending lessons */}
                    {lesson.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfirmLesson(lesson.id)}
                          className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-green-50 hover:border-green-300 text-green-600 border-green-200"
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelLesson(lesson.id)}
                          className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    <Link href={`/lessons/${lesson.id}`}>
                      <Button variant="outline" size="sm" className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-gray-50 hover:border-gray-300">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {lessons.length === 0 && (
          <Card className="p-12 text-center border border-gray-200 rounded-xl shadow-sm" variant="outlined">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <Text variant="h3" className="font-bold text-gray-900 mb-3">
              No upcoming lessons
            </Text>
            <Text variant="body" className="text-gray-600 max-w-md mx-auto leading-relaxed">
              You don't have any upcoming lessons scheduled. New lesson requests will appear here once students book with you.
            </Text>
          </Card>
        )}
      </TutorPageLayout>
    </TutorLayout>
  );
} 