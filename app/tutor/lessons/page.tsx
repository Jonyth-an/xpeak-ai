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
  RefreshCw
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

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
      if (diffInMinutes < 60) {
        return `in ${diffInMinutes} minutes`;
      }
      return `in ${diffInHours} hours`;
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getLessonStatus = (lesson: Lesson) => {
    if (lesson.status === 'cancelled') return 'Cancelled';
    if (lesson.status === 'completed') return 'Completed';
    if (lesson.status === 'reschedule_requested') return 'Reschedule Requested';
    if (lesson.status === 'pending') return 'Needs Review';
    return lesson.status;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'reschedule_requested': return 'text-orange-600 bg-orange-50';
      case 'pending': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
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
        <Card className="p-6 bg-orange-50 border border-orange-200 mb-6" variant="outlined">
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
            <Text variant="h3" className="font-bold text-gray-900 mb-4">
              Lessons with Reschedule Requests ({lessonsWithRescheduleRequests.length})
            </Text>
            <div className="space-y-4">
              {lessonsWithRescheduleRequests.map((lesson) => {
                const rescheduleRequest = rescheduleRequests.find(req => req.lesson_id === lesson.id);
                return (
                  <Card key={lesson.id} className="p-6 border-2 border-orange-200 bg-orange-50" variant="outlined">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Text variant="subtitle" className="font-semibold text-gray-900">
                              {lesson.student.name}
                            </Text>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                              {getLessonStatus(lesson)}
                            </span>
                          </div>
                          <Text variant="body" className="text-gray-600 mb-2">
                            {lesson.lesson_type} • {lesson.duration_minutes} minutes
                          </Text>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDateTime(lesson.scheduled_start)}
                            </div>
                          </div>

                          {/* Reschedule Request Details */}
                          {rescheduleRequest && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                              <div className="flex items-center mb-3">
                                <RefreshCw className="w-4 h-4 text-orange-600 mr-2" />
                                <Text variant="subtitle" className="font-semibold text-orange-800">
                                  Reschedule Request
                                </Text>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Text variant="caption" className="text-gray-500 font-medium">Current Schedule</Text>
                                  <Text variant="body" className="text-gray-900">
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
                                <div>
                                  <Text variant="caption" className="text-gray-500 font-medium">Requested New Time</Text>
                                  <Text variant="body" className="text-gray-900">
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
                                <div className="mt-3">
                                  <Text variant="caption" className="text-gray-500 font-medium">Reason</Text>
                                  <Text variant="body" className="text-gray-900">{rescheduleRequest.reason}</Text>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/lessons/${lesson.id}`, '_blank')}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        
                        {rescheduleRequest && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRescheduleAction(rescheduleRequest.id, 'approve')}
                              disabled={rescheduleActionLoading === rescheduleRequest.id}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {rescheduleActionLoading === rescheduleRequest.id ? 'Approving...' : 'Approve'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRescheduleAction(rescheduleRequest.id, 'reject')}
                              disabled={rescheduleActionLoading === rescheduleRequest.id}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {rescheduleActionLoading === rescheduleRequest.id ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </>
                        )}
                      </div>
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
            <Text variant="h3" className="font-bold text-gray-900 mb-4">
              Other Lessons ({regularLessons.length})
            </Text>
            <div className="space-y-4">
              {regularLessons.map((lesson) => (
                <Card key={lesson.id} className="p-6" variant="outlined">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Text variant="subtitle" className="font-semibold text-gray-900">
                            {lesson.student.name}
                          </Text>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                            {getLessonStatus(lesson)}
                          </span>
                        </div>
                        <Text variant="body" className="text-gray-600 mb-2">
                          {lesson.lesson_type} • {lesson.duration_minutes} minutes
                        </Text>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDateTime(lesson.scheduled_start)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/lessons/${lesson.id}`, '_blank')}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {lessons.length === 0 && (
          <Card className="p-8 text-center" variant="outlined">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <Text variant="h4" className="font-semibold text-gray-900 mb-2">
              No upcoming lessons
            </Text>
            <Text variant="body" className="text-gray-600">
              You don't have any upcoming lessons scheduled.
            </Text>
          </Card>
        )}
      </TutorPageLayout>
    </TutorLayout>
  );
} 