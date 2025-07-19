'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RequireEmailVerification from '@/app/components/RequireEmailVerification';
import { Card, Button, Text, Badge, Avatar, Modal } from '@/app/components/ui';
import { 
  Calendar, 
  Clock, 
  User, 
  Users,
  Video, 
  RefreshCw, 
  X, 
  Star, 
  MessageSquare, 
  BookOpen, 
  Eye,
  Flag,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  UserPlus,
  FileText
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import DashboardSidebar from '../dashboard/components/DashboardSidebar';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Lesson {
  id: string;
  lesson_type: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  status: string;
  lesson_notes?: string;
  student_goals?: string;
  homework_assigned?: string;
  price_paid?: number;
  currency?: string;
  created_at: string;
  minutes_until: number;
  can_join: boolean;
  tutor: {
    id: string;
    name: string;
    profile_image_url?: string;
    bio?: string;
    timezone: string;
  };
  feedback?: {
    rating: number;
    comment: string;
  };
}

export default function StudentLessonsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [pastLessons, setPastLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isTutor, setIsTutor] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Reschedule modal states (matching Lesson Details page)
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
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    fetchLessons();
    // Refresh every minute to update countdown timers
    const interval = setInterval(fetchLessons, 60000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Fetch tutor availability when reschedule modal is opened
  useEffect(() => {
    if (showRescheduleModal && selectedLesson) {
      fetchTutorAvailability(selectedMonth, selectedYear);
    }
  }, [showRescheduleModal, selectedLesson, selectedMonth, selectedYear]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // First, check if the user is a tutor
      const { data: tutorProfile } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      // Determine which API to call based on user role
      const userIsTutor = !!tutorProfile;
      setIsTutor(userIsTutor);
      const apiEndpoint = userIsTutor ? '/api/tutor/lessons' : '/api/lessons/user';
      
      console.log(`🔍 User role: ${userIsTutor ? 'Tutor' : 'Student'}, calling API: ${apiEndpoint}`);

      const response = await fetch(`${apiEndpoint}?upcoming=${activeTab === 'upcoming' ? 'true' : 'false'}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const lessons = data.lessons || [];
        
        if (activeTab === 'upcoming') {
          setUpcomingLessons(lessons);
        } else {
          setPastLessons(lessons);
        }
      } else {
        setError('Failed to load lessons');
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setError('An error occurred while loading lessons');
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorAvailability = async (month: number, year: number) => {
    if (!selectedLesson || !selectedLesson.tutor) return;
    
    try {
      setLoadingSlots(true);
      const response = await fetch(`/api/tutors/${selectedLesson.tutor.id}/availability?month=${month}&year=${year}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tutor availability');
      }
      
      const data = await response.json();
      setCalendarData(data.calendar);
    } catch (err) {
      console.error('Error fetching tutor availability:', err);
      setError('Failed to load tutor availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleLesson = async () => {
    if (!selectedLesson) return;

    try {
      setRescheduling(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to reschedule the lesson');
        return;
      }

      const response = await fetch(`/api/lessons/${selectedLesson.id}/reschedule`, {
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

      // Refresh lessons data
      await fetchLessons();
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

  const formatTimeUntil = (minutesUntil: number) => {
    if (minutesUntil <= 0) {
      return 'Starting now';
    } else if (minutesUntil < 60) {
      return `in ${minutesUntil} minutes`;
    } else if (minutesUntil < 1440) { // Less than 24 hours
      const hours = Math.floor(minutesUntil / 60);
      const minutes = minutesUntil % 60;
      if (minutes === 0) {
        return `in ${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `in ${hours}h ${minutes}m`;
      }
    } else { // 24 hours or more
      const days = Math.floor(minutesUntil / 1440);
      const remainingMinutes = minutesUntil % 1440;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'Missed';
      case 'reschedule_requested':
        return 'Reschedule Requested';
      default:
        return status;
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
    const timeString = formatTimeUntil(minutesUntil);
    
    if (minutesUntil <= 15) {
      return <span className="text-orange-600 font-medium">{timeString}</span>;
    } else if (minutesUntil <= 60) {
      return <span className="text-orange-500">{timeString}</span>;
    } else {
      return <span className="text-token-text-secondary">{timeString}</span>;
    }
  };

  const handleReschedule = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setRescheduleForm({
      requestedDate: '',
      requestedStartTime: '',
      requestedEndTime: '',
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  const handleCancel = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowCancelModal(true);
  };

  const handleFeedback = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setFeedbackRating(0);
    setFeedbackComment('');
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!selectedLesson || feedbackRating === 0 || submittingFeedback) return;
    
    try {
      setSubmittingFeedback(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/lessons/${selectedLesson.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment
        })
      });

      if (response.ok) {
        setShowFeedbackModal(false);
        fetchLessons(); // Refresh to show feedback was submitted
      } else {
        // Handle different error statuses
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 409) {
          // Feedback already submitted
          setShowFeedbackModal(false);
          fetchLessons(); // Refresh to show existing feedback
          // You could show a toast notification here if you have one
          console.log('Feedback already submitted for this lesson');
        } else if (response.status === 403) {
          console.error('Unauthorized: You cannot submit feedback for this lesson');
        } else if (response.status === 400) {
          console.error('Invalid request:', errorData.error);
        } else {
          console.error('Failed to submit feedback:', errorData.error || 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const isLessonInPast = (lesson: Lesson) => {
    const lessonDate = new Date(lesson.scheduled_start);
    const now = new Date();
    return lessonDate < now;
  };

  const getEffectiveStatus = (lesson: Lesson, isPastTab: boolean) => {
    if (isPastTab && isLessonInPast(lesson)) {
      // For past lessons, treat confirmed lessons as completed
      if (lesson.status === 'confirmed') {
        return 'completed';
      }
      return lesson.status;
    }
    return lesson.status;
  };

  const getRatingText = (feedback?: { rating: number; comment: string }) => {
    if (!feedback) return 'Not Rated';
    return 'Submitted';
  };

  const getRatingIcon = (feedback?: { rating: number; comment: string }) => {
    if (!feedback) return <Star className="w-4 h-4 text-token-text-muted" />;
    return <CheckCircle className="w-4 h-4 text-token-text-muted" />;
  };

  const handleRebookTutor = (lesson: Lesson) => {
    // Navigate to tutor profile page
    if (lesson.tutor?.id) {
      window.open(`/tutors/${lesson.tutor.id}`, '_blank');
    }
  };

  const handleViewSummary = (lesson: Lesson) => {
    // Placeholder for summary functionality
    console.log('View summary for lesson:', lesson.id);
    // TODO: Implement summary modal or page
  };

  const getPastLessonStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'no_show_student':
        return 'Missed - Student';
      case 'no_show_tutor':
        return 'Missed - Tutor';
      case 'no_show_both':
        return 'Missed - Both';
      case 'missed':
        return 'Missed';
      default:
        return getStatusText(status);
    }
  };

  const getPastLessonStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'no_show_student':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'no_show_tutor':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'no_show_both':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'missed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return getStatusColor(status);
    }
  };

  const getPastLessonStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'no_show_student':
        return <User className="w-3.5 h-3.5" />;
      case 'no_show_tutor':
        return <User className="w-3.5 h-3.5" />;
      case 'no_show_both':
        return <Users className="w-3.5 h-3.5" />;
      case 'missed':
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return getStatusIcon(status);
    }
  };

  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* Main Content with Sidebar - Use flex for large screens */}
              <div className="relative lg:flex lg:min-h-[600px]">
                {/* Sidebar */}
                <div className="hidden lg:block lg:w-72 lg:shrink-0">
                  <div className="sticky top-24">
                    <DashboardSidebar userEmail={user?.email} />
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="lg:ml-8 flex-1">
                  <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                      <Text variant="h1" as="h1" className="mb-2">
                        My Lessons
                      </Text>
                      <Text variant="lead" className="text-text-secondary">
                        Track your learning journey and manage upcoming sessions.
                      </Text>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 bg-token-surface-accent rounded-lg p-1 mb-8">
                      <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'upcoming'
                            ? 'bg-white text-token-text shadow-sm'
                            : 'text-token-text-secondary hover:text-token-text'
                        }`}
                      >
                        Upcoming Lessons
                      </button>
                      <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'past'
                            ? 'bg-white text-token-text shadow-sm'
                            : 'text-token-text-secondary hover:text-token-text'
                        }`}
                      >
                        Past Lessons
                      </button>
                    </div>

                    {/* Lessons Section */}
                    <div>
                      {loading ? (
                        <Card className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-token-primary mx-auto mb-4"></div>
                          <Text variant="body" className="text-token-text-secondary">
                            Loading your lessons...
                          </Text>
                        </Card>
                      ) : error ? (
                        <Card className="p-8 text-center">
                          <Text variant="body" className="text-token-error mb-4">
                            {error}
                          </Text>
                          <Button variant="outline" onClick={fetchLessons}>
                            Try Again
                          </Button>
                        </Card>
                      ) : (activeTab === 'upcoming' ? upcomingLessons : pastLessons).length === 0 ? (
                        <Card className="p-12 text-center">
                          <Calendar className="w-16 h-16 text-token-text-muted mx-auto mb-4" />
                          <Text variant="h3" className="text-token-text-secondary mb-2">
                            {activeTab === 'upcoming' ? 'No Upcoming Lessons' : 'No Past Lessons'}
                          </Text>
                          <Text variant="body" className="text-token-text-muted mb-6">
                            {activeTab === 'upcoming' 
                              ? "You don't have any upcoming lessons scheduled. Book your first lesson to get started!"
                              : "You haven't completed any lessons yet. Start your learning journey today!"
                            }
                          </Text>
                          <Link href="/tutors">
                            <Button variant="primary">
                              Browse Tutors
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </Link>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {(activeTab === 'upcoming' ? upcomingLessons : pastLessons).map((lesson) => {
                            const effectiveStatus = getEffectiveStatus(lesson, activeTab === 'past');
                            return (
                            <Card key={lesson.id} className="p-6 border border-gray-200 rounded-xl" variant="outlined">
                              <div className="flex items-start justify-between">
                                {/* Left Section: Avatar, Name, Time, Details */}
                                <div className="flex items-start gap-4 flex-1">
                                  {/* Tutor Avatar */}
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-token-primary to-token-accent flex items-center justify-center flex-shrink-0">
                                    {lesson.tutor?.profile_image_url ? (
                                      <img 
                                        src={lesson.tutor.profile_image_url} 
                                        alt={lesson.tutor?.name || 'Tutor'}
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
                                        {lesson.tutor?.name || 'Tutor'}
                                      </Text>
                                      {activeTab === 'upcoming' && lesson.minutes_until >= 0 && (
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
                                        <BookOpen className="w-4 h-4 text-token-text-muted" />
                                        <div>
                                          <div className="text-xs text-token-text-muted uppercase tracking-wide">Lesson Type</div>
                                          <div className="font-medium text-token-text">{lesson.lesson_type}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-token-text-muted" />
                                        <div>
                                          <div className="text-xs text-token-text-muted uppercase tracking-wide">Duration</div>
                                          <div className="font-medium text-token-text">{lesson.duration_minutes} Minutes</div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {activeTab === 'past' ? (
                                          <>
                                            {getRatingIcon(lesson.feedback)}
                                            <div>
                                              <div className="text-xs text-token-text-muted uppercase tracking-wide">Rating</div>
                                              <div className="font-medium text-token-text">{getRatingText(lesson.feedback)}</div>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            <Calendar className="w-4 h-4 text-token-text-muted" />
                                            <div>
                                              <div className="text-xs text-token-text-muted uppercase tracking-wide">Status</div>
                                              <div className="font-medium text-token-text">
                                                {lesson.status === 'confirmed' && lesson.can_join ? 'Ready to Join' :
                                                 lesson.status === 'confirmed' ? 'Confirmed' :
                                                 lesson.status === 'pending' ? 'Pending Confirmation' :
                                                 getStatusText(lesson.status)}
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Section: Status Badge */}
                                <div className="flex-shrink-0 ml-4">
                                  {activeTab === 'past' && lesson.feedback ? (
                                    <div className="flex items-center gap-2">
                                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${getPastLessonStatusColor(effectiveStatus)}`}>
                                        {getPastLessonStatusIcon(effectiveStatus)}
                                        {getPastLessonStatusText(effectiveStatus)}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <span
                                            key={star}
                                            className={`text-sm ${lesson.feedback!.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${
                                      activeTab === 'past' ? getPastLessonStatusColor(effectiveStatus) : getStatusColor(lesson.status)
                                    }`}>
                                      {activeTab === 'past' ? getPastLessonStatusIcon(effectiveStatus) : getStatusIcon(lesson.status)}
                                      {activeTab === 'past' ? getPastLessonStatusText(effectiveStatus) : getStatusText(lesson.status)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Bottom Section: Action Buttons */}
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                {activeTab === 'upcoming' && lesson.can_join && (
                                  <Link href={`/lessons/${lesson.id}/video`}>
                                    <Button variant="primary" size="sm" className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:shadow-md">
                                      <Video className="w-3.5 h-3.5 mr-1.5" />
                                      Join Lesson
                                    </Button>
                                  </Link>
                                )}
                                {activeTab === 'upcoming' && !lesson.can_join && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-gray-50 hover:border-gray-300"
                                      onClick={() => handleReschedule(lesson)}
                                    >
                                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                      Reschedule
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                      onClick={() => handleCancel(lesson)}
                                    >
                                      <X className="w-3.5 h-3.5 mr-1.5" />
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                {activeTab === 'past' && (
                                  <>
                                    {effectiveStatus === 'completed' && !lesson.feedback && !isTutor && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                                        onClick={() => handleFeedback(lesson)}
                                      >
                                        <Star className="w-3.5 h-3.5 mr-1.5" />
                                        Leave Feedback
                                      </Button>
                                    )}
                                    {effectiveStatus === 'completed' && isTutor && (
                                      <div className="text-xs text-gray-500 px-3 py-1.5">
                                        <Star className="w-3.5 h-3.5 mr-1.5 inline" />
                                        Feedback from student
                                      </div>
                                    )}
                                    {!['no_show_student', 'no_show_tutor', 'no_show_both', 'missed'].includes(effectiveStatus) && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                                        onClick={() => handleRebookTutor(lesson)}
                                      >
                                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                        Rebook Tutor
                                      </Button>
                                    )}
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                                      onClick={() => handleViewSummary(lesson)}
                                    >
                                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                                      View Summary
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
                          )})}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reschedule Modal - Same as Lesson Details page */}
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

          {/* Cancel Modal */}
          <Modal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            title="Cancel Lesson"
          >
            <div className="p-6">
              <Text variant="body" className="mb-4">
                Are you sure you want to cancel your lesson with {selectedLesson?.tutor.name}?
              </Text>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                >
                  Keep Lesson
                </Button>
                <Button 
                  variant="warning" 
                  onClick={() => {
                    // TODO: Implement cancel logic
                    setShowCancelModal(false);
                  }}
                  className="flex-1"
                >
                  Cancel Lesson
                </Button>
              </div>
            </div>
          </Modal>

          {/* Feedback Modal */}
          <Modal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            title="Leave Feedback"
          >
            <div className="p-6">
              <Text variant="body" className="mb-4">
                How was your lesson with {selectedLesson?.tutor.name}?
              </Text>
              
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className={`text-2xl ${feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Comment */}
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share your experience (optional)"
                className="w-full p-3 border border-token-border rounded-lg resize-none"
                rows={3}
              />

              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={submitFeedback}
                  disabled={feedbackRating === 0 || isTutor || submittingFeedback}
                  className="flex-1"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          </Modal>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 