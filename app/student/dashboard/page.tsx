'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RequireEmailVerification from '@/app/components/RequireEmailVerification';
import Text from '@/app/components/ui/Text';
import { Button, Card } from '@/app/components/ui';
import { Sparkles, BookOpen, Users, Trophy, ArrowRight, Calendar, Clock, User, Video, Eye, CheckCircle, X, RefreshCw, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import DashboardSidebar from './components/DashboardSidebar';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

interface Lesson {
  id: string;
  lesson_type: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  minutes_until: number;
  can_join: boolean;
  tutor: {
    id: string;
    name: string;
    profile_image_url?: string;
    bio?: string;
    timezone: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
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

      const response = await fetch('/api/lessons/user?upcoming=true&limit=5', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUpcomingLessons(data.lessons || []);
      } else {
        console.error('Failed to fetch upcoming lessons:', response.status);
        setError('Failed to load upcoming lessons');
      }
    } catch (error) {
      console.error('Error fetching upcoming lessons:', error);
      setError('An error occurred while loading lessons');
    } finally {
      setLoading(false);
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
                    {/* Welcome Header */}
                    <div className="text-center mb-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-token-primary to-token-accent rounded-full mb-8 shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <Text variant="h1" as="h1" className="mb-6">
                        Welcome back! 🎉
                      </Text>
                      <Text variant="lead" className="text-text-secondary max-w-2xl mx-auto">
                        Ready to continue your language learning journey? Here's what's coming up.
                      </Text>
                    </div>

                    {/* Upcoming Lessons Section */}
                    <div className="mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-6 h-6 text-token-primary" />
                          <Text variant="h2" as="h2">
                            Upcoming Lessons
                          </Text>
                        </div>
                        <Link href="/tutors">
                          <Button variant="outline" size="sm">
                            Book More Lessons
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>

                      {loading ? (
                        <Card className="p-8 text-center border border-gray-200 rounded-xl">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-token-primary mx-auto mb-4"></div>
                          <Text variant="body" className="text-token-text-secondary">
                            Loading your upcoming lessons...
                          </Text>
                        </Card>
                      ) : error ? (
                        <Card className="p-8 text-center border border-gray-200 rounded-xl">
                          <Text variant="body" className="text-token-error mb-4">
                            {error}
                          </Text>
                          <Button variant="outline" onClick={fetchUpcomingLessons}>
                            Try Again
                          </Button>
                        </Card>
                      ) : upcomingLessons.length === 0 ? (
                        <Card className="p-12 text-center border border-gray-200 rounded-xl">
                          <Calendar className="w-16 h-16 text-token-text-muted mx-auto mb-4" />
                          <Text variant="h3" className="text-token-text-secondary mb-2">
                            No Upcoming Lessons
                          </Text>
                          <Text variant="body" className="text-token-text-muted mb-6">
                            You don&apos;t have any upcoming lessons scheduled. Book your first lesson to get started!
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
                          {upcomingLessons.map((lesson) => (
                            <Card key={lesson.id} className="p-6 border border-gray-200 rounded-xl" variant="outlined">
                              <div className="flex items-start justify-between">
                                {/* Left Section: Avatar, Name, Time, Details */}
                                <div className="flex items-start gap-4 flex-1">
                                  {/* Tutor Avatar */}
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-token-primary to-token-accent flex items-center justify-center flex-shrink-0">
                                    {lesson.tutor?.profile_image_url ? (
                                      <Image 
                                        src={lesson.tutor.profile_image_url} 
                                        alt={lesson.tutor?.name || 'Tutor'}
                                        width={48}
                                        height={48}
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
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Section: Status Badge */}
                                <div className="flex-shrink-0 ml-4">
                                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${getStatusColor(lesson.status)}`}>
                                    {getStatusIcon(lesson.status)}
                                    {getStatusText(lesson.status)}
                                  </span>
                                </div>
                              </div>

                              {/* Bottom Section: Action Buttons */}
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                {lesson.can_join && (
                                  <Link href={`/lessons/${lesson.id}/video`}>
                                    <Button variant="primary" size="sm" className="text-xs px-3 py-1.5 h-8 transition-all duration-150 hover:scale-105 hover:shadow-md">
                                      <Video className="w-3.5 h-3.5 mr-1.5" />
                                      Join Lesson
                                    </Button>
                                  </Link>
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
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                      <Link href="/word-maze">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-xl">
                          <div className="w-12 h-12 bg-gradient-to-br from-token-primary to-token-accent rounded-xl flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <Text variant="h3" as="h3" className="mb-2">
                            Word Maze
                          </Text>
                          <Text variant="body" className="text-token-text-secondary text-sm">
                            Practice vocabulary with our interactive word maze game
                          </Text>
                        </Card>
                      </Link>

                      <Link href="/meet-sagea">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-xl">
                          <div className="w-12 h-12 bg-gradient-to-br from-token-secondary to-token-accent rounded-xl flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <Text variant="h3" as="h3" className="mb-2">
                            Meet Sagea
                          </Text>
                          <Text variant="body" className="text-token-text-secondary text-sm">
                            Connect with your AI language learning coach
                          </Text>
                        </Card>
                      </Link>

                      <Link href="/tutors">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-xl">
                          <div className="w-12 h-12 bg-gradient-to-br from-token-accent to-token-primary rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <Text variant="h3" as="h3" className="mb-2">
                            Book Lessons
                          </Text>
                          <Text variant="body" className="text-token-text-secondary text-sm">
                            Find and book lessons with qualified language tutors
                          </Text>
                        </Card>
                      </Link>

                      <Link href="/student/tutor-application">
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 rounded-xl">
                          <div className="w-12 h-12 bg-gradient-to-br from-token-success to-token-accent rounded-xl flex items-center justify-center mb-4">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                          <Text variant="h3" as="h3" className="mb-2">
                            Become a Tutor
                          </Text>
                          <Text variant="body" className="text-token-text-secondary text-sm">
                            Share your language skills and start teaching others
                          </Text>
                        </Card>
                      </Link>
                    </div>

                    {/* Footer Note */}
                    <div className="text-center pt-8 border-t border-white/20">
                      <Text variant="small" className="text-token-text-tertiary">
                        Have feedback or suggestions? We'd love to hear from you! 
                        <Link href="/community" className="text-token-primary hover:underline ml-1">
                          Join our community
                        </Link>
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 