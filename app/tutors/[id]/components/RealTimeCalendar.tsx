'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface AvailabilitySlot {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  specific_date?: string;
  timezone: string;
}

interface TimeSlot {
  id: string;
  original_slot_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  available: boolean;
  interval_index: number;
}

interface CalendarData {
  day: number | null;
  available: boolean;
  isToday: boolean;
  isPast: boolean;
  availableSlots: TimeSlot[];
  date?: string;
}

interface RealTimeCalendarProps {
  tutorId: string;
  initialCalendar: CalendarData[];
  initialMonth: number;
  initialYear: number;
}

export default function RealTimeCalendar({ 
  tutorId, 
  initialCalendar, 
  initialMonth, 
  initialYear 
}: RealTimeCalendarProps) {
  const [calendar, setCalendar] = useState<CalendarData[]>(initialCalendar);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState<string | null>(null);

  // Check for URL parameters on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('booking_type');
      if (type) {
        setBookingType(type);
        // Scroll to calendar section if booking type is specified
        setTimeout(() => {
          const calendarElement = document.getElementById('calendar-section');
          if (calendarElement) {
            calendarElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    }
  }, []);

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1];

  // Fetch updated availability data
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      console.log('🔍 fetchAvailability called with month:', month, 'year:', year);
      // Use current month and year state instead of current date
      const timestamp = Date.now(); // Cache buster
      const response = await fetch(`/api/tutors/${tutorId}/availability?month=${month}&year=${year}&t=${timestamp}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 fetchAvailability response data:', data);
        
        if (data.calendar) {
          console.log('🔍 Setting calendar data:', data.calendar.map((d: any) => ({ day: d.day, date: d.date, isToday: d.isToday })));
          setCalendar(data.calendar);
          setMonth(data.month);
          setYear(data.year);
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchAvailability, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [tutorId]);

  // Navigate to previous/next month
  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = month;
    let newYear = year;
    
    if (direction === 'next') {
      if (month === 12) {
        newMonth = 1;
        newYear = year + 1;
      } else {
        newMonth = month + 1;
      }
    } else {
      if (month === 1) {
        newMonth = 12;
        newYear = year - 1;
      } else {
        newMonth = month - 1;
      }
    }

    // Fetch data for the new month
    const fetchMonthData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tutors/${tutorId}/availability?month=${newMonth}&year=${newYear}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.calendar) {
            setCalendar(data.calendar);
            setMonth(newMonth);
            setYear(newYear);
          }
        }
      } catch (error) {
        console.error('Error fetching month data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthData();
  };

  // Handle day click to show time slots
  const handleDayClick = (dayData: CalendarData) => {
    console.log('🔍 handleDayClick called with dayData:', dayData);
    console.log('🔍 Day clicked - day:', dayData.day, 'date:', dayData.date, 'available:', dayData.available);
    if (dayData.available && (dayData.availableSlots?.length || 0) > 0) {
      console.log('🔍 Setting selectedDate to:', dayData.date);
      setSelectedDate(dayData.date || '');
    }
  };

  // Handle time slot selection
  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  // Handle booking
  const handleBooking = async () => {
    if (!selectedSlot || !selectedDate) return;

    try {
      // Get the current session to include Authorization header
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        alert('Please log in to book a lesson.');
        return;
      }

      const response = await fetch('/api/lessons/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tutorId,
          date: selectedDate,
          startTime: selectedSlot.start_time,
          endTime: selectedSlot.end_time,
          lessonType: bookingType === 'trial' ? 'Trial Lesson' : 'Conversation Practice',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Lesson booked successfully!');
        
        // Immediately refresh availability to remove the booked slot
        console.log('🔄 Immediately refreshing availability after booking...');
        await fetchAvailability();
        
        setShowBookingModal(false);
        setSelectedSlot(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to book lesson. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while booking. Please try again.');
    }
  };

  // Debug selected date changes
  useEffect(() => {
    if (selectedDate) {
      console.log('🔍 selectedDate changed to:', selectedDate);
      const matchingDay = calendar.find(day => day.date === selectedDate);
      console.log('🔍 Matching day data:', matchingDay);
      console.log('🔍 All calendar dates:', calendar.map(d => ({ day: d.day, date: d.date, isToday: d.isToday })));
    }
  }, [selectedDate, calendar]);

  // Debug calendar data changes
  useEffect(() => {
    console.log('🔍 Calendar data updated:', calendar?.map(d => ({ day: d.day, date: d.date, isToday: d.isToday, available: d.available })));
  }, [calendar]);

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="w-full">
      <h4 className="font-semibold mb-4 text-lg">Availability Calendar</h4>
      <div className="bg-white border rounded-lg p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-lg font-medium">
            {monthName} {year}
            {loading && <span className="ml-2 text-sm text-gray-500">(Updating...)</span>}
          </h5>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => navigateMonth('prev')}
              disabled={loading}
            >
              ← Previous
            </button>
            <button 
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => navigateMonth('next')}
              disabled={loading}
            >
              Next →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Grid */}
          <div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendar?.map((dayData: CalendarData, index: number) => {
                if (dayData.day === null) {
                  return <div key={index} className="text-center py-2 text-sm"></div>;
                }
                
                return (
                  <div
                    key={index}
                    className={`
                      text-center py-2 text-sm border rounded cursor-pointer transition-colors
                      ${dayData.isToday ? 'bg-blue-100 border-blue-300 font-semibold' : ''}
                      ${dayData.available ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}
                      ${dayData.isPast ? 'text-gray-400 bg-gray-50' : 'hover:bg-gray-50'}
                      ${selectedDate === dayData.date ? 'ring-2 ring-blue-500' : ''}
                    `}
                    onClick={() => {
                      handleDayClick(dayData);
                    }}
                  >
                    {dayData.day}
                    {dayData.available && !dayData.isPast && dayData.availableSlots && dayData.availableSlots.length > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        {dayData.availableSlots.length} slots
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                <span>Unavailable</span>
              </div>
            </div>
          </div>

          {/* Time Slots Panel */}
          <div>
            {selectedDate ? (
              <div>
                <h6 className="font-medium mb-3">
                  Available Times for {(() => {
                    // Parse the date as local time to avoid timezone issues
                    const [year, month, day] = selectedDate.split('-').map(Number);
                    const localDate = new Date(year, month - 1, day);
                    console.log('🔍 Date formatting - selectedDate:', selectedDate, 'localDate:', localDate);
                    return localDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                  })()}
                </h6>
                <div className="text-sm text-gray-600 mb-3">
                  All lessons are 30 minutes. Click any slot to book.
                </div>
                {(() => {
                  console.log('🔍 Rendering time slots panel');
                  console.log('🔍 selectedDate:', selectedDate);
                  const matchingDay = calendar.find(day => day.date === selectedDate);
                  console.log('🔍 Matching day for selectedDate:', matchingDay);
                  console.log('🔍 Available slots count:', matchingDay?.availableSlots?.length || 0);
                  console.log('🔍 Available slots:', matchingDay?.availableSlots);
                  return null;
                })()}
                <div className="space-y-2">
                  {(calendar.find(day => day.date === selectedDate)?.availableSlots || []).length > 0 ? (
                    (calendar.find(day => day.date === selectedDate)?.availableSlots || []).map((slot, index) => (
                      <button
                        key={slot.id}
                        className="w-full p-3 text-left border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                        onClick={() => handleSlotClick(slot)}
                      >
                        <div className="font-medium">
                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                        </div>
                        <div className="text-sm text-gray-600">
                          30-minute lesson • Click to book
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-lg mb-2">No available slots</div>
                      <div className="text-sm">
                        All time slots for this date have either been booked or are in the past.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-lg mb-2">Select a date to see available times</div>
                <div className="text-sm">Click on any green date to view available 30-minute slots</div>
              </div>
            )}
          </div>
        </div>

        {/* Real-time indicator */}
        <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates every 10 seconds</span>
          <button 
            onClick={fetchAvailability}
            disabled={loading}
            className="ml-4 px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Book a {bookingType === 'trial' ? 'Trial Lesson' : 'Lesson'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Date:</p>
              <p className="font-medium">
                {(() => {
                  // Parse the date as local time to avoid timezone issues
                  const [year, month, day] = selectedDate.split('-').map(Number);
                  const localDate = new Date(year, month - 1, day);
                  return localDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                })()}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Time:</p>
              <p className="font-medium">
                {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Duration:</p>
              <p className="font-medium">30 minutes</p>
            </div>
            {bookingType === 'trial' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Trial Lesson:</strong> This is a 30-minute trial session to get to know your tutor and teaching style.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={handleBooking}
              >
                Book {bookingType === 'trial' ? 'Trial' : 'Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 