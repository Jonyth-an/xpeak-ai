'use client';
import React from 'react';
import { Button, Badge } from '@/app/components/ui';

interface TutorCardProps {
  tutor: {
    id: string;
    name: string;
    avatar: string;
    language: string;
    rating: number;
    students: number;
    price: number;
    tags: string[];
    description: string;
  };
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={tutor.avatar}
            alt={tutor.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{tutor.name}</h3>
            <p className="text-sm text-gray-600">{tutor.language} Tutor</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-yellow-400 text-sm">
            {'★'.repeat(Math.floor(tutor.rating))}
            <span className="text-gray-600 ml-1">({tutor.rating})</span>
          </div>
          <p className="text-xs text-gray-500">{tutor.students} students</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {tutor.tags.slice(0, 3).map((tag, i) => (
          <Badge key={i} variant="accent" size="sm">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {tutor.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-gray-900">
          ${tutor.price}/hr
        </div>
        <Button variant="accent" size="sm">
          Book Session
        </Button>
      </div>
    </div>
  );
} 