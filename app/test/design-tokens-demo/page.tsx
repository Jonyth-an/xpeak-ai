'use client';

import React from 'react';

export default function DesignTokensDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-[var(--space-lg)]">
      <div className="max-w-[var(--container-xl)] mx-auto">
        <h1 className="text-[var(--font-4xl)] font-[var(--font-weight-bold)] text-[var(--color-text)] mb-[var(--space-xl)]">
          Design Token System Demo
        </h1>

        {/* Border Radius Demo */}
        <section className="mb-[var(--space-2xl)]">
          <h2 className="text-[var(--font-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-lg)]">
            Border Radius System
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-md)]">
            {['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].map((radius) => (
              <div
                key={radius}
                className={`bg-[var(--color-surface)] border border-[var(--color-border)] p-[var(--space-md)] text-center`}
                style={{ borderRadius: `var(--radius-${radius})` }}
              >
                <div className="text-[var(--font-sm)] text-[var(--color-text-muted)] mb-[var(--space-xs)]">
                  radius-{radius}
                </div>
                <div className="text-[var(--font-base)] font-[var(--font-weight-medium)] text-[var(--color-text)]">
                  {radius === 'none' ? '0' : radius === 'full' ? '9999px' : radius}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shadow System Demo */}
        <section className="mb-[var(--space-2xl)]">
          <h2 className="text-[var(--font-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-lg)]">
            Shadow System
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-md)]">
            {['none', 'sm', 'md', 'lg', 'xl', '2xl', 'inner', 'glow'].map((shadow) => (
              <div
                key={shadow}
                className={`bg-[var(--color-surface)] border border-[var(--color-border)] p-[var(--space-md)] text-center`}
                style={{ 
                  boxShadow: shadow === 'none' ? 'none' : `var(--shadow-${shadow})`,
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div className="text-[var(--font-sm)] text-[var(--color-text-muted)] mb-[var(--space-xs)]">
                  shadow-{shadow}
                </div>
                <div className="text-[var(--font-base)] font-[var(--font-weight-medium)] text-[var(--color-text)]">
                  {shadow}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Animation Demo */}
        <section className="mb-[var(--space-2xl)]">
          <h2 className="text-[var(--font-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-lg)]">
            Animation System
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--space-md)]">
            {[
              { name: 'transition-fast', duration: '150ms' },
              { name: 'transition-base', duration: '250ms' },
              { name: 'transition-slow', duration: '400ms' }
            ].map((transition) => (
              <div
                key={transition.name}
                className={`bg-[var(--color-primary)] text-[var(--color-text-inverse)] p-[var(--space-md)] text-center cursor-pointer rounded-[var(--radius-md)]`}
                style={{ transition: `var(--${transition.name})` }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div className="text-[var(--font-sm)] mb-[var(--space-xs)]">
                  {transition.name}
                </div>
                <div className="text-[var(--font-base)] font-[var(--font-weight-medium)]">
                  {transition.duration}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Z-Index Demo */}
        <section className="mb-[var(--space-2xl)]">
          <h2 className="text-[var(--font-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-lg)]">
            Z-Index System
          </h2>
          <div className="relative h-[var(--space-32)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-[var(--space-lg)]">
            {[
              { name: 'dropdown', z: 'var(--z-dropdown)', color: 'var(--color-primary)' },
              { name: 'sticky', z: 'var(--z-sticky)', color: 'var(--color-secondary)' },
              { name: 'modal', z: 'var(--z-modal)', color: 'var(--color-accent)' },
              { name: 'toast', z: 'var(--z-toast)', color: 'var(--color-success)' },
              { name: 'tooltip', z: 'var(--z-tooltip)', color: 'var(--color-warning)' }
            ].map((item, index) => (
              <div
                key={item.name}
                className="absolute p-[var(--space-sm)] rounded-[var(--radius-sm)] text-[var(--font-xs)] font-[var(--font-weight-medium)] text-[var(--color-text-inverse)]"
                style={{
                  backgroundColor: item.color,
                  zIndex: item.z,
                  top: `${20 + index * 15}%`,
                  left: `${20 + index * 10}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {item.name}: {item.z}
              </div>
            ))}
          </div>
        </section>

        {/* Container Widths Demo */}
        <section className="mb-[var(--space-2xl)]">
          <h2 className="text-[var(--font-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-lg)]">
            Container Widths
          </h2>
          <div className="space-y-[var(--space-md)]">
            {['sm', 'md', 'lg', 'xl', '2xl'].map((size) => (
              <div
                key={size}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] p-[var(--space-md)] rounded-[var(--radius-md)]"
                style={{ maxWidth: `var(--container-${size})` }}
              >
                <div className="text-[var(--font-sm)] text-[var(--color-text-muted)] mb-[var(--space-xs)]">
                  container-{size}
                </div>
                <div className="text-[var(--font-base)] font-[var(--font-weight-medium)] text-[var(--color-text)]">
                  Max width: {size === 'sm' ? '640px' : size === 'md' ? '768px' : size === 'lg' ? '1024px' : size === 'xl' ? '1280px' : '1536px'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Opacity Demo */}
        <section className="mb-[var(--space-2xl)]">
          <h2 className="text-[var(--font-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-lg)]">
            Opacity Levels
          </h2>
          <div className="grid grid-cols-5 gap-[var(--space-md)]">
            {['0', '25', '50', '75', '100'].map((opacity) => (
              <div
                key={opacity}
                className="bg-[var(--color-primary)] p-[var(--space-md)] text-center rounded-[var(--radius-md)]"
                style={{ opacity: `var(--opacity-${opacity})` }}
              >
                <div className="text-[var(--font-sm)] text-[var(--color-text-inverse)] mb-[var(--space-xs)]">
                  opacity-{opacity}
                </div>
                <div className="text-[var(--font-base)] font-[var(--font-weight-medium)] text-[var(--color-text-inverse)]">
                  {opacity}%
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component Examples */}
        <section className="mb-[var(--space-2xl)]">
          <h2 className="text-[var(--font-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-lg)]">
            Component Examples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-lg)]">
            {/* Card Example */}
            <div className="card p-[var(--space-lg)]">
              <h3 className="text-[var(--font-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-md)]">
                Card Component
              </h3>
              <p className="text-[var(--font-base)] text-[var(--color-text-secondary)] mb-[var(--space-md)]">
                This card uses the semantic card class with design tokens for consistent styling.
              </p>
              <button className="button bg-[var(--color-primary)] text-[var(--color-text-inverse)] px-[var(--space-md)] py-[var(--space-sm)]">
                Action Button
              </button>
            </div>

            {/* Interactive Example */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-[var(--space-lg)] interactive">
              <h3 className="text-[var(--font-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-md)]">
                Interactive Element
              </h3>
              <p className="text-[var(--font-base)] text-[var(--color-text-secondary)]">
                Hover over this element to see the interactive state with design tokens.
              </p>
            </div>
          </div>
        </section>

        {/* Grid System Demo */}
        <section className="mb-[var(--space-2xl)]">
          <h2 className="text-[var(--font-2xl)] font-[var(--font-weight-semibold)] text-[var(--color-text)] mb-[var(--space-lg)]">
            Grid System
          </h2>
          <div className="grid gap-[var(--grid-gap-md)] mb-[var(--space-lg)]">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-[var(--space-md)] rounded-[var(--radius-md)] text-center">
              <div className="text-[var(--font-sm)] text-[var(--color-text-muted)] mb-[var(--space-xs)]">
                Grid Gap: var(--grid-gap-md)
              </div>
              <div className="text-[var(--font-base)] font-[var(--font-weight-medium)] text-[var(--color-text)]">
                1.5rem (24px)
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-[var(--grid-gap-sm)]">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-[var(--color-primary)] text-[var(--color-text-inverse)] p-[var(--space-md)] rounded-[var(--radius-md)] text-center"
              >
                <div className="text-[var(--font-sm)] mb-[var(--space-xs)]">
                  Grid Item {item}
                </div>
                <div className="text-[var(--font-base)] font-[var(--font-weight-medium)]">
                  gap-sm: 0.75rem
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 