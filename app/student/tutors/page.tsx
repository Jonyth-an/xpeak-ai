'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import RequireEmailVerification from '../../components/RequireEmailVerification';
import DashboardSidebar from '../../dashboard/components/DashboardSidebar';
import { Card, Text, Button, LoadingState, ErrorState } from '@/app/components/ui';
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  BookOpen
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { MessageButton } from '@/app/components/ui/MessageButton'
import { chatService } from '@/lib/services/chatService'
import { useRouter } from 'next/navigation'

interface Tutor {
  id: string;
  name: string;
  country: string;
  flag: string;
  accent: string;
  rating: number;
  reviewCount: number;
  bio: string;
  languages: Array<{ language: string; fluency: string }>;
  specializations: string[];
  hourlyRate: number;
  profileImageUrl?: string;
  availableSlots: Array<{
    date: string;
    time: string;
    fullDate: string;
    fullTime: string;
  }>;
  timezone: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function StudentTutorsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [messageLoading, setMessageLoading] = useState<string | null>(null); // tutorId loading

  useEffect(() => {
    fetchTutors();
  }, [currentPage, searchQuery]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/tutors?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setTutors(data.tutors);
        setPagination(data.pagination);
      } else {
        setError('Failed to load tutors');
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setError('An error occurred while loading tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatLanguages = (languages: Array<{ language: string; fluency: string }>) => {
    if (!languages || languages.length === 0) return 'No additional languages';
    return languages.map(lang => `${lang.language} (${lang.fluency})`).join(', ');
  };

  const formatAvailableSlots = (slots: Array<{ date: string; time: string }>) => {
    if (!slots || slots.length === 0) return 'No available slots';
    return slots.map(slot => `${slot.date} at ${slot.time}`).join(', ');
  };

  if (loading && tutors.length === 0) {
    return (
      <ProtectedRoute>
        <RequireEmailVerification>
          <Layout>
            <div className="min-h-screen flex items-center justify-center">
              <LoadingState 
                message="Loading tutors..." 
                fullScreen 
              />
            </div>
          </Layout>
        </RequireEmailVerification>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <RequireEmailVerification>
          <Layout>
            <div className="min-h-screen flex items-center justify-center">
              <ErrorState 
                title="Unable to Load Tutors"
                message={error}
                onRetry={fetchTutors}
                fullScreen
              />
            </div>
          </Layout>
        </RequireEmailVerification>
      </ProtectedRoute>
    );
  }

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
                    {/* Header */}
                    <div className="mb-8">
                      <Text variant="h1" as="h1" className="mb-2">Find Your Perfect Tutor</Text>
                      <Text variant="body" className="text-token-text-secondary">
                        Browse our qualified tutors and book your next lesson
                      </Text>
                    </div>

                    {/* Search Bar */}
                    <Card className="p-6 mb-8 rounded-xl">
                      <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-token-text-muted" />
                          <input
                            type="text"
                            placeholder="Search tutors by name, bio, or languages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-token-gray-300 rounded-lg focus:ring-2 focus:ring-token-accent focus:border-transparent"
                          />
                        </div>
                        <Button type="submit" disabled={loading}>
                          Search
                        </Button>
                      </form>
                    </Card>

                    {/* Results Info */}
                    {pagination && (
                      <div className="mb-6">
                        <Text variant="body" className="text-token-text-secondary">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tutors
                        </Text>
                      </div>
                    )}

                    {/* Tutor Cards */}
                    <div className="space-y-6">
                      {tutors.map((tutor) => (
                        <Card key={tutor.id} className="p-6 rounded-xl">
                          <div className="flex gap-6">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 bg-token-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                                {tutor.profileImageUrl ? (
                                  <Image
                                    src={tutor.profileImageUrl}
                                    alt={tutor.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-10 h-10 text-token-gray-400" />
                                )}
                              </div>
                              <div className="mt-2 text-center">
                                <span className="text-2xl">{tutor.flag}</span>
                              </div>
                            </div>

                            {/* Tutor Info */}
                            <div className="flex-1">
                              {/* Header Row */}
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Text variant="h3" as="h3">{tutor.name}</Text>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4 text-token-text-muted" />
                                      <Text variant="small" className="text-token-text-secondary">
                                        {tutor.country}
                                      </Text>
                                    </div>
                                  </div>
                                  <Text variant="small" className="text-token-text-secondary">
                                    Native: {tutor.accent} | Accent: {tutor.accent}
                                  </Text>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                  <Text variant="body" className="font-semibold">
                                    {tutor.rating.toFixed(1)}
                                  </Text>
                                  <Text variant="small" className="text-token-text-secondary">
                                    ({tutor.reviewCount} reviews)
                                  </Text>
                                </div>
                              </div>

                              {/* Languages */}
                              <div className="mb-3">
                                <Text variant="small" className="text-token-text-secondary">
                                  Also Speaks: {formatLanguages(tutor.languages)}
                                </Text>
                              </div>

                              {/* Bio */}
                              <div className="mb-4">
                                <Text variant="body" className="text-token-text-secondary leading-relaxed">
                                  {tutor.bio}
                                </Text>
                              </div>

                              {/* Availability */}
                              <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-4 h-4 text-token-accent" />
                                <Text variant="small" className="text-token-text-secondary">
                                  {formatAvailableSlots(tutor.availableSlots)}
                                </Text>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-3">
                                <Button variant="outline" size="sm" onClick={() => window.location.href = `/tutors/${tutor.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Profile
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => window.location.href = `/tutors/${tutor.id}?booking_type=trial`}>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Book Trial
                                </Button>
                                <Button size="sm" onClick={() => window.location.href = `/tutors/${tutor.id}?booking_type=lesson`}>
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  Book Lesson
                                </Button>
                                <MessageButton
                                  label={messageLoading === tutor.id ? 'Loading...' : 'Message'}
                                  onClick={async () => {
                                    if (!user) return;
                                    setMessageLoading(tutor.id);
                                    try {
                                      // 1. Get all conversations for the user
                                      const conversations = await chatService.getConversations(user.id);
                                      // 2. Find a student_tutor conversation with this tutor
                                      const existing = conversations.find(c =>
                                        c.conversation_type === 'student_tutor' &&
                                        c.participants &&
                                        c.participants.some(p => p.user_id === tutor.id)
                                      );
                                      if (existing) {
                                        router.push(`/student/chat/${existing.id}`);
                                      } else {
                                        // 3. Create new conversation
                                        const newConv = await chatService.createConversation({
                                          title: `Chat with ${tutor.name}`,
                                          conversation_type: 'student_tutor',
                                          participants: [tutor.id],
                                          participant_roles: ['tutor']
                                        });
                                        if (newConv) {
                                          router.push(`/student/chat/${newConv.id}`);
                                        } else {
                                          alert('Failed to start chat.');
                                        }
                                      }
                                    } catch (err) {
                                      alert('Failed to start chat.');
                                    } finally {
                                      setMessageLoading(null);
                                    }
                                  }}
                                  disabled={messageLoading === tutor.id}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!pagination.hasPrev}
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          <Text variant="small" className="text-token-text-secondary">
                            Page {pagination.page} of {pagination.totalPages}
                          </Text>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pagination.hasNext}
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* No Results */}
                    {tutors.length === 0 && !loading && (
                      <Card className="p-8 text-center rounded-xl">
                        <Text variant="h3" as="h3" className="mb-2">No Tutors Found</Text>
                        <Text variant="body" className="text-token-text-secondary mb-4">
                          Try adjusting your search criteria or check back later for new tutors.
                        </Text>
                        <Button variant="outline" onClick={() => setSearchQuery('')}>
                          Clear Search
                        </Button>
                      </Card>
                    )}
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