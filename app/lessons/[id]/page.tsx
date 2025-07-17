'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  Text, 
  Button, 
  LoadingState, 
  ErrorState,
  Avatar,
  Badge
} from '@/app/components/ui';
import { Modal } from '@/app/components/ui/Modal';
import { FormField, TextArea } from '@/app/components/ui/Form';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Video,
  MessageCircle,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
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
  lesson_notes?: string;
  student_goals?: string;
  homework_assigned?: string;
  created_at: string;
  tutor: {
    id: string;
    display_name: string;
    profile_image_url?: string;
    bio?: string;
    teaching_style?: string;
  };
  student: {
    id: string;
    email: string;
    user_metadata?: any;
  };
}

interface RescheduleRequest {
  id: string;
  status: string;
  requestedBy: {
    id: string;
    email: string;
    name: string;
    type: string;
  };
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  reason: string;
  currentScheduledStart: string;
  currentScheduledEnd: string;
  proposedDate?: string;
  proposedStartTime?: string;
  proposedEndTime?: string;
  tutorResponse?: string;
  tutorResponseReason?: string;
  createdAt: string;
  respondedAt?: string;
}

export default function LessonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [editForm, setEditForm] = useState({
    student_goals: '',
    lesson_notes: '',
    homework_assigned: ''
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    requestedDate: '',
    requestedStartTime: '',
    requestedEndTime: '',
    reason: ''
  });
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rescheduleRequest, setRescheduleRequest] = useState<RescheduleRequest | null>(null);
  const [loadingRescheduleRequest, setLoadingRescheduleRequest] = useState(false);
  const [respondingToReschedule, setRespondingToReschedule] = useState(false);
  const [showProposeTimeModal, setShowProposeTimeModal] = useState(false);
  const [proposeTimeForm, setProposeTimeForm] = useState({
    proposedDate: '',
    proposedStartTime: '',
    proposedEndTime: '',
    reason: ''
  });

  const lessonId = params.id as string;

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    console.log('🔍 useEffect triggered for fetchRescheduleRequest:', {
      lessonExists: !!lesson,
      lessonId: lesson?.id,
      lessonStatus: lesson?.status
    });
    
    if (lesson) {
      console.log('✅ Calling fetchRescheduleRequest');
      fetchRescheduleRequest();
    } else {
      console.log('❌ No lesson data, skipping fetchRescheduleRequest');
    }
  }, [lesson]);

  // Fetch tutor availability when reschedule modal is opened
  useEffect(() => {
    if (showRescheduleModal && lesson) {
      fetchTutorAvailability(selectedMonth, selectedYear);
    }
  }, [showRescheduleModal, lesson, selectedMonth, selectedYear]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view lesson details');
        return;
      }

      const response = await fetch(`/api/lessons/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lesson details');
      }

      const data = await response.json();
      setLesson(data);
      
      // Initialize edit form with current values
      setEditForm({
        student_goals: data.student_goals || '',
        lesson_notes: data.lesson_notes || '',
        homework_assigned: data.homework_assigned || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const fetchRescheduleRequest = async () => {
    try {
      setLoadingRescheduleRequest(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ No session found for reschedule request fetch');
        return;
      }

      console.log('🔍 Fetching reschedule request for lesson:', lessonId);
      console.log('🔍 Lesson status:', lesson?.status);
      console.log('🔍 Is tutor:', user?.id === lesson?.tutor.id);
      console.log('🔍 User ID:', user?.id);
      console.log('🔍 Tutor ID:', lesson?.tutor.id);

      const response = await fetch(`/api/lessons/${lessonId}/reschedule-request`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('🔍 Reschedule request response status:', response.status);
      if (!response.ok) {
        console.error('Failed to fetch reschedule request:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log('🔍 Reschedule request API response:', data);
      
      if (data.success && data.data) {
        console.log('✅ Found reschedule request:', data.data);
        setRescheduleRequest(data.data);
      } else {
        console.log('ℹ️ No reschedule request found or invalid response format');
        setRescheduleRequest(null);
      }
    } catch (err) {
      console.error('Error fetching reschedule request:', err);
    } finally {
      setLoadingRescheduleRequest(false);
    }
  };

  const handleCancelLesson = async () => {
    try {
      setCancelling(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to cancel the lesson');
        return;
      }

      const response = await fetch(`/api/lessons/${lessonId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel lesson');
      }

      // Refresh lesson data
      await fetchLesson();
      setShowCancelModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel lesson');
    } finally {
      setCancelling(false);
    }
  };

  const handleEditLesson = async () => {
    try {
      setEditing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to edit the lesson');
        return;
      }

      const response = await fetch(`/api/lessons/${lessonId}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update lesson');
      }

      // Refresh lesson data
      await fetchLesson();
      setShowEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lesson');
    } finally {
      setEditing(false);
    }
  };

  const fetchTutorAvailability = async (month: number, year: number) => {
    if (!lesson) return;
    
    try {
      setLoadingSlots(true);
      const response = await fetch(`/api/tutors/${lesson.tutor.id}/availability?month=${month}&year=${year}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutor availability');
      }
      
      const data = await response.json();
      const allSlots: any[] = [];
      
      // Extract all available slots from the calendar data
      data.calendar.forEach((day: any) => {
        if (day.available && day.availableSlots && day.availableSlots.length > 0) {
          day.availableSlots.forEach((slot: any) => {
            allSlots.push({
              date: day.date,
              startTime: slot.start_time,
              endTime: slot.end_time,
              displayText: `${day.date} at ${slot.start_time} - ${slot.end_time}`
            });
          });
        }
      });
      
      setCalendarData(data.calendar);
    } catch (err) {
      console.error('Error fetching tutor availability:', err);
      setError('Failed to load tutor availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleLesson = async () => {
    try {
      setRescheduling(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to reschedule the lesson');
        return;
      }

      const response = await fetch(`/api/lessons/${lessonId}/reschedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rescheduleForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit reschedule request');
      }

      // Refresh lesson data
      await fetchLesson();
      setShowRescheduleModal(false);
      // Reset form
      setRescheduleForm({
        requestedDate: '',
        requestedStartTime: '',
        requestedEndTime: '',
        reason: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit reschedule request');
    } finally {
      setRescheduling(false);
    }
  };

  const handleRescheduleResponse = async (action: 'accept' | 'reject' | 'propose') => {
    if (!rescheduleRequest) return;

    try {
      setRespondingToReschedule(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to respond to the reschedule request');
        return;
      }

      let requestBody: any = { action };
      
      if (action === 'propose') {
        if (!proposeTimeForm.proposedDate || !proposeTimeForm.proposedStartTime || !proposeTimeForm.proposedEndTime) {
          setError('Please fill in all proposed time fields');
          return;
        }
        requestBody = {
          ...requestBody,
          proposedDate: proposeTimeForm.proposedDate,
          proposedStartTime: proposeTimeForm.proposedStartTime,
          proposedEndTime: proposeTimeForm.proposedEndTime,
          reason: proposeTimeForm.reason
        };
      } else {
        requestBody.reason = proposeTimeForm.reason;
      }

      const response = await fetch(`/api/reschedule-requests/${rescheduleRequest.id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to respond to reschedule request');
      }

      // Refresh data
      await fetchLesson();
      await fetchRescheduleRequest();
      setShowProposeTimeModal(false);
      setProposeTimeForm({
        proposedDate: '',
        proposedStartTime: '',
        proposedEndTime: '',
        reason: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to reschedule request');
    } finally {
      setRespondingToReschedule(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!lesson) {
    return <ErrorState message="Lesson not found" />;
  }

  const isTutor = user?.id === lesson.tutor.id;
  const isStudent = user?.id === lesson.student.id;
  const canCancel = lesson.status !== 'completed' && lesson.status !== 'cancelled';
  const canEdit = lesson.status !== 'completed' && lesson.status !== 'cancelled';
  const canReschedule = lesson.status !== 'completed' && lesson.status !== 'cancelled' && lesson.status !== 'reschedule_requested';
  const now = new Date();
  const lessonStart = new Date(lesson.scheduled_start);
  const oneHourBefore = new Date(lessonStart.getTime() - 60 * 60 * 1000); // 1 hour before
  const canJoin = lesson.status === 'confirmed' && now >= oneHourBefore && now <= lessonStart;

  // Debug logging
  console.log('🔍 UI Debug Info:', {
    lessonId,
    lessonStatus: lesson?.status,
    isTutor,
    isStudent,
    hasRescheduleRequest: !!rescheduleRequest,
    rescheduleRequestStatus: rescheduleRequest?.status,
    userEmail: user?.email,
    lesson: lesson ? 'exists' : 'null',
    rescheduleRequest: rescheduleRequest ? 'exists' : 'null'
  });

  console.log('🔍 Rendering reschedule alert check:', { 
    isTutor, 
    hasRescheduleRequest: !!rescheduleRequest, 
    rescheduleRequestStatus: rescheduleRequest?.status,
    shouldShowAlert: isTutor && rescheduleRequest,
    lessonExists: !!lesson,
    userExists: !!user
  });

  // Additional debugging for the alert condition
  if (isTutor && rescheduleRequest) {
    console.log('✅ Should show reschedule alert - conditions met');
  } else {
    console.log('❌ Not showing reschedule alert:', {
      isTutor,
      hasRescheduleRequest: !!rescheduleRequest,
      reason: !isTutor ? 'not tutor' : 'no reschedule request'
    });
  }

  console.log('🔍 About to render reschedule alert section:', { 
    isTutor, 
    hasRescheduleRequest: !!rescheduleRequest,
    rescheduleRequestData: rescheduleRequest,
    currentUserId: user?.id,
    tutorId: lesson?.tutor?.id,
    studentId: lesson?.student?.id,
    userEmail: user?.email
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <Text variant="h1" className="text-3xl font-bold text-gray-900">
                Lesson Details
              </Text>
              <Text variant="body" className="text-gray-600 mt-2">
                {lesson.lesson_type}
              </Text>
            </div>
            
            <Badge 
              variant={getStatusColor(lesson.status) as any}
              className="text-sm font-medium"
            >
              {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Reschedule Request Alert - Only show for tutors when there's a pending request */}
        {isTutor && rescheduleRequest && (
          <div className="mb-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-red-800">
                      Reschedule Request
                    </h3>
                    <Badge variant="error" className="text-xs">
                      Needs Review
                    </Badge>
                  </div>
                  <p className="text-red-700 mb-3">
                    This student has requested to reschedule your upcoming lesson. Please review and confirm the new time.
                  </p>
                  
                  <div className="bg-white border border-red-200 rounded-md p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Proposed new time:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(rescheduleRequest.requestedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-red-700">
                      {rescheduleRequest.requestedStartTime} - {rescheduleRequest.requestedEndTime}
                    </div>
                    {rescheduleRequest.reason && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {rescheduleRequest.reason}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleRescheduleResponse('accept')}
                      disabled={respondingToReschedule}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {respondingToReschedule ? 'Accepting...' : 'Accept New Time'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProposeTimeModal(true)}
                      disabled={respondingToReschedule}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Propose Different Time
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRescheduleResponse('reject')}
                      disabled={respondingToReschedule}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Message Student
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Information */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Text variant="h2" className="text-xl font-semibold">
                      Lesson Information
                    </Text>
                    {isTutor && rescheduleRequest && (
                      <Badge variant="error" className="text-xs">
                        Reschedule Request
                      </Badge>
                    )}
                  </div>
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <Text variant="small" className="text-gray-500">Date & Time</Text>
                      <Text variant="body">{formatDateTime(lesson.scheduled_start)}</Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <Text variant="small" className="text-gray-500">Duration</Text>
                      <Text variant="body">{formatDuration(lesson.duration_minutes)}</Text>
                    </div>
                  </div>
                </div>

                {/* Student Goals */}
                {lesson.student_goals && (
                  <div className="mt-6">
                    <Text variant="small" className="text-gray-500 mb-2">Student Goals</Text>
                    <Text variant="body" className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {lesson.student_goals}
                    </Text>
                  </div>
                )}

                {/* Lesson Notes */}
                {lesson.lesson_notes && (
                  <div className="mt-4">
                    <Text variant="small" className="text-gray-500 mb-2">Lesson Notes</Text>
                    <Text variant="body" className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {lesson.lesson_notes}
                    </Text>
                  </div>
                )}

                {/* Homework */}
                {lesson.homework_assigned && (
                  <div className="mt-4">
                    <Text variant="small" className="text-gray-500 mb-2">Homework Assigned</Text>
                    <Text variant="body" className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {lesson.homework_assigned}
                    </Text>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <Text variant="h3" className="text-lg font-semibold mb-4">
                  Quick Actions
                </Text>
                
                <div className="space-y-3">
                  {canCancel && (
                    <Button
                      variant="warning"
                      onClick={() => setShowCancelModal(true)}
                      className="w-full"
                      disabled={cancelling}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {cancelling ? 'Cancelling...' : 'Cancel Lesson'}
                    </Button>
                  )}
                  
                  {canReschedule && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRescheduleModal(true);
                        // Reset form when opening modal
                        setRescheduleForm({
                          requestedDate: '',
                          requestedStartTime: '',
                          requestedEndTime: '',
                          reason: ''
                        });
                      }}
                      className="w-full"
                      disabled={rescheduling}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {rescheduling ? 'Submitting...' : 'Reschedule'}
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Materials
                  </Button>
                  
                  {canJoin && (
                    <Button 
                      className="w-full"
                      onClick={() => router.push(`/lessons/${lesson.id}/video`)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Lesson
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tutor/Student Profile */}
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar
                    src={isTutor ? lesson.student.email : lesson.tutor.profile_image_url}
                    alt={isTutor ? lesson.student.email : lesson.tutor.display_name}
                    className="w-12 h-12"
                  />
                  <div>
                    <Text variant="h4" className="font-semibold">
                      {isTutor ? lesson.student.email : lesson.tutor.display_name}
                    </Text>
                    <Text variant="small" className="text-gray-600">
                      {isTutor ? lesson.student.email : 'Language Tutor'}
                    </Text>
                  </div>
                </div>
                
                {!isTutor && lesson.tutor.bio && (
                  <Text variant="body" className="text-gray-600 text-sm">
                    {lesson.tutor.bio}
                  </Text>
                )}
              </div>
            </Card>

            {/* Contact Information */}
            <Card>
              <div className="p-6">
                <Text variant="h4" className="font-semibold mb-4">
                  Contact Information
                </Text>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <Text variant="body" className="text-sm">
                      {isTutor ? lesson.student.email : 'tutor@example.com'}
                    </Text>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <Text variant="body" className="text-sm">
                      {isTutor ? 'Student Phone' : 'Tutor Phone'}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Details Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Lesson Details"
        size="lg"
      >
        <div className="space-y-4">
          <FormField label="Student Goals">
            <TextArea
              value={editForm.student_goals}
              onChange={(e) => setEditForm(prev => ({ ...prev, student_goals: e.target.value }))}
              placeholder="What does the student want to achieve in this lesson?"
              rows={3}
            />
          </FormField>
          <FormField label="Lesson Notes">
            <TextArea
              value={editForm.lesson_notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, lesson_notes: e.target.value }))}
              placeholder="Notes about the lesson content or structure"
              rows={3}
            />
          </FormField>
          <FormField label="Homework Assigned">
            <TextArea
              value={editForm.homework_assigned}
              onChange={(e) => setEditForm(prev => ({ ...prev, homework_assigned: e.target.value }))}
              placeholder="Homework or practice exercises for the student"
              rows={3}
            />
          </FormField>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={editing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditLesson}
              disabled={editing}
            >
              {editing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Lesson"
        size="sm"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <Text variant="body" className="text-gray-600">
            Are you sure you want to cancel this lesson? This action cannot be undone.
          </Text>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              Keep Lesson
            </Button>
            <Button
              variant="warning"
              onClick={handleCancelLesson}
              disabled={cancelling}
              className="flex-1"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Lesson'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Request Reschedule"
        size="md"
      >
        <div className="space-y-3">
          <Text variant="body" className="text-gray-600 text-xs">
            Select an available date from the tutor's calendar:
          </Text>
          
          {/* Compact Month/Year Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value);
                setSelectedMonth(newMonth);
                fetchTutorAvailability(newMonth, selectedYear);
              }}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                setSelectedYear(newYear);
                fetchTutorAvailability(selectedMonth, newYear);
              }}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Compact Calendar View */}
          <div className="border border-gray-200 rounded-md p-2">
            {loadingSlots ? (
              <div className="text-center py-2">
                <Text variant="body" className="text-gray-600 text-xs">Loading...</Text>
              </div>
            ) : (
              <>
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`} className="text-center text-xs font-medium text-gray-500 p-0.5">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarData.map((day: any, index: number) => (
                    <button
                      key={index}
                      type="button"
                      disabled={!day.day || day.isPast || !day.available}
                      onClick={() => {
                        if (day.available && day.availableSlots && day.availableSlots.length > 0) {
                          setRescheduleForm(prev => ({
                            ...prev,
                            requestedDate: day.date,
                            requestedStartTime: '',
                            requestedEndTime: ''
                          }));
                        }
                      }}
                      className={`w-6 h-6 text-xs rounded transition-colors flex items-center justify-center ${
                        !day.day || day.isPast || !day.available
                          ? 'text-gray-300 cursor-not-allowed'
                          : day.available
                          ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                          : 'text-gray-400'
                      } ${
                        rescheduleForm.requestedDate === day.date
                          ? 'bg-blue-100 border border-blue-300'
                          : ''
                      }`}
                    >
                      {day.day || ''}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Time Slot Selection */}
          {rescheduleForm.requestedDate && (
            <div className="space-y-2">
              <Text variant="small" className="text-gray-600 text-xs">Available time slots for {new Date(rescheduleForm.requestedDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}:</Text>
              <div className="grid grid-cols-2 gap-1">
                {calendarData.find((day: any) => day.date === rescheduleForm.requestedDate)?.availableSlots?.map((slot: any, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRescheduleForm(prev => ({
                      ...prev,
                      requestedStartTime: slot.start_time,
                      requestedEndTime: slot.end_time
                    }))}
                    className={`p-1 text-xs rounded border transition-colors ${
                      rescheduleForm.requestedStartTime === slot.start_time
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {slot.start_time} - {slot.end_time}
                  </button>
                )) || []}
              </div>
            </div>
          )}
          
          {/* Reason Field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason (Optional)</label>
            <textarea
              value={rescheduleForm.reason}
              onChange={(e) => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Reason for reschedule..."
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowRescheduleModal(false)}
              disabled={rescheduling}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleLesson}
              disabled={rescheduling || !rescheduleForm.requestedDate || !rescheduleForm.requestedStartTime || !rescheduleForm.requestedEndTime}
              size="sm"
            >
              {rescheduling ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Propose Different Time Modal */}
      <Modal
        isOpen={showProposeTimeModal}
        onClose={() => setShowProposeTimeModal(false)}
        title="Propose Different Time"
        size="md"
      >
        <div className="space-y-4">
          <Text variant="body" className="text-gray-600 text-sm">
            Propose an alternative time for the rescheduled lesson:
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date">
              <input
                type="date"
                value={proposeTimeForm.proposedDate}
                onChange={(e) => setProposeTimeForm(prev => ({ ...prev, proposedDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </FormField>
            
            <FormField label="Start Time">
              <input
                type="time"
                value={proposeTimeForm.proposedStartTime}
                onChange={(e) => setProposeTimeForm(prev => ({ ...prev, proposedStartTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
            
            <FormField label="End Time">
              <input
                type="time"
                value={proposeTimeForm.proposedEndTime}
                onChange={(e) => setProposeTimeForm(prev => ({ ...prev, proposedEndTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>
          
          <FormField label="Reason (Optional)">
            <TextArea
              value={proposeTimeForm.reason}
              onChange={(e) => setProposeTimeForm(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Explain why you're proposing a different time..."
              rows={3}
            />
          </FormField>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowProposeTimeModal(false)}
              disabled={respondingToReschedule}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleRescheduleResponse('propose')}
              disabled={respondingToReschedule || !proposeTimeForm.proposedDate || !proposeTimeForm.proposedStartTime || !proposeTimeForm.proposedEndTime}
            >
              {respondingToReschedule ? 'Proposing...' : 'Propose Time'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 