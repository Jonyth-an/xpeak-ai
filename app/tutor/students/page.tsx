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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get tutor profile first
      const { data: tutorProfile } = await supabase
        .from('tutor_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!tutorProfile) {
        setError('Tutor profile not found');
        return;
      }

      // Get tutor-student relationships
      const { data: relationships, error: relationshipsError } = await supabase
        .from('tutor_students')
        .select(`
          student_id,
          total_lessons,
          total_minutes,
          first_lesson_at,
          last_lesson_at,
          student_goals,
          tutor_notes,
          student_level
        `)
        .eq('tutor_id', tutorProfile.id);

      if (relationshipsError) {
        console.error('Error fetching relationships:', relationshipsError);
        setError('Failed to load student data');
        return;
      }

      if (!relationships || relationships.length === 0) {
        setStudentsData({
          students: [],
          overview: {
            active_students: 0,
            total_lessons: 0,
            total_hours: 0,
            countries: 0
          }
        });
        return;
      }

      // Get student profile details from auth.users via API
      const studentIds = relationships.map(r => r.student_id);
      let studentProfiles: any[] = [];

      // For now, create placeholder data since we can't easily access auth.users from client
      // In production, you'd want to create an API endpoint to fetch user details
      const students = relationships.map(rel => {
        return {
          id: rel.student_id,
          name: `Student ${rel.student_id.slice(0, 8)}`,
          email: `student${rel.student_id.slice(0, 4)}@example.com`,
          avatar_url: null,
          country: 'Unknown',
          level: rel.student_level || 'intermediate',
          total_lessons: rel.total_lessons || 0,
          total_hours: Math.round((rel.total_minutes || 0) / 60 * 10) / 10,
          last_lesson_date: rel.last_lesson_at || rel.first_lesson_at,
          goals: rel.student_goals || '',
          tutor_notes: rel.tutor_notes || '',
          first_lesson_at: rel.first_lesson_at
        };
      });

      // Calculate overview stats
      const totalLessons = students.reduce((sum, s) => sum + s.total_lessons, 0);
      const totalHours = students.reduce((sum, s) => sum + s.total_hours, 0);
      const countries = new Set(students.map(s => s.country).filter(Boolean)).size;

      setStudentsData({
        students: students.filter(s => 
          !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.country.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        overview: {
          active_students: students.length,
          total_lessons: totalLessons,
          total_hours: Math.round(totalHours * 10) / 10,
          countries
        }
      });

    } catch (error) {
      console.error('Error fetching students data:', error);
      setError('An error occurred while loading students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
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
            <Text variant="h1" as="h1" className="text-token-primary mb-2">
              My Students
            </Text>
            <Text variant="body" className="text-token-text-secondary">
              Manage your student relationships and track their progress.
            </Text>
          </div>

          {/* Search */}
          <Card className="p-6 bg-token-surface border border-token mb-6 rounded-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-token-text-muted w-4 h-4" />
              <input
                type="text"
                placeholder="Search students by name or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-token rounded-md bg-token-surface"
              />
            </div>
          </Card>

          {/* Students Grid */}
          {studentsData.students.length === 0 ? (
            <Card className="p-8 bg-token-surface border border-token text-center rounded-xl">
              <Users className="w-12 h-12 text-token-text-muted mx-auto mb-4" />
              <Text variant="h3" className="text-token-text-secondary mb-2">No Students Yet</Text>
              <Text variant="body" className="text-token-text-muted">
                Your students will appear here once they book lessons with you.
              </Text>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {studentsData.students.map((student) => (
                <Card key={student.id} className="p-6 bg-token-surface border border-token rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-token-primary rounded-full flex items-center justify-center text-white font-medium mr-3">
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
                        <Text variant="h4" className="text-token-text-primary mr-2">
                          {student.name}
                        </Text>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(student.level)}`}>
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
                    <div className="text-center">
                      <Text variant="h3" className="text-2xl font-bold text-blue-600">
                        {student.total_lessons}
                      </Text>
                      <Text variant="small" className="text-token-text-secondary">
                        Lessons
                      </Text>
                    </div>
                    <div className="text-center">
                      <Text variant="h3" className="text-2xl font-bold text-green-600">
                        {student.total_hours}
                      </Text>
                      <Text variant="small" className="text-token-text-secondary">
                        Hours
                      </Text>
                    </div>
                  </div>

                  {/* Last Lesson */}
                  <div className="mb-4">
                    <Text variant="small" className="text-token-text-secondary">
                      Last Lesson
                    </Text>
                    <Text variant="body" className="font-medium text-token-text-primary">
                      {formatDate(student.last_lesson_date)}
                    </Text>
                  </div>

                  {/* Goals */}
                  {student.goals && (
                    <div className="mb-4">
                      <Text variant="small" className="text-token-text-secondary">
                        Goals
                      </Text>
                      <Text variant="body" className="text-token-text-primary">
                        {student.goals}
                      </Text>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleNotesEdit(student)}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Notes
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Student Overview */}
          <Card className="p-6 bg-token-surface border border-token rounded-xl">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-token-primary mr-2" />
              <Text variant="h3" className="text-token-primary">Student Overview</Text>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Text variant="h2" className="text-3xl font-bold text-blue-600">
                  {studentsData.overview.active_students}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Active Students
                </Text>
              </div>
              <div className="text-center">
                <Text variant="h2" className="text-3xl font-bold text-green-600">
                  {studentsData.overview.total_lessons}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Total Lessons
                </Text>
              </div>
              <div className="text-center">
                <Text variant="h2" className="text-3xl font-bold text-purple-600">
                  {studentsData.overview.total_hours}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Total Hours
                </Text>
              </div>
              <div className="text-center">
                <Text variant="h2" className="text-3xl font-bold text-orange-600">
                  {studentsData.overview.countries}
                </Text>
                <Text variant="body" className="text-token-text-secondary">
                  Countries
                </Text>
              </div>
            </div>
          </Card>

          {/* Notes Modal */}
          {showNotesModal && selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-token-surface rounded-xl p-6 w-full max-w-lg">
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