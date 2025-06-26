import React from 'react';

export interface ToggleGroupOption {
  label: React.ReactNode;
  value: string;
}

export interface ToggleGroupProps {
  options: ToggleGroupOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ToggleGroup({ options, value, onChange, className = '' }: ToggleGroupProps) {
  return (
    <div className={`inline-flex items-center bg-gray-100 rounded-full p-1 ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`px-5 py-2 rounded-full font-semibold focus:outline-none transition-colors
            ${value === opt.value
              ? 'bg-yellow-400 text-gray-900 shadow'
              : 'bg-transparent text-gray-900 hover:bg-gray-200'}
          `}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
} 