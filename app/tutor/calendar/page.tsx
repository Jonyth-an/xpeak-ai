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
  AlertCircle,
  CheckCircle,
  XCircle
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
  onAdd: (slots: Array<{ day_of_week: number; start_time: string; end_time: string; specific_date: string }>) => void;
  selectedDay?: number;
  selectedTime?: string;
  initialEndTime?: string;
  initialSpecificDate?: string | null;
  calendarData?: CalendarData | null;
  onDeleteSlot?: (slot: AvailabilitySlot) => void;
}

function AddAvailabilityModal({ isOpen, onClose, onAdd, selectedDay, selectedTime, initialEndTime, initialSpecificDate, calendarData, onDeleteSlot }: AddAvailabilityModalProps) {
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay ?? 1);
  const [specificDate, setSpecificDate] = useState(initialSpecificDate ?? '');
  const [startTime, setStartTime] = useState(selectedTime ?? '09:00');
  const [endTime, setEndTime] = useState(initialEndTime ?? '10:00');
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurringStartDate, setRecurringStartDate] = useState('');
  const [recurringWeeks, setRecurringWeeks] = useState(4);

  useEffect(() => {
    console.log('🔍 Modal useEffect triggered with props:', {
      isOpen,
      selectedDay,
      selectedTime,
      initialEndTime,
      initialSpecificDate
    });
    
    if (isOpen) {
      console.log('🔍 Setting modal form values:');
      console.log('  - dayOfWeek:', selectedDay ?? 1);
      console.log('  - specificDate:', initialSpecificDate ?? '');
      console.log('  - startTime:', selectedTime ?? '09:00');
      console.log('  - endTime:', initialEndTime ?? '10:00');
      console.log('  - recurringStartDate:', initialSpecificDate ?? '');
      
      setDayOfWeek(selectedDay ?? 1);
      setSpecificDate(initialSpecificDate ?? '');
      setStartTime(selectedTime ?? '09:00');
      setEndTime(initialEndTime ?? '10:00');
      // If we have an initial specific date, use it as the recurring start date
      setRecurringStartDate(initialSpecificDate ?? '');
      setRecurringWeeks(4);
    }
  }, [isOpen, selectedDay, selectedTime, initialEndTime, initialSpecificDate]);

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  // Helper to generate 15-min increment time options for dropdowns
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      timeOptions.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      alert('End time must be after start time');
      return;
    }
    if (isRecurring) {
      if (!recurringStartDate) {
        alert('Please select a start date');
        return;
      }
      if (recurringWeeks < 1 || recurringWeeks > 52) {
        alert('Number of weeks must be between 1 and 52');
        return;
      }
      // Generate all dates for the selected day of week, from start date, for N weeks
      const start = new Date(recurringStartDate);
      const slots = [];
      for (let i = 0; i < recurringWeeks; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + ((7 + dayOfWeek - d.getDay()) % 7) + i * 7);
        const dateStr = d.toISOString().split('T')[0];
        slots.push({
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          specific_date: dateStr
        });
      }
      onAdd(slots);
    } else {
      if (!specificDate) {
        alert('Please select a date');
        return;
      }
      const date = new Date(specificDate);
      const dayOfWeekForDate = date.getDay();
      onAdd([
        {
          day_of_week: dayOfWeekForDate,
          start_time: startTime,
          end_time: endTime,
          specific_date: specificDate
        }
      ]);
    }
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
          {isRecurring ? (
            <>
              <div>
                <label className="block text-sm font-medium text-token-text-secondary mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={recurringStartDate}
                  onChange={(e) => setRecurringStartDate(e.target.value)}
                  className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                  aria-label="Select start date"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-token-text-secondary mb-1">
                  Number of Weeks
                </label>
                <input
                  type="number"
                  value={recurringWeeks}
                  onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                  className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                  aria-label="Number of weeks"
                  min="1"
                  max="52"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-token-text-secondary mb-1">
                Date
              </label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                aria-label="Select date"
                required
              />
            </div>
          )}
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
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            {/* Only show Delete button if there's an existing slot */}
            {(() => {
              const existingSlot = calendarData?.availability.find((s: AvailabilitySlot) => 
                s.specific_date === initialSpecificDate && 
                s.start_time.split(':').slice(0, 2).join(':') === selectedTime
              );
              
              if (existingSlot) {
                return (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      console.log('🔍 Delete button clicked with existing slot:', existingSlot);
                      if (onDeleteSlot) {
                        onDeleteSlot(existingSlot);
                        onClose();
                      }
                    }} 
                    className="flex-1"
                  >
                    Delete
                  </Button>
                );
              }
              return null;
            })()}
            <Button type="submit" variant="primary" className="flex-1">
              Add Availability
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete modal component
function DeleteSlotModal({ open, slot, onClose, onDelete }: { open: boolean, slot: AvailabilitySlot | null, onClose: () => void, onDelete: (slotId: string) => void }) {
  if (!open || !slot) return null;
  const dateStr = slot.specific_date || '';
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-token-surface rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <Text variant="h3" className="text-token-primary">Delete Availability</Text>
          <Button variant="outline" size="sm" onClick={onClose}>×</Button>
        </div>
        <div className="mb-4">
          <Text variant="body">Are you sure you want to delete this slot?</Text>
          <div className="mt-2 text-sm text-token-text-secondary">
            <div>Date: {dateStr}</div>
            <div>Time: {slot.start_time} - {slot.end_time}</div>
          </div>
        </div>
        <div className="flex space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="button" variant="primary" onClick={() => onDelete(slot.id)} className="flex-1">Delete</Button>
        </div>
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
  
  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    show: boolean;
  } | null>(null);
  
  // Track newly added slots for highlighting
  const [newlyAddedSlots, setNewlyAddedSlots] = useState<Set<string>>(new Set());

  // Add state for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<AvailabilitySlot | null>(null);

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
      
      console.log('Fetching calendar data for week:', weekStartStr);

      const response = await fetch(`/api/tutor/availability?week_start=${weekStartStr}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('Calendar API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Calendar data received:', data);
        console.log('Availability slots count:', data.availability?.length || 0);
        setCalendarData(data);
      } else {
        console.error('Calendar API error status:', response.status);
        console.error('Calendar API error headers:', Object.fromEntries(response.headers.entries()));
        
        try {
          const errorData = await response.json();
          console.error('Calendar API error:', errorData);
          setError(`Failed to load calendar data: ${errorData.error || 'Unknown error'}`);
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
          setError(`Failed to load calendar data (Status: ${response.status})`);
        }
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

  const handleDeleteAvailability = async (slotId: string) => {
    if (!slotId) return;
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
        setNotification({
          type: 'success',
          message: 'Successfully deleted availability slot',
          show: true
        });
        await fetchCalendarData();
        setDeleteModalOpen(false);
        setSlotToDelete(null);
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message: errorData.error || 'Failed to delete availability',
          show: true
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'An error occurred while deleting availability',
        show: true
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleAddAvailability = async (slots: Array<{ day_of_week: number; start_time: string; end_time: string; specific_date: string }>) => {
    try {
      console.log('Adding availability slots:', slots);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        return;
      }

      const response = await fetch('/api/tutor/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(slots)
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        // Show success notification
        setNotification({
          type: 'success',
          message: `Successfully added availability for ${fullDaysOfWeek[slots[0].day_of_week]} from ${slots[0].start_time} to ${slots[0].end_time}`,
          show: true
        });
        
        // Close modal
        setShowAddModal(false);
        
        // Track newly added slots for highlighting
        const newSlotKey = `${slots[0].day_of_week}-${slots[0].start_time}-${slots[0].end_time}`;
        setNewlyAddedSlots(prev => new Set(Array.from(prev).concat(newSlotKey)));
        
        console.log('Refreshing calendar data...');
        // Refresh calendar data
        await fetchCalendarData();
        console.log('Calendar data refreshed');
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
          setNewlyAddedSlots(prev => {
            const newSet = new Set(prev);
            newSet.delete(newSlotKey);
            return newSet;
          });
        }, 5000);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
        setNotification({
          type: 'error',
          message: errorData.error || 'Failed to add availability',
          show: true
        });
        
        // Auto-hide error notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error adding availability:', error);
      setNotification({
        type: 'error',
        message: 'An error occurred while adding availability',
        show: true
      });
      
      // Auto-hide error notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Find slot by dayIndex and timeSlot
  const findSlotByDayAndTime = (dayIndex: number, timeSlot: string) => {
    if (!calendarData) return null;
    const weekStart = getWeekStart(currentWeek);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    return calendarData.availability.find(slot => {
      return (
        slot.specific_date === targetDateStr &&
        timeSlot >= slot.start_time.split(':').slice(0, 2).join(':') &&
        timeSlot < slot.end_time.split(':').slice(0, 2).join(':')
      );
    }) || null;
  };

  // Get the status of a slot (available, booked, or unavailable)
  const getSlotStatus = (dayIndex: number, timeSlot: string) => {
    if (!calendarData) return 'unavailable';
    
    const weekStart = getWeekStart(currentWeek);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    // Check if there's a booked lesson at this time
    const hasBookedLesson = calendarData.booked_lessons.some(lesson => {
      const lessonDate = new Date(lesson.scheduled_start);
      const lessonDateString = lessonDate.toISOString().split('T')[0];
      const lessonStartTime = lessonDate.toTimeString().substring(0, 5);
      const lessonEndTime = new Date(lesson.scheduled_end).toTimeString().substring(0, 5);
      
      // Check if the time slot overlaps with the lesson
      const timeInMinutes = parseInt(timeSlot.split(':')[0]) * 60 + parseInt(timeSlot.split(':')[1]);
      const lessonStartInMinutes = parseInt(lessonStartTime.split(':')[0]) * 60 + parseInt(lessonStartTime.split(':')[1]);
      const lessonEndInMinutes = parseInt(lessonEndTime.split(':')[0]) * 60 + parseInt(lessonEndTime.split(':')[1]);
      
      return lessonDateString === targetDateStr && 
             timeInMinutes >= lessonStartInMinutes && 
             timeInMinutes < lessonEndInMinutes;
    });
    
    if (hasBookedLesson) {
      return 'booked';
    }
    
    // Check if there's an availability slot at this time
    const hasAvailability = calendarData.availability.some(slot => {
      return (
        slot.specific_date === targetDateStr &&
        timeSlot >= slot.start_time.split(':').slice(0, 2).join(':') &&
        timeSlot < slot.end_time.split(':').slice(0, 2).join(':')
      );
    });
    
    if (hasAvailability) {
      return 'available';
    }
    
    return 'unavailable';
  };

  // Get the CSS classes for a slot based on its status
  const getSlotColor = (status: string, dayIndex: number, timeSlot: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      case 'booked':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200';
      case 'unavailable':
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  // Update slot click handler - handle both unavailable and available slots
  const handleSlotClick = (dayIndex: number, timeSlot: string) => {
    console.log('🔍 handleSlotClick called with:', { dayIndex, timeSlot });
    
    const status = getSlotStatus(dayIndex, timeSlot);
    console.log('🔍 Slot status:', status);
    
    // Get the target date for this slot
    const weekStart = getWeekStart(currentWeek);
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    console.log('🔍 Date calculations:', {
      weekStart: weekStart.toISOString(),
      dayIndex,
      targetDate: targetDate.toISOString(),
      targetDateStr
    });
    
    // Convert dayIndex (Mon=0, Sun=6) to day_of_week (Sun=0, Sat=6)
    const dayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1;
    setSelectedDay(dayOfWeek);
    setSelectedTime(timeSlot);
    
    if (status === 'unavailable') {
      // For unavailable slots, compute end time (+1 hour)
      const [hour, min] = timeSlot.split(':').map(Number);
      let endHour = hour + 1;
      let endTime = endHour < 24 ? `${endHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}` : '23:59';
      
      const modalInitialsData = {
        dayOfWeek,
        startTime: timeSlot,
        endTime,
        specificDate: targetDateStr
      };
      
      console.log('🔍 Setting modal initials for unavailable slot:', modalInitialsData);
      
      // Store as state for modal with the actual clicked date
      setModalInitials(modalInitialsData);
      setShowAddModal(true);
    } else if (status === 'available') {
      // For available slots, find the existing slot and use its data
      const existingSlot = findSlotByDayAndTime(dayIndex, timeSlot);
      if (existingSlot) {
        const modalInitialsData = {
          dayOfWeek,
          startTime: existingSlot.start_time.split(':').slice(0, 2).join(':'),
          endTime: existingSlot.end_time.split(':').slice(0, 2).join(':'),
          specificDate: existingSlot.specific_date
        };
        
        console.log('🔍 Setting modal initials for available slot:', modalInitialsData);
        
        // Store as state for modal with existing slot data
        setModalInitials(modalInitialsData);
        setShowAddModal(true);
      }
    }
    // Booked slots don't do anything when clicked
  };

  // Add state for modal initial values
  const [modalInitials, setModalInitials] = useState<{dayOfWeek?: number, startTime?: string, endTime?: string, specificDate?: string | null}>({});

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

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-md transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <Text variant="small" className="font-medium">
                  {notification.type === 'success' ? 'Success' : 'Error'}
                </Text>
                <Text variant="small" className="mt-1">
                  {notification.message}
                </Text>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
                        className={`p-2 h-12 border rounded cursor-pointer transition-colors ${getSlotColor(status, dayIndex, timeSlot)} ${isSelected ? 'ring-2 ring-token-primary bg-token-primary/10' : ''}`}
                        onClick={() => handleSlotClick(dayIndex, timeSlot)}
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
                          'Click to add availability or drag to select multiple time slots'
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
            setModalInitials({});
          }}
          onAdd={handleAddAvailability}
          selectedDay={modalInitials.dayOfWeek}
          selectedTime={modalInitials.startTime}
          initialEndTime={modalInitials.endTime}
          initialSpecificDate={modalInitials.specificDate}
          calendarData={calendarData}
          onDeleteSlot={(slot) => {
            console.log('🔍 onDeleteSlot called with slot:', slot);
            setSlotToDelete(slot);
            setDeleteModalOpen(true);
            setShowAddModal(false);
            console.log('🔍 Set delete modal state:', { slotToDelete: slot, deleteModalOpen: true });
          }}
        />
        


        {/* Delete Slot Modal */}
        <DeleteSlotModal
          open={deleteModalOpen}
          slot={slotToDelete}
          onClose={() => { setDeleteModalOpen(false); setSlotToDelete(null); }}
          onDelete={handleDeleteAvailability}
        />
      </TutorPageLayout>
    </TutorLayout>
  );
} 