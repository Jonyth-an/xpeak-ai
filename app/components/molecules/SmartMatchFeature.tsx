import React from 'react';
import FeatureCard from '../ui/FeatureCard';

export interface SmartMatchFeatureItem {
  icon: string;
  title: string;
  text: string;
}

export interface SmartMatchFeatureProps {
  title?: string;
  description?: string;
  features: SmartMatchFeatureItem[];
  footerText?: string;
  className?: string;
  iconAnimation?: 'bounce' | 'pulse' | 'spin' | 'none';
  cardVariant?: 'default' | 'elevated' | 'outlined' | 'filled';
  cardSize?: 'sm' | 'md' | 'lg' | 'xl';
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
}

export default function SmartMatchFeature({
  title = "Let AI Help You Find the Right Coach",
  description = "Finding your ideal tutor shouldn't be a guessing game. With Xpeak's smart matching system, you get recommendations based on what actually matters to you.",
  features,
  footerText = "Switch anytime. Explore freely. Learn your way.",
  className = "",
  iconAnimation = "bounce",
  cardVariant = "elevated",
  cardSize = "lg",
  iconSize = "xl",
  align = "center"
}: SmartMatchFeatureProps) {
  return (
    <section className={`py-20 bg-surface ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-text text-center">
          {title}
        </h2>
        <p className="text-lg text-text-muted mt-4 mb-10 text-center max-w-2xl mx-auto">
          {description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {features.map((feature, idx) => (
            <FeatureCard
              key={idx}
              icon={feature.icon}
              title={feature.title}
              size={cardSize}
              variant={cardVariant}
              iconSize={iconSize}
              iconAnimation={iconAnimation}
              align={align}
            >
              {feature.text}
            </FeatureCard>
          ))}
        </div>
        {footerText && (
          <div className="italic text-center text-text-muted text-lg">
            {footerText}
          </div>
        )}
      </div>
    </section>
  );
} 