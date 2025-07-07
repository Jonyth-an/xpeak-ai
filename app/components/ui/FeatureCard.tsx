import React from 'react'

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  iconAnimation?: 'none' | 'bounce' | 'pulse' | 'spin';
  align?: 'left' | 'center' | 'right'
}

export default function FeatureCard({
  icon,
  title,
  children,
  size = 'md',
  variant = 'default',
  iconSize = 'lg',
  iconAnimation = 'none',
  align = 'center',
  className = '',
  ...props
}: FeatureCardProps) {
  // Size classes
  const sizeClasses = {
    sm: 'p-token-4 gap-token-2',
    md: 'p-token-6 gap-token-4',
    lg: 'p-token-8 gap-token-6',
    xl: 'p-token-10 gap-token-8'
  }

  // Variant classes
  const variantClasses = {
    default: 'bg-surface shadow-token-base',
    elevated: 'bg-surface shadow-token-lg hover:shadow-token-xl transition-shadow duration-token-base',
    outlined: 'bg-transparent border-2 border-border shadow-none',
    filled: 'bg-primary/5 shadow-token-base'
  }

  // Icon size classes
  const iconSizeClasses = {
    sm: 'text-token-2xl',
    md: 'text-token-3xl',
    lg: 'text-token-4xl',
    xl: 'text-token-5xl'
  }

  // Title size classes
  const titleSizeClasses = {
    sm: 'text-token-lg',
    md: 'text-token-xl',
    lg: 'text-token-2xl',
    xl: 'text-token-3xl'
  }

  // Text size classes
  const textSizeClasses = {
    sm: 'text-token-sm',
    md: 'text-token-base',
    lg: 'text-token-lg',
    xl: 'text-token-xl'
  }

  // Alignment classes
  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }

  // Icon animation classes
  const iconAnimationClasses = {
    none: '',
    bounce: 'group-hover:animate-bounce',
    pulse: 'group-hover:animate-pulse',
    spin: 'group-hover:animate-spin'
  }

  return (
    <div
      className={`
        rounded-token-lg flex flex-col transition-all duration-token-base group
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${alignClasses[align]}
        ${className}
      `}
      {...props}
    >
      {icon && (
        <div className={`${iconSizeClasses[iconSize]} ${iconAnimationClasses[iconAnimation]} mb-token-2`}>
          {icon}
        </div>
      )}
      <h3 className={`font-semibold mb-token-2 ${titleSizeClasses[size]}`}>
        {title}
      </h3>
      <div className={`text-text-secondary ${textSizeClasses[size]}`}>
        {children}
      </div>
    </div>
  )
} 