'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Button } from '@/app/components/ui';
import Text from '@/app/components/ui/Text';
import { supabase } from '@/lib/supabaseClient';
import { 
  Search,
  Filter,
  BookOpen,
  Users,
  Clock,
  Globe,
  Star,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  FileText
} from 'lucide-react';

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
  created_at: string;
  student: {
    id: string;
    name: string;
    email?: string;
    profile_image_url?: string;
    country: string;
  };
  feedback?: {
    rating: number;
    comment: string;
    tags: string[];
  };
  // Enhanced status for better tracking
  cancellation_reason?: 'student_cancelled' | 'tutor_cancelled' | 'miss_student' | 'miss_tutor' | 'miss_both';
}

interface LessonHistoryData {
  lessons: Lesson[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: {
    total_lessons: number;
    total_students: number;
    total_minutes: number;
    total_hours: number;
    countries_reached: number;
  };
  tutor_timezone?: string;
}

export default function LessonHistory() {
  const [historyData, setHistoryData] = useState<LessonHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lessonTypeFilter, setLessonTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<{ rating: number; comment: string } | null>(null);

  // Enhanced filters
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');

  useEffect(() => {
    fetchLessonHistory();
  }, [currentPage, statusFilter, lessonTypeFilter]);

  const fetchLessonHistory = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        include_summary: 'true',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(lessonTypeFilter !== 'all' && { lesson_type: lessonTypeFilter })
      });

      const response = await fetch(`/api/tutor/lessons?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Lesson history data:', data);
        console.log('🔍 First lesson student data:', data.lessons?.[0]?.student);
        setHistoryData(data);
      } else {
        setError('Failed to load lesson history');
      }
    } catch (error) {
      console.error('Error fetching lesson history:', error);
      setError('An error occurred while loading lesson history');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLessonHistory();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  const getStatusBadge = (status: string, cancellationReason?: string) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      no_show: 'bg-orange-100 text-orange-700 border-orange-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    
    const statusLabels = {
      completed: 'Completed',
      confirmed: 'Confirmed',
      cancelled: cancellationReason === 'student_cancelled' ? 'Student Cancelled' : 
                 cancellationReason === 'tutor_cancelled' ? 'Tutor Cancelled' : 'Cancelled',
      no_show: cancellationReason === 'miss_student' ? 'Miss-Student' :
               cancellationReason === 'miss_tutor' ? 'Miss-Tutor' :
               cancellationReason === 'miss_both' ? 'Miss-Both' : 'No Show',
      pending: 'Pending'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderRatingPreview = (lesson: Lesson) => {
    if (!lesson.feedback) {
      return (
        <Text variant="small" className="text-gray-500">
          No rating yet
        </Text>
      );
    }

    const { rating, comment } = lesson.feedback;
    const preview = comment.length > 50 ? `${comment.substring(0, 50)}...` : comment;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {renderRatingStars(rating)}
          <Text variant="small" className="font-medium text-gray-900">
            {rating}/5
          </Text>
        </div>
        <Text variant="small" className="text-gray-600">
          {preview}
        </Text>
        {comment.length > 50 && (
          <button
            onClick={() => {
              setSelectedRating({ rating, comment });
              setShowRatingModal(true);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            View full review
          </button>
        )}
      </div>
    );
  };

  const handleNotesEdit = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setEditingNotes(lesson.lesson_notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    if (!selectedLesson) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/tutor/lessons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          lesson_id: selectedLesson.id,
          lesson_notes: editingNotes
        })
      });

      if (response.ok) {
        await fetchLessonHistory();
        setShowNotesModal(false);
        setSelectedLesson(null);
      } else {
        alert('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('An error occurred while saving notes');
    }
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

  if (error || !historyData) {
    return (
      <TutorLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <Text variant="h2" className="text-token-error mb-2">Unable to Load History</Text>
            <Text variant="body" className="text-token-text-secondary mb-4">{error}</Text>
            <Button variant="primary" onClick={fetchLessonHistory}>Retry</Button>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Text variant="h1" as="h1" className="text-token-primary mb-2">
              Lesson History
            </Text>
            <Text variant="body" className="text-token-text-secondary">
              Review your past lessons and track your teaching journey.
            </Text>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-token-surface border border-token rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <Text variant="h2" as="h2" className="text-2xl font-bold text-token-text-primary">
                    {historyData.summary?.total_lessons || 0}
                  </Text>
                  <Text variant="small" className="text-token-text-secondary">
                    Total Lessons
                  </Text>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <Text variant="h2" as="h2" className="text-2xl font-bold text-token-text-primary">
                    {historyData.summary?.total_students || 0}
                  </Text>
                  <Text variant="small" className="text-token-text-secondary">
                    Total Students
                  </Text>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <Text variant="h2" as="h2" className="text-2xl font-bold text-token-text-primary">
                    {(historyData.summary?.total_minutes || 0).toLocaleString()}
                  </Text>
                  <Text variant="small" className="text-token-text-secondary">
                    Total Minutes
                  </Text>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token rounded-xl">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <Text variant="h2" as="h2" className="text-2xl font-bold text-token-text-primary">
                    {Math.ceil((historyData.summary?.total_minutes || 0) / 1440)}
                  </Text>
                  <Text variant="small" className="text-token-text-secondary">
                    Total Days
                  </Text>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Lessons Cards */}
          {historyData.lessons.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <Text variant="h3" className="font-bold text-gray-900">
                  Recent Lessons (8)
                </Text>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {historyData.lessons.slice(0, 8).map((lesson) => (
                  <Card key={lesson.id} className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow" variant="outlined">
                    <div className="flex items-start gap-3">
                      {/* Student Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {lesson.student.profile_image_url ? (
                          <img 
                            src={lesson.student.profile_image_url} 
                            alt={lesson.student.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              // Hide the image if it fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Users className="w-5 h-5 text-white" />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        {/* Student Name and Rating */}
                        <div className="flex items-start justify-between mb-2">
                          <Text variant="body" className="font-medium text-gray-900 truncate">
                            {lesson.student.name}
                          </Text>
                          {lesson.feedback && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {renderRatingStars(lesson.feedback.rating)}
                            </div>
                          )}
                        </div>
                        
                        {/* Lesson Time */}
                        <Text variant="small" className="text-gray-600 mb-2">
                          {formatDate(lesson.scheduled_start)} at {formatTime(lesson.scheduled_start)}
                        </Text>
                        
                        {/* Lesson Type */}
                        <div className="mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {lesson.lesson_type}
                          </span>
                        </div>
                        
                        {/* Status */}
                        <div className="mb-2">
                          {getStatusBadge(lesson.status, lesson.cancellation_reason)}
                        </div>
                        
                        {/* Review Preview */}
                        {lesson.feedback && lesson.feedback.comment && (
                          <div className="mt-2">
                            <Text variant="small" className="text-gray-600 line-clamp-2">
                              "{lesson.feedback.comment.length > 60 
                                ? `${lesson.feedback.comment.substring(0, 60)}...` 
                                : lesson.feedback.comment}"
                            </Text>
                            {lesson.feedback.comment.length > 60 && (
                              <button
                                onClick={() => {
                                  setSelectedRating({ 
                                    rating: lesson.feedback!.rating, 
                                    comment: lesson.feedback!.comment 
                                  });
                                  setShowRatingModal(true);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                              >
                                Read more
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="p-6 bg-token-surface border border-token mb-6 rounded-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-token-text-muted w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-token rounded-md bg-token-surface"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-token rounded-md bg-token-surface"
                >
                  <option value="all">All Lessons</option>
                  <option value="completed">Completed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
                
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
                
                <Button variant="primary" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-token">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-token-text-secondary mb-1">
                      Lesson Type
                    </label>
                    <select
                      value={lessonTypeFilter}
                      onChange={(e) => setLessonTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-token rounded-md bg-token-surface"
                    >
                      <option value="all">All Types</option>
                      <option value="Conversation Practice">Conversation Practice</option>
                      <option value="Grammar Focus">Grammar Focus</option>
                      <option value="Business English">Business English</option>
                      <option value="IELTS Preparation">IELTS Preparation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-token-text-secondary mb-1">
                      Rating
                    </label>
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-token rounded-md bg-token-surface"
                    >
                      <option value="all">All Ratings</option>
                      <option value="rated">Rated Only</option>
                      <option value="unrated">Unrated Only</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-token-text-secondary mb-1">
                      Date Range
                    </label>
                    <select
                      value={dateRangeFilter}
                      onChange={(e) => setDateRangeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-token rounded-md bg-token-surface"
                    >
                      <option value="all">All Time</option>
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="90">Last 3 Months</option>
                      <option value="365">Last Year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-token-text-secondary mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-token rounded-md bg-token-surface"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                      <option value="student_cancelled">Student Cancelled</option>
                      <option value="tutor_cancelled">Tutor Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Lessons Table */}
          <Card className="bg-token-surface border border-token rounded-xl">
            <div className="p-6">
              <Text variant="h3" className="text-token-primary mb-4">All Lessons</Text>
              
              {historyData.lessons.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-token-text-muted mx-auto mb-3" />
                  <Text variant="body" className="text-token-text-secondary">
                    No lessons found matching your criteria
                  </Text>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-token">
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Time</th>
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Student</th>
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Duration</th>
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Rating</th>
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Notes</th>
                        <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.lessons.map((lesson) => (
                        <tr key={lesson.id} className="border-b border-token hover:bg-token-surface-subtle">
                          <td className="py-3 px-4">
                            <div>
                              <Text variant="body" className="font-medium text-token-text-primary">
                                {formatDate(lesson.scheduled_start)}
                              </Text>
                              <Text variant="small" className="text-token-text-secondary">
                                2024
                              </Text>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Text variant="body" className="text-token-text-primary">
                              {formatTime(lesson.scheduled_start)}
                            </Text>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getCountryFlag(lesson.student.country)}</span>
                              <div>
                                <Text variant="body" className="font-medium text-token-text-primary">
                                  {lesson.student.name}
                                </Text>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-token-info-light text-token-info rounded text-xs font-medium">
                              {lesson.lesson_type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Text variant="body" className="text-token-text-primary">
                              {lesson.duration_minutes} min
                            </Text>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(lesson.status, lesson.cancellation_reason)}
                          </td>
                          <td className="py-3 px-4">
                            {renderRatingPreview(lesson)}
                          </td>
                          <td className="py-3 px-4">
                            {lesson.lesson_notes ? (
                              <Button variant="outline" size="sm" onClick={() => handleNotesEdit(lesson)}>
                                <MessageSquare className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleNotesEdit(lesson)}>
                                <Edit className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {historyData.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-token">
                <div className="flex items-center justify-between">
                  <Text variant="small" className="text-token-text-secondary">
                    Showing {((historyData.pagination.page - 1) * historyData.pagination.limit) + 1}-{Math.min(historyData.pagination.page * historyData.pagination.limit, historyData.pagination.total)} of {historyData.pagination.total} lessons
                  </Text>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(historyData.pagination.page - 1)}
                      disabled={historyData.pagination.page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <span className="px-3 py-1 bg-token-primary text-white rounded text-sm">
                      {historyData.pagination.page}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(historyData.pagination.page + 1)}
                      disabled={historyData.pagination.page >= historyData.pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Notes Modal */}
          {showNotesModal && selectedLesson && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-token-surface rounded-xl p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <Text variant="h3" className="text-token-primary">
                    Lesson Notes
                  </Text>
                  <Button variant="outline" size="sm" onClick={() => setShowNotesModal(false)}>
                    ×
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Text variant="body" className="text-token-text-secondary mb-2">
                    {selectedLesson.lesson_type} with {selectedLesson.student.name}
                  </Text>
                  <Text variant="small" className="text-token-text-muted">
                    {formatDate(selectedLesson.scheduled_start)} at {formatTime(selectedLesson.scheduled_start)}
                  </Text>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-token-text-secondary mb-2">
                    Private Notes
                  </label>
                  <textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Write quick reminders or context for your next lesson with this student..."
                    className="w-full p-3 border border-token rounded-md bg-token-surface resize-none"
                    rows={6}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowNotesModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={saveNotes} className="flex-1">
                    Save Notes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rating Modal */}
          {showRatingModal && selectedRating && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-token-surface rounded-xl p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <Text variant="h3" className="text-token-primary">
                    Student Review
                  </Text>
                  <Button variant="outline" size="sm" onClick={() => setShowRatingModal(false)}>
                    ×
                  </Button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {renderRatingStars(selectedRating.rating)}
                    <Text variant="body" className="font-medium text-gray-900">
                      {selectedRating.rating}/5
                    </Text>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Text variant="body" className="text-gray-900 leading-relaxed">
                      {selectedRating.comment}
                    </Text>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowRatingModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  );
} 