'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Button } from '@/app/components/ui';
import Text from '@/app/components/ui/Text';
import { supabase } from '@/lib/supabaseClient';
import { 
  Search,
  Users,
  BookOpen,
  Clock,
  Globe,
  MessageSquare,
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string | null;
  country: string;
  level: string;
  total_lessons: number;
  total_hours: number;
  last_lesson_date: string;
  goals: string;
  tutor_notes?: string;
  first_lesson_at: string;
}

interface StudentsData {
  students: Student[];
  overview: {
    active_students: number;
    total_lessons: number;
    total_hours: number;
    countries: number;
  };
}

export default function MyStudents() {
  const [studentsData, setStudentsData] = useState<StudentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');

  useEffect(() => {
    fetchStudentsData();
  }, []);

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return;
      }
      
      // Fetch data from the new API endpoint
      const response = await fetch('/api/tutor/students', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      // Apply search filter if there's a search term
      const filteredStudents = data.students.filter((s: Student) => 
        !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.country.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setStudentsData({
        students: filteredStudents,
        overview: data.overview
      });

    } catch (error) {
      console.error('Error fetching students data:', error);
      setError('An error occurred while loading students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // The search is now handled client-side in fetchStudentsData
    // Just refetch the data to apply the current search term
    fetchStudentsData();
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

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-token-warning-light text-token-warning';
      case 'intermediate': return 'bg-token-info-light text-token-info';
      case 'advanced': return 'bg-token-success-light text-token-success';
      default: return 'bg-token-surface-subtle text-token-text-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleNotesEdit = (student: Student) => {
    setSelectedStudent(student);
    setEditingNotes(student.tutor_notes || '');
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    if (!selectedStudent) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get tutor profile
      const { data: tutorProfile } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!tutorProfile) return;

      // Update tutor notes
      const { error } = await supabase
        .from('tutor_students')
        .update({ tutor_notes: editingNotes })
        .eq('tutor_id', tutorProfile.id)
        .eq('student_id', selectedStudent.id);

      if (error) {
        console.error('Error saving notes:', error);
        alert('Failed to save notes');
      } else {
        await fetchStudentsData();
        setShowNotesModal(false);
        setSelectedStudent(null);
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

  if (error || !studentsData) {
    return (
      <TutorLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <Text variant="h2" className="text-token-error mb-2">Unable to Load Students</Text>
            <Text variant="body" className="text-token-text-secondary mb-4">{error}</Text>
            <Button variant="primary" onClick={fetchStudentsData}>Retry</Button>
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <Text variant="h1" as="h1" className="text-token-text font-bold">
                My Students
              </Text>
            </div>
            <Text variant="body" className="text-token-text-secondary">
              Manage your student relationships and track their progress.
            </Text>
          </div>

          {/* Student Overview */}
          <Card className="p-6 bg-surface border border-border mb-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-6">
              <div className="w-6 h-6 bg-token-success/20 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="w-4 h-4 text-token-success" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Student Overview</Text>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Text variant="h2" className="text-3xl font-bold text-primary mb-1">
                  {studentsData.overview.active_students}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Active Students
                </Text>
              </div>
              <div className="text-center p-4 bg-token-success/5 rounded-lg border border-token-success/20">
                <Text variant="h2" className="text-3xl font-bold text-token-success mb-1">
                  {studentsData.overview.total_lessons}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Total Lessons
                </Text>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                <Text variant="h2" className="text-3xl font-bold text-accent mb-1">
                  {studentsData.overview.total_hours}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Total Hours
                </Text>
              </div>
              <div className="text-center p-4 bg-token-warning/5 rounded-lg border border-token-warning/20">
                <Text variant="h2" className="text-3xl font-bold text-token-warning mb-1">
                  {studentsData.overview.countries}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Countries
                </Text>
              </div>
            </div>
          </Card>

          {/* Search */}
          <Card className="p-6 bg-surface border border-border mb-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-token-text-secondary" />
              <Text variant="h3" className="text-token-text font-semibold">Find Students</Text>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-token-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search students by name or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-surface text-token-text placeholder:text-token-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </Card>

          {/* Students Grid */}
          {studentsData.students.length === 0 ? (
            <Card className="p-12 bg-surface border border-border text-center rounded-xl shadow-sm">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-token-text-muted/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-token-text-muted" />
                </div>
                <Text variant="h3" className="text-token-text font-semibold mb-2">No Students Yet</Text>
                <Text variant="body" className="text-token-text-secondary max-w-md">
                  Your students will appear here once they book lessons with you. Check your calendar to set your availability.
                </Text>
              </div>
            </Card>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <Text variant="h3" className="text-token-text font-semibold">
                  Your Students ({studentsData.students.length})
                </Text>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {studentsData.students.map((student) => (
                  <Card key={student.id} className="p-6 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-text-inverse font-medium mr-3 shadow-sm">
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt={student.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          student.name.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Text variant="h4" className="text-token-text font-semibold mr-2">
                            {student.name}
                          </Text>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(student.level)}`}>
                            {student.level.charAt(0).toUpperCase() + student.level.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg mr-1">{getCountryFlag(student.country)}</span>
                          <Text variant="small" className="text-token-text-secondary">
                            {student.country}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Text variant="h3" className="text-xl font-bold text-primary mb-1">
                          {student.total_lessons}
                        </Text>
                        <Text variant="small" className="text-token-text-secondary">
                          Lessons
                        </Text>
                      </div>
                      <div className="text-center p-3 bg-token-success/5 rounded-lg border border-token-success/20">
                        <Text variant="h3" className="text-xl font-bold text-token-success mb-1">
                          {student.total_hours}
                        </Text>
                        <Text variant="small" className="text-token-text-secondary">
                          Hours
                        </Text>
                      </div>
                    </div>

                    {/* Last Lesson */}
                    <div className="mb-4 p-3 bg-token-surface-accent rounded-lg">
                      <Text variant="small" className="text-token-text-secondary font-medium uppercase tracking-wide">
                        Last Lesson
                      </Text>
                      <Text variant="body" className="font-semibold text-token-text">
                        {formatDate(student.last_lesson_date)}
                      </Text>
                    </div>

                    {/* Goals */}
                    {student.goals && (
                      <div className="mb-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
                        <Text variant="small" className="text-token-text-secondary font-medium uppercase tracking-wide mb-1">
                          Goals
                        </Text>
                        <Text variant="body" className="text-token-text leading-relaxed">
                          {student.goals}
                        </Text>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleNotesEdit(student)}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Notes
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Notes Modal */}
          {showNotesModal && selectedStudent && (
            <div className="fixed inset-0 bg-token-overlay flex items-center justify-center z-50">
              <div className="bg-surface rounded-lg p-6 w-full max-w-lg border border-border shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <Text variant="h3" className="text-token-primary">
                    Student Notes (Private)
                  </Text>
                  <Button variant="outline" size="sm" onClick={() => setShowNotesModal(false)}>
                    ×
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Text variant="body" className="text-token-text-secondary mb-2">
                    {selectedStudent.name} ({selectedStudent.country})
                  </Text>
                  <Text variant="small" className="text-token-text-muted">
                    {selectedStudent.total_lessons} lessons • {selectedStudent.total_hours} hours
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
        </div>
      </div>
    </TutorLayout>
  );
} 