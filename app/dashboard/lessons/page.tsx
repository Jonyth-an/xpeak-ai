'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import RequireEmailVerification from '../../components/RequireEmailVerification';
import { Card, Button, Text, Badge, Avatar, Modal } from '@/app/components/ui';
import { 
  Calendar, 
  Clock, 
  User, 
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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
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

      // Use the same API call as Dashboard for upcoming lessons
      const response = await fetch(`/api/lessons/user?upcoming=${activeTab === 'upcoming' ? 'true' : 'false'}&limit=20`, {
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
    if (!selectedLesson) return;
    
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
    } else {
      const hours = Math.floor(minutesUntil / 60);
      const minutes = minutesUntil % 60;
      if (minutes === 0) {
        return `in ${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `in ${hours}h ${minutes}m`;
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-token-success';
      case 'pending':
        return 'text-token-warning';
      case 'completed':
        return 'text-token-text-secondary';
      case 'cancelled':
        return 'text-token-error';
      case 'no_show':
        return 'text-token-error';
      default:
        return 'text-token-text-secondary';
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
      default:
        return status;
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
    if (!selectedLesson || feedbackRating === 0) return;
    
    try {
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
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
                          {(activeTab === 'upcoming' ? upcomingLessons : pastLessons).map((lesson) => (
                            <Card key={lesson.id} className="p-6 hover:shadow-lg transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  {/* Tutor Avatar */}
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-token-primary to-token-accent flex items-center justify-center flex-shrink-0">
                                    {lesson.tutor.profile_image_url ? (
                                      <img 
                                        src={lesson.tutor.profile_image_url} 
                                        alt={lesson.tutor.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-6 h-6 text-white" />
                                    )}
                                  </div>

                                  {/* Lesson Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Text variant="h3" as="h3" className="truncate">
                                        {lesson.tutor.name}
                                      </Text>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)} bg-token-surface-accent`}>
                                        {getStatusText(lesson.status)}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-sm text-token-text-secondary mb-2">
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{lesson.lesson_type}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{lesson.duration_minutes} minutes</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                          {new Date(lesson.scheduled_start).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                          })}
                                        </span>
                                      </div>
                                    </div>

                                    {activeTab === 'upcoming' && lesson.minutes_until >= 0 && (
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${lesson.minutes_until <= 15 ? 'bg-token-warning animate-pulse' : 'bg-token-success'}`}></div>
                                        <Text variant="small" className="text-token-text-secondary">
                                          {formatTimeUntil(lesson.minutes_until)}
                                        </Text>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 ml-4">
                                  {activeTab === 'upcoming' && lesson.can_join && (
                                    <Link href={`/lessons/${lesson.id}/video`}>
                                      <Button variant="primary" size="sm">
                                        <Video className="w-4 h-4 mr-2" />
                                        Join
                                      </Button>
                                    </Link>
                                  )}
                                  {activeTab === 'upcoming' && !lesson.can_join && (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleReschedule(lesson)}
                                      >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Reschedule
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleCancel(lesson)}
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  {activeTab === 'past' && lesson.status === 'completed' && !lesson.feedback && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleFeedback(lesson)}
                                    >
                                      <Star className="w-4 h-4 mr-2" />
                                      Leave Feedback
                                    </Button>
                                  )}
                                  <Link href={`/lessons/${lesson.id}`}>
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </Card>
                          ))}
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
                  disabled={feedbackRating === 0}
                  className="flex-1"
                >
                  Submit Feedback
                </Button>
              </div>
            </div>
          </Modal>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 