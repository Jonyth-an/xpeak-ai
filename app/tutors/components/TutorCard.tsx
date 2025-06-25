import React from 'react';

interface TutorCardProps {
  avatar: string;
  name: string;
  flag: string;
  location: string;
  background: string;
  tags: string[];
  rating: number;
  reviews: number;
}

export default function TutorCard({
  avatar,
  name,
  flag,
  location,
  background,
  tags,
  rating,
  reviews,
}: TutorCardProps) {
  return (
    <div className="bg-token-surface rounded-token shadow-token-md p-6 flex flex-col items-center text-center hover:shadow-token-lg transition-shadow duration-200">
      <img src={avatar} alt={name} className="w-20 h-20 rounded-full border-2 border-indigo-100 shadow mb-3" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{flag}</span>
        <span className="font-bold text-token-text">{name}</span>
        <span className="text-sm text-token-text-secondary">{location}</span>
      </div>
      <div className="text-xs mb-2 text-token-text-secondary">{background}</div>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="bg-token-accent-soft text-token-text-accent px-2 py-0.5 rounded-full text-xs font-medium">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-yellow-500 text-base mb-2">
        <span>★</span>
        <span>{rating}</span>
        <span className="text-xs text-token-text-secondary">({reviews})</span>
      </div>
      <button className="mt-auto px-5 py-2 font-semibold rounded-lg shadow transition bg-token-accent text-token-text-on-accent hover:bg-token-accent-dark">
        View Profile
      </button>
    </div>
  );
} 