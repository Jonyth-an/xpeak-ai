import React from 'react';
import { Card, Button } from '../ui';

export interface TutorCardProps {
  avatar?: string;
  name: string;
  flag?: string;
  location?: string;
  background?: string;
  tags?: string[];
  rating?: number;
  reviews?: number;
  quote?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  hideButton?: boolean;
  className?: string;
  children?: React.ReactNode;
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
  quote,
  buttonText = 'View Profile',
  buttonHref,
  onButtonClick,
  hideButton = false,
  className = '',
  children,
}: TutorCardProps) {
  return (
    <Card className={`flex flex-col items-center text-center p-token-6 rounded-token-lg ${className}`}>
      {avatar && (
        <img src={avatar} alt={name + ' avatar'} className="w-20 h-20 rounded-full border-2 border-surface-muted shadow-sm mb-token-4" />
      )}
      <div className="flex items-center gap-1 mb-token-1">
        {flag && <span className="text-lg">{flag}</span>}
        <span className="font-semibold text-text-primary">{name}</span>
      </div>
      {location && <div className="text-sm text-text-secondary mb-token-2">{location}</div>}
      {background && <div className="text-xs text-text-muted mb-token-2">{background}</div>}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-token-2 mb-token-2">
          {tags.map((tag, i) => (
            <span key={i} className="bg-surface-muted text-text-secondary px-token-3 py-token-1 rounded-token text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
      {typeof rating === 'number' && (
        <div className="flex items-center gap-1 text-accent mb-token-4">
          <span aria-label="star" role="img">★</span>
          <span>{rating.toFixed(1)}</span>
          {typeof reviews === 'number' && <span className="text-text-muted text-xs">({reviews})</span>}
        </div>
      )}
      {quote && (
        <blockquote className="italic text-primary mb-token-4">“{quote}”</blockquote>
      )}
      {children}
      {!hideButton && (
        buttonHref ? (
          <a href={buttonHref} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="primary" className="w-full" aria-label={buttonText}>
              {buttonText}
            </Button>
          </a>
        ) : (
          <Button variant="primary" className="w-full" onClick={onButtonClick} aria-label={buttonText}>
            {buttonText}
          </Button>
        )
      )}
    </Card>
  );
} 