'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { 
  Card, 
  Text, 
  Button, 
  TutorPageLayout, 
  TutorPageHeader, 
  MetricsGrid, 
  LoadingState, 
  ErrorState 
} from '@/app/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Clock,
  Info,
  AlertCircle
} from 'lucide-react';

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
  timezone: string;
}

interface BookedLesson {
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  student_id: string;
}

interface CalendarData {
  availability: AvailabilitySlot[];
  booked_lessons: BookedLesson[];
  week_stats: {
    available_slots: number;
    booked_lessons: number;
    booking_rate: number;
  };
  tutor_timezone: string;
}

interface AddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (slot: Omit<AvailabilitySlot, 'id' | 'timezone'>) => void;
  selectedDay?: number;
  selectedTime?: string;
}

function AddAvailabilityModal({ isOpen, onClose, onAdd, selectedDay, selectedTime }: AddAvailabilityModalProps) {
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay ?? 1);
  const [startTime, setStartTime] = useState(selectedTime ?? '09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isRecurring, setIsRecurring] = useState(true);

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Helper to generate 15-min increment time options for dropdowns
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      timeOptions.push(`${h}:${m}`);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate times
    if (startTime >= endTime) {
      alert('End time must be after start time');
      return;
    }

    onAdd({
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      is_recurring: isRecurring
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-token-surface rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <Text variant="h3" className="text-token-primary">Add Availability</Text>
          <Button variant="outline" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-token-text-secondary mb-1">
              Day of Week
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
              aria-label="Select day of week"
            >
              {daysOfWeek.map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-token-text-secondary mb-1">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                required
                aria-label="Start time"
              >
                {timeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-token-text-secondary mb-1">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                required
                aria-label="End time"
              >
                {timeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="recurring" className="text-sm text-token-text-secondary">
              Recurring weekly
            </label>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Add Availability
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TutorCalendar() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>();
  const [selectedTime, setSelectedTime] = useState<string>();

  // Generate time slots (00:00 to 23:00 in 1-hour increments)
  const timeSlots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Drag-to-select state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ dayIndex: number; slotIndex: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ dayIndex: number; slotIndex: number } | null>(null);

  // Helper to determine if a slot is in the current drag selection
  const isSlotInDragSelection = (dayIndex: number, slotIndex: number) => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    if (dayIndex !== dragStart.dayIndex) return false;
    const [start, end] = [dragStart.slotIndex, dragEnd.slotIndex].sort((a, b) => a - b);
    return slotIndex >= start && slotIndex <= end;
  };

  // When drag ends, open modal with selected range
  useEffect(() => {
    if (!isDragging && dragStart && dragEnd && dragStart.dayIndex === dragEnd.dayIndex) {
      const dayOfWeek = dragStart.dayIndex === 6 ? 0 : dragStart.dayIndex + 1;
      const startIdx = Math.min(dragStart.slotIndex, dragEnd.slotIndex);
      const endIdx = Math.max(dragStart.slotIndex, dragEnd.slotIndex) + 1;
      setSelectedDay(dayOfWeek);
      setSelectedTime(timeSlots[startIdx]);
      setShowAddModal(true);
      // Pre-fill modal with start and end time
      setTimeout(() => {
        setSelectedTime(timeSlots[startIdx]);
        // End time is exclusive, so use next slot or last slot
        const endTime = timeSlots[endIdx] || '23:59';
        const endInput = document.querySelector('select[aria-label="End time"]') as HTMLSelectElement;
        if (endInput) endInput.value = endTime;
      }, 0);
      setDragStart(null);
      setDragEnd(null);
    }
  }, [isDragging, dragStart, dragEnd, timeSlots]);

  useEffect(() => {
    fetchCalendarData();
  }, [currentWeek]);

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const weekStart = getWeekStart(currentWeek);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const response = await fetch(`/api/tutor/availability?week_start=${weekStartStr}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      } else {
        setError('Failed to load calendar data');
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('An error occurred while loading calendar');
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const handleAddAvailability = async (slot: Omit<AvailabilitySlot, 'id' | 'timezone'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/tutor/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(slot)
      });

      if (response.ok) {
        await fetchCalendarData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add availability');
      }
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('An error occurred while adding availability');
    }
  };

  const handleDeleteAvailability = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/tutor/availability?slot_id=${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        await fetchCalendarData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete availability');
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('An error occurred while deleting availability');
    }
  };

  const isSlotAvailable = (dayIndex: number, timeSlot: string) => {
    if (!calendarData) return false;
    
    return calendarData.availability.some(slot => {
      const slotDay = slot.day_of_week === 0 ? 6 : slot.day_of_week - 1; // Convert to Mon=0, Sun=6
      return slotDay === dayIndex && timeSlot >= slot.start_time && timeSlot < slot.end_time;
    });
  };

  const isSlotBooked = (dayIndex: number, timeSlot: string) => {
    if (!calendarData) return false;
    
    const weekStart = getWeekStart(currentWeek);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    
    return calendarData.booked_lessons.some(lesson => {
      const lessonDate = new Date(lesson.scheduled_start);
      const lessonTime = lessonDate.toTimeString().slice(0, 5);
      
      return (
        lessonDate.toDateString() === targetDate.toDateString() &&
        lessonTime === timeSlot
      );
    });
  };

  const getSlotStatus = (dayIndex: number, timeSlot: string) => {
    if (isSlotBooked(dayIndex, timeSlot)) {
      return 'booked';
    } else if (isSlotAvailable(dayIndex, timeSlot)) {
      return 'available';
    } else {
      return 'unavailable';
    }
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'booked':
        return 'bg-blue-100 border-blue-300';
      case 'unavailable':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleSlotClick = (dayIndex: number, timeSlot: string) => {
    const status = getSlotStatus(dayIndex, timeSlot);
    
    if (status === 'unavailable') {
      // Convert dayIndex (Mon=0, Sun=6) to day_of_week (Sun=0, Sat=6)
      const dayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1;
      setSelectedDay(dayOfWeek);
      setSelectedTime(timeSlot);
      setShowAddModal(true);
    }
  };

  if (loading) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="xl" padding="lg">
          <LoadingState 
            message="Loading your calendar..." 
            size="lg" 
            variant="spinner"
          />
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  if (error || !calendarData) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="lg" padding="lg">
          <ErrorState
            title="Unable to Load Calendar"
            message={error || 'Please try refreshing the page'}
            onRetry={fetchCalendarData}
            showDetails={false}
          />
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  const weekStart = getWeekStart(currentWeek);

  // Prepare metrics for MetricsGrid
  const metrics = [
    {
      title: 'Available Slots',
      value: calendarData.week_stats.available_slots,
      icon: <Clock className="w-6 h-6" />,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Booked Lessons',
      value: calendarData.week_stats.booked_lessons,
      icon: <Calendar className="w-6 h-6" />,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Booking Rate',
      value: `${calendarData.week_stats.booking_rate}%`,
      icon: <div className="w-6 h-6 font-bold text-center">%</div>,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <TutorLayout>
      <TutorPageLayout containerWidth="xl" padding="lg">
        <TutorPageHeader
          title="My Teaching Calendar"
          subtitle="Set your availability. Students can book lessons based on the time slots you open."
          titleVariant="h1"
          subtitleVariant="body"
          actions={
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Availability
            </Button>
          }
        />

        {/* Timezone Notice */}
        <Card className="p-4 mb-6 bg-blue-50 border border-blue-200" variant="outlined">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
            <Text variant="small" className="text-blue-800">
              All times shown in your local timezone ({calendarData.tutor_timezone}). You can adjust your timezone in settings.
            </Text>
          </div>
        </Card>

        {/* Calendar Header */}
        <Card className="p-6 mb-6" variant="default">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <Calendar className="w-6 h-6 text-token-primary" />
              <Text variant="h3" className="text-token-primary">
                Week of {formatWeekRange(weekStart)}
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span className="text-token-text-secondary">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
              <span className="text-token-text-secondary">Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div>
              <span className="text-token-text-secondary">Unavailable</span>
            </div>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="p-6 mb-6" variant="default">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="p-2 text-center font-medium text-token-text-secondary">Time</div>
                {daysOfWeek.map((day, index) => {
                  const date = new Date(weekStart);
                  date.setDate(weekStart.getDate() + index);
                  return (
                    <div key={day} className="p-2 text-center">
                      <div className="font-medium text-token-text-primary">{day}</div>
                      <div className="text-sm text-token-text-secondary">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              {timeSlots.map((timeSlot, slotIndex) => (
                <div key={timeSlot} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="p-2 text-center text-sm text-token-text-secondary font-medium">
                    {timeSlot}
                  </div>
                  {daysOfWeek.map((_, dayIndex) => {
                    const status = getSlotStatus(dayIndex, timeSlot);
                    const isSelected = isSlotInDragSelection(dayIndex, slotIndex);
                    return (
                      <div
                        key={`${dayIndex}-${timeSlot}`}
                        className={`p-2 h-12 border rounded cursor-pointer transition-colors ${getSlotColor(status)} ${isSelected ? 'ring-2 ring-token-primary bg-token-primary/10' : ''}`}
                        onMouseDown={() => {
                          setIsDragging(true);
                          setDragStart({ dayIndex, slotIndex });
                          setDragEnd({ dayIndex, slotIndex });
                        }}
                        onMouseEnter={() => {
                          if (isDragging && dragStart && dragStart.dayIndex === dayIndex) {
                            setDragEnd({ dayIndex, slotIndex });
                          }
                        }}
                        onMouseUp={() => {
                          setIsDragging(false);
                        }}
                        // Mobile touch support
                        data-day-index={dayIndex}
                        data-slot-index={slotIndex}
                        onTouchStart={e => {
                          setIsDragging(true);
                          setDragStart({ dayIndex, slotIndex });
                          setDragEnd({ dayIndex, slotIndex });
                        }}
                        onTouchMove={e => {
                          const touch = e.touches[0];
                          const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
                          if (target && target.dataset.dayIndex && target.dataset.slotIndex) {
                            const d = parseInt(target.dataset.dayIndex, 10);
                            const s = parseInt(target.dataset.slotIndex, 10);
                            if (isDragging && dragStart && dragStart.dayIndex === d) {
                              setDragEnd({ dayIndex: d, slotIndex: s });
                            }
                          }
                        }}
                        onTouchEnd={() => {
                          setIsDragging(false);
                        }}
                        title={
                          status === 'available' ? 'Available for booking' :
                          status === 'booked' ? 'Lesson booked' :
                          'Click or drag to add availability'
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSlotClick(dayIndex, timeSlot);
                          }
                        }}
                      >
                        {status === 'available' && (
                          <div className="text-center text-xs text-green-700 font-medium">Open</div>
                        )}
                        {status === 'booked' && (
                          <div className="text-center text-xs text-blue-700 font-medium">Booked</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Weekly Stats */}
        <MetricsGrid 
          metrics={metrics} 
          columns={3} 
          className="mb-6"
          cardVariant="default"
          cardPadding="lg"
        />

        {/* Add Availability Modal */}
        <AddAvailabilityModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedDay(undefined);
            setSelectedTime(undefined);
          }}
          onAdd={handleAddAvailability}
          selectedDay={selectedDay}
          selectedTime={selectedTime}
        />
      </TutorPageLayout>
    </TutorLayout>
  );
} 