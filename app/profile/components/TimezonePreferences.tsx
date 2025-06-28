'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { Card, Text, Button } from '@/app/components/ui';

// Simple pencil SVG icon
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle">
    <path d="M14.7 2.29a1 1 0 0 1 1.42 0l1.59 1.59a1 1 0 0 1 0 1.42l-9.3 9.3-2.83.71.71-2.83 9.3-9.3zM3 17h14a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2z" fill="#2563eb"/>
  </svg>
);

interface Timezone {
  value: string;
  label: string;
  offset: string;
  region: string;
  city: string;
}

// Curated list of most common cities by region
const timezones: Timezone[] = [
  // America
  { value: 'America/New_York', label: 'Eastern Time', offset: 'UTC-5', region: 'America', city: 'New York' },
  { value: 'America/Chicago', label: 'Central Time', offset: 'UTC-6', region: 'America', city: 'Chicago' },
  { value: 'America/Denver', label: 'Mountain Time', offset: 'UTC-7', region: 'America', city: 'Denver' },
  { value: 'America/Los_Angeles', label: 'Pacific Time', offset: 'UTC-8', region: 'America', city: 'Los Angeles' },
  { value: 'America/Mexico_City', label: 'Mexico City', offset: 'UTC-6', region: 'America', city: 'Mexico City' },
  { value: 'America/Toronto', label: 'Toronto', offset: 'UTC-5', region: 'America', city: 'Toronto' },
  { value: 'America/Sao_Paulo', label: 'São Paulo', offset: 'UTC-3', region: 'America', city: 'São Paulo' },
  // Europe
  { value: 'Europe/London', label: 'London', offset: 'UTC+0', region: 'Europe', city: 'London' },
  { value: 'Europe/Paris', label: 'Paris', offset: 'UTC+1', region: 'Europe', city: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin', offset: 'UTC+1', region: 'Europe', city: 'Berlin' },
  { value: 'Europe/Madrid', label: 'Madrid', offset: 'UTC+1', region: 'Europe', city: 'Madrid' },
  { value: 'Europe/Rome', label: 'Rome', offset: 'UTC+1', region: 'Europe', city: 'Rome' },
  { value: 'Europe/Moscow', label: 'Moscow', offset: 'UTC+3', region: 'Europe', city: 'Moscow' },
  { value: 'Europe/Istanbul', label: 'Istanbul', offset: 'UTC+3', region: 'Europe', city: 'Istanbul' },
  // Asia
  { value: 'Asia/Shanghai', label: 'Shanghai', offset: 'UTC+8', region: 'Asia', city: 'Shanghai' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9', region: 'Asia', city: 'Tokyo' },
  { value: 'Asia/Seoul', label: 'Seoul', offset: 'UTC+9', region: 'Asia', city: 'Seoul' },
  { value: 'Asia/Singapore', label: 'Singapore', offset: 'UTC+8', region: 'Asia', city: 'Singapore' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong', offset: 'UTC+8', region: 'Asia', city: 'Hong Kong' },
  { value: 'Asia/Bangkok', label: 'Bangkok', offset: 'UTC+7', region: 'Asia', city: 'Bangkok' },
  { value: 'Asia/Kolkata', label: 'Mumbai', offset: 'UTC+5:30', region: 'Asia', city: 'Mumbai' },
  // Oceania
  { value: 'Australia/Sydney', label: 'Sydney', offset: 'UTC+10', region: 'Oceania', city: 'Sydney' },
  { value: 'Australia/Melbourne', label: 'Melbourne', offset: 'UTC+10', region: 'Oceania', city: 'Melbourne' },
  { value: 'Pacific/Auckland', label: 'Auckland', offset: 'UTC+12', region: 'Oceania', city: 'Auckland' },
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo', offset: 'UTC+2', region: 'Africa', city: 'Cairo' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg', offset: 'UTC+2', region: 'Africa', city: 'Johannesburg' },
  { value: 'Africa/Nairobi', label: 'Nairobi', offset: 'UTC+3', region: 'Africa', city: 'Nairobi' },
];

// Group by region
const regions = Array.from(new Set(timezones.map(tz => tz.region)));

function getCurrentTime(tz: string) {
  try {
    return new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function TimezonePreferences() {
  const { user } = useAuth();
  const [currentTimezone, setCurrentTimezone] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // Fetch user's timezone from Supabase
    const fetchTimezone = async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('timezone')
        .eq('user_id', user.id)
        .single();
      if (data && data.timezone) {
        setCurrentTimezone(data.timezone);
        setSelectedTimezone(data.timezone);
      } else {
        // Auto-detect timezone if not set
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setCurrentTimezone(detected);
        setSelectedTimezone(detected);
      }
    };
    fetchTimezone();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, timezone: selectedTimezone, updated_at: new Date().toISOString() });
    setLoading(false);
    if (error) {
      setError('Failed to save timezone.');
    } else {
      setCurrentTimezone(selectedTimezone);
      setEditMode(false);
    }
  };

  const currentTzObj = timezones.find(tz => tz.value === currentTimezone) || null;

  return (
    <Card className="mb-6">
      <Text as="h3" className="font-semibold mb-2">Current Region & Time</Text>
      {!editMode ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Region: <span className="font-medium">{currentTzObj ? currentTzObj.region : '—'}</span></div>
            <div className="text-sm text-gray-600">City: <span className="font-medium">{currentTzObj ? currentTzObj.city : currentTimezone}</span></div>
            <div className="text-sm text-gray-600">Timezone: <span className="font-medium">{currentTzObj ? `${currentTzObj.label} (${currentTzObj.offset})` : currentTimezone}</span></div>
            <div className="text-xs text-gray-400">Current time: {getCurrentTime(currentTimezone)}</div>
          </div>
          <button
            className="ml-4 p-2 rounded hover:bg-blue-50 transition"
            aria-label="Edit timezone"
            onClick={() => setEditMode(true)}
          >
            <EditIcon />
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-2 text-sm text-gray-600">Select your timezone (by city):</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions.map(region => (
              <div key={region}>
                <div className="font-semibold text-blue-700 mb-1">{region}</div>
                <div className="space-y-1">
                  {timezones.filter(tz => tz.region === region).map(tz => (
                    <label key={tz.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="timezone"
                        value={tz.value}
                        checked={selectedTimezone === tz.value}
                        onChange={() => setSelectedTimezone(tz.value)}
                        className="mr-2 accent-blue-600"
                      />
                      <span className="text-sm">{tz.city} <span className="text-gray-400">({tz.label}, {tz.offset})</span> <span className="text-gray-300 ml-1">{getCurrentTime(tz.value)}</span></span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSave} disabled={loading} variant="primary">{loading ? 'Saving...' : 'Save'}</Button>
            <Button onClick={() => { setEditMode(false); setSelectedTimezone(currentTimezone); }} variant="secondary">Cancel</Button>
            {error && <span className="text-red-500 ml-2 text-sm">{error}</span>}
          </div>
        </div>
      )}
    </Card>
  );
} 