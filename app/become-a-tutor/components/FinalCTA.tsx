import React from 'react';
import { Card, Text, Button, Badge } from '@/app/components/ui';
import { Star, TrendingUp, Award, Target, BarChart3, Users, Clock, Calendar, Globe, MapPin, GraduationCap, BookOpen, MessageSquare, Video, Camera, Mic, Shield, Heart, Scale, Clock as ClockIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const avatars = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
];

export default function FinalCTA() {
  return (
    <section className="py-token-20 px-token-4 sm:px-token-6 lg:px-token-8 bg-gradient-to-r from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark/60 text-center">
      <h2 className="text-token-3xl md:text-token-4xl font-extrabold token-text-primary mb-token-4">
        Join a Global Community of Coaches
      </h2>
      <p className="text-token-lg token-text-secondary mb-token-10">
        Meet fellow language lovers. Share knowledge. Grow together.
      </p>
      <div className="flex justify-center gap-token-8 mb-token-10">
        {avatars.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt="Coach avatar"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full border-4 border-token-surface shadow-md object-cover"
          />
        ))}
      </div>
      <Link href="/become-a-tutor">
        <Button variant="primary" size="lg">
          Become a Tutor
        </Button>
      </Link>
    </section>
  );
} 