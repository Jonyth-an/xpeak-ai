'use client';
import React from 'react';
import { Button, Badge } from '@/app/components/ui';
import TutorCard from './TutorCard';

const filterTabs = [
  'All Coaches',
  'Business English',
  'IELTS Prep',
  'Conversation',
  'Tech English',
  'Medical English',
];

const moreCoaches = [
  {
    avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
    name: 'Jamal',
    flag: '🇺🇸',
    location: 'USA',
    background: 'Tech background meets teaching passion!',
    tags: ['Tech English', 'Supportive'],
    rating: 4.8,
    reviews: 94,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    name: 'Lindiwe',
    flag: '🇿🇦',
    location: 'South Africa',
    background: 'Every mistake is a stepping stone!',
    tags: ['IELTS Prep', 'Encouraging'],
    rating: 4.9,
    reviews: 116,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    name: 'Jack',
    flag: '🇨🇦',
    location: 'Canada',
    background: 'Great stories make great speakers!',
    tags: ['Conversation', 'Storytelling'],
    rating: 4.8,
    reviews: 112,
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    name: 'Sophie',
    flag: '🇦🇺',
    location: 'Australia',
    background: 'Clear communication saves lives!',
    tags: ['Medical English', 'Clear'],
    rating: 4.9,
    reviews: 89,
  },
];

export default function AmazingCoachesShowcase() {
  const coaches = [
    {
      id: 1,
      name: 'Maria Santos',
      flag: '🇪🇸',
      location: 'Madrid, Spain',
      background: 'Certified Spanish Teacher',
      tags: ['Supportive', 'Goal-Oriented', 'Business Expert'],
      rating: 4.9,
      reviews: 127,
      avatar: '/images/tutors/maria.jpg'
    },
    {
      id: 2,
      name: 'Jean-Pierre Dubois',
      flag: '🇫🇷',
      location: 'Paris, France',
      background: 'French Literature Professor',
      tags: ['Patient', 'Cultural Expert', 'Conversation Focused'],
      rating: 4.8,
      reviews: 89,
      avatar: '/images/tutors/jean.jpg'
    },
    {
      id: 3,
      name: 'Yuki Tanaka',
      flag: '🇯🇵',
      location: 'Tokyo, Japan',
      background: 'Japanese Language Specialist',
      tags: ['Structured', 'Grammar Expert', 'Patient'],
      rating: 4.9,
      reviews: 156,
      avatar: '/images/tutors/yuki.jpg'
    },
    {
      id: 4,
      name: 'Alessandro Rossi',
      flag: '🇮🇹',
      location: 'Rome, Italy',
      background: 'Italian Culture Expert',
      tags: ['Enthusiastic', 'Cultural Expert', 'Conversation Focused'],
      rating: 4.7,
      reviews: 94,
      avatar: '/images/tutors/alessandro.jpg'
    },
    {
      id: 5,
      name: 'Hans Mueller',
      flag: '🇩🇪',
      location: 'Berlin, Germany',
      background: 'German Business Language Coach',
      tags: ['Professional', 'Business Expert', 'Structured'],
      rating: 4.8,
      reviews: 112,
      avatar: '/images/tutors/hans.jpg'
    },
    {
      id: 6,
      name: 'Li Wei',
      flag: '🇨🇳',
      location: 'Beijing, China',
      background: 'Mandarin Language Instructor',
      tags: ['Patient', 'Grammar Expert', 'Cultural Expert'],
      rating: 4.9,
      reviews: 203,
      avatar: '/images/tutors/liwei.jpg'
    }
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Amazing Coaches from Around the World
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn from native speakers who are passionate about teaching and helping you achieve your language goals.
          </p>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {coaches.map((coach) => (
            <div key={coach.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{coach.name}</h3>
                    <p className="text-sm text-gray-600">{coach.background}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-yellow-400 text-sm">
                    {'★'.repeat(Math.floor(coach.rating))}
                    <span className="text-gray-600 ml-1">({coach.rating})</span>
                  </div>
                  <p className="text-xs text-gray-500">{coach.reviews} reviews</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {coach.tags.map((tag, i) => (
                  <Badge key={i} variant="accent" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Location */}
              <p className="text-sm text-gray-600 mb-4">
                📍 {coach.location}
              </p>

              {/* CTA */}
              <Button variant="accent" size="sm" className="w-full">
                View Profile
              </Button>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button variant="accent" size="lg">
            Browse All Coaches
          </Button>
        </div>
      </div>
    </section>
  );
} 