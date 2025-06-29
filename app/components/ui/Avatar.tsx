import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};

export default function Avatar({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  className = '' 
}: AvatarProps) {
  const avatarSrc = src || '/images/default-avatar.svg';
  
  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <Image
        src={avatarSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${sizeClasses[size]}`}
      />
    </div>
  );
} 